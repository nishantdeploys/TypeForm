"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Form } from "@/types";
import { formsApi } from "@/lib/api/forms";
import { ResponsesOverview } from "@/components/responses/ResponsesOverview";
import { Loader2 } from "lucide-react";

export default function FormResponsesPage() {
  const params = useParams();
  const router = useRouter();
  const formId = params.id as string;

  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (formId) {
      formsApi
        .getById(formId)
        .then((data) => setForm(data))
        .catch((err) => {
          console.error(err);
          router.push("/forms");
        })
        .finally(() => setLoading(false));
    }
  }, [formId]);

  if (loading || !form) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return <ResponsesOverview form={form} />;
}
