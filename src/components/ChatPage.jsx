"use client";

import { MessageCircle, Send } from "lucide-react";
import { useEffect, useState } from "react";
import { useT } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { PageTransition } from "@/components/PageTransition";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { generateId } from "@/lib/utils";
import { getSupabaseClient } from "@/lib/supabase/client";
import { isLiveMode } from "@/lib/data/cloudSync";
import { notifyAdmins } from "@/lib/notifications/notify";
import { getAppData } from "@/lib/data/store";

function threadFor(role, userId) {
  return `${role}:${userId}`;
}

/**
 * Chat with office — saved to Supabase when live.
 */
export function ChatPage({ role = "customer" }) {
  const { t } = useT();
  const { user } = useAuth();
  const [text, setText] = useState("");
  const [messages, setMessages] = useState([]);

  const threadId = user ? threadFor(role, user.id) : "guest";

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    (async () => {
      const welcome = {
        id: "welcome",
        from: "office",
        body: t("chat.welcome"),
        at: new Date().toISOString(),
      };

      if (!isLiveMode()) {
        if (!cancelled) setMessages([welcome]);
        return;
      }

      const sb = getSupabaseClient();
      if (!sb) {
        if (!cancelled) setMessages([welcome]);
        return;
      }

      const { data } = await sb
        .from("chat_messages")
        .select("*")
        .eq("thread_id", threadId)
        .order("created_at", { ascending: true })
        .limit(100);

      const mapped = (data || []).map((m) => ({
        id: m.id,
        from: m.from_user_id === user.id ? "me" : "office",
        body: m.body,
        at: m.created_at,
      }));

      if (!cancelled) setMessages(mapped.length ? mapped : [welcome]);
    })();

    return () => {
      cancelled = true;
    };
  }, [user, threadId, t]);

  const send = async () => {
    const body = text.trim();
    if (!body || !user) return;

    const id = generateId("chat");
    const at = new Date().toISOString();
    setMessages((prev) => [...prev, { id, from: "me", body, at }]);
    setText("");

    if (isLiveMode()) {
      const sb = getSupabaseClient();
      if (sb) {
        await sb.from("chat_messages").insert({
          id,
          thread_id: threadId,
          from_user_id: user.id,
          from_role: user.role,
          body,
          created_at: at,
        });
      }
    }

    await notifyAdmins(
      {
        title: "New chat message",
        body: body.slice(0, 80),
        href: "/admin",
        type: "chat",
      },
      getAppData().users
    );

    // If office replies later they'd notify the user; for now echo tip only
    if (role === "admin") {
      // admin chatting in own app — rare
    }
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
