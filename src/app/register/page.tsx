import { FormSubmit } from "@/components/form-submit";
import { getPricingConfig, getSiteSettings } from "@/lib/content/loader";

export default async function RegisterPage() {
  const [settings, pricing] = await Promise.all([getSiteSettings(), getPricingConfig()]);

  return (
    <section className="space-y-6 text-white">
      <h1 className="text-3xl font-bold">Register</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <article className="rounded border border-zinc-700 bg-zinc-900 p-4">
          <h2 className="text-xl font-semibold">Practice Signup</h2>
          <p className="mb-4 mt-2 text-sm text-zinc-300">
            {settings.practiceOpen ? "Practice is open." : "Practice is currently closed."}
          </p>
          {settings.practiceCancelled ? (
            <p className="mb-4 text-sm text-red-300">Cancellation notice: {settings.practiceCancelReason}</p>
          ) : null}
          <FormSubmit
            formType="practice"
            disabled={!settings.practiceOpen || settings.practiceCancelled}
            fields={[
              { name: "riderFullName", label: "Rider Name" },
              { name: "riderEmail", label: "Email", type: "email" },
              { name: "riderPhone", label: "Phone" },
              { name: "riderAge", label: "Rider Age" },
              {
                name: "bikeClass",
                label: "Bike Class",
                type: "select",
                options: pricing.bikeClasses,
              },
              {
                name: "bikeSize",
                label: "Bike Size",
                type: "select",
                options: pricing.bikeSizes,
              },
              { name: "selectedDate", label: "Practice Date", type: "date" },
              {
                name: "selectedSessionOrTimeWindow",
                label: "Session",
                type: "select",
                options: ["Morning", "Afternoon", "Evening"],
              },
              { name: "trackType", label: "Track Type", type: "select", options: ["Main", "Junior"] },
              {
                name: "priceShownAtCheckout",
                label: "Price",
                type: "number",
              },
              { name: "paymentStatus", label: "Payment Status", type: "select", options: ["pending", "paid"] },
            ]}
          />
        </article>
        <article className="rounded border border-zinc-700 bg-zinc-900 p-4">
          <h2 className="text-xl font-semibold">Membership Signup</h2>
          <p className="mb-4 mt-2 text-sm text-zinc-300">
            {settings.membershipOpen ? "Membership is open." : "Membership is currently closed."}
          </p>
          <FormSubmit
            formType="membership"
            disabled={!settings.membershipOpen}
            fields={[
              { name: "riderFullName", label: "Rider Name" },
              { name: "riderEmail", label: "Email", type: "email" },
              { name: "riderPhone", label: "Phone" },
              { name: "riderAge", label: "Rider Age" },
              { name: "bikeClass", label: "Bike Class", type: "select", options: pricing.bikeClasses },
              { name: "bikeSize", label: "Bike Size", type: "select", options: pricing.bikeSizes },
              { name: "membershipType", label: "Membership Type", type: "select", options: ["Unlimited"] },
              { name: "membershipPrice", label: "Membership Price", type: "number" },
              { name: "paymentStatus", label: "Payment Status", type: "select", options: ["pending", "paid"] },
            ]}
          />
        </article>
      </div>
    </section>
  );
}
