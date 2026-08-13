"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { formsApi } from "@/lib/api/forms";
import { Form } from "@/types";
import {
  Sparkles,
  ArrowRight,
  Plus,
  Globe,
  Sliders,
  BarChart3,
  Lock,
  User as UserIcon,
  LogOut,
  Zap,
  Layout,
  MessageSquare,
  CheckCircle2,
  ChevronRight,
  HelpCircle,
  Code2,
} from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  useEffect(() => {
    formsApi
      .list()
      .then((data) => setForms(data))
      .catch((err) => console.error("Error loading forms:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleCreateClick = () => {
    if (!user) {
      setShowAuthModal(true);
    } else {
      router.push("/forms");
    }
  };

  const featuredForms = forms.slice(0, 3);

  const faqs = [
    {
      q: "Why are published forms publicly accessible?",
      a: "Published forms generate shareable public links so respondents (such as customers, survey takers, or event applicants) can complete your forms without needing to create an account or sign in.",
    },
    {
      q: "How does the drag-and-drop builder work?",
      a: "Our studio uses an intuitive canvas powered by @dnd-kit. You can add 8 different question types, reorder them visually, and customize settings in real time.",
    },
    {
      q: "Can I export form response data?",
      a: "Yes! Every form includes an automated responses analytics dashboard where you can view question distribution charts, inspect individual transcripts, and export responses as a CSV.",
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Header */}
      <header className="border-b border-zinc-900/80 bg-zinc-950/80 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center font-bold text-white shadow-sm">
            <Sparkles className="w-4 h-4 text-indigo-400" />
          </div>
          <span className="text-sm font-semibold tracking-tight text-white">
            Typeform Clone
          </span>
        </div>

        {/* Right Auth / Profile Controls */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <Link
                href="/forms"
                className="text-xs font-medium text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 px-3.5 py-2 rounded-xl transition-all flex items-center gap-2"
              >
                <Layout className="w-3.5 h-3.5 text-indigo-400" />
                <span>Studio Dashboard</span>
              </Link>

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
                  onClick={logout}
                  className="p-1 text-zinc-500 hover:text-rose-400 transition-colors"
                  title="Sign out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="text-xs font-medium text-zinc-400 hover:text-white px-3.5 py-2 rounded-xl transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/login"
                className="text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-xl transition-all shadow-sm"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-4xl w-full mx-auto px-6 pt-20 pb-16 text-center space-y-6">
        <div className="inline-flex items-center gap-2 bg-zinc-900 border border-zinc-800 text-zinc-300 px-3.5 py-1.5 rounded-full text-xs font-medium">
          <Zap className="w-3.5 h-3.5 text-indigo-400" />
          <span>Conversational Form Engine</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
          Forms designed for humans.
        </h1>

        <p className="text-base md:text-lg text-zinc-400 font-normal max-w-xl mx-auto leading-relaxed">
          Create fluid, one-question-at-a-time form experiences. Simple to build, beautiful to fill, and designed for maximum completion rates.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <button
            onClick={handleCreateClick}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm px-6 py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Create a Form</span>
          </button>

          {featuredForms.length > 0 && (
            <Link
              href={`/f/${featuredForms[0].slug}`}
              target="_blank"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 font-medium text-sm px-6 py-3.5 rounded-xl transition-all"
            >
              <span>Try Live Demo</span>
              <ArrowRight className="w-4 h-4 text-zinc-400" />
            </Link>
          )}
        </div>
      </section>

      {/* FEATURED TEMPLATES & PUBLIC DEMOS */}
      <section className="max-w-5xl w-full mx-auto px-6 py-12 space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white">Form Templates & Live Demos</h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Experience public conversational flows directly in your browser:
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-zinc-500">Loading form templates...</div>
        ) : featuredForms.length === 0 ? (
          <div className="p-8 text-center text-xs text-zinc-500 bg-zinc-900/40 rounded-2xl border border-zinc-800">
            No templates currently loaded.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {featuredForms.map((form) => (
              <div
                key={form.id}
                className="bg-zinc-900/40 border border-zinc-800/80 hover:border-zinc-700/80 rounded-2xl p-5 flex flex-col justify-between transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full">
                      {form.question_count} Questions
                    </span>
                    <span className="text-[10px] font-medium text-emerald-400 flex items-center gap-1">
                      <Globe className="w-3 h-3" />
                      <span>Published</span>
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-indigo-400 transition-colors line-clamp-1 mb-1">
                    {form.title}
                  </h3>

                  <p className="text-xs text-zinc-400 line-clamp-2 min-h-[2.5rem] mb-4">
                    {form.description || "Interactive conversational form."}
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-zinc-900">
                  <Link
                    href={`/f/${form.slug}`}
                    target="_blank"
                    className="w-full flex items-center justify-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-medium text-xs py-2.5 px-3 rounded-xl transition-all text-center"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Open Public Form</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* MINIMAL FEATURES GRID */}
      <section className="max-w-5xl w-full mx-auto px-6 py-12 border-t border-zinc-900">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl bg-zinc-900/30 border border-zinc-900 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-indigo-400">
              <Sliders className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white">Drag & Drop Builder</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Order questions visually using sortable drag-and-drop primitives with real-time settings inspection.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-900/30 border border-zinc-900 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-purple-400">
              <MessageSquare className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white">Conversational Flow</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              One question at a time fullscreen layout with keyboard navigation and smooth Framer Motion transitions.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-900/30 border border-zinc-900 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-emerald-400">
              <BarChart3 className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white">Response Analytics</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Automatic choice distributions, rating scale averages, individual submission transcripts, and CSV exports.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ ACCORDION SECTION */}
      <section className="max-w-3xl w-full mx-auto px-6 py-12 border-t border-zinc-900 space-y-6">
        <h2 className="text-base font-bold text-white text-center">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl overflow-hidden transition-colors"
            >
              <button
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full p-4 text-left text-xs font-semibold text-zinc-200 flex items-center justify-between hover:text-white"
              >
                <span>{faq.q}</span>
                <ChevronRight
                  className={`w-4 h-4 text-zinc-500 transition-transform ${
                    activeFaq === idx ? "rotate-90 text-indigo-400" : ""
                  }`}
                />
              </button>
              {activeFaq === idx && (
                <div className="px-4 pb-4 text-xs text-zinc-400 leading-relaxed border-t border-zinc-900 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="border-t border-zinc-900 px-6 py-6 text-center text-xs text-zinc-500">
        Typeform Clone Platform • Minimal Fullstack Architecture
      </footer>

      {/* AUTH REQUIRED MODAL */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-sm p-6 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-white">Sign in required</h3>
              <p className="text-xs text-zinc-400 mt-1">
                Please sign in or create an account to start building forms.
              </p>
            </div>

            <div className="space-y-2 pt-1">
              <Link
                href="/login"
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs py-3 px-4 rounded-xl transition-all shadow-md shadow-indigo-600/20"
              >
                <span>Go to Sign In / Register</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <button
                type="button"
                onClick={() => setShowAuthModal(false)}
                className="w-full py-2 text-xs font-medium text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
