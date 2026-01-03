"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { completeEmailLinkSignIn } from "@/lib/auth";
import { useLanguage } from "@/contexts/LanguageContext";

export default function VerifyEmailPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [errorMessage, setErrorMessage] = useState("");

  const content = {
    English: {
      verifying: "Verifying your email...",
      success: "Email verified successfully! Redirecting to chat...",
      error: "Verification failed",
      errorDetails: "Please try again or contact support.",
    },
    한국어: {
      verifying: "이메일 인증 중...",
      success: "이메일 인증 완료! 채팅 페이지로 이동합니다...",
      error: "인증 실패",
      errorDetails: "다시 시도하거나 고객 지원팀에 문의해주세요.",
    },
    日本語: {
      verifying: "メールを認証中...",
      success: "メール認証が完了しました！チャットページに移動します...",
      error: "認証失敗",
      errorDetails: "もう一度お試しいただくか、サポートにお問い合わせください。",
    },
  };

  const currentContent = content[language as keyof typeof content];

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // 현재 URL 전체를 가져오기
        const emailLink = window.location.href;

        // 이메일 링크로 로그인 완료
        await completeEmailLinkSignIn(emailLink);

        setStatus("success");

        // 3초 후 채팅 페이지로 리다이렉트
        setTimeout(() => {
          router.push("/chat?reset=true");
        }, 3000);
      } catch (error: any) {
        console.error("이메일 인증 오류:", error);
        setStatus("error");
        setErrorMessage(error.message || "Unknown error");
      }
    };

    verifyEmail();
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="bg-[#1a1a1a] rounded-2xl p-8 md:p-12 max-w-md w-full mx-4 border border-gray-700">
        {status === "verifying" && (
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#20808D] mb-4"></div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {currentContent.verifying}
            </h2>
          </div>
        )}

        {status === "success" && (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-500/10 mb-4">
              <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {currentContent.success}
            </h2>
          </div>
        )}

        {status === "error" && (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-500/10 mb-4">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {currentContent.error}
            </h2>
            <p className="text-gray-400 mb-4">
              {currentContent.errorDetails}
            </p>
            <p className="text-sm text-gray-500">
              {errorMessage}
            </p>
            <button
              onClick={() => router.push("/")}
              className="mt-6 px-6 py-3 bg-[#20808D] text-white rounded-lg hover:bg-[#1a6a78] transition-colors font-medium"
            >
              홈으로 돌아가기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
