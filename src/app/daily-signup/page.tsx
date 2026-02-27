import { FormSubmit } from "@/components/form-submit";
import { getTrackInfoContent } from "@/lib/content/loader";

export default async function DailySignupPage() {
  const trackInfo = await getTrackInfoContent();

  return (
    <section className="space-y-4 text-white">
      <h1 className="text-3xl font-bold">Daily Signup</h1>
      <article className="rounded border border-zinc-700 bg-zinc-900 p-4">
        <p className="text-sm text-zinc-300">
          Use this form for day-of registration. A confirmation email will include all submitted rider details.
        </p>
        <div className="mt-3 flex flex-wrap gap-3">
          {trackInfo.waiverLinks.map((link) => (
            <a key={link.label} href={link.href} className="rounded bg-zinc-800 px-3 py-2 text-sm">
              {link.label}
            </a>
          ))}
        </div>
      </article>
      <FormSubmit
        formType="daily"
        fields={[
          { name: "riderFullName", label: "Rider Name" },
          { name: "riderEmail", label: "Email", type: "email" },
          { name: "riderPhone", label: "Phone" },
          { name: "riderAge", label: "Rider Age" },
          { name: "bikeClass", label: "Bike Class", type: "select", options: ["A/B", "C", "Mini", "Jr Track"] },
          { name: "bikeSize", label: "Bike Size", type: "select", options: ["50cc", "65cc", "85cc", "125cc", "250cc", "450cc"] },
          { name: "selectedDate", label: "Selected Date", type: "date" },
          { name: "waiverAcknowledgement", label: "Waiver Acknowledgement", type: "checkbox" },
        ]}
      />
    </section>
  );
}
