/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useRef, useState } from "react";
import {
  isPlatformAssistantResponse,
  type PlatformAssistantRequest,
} from "@/lib/storefront-types";

/* ============ CONFIG ============ */
const BEXI_ICON = "/bexi-ai.jpeg"; // Bexi AI icon (put the file inside /public). Use .jpeg here if your file is .jpeg

// Zoom on the robot's head so the icon looks clear at small sizes
const BEXI_ICON_STYLE: React.CSSProperties = {
  objectPosition: "50% 30%",
  transform: "scale(1.8)",
  transformOrigin: "58% 34%",
};
/* ================================== */

type Msg = { from: "bot" | "user"; text: string };

const quickQuestions = [
  "Is the free plan really free?",
  "How do customers place orders?",
  "Do I need coding skills?",
  "What is the store QR code?",
];

export default function FloatingChat() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [chatError, setChatError] = useState("");
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
    setChatError("");

    try {
      const requestBody: PlatformAssistantRequest = {
        messages: next.slice(-20).map((message) => ({
          role: message.from === "user" ? "user" : "assistant",
          content: message.text,
        })),
      };
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const payload: unknown = await res.json();
      if (!res.ok) {
        const errorMessage = typeof payload === "object" && payload !== null && "error" in payload && typeof payload.error === "string"
          ? payload.error
          : "The assistant could not process your message.";
        throw new Error(errorMessage);
      }
      if (!isPlatformAssistantResponse(payload)) {
        throw new Error("The assistant returned an invalid response.");
      }
      setMessages((current) => [...current, { from: "bot", text: payload.reply }]);
    } catch (error) {
      setChatError(error instanceof Error ? error.message : "The assistant is temporarily unavailable.");
    } finally {
      setTyping(false);
    }
  }

  return (
    <div className="fixed bottom-3 right-3 z-[60] flex flex-col items-end gap-3 sm:bottom-4 sm:right-4">
      {/* Chat window */}
      {open && (
        <div className="flex h-[480px] w-[calc(100vw-2rem)] max-w-[360px] flex-col overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-2xl shadow-[#0b2545]/20">
          {/* Header */}
          <div className="flex items-center gap-3 bg-gradient-to-r from-[#0b2545] to-[#1976d2] px-4 py-3.5 text-white">
            <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-white ring-2 ring-white/30">
              <img
                src={BEXI_ICON}
                alt="Bexi AI"
                className="h-full w-full object-cover"
                style={BEXI_ICON_STYLE}
              />
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
                    ? "ml-auto rounded-tr-sm bg-[#1976d2] text-white"
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
            {chatError && <p role="alert" className="text-xs text-red-700">{chatError}</p>}

            {/* Quick questions (sirf shuru mein) */}
            {messages.length === 1 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {quickQuestions.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => send(q)}
                    className="cursor-pointer rounded-full border border-blue-200 bg-white px-3 py-1.5 text-xs font-medium text-[#0b2545] transition hover:bg-[#1976d2] hover:text-white"
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
              maxLength={500}
              placeholder="Type your question..."
              className="h-10 flex-1 rounded-full border border-blue-100 bg-blue-50/50 px-4 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-[#1976d2]"
            />
            <button
              type="submit"
              aria-label="Send"
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-gradient-to-br from-[#0b2545] to-[#1976d2] text-white transition hover:brightness-110"
            >
              ➤
            </button>
          </form>
        </div>
      )}

      {/* Bexi AI button: gol robot icon (48px), label sirf hover par dikhta hai */}
      <button
        type="button"
        aria-label={open ? "Close Bexi AI chat" : "Open Bexi AI chat"}
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className={`group relative flex h-12 w-12 cursor-pointer items-center justify-center rounded-full shadow-md shadow-[#0b2545]/25 transition hover:-translate-y-0.5 hover:brightness-110 ${
          open
            ? "bg-gradient-to-br from-[#0b2545] to-[#1976d2] text-white"
            : "bg-white ring-2 ring-[#1976d2]/40"
        }`}
      >
        {open ? (
          <span className="text-lg">✕</span>
        ) : (
          <>
            <span className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-white">
              <img
                src={BEXI_ICON}
                alt=""
                aria-hidden="true"
                className="h-full w-full object-cover"
                style={BEXI_ICON_STYLE}
              />
            </span>
            <span className="pointer-events-none absolute right-full mr-2 whitespace-nowrap rounded-full bg-[#0b2545] px-3 py-1 text-xs font-bold text-white opacity-0 shadow-md transition group-hover:opacity-100">
              Bexi AI
            </span>
          </>
        )}
      </button>
    </div>
  );
}