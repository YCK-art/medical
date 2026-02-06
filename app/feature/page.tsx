"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Toolbar from "@/app/components/Toolbar";
import Footer from '@/app/components/Footer';
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from '@/contexts/LanguageContext';

export default function FeaturePage() {
  const router = useRouter();
  const { effectiveTheme } = useTheme();
  const { language } = useLanguage();

  const content = {
    English: {
      heroTitle: "An Intelligent\nVeterinary Coworker",
      heroSubtitle: "Ruleout brings the power of AI to veterinary medicine, helping clinicians make faster, evidence-based decisions.",
    },
    한국어: {
      heroTitle: "지능형\n수의학 동료",
      heroSubtitle: "Ruleout은 AI의 힘을 수의학에 접목하여 임상의가 더 빠르고 근거 기반의 결정을 내릴 수 있도록 돕습니다.",
    },
    日本語: {
      heroTitle: "インテリジェントな\n獣医学の同僚",
      heroSubtitle: "RuleoutはAIの力を獣医学にもたらし、臨床医がより迅速でエビデンスに基づいた意思決定を行えるよう支援します。",
    }
  };

  const t = content[language];

  return (
    <div className={`min-h-screen ${effectiveTheme === "light" ? "bg-white text-gray-900" : "bg-[#0a0a0a] text-white"}`}>
      {/* Toolbar */}
      <Toolbar />

      {/* Hero Section */}
      <div className="bg-[#f5f5f5]">
        <div className="max-w-7xl mx-auto px-6 pt-20 pb-0">
          {/* Hero Title */}
          <div className="text-center mb-16">
            <h1
              className="text-5xl md:text-7xl font-normal text-black leading-tight whitespace-pre-line"
              style={{ fontFamily: "var(--font-hedvig-letters-serif), serif" }}
            >
              {t.heroTitle}
            </h1>
          </div>

          {/* UI Screenshot Image */}
          <div className="relative w-full max-w-5xl mx-auto">
            <div className="relative rounded-t-2xl overflow-hidden shadow-2xl bg-white border border-gray-200">
              {/* Browser-like top bar */}
              <div className="bg-gray-100 px-4 py-3 flex items-center gap-2 border-b border-gray-200">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
              </div>

              {/* App Interface Mock */}
              <div className="p-6 bg-white">
                {/* Tab buttons */}
                <div className="flex gap-4 mb-6">
                  <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg text-sm text-gray-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Draft document
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg text-sm text-gray-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Review table
                  </button>
                </div>

                {/* Input area */}
                <div className="border border-gray-200 rounded-lg p-4 mb-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs text-gray-400">Client matter</span>
                    <span className="text-xs text-gray-400">Prompts</span>
                  </div>
                  <input
                    type="text"
                    placeholder="Ask Ruleout anything. Type @ to add sources."
                    className="w-full text-gray-500 text-sm outline-none bg-transparent"
                    disabled
                  />
                  <div className="flex gap-4 mt-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      Files
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      Sources
                    </span>
                  </div>
                </div>

                {/* Bottom action buttons */}
                <div className="flex items-center gap-3 text-sm">
                  <button className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 text-gray-600">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    Vault
                    <span className="text-gray-400">+</span>
                  </button>
                  <button className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 text-gray-600">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    Web search
                    <span className="text-gray-400">+</span>
                  </button>
                  <button className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 text-gray-600">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                    Ask Literature*
                    <span className="text-gray-400">+</span>
                  </button>
                  <button className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 text-gray-600">
                    <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                    Manage
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional content sections can be added here */}
      <div className="bg-[#0a0a0a] py-20">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-xl text-gray-300 leading-relaxed max-w-4xl" style={{ fontFamily: "var(--font-helvetica), sans-serif" }}>
            {t.heroSubtitle}
          </p>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
