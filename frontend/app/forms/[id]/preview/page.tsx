"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Form } from "@/types";
import { formsApi } from "@/lib/api/forms";
import { RespondentLayout } from "@/components/respondent/RespondentLayout";
import { Loader2 } from "lucide-react";

export default function FormPreviewPage() {
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

  const handlePreviewSubmit = async (answers: any, timeSec: number) => {
    // Simulate submission delay in preview mode without sending to server
    await new Promise((resolve) => setTimeout(resolve, 500));
  };

  if (loading || !form) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <RespondentLayout
      form={form}
      onSubmit={handlePreviewSubmit}
      isPreview={true}
    />
  );
}
