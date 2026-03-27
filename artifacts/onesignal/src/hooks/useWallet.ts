import { useState, useEffect, useCallback, useRef } from "react";

export type WalletError =
  | "NO_WALLET"
  | "REJECTED"
  | "TIMEOUT"
  | "LOCKED"
  | "PENDING"
  | "FAILED";

export type WalletState = {
  address: string | null;
  isConnecting: boolean;
  isConnected: boolean;
  error: WalletError | null;
  errorMessage: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
};

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on: (event: string, handler: (...args: unknown[]) => void) => void;
      removeListener: (event: string, handler: (...args: unknown[]) => void) => void;
      isMetaMask?: boolean;
    };
  }
}

const ERROR_MESSAGES: Record<WalletError, string> = {
  NO_WALLET:  "No wallet detected — install OneWallet or MetaMask",
  REJECTED:   "Connection rejected — please approve the request in your wallet",
  TIMEOUT:    "Connection timed out — please unlock your wallet and try again",
  LOCKED:     "Connection failed — please unlock your wallet and try again",
  PENDING:    "A connection request is already pending — check your wallet",
  FAILED:     "Connection failed — please unlock your wallet and try again",
};

const CONNECTION_TIMEOUT_MS = 10_000;

function getProvider() {
  try {
    return window.ethereum ?? null;
  } catch {
    return null;
  }
}

export function useWallet(): WalletState {
  const [address, setAddress]       = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError]           = useState<WalletError | null>(null);
  const timeoutRef                  = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetConnecting = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsConnecting(false);
  }, []);

  const handleAccountsChanged = useCallback((accounts: unknown) => {
    const list = accounts as string[];
    setAddress(list.length > 0 ? list[0] : null);
  }, []);

  useEffect(() => {
    const provider = getProvider();
    if (!provider) return;

    try {
      provider
        .request({ method: "eth_accounts" })
        .then((accounts) => {
          const list = accounts as string[];
          if (list.length > 0) setAddress(list[0]);
        })
        .catch(() => {});

      provider.on("accountsChanged", handleAccountsChanged);
      return () => {
        try { provider.removeListener("accountsChanged", handleAccountsChanged); } catch { /* gone */ }
      };
    } catch { /* extension conflict */ }
  }, [handleAccountsChanged]);

  const connect = useCallback(async () => {
    setError(null);

    const provider = getProvider();
    if (!provider) {
      setError("NO_WALLET");
      return;
    }

    setIsConnecting(true);

    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutRef.current = setTimeout(() => {
        reject({ __walletTimeout: true });
      }, CONNECTION_TIMEOUT_MS);
    });

    try {
      const accounts = await Promise.race([
        provider.request({ method: "eth_requestAccounts" }),
        timeoutPromise,
      ]);

      const list = accounts as string[];
      if (list.length > 0) {
        setAddress(list[0]);
        setError(null);
      }
    } catch (err: unknown) {
      const e = err as { __walletTimeout?: boolean; code?: number; message?: string };

      if (e?.__walletTimeout) {
        setError("TIMEOUT");
      } else if (e?.code === 4001) {
        setError("REJECTED");
      } else if (e?.code === -32002) {
        // Request already pending (wallet is open but user hasn't responded)
        setError("PENDING");
      } else if (
        typeof e?.message === "string" &&
        (e.message.toLowerCase().includes("unlock") ||
          e.message.toLowerCase().includes("locked"))
      ) {
        setError("LOCKED");
      } else {
        setError("FAILED");
      }
    } finally {
      resetConnecting();
    }
  }, [resetConnecting]);

  const disconnect = useCallback(() => {
    resetConnecting();
    setAddress(null);
    setError(null);
  }, [resetConnecting]);

  return {
    address,
    isConnecting,
    isConnected: !!address,
    error,
    errorMessage: error ? ERROR_MESSAGES[error] : null,
    connect,
    disconnect,
  };
}

export function abbreviateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
