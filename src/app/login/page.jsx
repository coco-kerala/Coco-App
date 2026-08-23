"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CoconutTreeIllustration } from "@/components/brand/CoconutTreeIllustration";

export default function LoginPage() {
  const router = useRouter();
  const { loginAs } = useAuth();

  const enter = (role) => {
    loginAs(role);
    const paths = { customer: "/customer", worker: "/worker", admin: "/admin" };
    router.push(paths[role]);
  };

  return (
    <main className="min-h-dvh flex items-center justify-center bg-coco-cream px-5">
      <Card className="w-full max-w-sm text-center">
        <Logo size="lg" className="justify-center" />
        <CoconutTreeIllustration className="w-20 h-20 mx-auto mt-4" />
        <h1 className="mt-4 text-2xl font-extrabold text-coco-ink">Welcome to COCO</h1>
        <p className="text-sm text-coco-muted mt-2">Choose a role to explore the demo</p>
        <div className="mt-6 space-y-2">
          <Button fullWidth onClick={() => enter("customer")}>Enter as Customer</Button>
          <Button fullWidth variant="outline" onClick={() => enter("worker")}>Enter as Worker</Button>
          <Button fullWidth variant="soft" onClick={() => enter("admin")}>Enter as Admin</Button>
        </div>
      </Card>
    </main>
  );
}
