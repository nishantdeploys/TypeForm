"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Form, Question, QuestionType } from "@/types";
import { formsApi } from "@/lib/api/forms";
import { questionsApi } from "@/lib/api/questions";
import { getQuestionConfig } from "@/components/questions/questionRegistry";
import { BuilderHeader } from "@/components/builder/BuilderHeader";
import { QuestionListPanel } from "@/components/builder/QuestionListPanel";
import { BuilderCanvas } from "@/components/builder/BuilderCanvas";
import { QuestionSettingsPanel } from "@/components/builder/QuestionSettingsPanel";
import { Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function FormBuilderPage() {
  const params = useParams();
  const router = useRouter();
  const formId = params.id as string;

  const [form, setForm] = useState<Form | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [unauthorizedError, setUnauthorizedError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setUnauthorizedError(null);
    try {
      const data = await formsApi.getById(formId);
      setForm(data);
      const qs = data.questions || [];
      setQuestions(qs);
      if (qs.length > 0 && !activeQuestionId) {
        setActiveQuestionId(qs[0].id);
      }
    } catch (err: any) {
      setUnauthorizedError(err.message || "This form is unavailable or you do not have permission to view it.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (formId) {
      loadData();
    }
  }, [formId]);

  const activeQuestion = questions.find((q) => q.id === activeQuestionId) || null;

  const handleAddQuestion = async (type: QuestionType = "short_text") => {
    if (!form) return;
    setIsSaving(true);
    const config = getQuestionConfig(type);

    try {
      const created = await questionsApi.add(form.id, {
        type,
        title: config.defaultTitle,
        description: undefined,
        required: false,
        position: questions.length,
        settings_json: config.defaultSettings ? JSON.stringify(config.defaultSettings) : "{}",
        options: config.defaultOptions || [],
      });

      const updatedList = [...questions, created];
      setQuestions(updatedList);
      setActiveQuestionId(created.id);
    } catch (err: any) {
      alert(err.message || "Failed to add question.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateQuestion = async (updates: Partial<Question>) => {
    if (!activeQuestionId) return;
    setIsSaving(true);

    try {
      const updated = await questionsApi.update(activeQuestionId, updates);
      setQuestions((prev) => prev.map((q) => (q.id === activeQuestionId ? updated : q)));
    } catch (err: any) {
      console.error("Failed to update question:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDuplicateQuestion = async (id: string) => {
    const target = questions.find((q) => q.id === id);
    if (!target || !form) return;
    setIsSaving(true);

    try {
      const created = await questionsApi.add(form.id, {
        type: target.type,
        title: `${target.title} (Copy)`,
        description: target.description || undefined,
        required: target.required,
        position: questions.length,
        settings_json: target.settings_json || "{}",
        options: target.options.map((opt) => ({ label: opt.label, value: opt.value })),
      });

      setQuestions((prev) => [...prev, created]);
      setActiveQuestionId(created.id);
    } catch (err: any) {
      alert(err.message || "Failed to duplicate question.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    setIsSaving(true);
    try {
      await questionsApi.delete(id);
      const remaining = questions.filter((q) => q.id !== id);
      setQuestions(remaining);
      if (activeQuestionId === id) {
        setActiveQuestionId(remaining.length > 0 ? remaining[0].id : null);
      }
    } catch (err: any) {
      alert(err.message || "Failed to delete question.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReorderQuestions = async (reordered: Question[]) => {
    setQuestions(reordered);
    if (!form) return;
    setIsSaving(true);

    const items = reordered.map((q, idx) => ({ id: q.id, position: idx }));
    try {
      await questionsApi.reorder(form.id, items);
    } catch (err: any) {
      console.error("Failed to persist reorder:", err);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (unauthorizedError || !form) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6 text-white font-sans">
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 max-w-md w-full text-center space-y-4 shadow-2xl">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Form Unavailable</h2>
            <p className="text-xs text-zinc-400 mt-1">
              {unauthorizedError || "You do not have permission to view or edit this form."}
            </p>
          </div>
          <Link
            href="/forms"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs py-3 px-5 rounded-xl transition-all shadow-md shadow-indigo-600/20"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col overflow-hidden">
      {/* Builder Top Navigation Header */}
      <BuilderHeader
        form={form}
        onUpdateForm={(updated) => setForm(updated)}
        isSaving={isSaving}
      />

      {/* Main 3-Column Studio Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column: Question Outline List */}
        <QuestionListPanel
          questions={questions}
          activeQuestionId={activeQuestionId}
          onSelectQuestion={(id) => setActiveQuestionId(id)}
          onAddQuestion={(type) => handleAddQuestion(type)}
        />

        {/* Center Canvas: Drag-and-Drop Sortable Questions */}
        <BuilderCanvas
          questions={questions}
          activeQuestionId={activeQuestionId}
          onSelectQuestion={(id) => setActiveQuestionId(id)}
          onReorderQuestions={handleReorderQuestions}
          onDuplicateQuestion={handleDuplicateQuestion}
          onDeleteQuestion={handleDeleteQuestion}
          onAddQuestion={() => handleAddQuestion("short_text")}
        />

        {/* Right Column: Question Settings Inspector */}
        <QuestionSettingsPanel
          question={activeQuestion}
          onUpdateQuestion={handleUpdateQuestion}
        />
      </div>
    </div>
  );
}
