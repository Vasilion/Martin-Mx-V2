"use client";

import { useState } from "react";

type FormSubmitProps = {
  formType: "practice" | "membership" | "contact" | "hiring" | "daily";
  disabled?: boolean;
  successRedirectPath?: string;
  fields: Array<{
    name: string;
    label: string;
    type?: "text" | "email" | "number" | "date" | "checkbox" | "textarea" | "select";
    required?: boolean;
    options?: string[];
    defaultValue?: string | number | boolean;
  }>;
};

export function FormSubmit({
  formType,
  fields,
  disabled = false,
  successRedirectPath,
}: FormSubmitProps) {
  const [status, setStatus] = useState<string>("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (disabled) {
      return;
    }
    setPending(true);
    setStatus("");
    const formData = new FormData(event.currentTarget);
    const payload: Record<string, unknown> = Object.fromEntries(formData.entries());

    payload.website = formData.get("website") ?? "";

    if (formType === "practice") {
      payload.priceShownAtCheckout = Number(payload.priceShownAtCheckout || 0);
    }
    if (formType === "membership") {
      payload.membershipPrice = Number(payload.membershipPrice || 0);
    }
    if (formType === "daily") {
      payload.waiverAcknowledgement = payload.waiverAcknowledgement === "on";
    }

    const response = await fetch(`/api/forms/${formType}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = (await response.json()) as { referenceId?: string; error?: string };

    if (!response.ok) {
      setStatus(result.error ?? "Failed to submit.");
      setPending(false);
      return;
    }

    if (successRedirectPath) {
      const destination = result.referenceId
        ? `${successRedirectPath}?referenceId=${encodeURIComponent(result.referenceId)}`
        : successRedirectPath;
      window.location.href = destination;
      return;
    }

    setStatus(`Submitted successfully. Reference: ${result.referenceId ?? "n/a"}`);
    setPending(false);
    event.currentTarget.reset();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 rounded border border-zinc-700 bg-zinc-900 p-4">
      <input
        name="website"
        autoComplete="off"
        tabIndex={-1}
        className="hidden"
        aria-hidden="true"
        disabled={disabled}
      />
      {fields.map((field) => (
        <label key={field.name} className="block text-sm">
          <span className="mb-1 block text-zinc-200">{field.label}</span>
          {field.type === "textarea" ? (
            <textarea
              name={field.name}
              required={field.required ?? true}
              disabled={disabled}
              defaultValue={typeof field.defaultValue === "string" ? field.defaultValue : undefined}
              className="min-h-28 w-full rounded border border-zinc-600 bg-zinc-800 px-3 py-2 text-white"
            />
          ) : null}
          {field.type === "select" ? (
            <select
              name={field.name}
              required={field.required ?? true}
              disabled={disabled}
              className="w-full rounded border border-zinc-600 bg-zinc-800 px-3 py-2 text-white"
              defaultValue={
                typeof field.defaultValue === "string" || typeof field.defaultValue === "number"
                  ? String(field.defaultValue)
                  : ""
              }
            >
              <option value="" disabled>
                Select an option
              </option>
              {(field.options ?? []).map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          ) : null}
          {field.type !== "textarea" && field.type !== "select" ? (
            <input
              name={field.name}
              type={field.type ?? "text"}
              required={field.required ?? true}
              disabled={disabled}
              defaultValue={
                typeof field.defaultValue === "string" || typeof field.defaultValue === "number"
                  ? String(field.defaultValue)
                  : undefined
              }
              defaultChecked={field.type === "checkbox" && field.defaultValue === true}
              className="w-full rounded border border-zinc-600 bg-zinc-800 px-3 py-2 text-white"
            />
          ) : null}
        </label>
      ))}
      <button
        disabled={pending || disabled}
        className="rounded bg-red-700 px-4 py-2 text-white disabled:opacity-60"
        type="submit"
      >
        {pending ? "Submitting..." : "Submit"}
      </button>
      {status ? <p className="text-sm text-zinc-300">{status}</p> : null}
    </form>
  );
}
