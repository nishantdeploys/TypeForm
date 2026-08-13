"use client";

import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, RotateCcw } from "lucide-react";

interface ThankYouScreenProps {
  formTitle: string;
  onRestart?: () => void;
  isPreview?: boolean;
}

export const ThankYouScreen: React.FC<ThankYouScreenProps> = ({
  formTitle,
  onRestart,
  isPreview = false,
}) => {
  return (
    <div className="min-h-screen w-full bg-zinc-950 flex flex-col items-center justify-center p-6 text-center text-white relative overflow-hidden">
      {/* Dynamic Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none" />

      {isPreview && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-amber-500/10 text-amber-400 border border-amber-500/30 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
          Preview Mode - Response Not Stored
        </div>
      )}

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-md w-full bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-xl p-8 md:p-10 rounded-3xl shadow-2xl z-10 flex flex-col items-center"
      >
        <div className="w-20 h-20 rounded-full bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mb-6 shadow-inner">
          <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
        </div>

        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3 bg-gradient-to-r from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent">
          Thank You!
        </h1>

        <p className="text-zinc-400 text-base md:text-lg mb-8 leading-relaxed">
          Your submission for <span className="text-zinc-200 font-semibold">{formTitle}</span> has been successfully recorded.
        </p>

        {onRestart && (
          <button
            onClick={onRestart}
            className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold px-6 py-3 rounded-xl transition-all border border-zinc-700/50 hover:border-zinc-600"
          >
            <RotateCcw className="w-4 h-4" />
            Submit Another Response
          </button>
        )}
      </motion.div>
    </div>
  );
};
