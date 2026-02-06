"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { signInWithGoogle } from "@/lib/auth";
import { useLanguage } from "@/contexts/LanguageContext";

export default function LoginPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const [email, setEmail] = useState("");

  // Multilingual content
  const content = {
    English: {
      title: "Welcome",
      subtitle: "Log in to Ruleout to continue.",
      emailPlaceholder: "Email address*",
      continueButton: "Continue",
      google: "Continue with Google",
      or: "or",
      email: "Continue with Email",
      terms: "By continuing, you agree to Ruleout's",
      termsOfService: "Terms of Service",
      and: "and",
      privacyPolicy: "Privacy Policy"
    },
    한국어: {
      title: "환영합니다",
      subtitle: "Ruleout을 계속 사용하려면 로그인하세요.",
      emailPlaceholder: "이메일 주소*",
      continueButton: "계속하기",
      google: "Google로 계속하기",
      or: "또는",
      email: "이메일로 계속하기",
      terms: "계속하면 Ruleout의",
      termsOfService: "이용약관",
      and: "및",
      privacyPolicy: "개인정보처리방침에 동의합니다"
    },
    日本語: {
      title: "ようこそ",
      subtitle: "Ruleoutを続けるにはログインしてください。",
      emailPlaceholder: "メールアドレス*",
      continueButton: "続ける",
      google: "Googleで続ける",
      or: "または",
      email: "メールで続ける",
      terms: "続行すると、Ruleoutの",
      termsOfService: "利用規約",
      and: "および",
      privacyPolicy: "プライバシーポリシーに同意したものとみなされます"
    }
  };

  const currentContent = content[language as keyof typeof content];

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
      router.push("/chat?reset=true");
    } catch (error) {
      console.error("로그인 실패:", error);
    }
  };

  const handleEmailContinue = () => {
    if (email.trim()) {
      // 이메일 주소를 가지고 verify 페이지로 이동
      router.push(`/login/verify?email=${encodeURIComponent(email)}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Image
            src="/image/logo_candidate1 복사본.png"
            alt="Ruleout Logo"
            width={40}
            height={40}
            className="object-contain"
          />
        </div>

        {/* Title */}
        <h1
          className="text-white text-3xl md:text-4xl font-normal text-center mb-4"
          style={{ fontFamily: "var(--font-hedvig-letters-serif), serif" }}
        >
          {currentContent.title}
        </h1>

        {/* Subtitle */}
        <p
          className="text-gray-400 text-center mb-8"
          style={{ fontFamily: "var(--font-helvetica), sans-serif" }}
        >
          {currentContent.subtitle}
        </p>

        {/* Login Options */}
        <div className="space-y-4">
          {/* Email Input Field */}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={currentContent.emailPlaceholder}
            className="w-full px-4 py-3 bg-transparent border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-gray-600 transition-colors placeholder-gray-500"
            style={{ fontFamily: "var(--font-helvetica), sans-serif" }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleEmailContinue();
              }
            }}
          />

          {/* Continue Button */}
          <button
            onClick={handleEmailContinue}
            disabled={!email.trim()}
            className="w-full px-6 py-3 bg-white text-black rounded text-sm font-medium hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ fontFamily: "var(--font-helvetica), sans-serif" }}
          >
            {currentContent.continueButton}
          </button>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-gray-700"></div>
            <span className="px-4 text-gray-500 text-sm">{currentContent.or}</span>
            <div className="flex-1 border-t border-gray-700"></div>
          </div>

          {/* Google Login */}
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center px-6 py-3 border border-gray-700 rounded hover:border-gray-600 transition-colors bg-transparent"
          >
            <div className="flex items-center space-x-3">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="text-white text-sm font-medium" style={{ fontFamily: "var(--font-helvetica), sans-serif" }}>
                {currentContent.google}
              </span>
            </div>
          </button>

          {/* Terms */}
          <p className="text-xs text-gray-600 text-center mt-6" style={{ fontFamily: "var(--font-helvetica), sans-serif" }}>
            {currentContent.terms}{" "}
            <a href="/terms" className="text-gray-500 hover:text-gray-400 hover:underline">{currentContent.termsOfService}</a>
            {" "}{currentContent.and}{" "}
            <a href="/privacy" className="text-gray-500 hover:text-gray-400 hover:underline">{currentContent.privacyPolicy}</a>
          </p>
        </div>
      </div>
    </div>
  );
}
