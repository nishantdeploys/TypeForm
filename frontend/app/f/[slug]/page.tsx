"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Form, ResponseAnswerCreate } from "@/types";
import { publicApi } from "@/lib/api/public";
import { RespondentLayout } from "@/components/respondent/RespondentLayout";
import { Loader2, AlertCircle } from "lucide-react";

export default function PublicFormPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      publicApi
        .getBySlug(slug)
        .then((data) => setForm(data))
        .catch((err: any) => {
          setError(err.message || "Form not found or no longer published.");
        })
        .finally(() => setLoading(false));
    }
  }, [slug]);

  const handleSubmitResponse = async (
    answersMap: Record<string, { text?: string; number?: number; json?: string }>,
    timeSec: number
  ) => {
    const answersList: ResponseAnswerCreate[] = Object.entries(answersMap).map(
      ([question_id, val]) => ({
        question_id,
        answer_text: val.text || undefined,
        answer_number: val.number !== undefined ? val.number : undefined,
        answer_json: val.json || undefined,
      })
    );

    await publicApi.submitResponse(slug, {
      completion_time: timeSec,
      answers: answersList,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-center text-white">
        <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Form Unavailable</h1>
        <p className="text-zinc-400 max-w-md text-sm">{error || "This form is not available."}</p>
      </div>
    );
  }

  return (
    <RespondentLayout
      form={form}
      onSubmit={handleSubmitResponse}
      isPreview={false}
    />
  );
}
