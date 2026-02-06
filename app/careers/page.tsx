"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Toolbar from "@/app/components/Toolbar";
import Footer from '@/app/components/Footer';
import { signInWithGoogle } from "@/lib/auth";
import { useLanguage } from '@/contexts/LanguageContext';
import { US, KR, JP } from 'country-flag-icons/react/3x2';

export default function CareersPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);

  const handleLogin = () => {
    setShowLoginModal(true);
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
      setShowLoginModal(false);
      router.push("/");
    } catch (error) {
      console.error("로그인 실패:", error);
    }
  };

  const content = {
    English: {
      joinTeam: "Join our team.",
      heroSubtitle: "Your work here will save lives.",
      allCareers: "All Careers",
      location: "Location",
      allLocations: "All Locations",
      categories: [
        { id: "all", label: "All Careers" },
        { id: "engineering", label: "Engineering" },
        { id: "marketing", label: "Marketing" },
        { id: "clinical", label: "Clinical & Research" },
      ],
      locations: [
        { id: "all", label: "All Locations" },
        { id: "seoul", label: "Seoul" },
        { id: "everywhere", label: "Everywhere" },
      ],
      jobs: [
        {
          id: 1,
          title: "Founding Full Stack Engineer",
          category: "engineering",
          type: "Full Time",
          location: "seoul",
          locationLabel: "Seoul",
          slug: "founding-full-stack-engineer"
        },
        {
          id: 2,
          title: "Content Creator",
          category: "marketing",
          type: "Full Time",
          location: "everywhere",
          locationLabel: "Everywhere",
          slug: "content-creator"
        },
        {
          id: 3,
          title: "Veterinary Clinical Advisor",
          category: "clinical",
          type: "Part Time",
          location: "everywhere",
          locationLabel: "Everywhere",
          slug: "veterinary-clinical-advisor"
        }
      ],
      apply: "Apply",
      loginTitle: "Log in or Sign up",
      loginSubtitle: "Choose your work email.",
      whyNeeded: "Why is this needed?",
      continueGoogle: "Continue with Google",
      continueEmail: "Continue with Email",
      or: "or"
    },
    한국어: {
      joinTeam: "우리 팀에 합류하세요.",
      heroSubtitle: "당신의 일이 생명을 구합니다.",
      allCareers: "전체",
      location: "위치",
      allLocations: "모든 위치",
      categories: [
        { id: "all", label: "전체" },
        { id: "engineering", label: "엔지니어링" },
        { id: "marketing", label: "마케팅" },
        { id: "clinical", label: "임상 및 연구" },
      ],
      locations: [
        { id: "all", label: "모든 위치" },
        { id: "seoul", label: "서울" },
        { id: "everywhere", label: "전 지역" },
      ],
      jobs: [
        {
          id: 1,
          title: "창업 멤버 풀스택 엔지니어",
          category: "engineering",
          type: "정규직",
          location: "seoul",
          locationLabel: "서울",
          slug: "founding-full-stack-engineer"
        },
        {
          id: 2,
          title: "콘텐츠 크리에이터",
          category: "marketing",
          type: "정규직",
          location: "everywhere",
          locationLabel: "전 지역",
          slug: "content-creator"
        },
        {
          id: 3,
          title: "수의학 임상 자문위원",
          category: "clinical",
          type: "파트타임",
          location: "everywhere",
          locationLabel: "전 지역",
          slug: "veterinary-clinical-advisor"
        }
      ],
      apply: "지원하기",
      loginTitle: "로그인 또는 회원가입",
      loginSubtitle: "업무용 이메일을 선택하세요.",
      whyNeeded: "왜 필요한가요?",
      continueGoogle: "Google로 계속하기",
      continueEmail: "이메일로 계속하기",
      or: "또는"
    },
    日本語: {
      joinTeam: "私たちのチームに参加しましょう。",
      heroSubtitle: "あなたの仕事が命を救います。",
      allCareers: "すべて",
      location: "場所",
      allLocations: "すべての場所",
      categories: [
        { id: "all", label: "すべて" },
        { id: "engineering", label: "エンジニアリング" },
        { id: "marketing", label: "マーケティング" },
        { id: "clinical", label: "臨床・研究" },
      ],
      locations: [
        { id: "all", label: "すべての場所" },
        { id: "seoul", label: "ソウル" },
        { id: "everywhere", label: "全地域" },
      ],
      jobs: [
        {
          id: 1,
          title: "創業メンバー フルスタックエンジニア",
          category: "engineering",
          type: "正社員",
          location: "seoul",
          locationLabel: "ソウル",
          slug: "founding-full-stack-engineer"
        },
        {
          id: 2,
          title: "コンテンツクリエイター",
          category: "marketing",
          type: "正社員",
          location: "everywhere",
          locationLabel: "全地域",
          slug: "content-creator"
        },
        {
          id: 3,
          title: "獣医臨床アドバイザー",
          category: "clinical",
          type: "パートタイム",
          location: "everywhere",
          locationLabel: "全地域",
          slug: "veterinary-clinical-advisor"
        }
      ],
      apply: "応募する",
      loginTitle: "ログインまたはサインアップ",
      loginSubtitle: "業務用メールアドレスを選択してください。",
      whyNeeded: "なぜ必要ですか？",
      continueGoogle: "Googleで続ける",
      continueEmail: "メールアドレスで続ける",
      or: "または"
    }
  };

  const t = content[language];

  // Filter jobs based on selected category and location
  const filteredJobs = t.jobs.filter(job => {
    const categoryMatch = selectedCategory === "all" || job.category === selectedCategory;
    const locationMatch = selectedLocation === "all" || job.location === selectedLocation;
    return categoryMatch && locationMatch;
  });

  // Get current location label
  const currentLocationLabel = t.locations.find(loc => loc.id === selectedLocation)?.label || t.location;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Toolbar */}
      <Toolbar onLoginClick={handleLogin} />

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-16 pt-24">
        {/* Header Section */}
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-light leading-tight text-white mb-2" style={{ fontFamily: "var(--font-hedvig-letters-serif), serif" }}>
            {t.heroSubtitle}
          </h1>
        </div>

        {/* Category Filter Buttons */}
        <div className="mb-8 flex flex-wrap gap-3">
          {t.categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 text-sm font-normal transition-all ${
                selectedCategory === category.id
                  ? "bg-white text-black"
                  : "bg-transparent text-gray-400 border border-gray-700 hover:border-gray-500"
              }`}
              style={{ fontFamily: "var(--font-helvetica), sans-serif" }}
            >
              {category.label}
            </button>
          ))}
        </div>

        {/* Location Filter */}
        <div className="mb-8 flex items-center justify-between">
          <div className="relative">
            <button
              onClick={() => setIsLocationDropdownOpen(!isLocationDropdownOpen)}
              className="bg-transparent border border-gray-700 text-gray-400 px-6 py-2.5 text-sm flex items-center gap-2 hover:border-gray-500 transition-all"
              style={{ fontFamily: "var(--font-helvetica), sans-serif" }}
            >
              {currentLocationLabel}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {isLocationDropdownOpen && (
              <div
                className="absolute top-full left-0 mt-2 bg-[#1a1a1a] border border-gray-700 rounded-lg shadow-xl z-10 min-w-[200px]"
                style={{ fontFamily: "var(--font-helvetica), sans-serif" }}
              >
                {t.locations.map((location) => (
                  <button
                    key={location.id}
                    onClick={() => {
                      setSelectedLocation(location.id);
                      setIsLocationDropdownOpen(false);
                    }}
                    className={`w-full text-left px-6 py-3 text-sm transition-colors hover:bg-[#252525] flex items-center gap-2 ${
                      selectedLocation === location.id
                        ? "text-white bg-[#252525]"
                        : "text-gray-400"
                    }`}
                  >
                    {location.id === "seoul" && <KR className="w-4 h-3" />}
                    {location.id === "everywhere" && <span>🌍</span>}
                    {location.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Job Listings Table */}
        <div>
          {filteredJobs.map((job, index) => (
            <div
              key={job.id}
              className={`py-6 flex items-center justify-between cursor-pointer ${
                index > 0 ? "border-t border-gray-800" : ""
              }`}
              onClick={() => router.push(`/careers/${job.slug}`)}
            >
              {/* Job Title */}
              <div className="flex-1">
                <h3
                  className="text-lg md:text-xl font-normal text-white transition-colors"
                  style={{ fontFamily: "var(--font-helvetica), sans-serif" }}
                >
                  {job.title}
                </h3>
              </div>

              {/* Job Type */}
              <div className="hidden md:block flex-1 text-center">
                <span
                  className="text-sm text-gray-400"
                  style={{ fontFamily: "var(--font-helvetica), sans-serif" }}
                >
                  {job.type}
                </span>
              </div>

              {/* Location */}
              <div className="hidden md:block flex-1 text-center">
                <span
                  className="text-sm text-gray-400"
                  style={{ fontFamily: "var(--font-helvetica), sans-serif" }}
                >
                  {job.locationLabel}
                </span>
              </div>

              {/* Apply Button */}
              <div className="flex-shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/careers/${job.slug}`);
                  }}
                  className="px-6 py-2 text-sm font-normal border border-gray-600 text-white rounded-lg hover:bg-white hover:text-black transition-all"
                  style={{ fontFamily: "var(--font-helvetica), sans-serif" }}
                >
                  {t.apply}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <Footer />

      {/* Login Modal */}
      {showLoginModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowLoginModal(false)}
        >
          <div
            className="rounded-2xl p-8 w-full max-w-md mx-4 relative bg-[#1a1a1a] border border-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-200"
            >
              ✕
            </button>

            <div className="flex flex-col items-center mb-8">
              <div className="flex items-center space-x-1 mb-6">
                <Image
                  src="/image/logo_candidate1 복사본.png"
                  alt="Ruleout Logo"
                  width={28}
                  height={28}
                  className="object-contain"
                />
                <span className="text-2xl font-bold text-white">Ruleout</span>
              </div>
              <h2 className="text-3xl font-bold mb-2 text-white">
                {t.loginTitle}
              </h2>
              <p className="text-gray-400">
                {t.loginSubtitle} <a href="#" className="text-[#20808D] hover:underline">{t.whyNeeded}</a>
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center px-6 py-4 border-2 rounded-lg transition-colors border-gray-700 hover:border-gray-600 bg-[#2a2a2a]"
              >
                <div className="flex items-center space-x-3">
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span className="font-medium text-white">{t.continueGoogle}</span>
                </div>
              </button>

              <div className="flex items-center my-4">
                <div className="flex-1 border-t border-gray-700"></div>
                <span className="px-4 text-gray-400">{t.or}</span>
                <div className="flex-1 border-t border-gray-700"></div>
              </div>

              <button className="w-full px-6 py-4 bg-[#20808D] text-white rounded-lg hover:bg-[#1a6a78] transition-colors font-medium">
                {t.continueEmail}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
