"use client";

import React from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Question } from "@/types";
import { QuestionCard } from "./QuestionCard";
import { Plus } from "lucide-react";

interface BuilderCanvasProps {
  questions: Question[];
  activeQuestionId: string | null;
  onSelectQuestion: (id: string) => void;
  onReorderQuestions: (reordered: Question[]) => void;
  onDuplicateQuestion: (id: string) => void;
  onDeleteQuestion: (id: string) => void;
  onAddQuestion: () => void;
}

export const BuilderCanvas: React.FC<BuilderCanvasProps> = ({
  questions,
  activeQuestionId,
  onSelectQuestion,
  onReorderQuestions,
  onDuplicateQuestion,
  onDeleteQuestion,
  onAddQuestion,
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = questions.findIndex((q) => q.id === active.id);
      const newIndex = questions.findIndex((q) => q.id === over.id);

      const newOrder = arrayMove(questions, oldIndex, newIndex).map((q, idx) => ({
        ...q,
        position: idx,
      }));

      onReorderQuestions(newOrder);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-zinc-950 p-6 md:p-10 flex flex-col items-center">
      <div className="w-full max-w-3xl space-y-6 pb-20">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={questions.map((q) => q.id)}
            strategy={verticalListSortingStrategy}
          >
            {questions.map((q, idx) => (
              <QuestionCard
                key={q.id}
                question={q}
                index={idx}
                isActive={q.id === activeQuestionId}
                onSelect={() => onSelectQuestion(q.id)}
                onDuplicate={() => onDuplicateQuestion(q.id)}
                onDelete={() => onDeleteQuestion(q.id)}
              />
            ))}
          </SortableContext>
        </DndContext>

        {/* Bottom Add Question Button */}
        <button
          onClick={onAddQuestion}
          className="w-full py-5 border-2 border-dashed border-zinc-800 hover:border-indigo-500/60 rounded-2xl flex items-center justify-center gap-2 text-zinc-400 hover:text-indigo-400 transition-all group"
        >
          <div className="w-8 h-8 rounded-full bg-zinc-900 group-hover:bg-indigo-600/20 flex items-center justify-center transition-colors">
            <Plus className="w-4 h-4" />
          </div>
          <span className="text-sm font-bold">Add Question</span>
        </button>
      </div>
    </div>
  );
};
