"use client";

import { useState, useTransition } from "react";
import { Copy, KeyRound, Loader2, Mail, Trash2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { addTeamMember, removeTeamMember, resetTeamPassword } from "@/app/admin/actions";
import type { TeamMember } from "@/lib/auth/owners";

function when(iso?: string) {
  return iso ? new Date(iso).toLocaleDateString("en-US", { timeZone: "America/Detroit", month: "short", day: "numeric", year: "numeric" }) : "never";
}

/** Shows a new temporary password once, with copy + "email it" shortcuts. */
function PasswordReveal({ shown, onClose, signInUrl }: { shown: { name: string; email: string; password: string } | null; onClose: () => void; signInUrl: string }) {
  if (!shown) return null;
  const body = `Hi ${shown.name.split(" ")[0]},\n\nHere's your login for the Martin MX dashboard:\n\n${signInUrl}\nEmail: ${shown.email}\nTemporary password: ${shown.password}\n\nYou'll be asked to pick your own password after you sign in (Settings → Your password).`;
  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="theme-admin max-w-md">
        <DialogTitle>Login for {shown.name}</DialogTitle>
        <DialogDescription>Share this password with them. It won&apos;t be shown again; you can always create a new one.</DialogDescription>
        <div className="rounded-lg border bg-muted p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Temporary password</p>
          <p className="mt-1 select-all font-mono text-2xl font-bold tracking-wide">{shown.password}</p>
          <p className="mt-2 text-sm text-muted-foreground">Sign in at {signInUrl} with {shown.email}</p>
        </div>
        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            variant="outline"
            className="h-11"
            onClick={() => navigator.clipboard.writeText(body).then(() => toast.success("Copied. Paste it in a text or email."))}
          >
            <Copy /> Copy login details
          </Button>
          <Button asChild className="h-11">
            <a href={`mailto:${shown.email}?subject=${encodeURIComponent("Your Martin MX dashboard login")}&body=${encodeURIComponent(body)}`}>
              <Mail /> Email it to them
            </a>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function TeamManager({ team, me, signInUrl }: { team: TeamMember[]; me: string; signInUrl: string }) {
  const [pending, start] = useTransition();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [shown, setShown] = useState<{ name: string; email: string; password: string } | null>(null);
  const [removing, setRemoving] = useState<TeamMember | null>(null);

  return (
    <div className="space-y-5">
      <section className="rounded-lg border bg-card p-4 md:p-6">
        <h2 className="text-lg font-bold">People with access</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">Everyone here can do everything in the dashboard.</p>
        <ul className="mt-4 divide-y rounded-lg border">
          {team.map((m) => (
            <li key={m.email} className="flex flex-wrap items-center gap-3 p-3.5">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-ink font-bold text-white">{m.name.slice(0, 1).toUpperCase()}</span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold">
                  {m.name} {m.email === me && <span className="text-sm font-normal text-muted-foreground">(you)</span>}
                </span>
                <span className="block truncate text-sm text-muted-foreground">{m.email}</span>
                <span className="block text-xs text-muted-foreground">
                  Last signed in {when(m.lastLoginAt)}
                  {m.tempPassword && <span className="ml-2 rounded bg-caution/30 px-1.5 py-0.5 font-semibold text-[#7a4b00]">Temporary password</span>}
                </span>
              </span>
              {m.email !== me && (
                <span className="flex gap-2">
                  <Button
                    variant="outline"
                    className="h-10"
                    disabled={pending}
                    onClick={() =>
                      start(async () => {
                        const res = await resetTeamPassword(m.email);
                        if (res.error) toast.error(res.error);
                        else setShown({ name: m.name, email: m.email, password: res.password! });
                      })
                    }
                  >
                    <KeyRound /> New password
                  </Button>
                  <Button variant="outline" className="h-10 text-destructive" onClick={() => setRemoving(m)} aria-label={`Remove ${m.name}`}>
                    <Trash2 />
                  </Button>
                </span>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-lg border bg-card p-4 md:p-6">
        <h2 className="text-lg font-bold">Add someone</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">They get a temporary password to sign in with, then pick their own.</p>
        <form
          className="mt-4 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            setError("");
            start(async () => {
              const res = await addTeamMember({ name, email });
              if (res.error) return setError(res.error);
              toast.success(res.message);
              setShown({ name, email: email.trim().toLowerCase(), password: res.password! });
              setName("");
              setEmail("");
            });
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="t-name">Name</Label>
              <Input id="t-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={60} required className="h-12 text-base" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="t-email">Email</Label>
              <Input id="t-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-12 text-base" />
            </div>
          </div>
          {error && (
            <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}
          <Button type="submit" disabled={pending} className="h-12 px-5 text-base">
            {pending ? <Loader2 className="animate-spin" /> : <UserPlus />} Add person
          </Button>
        </form>
      </section>

      <PasswordReveal shown={shown} onClose={() => setShown(null)} signInUrl={signInUrl} />

      <Dialog open={!!removing} onOpenChange={(v) => !v && setRemoving(null)}>
        <DialogContent className="theme-admin max-w-sm">
          <DialogTitle>Remove {removing?.name}?</DialogTitle>
          <DialogDescription>They lose access right away and are signed out on every device.</DialogDescription>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" className="h-11" onClick={() => setRemoving(null)}>
              Keep
            </Button>
            <Button
              variant="destructive"
              className="h-11"
              disabled={pending}
              onClick={() =>
                start(async () => {
                  const res = await removeTeamMember(removing!.email);
                  if (res.error) toast.error(res.error);
                  else toast.success(res.message);
                  setRemoving(null);
                })
              }
            >
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
