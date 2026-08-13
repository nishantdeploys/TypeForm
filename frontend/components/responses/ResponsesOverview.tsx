"use client";

import React, { useState, useEffect } from "react";
import { Form, ResponseListItem, FormStats } from "@/types";
import { responsesApi } from "@/lib/api/responses";
import { ResponseDetailModal } from "./ResponseDetailModal";
import {
  Users,
  Clock,
  BarChart3,
  Eye,
  FileSpreadsheet,
  Calendar,
  CheckCircle2,
  Star,
  AlignLeft,
} from "lucide-react";
import Link from "next/link";

interface ResponsesOverviewProps {
  form: Form;
}

export const ResponsesOverview: React.FC<ResponsesOverviewProps> = ({ form }) => {
  const [responses, setResponses] = useState<ResponseListItem[]>([]);
  const [stats, setStats] = useState<FormStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedResponseId, setSelectedResponseId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      responsesApi.list(form.id),
      responsesApi.getStats(form.id),
    ])
      .then(([resData, statsData]) => {
        setResponses(resData);
        setStats(statsData);
      })
      .catch((err) => console.error("Error loading responses:", err))
      .finally(() => setLoading(false));
  }, [form.id]);

  const handleExportCSV = () => {
    if (responses.length === 0) return;

    // Collect all question titles
    const headers = ["Response ID", "Submitted At", "Time (s)"];
    const questionTitlesSet = new Set<string>();

    responses.forEach((r) => {
      Object.keys(r.preview_answers || {}).forEach((title) => questionTitlesSet.add(title));
    });

    const questionTitles = Array.from(questionTitlesSet);
    const fullHeaders = [...headers, ...questionTitles];

    const rows = responses.map((r) => {
      const base = [r.id, new Date(r.submitted_at).toLocaleString(), r.completion_time || ""];
      const answers = questionTitles.map((title) => `"${(r.preview_answers[title] || "").toString().replace(/"/g, '""')}"`);
      return [...base, ...answers].join(",");
    });

    const csvContent = "data:text/csv;charset=utf-8," + [fullHeaders.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${form.title.toLowerCase().replace(/\s+/g, "_")}_responses.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      {/* Top Header Bar */}
      <header className="h-16 border-b border-zinc-800 bg-zinc-950 px-6 flex items-center justify-between select-none">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-bold text-white">{form.title}</h1>
          <span className="bg-zinc-800 text-zinc-300 text-xs px-2.5 py-1 rounded-full font-medium">
            Results & Analytics
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-zinc-900/80 p-1 rounded-xl border border-zinc-800 flex items-center gap-1">
            <Link
              href={`/forms/${form.id}/builder`}
              className="px-3 py-1 text-xs font-medium text-zinc-400 hover:text-white transition-colors"
            >
              Builder
            </Link>
            <span className="px-3 py-1 text-xs font-semibold text-white bg-zinc-800 rounded-lg shadow-sm">
              Responses ({responses.length})
            </span>
          </div>

          <button
            onClick={handleExportCSV}
            disabled={responses.length === 0}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-md shadow-indigo-600/20"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-10 space-y-10">
        {/* Top Summary Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-6 flex items-center gap-4 backdrop-blur-md">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <Users className="w-7 h-7" />
            </div>
            <div>
              <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                Total Submissions
              </div>
              <div className="text-3xl font-extrabold text-white mt-1">
                {stats ? stats.total_responses : responses.length}
              </div>
            </div>
          </div>

          <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-6 flex items-center gap-4 backdrop-blur-md">
            <div className="w-14 h-14 rounded-2xl bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
              <Clock className="w-7 h-7" />
            </div>
            <div>
              <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                Avg Completion Time
              </div>
              <div className="text-3xl font-extrabold text-white mt-1">
                {stats?.avg_completion_time ? `${stats.avg_completion_time}s` : "N/A"}
              </div>
            </div>
          </div>

          <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-6 flex items-center gap-4 backdrop-blur-md">
            <div className="w-14 h-14 rounded-2xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                Completion Rate
              </div>
              <div className="text-3xl font-extrabold text-white mt-1">100%</div>
            </div>
          </div>
        </div>

        {/* Per-Question Analytics Breakdown */}
        {stats && stats.questions_stats.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-400" />
              <h2 className="text-xl font-bold text-white">Question Summary Stats</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {stats.questions_stats.map((qStat, idx) => (
                <div
                  key={qStat.question_id || idx}
                  className="bg-zinc-900/50 border border-zinc-800/80 rounded-3xl p-6 space-y-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-base font-bold text-white leading-snug">
                      <span className="text-indigo-400 mr-2">Q{idx + 1}.</span>
                      {qStat.title}
                    </h3>
                    <span className="text-[10px] font-mono font-bold bg-zinc-800 text-zinc-400 px-2 py-1 rounded-full uppercase">
                      {qStat.total_answers} answers
                    </span>
                  </div>

                  {/* Rating / Numeric Average */}
                  {qStat.average_number !== null && qStat.average_number !== undefined && (
                    <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 flex items-center justify-between">
                      <span className="text-xs font-semibold text-zinc-400">Average Rating / Score</span>
                      <div className="flex items-center gap-2">
                        <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                        <span className="text-2xl font-black text-white">{qStat.average_number}</span>
                      </div>
                    </div>
                  )}

                  {/* Multiple Choice / Dropdown / Yes_No Option Percentages */}
                  {qStat.options && qStat.options.length > 0 && (
                    <div className="space-y-3 pt-2">
                      {qStat.options.map((opt) => (
                        <div key={opt.value} className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold">
                            <span className="text-zinc-300">{opt.label}</span>
                            <span className="text-zinc-400">
                              {opt.count} ({opt.percentage}%)
                            </span>
                          </div>
                          <div className="w-full h-2 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800/60">
                            <div
                              className="h-full bg-indigo-600 rounded-full transition-all"
                              style={{ width: `${opt.percentage}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Text Samples List */}
                  {qStat.text_samples && qStat.text_samples.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                        <AlignLeft className="w-3.5 h-3.5" />
                        <span>Recent Text Answers</span>
                      </div>
                      <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                        {qStat.text_samples.map((sample, sIdx) => (
                          <div
                            key={sIdx}
                            className="text-xs text-zinc-300 bg-zinc-950 p-3 rounded-xl border border-zinc-800/80 italic"
                          >
                            "{sample}"
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Submissions Data Table */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            <span>Individual Submissions ({responses.length})</span>
          </h2>

          {responses.length === 0 ? (
            <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-12 text-center text-zinc-400">
              No responses submitted yet. Publish your form and share the link to collect responses!
            </div>
          ) : (
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-950 border-b border-zinc-800 text-zinc-400 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="py-4 px-6">Submitted At</th>
                      <th className="py-4 px-6">Time Taken</th>
                      <th className="py-4 px-6">Answers Preview</th>
                      <th className="py-4 px-6 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60 font-medium">
                    {responses.map((resp) => (
                      <tr key={resp.id} className="hover:bg-zinc-800/40 transition-colors">
                        <td className="py-4 px-6 text-zinc-200">
                          {new Date(resp.submitted_at).toLocaleString()}
                        </td>
                        <td className="py-4 px-6 text-zinc-400">
                          {resp.completion_time ? `${resp.completion_time}s` : "N/A"}
                        </td>
                        <td className="py-4 px-6 text-zinc-300 max-w-md truncate">
                          {Object.entries(resp.preview_answers || {})
                            .map(([title, val]) => `${title}: ${val}`)
                            .join(" • ") || "Submitted answers"}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => setSelectedResponseId(resp.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600 hover:text-white font-semibold transition-all border border-indigo-500/30"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Full</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Detail View Modal */}
      <ResponseDetailModal
        formId={form.id}
        responseId={selectedResponseId}
        onClose={() => setSelectedResponseId(null)}
      />
    </div>
  );
};
