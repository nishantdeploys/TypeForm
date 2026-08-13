"use client";

import React, { useState } from "react";
import { Question, QuestionType } from "@/types";
import { QUESTION_TYPES, getQuestionConfig } from "../questions/questionRegistry";
import { Plus, Search, Sparkles } from "lucide-react";

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
  const [filterQuery, setFilterQuery] = useState("");

  const filteredQuestions = questions.filter((q) =>
    q.title.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <div className="w-64 md:w-72 bg-zinc-950 border-r border-zinc-900 flex flex-col h-[calc(100vh-3.5rem)] select-none font-sans">
      {/* Top Add Question Header */}
      <div className="p-3.5 border-b border-zinc-900 relative">
        <button
          onClick={() => setShowAddMenu(!showAddMenu)}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 px-3 rounded-xl text-xs transition-all shadow-sm"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Question</span>
        </button>

        {/* Add Question Dropdown Menu */}
        {showAddMenu && (
          <div className="absolute top-14 left-3.5 right-3.5 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-2 z-50 max-h-96 overflow-y-auto divide-y divide-zinc-800/60">
            <div className="px-2 py-1 text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
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
                    className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-zinc-800 text-left transition-colors group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-zinc-800 group-hover:bg-indigo-600/20 text-zinc-400 group-hover:text-indigo-400 flex items-center justify-center transition-colors">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-zinc-200 group-hover:text-white">
                        {item.label}
                      </div>
                      <div className="text-[10px] text-zinc-500 line-clamp-1">
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

      {/* Filter Question Search Box */}
      {questions.length > 3 && (
        <div className="px-3 pt-3 pb-1">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Filter questions..."
              className="w-full bg-zinc-900/60 border border-zinc-800/80 rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-white outline-none focus:border-indigo-500/80 placeholder:text-zinc-600"
            />
          </div>
        </div>
      )}

      {/* Question Outline List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        <div className="px-2 py-1 text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-1">
          Questions ({filteredQuestions.length})
        </div>

        {filteredQuestions.length === 0 ? (
          <div className="p-4 text-center text-xs text-zinc-500 border border-dashed border-zinc-900 rounded-xl mt-2">
            No questions match filter.
          </div>
        ) : (
          filteredQuestions.map((q, index) => {
            const config = getQuestionConfig(q.type);
            const Icon = config.icon;
            const isActive = q.id === activeQuestionId;

            return (
              <button
                key={q.id}
                onClick={() => onSelectQuestion(q.id)}
                className={`w-full flex items-center gap-2.5 p-2.5 rounded-xl text-left transition-all group ${
                  isActive
                    ? "bg-indigo-600/15 border border-indigo-500/40 text-white shadow-sm"
                    : "bg-zinc-900/30 border border-zinc-900 text-zinc-300 hover:bg-zinc-800/80 hover:text-white"
                }`}
              >
                <span className="text-[11px] font-mono font-bold text-zinc-500 w-3 text-center">
                  {index + 1}
                </span>

                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs ${
                    isActive
                      ? "bg-indigo-600 text-white"
                      : "bg-zinc-800 text-zinc-400 group-hover:bg-zinc-700 group-hover:text-zinc-200"
                  }`}
                >
                  <Icon className="w-3 h-3" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold truncate">{q.title || "Untitled Question"}</div>
                  <div className="text-[10px] text-zinc-500 font-medium">
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
