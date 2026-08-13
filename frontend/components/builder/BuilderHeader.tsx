"use client";

import React, { useState } from "react";
import { Form } from "@/types";
import { formsApi } from "@/lib/api/forms";
import {
  ArrowLeft,
  Check,
  Copy,
  ExternalLink,
  Eye,
  Globe,
  Loader2,
  Lock,
  Keyboard,
  X,
} from "lucide-react";
import Link from "next/link";

interface BuilderHeaderProps {
  form: Form;
  onUpdateForm: (updated: Form) => void;
  isSaving?: boolean;
}

export const BuilderHeader: React.FC<BuilderHeaderProps> = ({
  form,
  onUpdateForm,
  isSaving = false,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState(form.title);
  const [isPublishing, setIsPublishing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);

  const handleSaveTitle = async () => {
    if (!title.trim() || title === form.title) {
      setTitle(form.title);
      setIsEditingTitle(false);
      return;
    }
    try {
      const updated = await formsApi.update(form.id, { title: title.trim() });
      onUpdateForm(updated);
      setIsEditingTitle(false);
    } catch (err) {
      setTitle(form.title);
      setIsEditingTitle(false);
    }
  };

  const handleTogglePublish = async () => {
    setIsPublishing(true);
    try {
      if (form.status === "published") {
        const updated = await formsApi.unpublish(form.id);
        onUpdateForm(updated);
      } else {
        const updated = await formsApi.publish(form.id);
        onUpdateForm(updated);
      }
    } catch (err: any) {
      alert(err.message || "Failed to change publish status. Ensure form has at least one question.");
    } finally {
      setIsPublishing(false);
    }
  };

  const publicUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/f/${form.slug}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="h-14 border-b border-zinc-900 bg-zinc-950 px-4 md:px-6 flex items-center justify-between z-30 select-none font-sans">
      {/* Left section: Back button & Title inline edit */}
      <div className="flex items-center gap-3">
        <Link
          href="/forms"
          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
          title="Back to dashboard"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>

        <div className="flex items-center gap-2.5">
          {isEditingTitle ? (
            <input
              type="text"
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleSaveTitle}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveTitle();
                if (e.key === "Escape") {
                  setTitle(form.title);
                  setIsEditingTitle(false);
                }
              }}
              className="bg-zinc-900 border border-indigo-500 rounded-lg px-2.5 py-0.5 text-xs font-bold text-white outline-none"
            />
          ) : (
            <h1
              onClick={() => setIsEditingTitle(true)}
              className="text-xs md:text-sm font-bold text-white hover:text-indigo-400 cursor-pointer transition-colors flex items-center gap-2"
              title="Click to rename form"
            >
              <span>{form.title}</span>
            </h1>
          )}

          {/* Status Badge */}
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider ${
              form.status === "published"
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
            }`}
          >
            {form.status}
          </span>

          {/* Saving Status */}
          <span className="text-[11px] text-zinc-500 flex items-center gap-1.5 ml-1">
            {isSaving ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin text-indigo-400" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="hidden sm:inline">Saved</span>
              </>
            )}
          </span>
        </div>
      </div>

      {/* Right section: Links & Action Buttons */}
      <div className="flex items-center gap-2.5">
        {/* Nav Tabs */}
        <div className="bg-zinc-900/80 p-0.5 rounded-lg border border-zinc-800 flex items-center gap-0.5">
          <span className="px-2.5 py-1 text-xs font-medium text-white bg-zinc-800 rounded-md">
            Builder
          </span>
          <Link
            href={`/forms/${form.id}/responses`}
            className="px-2.5 py-1 text-xs font-medium text-zinc-400 hover:text-white transition-colors"
          >
            Responses ({form.response_count})
          </Link>
        </div>

        {/* Keyboard Shortcuts Trigger */}
        <button
          onClick={() => setShowShortcutsModal(true)}
          className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
          title="Keyboard Shortcuts"
        >
          <Keyboard className="w-4 h-4" />
        </button>

        {/* Live Preview button */}
        <Link
          href={`/forms/${form.id}/preview`}
          target="_blank"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-medium text-zinc-200 transition-colors"
        >
          <Eye className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden sm:inline">Preview</span>
        </Link>

        {/* Share Link button if published */}
        {form.status === "published" && (
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-medium text-zinc-200 transition-colors"
            title="Copy public URL"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden sm:inline">Copy Link</span>
              </>
            )}
          </button>
        )}

        {/* Publish / Unpublish Button */}
        <button
          onClick={handleTogglePublish}
          disabled={isPublishing}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            form.status === "published"
              ? "bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800"
              : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm"
          }`}
        >
          {isPublishing ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : form.status === "published" ? (
            <>
              <Lock className="w-3.5 h-3.5" />
              <span>Unpublish</span>
            </>
          ) : (
            <>
              <Globe className="w-3.5 h-3.5" />
              <span>Publish</span>
            </>
          )}
        </button>
      </div>

      {/* KEYBOARD SHORTCUTS HELPER MODAL */}
      {showShortcutsModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-sm p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Keyboard className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">Builder Shortcuts</h3>
              </div>
              <button
                onClick={() => setShowShortcutsModal(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-zinc-950">
                <span className="text-zinc-400">Advance question in respondent flow</span>
                <kbd className="bg-zinc-950 border border-zinc-800 px-2 py-0.5 rounded text-[11px] font-mono text-zinc-300">Enter ↵</kbd>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-zinc-950">
                <span className="text-zinc-400">Navigate backward</span>
                <kbd className="bg-zinc-950 border border-zinc-800 px-2 py-0.5 rounded text-[11px] font-mono text-zinc-300">Shift + Enter</kbd>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-zinc-950">
                <span className="text-zinc-400">Select choice option Y / N</span>
                <kbd className="bg-zinc-950 border border-zinc-800 px-2 py-0.5 rounded text-[11px] font-mono text-zinc-300">Y / N key</kbd>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-zinc-400">Reorder questions</span>
                <span className="text-zinc-300 font-medium">Drag handle</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
