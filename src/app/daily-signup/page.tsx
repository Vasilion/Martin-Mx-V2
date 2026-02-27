import { FormSubmit } from "@/components/form-submit";

export default function DailySignupPage() {
  return (
    <section className="space-y-4 text-white">
      <h1 className="text-3xl font-bold">Daily Signup</h1>
      <FormSubmit
        formType="daily"
        fields={[
          { name: "riderFullName", label: "Rider Name" },
          { name: "riderEmail", label: "Email", type: "email" },
          { name: "riderPhone", label: "Phone" },
          { name: "riderAge", label: "Rider Age" },
          { name: "bikeClass", label: "Bike Class" },
          { name: "bikeSize", label: "Bike Size" },
          { name: "selectedDate", label: "Selected Date", type: "date" },
          { name: "waiverAcknowledgement", label: "Waiver Acknowledgement", type: "checkbox" },
        ]}
      />
    </section>
  );
}
