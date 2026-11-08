"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, MessageCircle, Send, X } from "lucide-react";
import { type Lang } from "@/data/products";
import { useStore } from "@/store/useStore";
import { cn } from "@/lib/utils";
import {
  builtinReply,
  containsBanned,
  fallbackReply,
  type EngineMessage,
} from "@/lib/gearbot-engine";

const API_BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

interface ChatMessage {
  id: string;
  role: "user" | "bot";
  content: string;
}

const QUICK_CHIPS: { ar: string; en: string }[] = [
  { ar: "وش تنصح لسيارتي؟", en: "What do you recommend for my car?" },
  { ar: "طريقة الدفع", en: "Payment methods" },
  { ar: "أفضل باقة", en: "Best bundle" },
];

const introFor = (lang: Lang): string =>
  lang === "ar"
    ? "أهلاً في GearTech! أنا مساعدك الذكي. اسألني عن المنتجات، الأسعار، التوصيل، أو وش أنصح لسيارتك."
    : "Welcome to GearTech! I'm your smart sales assistant. Ask me about products, prices, delivery, or what I'd recommend for your car.";

const makeId = (): string =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `msg_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

export default function GearBotAI() {
  const lang = useStore((s) => s.lang);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);

  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMessages((prev) =>
      prev.some((m) => m.role === "user")
        ? prev
        : [{ id: "intro", role: "bot", content: introFor(lang) }]
    );
  }, [lang]);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, typing]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || typing) return;

    const userMessage: ChatMessage = {
      id: makeId(),
      role: "user",
      content: trimmed,
    };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setTyping(true);

    try {
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.map((m) => ({
            role: m.role === "bot" ? "assistant" : "user",
            content: m.content,
          })),
          lang,
        }),
      });
      if (!res.ok) throw new Error(`chat request failed: ${res.status}`);
      const data: unknown = await res.json();
      const reply =
        typeof data === "string"
          ? data
          : ((data as { reply?: string; message?: string; content?: string })
              .reply ??
            (data as { message?: string; content?: string }).message ??
            (data as { content?: string }).content ??
            "");
      if (!reply) throw new Error("empty reply");
      setMessages((prev) => [
        ...prev,
        { id: makeId(), role: "bot", content: reply },
      ]);
    } catch {
      // Static hosts have no API route — run the same deterministic engine client-side.
      const engineMessages: EngineMessage[] = nextMessages.map((m) => ({
        role: m.role === "bot" ? "assistant" : "user",
        content: m.content,
      }));
      const userText = engineMessages
        .filter((m) => m.role === "user")
        .map((m) => m.content)
        .join("\n");
      const localReply = containsBanned(userText)
        ? fallbackReply(lang)
        : builtinReply(engineMessages, lang);
      setMessages((prev) => [
        ...prev,
        { id: makeId(), role: "bot", content: localReply },
      ]);
    } finally {
      setTyping(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={
          open
            ? lang === "ar"
              ? "إغلاق المساعد"
              : "Close assistant"
            : lang === "ar"
              ? "فتح المساعد الذكي"
              : "Open AI assistant"
        }
        className="fixed bottom-5 end-5 z-50 grid h-14 w-14 place-items-center rounded-full bg-volt text-obsidian transition hover:brightness-110 glow-volt"
      >
        {open ? (
          <X className="h-6 w-6" strokeWidth={2.5} />
        ) : (
          <MessageCircle className="h-6 w-6" strokeWidth={2.5} />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            key="gearbot-panel"
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="fixed bottom-24 end-4 z-50 flex max-h-[70vh] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-2xl glass-strong sm:end-5"
            role="dialog"
            aria-label={lang === "ar" ? "مساعد GearTech" : "GearTech assistant"}
          >
            <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-volt/15 text-volt">
                <Bot className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-extrabold text-white">
                  {lang === "ar" ? "مساعد GearTech" : "GearTech Assistant"}
                </p>
                <p className="flex items-center gap-1.5 text-[11px] font-semibold text-white/55">
                  <span className="h-1.5 w-1.5 rounded-full bg-volt" />
                  {lang === "ar" ? "متصل الآن" : "Online now"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={lang === "ar" ? "إغلاق" : "Close"}
                className="grid h-8 w-8 place-items-center rounded-full text-white/50 transition hover:text-volt"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div
              ref={listRef}
              className="flex-1 space-y-3 overflow-y-auto px-3.5 py-4"
            >
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex w-full",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {message.role === "bot" && (
                    <span className="me-2 mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-volt/15 text-volt">
                      <Bot className="h-4 w-4" />
                    </span>
                  )}
                  <div
                    className={cn(
                      "max-w-[80%] whitespace-pre-wrap px-3.5 py-2.5 text-sm leading-relaxed",
                      message.role === "user"
                        ? "rounded-2xl rounded-br-sm bg-volt font-semibold text-obsidian"
                        : "rounded-2xl rounded-bl-sm border border-white/10 bg-white/10 text-white/90"
                    )}
                  >
                    {message.content}
                  </div>
                </motion.div>
              ))}

              {typing && (
                <div className="flex justify-start">
                  <span className="me-2 mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-volt/15 text-volt">
                    <Bot className="h-4 w-4" />
                  </span>
                  <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm border border-white/10 bg-white/10 px-4 py-3.5">
                    {[0, 1, 2].map((dot) => (
                      <motion.span
                        key={dot}
                        className="h-1.5 w-1.5 rounded-full bg-white/70"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          delay: dot * 0.2,
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="no-scrollbar flex gap-2 overflow-x-auto border-t border-white/10 px-3.5 pt-3">
              {QUICK_CHIPS.map((chip) => (
                <button
                  key={chip.en}
                  type="button"
                  onClick={() => void send(lang === "ar" ? chip.ar : chip.en)}
                  disabled={typing}
                  className="shrink-0 rounded-full border border-volt/40 bg-volt/10 px-3 py-1.5 text-[11px] font-bold text-volt transition hover:bg-volt/20 disabled:opacity-40"
                >
                  {lang === "ar" ? chip.ar : chip.en}
                </button>
              ))}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                void send(input);
              }}
              className="flex items-center gap-2 px-3.5 py-3"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  lang === "ar" ? "اكتب سؤالك…" : "Type your question…"
                }
                aria-label={lang === "ar" ? "رسالتك" : "Your message"}
                className="min-w-0 flex-1 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none transition placeholder:text-white/40 focus:border-volt/60"
              />
              <button
                type="submit"
                disabled={!input.trim() || typing}
                aria-label={lang === "ar" ? "إرسال" : "Send"}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-volt text-obsidian transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Send className="h-4 w-4 rtl:-scale-x-100" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
