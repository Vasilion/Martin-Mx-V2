import { FormSubmit } from "@/components/form-submit";
import { getContactContent, getSiteSettings } from "@/lib/content/loader";

export default async function ContactPage() {
  const [contact, settings] = await Promise.all([getContactContent(), getSiteSettings()]);

  return (
    <section className="space-y-4 text-white">
      <h1 className="text-3xl font-bold">Contact</h1>
      <article className="rounded border border-zinc-700 bg-zinc-900 p-4">
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
        </div>
      </article>
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
