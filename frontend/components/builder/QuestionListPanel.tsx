"use client";

import React, { useState } from "react";
import { Question, QuestionType } from "@/types";
import { QUESTION_TYPES, getQuestionConfig } from "../questions/questionRegistry";
import { Plus, GripVertical, Sparkles } from "lucide-react";

interface QuestionListPanelProps {
  questions: Question[];
  activeQuestionId: string | null;
  onSelectQuestion: (id: string) => void;
  onAddQuestion: (type: QuestionType) => void;
}

export const QuestionListPanel: React.FC<QuestionListPanelProps> = ({
  questions,
  activeQuestionId,
  onSelectQuestion,
  onAddQuestion,
}) => {
  const [showAddMenu, setShowAddMenu] = useState(false);

  return (
    <div className="w-64 md:w-72 bg-zinc-950 border-r border-zinc-800 flex flex-col h-[calc(100vh-4rem)] select-none">
      {/* Top Add Question Header */}
      <div className="p-4 border-b border-zinc-800 relative">
        <button
          onClick={() => setShowAddMenu(!showAddMenu)}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 px-4 rounded-xl text-sm transition-all shadow-md shadow-indigo-600/20"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add Question</span>
        </button>

        {/* Add Question Dropdown Menu */}
        {showAddMenu && (
          <div className="absolute top-16 left-4 right-4 bg-zinc-900 border border-zinc-700/80 rounded-2xl shadow-2xl p-2 z-50 max-h-96 overflow-y-auto divide-y divide-zinc-800/60">
            <div className="px-2 py-1.5 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
              Select Question Type
            </div>
            <div className="pt-1 space-y-1">
              {QUESTION_TYPES.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.type}
                    onClick={() => {
                      onAddQuestion(item.type);
                      setShowAddMenu(false);
                    }}
                    className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-zinc-800 text-left transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-zinc-800 group-hover:bg-indigo-600/20 text-zinc-300 group-hover:text-indigo-400 flex items-center justify-center transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-zinc-200 group-hover:text-white">
                        {item.label}
                      </div>
                      <div className="text-[10px] text-zinc-400 line-clamp-1">
                        {item.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Question Outline List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
        <div className="px-2 py-1 text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
          Form Questions ({questions.length})
        </div>

        {questions.length === 0 ? (
          <div className="p-6 text-center text-xs text-zinc-400 border border-dashed border-zinc-800 rounded-2xl mt-4">
            No questions added yet. Click "+ Add Question" to start.
          </div>
        ) : (
          questions.map((q, index) => {
            const config = getQuestionConfig(q.type);
            const Icon = config.icon;
            const isActive = q.id === activeQuestionId;

            return (
              <button
                key={q.id}
                onClick={() => onSelectQuestion(q.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all group ${
                  isActive
                    ? "bg-indigo-600/15 border border-indigo-500/50 text-white shadow-sm"
                    : "bg-zinc-900/40 border border-zinc-800/60 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                }`}
              >
                <span className="text-xs font-bold text-zinc-400 w-4 text-center">
                  {index + 1}
                </span>

                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs ${
                    isActive
                      ? "bg-indigo-600 text-white"
                      : "bg-zinc-800 text-zinc-400 group-hover:bg-zinc-700 group-hover:text-zinc-200"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold truncate">{q.title || "Untitled Question"}</div>
                  <div className="text-[10px] text-zinc-400 font-medium">
                    {config.label} {q.required && "• Required"}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};
