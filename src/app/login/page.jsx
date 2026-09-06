"use client";

import { useRouter } from "next/navigation";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function LoginPage() {
  const router = useRouter();
  return (
    <main className="min-h-dvh flex items-center justify-center bg-coco-cream px-5">
      <Card className="w-full max-w-sm text-center space-y-3">
        <Logo size="lg" className="justify-center" />
        <h1 className="text-2xl font-extrabold text-coco-ink">Login to KeraGo</h1>
        <p className="text-sm text-coco-muted">Choose how you use the app</p>
        <Button fullWidth onClick={() => router.push("/user/login")}>Become a user</Button>
        <Button fullWidth variant="outline" onClick={() => router.push("/partner/login")}>Become a partner</Button>
      </Card>
    </main>
  );
}
