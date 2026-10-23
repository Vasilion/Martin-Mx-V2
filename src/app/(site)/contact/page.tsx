import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";
import { PageHeader } from "@/components/site/page-header";
import { ContactForm } from "@/components/forms/contact-form";
import { FacebookIcon, InstagramIcon } from "@/components/site/social-icons";
import { getContent, getSite } from "@/lib/park/content";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Contact",
  description: "Get in touch with Martin MX Park: questions about practice, memberships, events or sponsoring.",
  path: "/contact",
  og: "contact",
});

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const [site, contact] = await Promise.all([getSite(), getContent("contact")]);
  const ways = [
    { icon: Phone, label: "Call or text", value: site.phone, href: site.phoneHref },
    { icon: Mail, label: "Email", value: site.email, href: `mailto:${site.email}` },
    { icon: MapPin, label: "Visit", value: site.addressFull, href: site.mapsUrl },
  ];
  return (
    <>
      <PageHeader compact eyebrow="Contact" title="Get in" accent="touch." image="/media/gallery/strapi-main-3.jpg" imagePosition="center 60%" />
      <section className="bg-ink pb-24 pt-12 md:pb-32 md:pt-16">
        <div className="mx-auto grid max-w-[1440px] gap-14 px-4 md:px-8 lg:grid-cols-12">
          <aside className="space-y-6 lg:col-span-4">
            <p className="text-lg text-white/80">{contact.intro}</p>
            <ul className="divide-y divide-white/10 border-y border-white/10">
              {ways.map((w) => (
                <li key={w.label}>
                  <a href={w.href} target={w.icon === MapPin ? "_blank" : undefined} rel="noreferrer" className="group flex gap-4 py-5">
                    <w.icon className="mt-0.5 size-5 shrink-0 text-volt" aria-hidden />
                    <span className="min-w-0 [overflow-wrap:anywhere]">
                      <span className="eyebrow block text-[0.65rem] text-white/50">{w.label}</span>
                      <span className="text-[clamp(0.875rem,4.4vw,1rem)] text-white group-hover:text-volt">{w.value}</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
            <div className="flex gap-3">
              {site.facebook && (
                <a href={site.facebook} target="_blank" rel="noreferrer" aria-label="Facebook" className="grid size-11 place-items-center rounded-sm border border-white/15 text-white/80 hover:border-volt hover:text-volt">
                  <FacebookIcon className="size-5" />
                </a>
              )}
              {site.instagram && (
                <a href={site.instagram} target="_blank" rel="noreferrer" aria-label="Instagram" className="grid size-11 place-items-center rounded-sm border border-white/15 text-white/80 hover:border-volt hover:text-volt">
                  <InstagramIcon className="size-5" />
                </a>
              )}
            </div>
          </aside>
          <div className="lg:col-span-7 lg:col-start-6">
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}
