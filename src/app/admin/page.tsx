"use client";

import { useEffect } from "react";

export default function AdminPage() {
  useEffect(() => {
    window.location.href = "/admin/index.html";
  }, []);

  return <p className="text-white">Redirecting to CMS...</p>;
}
