import { type Lang } from "@/data/products";
import {
  builtinReply,
  buildSystemPrompt,
  containsBanned,
  fallbackReply,
  type EngineMessage,
} from "@/lib/gearbot-engine";

export const dynamic = "force-dynamic";

type Engine = "openai" | "anthropic" | "builtin";

const json = (payload: unknown): Response =>
  Response.json(payload, {
    headers: { "Cache-Control": "no-store" },
  });

const callOpenAI = async (
  sys: string,
  messages: EngineMessage[]
): Promise<string> => {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: sys }, ...messages],
      temperature: 0.7,
      max_tokens: 700,
    }),
  });
  if (!res.ok) throw new Error(`openai_${res.status}`);
  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const text = data.choices?.[0]?.message?.content;
  if (typeof text !== "string" || !text.trim()) throw new Error("openai_empty");
  return text.trim();
};

const callAnthropic = async (
  sys: string,
  messages: EngineMessage[]
): Promise<string> => {
  const normalized =
    messages.length > 0 && messages[0].role === "user"
      ? messages
      : [{ role: "user" as const, content: "Hello" }, ...messages];
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY as string,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-3-5-haiku-latest",
      max_tokens: 700,
      system: sys,
      messages: normalized.map((m) => ({ role: m.role, content: m.content })),
    }),
  });
  if (!res.ok) throw new Error(`anthropic_${res.status}`);
  const data = (await res.json()) as {
    content?: { type: string; text?: string }[];
  };
  const text = data.content?.find((b) => b.type === "text")?.text;
  if (typeof text !== "string" || !text.trim())
    throw new Error("anthropic_empty");
  return text.trim();
};

export async function POST(req: Request): Promise<Response> {
  let body: {
    messages?: unknown;
    lang?: unknown;
  };
  try {
    body = await req.json();
  } catch {
    return json({ reply: fallbackReply("ar"), source: "builtin" satisfies Engine });
  }

  const lang: Lang = body.lang === "en" ? "en" : "ar";

  const messages: EngineMessage[] = (Array.isArray(body.messages) ? body.messages : [])
    .map((m: { role?: unknown; content?: unknown }) => ({
      role: m.role === "assistant" ? ("assistant" as const) : ("user" as const),
      content:
        typeof m.content === "string" ? m.content.slice(0, 4000) : "",
    }))
    .filter((m) => m.content.trim().length > 0)
    .slice(-20);

  const userText = messages
    .filter((m) => m.role === "user")
    .map((m) => m.content)
    .join("\n");

  // Deterministic injection short-circuit — never reaches an upstream model.
  if (containsBanned(userText)) {
    return json({ reply: fallbackReply(lang), source: "builtin" });
  }

  const sys = buildSystemPrompt(lang);

  let reply: string | null = null;
  let source: Engine | null = null;

  if (process.env.OPENAI_API_KEY) {
    try {
      reply = await callOpenAI(sys, messages);
      source = "openai";
    } catch {
      reply = null;
    }
  }

  if (reply === null && process.env.ANTHROPIC_API_KEY) {
    try {
      reply = await callAnthropic(sys, messages);
      source = "anthropic";
    } catch {
      reply = null;
    }
  }

  if (reply !== null && source !== null) {
    // Deterministic post-filter on the model output.
    if (containsBanned(reply)) {
      return json({ reply: fallbackReply(lang), source });
    }
    return json({ reply, source });
  }

  return json({ reply: builtinReply(messages, lang), source: "builtin" });
}
