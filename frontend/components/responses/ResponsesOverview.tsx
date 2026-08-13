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
  Search,
  Copy,
  Check,
  Lock,
  Shield,
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
  const [tableSearch, setTableSearch] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

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

    const headers = ["Submission ID", "Submitted At", "Duration (s)"];
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

  const filteredResponses = responses.filter((r) => {
    if (!tableSearch) return true;
    const textStr = JSON.stringify(r.preview_answers || {}).toLowerCase();
    return textStr.includes(tableSearch.toLowerCase()) || r.id.toLowerCase().includes(tableSearch.toLowerCase());
  });

  const handleCopyAnswers = (r: ResponseListItem) => {
    const text = Object.entries(r.preview_answers || {})
      .map(([q, a]) => `${q}: ${a}`)
      .join("\n");
    navigator.clipboard.writeText(text);
    setCopiedId(r.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Header Bar */}
      <header className="h-14 border-b border-zinc-900 bg-zinc-950 px-6 flex items-center justify-between select-none">
        <div className="flex items-center gap-3">
          <h1 className="text-xs font-bold text-white tracking-wide">{form.title}</h1>
          <span className="bg-zinc-900 border border-zinc-800 text-zinc-400 text-[10px] font-mono px-2 py-0.5 rounded-md uppercase flex items-center gap-1">
            <Lock className="w-3 h-3 text-indigo-400" />
            <span>Private Admin Responses</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-zinc-900/80 p-0.5 rounded-lg border border-zinc-800 flex items-center gap-0.5">
            <Link
              href={`/forms/${form.id}/builder`}
              className="px-2.5 py-1 text-xs font-medium text-zinc-400 hover:text-white transition-colors"
            >
              Builder
            </Link>
            <span className="px-2.5 py-1 text-xs font-medium text-white bg-zinc-800 rounded-md">
              Responses ({responses.length})
            </span>
          </div>

          <button
            onClick={handleExportCSV}
            disabled={responses.length === 0}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-semibold text-xs px-3.5 py-1.5 rounded-lg transition-all shadow-sm"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6 md:p-8 space-y-8">
        {/* Creator Admin Notice Banner */}
        <div className="bg-zinc-900/40 border border-zinc-800/80 p-4 rounded-2xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Creator Response Portal</div>
              <div className="text-[11px] text-zinc-400">
                Only you (Form Creator) can view submitted respondent answers. Public respondents cannot see these results or your login details.
              </div>
            </div>
          </div>
        </div>

        {/* Summary Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-zinc-900/40 border border-zinc-900 rounded-2xl p-5 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider">
                Total Submissions
              </div>
              <div className="text-2xl font-bold text-white mt-1">
                {stats ? stats.total_responses : responses.length}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-zinc-900/40 border border-zinc-900 rounded-2xl p-5 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider">
                Avg Completion Time
              </div>
              <div className="text-2xl font-bold text-white mt-1">
                {stats?.avg_completion_time ? `${stats.avg_completion_time}s` : "N/A"}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-600/10 text-purple-400 border border-purple-500/20 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-zinc-900/40 border border-zinc-900 rounded-2xl p-5 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider">
                Completion Rate
              </div>
              <div className="text-2xl font-bold text-emerald-400 mt-1">100%</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-600/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Question Analytics Breakdown */}
        {stats && stats.questions_stats.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center gap-2 border-b border-zinc-900 pb-3">
              <BarChart3 className="w-4 h-4 text-indigo-400" />
              <h2 className="text-sm font-bold text-white">Respondent Choice Distributions & Insights</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stats.questions_stats.map((qStat, idx) => (
                <div
                  key={qStat.question_id || idx}
                  className="bg-zinc-900/30 border border-zinc-900 rounded-2xl p-5 space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-xs font-bold text-white leading-snug">
                      <span className="text-indigo-400 mr-1.5 font-mono">Q{idx + 1}.</span>
                      {qStat.title}
                    </h3>
                    <span className="text-[10px] font-mono font-medium text-zinc-500 bg-zinc-950 px-2 py-0.5 rounded-md border border-zinc-800 shrink-0">
                      {qStat.total_answers} answers
                    </span>
                  </div>

                  {/* Rating / Score Average */}
                  {qStat.average_number !== null && qStat.average_number !== undefined && (
                    <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-900 flex items-center justify-between">
                      <span className="text-xs text-zinc-400">Average Rating</span>
                      <div className="flex items-center gap-1.5">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        <span className="text-lg font-bold text-white">{qStat.average_number}</span>
                      </div>
                    </div>
                  )}

                  {/* Options Bars */}
                  {qStat.options && qStat.options.length > 0 && (
                    <div className="space-y-2 pt-1">
                      {qStat.options.map((opt) => (
                        <div key={opt.value} className="space-y-1">
                          <div className="flex justify-between text-[11px] font-medium">
                            <span className="text-zinc-300">{opt.label}</span>
                            <span className="text-zinc-500 font-mono">
                              {opt.count} ({opt.percentage}%)
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-zinc-950 rounded-full overflow-hidden border border-zinc-900">
                            <div
                              className="h-full bg-indigo-600 rounded-full transition-all"
                              style={{ width: `${opt.percentage}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Text Samples */}
                  {qStat.text_samples && qStat.text_samples.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <div className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider">
                        Submitted Respondent Answers
                      </div>
                      <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                        {qStat.text_samples.map((sample, sIdx) => (
                          <div
                            key={sIdx}
                            className="text-xs text-zinc-300 bg-zinc-950 p-2.5 rounded-xl border border-zinc-900 italic"
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

        {/* Submissions Table with Search */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-zinc-900 pb-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-400" />
              <span>Respondent Submissions ({filteredResponses.length})</span>
            </h2>

            {/* Table Search */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                placeholder="Search respondent answers..."
                className="w-full bg-zinc-900/60 border border-zinc-800/80 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white outline-none focus:border-indigo-500/80"
              />
            </div>
          </div>

          {filteredResponses.length === 0 ? (
            <div className="bg-zinc-900/30 border border-zinc-900 rounded-2xl p-12 text-center text-xs text-zinc-500">
              {tableSearch ? "No respondent answers match your search filter." : "No responses submitted yet."}
            </div>
          ) : (
            <div className="bg-zinc-900/30 border border-zinc-900 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-950 border-b border-zinc-900 text-zinc-500 font-mono uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 px-5">Submission Time</th>
                      <th className="py-3 px-5">Duration</th>
                      <th className="py-3 px-5">Respondent Answers Summary</th>
                      <th className="py-3 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900 font-medium">
                    {filteredResponses.map((resp) => (
                      <tr key={resp.id} className="hover:bg-zinc-900/50 transition-colors">
                        <td className="py-3 px-5 text-zinc-300">
                          {new Date(resp.submitted_at).toLocaleString()}
                        </td>
                        <td className="py-3 px-5 text-zinc-400 font-mono">
                          {resp.completion_time ? `${resp.completion_time}s` : "N/A"}
                        </td>
                        <td className="py-3 px-5 text-zinc-300 max-w-sm truncate">
                          {Object.entries(resp.preview_answers || {})
                            .map(([title, val]) => `${title}: ${val}`)
                            .join(" • ") || "Submitted answers"}
                        </td>
                        <td className="py-3 px-5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleCopyAnswers(resp)}
                              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                              title="Copy respondent answers"
                            >
                              {copiedId === resp.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                            <button
                              onClick={() => setSelectedResponseId(resp.id)}
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-lg transition-all"
                            >
                              <Eye className="w-3 h-3" />
                              <span>View Transcript</span>
                            </button>
                          </div>
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

      {/* Transcript View Modal */}
      <ResponseDetailModal
        formId={form.id}
        responseId={selectedResponseId}
        onClose={() => setSelectedResponseId(null)}
      />
    </div>
  );
};
