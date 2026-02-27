import { FormSubmit } from "@/components/form-submit";

export default function HiringPage() {
  return (
    <section className="space-y-4 text-white">
      <h1 className="text-3xl font-bold">Hiring</h1>
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
