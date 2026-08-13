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
  Sparkles,
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
    <header className="h-16 border-b border-zinc-800 bg-zinc-950 px-4 md:px-6 flex items-center justify-between z-30 select-none">
      {/* Left section: Back button & Title inline edit */}
      <div className="flex items-center gap-4">
        <Link
          href="/forms"
          className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          title="Back to forms dashboard"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>

        <div className="flex items-center gap-3">
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
              className="bg-zinc-900 border border-indigo-500 rounded-lg px-3 py-1 text-base font-bold text-white outline-none"
            />
          ) : (
            <h1
              onClick={() => setIsEditingTitle(true)}
              className="text-base md:text-lg font-bold text-white hover:text-indigo-400 cursor-pointer transition-colors flex items-center gap-2"
              title="Click to rename form"
            >
              <span>{form.title}</span>
            </h1>
          )}

          {/* Status Badge */}
          <span
            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
              form.status === "published"
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
            }`}
          >
            {form.status}
          </span>

          {/* Saving Status Indicator */}
          <span className="text-xs text-zinc-400 flex items-center gap-1.5 ml-2">
            {isSaving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Saved</span>
              </>
            )}
          </span>
        </div>
      </div>

      {/* Right section: Links & Action Buttons */}
      <div className="flex items-center gap-3">
        {/* Navigation Tabs */}
        <div className="bg-zinc-900/80 p-1 rounded-xl border border-zinc-800 flex items-center gap-1">
          <span className="px-3 py-1 text-xs font-semibold text-white bg-zinc-800 rounded-lg shadow-sm">
            Builder
          </span>
          <Link
            href={`/forms/${form.id}/responses`}
            className="px-3 py-1 text-xs font-medium text-zinc-400 hover:text-white transition-colors"
          >
            Responses ({form.response_count})
          </Link>
        </div>

        {/* Live Preview button */}
        <Link
          href={`/forms/${form.id}/preview`}
          target="_blank"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-200 transition-colors"
        >
          <Eye className="w-4 h-4 text-indigo-400" />
          <span className="hidden sm:inline">Preview</span>
        </Link>

        {/* Share Link button if published */}
        {form.status === "published" && (
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-200 transition-colors"
            title="Copy shareable link"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-indigo-400" />
                <span className="hidden sm:inline">Copy Link</span>
              </>
            )}
          </button>
        )}

        {/* Publish / Unpublish Button */}
        <button
          onClick={handleTogglePublish}
          disabled={isPublishing}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
            form.status === "published"
              ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700"
              : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30"
          }`}
        >
          {isPublishing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
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
    </header>
  );
};
