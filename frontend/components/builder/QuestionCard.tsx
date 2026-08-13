"use client";

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Question } from "@/types";
import { getQuestionConfig } from "../questions/questionRegistry";
import { QuestionInput } from "../questions/QuestionInput";
import { GripVertical, Copy, Trash2, Asterisk } from "lucide-react";

interface QuestionCardProps {
  question: Question;
  index: number;
  isActive: boolean;
  onSelect: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  index,
  isActive,
  onSelect,
  onDuplicate,
  onDelete,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const config = getQuestionConfig(question.type);
  const Icon = config.icon;

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onSelect}
      className={`w-full rounded-2xl border p-6 transition-all relative group bg-zinc-900/60 backdrop-blur-md cursor-pointer ${
        isDragging
          ? "opacity-40 border-indigo-500 scale-[0.98] shadow-2xl"
          : isActive
          ? "border-indigo-500/80 ring-2 ring-indigo-500/20 shadow-xl shadow-indigo-500/5"
          : "border-zinc-800/80 hover:border-zinc-700"
      }`}
    >
      {/* Top Bar: Drag Handle, Number, Icon, Badges, Actions */}
      <div className="flex items-center justify-between gap-3 mb-4 select-none">
        <div className="flex items-center gap-3">
          {/* Drag Handle */}
          <button
            type="button"
            {...attributes}
            {...listeners}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-grab active:cursor-grabbing transition-colors"
            title="Drag to reorder question"
          >
            <GripVertical className="w-5 h-5" />
          </button>

          {/* Question Index Badge */}
          <span className="text-sm font-bold text-indigo-400">#{index + 1}</span>

          {/* Type Badge */}
          <div className="flex items-center gap-1.5 bg-zinc-800/80 border border-zinc-700/50 px-2.5 py-1 rounded-full text-xs font-semibold text-zinc-300">
            <Icon className="w-3.5 h-3.5 text-indigo-400" />
            <span>{config.label}</span>
          </div>

          {/* Required Badge */}
          {question.required && (
            <span className="flex items-center gap-0.5 text-[11px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
              <Asterisk className="w-3 h-3" />
              <span>Required</span>
            </span>
          )}
        </div>

        {/* Question Quick Actions: Duplicate & Delete */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate();
            }}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            title="Duplicate question"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-2 rounded-xl text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            title="Delete question"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Question Content Canvas Preview */}
      <div className="pointer-events-none">
        <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
          {question.title || <span className="text-zinc-400 italic">Untitled Question</span>}
        </h3>
        {question.description && (
          <p className="text-sm text-zinc-400 mb-4">{question.description}</p>
        )}

        {/* Live Input Component Preview */}
        <div className="mt-4 opacity-90">
          <QuestionInput
            question={question}
            value={{}}
            onChange={() => {}}
            autoFocus={false}
          />
        </div>
      </div>
    </div>
  );
};
