import Link from "next/link";
import { getContactContent, getNavigationContent, getSiteSettings } from "@/lib/content/loader";

export async function SiteFooter() {
  const [settings, contact, navigation] = await Promise.all([
    getSiteSettings(),
    getContactContent(),
    getNavigationContent(),
  ]);

  return (
    <footer className="mt-10 border-t border-zinc-800 bg-zinc-950 text-zinc-300">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 md:grid-cols-3">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">{settings.siteName}</p>
          <p className="mt-2 text-sm">{settings.tagline}</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Contact</p>
          <p className="mt-2 text-sm">{settings.contactEmail}</p>
          <p className="text-sm">{settings.contactPhone}</p>
          <p className="text-sm">{settings.address}</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Social</p>
          <div className="mt-2 flex flex-wrap gap-2 text-sm">
            <a href={contact.facebookHref} className="rounded bg-zinc-800 px-3 py-1">
              Facebook
            </a>
            <a href={contact.instagramHref} className="rounded bg-zinc-800 px-3 py-1">
              Instagram
            </a>
            <a href={contact.twitterHref} className="rounded bg-zinc-800 px-3 py-1">
              Twitter
            </a>
          </div>
          <Link href="/contact" className="mt-3 inline-block text-sm text-red-300 underline">
            Contact Martin MX
          </Link>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            {navigation.footerQuickLinks.map((item) => (
              <Link key={item.href} href={item.href} className="rounded bg-zinc-800 px-2 py-1">
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
