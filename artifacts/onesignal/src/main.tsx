import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

const EXTENSION_ERROR_PATTERNS = [
  "Cannot redefine property: ethereum",
  "Cannot redefine property: isZerion",
  "Cannot redefine property: isMetaMask",
  "Failed to connect to MetaMask",
  "MetaMask: Disconnected from chain",
  "chrome-extension://",
];

function isExtensionConflict(message: string): boolean {
  return EXTENSION_ERROR_PATTERNS.some((p) => message.includes(p));
}

window.addEventListener("error", (event) => {
  if (event.message && isExtensionConflict(event.message)) {
    event.preventDefault();
    event.stopImmediatePropagation();
  }
}, true);

window.addEventListener("unhandledrejection", (event) => {
  const msg = event.reason?.message ?? String(event.reason ?? "");
  if (isExtensionConflict(msg)) {
    event.preventDefault();
    event.stopImmediatePropagation();
  }
}, true);

createRoot(document.getElementById("root")!).render(<App />);
