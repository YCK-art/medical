"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { requestSignInLink } from "@/lib/auth";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { language } = useLanguage();
  const [email, setEmail] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editedEmail, setEditedEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [linkSent, setLinkSent] = useState(false);

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(emailParam);
      setEditedEmail(emailParam);
      // 자동으로 매직링크 전송
      sendMagicLink(emailParam);
    } else {
      // 이메일이 없으면 로그인 페이지로 리다이렉트
      router.push("/login");
    }
  }, [searchParams, router]);

  const sendMagicLink = async (emailAddress: string) => {
    try {
      setIsSending(true);
      await requestSignInLink(emailAddress);
      setLinkSent(true);
    } catch (error) {
      console.error("매직링크 전송 실패:", error);
      alert("이메일 전송에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsSending(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (editedEmail.trim() && editedEmail !== email) {
      setEmail(editedEmail);
      setIsEditing(false);
      setLinkSent(false);
      sendMagicLink(editedEmail);
    } else {
      setIsEditing(false);
    }
  };

  const handleResend = () => {
    sendMagicLink(email);
  };

  // Multilingual content
  const content = {
    English: {
      title: "Check Your Email",
      subtitle: "We've sent a magic link to",
      editButton: "Edit",
      resendText: "Didn't receive an email?",
      resendButton: "Resend",
      checkingEmail: "Sending email...",
      linkSentMessage: "Magic link sent! Check your inbox."
    },
    한국어: {
      title: "이메일을 확인하세요",
      subtitle: "매직 링크를 전송했습니다",
      editButton: "수정",
      resendText: "이메일을 받지 못하셨나요?",
      resendButton: "재전송",
      checkingEmail: "이메일 전송 중...",
      linkSentMessage: "매직 링크가 전송되었습니다! 받은편지함을 확인하세요."
    },
    日本語: {
      title: "メールを確認してください",
      subtitle: "マジックリンクを送信しました",
      editButton: "編集",
      resendText: "メールが届きませんでしたか？",
      resendButton: "再送信",
      checkingEmail: "メール送信中...",
      linkSentMessage: "マジックリンクが送信されました！受信トレイを確認してください。"
    }
  };

  const currentContent = content[language as keyof typeof content];

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
          <br />
          <span className="text-white">{email}</span>
        </p>

        {/* Email Display/Edit */}
        <div className="space-y-4 mb-8">
          <div className="flex items-center justify-between px-4 py-3 bg-transparent border border-gray-700 rounded">
            {isEditing ? (
              <input
                type="email"
                value={editedEmail}
                onChange={(e) => setEditedEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSaveEdit();
                  }
                }}
                className="flex-1 bg-transparent text-white text-sm focus:outline-none"
                style={{ fontFamily: "var(--font-helvetica), sans-serif" }}
                autoFocus
              />
            ) : (
              <span
                className="flex-1 text-white text-sm"
                style={{ fontFamily: "var(--font-helvetica), sans-serif" }}
              >
                {email}
              </span>
            )}
            <button
              onClick={isEditing ? handleSaveEdit : handleEdit}
              className="text-white text-sm font-medium ml-4"
              style={{ fontFamily: "var(--font-helvetica), sans-serif" }}
            >
              {isEditing ? "Save" : currentContent.editButton}
            </button>
          </div>
        </div>

        {/* Status Message */}
        {isSending && (
          <p className="text-center text-gray-400 text-sm mb-4">
            {currentContent.checkingEmail}
          </p>
        )}

        {linkSent && !isSending && (
          <p className="text-center text-green-400 text-sm mb-4">
            {currentContent.linkSentMessage}
          </p>
        )}

        {/* Resend Link */}
        <div className="text-center">
          <p className="text-gray-400 text-sm inline" style={{ fontFamily: "var(--font-helvetica), sans-serif" }}>
            {currentContent.resendText}{" "}
          </p>
          <button
            onClick={handleResend}
            disabled={isSending}
            className="text-white text-sm font-medium hover:text-gray-300 transition-colors disabled:opacity-50"
            style={{ fontFamily: "var(--font-helvetica), sans-serif" }}
          >
            {currentContent.resendButton}
          </button>
        </div>
      </div>
    </div>
  );
}
