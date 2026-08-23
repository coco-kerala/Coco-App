"use client";

import { useEffect, useState } from "react";
import { useT } from "@/contexts/LanguageContext";

export function useGreeting() {
  const { t } = useT();
  const [greeting, setGreeting] = useState(t("greeting.hello"));

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting(t("greeting.morning"));
    else if (hour < 17) setGreeting(t("greeting.afternoon"));
    else setGreeting(t("greeting.evening"));
  }, [t]);

  return greeting;
}
