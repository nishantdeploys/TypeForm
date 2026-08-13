"use client";

import React from "react";
import { motion } from "framer-motion";
import { Question } from "@/types";
import { QuestionInput } from "../questions/QuestionInput";
import { ArrowRight, Check } from "lucide-react";

interface RespondentQuestionProps {
  question: Question;
  currentIndex: number;
  totalQuestions: number;
  value: { text?: string; number?: number; json?: string };
  onChange: (val: { text?: string; number?: number; json?: string }) => void;
  onNext: () => void;
  error?: string | null;
  direction?: number;
}

const variants = {
  enter: (direction: number) => ({
    y: direction > 0 ? 40 : -40,
    opacity: 0,
  }),
  center: {
    y: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    y: direction < 0 ? 40 : -40,
    opacity: 0,
  }),
};

export const RespondentQuestion: React.FC<RespondentQuestionProps> = ({
  question,
  currentIndex,
  totalQuestions,
  value,
  onChange,
  onNext,
  error,
  direction = 1,
}) => {
  return (
    <motion.div
      key={question.id}
      custom={direction}
      variants={variants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-2xl mx-auto px-4 md:px-6 py-8 flex flex-col justify-center min-h-[60vh]"
    >
      {/* Question Number Badge */}
      <div className="flex items-center gap-2 mb-4 text-xs md:text-sm font-semibold tracking-wider text-indigo-400 uppercase">
        <span className="flex items-center gap-1 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full">
          <span>{currentIndex + 1}</span>
          <ArrowRight className="w-3 h-3 text-indigo-400 inline" />
        </span>
        {question.required && (
          <span className="text-amber-400/90 text-xs font-normal">Required</span>
        )}
      </div>

      {/* Question Title */}
      <h2 className="text-2xl md:text-4xl font-bold text-white tracking-tight leading-tight mb-3">
        {question.title}
      </h2>

      {/* Question Description */}
      {question.description && (
        <p className="text-base md:text-xl text-zinc-400 font-normal mb-8 leading-relaxed">
          {question.description}
        </p>
      )}

      {/* Interactive Input Component */}
      <div className="my-4">
        <QuestionInput
          question={question}
          value={value}
          onChange={onChange}
          onSubmit={onNext}
          error={error}
        />
      </div>

      {/* Error Message Tooltip */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 text-sm font-medium text-rose-400 bg-rose-500/10 border border-rose-500/20 px-4 py-2 rounded-xl inline-flex items-center gap-2 w-fit"
        >
          <span>⚠️ {error}</span>
        </motion.div>
      )}

      {/* OK / Continue Button & Keyboard Hint */}
      <div className="mt-8 flex items-center gap-4">
        <button
          type="button"
          onClick={onNext}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-3.5 rounded-2xl shadow-lg shadow-indigo-600/25 transition-all transform active:scale-95"
        >
          <span>OK</span>
          <Check className="w-5 h-5 stroke-[2.5]" />
        </button>
        <span className="text-xs text-zinc-400 font-medium hidden sm:inline">
          press <kbd className="bg-zinc-800 border border-zinc-700 text-zinc-300 px-2 py-0.5 rounded text-[11px] font-mono">Enter ↵</kbd>
        </span>
      </div>
    </motion.div>
  );
};
