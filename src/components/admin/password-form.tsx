"use client";

import { useRef, useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updatePassword } from "@/app/admin/actions";

export function PasswordForm({ email }: { email: string }) {
  const form = useRef<HTMLFormElement>(null);
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  return (
    <section className="rounded-lg border bg-card p-4 md:p-6">
      <h2 className="text-lg font-bold">Your password</h2>
      <p className="mt-0.5 text-sm text-muted-foreground">Signed in as {email}.</p>
      <form
        ref={form}
        className="mt-4 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          setError("");
          const data = new FormData(e.currentTarget);
          start(async () => {
            const res = await updatePassword(String(data.get("current")), String(data.get("next")), String(data.get("confirm")));
            if (res.error) setError(res.error);
            else {
              toast.success(res.message);
              form.current?.reset();
            }
          });
        }}
      >
        <input type="email" name="username" autoComplete="username" value={email} readOnly hidden />
        <div className="space-y-2">
          <Label htmlFor="pw-current">Current password</Label>
          <Input id="pw-current" name="current" type="password" autoComplete="current-password" required className="h-12 text-base" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="pw-next">New password</Label>
            <Input id="pw-next" name="next" type="password" autoComplete="new-password" minLength={10} required className="h-12 text-base" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pw-confirm">New password again</Label>
            <Input id="pw-confirm" name="confirm" type="password" autoComplete="new-password" minLength={10} required className="h-12 text-base" />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">At least 10 characters. A few random words works well.</p>
        {error && (
          <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}
        <Button type="submit" variant="outline" disabled={pending} className="h-11">
          {pending && <Loader2 className="animate-spin" />} Change password
        </Button>
      </form>
    </section>
  );
}
