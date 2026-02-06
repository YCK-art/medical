"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Toolbar from "@/app/components/Toolbar";
import Footer from '@/app/components/Footer';
import { signInWithGoogle } from "@/lib/auth";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from '@/contexts/LanguageContext';

export default function MissionPage() {
  const router = useRouter();
  const { effectiveTheme } = useTheme();
  const { language } = useLanguage();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [displayedText, setDisplayedText] = useState("");

  const content = {
    English: {
      heroText: "For the Animals We Love",
      futureTitle: "The Future of Care Is Compassionate",
      futureSubtitle: "Ruleout exists to empower veterinarians with instant, evidence-based knowledge at the moment clinical decisions matter most.",
      learnMore: "Join Us",
      loginTitle: "Log in or Sign up",
      loginSubtitle: "Choose your work email.",
      whyNeeded: "Why is this needed?",
      continueGoogle: "Continue with Google",
      continueMicrosoft: "Continue with Microsoft",
      continueApple: "Continue with Apple",
      continueEmail: "Continue with Email",
      or: "or",
      missionParagraph1: "Veterinary medicine is evolving at an unprecedented pace. Thousands of research papers, guidelines, and clinical recommendations are published every year across the world. Yet much of this knowledge remains scattered, difficult to search, and inaccessible during real clinical workflows. Veterinarians are expected to synthesize this growing body of evidence while managing heavy caseloads and making high-stakes decisions under pressure. Meanwhile, the animals they care for cannot explain their symptoms, question decisions, or advocate for themselves.",
      missionParagraph2: "Ruleout was created to close this gap.",
      missionParagraph2Sub: "By unifying trusted research, global veterinary guidelines, and clinically relevant evidence into a single intelligent platform, Ruleout enables veterinarians to access reliable knowledge instantly and apply it with confidence. We do not replace clinical judgment — we strengthen it. We surface evidence clearly, indicate its source and recency, and make uncertainty visible when consensus is evolving.",
      missionParagraph3: "We believe that better access to evidence leads to better decisions, safer care, and improved outcomes for animals. When veterinarians are supported by the best available knowledge, families gain more time with the companions they love, and clinical practice becomes more humane, consistent, and resilient.",
      missionParagraph4: "Ruleout is built for those who understand that protecting animals is not only a medical responsibility, but a professional and ethical commitment. We stand with the veterinarians who carry this responsibility every day, and we are committed to building tools that respect their expertise while elevating the standard of care across the profession.",
      missionParagraph5: "If you believe in a future where veterinary medicine is guided by accessible science, where technology reinforces — not replaces — professional judgment, and where animals receive the quality of care they deserve, we invite you to join us.",
      missionParagraph5Bold: ""
    },
    한국어: {
      heroText: "우리가 사랑하는 동물들을 위하여",
      futureTitle: "미래의 치료는 공감입니다",
      futureSubtitle: "우리는 수의사들이 근거에 기반한 정보를 바탕으로 더 나은 판단을 내릴 수 있도록 돕고, 그 결과 동물들이 더 건강한 삶을 살아갈 수 있는 세상을 만들어가고자 합니다.",
      learnMore: "자세히 알아보기",
      loginTitle: "로그인 또는 회원가입",
      loginSubtitle: "업무용 이메일을 선택하세요.",
      whyNeeded: "왜 필요한가요?",
      continueGoogle: "Google로 계속하기",
      continueMicrosoft: "Microsoft로 계속하기",
      continueApple: "Apple로 계속하기",
      continueEmail: "이메일로 계속하기",
      or: "또는",
      missionParagraph1: "수의학에서 꼭 필요한 지식은 지금도 빠르게 늘어나고 있습니다. 전 세계에서 매년 수십만 편의 연구 논문과 가이드라인, 임상 자료가 발표되지만, 이 정보의 대부분은 흩어져 있고 찾기 어렵습니다. 특히 실제 진료 현장에서 가장 필요한 순간에는 접근조차 쉽지 않습니다. 수의사들은 과중한 진료 일정 속에서도 이 방대한 정보를 따라가야 하며, 압박 속에서 생명과 직결된 결정을 내려야 합니다. 하지만 진료를 받는 동물들은 자신의 증상을 말할 수도, 문제가 생겼을 때 스스로를 보호할 수도 없습니다.",
      missionParagraph2: "Ruleout은 이러한 현실적인 문제에서 출발했습니다.",
      missionParagraph2Sub: "신뢰할 수 있는 연구, 글로벌 가이드라인, 실제 임상 근거를 하나의 지능형 플랫폼으로 통합하여, 수의사들이 필요한 정보를 즉시 확인하고 확신을 가지고 진료에 적용할 수 있도록 돕습니다. 여러 출처를 오가며 검색할 필요도, 불확실한 추측에 의존할 필요도 없습니다. 오직 더 나은 진료 결과를 위한 명확하고 신뢰할 수 있는 정보만 제공합니다.",
      missionParagraph3: "우리는 수의사들이 제대로 된 도구를 갖출 때, 동물들은 더 건강하고 안전한 삶을 살 수 있다고 믿습니다. 가족들은 사랑하는 반려동물과 더 오래 함께할 수 있고, 사회는 더 따뜻해집니다. 그리고 우리가 함께 살아가는 이 지구는 모든 생명에게 조금 더 건강한 곳이 됩니다.",
      missionParagraph4: "Ruleout은 동물을 보호하는 일이 단순한 의료 행위를 넘어, 우리 모두가 함께 책임져야 할 가치라고 믿는 사람들을 위해 존재합니다. 우리는 매일 그 책임을 짊어지는 수의사들과, 반려동물에게 최선의 삶을 주고자 하는 보호자들을 지원합니다.",
      missionParagraph5: "과학이 모든 동물병원에서 쉽게 닿을 수 있는 미래, 기술을 통해 따뜻한 진료가 더욱 강화되는 미래, 그리고 동물들이 마땅히 누려야 할 삶의 질을 보장받는 미래를 믿는다면, Ruleout과 함께해 주세요. 함께 수의학의 기준을 높이고, 더 많은 생명을 지키며, 이 지구에서 살아가는 모든 생명에게 ",
      missionParagraph5Bold: "더 나은 내일을 만들어갈 수 있습니다."
    },
    日本語: {
      heroText: "私たちが愛する動物たちのために",
      futureTitle: "ケアの未来は、思いやりから始まる",
      futureSubtitle: "私たちは、獣医師が根拠に基づいた情報をもとに、より良い判断ができるようにし、動物たちがより健康に生きられる社会を目指しています。",
      learnMore: "詳しく見る",
      loginTitle: "ログインまたはサインアップ",
      loginSubtitle: "業務用メールアドレスを選択してください。",
      whyNeeded: "なぜ必要ですか？",
      continueGoogle: "Googleで続ける",
      continueMicrosoft: "Microsoftで続ける",
      continueApple: "Appleで続ける",
      continueEmail: "メールアドレスで続ける",
      or: "または",
      missionParagraph1: "獣医療に不可欠な知識は、今も急速に増え続けています。世界中で毎年、数十万本もの研究論文、ガイドライン、臨床資料が発表されていますが、それらの多くは分散しており、検索が難しく、実際の診療現場で最も必要な場面では十分に活用できていません。獣医師は、忙しい診療業務の中で膨大な情報に向き合いながら、強いプレッシャーの下で命に関わる判断を求められます。一方で、治療を受ける動物たちは、自分の症状を言葉で伝えることも、問題が起きたときに自らを守ることもできません。",
      missionParagraph2: "Ruleoutは、こうした現実的な課題から生まれました。",
      missionParagraph2Sub: "信頼できる研究、グローバルなガイドライン、実際の臨床エビデンスを一つのインテリジェントなプラットフォームに集約することで、獣医師が必要な情報にすぐアクセスし、自信を持って診療に活かせる環境を提供します。複数の情報源を行き来する必要も、推測に頼る必要もありません。あるのは、より良い診療結果を支える明確で信頼性の高い情報だけです。",
      missionParagraph3: "私たちは、獣医師が適切なツールを手にしたとき、動物たちはより健康で安全な生活を送れると信じています。家族は大切な伴侶動物とより長い時間を共有でき、社会はより思いやりに満ちたものになります。そして、私たちが共に暮らすこの地球は、すべての生命にとってより健やかな場所になります。",
      missionParagraph4: "Ruleoutは、動物を守ることが単なる医療行為ではなく、私たち全員が共有すべき責任であると考える人々のために存在します。私たちは、その責任を日々担う獣医師と、動物たちに最善のケアを届けたいと願うすべての人を支援します。",
      missionParagraph5: "科学がすべての動物病院で身近になる未来、テクノロジーによって思いやりある診療がさらに強化される未来、そして動物たちが本来受けるべき生活の質を守れる未来を信じるなら、ぜひRuleoutに参加してください。共に獣医療の水準を高め、より多くの命を守り、この地球で生きるすべての生命にとって、",
      missionParagraph5Bold: "より良い未来を築いていきましょう。"
    }
  };

  const t = content[language];
  const fullText = t.heroText;

  useEffect(() => {
    setDisplayedText(""); // 언어 변경시 텍스트 초기화
    let currentIndex = 0;
    const typingInterval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setDisplayedText(fullText.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(typingInterval);
      }
    }, 100); // 100ms마다 한 글자씩

    return () => clearInterval(typingInterval);
  }, [fullText, language]);

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

  return (
    <div className={`min-h-screen ${effectiveTheme === "light" ? "bg-white text-gray-900" : "bg-[#1a1a1a] text-white"}`}>
      {/* Toolbar */}
      <Toolbar onLoginClick={handleLogin} />

      {/* Mission Content Section */}
      <div className="bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-6 py-20 pb-4">
          {/* Text Content */}
          <div className="mb-16">
            <h2 className="text-4xl md:text-5xl font-normal text-white mb-6" style={{ fontFamily: "var(--font-hedvig-letters-serif), serif" }}>
              {t.futureTitle}
            </h2>
            <p className="text-xl text-gray-300 leading-relaxed max-w-4xl" style={{ fontFamily: "var(--font-helvetica), sans-serif" }}>
              {t.futureSubtitle}
            </p>
          </div>

          {/* Image */}
          <div className="relative w-full h-[700px] rounded-2xl overflow-hidden">
            <Image
              src="/image/animals-Photoroom.png"
              alt="Animals"
              fill
              className="object-contain"
            />
          </div>
        </div>
      </div>

      {/* Third Section - Our Mission */}
      <div className="bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-6 pt-2 pb-20">
          <div className="max-w-4xl">
            <p className="text-xl text-gray-300 leading-relaxed mb-8" style={{ fontFamily: "var(--font-helvetica), sans-serif" }}>
              {t.missionParagraph1}
            </p>

            <p className="text-xl text-gray-300 leading-relaxed mb-8" style={{ fontFamily: "var(--font-helvetica), sans-serif" }}>
              <strong>{t.missionParagraph2}</strong>
              <br />
              {t.missionParagraph2Sub}
            </p>

            <p className="text-xl text-gray-300 leading-relaxed mb-8" style={{ fontFamily: "var(--font-helvetica), sans-serif" }}>
              {t.missionParagraph3}
            </p>

            <p className="text-xl text-gray-300 leading-relaxed mb-8" style={{ fontFamily: "var(--font-helvetica), sans-serif" }}>
              {t.missionParagraph4}
            </p>

            <p className="text-xl text-gray-300 leading-relaxed mb-8" style={{ fontFamily: "var(--font-helvetica), sans-serif" }}>
              {t.missionParagraph5}<em><strong>{t.missionParagraph5Bold}</strong></em>
            </p>

            {/* Learn More Button */}
            <button className="px-8 py-3 bg-white text-black hover:bg-gray-200 rounded-full transition-colors font-medium" style={{ fontFamily: "var(--font-helvetica), sans-serif" }}>
              {t.learnMore}
            </button>
          </div>
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
            className={`${effectiveTheme === "light" ? "bg-white border-gray-200" : "bg-[#1a1a1a] border-gray-700"} rounded-2xl p-8 w-full max-w-md mx-4 relative border`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 닫기 버튼 */}
            <button
              onClick={() => setShowLoginModal(false)}
              className={`absolute top-4 right-4 ${effectiveTheme === "light" ? "text-gray-500 hover:text-gray-700" : "text-gray-400 hover:text-gray-200"}`}
            >
              ✕
            </button>

            {/* Logo and Title */}
            <div className="flex flex-col items-center mb-8">
              <div className="flex items-center space-x-1 mb-6">
                <Image
                  src="/image/logo_candidate1 복사본.png"
                  alt="Ruleout Logo"
                  width={28}
                  height={28}
                  className="object-contain"
                />
                <span className={`text-2xl font-bold ${effectiveTheme === "light" ? "text-gray-900" : "text-white"}`}>Ruleout</span>
              </div>
              <h2 className={`text-3xl font-bold ${effectiveTheme === "light" ? "text-gray-900" : "text-white"} mb-2`}>
                {t.loginTitle}
              </h2>
              <p className={`${effectiveTheme === "light" ? "text-gray-600" : "text-gray-400"}`}>
                {t.loginSubtitle} <a href="#" className="text-[#20808D] hover:underline">{t.whyNeeded}</a>
              </p>
            </div>

            {/* Login Options */}
            <div className="space-y-3">
              {/* Google Login */}
              <button
                onClick={handleGoogleLogin}
                className={`w-full flex items-center justify-center px-6 py-4 border-2 ${effectiveTheme === "light" ? "border-gray-300 hover:border-gray-400 bg-gray-50" : "border-gray-700 hover:border-gray-600 bg-[#2a2a2a]"} rounded-lg transition-colors`}
              >
                <div className="flex items-center space-x-3">
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span className={`font-medium ${effectiveTheme === "light" ? "text-gray-900" : "text-white"}`}>{t.continueGoogle}</span>
                </div>
              </button>

              {/* Microsoft Login */}
              <button
                onClick={() => {/* Microsoft 로그인 구현 예정 */}}
                className={`w-full flex items-center justify-center px-6 py-4 border-2 ${effectiveTheme === "light" ? "border-gray-300 hover:border-gray-400 bg-gray-50" : "border-gray-700 hover:border-gray-600 bg-[#2a2a2a]"} rounded-lg transition-colors`}
              >
                <div className="flex items-center space-x-3">
                  <svg className="w-6 h-6" viewBox="0 0 23 23">
                    <path fill="#f3f3f3" d="M0 0h23v23H0z"/>
                    <path fill="#f35325" d="M1 1h10v10H1z"/>
                    <path fill="#81bc06" d="M12 1h10v10H12z"/>
                    <path fill="#05a6f0" d="M1 12h10v10H1z"/>
                    <path fill="#ffba08" d="M12 12h10v10H12z"/>
                  </svg>
                  <span className={`font-medium ${effectiveTheme === "light" ? "text-gray-900" : "text-white"}`}>{t.continueMicrosoft}</span>
                </div>
              </button>

              {/* Apple Login */}
              <button
                onClick={() => {/* Apple 로그인 구현 예정 */}}
                className={`w-full flex items-center justify-center px-6 py-4 border-2 ${effectiveTheme === "light" ? "border-gray-300 hover:border-gray-400 bg-gray-50" : "border-gray-700 hover:border-gray-600 bg-[#2a2a2a]"} rounded-lg transition-colors`}
              >
                <div className="flex items-center space-x-3">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill={effectiveTheme === "light" ? "black" : "white"}>
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                  </svg>
                  <span className={`font-medium ${effectiveTheme === "light" ? "text-gray-900" : "text-white"}`}>{t.continueApple}</span>
                </div>
              </button>

              {/* Divider */}
              <div className="flex items-center my-4">
                <div className={`flex-1 border-t ${effectiveTheme === "light" ? "border-gray-300" : "border-gray-700"}`}></div>
                <span className={`px-4 ${effectiveTheme === "light" ? "text-gray-600" : "text-gray-400"}`}>{t.or}</span>
                <div className={`flex-1 border-t ${effectiveTheme === "light" ? "border-gray-300" : "border-gray-700"}`}></div>
              </div>

              {/* Email Login */}
              <button
                onClick={() => {/* 이메일 로그인 구현 예정 */}}
                className="w-full px-6 py-4 bg-[#20808D] text-white rounded-lg hover:bg-[#1a6a78] transition-colors font-medium"
              >
                {t.continueEmail}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
