import Image from "next/image";
import { FormSubmit } from "@/components/form-submit";
import { getHiringContent } from "@/lib/content/loader";

export default async function HiringPage() {
  const hiring = await getHiringContent();

  return (
    <section className="space-y-6 text-white">
      <header className="rounded-3xl border border-white/10 bg-zinc-900/75 p-6 shadow-[0_18px_50px_rgba(0,0,0,0.35)] backdrop-blur">
        <h1 className="text-3xl font-bold md:text-4xl">{hiring.title}</h1>
        <p className="mt-2 text-sm text-zinc-300 md:text-base">{hiring.description}</p>
      </header>
      <article className="mx-card-interactive overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/75 shadow-[0_14px_40px_rgba(0,0,0,0.3)] backdrop-blur">
        <div className="relative aspect-[16/8] w-full bg-zinc-800 md:aspect-[5/2]">
          <Image
            src={hiring.heroImage}
            alt={hiring.heroImageAlt}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 70vw"
            className="object-cover"
          />
        </div>
      </article>
      <FormSubmit
        formType="hiring"
        fields={[
          { name: "fullName", label: "Full Name" },
          { name: "email", label: "Email", type: "email" },
          { name: "phone", label: "Phone" },
          { name: "preferredPosition", label: "Preferred Position" },
          { name: "availability", label: "Availability" },
          { name: "experienceSummary", label: "Experience Summary", type: "textarea" },
        ]}
      />
    </section>
  );
}
