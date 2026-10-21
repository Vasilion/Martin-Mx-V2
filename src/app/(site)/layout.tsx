import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getContent, getSite } from "@/lib/park/content";

/** Public site chrome. The owner dashboard (/admin) has its own layout. */
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [site, announcement] = await Promise.all([getSite(), getContent("announcement")]);
  return (
    <TooltipProvider>
      <a
        href="#main-content"
        className="sr-only z-[100] rounded-sm bg-volt px-4 py-2 font-semibold text-ink focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>
      <SiteHeader site={site} announcement={announcement} />
      <main id="main-content">{children}</main>
      <SiteFooter />
    </TooltipProvider>
  );
}
