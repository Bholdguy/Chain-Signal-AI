import { Router, type IRouter } from "express";
import { AnalyzeTokenBody, AnalyzeTokenResponse } from "@workspace/api-zod";
import { z } from "zod";

const router: IRouter = Router();

const ONECHAIN_RPC = "https://rpc-mainnet.onelabs.cc:443";

async function fetchOnechainData(query: string): Promise<object> {
  try {
    const blockResponse = await fetch(ONECHAIN_RPC, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "eth_getBlockByNumber",
        params: ["latest", true],
        id: 1,
      }),
      signal: AbortSignal.timeout(10000),
    });
    const blockData = blockResponse.ok ? await blockResponse.json() : null;

    const gasResponse = await fetch(ONECHAIN_RPC, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "eth_gasPrice",
        params: [],
        id: 2,
      }),
      signal: AbortSignal.timeout(10000),
    });
    const gasData = gasResponse.ok ? await gasResponse.json() : null;

    const chainIdResponse = await fetch(ONECHAIN_RPC, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "eth_chainId",
        params: [],
        id: 3,
      }),
      signal: AbortSignal.timeout(10000),
    });
    const chainIdData = chainIdResponse.ok ? await chainIdResponse.json() : null;

    const block = blockData?.result;
    const txCount = block?.transactions?.length ?? 0;
    const gasPrice = gasData?.result ?? "0x0";
    const chainId = chainIdData?.result ?? "unknown";

    const gasPriceGwei = gasPrice
      ? (parseInt(gasPrice, 16) / 1e9).toFixed(4)
      : "unknown";

    const bigTxs = Array.isArray(block?.transactions)
      ? block.transactions.filter((tx: { value?: string }) => {
          if (!tx.value) return false;
          const val = BigInt(tx.value);
          return val > BigInt("1000000000000000000");
        }).length
      : 0;

    return {
      tokenQuery: query,
      chainId,
      blockNumber: block?.number ? parseInt(block.number, 16) : null,
      blockTimestamp: block?.timestamp ? parseInt(block.timestamp, 16) : null,
      transactionCount: txCount,
      gasPriceGwei,
      bigTransactions: bigTxs,
      blockHash: block?.hash ?? null,
      parentHash: block?.parentHash ?? null,
    };
  } catch (err) {
    return {
      tokenQuery: query,
      error: "Could not fetch full chain data",
      partialData: true,
    };
  }
}

async function callGroq(chainData: object, query: string): Promise<{
  momentum: "Bullish" | "Neutral" | "Bearish";
  whaleActivity: "High" | "Medium" | "Low";
  riskLevel: "High" | "Medium" | "Low";
  narrative: string;
}> {
  const apiKey = process.env["GROQ_API_KEY"];
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not set");
  }

  const prompt = `You are an expert blockchain trading analyst specializing in the OneChain blockchain. 
Analyze the following on-chain data for the token/address: "${query}"

On-chain data from OneChain mainnet:
${JSON.stringify(chainData, null, 2)}

Based on this data, provide a trading signal analysis. Consider:
- Transaction volume and count as indicators of network activity/momentum
- Large transactions (>1 ETH equivalent) as whale activity signals
- Gas price levels as a proxy for network demand
- Block data freshness and activity levels

Respond ONLY with a valid JSON object (no markdown, no explanation) in this exact format:
{
  "momentum": "Bullish" | "Neutral" | "Bearish",
  "whaleActivity": "High" | "Medium" | "Low",
  "riskLevel": "High" | "Medium" | "Low",
  "narrative": "Three sentences of plain-English market analysis. Sentence two continues the analysis. Sentence three gives a trading outlook."
}`;

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.4,
      max_tokens: 512,
    }),
    signal: AbortSignal.timeout(30000),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Groq API error ${response.status}: ${errText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content ?? "";

  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Could not parse JSON from Groq response");
  }

  const parsed = JSON.parse(jsonMatch[0]);

  const SignalSchema = z.object({
    momentum: z.enum(["Bullish", "Neutral", "Bearish"]),
    whaleActivity: z.enum(["High", "Medium", "Low"]),
    riskLevel: z.enum(["High", "Medium", "Low"]),
    narrative: z.string(),
  });

  return SignalSchema.parse(parsed);
}

router.post("/analyze", async (req, res) => {
  const bodyParse = AnalyzeTokenBody.safeParse(req.body);
  if (!bodyParse.success) {
    res.status(400).json({ error: "Invalid request body: 'query' field is required" });
    return;
  }

  const { query } = bodyParse.data;

  try {
    const chainData = await fetchOnechainData(query);
    const signal = await callGroq(chainData, query);

    const result = AnalyzeTokenResponse.parse({
      ...signal,
      tokenQuery: query,
      analyzedAt: new Date(),
    });

    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Failed to analyze token");
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: `Analysis failed: ${message}` });
  }
});

export default router;
