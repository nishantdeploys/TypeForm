"use client";

import React, { useState, useEffect } from "react";
import { Question, QuestionType, QuestionOption } from "@/types";
import { QUESTION_TYPES, getQuestionConfig } from "../questions/questionRegistry";
import { Plus, Trash2, Settings, HelpCircle, Star } from "lucide-react";

interface QuestionSettingsPanelProps {
  question: Question | null;
  onUpdateQuestion: (updated: Partial<Question>) => void;
}

export const QuestionSettingsPanel: React.FC<QuestionSettingsPanelProps> = ({
  question,
  onUpdateQuestion,
}) => {
  if (!question) {
    return (
      <div className="w-80 bg-zinc-950 border-l border-zinc-800 p-6 flex flex-col items-center justify-center text-center text-zinc-400 select-none">
        <Settings className="w-10 h-10 mb-3 stroke-[1.5] text-zinc-700" />
        <p className="text-sm font-medium">Select a question to inspect and edit settings.</p>
      </div>
    );
  }

  const [title, setTitle] = useState(question.title);
  const [description, setDescription] = useState(question.description || "");
  const [required, setRequired] = useState(question.required);
  const [options, setOptions] = useState<QuestionOption[]>(question.options || []);

  let ratingSettings = { max_rating: 5, min_label: "Poor", max_label: "Excellent" };
  try {
    if (question.settings_json) {
      ratingSettings = { ...ratingSettings, ...JSON.parse(question.settings_json) };
    }
  } catch (err) {}

  const [ratingMax, setRatingMax] = useState(ratingSettings.max_rating);
  const [ratingMinLabel, setRatingMinLabel] = useState(ratingSettings.min_label);
  const [ratingMaxLabel, setRatingMaxLabel] = useState(ratingSettings.max_label);

  useEffect(() => {
    setTitle(question.title);
    setDescription(question.description || "");
    setRequired(question.required);
    setOptions(question.options || []);

    let parsed = { max_rating: 5, min_label: "Poor", max_label: "Excellent" };
    try {
      if (question.settings_json) {
        parsed = { ...parsed, ...JSON.parse(question.settings_json) };
      }
    } catch (err) {}
    setRatingMax(parsed.max_rating);
    setRatingMinLabel(parsed.min_label);
    setRatingMaxLabel(parsed.max_label);
  }, [question.id]);

  const handleTitleBlur = () => {
    if (title !== question.title) {
      onUpdateQuestion({ title });
    }
  };

  const handleDescriptionBlur = () => {
    if (description !== (question.description || "")) {
      onUpdateQuestion({ description });
    }
  };

  const handleRequiredToggle = (val: boolean) => {
    setRequired(val);
    onUpdateQuestion({ required: val });
  };

  const handleTypeChange = (newType: QuestionType) => {
    const config = getQuestionConfig(newType);
    const updates: Partial<Question> = { type: newType };

    if (newType === "multiple_choice" || newType === "dropdown") {
      if (options.length === 0) {
        updates.options = config.defaultOptions || [
          { label: "Option 1", value: "option_1" },
          { label: "Option 2", value: "option_2" },
        ];
      }
    }

    onUpdateQuestion(updates);
  };

  const handleAddOption = () => {
    const nextIdx = options.length + 1;
    const newOpt: QuestionOption = {
      label: `Option ${nextIdx}`,
      value: `option_${nextIdx}`,
      position: options.length,
    };
    const updated = [...options, newOpt];
    setOptions(updated);
    onUpdateQuestion({ options: updated });
  };

  const handleUpdateOption = (index: number, newLabel: string) => {
    const updated = options.map((opt, idx) =>
      idx === index ? { ...opt, label: newLabel, value: newLabel ? newLabel.toLowerCase().replace(/\s+/g, "_") : newLabel } : opt
    );
    setOptions(updated);
    onUpdateQuestion({ options: updated });
  };

  const handleDeleteOption = (index: number) => {
    const updated = options.filter((_, idx) => idx !== index);
    setOptions(updated);
    onUpdateQuestion({ options: updated });
  };

  const handleSaveRatingSettings = () => {
    const jsonStr = JSON.stringify({
      max_rating: ratingMax,
      min_label: ratingMinLabel,
      max_label: ratingMaxLabel,
    });
    onUpdateQuestion({ settings_json: jsonStr });
  };

  const currentConfig = getQuestionConfig(question.type);

  return (
    <div className="w-80 md:w-96 bg-zinc-950 border-l border-zinc-800 flex flex-col h-[calc(100vh-4rem)] select-none">
      {/* Header */}
      <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Settings className="w-4 h-4 text-indigo-400" />
          <span>Question Settings</span>
        </h2>
      </div>

      {/* Form Settings Controls */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {/* Question Type Selector */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
            Question Type
          </label>
          <select
            value={question.type}
            onChange={(e) => handleTypeChange(e.target.value as QuestionType)}
            className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl p-3 text-sm font-semibold text-white outline-none focus:border-indigo-500 transition-colors"
          >
            {QUESTION_TYPES.map((typeObj) => (
              <option key={typeObj.type} value={typeObj.type}>
                {typeObj.label}
              </option>
            ))}
          </select>
        </div>

        {/* Title Input */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
            Question Title
          </label>
          <textarea
            rows={2}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleBlur}
            placeholder="Type question title..."
            className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl p-3 text-sm font-medium text-white outline-none focus:border-indigo-500 transition-colors resize-none"
          />
        </div>

        {/* Description / Help Text */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-zinc-400" />
            <span>Description / Help Text</span>
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={handleDescriptionBlur}
            placeholder="Add optional instructions or context..."
            className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl p-3 text-xs font-medium text-white outline-none focus:border-indigo-500 transition-colors resize-none"
          />
        </div>

        {/* Required Toggle */}
        <div className="pt-2 border-t border-zinc-800 flex items-center justify-between">
          <div>
            <div className="text-sm font-bold text-white">Required Question</div>
            <div className="text-xs text-zinc-400">Respondents must answer before advancing</div>
          </div>
          <button
            type="button"
            onClick={() => handleRequiredToggle(!required)}
            className={`w-12 h-6 rounded-full transition-colors relative ${
              required ? "bg-indigo-600" : "bg-zinc-800"
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                required ? "left-6" : "left-0.5"
              }`}
            />
          </button>
        </div>

        {/* Question Type Options Editor for Multiple Choice / Dropdown */}
        {(question.type === "multiple_choice" || question.type === "dropdown") && (
          <div className="pt-4 border-t border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                Choices / Options
              </label>
              <button
                type="button"
                onClick={handleAddOption}
                className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Choice</span>
              </button>
            </div>

            <div className="space-y-2">
              {options.map((opt, idx) => (
                <div key={opt.id || idx} className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-zinc-400 w-5">
                    {idx + 1}.
                  </span>
                  <input
                    type="text"
                    value={opt.label}
                    onChange={(e) => handleUpdateOption(idx, e.target.value)}
                    placeholder={`Option ${idx + 1}`}
                    className="flex-1 bg-zinc-900 border border-zinc-700/80 rounded-xl px-3 py-2 text-xs font-medium text-white outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteOption(idx)}
                    disabled={options.length <= 1}
                    className="p-2 rounded-lg text-zinc-400 hover:text-rose-400 disabled:opacity-30 hover:bg-zinc-800 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Type-Specific Settings for Rating Scale */}
        {question.type === "rating" && (
          <div className="pt-4 border-t border-zinc-800 space-y-4">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 text-amber-400" />
              <span>Rating Scale Configuration</span>
            </label>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-zinc-400 font-medium">Max Rating Steps</label>
                <select
                  value={ratingMax}
                  onChange={(e) => {
                    const max = parseInt(e.target.value);
                    setRatingMax(max);
                    onUpdateQuestion({
                      settings_json: JSON.stringify({
                        max_rating: max,
                        min_label: ratingMinLabel,
                        max_label: ratingMaxLabel,
                      }),
                    });
                  }}
                  className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl p-2.5 text-xs font-semibold text-white outline-none mt-1"
                >
                  <option value={3}>1 to 3</option>
                  <option value={5}>1 to 5</option>
                  <option value={7}>1 to 7</option>
                  <option value={10}>1 to 10</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-zinc-400 font-medium">Low Rating Label (1)</label>
                <input
                  type="text"
                  value={ratingMinLabel}
                  onChange={(e) => setRatingMinLabel(e.target.value)}
                  onBlur={handleSaveRatingSettings}
                  placeholder="e.g. Poor"
                  className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl p-2.5 text-xs font-medium text-white outline-none mt-1"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 font-medium">High Rating Label ({ratingMax})</label>
                <input
                  type="text"
                  value={ratingMaxLabel}
                  onChange={(e) => setRatingMaxLabel(e.target.value)}
                  onBlur={handleSaveRatingSettings}
                  placeholder="e.g. Excellent"
                  className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl p-2.5 text-xs font-medium text-white outline-none mt-1"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
