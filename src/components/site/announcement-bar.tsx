import Link from "next/link";
import { ArrowRight, Megaphone, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Content } from "@/lib/park/content";

/** Owner-controlled strip above the header (e.g. "Closed this weekend for track work"). */
export function AnnouncementBar({ announcement: a }: { announcement: Content<"announcement"> }) {
  if (!a.active || !a.message) return null;
  const Icon = a.tone === "warning" ? TriangleAlert : Megaphone;
  const body = (
    <span className="flex items-center justify-center gap-2.5 px-4 py-2 text-center text-sm font-semibold">
      <Icon className="size-4 shrink-0" aria-hidden />
      <span>{a.message}</span>
      {a.linkHref && (
        <span className="hidden shrink-0 items-center gap-1 underline underline-offset-4 sm:inline-flex">
          {a.linkLabel || "Details"} <ArrowRight className="size-3.5" aria-hidden />
        </span>
      )}
    </span>
  );
  const cls = cn("block", a.tone === "warning" ? "bg-caution text-ink" : "bg-volt text-ink");
  return a.linkHref ? (
    <Link href={a.linkHref} className={cn(cls, "hover:brightness-95")}>
      {body}
    </Link>
  ) : (
    <div className={cls} role="status">
      {body}
    </div>
  );
}
