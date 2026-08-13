"use client";

import React, { useState, useEffect } from "react";
import { Form } from "@/types";
import { formsApi } from "@/lib/api/forms";
import Link from "next/link";
import {
  Plus,
  Search,
  Sparkles,
  FileText,
  Globe,
  Copy,
  Trash2,
  Edit2,
  ExternalLink,
  Loader2,
  Check,
  BarChart3,
  Sliders,
} from "lucide-react";

export default function DashboardPage() {
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const [deleteFormId, setDeleteFormId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [renameForm, setRenameForm] = useState<Form | null>(null);
  const [renameTitle, setRenameTitle] = useState("");
  const [isRenaming, setIsRenaming] = useState(false);

  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  const fetchForms = async () => {
    setLoading(true);
    try {
      const data = await formsApi.list();
      setForms(data);
    } catch (err) {
      console.error("Failed to fetch forms:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForms();
  }, []);

  const handleCreateForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setIsCreating(true);
    try {
      const created = await formsApi.create({
        title: newTitle.trim(),
        description: newDesc.trim() || undefined,
      });
      setIsCreateOpen(false);
      setNewTitle("");
      setNewDesc("");
      fetchForms();
    } catch (err: any) {
      alert(err.message || "Failed to create form.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDuplicateForm = async (id: string) => {
    try {
      await formsApi.duplicate(id);
      fetchForms();
    } catch (err: any) {
      alert(err.message || "Failed to duplicate form.");
    }
  };

  const handleDeleteForm = async () => {
    if (!deleteFormId) return;
    setIsDeleting(true);
    try {
      await formsApi.delete(deleteFormId);
      setDeleteFormId(null);
      fetchForms();
    } catch (err: any) {
      alert(err.message || "Failed to delete form.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRenameForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!renameForm || !renameTitle.trim()) return;
    setIsRenaming(true);
    try {
      await formsApi.update(renameForm.id, { title: renameTitle.trim() });
      setRenameForm(null);
      fetchForms();
    } catch (err: any) {
      alert(err.message || "Failed to rename form.");
    } finally {
      setIsRenaming(false);
    }
  };

  const handleCopyLink = (slug: string) => {
    const url = `${window.location.origin}/f/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  const filteredForms = forms.filter(
    (f) =>
      f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.description && f.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      {/* Top Header Navigation */}
      <header className="border-b border-zinc-800 bg-zinc-950 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center font-black text-white text-xl shadow-lg shadow-indigo-600/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white">Typeform Platform</h1>
            <p className="text-xs text-zinc-400 font-medium">Conversational Form Builder & Analytics</p>
          </div>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-600/25 active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Create Form</span>
        </button>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-10 space-y-8">
        {/* Search & Filter Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search forms..."
              className="w-full bg-zinc-900 border border-zinc-800 focus:border-indigo-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white outline-none transition-colors"
            />
          </div>

          <div className="text-xs text-zinc-400 font-medium">
            Showing {filteredForms.length} of {forms.length} forms
          </div>
        </div>

        {/* Form Cards Grid */}
        {loading ? (
          <div className="py-20 text-center text-zinc-400 flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
            <span>Loading workspace forms...</span>
          </div>
        ) : filteredForms.length === 0 ? (
          <div className="bg-zinc-900/40 border border-dashed border-zinc-800 rounded-3xl p-12 text-center text-zinc-400 space-y-4">
            <div className="w-16 h-16 rounded-full bg-zinc-800/60 flex items-center justify-center mx-auto text-zinc-500">
              <FileText className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">No forms found</h3>
              <p className="text-sm text-zinc-400 max-w-sm mx-auto mt-1">
                {searchQuery ? "No forms match your search query." : "Get started by creating your first conversational form."}
              </p>
            </div>
            {!searchQuery && (
              <button
                onClick={() => setIsCreateOpen(true)}
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Create Form</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredForms.map((form) => (
              <div
                key={form.id}
                className="bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700/80 rounded-3xl p-6 flex flex-col justify-between transition-all hover:shadow-xl group backdrop-blur-sm"
              >
                {/* Top Title & Status */}
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                        form.status === "published"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      }`}
                    >
                      {form.status}
                    </span>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          setRenameForm(form);
                          setRenameTitle(form.title);
                        }}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                        title="Rename form"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDuplicateForm(form.id)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                        title="Duplicate form"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteFormId(form.id)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Delete form"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-1 group-hover:text-indigo-400 transition-colors line-clamp-1">
                    {form.title}
                  </h3>

                  <p className="text-xs text-zinc-400 line-clamp-2 min-h-[2.5rem]">
                    {form.description || "No description provided."}
                  </p>
                </div>

                {/* Question & Response Stats */}
                <div className="my-6 pt-4 border-t border-zinc-800/60 flex items-center justify-between text-xs text-zinc-400 font-medium">
                  <div className="flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-indigo-400" />
                    <span>{form.question_count} questions</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <BarChart3 className="w-4 h-4 text-purple-400" />
                    <span>{form.response_count} responses</span>
                  </div>
                </div>

                {/* Bottom Card Actions */}
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href={`/forms/${form.id}/builder`}
                    className="flex items-center justify-center gap-2 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white font-semibold text-xs py-2.5 px-3 rounded-xl transition-all border border-indigo-500/30 text-center"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Builder</span>
                  </Link>

                  <Link
                    href={`/forms/${form.id}/responses`}
                    className="flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs py-2.5 px-3 rounded-xl transition-all border border-zinc-700/50 text-center"
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                    <span>Results</span>
                  </Link>
                </div>

                {/* Public Link button if published */}
                {form.status === "published" && (
                  <div className="mt-3 flex items-center justify-between pt-2 border-t border-zinc-800/40">
                    <Link
                      href={`/f/${form.slug}`}
                      target="_blank"
                      className="text-[11px] font-semibold text-zinc-400 hover:text-indigo-400 flex items-center gap-1 truncate"
                    >
                      <Globe className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span className="truncate">/f/{form.slug}</span>
                    </Link>

                    <button
                      onClick={() => handleCopyLink(form.slug)}
                      className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 shrink-0 ml-2"
                    >
                      {copiedSlug === form.slug ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <span>Copy URL</span>
                      )}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* CREATE FORM MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form
            onSubmit={handleCreateForm}
            className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-md p-6 space-y-5 shadow-2xl"
          >
            <h3 className="text-xl font-bold text-white">Create New Form</h3>

            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                Form Title
              </label>
              <input
                type="text"
                required
                autoFocus
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Customer Satisfaction Survey"
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-indigo-500 rounded-xl p-3 text-sm text-white outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                Description (Optional)
              </label>
              <textarea
                rows={3}
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Tell respondents what this form is about..."
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-indigo-500 rounded-xl p-3 text-sm text-white outline-none resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCreating}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all"
              >
                {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Form"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* RENAME FORM MODAL */}
      {renameForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form
            onSubmit={handleRenameForm}
            className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-md p-6 space-y-5 shadow-2xl"
          >
            <h3 className="text-xl font-bold text-white">Rename Form</h3>

            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                Title
              </label>
              <input
                type="text"
                required
                autoFocus
                value={renameTitle}
                onChange={(e) => setRenameTitle(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-indigo-500 rounded-xl p-3 text-sm text-white outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRenameForm(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isRenaming}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all"
              >
                {isRenaming ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteFormId && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-sm p-6 space-y-4 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">Delete Form?</h3>
              <p className="text-xs text-zinc-400 mt-1">
                This action cannot be undone. All questions and responses will be permanently deleted.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteFormId(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteForm}
                disabled={isDeleting}
                className="flex items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all"
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
