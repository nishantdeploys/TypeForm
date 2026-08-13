"use client";

import React, { useState, useEffect } from "react";
import { ResponseDetail } from "@/types";
import { responsesApi } from "@/lib/api/responses";
import { X, Clock, Calendar, FileText, CheckCircle } from "lucide-react";

interface ResponseDetailModalProps {
  formId: string;
  responseId: string | null;
  onClose: () => void;
}

export const ResponseDetailModal: React.FC<ResponseDetailModalProps> = ({
  formId,
  responseId,
  onClose,
}) => {
  const [detail, setDetail] = useState<ResponseDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (responseId) {
      setLoading(true);
      responsesApi
        .getDetail(formId, responseId)
        .then((data) => setDetail(data))
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [formId, responseId]);

  if (!responseId) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Submission Detail</h3>
              <p className="text-xs text-zinc-400 font-mono">ID: {responseId}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="py-12 text-center text-zinc-400">Loading submission details...</div>
          ) : detail ? (
            <>
              {/* Submission Metadata Bar */}
              <div className="grid grid-cols-2 gap-4 bg-zinc-950 p-4 rounded-2xl border border-zinc-800">
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-indigo-400" />
                  <div>
                    <div className="text-[11px] text-zinc-400 font-bold uppercase tracking-wider">
                      Submitted At
                    </div>
                    <div className="text-xs font-semibold text-zinc-200">
                      {new Date(detail.submitted_at).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-indigo-400" />
                  <div>
                    <div className="text-[11px] text-zinc-400 font-bold uppercase tracking-wider">
                      Time Taken
                    </div>
                    <div className="text-xs font-semibold text-zinc-200">
                      {detail.completion_time ? `${detail.completion_time}s` : "N/A"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Answers Transcript */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  Submitted Answers ({detail.answers.length})
                </h4>

                <div className="space-y-3">
                  {detail.answers.map((ans, idx) => (
                    <div
                      key={ans.id || idx}
                      className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800/80 space-y-2"
                    >
                      <div className="text-xs font-bold text-indigo-400 flex items-center justify-between">
                        <span>
                          Q{idx + 1}. {ans.question_title}
                        </span>
                        <span className="text-[10px] text-zinc-400 uppercase font-mono">
                          {ans.question_type}
                        </span>
                      </div>

                      <div className="text-base font-semibold text-white pl-2 border-l-2 border-indigo-500">
                        {ans.answer_text ||
                          (ans.answer_number !== null && ans.answer_number !== undefined
                            ? ans.answer_number
                            : ans.answer_json || <span className="text-zinc-600 italic">No answer provided</span>)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="py-12 text-center text-zinc-400">Failed to load submission details.</div>
          )}
        </div>
      </div>
    </div>
  );
};
