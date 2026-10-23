import { cn } from "@/lib/utils";

/** Infinite ticker strip. Items are duplicated so the -50% loop is seamless. */
export function Marquee({ items, className }: { items: string[]; className?: string }) {
  const row = (hidden: boolean) => (
    <ul aria-hidden={hidden || undefined} className="flex shrink-0 items-center">
      {items.map((item, i) => (
        <li key={i} className="flex items-center">
          <span className="display px-6 text-2xl md:text-3xl">{item}</span>
          <span aria-hidden className="size-2 rotate-45 bg-current opacity-70" />
        </li>
      ))}
    </ul>
  );
  return (
    <div data-marquee className={cn("overflow-hidden whitespace-nowrap py-3", className)}>
      <div className="flex w-max animate-marquee motion-reduce:animate-none">
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}
