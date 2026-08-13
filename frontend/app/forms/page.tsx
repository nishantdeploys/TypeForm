"use client";

import React, { useState, useEffect } from "react";
import { Form, FormStatus } from "@/types";
import { formsApi } from "@/lib/api/forms";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
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
  Loader2,
  Check,
  BarChart3,
  Sliders,
  LogOut,
  ArrowUpDown,
  Filter,
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | FormStatus>("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "responses">("newest");

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
      router.push(`/forms/${created.id}/builder`);
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

  // Filter & Sort Logic
  const filteredForms = forms
    .filter((f) => {
      const matchesSearch =
        f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (f.description && f.description.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesStatus = statusFilter === "all" || f.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === "newest") return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      if (sortBy === "oldest") return new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
      if (sortBy === "responses") return b.response_count - a.response_count;
      return 0;
    });

  // Calculate Overview Stats
  const totalForms = forms.length;
  const publishedForms = forms.filter((f) => f.status === "published").length;
  const totalResponses = forms.reduce((acc, curr) => acc + curr.response_count, 0);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Navigation Header */}
      <header className="border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center font-bold text-white shadow-sm group-hover:border-zinc-700 transition-colors">
              <Sparkles className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-white group-hover:text-indigo-400 transition-colors">
                {user ? `Welcome back, ${user.full_name || user.email.split("@")[0]}` : "Typeform Studio"}
              </h1>
              <p className="text-[11px] text-zinc-400 font-medium">My Forms Dashboard</p>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2.5 bg-zinc-900/60 border border-zinc-800/80 px-3 py-1.5 rounded-xl">
              {user.avatar_url ? (
                <img src={user.avatar_url} alt={user.email} className="w-6 h-6 rounded-full object-cover" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-indigo-600/20 text-indigo-400 font-bold flex items-center justify-center text-[10px]">
                  {user.full_name ? user.full_name[0].toUpperCase() : user.email[0].toUpperCase()}
                </div>
              )}
              <span className="text-xs font-medium text-zinc-300 hidden md:inline">
                {user.full_name || user.email.split("@")[0]}
              </span>
              <button
                onClick={() => {
                  logout();
                  router.push("/login");
                }}
                className="p-1 text-zinc-500 hover:text-rose-400 transition-colors ml-1"
                title="Log Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="text-xs font-medium text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-3.5 py-1.5 rounded-xl"
            >
              Sign In
            </Link>
          )}

          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Create Form</span>
          </button>
        </div>
      </header>

      {/* Main Studio Workspace Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6 md:p-8 space-y-8">
        {/* Top Summary Stats Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-zinc-900/40 border border-zinc-900 rounded-2xl p-4 flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Total Forms</span>
            <span className="text-xl font-bold text-white">{totalForms}</span>
          </div>
          <div className="bg-zinc-900/40 border border-zinc-900 rounded-2xl p-4 flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Published Live</span>
            <span className="text-xl font-bold text-emerald-400">{publishedForms}</span>
          </div>
          <div className="bg-zinc-900/40 border border-zinc-900 rounded-2xl p-4 flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Total Responses</span>
            <span className="text-xl font-bold text-indigo-400">{totalResponses}</span>
          </div>
        </div>

        {/* Search, Status Filters, & Sort Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search forms..."
              className="w-full bg-zinc-900/60 border border-zinc-800/80 focus:border-indigo-500/80 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white outline-none transition-colors"
            />
          </div>

          {/* Filters & Sort Controls */}
          <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {/* Status Filter Tabs */}
            <div className="bg-zinc-900/80 p-1 rounded-xl border border-zinc-800/80 flex items-center gap-1 shrink-0">
              <button
                onClick={() => setStatusFilter("all")}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                  statusFilter === "all" ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-white"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter("published")}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                  statusFilter === "published" ? "bg-emerald-500/20 text-emerald-300" : "text-zinc-400 hover:text-white"
                }`}
              >
                Published
              </button>
              <button
                onClick={() => setStatusFilter("draft")}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                  statusFilter === "draft" ? "bg-amber-500/20 text-amber-300" : "text-zinc-400 hover:text-white"
                }`}
              >
                Drafts
              </button>
            </div>

            {/* Sort Dropdown */}
            <div className="relative shrink-0">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-zinc-900/80 border border-zinc-800/80 rounded-xl px-3 py-1.5 text-xs font-medium text-zinc-300 outline-none hover:border-zinc-700 cursor-pointer"
              >
                <option value="newest">Sort: Newest</option>
                <option value="oldest">Sort: Oldest</option>
                <option value="responses">Sort: Most Responses</option>
              </select>
            </div>
          </div>
        </div>

        {/* Minimal Form Grid */}
        {loading ? (
          <div className="py-20 text-center text-xs text-zinc-500 flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
            <span>Loading workspace forms...</span>
          </div>
        ) : filteredForms.length === 0 ? (
          <div className="bg-zinc-900/30 border border-dashed border-zinc-800/80 rounded-2xl p-12 text-center text-zinc-400 space-y-3">
            <FileText className="w-8 h-8 text-zinc-600 mx-auto" />
            <div>
              <h3 className="text-sm font-bold text-white">No forms found</h3>
              <p className="text-xs text-zinc-500 mt-1">
                {searchQuery || statusFilter !== "all"
                  ? "No forms match your search query or filter criteria."
                  : "Create your first conversational form to start collecting responses."}
              </p>
            </div>
            {!searchQuery && statusFilter === "all" && (
              <button
                onClick={() => setIsCreateOpen(true)}
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2 rounded-xl transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Create Form</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredForms.map((form) => (
              <div
                key={form.id}
                className="bg-zinc-900/40 border border-zinc-800/80 hover:border-zinc-700/80 rounded-2xl p-5 flex flex-col justify-between transition-all group"
              >
                {/* Form Metadata */}
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider ${
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

                  <h3 className="text-base font-bold text-white mb-1 group-hover:text-indigo-400 transition-colors line-clamp-1">
                    {form.title}
                  </h3>

                  <p className="text-xs text-zinc-400 line-clamp-2 min-h-[2.5rem]">
                    {form.description || "No description provided."}
                  </p>
                </div>

                {/* Counts */}
                <div className="my-4 pt-3 border-t border-zinc-900 flex items-center justify-between text-xs text-zinc-400 font-medium">
                  <span className="flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{form.question_count} questions</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <BarChart3 className="w-3.5 h-3.5 text-purple-400" />
                    <span>{form.response_count} responses</span>
                  </span>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href={`/forms/${form.id}/builder`}
                    className="flex items-center justify-center gap-1.5 bg-indigo-600/10 hover:bg-indigo-600 text-indigo-300 hover:text-white font-semibold text-xs py-2 px-3 rounded-xl transition-all border border-indigo-500/20 text-center"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Builder</span>
                  </Link>

                  <Link
                    href={`/forms/${form.id}/responses`}
                    className="flex items-center justify-center gap-1.5 bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs py-2 px-3 rounded-xl transition-all text-center"
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                    <span>Results</span>
                  </Link>
                </div>

                {/* Public Link button */}
                {form.status === "published" && (
                  <div className="mt-3 flex items-center justify-between pt-2 border-t border-zinc-900">
                    <Link
                      href={`/f/${form.slug}`}
                      target="_blank"
                      className="text-[11px] font-medium text-zinc-400 hover:text-indigo-400 flex items-center gap-1 truncate"
                    >
                      <Globe className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span className="truncate">/f/{form.slug}</span>
                    </Link>

                    <button
                      onClick={() => handleCopyLink(form.slug)}
                      className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 shrink-0"
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
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <form
            onSubmit={handleCreateForm}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl"
          >
            <h3 className="text-base font-bold text-white">Create New Form</h3>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                Title
              </label>
              <input
                type="text"
                required
                autoFocus
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Product Wishlist Survey"
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-indigo-500 rounded-xl p-3 text-xs text-white outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                Description (Optional)
              </label>
              <textarea
                rows={3}
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Brief summary for respondents..."
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-indigo-500 rounded-xl p-3 text-xs text-white outline-none resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCreating}
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2 rounded-xl transition-all"
              >
                {isCreating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Create & Open Builder"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* RENAME FORM MODAL */}
      {renameForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <form
            onSubmit={handleRenameForm}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl"
          >
            <h3 className="text-base font-bold text-white">Rename Form</h3>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                Title
              </label>
              <input
                type="text"
                required
                autoFocus
                value={renameTitle}
                onChange={(e) => setRenameTitle(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-indigo-500 rounded-xl p-3 text-xs text-white outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRenameForm(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isRenaming}
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2 rounded-xl transition-all"
              >
                {isRenaming ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Save"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteFormId && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-sm p-6 space-y-4 shadow-2xl text-center">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-5 h-5" />
            </div>

            <div>
              <h3 className="text-base font-bold text-white">Delete Form?</h3>
              <p className="text-xs text-zinc-400 mt-1">
                All questions and submitted responses for this form will be permanently deleted.
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setDeleteFormId(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteForm}
                disabled={isDeleting}
                className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs px-4 py-2 rounded-xl transition-all"
              >
                {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Delete Permanently"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
