/* eslint-disable @next/next/no-img-element -- SVG wordmark; next/image adds nothing here */
import { cn } from "@/lib/utils";

/** White MARTIN MX wordmark (2130×276). Size it with a height class. */
export function Logo({ className }: { className?: string }) {
  return (
    <img
      src="/brand/martinmx-logo-white.svg"
      alt="Martin MX"
      width={2130}
      height={276}
      className={cn("block", className)}
    />
  );
}
