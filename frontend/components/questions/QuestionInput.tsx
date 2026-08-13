"use client";

import React, { useEffect, useRef } from "react";
import { Question } from "@/types";
import { Check, Star } from "lucide-react";

interface QuestionInputProps {
  question: Question;
  value: { text?: string; number?: number; json?: string };
  onChange: (val: { text?: string; number?: number; json?: string }) => void;
  onSubmit?: () => void;
  error?: string | null;
  autoFocus?: boolean;
}

export const QuestionInput: React.FC<QuestionInputProps> = ({
  question,
  value,
  onChange,
  onSubmit,
  error,
  autoFocus = true,
}) => {
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus, question.id]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      if (question.type !== "long_text") {
        e.preventDefault();
        onSubmit?.();
      }
    }
  };

  switch (question.type) {
    case "short_text":
      return (
        <div className="w-full">
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="text"
            value={value.text || ""}
            onChange={(e) => onChange({ text: e.target.value })}
            onKeyDown={handleKeyDown}
            placeholder="Type your answer here..."
            className="w-full bg-transparent border-b-2 border-zinc-700 focus:border-indigo-500 text-2xl md:text-3xl font-medium text-white pb-3 outline-none transition-colors placeholder:text-zinc-600"
          />
        </div>
      );

    case "long_text":
      return (
        <div className="w-full">
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            rows={4}
            value={value.text || ""}
            onChange={(e) => onChange({ text: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                onSubmit?.();
              }
            }}
            placeholder="Type your detailed answer here... (Ctrl+Enter to advance)"
            className="w-full bg-zinc-900/60 border border-zinc-800 focus:border-indigo-500 rounded-xl p-4 text-xl md:text-2xl font-medium text-white outline-none transition-colors placeholder:text-zinc-600 resize-none"
          />
          <p className="mt-2 text-xs text-zinc-400">Shift+Enter for new line. Ctrl+Enter to submit.</p>
        </div>
      );

    case "email":
      return (
        <div className="w-full">
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="email"
            value={value.text || ""}
            onChange={(e) => onChange({ text: e.target.value })}
            onKeyDown={handleKeyDown}
            placeholder="name@example.com"
            className="w-full bg-transparent border-b-2 border-zinc-700 focus:border-indigo-500 text-2xl md:text-3xl font-medium text-white pb-3 outline-none transition-colors placeholder:text-zinc-600"
          />
        </div>
      );

    case "number":
      return (
        <div className="w-full">
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="number"
            value={value.number !== undefined ? value.number : value.text || ""}
            onChange={(e) => {
              const val = e.target.value;
              onChange({ text: val, number: val === "" ? undefined : parseFloat(val) });
            }}
            onKeyDown={handleKeyDown}
            placeholder="0"
            className="w-full bg-transparent border-b-2 border-zinc-700 focus:border-indigo-500 text-2xl md:text-3xl font-medium text-white pb-3 outline-none transition-colors placeholder:text-zinc-600"
          />
        </div>
      );

    case "multiple_choice":
      const options = question.options || [];
      const keys = ["A", "B", "C", "D", "E", "F", "G", "H"];

      return (
        <div className="w-full space-y-3">
          {options.map((opt, idx) => {
            const isSelected = value.text === opt.label;
            const keyLabel = keys[idx] || (idx + 1).toString();

            return (
              <button
                key={opt.id || idx}
                type="button"
                onClick={() => {
                  onChange({ text: opt.label });
                  setTimeout(() => onSubmit?.(), 180);
                }}
                className={`w-full flex items-center justify-between p-4 md:p-5 rounded-2xl border text-left transition-all duration-200 group ${
                  isSelected
                    ? "bg-indigo-600/20 border-indigo-500 text-white shadow-lg shadow-indigo-500/10"
                    : "bg-zinc-900/40 border-zinc-800 text-zinc-200 hover:bg-zinc-800/60 hover:border-zinc-700"
                }`}
              >
                <div className="flex items-center gap-4">
                  <span
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold transition-colors ${
                      isSelected
                        ? "bg-indigo-600 text-white"
                        : "bg-zinc-800 text-zinc-400 group-hover:bg-zinc-700 group-hover:text-zinc-200"
                    }`}
                  >
                    {keyLabel}
                  </span>
                  <span className="text-xl md:text-2xl font-medium">{opt.label}</span>
                </div>
                {isSelected && (
                  <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-white">
                    <Check className="w-4 h-4" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      );

    case "dropdown":
      const dropOptions = question.options || [];

      return (
        <div className="w-full">
          <select
            ref={inputRef as React.RefObject<HTMLSelectElement>}
            value={value.text || ""}
            onChange={(e) => {
              onChange({ text: e.target.value });
              if (e.target.value) {
                setTimeout(() => onSubmit?.(), 200);
              }
            }}
            className="w-full bg-zinc-900 border-2 border-zinc-800 focus:border-indigo-500 rounded-2xl p-4 text-xl md:text-2xl font-medium text-white outline-none transition-colors"
          >
            <option value="" disabled className="text-zinc-600">
              Select an option...
            </option>
            {dropOptions.map((opt, idx) => (
              <option key={opt.id || idx} value={opt.label} className="bg-zinc-900 text-white">
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      );

    case "yes_no":
      return (
        <div className="w-full grid grid-cols-2 gap-4">
          {["Yes", "No"].map((choice, idx) => {
            const isSelected = value.text?.toLowerCase() === choice.toLowerCase();
            const keyLabel = idx === 0 ? "Y" : "N";

            return (
              <button
                key={choice}
                type="button"
                onClick={() => {
                  onChange({ text: choice });
                  setTimeout(() => onSubmit?.(), 180);
                }}
                className={`flex flex-col items-center justify-center p-6 md:p-8 rounded-2xl border transition-all duration-200 group ${
                  isSelected
                    ? "bg-indigo-600/20 border-indigo-500 text-white shadow-xl shadow-indigo-500/10"
                    : "bg-zinc-900/40 border-zinc-800 text-zinc-200 hover:bg-zinc-800/60 hover:border-zinc-700"
                }`}
              >
                <span
                  className={`w-10 h-10 rounded-xl mb-3 flex items-center justify-center text-base font-bold transition-colors ${
                    isSelected
                      ? "bg-indigo-600 text-white"
                      : "bg-zinc-800 text-zinc-400 group-hover:bg-zinc-700 group-hover:text-zinc-200"
                  }`}
                >
                  {keyLabel}
                </span>
                <span className="text-2xl md:text-3xl font-semibold">{choice}</span>
              </button>
            );
          })}
        </div>
      );

    case "rating":
      let settings = { max_rating: 5, min_label: "Poor", max_label: "Excellent" };
      try {
        if (question.settings_json) {
          settings = { ...settings, ...JSON.parse(question.settings_json) };
        }
      } catch (err) {}

      const maxRating = settings.max_rating || 5;
      const ratings = Array.from({ length: maxRating }, (_, i) => i + 1);

      return (
        <div className="w-full space-y-4">
          <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2">
            {ratings.map((score) => {
              const isSelected = value.number === score || value.text === score.toString();

              return (
                <button
                  key={score}
                  type="button"
                  onClick={() => {
                    onChange({ number: score, text: score.toString() });
                    setTimeout(() => onSubmit?.(), 180);
                  }}
                  className={`flex-1 min-w-[50px] h-16 md:h-20 rounded-2xl border flex flex-col items-center justify-center transition-all duration-200 group ${
                    isSelected
                      ? "bg-indigo-600 border-indigo-500 text-white shadow-xl shadow-indigo-600/30 scale-105"
                      : "bg-zinc-900/40 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:border-zinc-700"
                  }`}
                >
                  <Star
                    className={`w-5 h-5 mb-1 ${
                      isSelected ? "fill-white text-white" : "text-zinc-600 group-hover:text-amber-400"
                    }`}
                  />
                  <span className="text-xl md:text-2xl font-bold">{score}</span>
                </button>
              );
            })}
          </div>
          <div className="flex justify-between text-xs md:text-sm font-medium text-zinc-400 px-1">
            <span>{settings.min_label}</span>
            <span>{settings.max_label}</span>
          </div>
        </div>
      );

    default:
      return null;
  }
};
