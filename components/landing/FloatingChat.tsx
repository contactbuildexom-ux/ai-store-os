"use client";

import { useEffect, useRef, useState } from "react";

type Msg = { from: "bot" | "user"; text: string };

const quickQuestions = [
  "Is the free plan really free?",
  "How do customers place orders?",
  "Do I need coding skills?",
  "What is the store QR code?",
];

/* Backup jawab: sirf tab chalte hain jab AI server se jawab na aaye */
function getFallback(text: string): string {
  const t = text.toLowerCase();
  if (/^(hi|hy|hey|hello|salam|assalam)/.test(t.trim()))
    return "Hi! I'm Bexi AI. Ask me anything about building your online store.";
  if (t.includes("qr"))
    return "Every store gets its own QR code. Print it or share it, and customers can open your store or order on WhatsApp right away.";
  if (t.includes("free") || t.includes("price") || t.includes("plan") || t.includes("cost"))
    return "Yes, the free plan is really free. You can list up to 20 products and take orders on WhatsApp. You can upgrade to Pro or Business anytime.";
  if (t.includes("order") || t.includes("whatsapp"))
    return "Customers pick products in your store and send the order to your WhatsApp in one tap, with items and total filled in.";
  if (t.includes("coding") || t.includes("skill") || t.includes("design"))
    return "No coding or design skills needed. Just describe your business and the AI builds your store.";
  if (t.includes("upgrade"))
    return "Yes, you can start free and move to Pro or Business whenever your store grows.";
  return "I'm Bexi AI. I can help with plans, orders, QR codes and setting up your store. Try asking about one of those.";
}

export default function FloatingChat() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    { from: "bot", text: "Hi, I'm Bexi AI 👋 Ask me anything about building your store." },
  ]);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, typing, open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  async function send(text: string) {
    const msg = text.trim();
    if (!msg || typing) return;

    const next: Msg[] = [...messages, { from: "user", text: msg }];
    setMessages(next);
    setInput("");
    setTyping(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: next.map((m) => ({
            role: m.from === "user" ? "user" : "assistant",
            content: m.text,
          })),
        }),
      });

      if (!res.ok) throw new Error("chat failed");

      const data = (await res.json()) as { reply?: string };
      const reply = data.reply && data.reply.trim() ? data.reply : getFallback(msg);
      setMessages((m) => [...m, { from: "bot", text: reply }]);
    } catch {
      setMessages((m) => [...m, { from: "bot", text: getFallback(msg) }]);
    } finally {
      setTyping(false);
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-[60] flex flex-col items-end gap-3">
      {/* Chat window */}
      {open && (
        <div className="flex h-[480px] w-[calc(100vw-2.5rem)] max-w-[360px] flex-col overflow-hidden rounded-3xl border border-blue-100 bg-white">
          {/* Header */}
          <div className="flex items-center gap-3 bg-gradient-to-r from-[#0b1b4d] to-blue-600 px-4 py-3.5 text-white">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-lg">
              🤖
            </span>
            <div className="flex-1">
              <p className="text-sm font-bold leading-tight">Bexi AI</p>
              <p className="flex items-center gap-1.5 text-[11px] leading-tight text-blue-100">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Online
              </p>
            </div>
            <button
              type="button"
              aria-label="Close chat"
              onClick={() => setOpen(false)}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-white/80 transition hover:bg-white/15 hover:text-white"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-3 overflow-y-auto bg-blue-50/40 p-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
                  m.from === "user"
                    ? "ml-auto rounded-tr-sm bg-blue-600 text-white"
                    : "rounded-tl-sm border border-blue-100 bg-white text-slate-700"
                }`}
              >
                {m.text}
              </div>
            ))}

            {typing && (
              <div className="w-14 rounded-2xl rounded-tl-sm border border-blue-100 bg-white px-3.5 py-3">
                <span className="flex gap-1">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-400" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-400 [animation-delay:120ms]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-400 [animation-delay:240ms]" />
                </span>
              </div>
            )}

            {/* Quick questions (sirf shuru mein) */}
            {messages.length === 1 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {quickQuestions.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => send(q)}
                    className="cursor-pointer rounded-full border border-blue-200 bg-white px-3 py-1.5 text-xs font-medium text-blue-700 transition hover:bg-blue-600 hover:text-white"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            <div ref={endRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-center gap-2 border-t border-blue-100 bg-white p-3"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your question..."
              className="h-10 flex-1 rounded-full border border-blue-100 bg-blue-50/50 px-4 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-blue-500"
            />
            <button
              type="submit"
              aria-label="Send"
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-gradient-to-br from-blue-700 to-sky-500 text-white transition hover:brightness-110"
            >
              ➤
            </button>
          </form>
        </div>
      )}

      {/* AI chatbot button: gol circle, andar "Bexi AI" likha hua */}
      <button
        type="button"
        aria-label={open ? "Close Bexi AI chat" : "Open Bexi AI chat"}
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="relative flex h-[72px] w-[72px] cursor-pointer flex-col items-center justify-center rounded-full bg-gradient-to-br from-blue-700 to-blue-500 text-white shadow-lg shadow-blue-700/30 transition hover:-translate-y-0.5 hover:brightness-110 sm:h-20 sm:w-20"
      >
        {!open && (
          <span
            aria-hidden="true"
            className="absolute inset-0 -z-10 animate-ping rounded-full bg-blue-400/40"
          />
        )}

        {open ? (
          <span className="text-xl">✕</span>
        ) : (
          <>
            <svg
              aria-hidden="true"
              className="h-6 w-6 sm:h-7 sm:w-7"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 4a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3h-5l-5 3v-3H6a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h12z" />
              <path d="M9.5 9h.01" />
              <path d="M14.5 9h.01" />
              <path d="M9.5 13a3.5 3.5 0 0 0 5 0" />
            </svg>
            <span className="mt-1 text-[11px] font-bold leading-none tracking-wide sm:text-xs">
              Bexi AI
            </span>
          </>
        )}
      </button>
    </div>
  );
}