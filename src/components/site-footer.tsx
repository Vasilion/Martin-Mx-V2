import Image from "next/image";
import Link from "next/link";
import { getContactContent, getNavigationContent, getSiteSettings } from "@/lib/content/loader";

export async function SiteFooter() {
  const [settings, contact, navigation] = await Promise.all([
    getSiteSettings(),
    getContactContent(),
    getNavigationContent(),
  ]);

  return (
    <footer className="mt-10 border-t border-white/10 bg-zinc-950/85 text-zinc-300 backdrop-blur">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 md:grid-cols-3">
        <div>
          <div className="relative h-12 w-52">
            <Image src="/media/sponsors/martin-logo-white.svg" alt={settings.siteName} fill sizes="208px" className="object-contain object-left" />
          </div>
          <p className="mt-3 text-sm">{settings.tagline}</p>
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
            <a href={contact.facebookHref} className="mx-cta-secondary px-3 py-1.5">
              Facebook
            </a>
            <a href={contact.instagramHref} className="mx-cta-secondary px-3 py-1.5">
              Instagram
            </a>
            <a href={contact.twitterHref} className="mx-cta-secondary px-3 py-1.5">
              Twitter
            </a>
          </div>
          <Link href="/contact" className="mt-3 inline-block text-sm text-green-300 underline">
            Contact Martin MX
          </Link>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            {navigation.footerQuickLinks.map((item) => (
              <Link key={item.href} href={item.href} className="rounded-lg bg-zinc-800 px-2.5 py-1.5 transition hover:bg-zinc-700">
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
