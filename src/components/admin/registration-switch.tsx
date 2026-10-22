"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { setPracticeRegistration } from "@/app/admin/actions";

/** Site-wide practice registration. Off hides every Register button; memberships keep selling. */
export function RegistrationSwitch({ enabled }: { enabled: boolean }) {
  const [pending, start] = useTransition();

  return (
    <label
      className={cn(
        "flex cursor-pointer items-center justify-between gap-4 rounded-lg border p-4",
        enabled ? "bg-card" : "border-caution/40 bg-caution/10",
      )}
    >
      <span>
        <span className="block font-semibold">Practice registration on the site</span>
        <span className="block text-sm text-muted-foreground">
          {enabled
            ? "On. Register buttons show whenever a ride day is open for sign-ups."
            : "Off. Register buttons are hidden and the Register page says it's closed. Memberships still sell."}
        </span>
      </span>
      <Switch
        checked={enabled}
        disabled={pending}
        onCheckedChange={(v) =>
          start(async () => {
            const res = await setPracticeRegistration(v);
            if (res.error) toast.error(res.error);
            else if (res.message) toast.success(res.message);
          })
        }
        className="scale-125 data-[state=checked]:bg-brand"
        aria-label="Practice registration on the site"
      />
    </label>
  );
}
