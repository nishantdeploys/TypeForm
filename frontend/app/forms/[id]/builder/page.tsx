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
import { Loader2 } from "lucide-react";

export default function FormBuilderPage() {
  const params = useParams();
  const router = useRouter();
  const formId = params.id as string;

  const [form, setForm] = useState<Form | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchFormDetails = async () => {
    setLoading(true);
    try {
      const data = await formsApi.getById(formId);
      setForm(data);
      const qs = data.questions || [];
      setQuestions(qs);
      if (qs.length > 0 && !activeQuestionId) {
        setActiveQuestionId(qs[0].id);
      }
    } catch (err) {
      console.error("Failed to load form builder:", err);
      router.push("/forms");
    } fontFinally: {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (formId) {
      fetchFormDetails();
    }
  }, [formId]);

  // Fix typo in try-catch: finally instead of fontFinally
  const loadData = async () => {
    setLoading(true);
    try {
      const data = await formsApi.getById(formId);
      setForm(data);
      const qs = data.questions || [];
      setQuestions(qs);
      if (qs.length > 0 && !activeQuestionId) {
        setActiveQuestionId(qs[0].id);
      }
    } catch (err) {
      console.error("Failed to load form builder:", err);
      router.push("/forms");
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

  if (loading || !form) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
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
