import Image from "next/image";
import { FormSubmit } from "@/components/form-submit";
import { getContactContent, getSiteSettings } from "@/lib/content/loader";

export default async function ContactPage() {
  const [contact, settings] = await Promise.all([getContactContent(), getSiteSettings()]);

  return (
    <section className="space-y-6 text-white">
      <header className="rounded-3xl border border-white/10 bg-zinc-900/75 p-6 shadow-[0_18px_50px_rgba(0,0,0,0.35)] backdrop-blur">
        <h1 className="text-3xl font-bold md:text-4xl">Contact</h1>
        <p className="mt-2 text-sm text-zinc-300 md:text-base">
          Reach the team for track questions, scheduling, rider support, or event information.
        </p>
      </header>
      <article className="rounded-2xl border border-white/10 bg-zinc-900/75 p-5 shadow-[0_14px_40px_rgba(0,0,0,0.3)] backdrop-blur">
        <h2 className="text-xl font-semibold">{contact.headline}</h2>
        <p className="mt-2 text-sm text-zinc-300">{contact.description}</p>
        <div className="mt-4 grid gap-2 text-sm text-zinc-300">
          <p>Email: {settings.contactEmail}</p>
          <p>Phone: {settings.contactPhone}</p>
          <p>Address: {settings.address}</p>
        </div>
        <div className="mt-4 flex flex-wrap gap-3 text-sm">
          <a className="rounded bg-zinc-800 px-3 py-2" href={contact.googleMapsHref}>
            View on Map
          </a>
          <a className="rounded bg-zinc-800 px-3 py-2" href={contact.facebookHref}>
            Facebook
          </a>
          <a className="rounded bg-zinc-800 px-3 py-2" href={contact.instagramHref}>
            Instagram
          </a>
          <a className="rounded bg-zinc-800 px-3 py-2" href={contact.twitterHref}>
            Twitter
          </a>
        </div>
      </article>
      <div className="grid gap-4 md:grid-cols-2">
        <article className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/75 shadow-[0_14px_40px_rgba(0,0,0,0.3)] backdrop-blur">
          <div className="relative aspect-[4/3] w-full bg-zinc-800">
            <Image
              src="/media/gallery/hero.webp"
              alt="Martin MX Park contact location visual"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </article>
        <article className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/75 shadow-[0_14px_40px_rgba(0,0,0,0.3)] backdrop-blur">
          <div className="relative aspect-[4/3] w-full bg-zinc-800">
            <Image
              src="/media/gallery/track-photo.jpg"
              alt="Track-side view from Martin MX Park"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </article>
      </div>
      <FormSubmit
        formType="contact"
        fields={[
          { name: "fullName", label: "Full Name" },
          { name: "email", label: "Email", type: "email" },
          { name: "phone", label: "Phone" },
          { name: "subject", label: "Subject" },
          { name: "message", label: "Message", type: "textarea" },
        ]}
      />
    </section>
  );
}
