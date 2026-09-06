"use client";

import { MessageCircle, Send } from "lucide-react";
import { useState } from "react";
import { useT } from "@/contexts/LanguageContext";
import { PageTransition } from "@/components/PageTransition";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

/**
 * Simple chat inbox (demo). Real office chat / WhatsApp bridge can plug in later.
 */
export function ChatPage({ role = "customer" }) {
  const { t } = useT();
  const [text, setText] = useState("");
  const [messages, setMessages] = useState([
    {
      id: "1",
      from: "office",
      body: t("chat.welcome"),
      at: new Date().toISOString(),
    },
  ]);

  const send = () => {
    const body = text.trim();
    if (!body) return;
    setMessages((prev) => [
      ...prev,
      { id: `m_${Date.now()}`, from: "me", body, at: new Date().toISOString() },
    ]);
    setText("");
  };

  return (
    <PageTransition>
      <div className="px-5 pt-4 pb-4 flex flex-col min-h-[70dvh]">
        <h1 className="text-2xl font-extrabold text-coco-ink">{t("chat.title")}</h1>
        <p className="mt-1 text-sm text-coco-muted">{t("chat.subtitle")}</p>

        <Card className="mt-5 flex-1 flex flex-col min-h-[320px] p-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                  m.from === "me"
                    ? "ml-auto bg-coco-leaf text-white rounded-br-md"
                    : "bg-coco-cream text-coco-ink rounded-bl-md"
                }`}
              >
                {m.body}
              </div>
            ))}
          </div>

          <div className="border-t border-coco-border p-3 flex gap-2 items-center">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder={t("chat.placeholder")}
              className="flex-1 h-11 rounded-xl border border-coco-border bg-white px-3 text-sm outline-none focus:border-coco-leaf"
            />
            <Button type="button" onClick={send} className="h-11 w-11 p-0 shrink-0" aria-label={t("chat.send")}>
              <Send size={18} />
            </Button>
          </div>
        </Card>

        <p className="mt-3 text-xs text-coco-muted text-center flex items-center justify-center gap-1.5">
          <MessageCircle size={14} />
          {role === "worker" ? t("chat.partnerHint") : t("chat.homeHint")}
        </p>
      </div>
    </PageTransition>
  );
}
