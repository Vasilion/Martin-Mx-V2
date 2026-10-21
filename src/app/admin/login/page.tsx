import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { currentOwner } from "@/lib/auth/session";
import { Logo } from "@/components/site/logo";
import { LoginForm } from "@/components/admin/login-form";

export const metadata: Metadata = { title: "Sign in" };
export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (await currentOwner()) redirect("/admin");
  return (
    <div className="flex min-h-svh flex-col">
      <div className="bg-ink px-6 py-10 text-center">
        <Logo className="mx-auto h-6 w-auto" />
        <p className="mt-3 text-xs font-semibold uppercase tracking-[0.24em] text-white/50">Owner dashboard</p>
      </div>
      <div className="flex flex-1 items-start justify-center px-4 py-10">
        <div className="w-full max-w-sm rounded-xl border bg-card p-6 shadow-sm">
          <h1 className="text-2xl font-bold">Sign in</h1>
          <p className="mt-1 text-sm text-muted-foreground">You&apos;ll stay signed in on this device for 30 days.</p>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
