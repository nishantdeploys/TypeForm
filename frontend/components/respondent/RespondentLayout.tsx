"use client";

import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Form } from "@/types";
import { RespondentQuestion } from "./RespondentQuestion";
import { ThankYouScreen } from "./ThankYouScreen";
import { ChevronUp, ChevronDown, Sparkles } from "lucide-react";

interface RespondentLayoutProps {
  form: Form;
  onSubmit: (answers: Record<string, { text?: string; number?: number; json?: string }>, timeTakenSec: number) => Promise<void>;
  isPreview?: boolean;
}

export const RespondentLayout: React.FC<RespondentLayoutProps> = ({
  form,
  onSubmit,
  isPreview = false,
}) => {
  const questions = form.questions || [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [answers, setAnswers] = useState<Record<string, { text?: string; number?: number; json?: string }>>({});
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startTime] = useState<number>(Date.now());

  const currentQuestion = questions[currentIndex];
  const progressPercent = questions.length > 0 ? Math.round(((currentIndex + 1) / questions.length) * 100) : 0;

  const validateCurrentQuestion = (): boolean => {
    if (!currentQuestion) return true;
    const ans = answers[currentQuestion.id];

    if (currentQuestion.required) {
      if (!ans || (!ans.text && ans.number === undefined && !ans.json)) {
        setErrors((prev) => ({ ...prev, [currentQuestion.id]: "Please complete this required question before continuing." }));
        return false;
      }
      if (ans.text !== undefined && ans.text.trim() === "") {
        setErrors((prev) => ({ ...prev, [currentQuestion.id]: "Please complete this required question before continuing." }));
        return false;
      }
    }

    if (currentQuestion.type === "email" && ans?.text && ans.text.trim() !== "") {
      const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
      if (!emailRegex.test(ans.text.trim())) {
        setErrors((prev) => ({ ...prev, [currentQuestion.id]: "Please enter a valid email address (e.g. name@example.com)." }));
        return false;
      }
    }

    setErrors((prev) => ({ ...prev, [currentQuestion.id]: null }));
    return true;
  };

  const handleNext = async () => {
    if (!validateCurrentQuestion()) return;

    if (currentIndex < questions.length - 1) {
      setDirection(1);
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Submit form
      setIsSubmitting(true);
      const elapsedSec = Math.max(1, Math.round((Date.now() - startTime) / 1000));
      try {
        await onSubmit(answers, elapsedSec);
        setIsSubmitted(true);
      } catch (err: any) {
        setErrors((prev) => ({
          ...prev,
          [currentQuestion.id]: err.message || "Failed to submit response. Please try again.",
        }));
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex((prev) => prev - 1);
    }
  };

  // Global Keyboard Navigation
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (isSubmitted) return;

      if (e.key === "ArrowUp") {
        e.preventDefault();
        handlePrev();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        handleNext();
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [currentIndex, answers, isSubmitted]);

  if (isSubmitted) {
    return (
      <ThankYouScreen
        formTitle={form.title}
        isPreview={isPreview}
        onRestart={() => {
          setAnswers({});
          setCurrentIndex(0);
          setIsSubmitted(false);
        }}
      />
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-center text-white">
        <p className="text-xl text-zinc-400">This form currently has no questions.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-zinc-950 text-white flex flex-col justify-between relative overflow-hidden select-none">
      {/* Background Decorative Glow */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-indigo-600/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-purple-600/10 blur-[130px] rounded-full pointer-events-none" />

      {/* Top Header & Progress Indicator */}
      <header className="w-full px-6 py-5 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-600/30">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-semibold text-zinc-300 text-sm tracking-wide line-clamp-1">
            {form.title}
          </span>
        </div>

        {/* Progress Fraction & Bar */}
        <div className="flex items-center gap-4">
          {isPreview && (
            <span className="bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full">
              Preview Mode
            </span>
          )}
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-zinc-400">
              {currentIndex + 1} of {questions.length}
            </span>
            <div className="w-24 md:w-36 h-2 bg-zinc-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-indigo-500 rounded-full"
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Center Question View with Framer Motion */}
      <main className="flex-1 flex items-center justify-center relative z-10">
        <AnimatePresence custom={direction} mode="wait">
          {currentQuestion && (
            <RespondentQuestion
              key={currentQuestion.id}
              question={currentQuestion}
              currentIndex={currentIndex}
              totalQuestions={questions.length}
              value={answers[currentQuestion.id] || {}}
              onChange={(val) => setAnswers((prev) => ({ ...prev, [currentQuestion.id]: val }))}
              onNext={handleNext}
              error={errors[currentQuestion.id]}
              direction={direction}
            />
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Floating Footer Navigation */}
      <footer className="w-full px-6 py-4 flex items-center justify-between z-20 border-t border-zinc-900/60 bg-zinc-950/80 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-zinc-900 border border-zinc-800 text-zinc-300 transition-colors"
            title="Previous question (Up arrow)"
          >
            <ChevronUp className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={handleNext}
            disabled={isSubmitting}
            className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 transition-colors"
            title="Next question (Down arrow)"
          >
            <ChevronDown className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-400 font-mono hidden sm:inline">Powered by Typeform Clone</span>
        </div>
      </footer>
    </div>
  );
};
