import Link from "next/link";
import { MapPin, Phone, Mail } from "lucide-react";
import { FacebookIcon, InstagramIcon } from "@/components/site/social-icons";
import { Logo } from "@/components/site/logo";
import { primaryNav, secondaryNav } from "@/components/site/nav-links";
import { park } from "@/lib/park/facts";

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-ink">
      <div className="mx-auto grid max-w-[1440px] gap-12 px-4 pb-10 pt-16 md:grid-cols-12 md:px-8 md:pt-24">
        <div className="md:col-span-5">
          <p className="display text-5xl text-white md:text-6xl">
            See you <span className="text-volt">at the gate.</span>
          </p>
          <ul className="mt-8 space-y-3 text-white/70">
            <li>
              <a href={park.mapsUrl} target="_blank" rel="noreferrer" className="flex gap-3 hover:text-white">
                <MapPin className="mt-0.5 size-4 shrink-0 text-volt" aria-hidden />
                <span>
                  {park.address.full}
                  <span className="block text-sm text-white/50">{park.address.directionsNote}</span>
                </span>
              </a>
            </li>
            <li>
              <a href={park.phone.href} className="flex items-center gap-3 hover:text-white">
                <Phone className="size-4 text-volt" aria-hidden /> {park.phone.display}
              </a>
            </li>
            <li>
              <a href={`mailto:${park.email}`} className="flex items-center gap-3 hover:text-white">
                <Mail className="size-4 text-volt" aria-hidden /> {park.email}
              </a>
            </li>
          </ul>
        </div>

        <nav aria-label="Footer" className="grid grid-cols-2 gap-8 md:col-span-4 md:col-start-7">
          <div>
            <p className="eyebrow text-white/40">Ride</p>
            <ul className="mt-4 space-y-2.5">
              <li><Link href="/register" className="text-white/80 hover:text-volt">Register</Link></li>
              {primaryNav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-white/80 hover:text-volt">{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="eyebrow text-white/40">Park</p>
            <ul className="mt-4 space-y-2.5">
              {secondaryNav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-white/80 hover:text-volt">{item.label}</Link>
                </li>
              ))}
              <li>
                <a href={park.storeUrl} target="_blank" rel="noreferrer" className="text-white/80 hover:text-volt">
                  Merch Store ↗
                </a>
              </li>
            </ul>
          </div>
        </nav>

        <div className="flex gap-3 md:col-span-2 md:justify-end">
          <a href={park.social.facebook} target="_blank" rel="noreferrer" aria-label="Martin MX on Facebook" className="grid size-11 place-items-center rounded-sm border border-white/15 text-white/80 transition hover:border-volt hover:text-volt">
            <FacebookIcon className="size-5" />
          </a>
          <a href={park.social.instagram} target="_blank" rel="noreferrer" aria-label="Martin MX on Instagram" className="grid size-11 place-items-center rounded-sm border border-white/15 text-white/80 transition hover:border-volt hover:text-volt">
            <InstagramIcon className="size-5" />
          </a>
        </div>
      </div>

      {/* Oversized wordmark bleeding off the bottom edge. */}
      <div aria-hidden className="pointer-events-none mx-auto max-w-[1440px] px-4 opacity-[0.06] md:px-8">
        <Logo className="-mb-[3%] w-full" />
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-2 px-4 py-5 text-xs text-white/45 md:flex-row md:justify-between md:px-8">
          <p>© {new Date().getFullYear()} Martin MX Park. All rights reserved.</p>
          <p>
            Site by{" "}
            <a href="https://unyxwebsolutions.com" target="_blank" rel="noreferrer" className="hover:text-white">
              Unyx Web Solutions
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
