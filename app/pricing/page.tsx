"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronDown, Check } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { signInWithGoogle } from "@/lib/auth";
import Toolbar from "@/app/components/Toolbar";
import Footer from '@/app/components/Footer';
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from '@/contexts/LanguageContext';

// Count-up animation hook
function useCountUp(targetValue: number, duration: number = 500) {
  const [displayValue, setDisplayValue] = useState(targetValue);
  const prevTargetRef = useRef(targetValue);

  useEffect(() => {
    if (prevTargetRef.current === targetValue) return;

    const startValue = prevTargetRef.current;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function for smooth animation
      const easeOutQuad = (t: number) => t * (2 - t);
      const easedProgress = easeOutQuad(progress);

      const currentValue = Math.round(startValue + (targetValue - startValue) * easedProgress);
      setDisplayValue(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        prevTargetRef.current = targetValue;
      }
    };

    requestAnimationFrame(animate);
  }, [targetValue, duration]);

  return displayValue;
}

export default function PricingPage() {
  const router = useRouter();
  const { themeMode, setThemeMode, effectiveTheme } = useTheme();
  const { language } = useLanguage();
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");
  const [showLoginModal, setShowLoginModal] = useState(false);

  const content = {
    English: {
      pricing: "Pricing",
      subtitle: "We are committed to a better life for animals.",
      monthly: "Monthly",
      yearly: "Yearly",
      perMonth: "/mo.",
      off: "% off",
      free: "Free",
      pro: "Pro",
      max: "Max",
      enterprise: "Enterprise",
      letsTalk: "Let's Talk",
      includes: "Includes:",
      getStarted: "Get Started",
      getPro: "Get Pro",
      getMax: "Get Max",
      contactSales: "Contact Sales",
      comparePlans: "Compare plans",
      signUp: "Sign up",
      contactUs: "Contact us",
      usage: "Usage",
      monthlyQuestions: "Monthly Questions",
      priorityProcessing: "Priority Processing",
      evidenceReasoning: "Evidence & Reasoning",
      evidenceBasedAnswers: "Evidence-based answers",
      openAccessSources: "Open-access journal sources",
      evidenceSummary: "Evidence summary",
      differentialDiagnosisList: "Differential diagnosis list",
      complexRareCases: "Complex/rare case handling",
      workflow: "Workflow",
      questionHistory: "Question history storage",
      questionBookmark: "Question bookmark",
      repeatQuestionOptimization: "Repeat question optimization",
      performanceReliability: "Performance & Reliability",
      responseSpeed: "Response speed",
      peakTimeStability: "Peak time stability",
      serviceSLA: "Service SLA",
      supportAccess: "Support & Access",
      customerSupport: "Customer support",
      contractBased: "Contract-based provision",
      legalCompliance: "Legal & compliance documentation",
      unlimited: "Unlimited",
      custom: "Custom",
      basic: "Basic",
      standard: "Standard",
      extended: "Extended",
      limited: "Limited",
      faster: "Faster",
      highestPriority: "Highest priority",
      high: "High",
      community: "Community",
      email: "Email",
      priorityEmail: "Priority email",
      dedicated: "Dedicated",
      disclaimer: "Ruleout provides evidence-based clinical information derived from open-access veterinary literature. It does not provide diagnoses or treatment recommendations.",
      loginTitle: "Log in or Sign up",
      loginSubtitle: "Choose your work email.",
      whyNeeded: "Why is this needed?",
      continueGoogle: "Continue with Google",
      continueMicrosoft: "Continue with Microsoft",
      continueApple: "Continue with Apple",
      continueEmail: "Continue with Email",
      or: "or",
      freeDesc: "Get started with basic features",
      proDesc: "Everything in Free, plus:",
      maxDesc: "Everything in Pro, plus:",
      enterpriseDesc: "Everything in Max, plus:",
      freeFeatures: [
        "5 questions per day",
        "Evidence-based answers from open-access journals",
        "Differential diagnosis candidates",
        "Cited sources with direct links"
      ],
      proFeatures: [
        "500 questions per month",
        "Deeper evidence-based reasoning",
        "Differential diagnoses with literature support",
        "Priority response speed"
      ],
      maxFeatures: [
        "Unlimited questions",
        "No monthly usage cap",
        "Built for frequent and complex cases",
        "Stable performance during peak usage"
      ],
      enterpriseFeatures: [
        "Custom usage limits",
        "Contract-based access",
        "Priority support",
        "Dedicated onboarding"
      ]
    },
    한국어: {
      pricing: "가격",
      subtitle: "우리는 동물들의 더 나은 삶을 위해 헌신합니다.",
      monthly: "월간",
      yearly: "연간",
      perMonth: "/월",
      off: "% 할인",
      free: "무료",
      pro: "프로",
      max: "맥스",
      enterprise: "엔터프라이즈",
      letsTalk: "상담하기",
      includes: "포함 내용:",
      getStarted: "시작하기",
      getPro: "프로 구매",
      getMax: "맥스 구매",
      contactSales: "영업팀 문의",
      comparePlans: "플랜 비교",
      signUp: "가입하기",
      contactUs: "문의하기",
      usage: "사용량",
      monthlyQuestions: "월 질문 수",
      priorityProcessing: "우선 처리",
      evidenceReasoning: "증거 및 추론",
      evidenceBasedAnswers: "증거 기반 답변",
      openAccessSources: "오픈 액세스 논문 출처",
      evidenceSummary: "근거 문장 요약",
      differentialDiagnosisList: "감별진단 리스트",
      complexRareCases: "복합/희귀 케이스 처리",
      workflow: "워크플로우",
      questionHistory: "질문 히스토리 저장",
      questionBookmark: "질문 저장 (Bookmark)",
      repeatQuestionOptimization: "반복 질문 최적화",
      performanceReliability: "성능 및 안정성",
      responseSpeed: "응답 속도",
      peakTimeStability: "피크 타임 안정성",
      serviceSLA: "서비스 SLA",
      supportAccess: "지원 및 액세스",
      customerSupport: "고객 지원",
      contractBased: "계약 기반 제공",
      legalCompliance: "법무·컴플라이언스 문서",
      unlimited: "무제한",
      custom: "맞춤형",
      basic: "기본",
      standard: "표준",
      extended: "확장",
      limited: "제한적",
      faster: "빠름",
      highestPriority: "최우선",
      high: "높음",
      community: "커뮤니티",
      email: "이메일",
      priorityEmail: "우선 이메일",
      dedicated: "전담",
      disclaimer: "Ruleout은 오픈 액세스 수의학 문헌에서 도출된 증거 기반 임상 정보를 제공합니다. 진단이나 치료 권장사항을 제공하지 않습니다.",
      loginTitle: "로그인 또는 회원가입",
      loginSubtitle: "업무용 이메일을 선택하세요.",
      whyNeeded: "왜 필요한가요?",
      continueGoogle: "Google로 계속하기",
      continueMicrosoft: "Microsoft로 계속하기",
      continueApple: "Apple로 계속하기",
      continueEmail: "이메일로 계속하기",
      or: "또는",
      freeDesc: "기본 기능으로 시작하기",
      proDesc: "무료 플랜의 모든 기능 및:",
      maxDesc: "프로 플랜의 모든 기능 및:",
      enterpriseDesc: "맥스 플랜의 모든 기능 및:",
      freeFeatures: [
        "하루 5개 질문",
        "오픈 액세스 저널 기반 답변",
        "감별 진단 후보",
        "직접 링크가 포함된 출처"
      ],
      proFeatures: [
        "월 500개 질문",
        "더 깊은 증거 기반 추론",
        "문헌 지원 감별 진단",
        "우선 응답 속도"
      ],
      maxFeatures: [
        "무제한 질문",
        "월간 사용량 제한 없음",
        "빈번하고 복잡한 케이스에 최적화",
        "피크 시간대 안정적인 성능"
      ],
      enterpriseFeatures: [
        "맞춤형 사용량 제한",
        "계약 기반 액세스",
        "우선 지원",
        "전담 온보딩"
      ]
    },
    日本語: {
      pricing: "料金",
      subtitle: "私たちは動物たちのより良い生活に尽力しています。",
      monthly: "月間",
      yearly: "年間",
      perMonth: "/月",
      off: "% オフ",
      free: "無料",
      pro: "プロ",
      max: "マックス",
      enterprise: "エンタープライズ",
      letsTalk: "相談する",
      includes: "含まれるもの:",
      getStarted: "始める",
      getPro: "プロを取得",
      getMax: "マックスを取得",
      contactSales: "営業に問い合わせ",
      comparePlans: "プランを比較",
      signUp: "サインアップ",
      contactUs: "お問い合わせ",
      usage: "使用量",
      monthlyQuestions: "月間質問数",
      priorityProcessing: "優先処理",
      evidenceReasoning: "エビデンスと推論",
      evidenceBasedAnswers: "エビデンスベースの回答",
      openAccessSources: "オープンアクセス論文ソース",
      evidenceSummary: "エビデンス要約",
      differentialDiagnosisList: "鑑別診断リスト",
      complexRareCases: "複雑/希少ケース処理",
      workflow: "ワークフロー",
      questionHistory: "質問履歴保存",
      questionBookmark: "質問ブックマーク",
      repeatQuestionOptimization: "繰り返し質問最適化",
      performanceReliability: "パフォーマンスと信頼性",
      responseSpeed: "応答速度",
      peakTimeStability: "ピーク時の安定性",
      serviceSLA: "サービスSLA",
      supportAccess: "サポートとアクセス",
      customerSupport: "カスタマーサポート",
      contractBased: "契約ベース提供",
      legalCompliance: "法務・コンプライアンス文書",
      unlimited: "無制限",
      custom: "カスタム",
      basic: "基本",
      standard: "標準",
      extended: "拡張",
      limited: "制限付き",
      faster: "高速",
      highestPriority: "最優先",
      high: "高",
      community: "コミュニティ",
      email: "メール",
      priorityEmail: "優先メール",
      dedicated: "専任",
      disclaimer: "Ruleoutは、オープンアクセスの獣医学文献から得られたエビデンスベースの臨床情報を提供します。診断や治療の推奨は行いません。",
      loginTitle: "ログインまたはサインアップ",
      loginSubtitle: "業務用メールアドレスを選択してください。",
      whyNeeded: "なぜ必要ですか？",
      continueGoogle: "Googleで続ける",
      continueMicrosoft: "Microsoftで続ける",
      continueApple: "Appleで続ける",
      continueEmail: "メールアドレスで続ける",
      or: "または",
      freeDesc: "基本機能から始める",
      proDesc: "無料プランのすべて、さらに:",
      maxDesc: "プロプランのすべて、さらに:",
      enterpriseDesc: "マックスプランのすべて、さらに:",
      freeFeatures: [
        "1日5つの質問",
        "オープンアクセスジャーナルに基づく回答",
        "鑑別診断候補",
        "直接リンク付きの出典"
      ],
      proFeatures: [
        "月500の質問",
        "より深いエビデンスベースの推論",
        "文献サポート付き鑑別診断",
        "優先応答速度"
      ],
      maxFeatures: [
        "無制限の質問",
        "月間使用量制限なし",
        "頻繁で複雑なケースに最適化",
        "ピーク時の安定したパフォーマンス"
      ],
      enterpriseFeatures: [
        "カスタム使用制限",
        "契約ベースのアクセス",
        "優先サポート",
        "専任オンボーディング"
      ]
    }
  };

  const t = content[language];

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

  const getButtonStyle = (isPrimary: boolean) => {
    if (isPrimary) {
      return "bg-[#20808D] hover:bg-[#1a6a78] text-white";
    }
    return effectiveTheme === "light"
      ? "border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-900"
      : "border border-gray-700 hover:bg-gray-800 text-white";
  };

  const plans = [
    {
      name: t.free,
      monthlyPrice: 0,
      yearlyPricePerMonth: 0,
      description: t.freeDesc,
      features: t.freeFeatures,
      buttonText: t.getStarted,
      buttonStyle: getButtonStyle(false),
      onClick: () => setShowLoginModal(true)
    },
    {
      name: t.pro,
      monthlyPrice: 29,
      yearlyPricePerMonth: 22,
      description: t.proDesc,
      features: t.proFeatures,
      buttonText: t.getPro,
      buttonStyle: getButtonStyle(true),
      recommended: true
    },
    {
      name: t.max,
      monthlyPrice: 60,
      yearlyPricePerMonth: 45,
      description: t.maxDesc,
      features: t.maxFeatures,
      buttonText: t.getMax,
      buttonStyle: getButtonStyle(false)
    },
    {
      name: t.enterprise,
      monthlyPrice: null,
      yearlyPricePerMonth: null,
      description: t.enterpriseDesc,
      features: t.enterpriseFeatures,
      buttonText: t.contactSales,
      buttonStyle: getButtonStyle(false),
      isEnterprise: true
    }
  ];

  return (
    <div className={`min-h-screen ${effectiveTheme === "light" ? "bg-white text-gray-900" : "bg-[#1a1a1a] text-white"}`}>
      {/* Toolbar */}
      <Toolbar onLoginClick={handleLogin} />

      {/* Pricing Content */}
      <div className="max-w-7xl mx-auto px-6 py-20 pt-32" style={{ marginTop: '20px' }}>
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className={`text-5xl font-bold mb-4 ${effectiveTheme === "light" ? "text-gray-900" : "text-white"}`} style={{ fontFamily: "'TikTok Sans', sans-serif" }}>{t.pricing}</h1>
          <p className={`text-xl ${effectiveTheme === "light" ? "text-gray-600" : "text-gray-400"} mb-10`} style={{ fontFamily: "'TikTok Sans', sans-serif" }}>{t.subtitle}</p>

          {/* Billing Segment Control */}
          <div className={`inline-flex items-center ${effectiveTheme === "light" ? "bg-gray-100" : "bg-[#2a2a2a]"} rounded-xl p-1 mb-4`}>
            <button
              onClick={() => setBillingPeriod("monthly")}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                billingPeriod === "monthly"
                  ? effectiveTheme === "light" ? "bg-white text-gray-900 shadow-sm" : "bg-[#3a3a3a] text-white"
                  : effectiveTheme === "light" ? "text-gray-600 hover:text-gray-900" : "text-gray-400 hover:text-gray-200"
              }`}
            >
              {t.monthly}
            </button>
            <button
              onClick={() => setBillingPeriod("yearly")}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                billingPeriod === "yearly"
                  ? effectiveTheme === "light" ? "bg-white text-gray-900 shadow-sm" : "bg-[#3a3a3a] text-white"
                  : effectiveTheme === "light" ? "text-gray-600 hover:text-gray-900" : "text-gray-400 hover:text-gray-200"
              }`}
            >
              {t.yearly}
            </button>
          </div>
        </div>

        {/* Plans and Pricing Section */}
        <div className="mb-16 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-6">
            {plans.map((plan, index) => {
              const price = billingPeriod === "monthly" ? plan.monthlyPrice : plan.yearlyPricePerMonth;
              const animatedPrice = useCountUp(price || 0);
              const discount = plan.monthlyPrice && plan.monthlyPrice > 0
                ? Math.round((1 - (plan.yearlyPricePerMonth || 0) / plan.monthlyPrice) * 100)
                : 0;

              return (
                <div
                  key={index}
                  className={`${
                    effectiveTheme === "light"
                      ? plan.recommended
                        ? "bg-gradient-to-br from-gray-50 via-white to-gray-50 border-[#20808D]"
                        : "bg-gradient-to-br from-gray-50 via-white to-gray-100 border-gray-300"
                      : plan.recommended
                        ? "bg-gradient-to-br from-[#252525] via-[#212121] to-[#1a1a1a] border-[#20808D]"
                        : "bg-gradient-to-br from-[#252525] via-[#212121] to-[#181818] border-gray-700"
                  } border-2 rounded-2xl p-8 relative flex flex-col`}
                  style={{
                    boxShadow: plan.recommended
                      ? effectiveTheme === "light"
                        ? "0 20px 50px -12px rgba(32, 128, 141, 0.15), 0 8px 16px -8px rgba(0, 0, 0, 0.1), inset 0 2px 4px rgba(255, 255, 255, 0.8)"
                        : "0 20px 50px -12px rgba(32, 128, 141, 0.25), 0 8px 16px -8px rgba(0, 0, 0, 0.3), inset 0 2px 4px rgba(255, 255, 255, 0.1), inset 0 -2px 4px rgba(0, 0, 0, 0.1)"
                      : effectiveTheme === "light"
                        ? "0 20px 50px -12px rgba(0, 0, 0, 0.08), 0 8px 16px -8px rgba(0, 0, 0, 0.06)"
                        : "0 20px 50px -12px rgba(0, 0, 0, 0.4), 0 8px 16px -8px rgba(0, 0, 0, 0.3), inset 0 2px 4px rgba(255, 255, 255, 0.05), inset 0 -2px 4px rgba(0, 0, 0, 0.2)",
                    transform: "perspective(1000px) rotateX(2deg)",
                    transformStyle: "preserve-3d"
                  }}
                >

                  <div className="mb-6 relative z-20">
                    <h3 className={`text-2xl font-bold mb-2 ${effectiveTheme === "light" ? "text-gray-900" : "text-white"}`}>{plan.name}</h3>
                    <div className="flex items-baseline gap-3 mb-2">
                      {plan.isEnterprise ? (
                        <div className="flex items-baseline">
                          <span className={`text-4xl font-bold ${effectiveTheme === "light" ? "text-gray-900" : "text-white"}`}>{t.letsTalk}</span>
                        </div>
                      ) : plan.monthlyPrice === 0 ? (
                        <div className="flex items-baseline">
                          <span className={`text-4xl font-bold ${effectiveTheme === "light" ? "text-gray-900" : "text-white"}`}>{t.free}</span>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-baseline">
                            <span className={`text-4xl font-bold ${effectiveTheme === "light" ? "text-gray-900" : "text-white"}`}>${animatedPrice}</span>
                            <span className={`ml-2 ${effectiveTheme === "light" ? "text-gray-600" : "text-gray-400"}`}>{t.perMonth}</span>
                          </div>
                          {billingPeriod === "yearly" && discount > 0 && (
                            <span className="text-[#20808D] text-sm font-semibold">
                              {discount}{t.off}
                            </span>
                          )}
                        </>
                      )}
                    </div>
                    {plan.name === t.free && <p className={`text-sm ${effectiveTheme === "light" ? "text-gray-600" : "text-gray-400"}`}>{t.includes}</p>}
                    {plan.name !== t.free && <p className={`text-sm ${effectiveTheme === "light" ? "text-gray-600" : "text-gray-400"}`}>{plan.description}</p>}
                  </div>

                  <div className="mb-8 space-y-3 flex-grow">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-start space-x-2">
                        <Check className="w-4 h-4 text-[#20808D] mt-0.5 flex-shrink-0" />
                        <span className={`text-sm ${effectiveTheme === "light" ? "text-gray-700" : "text-gray-300"}`}>{feature}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={plan.onClick}
                    className={`w-full py-3 rounded-lg font-medium transition-all duration-200 relative z-20 ${plan.buttonStyle}`}
                    style={{
                      boxShadow: plan.buttonStyle.includes('bg-[#20808D]')
                        ? '0 4px 14px rgba(32, 128, 141, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2), inset 0 -1px 0 rgba(0, 0, 0, 0.2)'
                        : '0 2px 8px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.2)',
                      transform: 'translateZ(10px)',
                    }}
                    onMouseEnter={(e) => {
                      if (plan.buttonStyle.includes('bg-[#20808D]')) {
                        e.currentTarget.style.boxShadow = '0 6px 20px rgba(32, 128, 141, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.2), inset 0 -1px 0 rgba(0, 0, 0, 0.2)';
                        e.currentTarget.style.transform = 'translateY(-2px) translateZ(10px)';
                      } else {
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15), inset 0 -1px 0 rgba(0, 0, 0, 0.2)';
                        e.currentTarget.style.transform = 'translateY(-1px) translateZ(10px)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (plan.buttonStyle.includes('bg-[#20808D]')) {
                        e.currentTarget.style.boxShadow = '0 4px 14px rgba(32, 128, 141, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2), inset 0 -1px 0 rgba(0, 0, 0, 0.2)';
                      } else {
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.2)';
                      }
                      e.currentTarget.style.transform = 'translateZ(10px)';
                    }}
                  >
                    {plan.buttonText}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Compare Plans Section */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <h2 className={`text-5xl font-bold text-center mb-16 ${effectiveTheme === "light" ? "text-gray-900" : "text-white"}`} style={{ fontFamily: "'TikTok Sans', sans-serif" }}>{t.comparePlans}</h2>

        <div className="overflow-x-auto">
          <table className="w-full">
            {/* Table Header */}
            <thead>
              <tr className={`border-b ${effectiveTheme === "light" ? "border-gray-200" : "border-gray-800"}`}>
                <th className={`text-left py-6 px-4 font-normal ${effectiveTheme === "light" ? "text-gray-600" : "text-gray-400"} w-1/6`}></th>

                {/* Free Plan */}
                <th className="text-center py-6 px-4">
                  <div className="flex flex-col items-center gap-4">
                    <div className={`font-bold text-xl ${effectiveTheme === "light" ? "text-gray-900" : "text-white"}`}>{t.free}</div>
                    <div className={`text-sm ${effectiveTheme === "light" ? "text-gray-600" : "text-gray-400"}`}>
                      <span className={`text-2xl font-bold ${effectiveTheme === "light" ? "text-gray-900" : "text-white"}`}>$0</span> {t.perMonth}
                    </div>
                    <button
                      onClick={() => setShowLoginModal(true)}
                      className={`w-full px-6 py-2.5 border-2 ${
                        effectiveTheme === "light"
                          ? "border-gray-300 hover:border-gray-400 text-gray-900 hover:bg-gray-50"
                          : "border-gray-700 hover:border-gray-600 text-white hover:bg-[#252525]"
                      } rounded-lg transition-all duration-200 font-medium`}
                      style={{
                        boxShadow: effectiveTheme === "light"
                          ? '0 2px 8px rgba(0, 0, 0, 0.1)'
                          : '0 2px 8px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                      }}
                    >
                      {t.signUp}
                    </button>
                  </div>
                </th>

                {/* Pro Plan */}
                <th className="text-center py-6 px-4">
                  <div className="flex flex-col items-center gap-4">
                    <div className={`font-bold text-xl ${effectiveTheme === "light" ? "text-gray-900" : "text-white"}`}>{t.pro}</div>
                    <div className={`text-sm ${effectiveTheme === "light" ? "text-gray-600" : "text-gray-400"}`}>
                      <span className={`text-2xl font-bold ${effectiveTheme === "light" ? "text-gray-900" : "text-white"}`}>${billingPeriod === "monthly" ? 29 : 22}</span> {t.perMonth}
                    </div>
                    <button
                      className="w-full px-6 py-2.5 bg-[#20808D] rounded-lg hover:bg-[#1a6b77] transition-all duration-200 text-white font-medium"
                      style={{
                        boxShadow: '0 4px 14px rgba(32, 128, 141, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                      }}
                    >
                      {t.signUp}
                    </button>
                  </div>
                </th>

                {/* Max Plan */}
                <th className="text-center py-6 px-4">
                  <div className="flex flex-col items-center gap-4">
                    <div className={`font-bold text-xl ${effectiveTheme === "light" ? "text-gray-900" : "text-white"}`}>{t.max}</div>
                    <div className={`text-sm ${effectiveTheme === "light" ? "text-gray-600" : "text-gray-400"}`}>
                      <span className={`text-2xl font-bold ${effectiveTheme === "light" ? "text-gray-900" : "text-white"}`}>${billingPeriod === "monthly" ? 60 : 45}</span> {t.perMonth}
                    </div>
                    <button
                      className={`w-full px-6 py-2.5 border-2 ${
                        effectiveTheme === "light"
                          ? "border-gray-300 hover:border-gray-400 text-gray-900 hover:bg-gray-50"
                          : "border-gray-700 hover:border-gray-600 text-white hover:bg-[#252525]"
                      } rounded-lg transition-all duration-200 font-medium`}
                      style={{
                        boxShadow: effectiveTheme === "light"
                          ? '0 2px 8px rgba(0, 0, 0, 0.1)'
                          : '0 2px 8px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                      }}
                    >
                      {t.signUp}
                    </button>
                  </div>
                </th>

                {/* Enterprise Plan */}
                <th className="text-center py-6 px-4">
                  <div className="flex flex-col items-center gap-4">
                    <div className={`font-bold text-xl ${effectiveTheme === "light" ? "text-gray-900" : "text-white"}`}>{t.enterprise}</div>
                    <div className={`text-sm h-[40px] flex items-center justify-center ${effectiveTheme === "light" ? "text-gray-600" : "text-gray-400"}`}>
                      <span className={`text-lg font-semibold ${effectiveTheme === "light" ? "text-gray-900" : "text-white"}`}>{t.contactUs}</span>
                    </div>
                    <button
                      className={`w-full px-6 py-2.5 border-2 ${
                        effectiveTheme === "light"
                          ? "border-gray-300 hover:border-gray-400 text-gray-900 hover:bg-gray-50"
                          : "border-gray-700 hover:border-gray-600 text-white hover:bg-[#252525]"
                      } rounded-lg transition-all duration-200 font-medium`}
                      style={{
                        boxShadow: effectiveTheme === "light"
                          ? '0 2px 8px rgba(0, 0, 0, 0.1)'
                          : '0 2px 8px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                      }}
                    >
                      {t.contactUs}
                    </button>
                  </div>
                </th>
              </tr>
            </thead>

            <tbody>
              {/* Usage Section */}
              <tr className={`border-b ${effectiveTheme === "light" ? "border-gray-200" : "border-gray-800"}`}>
                <td colSpan={5} className="py-4 px-4">
                  <div className={`font-semibold ${effectiveTheme === "light" ? "text-gray-900" : "text-white"}`}>{t.usage}</div>
                </td>
              </tr>

              <tr className={`border-b ${effectiveTheme === "light" ? "border-gray-200 hover:bg-gray-50" : "border-gray-700 hover:bg-[#252525]"} transition-colors`}>
                <td className={`py-4 px-4 ${effectiveTheme === "light" ? "text-gray-700" : "text-gray-300"}`}>{t.monthlyQuestions}</td>
                <td className={`py-4 px-4 text-center ${effectiveTheme === "light" ? "text-gray-700" : "text-gray-300"}`}>5 / day</td>
                <td className={`py-4 px-4 text-center ${effectiveTheme === "light" ? "text-gray-700" : "text-gray-300"}`}>500 / month</td>
                <td className={`py-4 px-4 text-center ${effectiveTheme === "light" ? "text-gray-700" : "text-gray-300"}`}>{t.unlimited}</td>
                <td className={`py-4 px-4 text-center ${effectiveTheme === "light" ? "text-gray-700" : "text-gray-300"}`}>{t.custom}</td>
              </tr>

              <tr className={`border-b ${effectiveTheme === "light" ? "border-gray-200 hover:bg-gray-50" : "border-gray-700 hover:bg-[#252525]"} transition-colors`}>
                <td className={`py-4 px-4 ${effectiveTheme === "light" ? "text-gray-700" : "text-gray-300"}`}>{t.priorityProcessing}</td>
                <td className="py-4 px-4 text-center">
                  <span className="inline-block w-5 h-5 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center mx-auto">✕</span>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className="inline-block w-5 h-5 rounded-full bg-[#4DB8C4]/20 text-[#4DB8C4] flex items-center justify-center mx-auto">✓</span>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className="inline-block w-5 h-5 rounded-full bg-[#4DB8C4]/20 text-[#4DB8C4] flex items-center justify-center mx-auto">✓</span>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className="inline-block w-5 h-5 rounded-full bg-[#4DB8C4]/20 text-[#4DB8C4] flex items-center justify-center mx-auto">✓</span>
                </td>
              </tr>

              {/* Evidence & Reasoning Section */}
              <tr className={`border-b ${effectiveTheme === "light" ? "border-gray-200" : "border-gray-800"}`}>
                <td colSpan={5} className="py-4 px-4">
                  <div className={`font-semibold ${effectiveTheme === "light" ? "text-gray-900" : "text-white"}`}>{t.evidenceReasoning}</div>
                </td>
              </tr>

              <tr className={`border-b ${effectiveTheme === "light" ? "border-gray-200 hover:bg-gray-50" : "border-gray-700 hover:bg-[#252525]"} transition-colors`}>
                <td className={`py-4 px-4 ${effectiveTheme === "light" ? "text-gray-700" : "text-gray-300"}`}>{t.evidenceBasedAnswers}</td>
                <td className="py-4 px-4 text-center">
                  <span className="inline-block w-5 h-5 rounded-full bg-[#4DB8C4]/20 text-[#4DB8C4] flex items-center justify-center mx-auto">✓</span>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className="inline-block w-5 h-5 rounded-full bg-[#4DB8C4]/20 text-[#4DB8C4] flex items-center justify-center mx-auto">✓</span>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className="inline-block w-5 h-5 rounded-full bg-[#4DB8C4]/20 text-[#4DB8C4] flex items-center justify-center mx-auto">✓</span>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className="inline-block w-5 h-5 rounded-full bg-[#4DB8C4]/20 text-[#4DB8C4] flex items-center justify-center mx-auto">✓</span>
                </td>
              </tr>

              <tr className={`border-b ${effectiveTheme === "light" ? "border-gray-200 hover:bg-gray-50" : "border-gray-700 hover:bg-[#252525]"} transition-colors`}>
                <td className={`py-4 px-4 ${effectiveTheme === "light" ? "text-gray-700" : "text-gray-300"}`}>{t.openAccessSources}</td>
                <td className="py-4 px-4 text-center">
                  <span className="inline-block w-5 h-5 rounded-full bg-[#4DB8C4]/20 text-[#4DB8C4] flex items-center justify-center mx-auto">✓</span>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className="inline-block w-5 h-5 rounded-full bg-[#4DB8C4]/20 text-[#4DB8C4] flex items-center justify-center mx-auto">✓</span>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className="inline-block w-5 h-5 rounded-full bg-[#4DB8C4]/20 text-[#4DB8C4] flex items-center justify-center mx-auto">✓</span>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className="inline-block w-5 h-5 rounded-full bg-[#4DB8C4]/20 text-[#4DB8C4] flex items-center justify-center mx-auto">✓</span>
                </td>
              </tr>

              <tr className={`border-b ${effectiveTheme === "light" ? "border-gray-200 hover:bg-gray-50" : "border-gray-700 hover:bg-[#252525]"} transition-colors`}>
                <td className={`py-4 px-4 ${effectiveTheme === "light" ? "text-gray-700" : "text-gray-300"}`}>{t.evidenceSummary}</td>
                <td className={`py-4 px-4 text-center ${effectiveTheme === "light" ? "text-gray-700" : "text-gray-300"}`}>{t.basic}</td>
                <td className={`py-4 px-4 text-center ${effectiveTheme === "light" ? "text-gray-700" : "text-gray-300"}`}>{t.standard}</td>
                <td className={`py-4 px-4 text-center ${effectiveTheme === "light" ? "text-gray-700" : "text-gray-300"}`}>{t.extended}</td>
                <td className={`py-4 px-4 text-center ${effectiveTheme === "light" ? "text-gray-700" : "text-gray-300"}`}>{t.extended}</td>
              </tr>

              <tr className={`border-b ${effectiveTheme === "light" ? "border-gray-200 hover:bg-gray-50" : "border-gray-700 hover:bg-[#252525]"} transition-colors`}>
                <td className={`py-4 px-4 ${effectiveTheme === "light" ? "text-gray-700" : "text-gray-300"}`}>{t.differentialDiagnosisList}</td>
                <td className="py-4 px-4 text-center">
                  <span className="inline-block w-5 h-5 rounded-full bg-[#4DB8C4]/20 text-[#4DB8C4] flex items-center justify-center mx-auto">✓</span>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className="inline-block w-5 h-5 rounded-full bg-[#4DB8C4]/20 text-[#4DB8C4] flex items-center justify-center mx-auto">✓</span>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className="inline-block w-5 h-5 rounded-full bg-[#4DB8C4]/20 text-[#4DB8C4] flex items-center justify-center mx-auto">✓</span>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className="inline-block w-5 h-5 rounded-full bg-[#4DB8C4]/20 text-[#4DB8C4] flex items-center justify-center mx-auto">✓</span>
                </td>
              </tr>

              <tr className={`border-b ${effectiveTheme === "light" ? "border-gray-200 hover:bg-gray-50" : "border-gray-700 hover:bg-[#252525]"} transition-colors`}>
                <td className={`py-4 px-4 ${effectiveTheme === "light" ? "text-gray-700" : "text-gray-300"}`}>{t.complexRareCases}</td>
                <td className="py-4 px-4 text-center">
                  <span className="inline-block w-5 h-5 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center mx-auto">✕</span>
                </td>
                <td className={`py-4 px-4 text-center ${effectiveTheme === "light" ? "text-gray-700" : "text-gray-300"}`}>{t.limited}</td>
                <td className="py-4 px-4 text-center">
                  <span className="inline-block w-5 h-5 rounded-full bg-[#4DB8C4]/20 text-[#4DB8C4] flex items-center justify-center mx-auto">✓</span>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className="inline-block w-5 h-5 rounded-full bg-[#4DB8C4]/20 text-[#4DB8C4] flex items-center justify-center mx-auto">✓</span>
                </td>
              </tr>

              {/* Workflow Section */}
              <tr className={`border-b ${effectiveTheme === "light" ? "border-gray-200" : "border-gray-800"}`}>
                <td colSpan={5} className="py-4 px-4">
                  <div className={`font-semibold ${effectiveTheme === "light" ? "text-gray-900" : "text-white"}`}>{t.workflow}</div>
                </td>
              </tr>

              <tr className={`border-b ${effectiveTheme === "light" ? "border-gray-200 hover:bg-gray-50" : "border-gray-700 hover:bg-[#252525]"} transition-colors`}>
                <td className={`py-4 px-4 ${effectiveTheme === "light" ? "text-gray-700" : "text-gray-300"}`}>{t.questionHistory}</td>
                <td className="py-4 px-4 text-center">
                  <span className="inline-block w-5 h-5 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center mx-auto">✕</span>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className="inline-block w-5 h-5 rounded-full bg-[#4DB8C4]/20 text-[#4DB8C4] flex items-center justify-center mx-auto">✓</span>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className="inline-block w-5 h-5 rounded-full bg-[#4DB8C4]/20 text-[#4DB8C4] flex items-center justify-center mx-auto">✓</span>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className="inline-block w-5 h-5 rounded-full bg-[#4DB8C4]/20 text-[#4DB8C4] flex items-center justify-center mx-auto">✓</span>
                </td>
              </tr>

              <tr className={`border-b ${effectiveTheme === "light" ? "border-gray-200 hover:bg-gray-50" : "border-gray-700 hover:bg-[#252525]"} transition-colors`}>
                <td className={`py-4 px-4 ${effectiveTheme === "light" ? "text-gray-700" : "text-gray-300"}`}>{t.questionBookmark}</td>
                <td className="py-4 px-4 text-center">
                  <span className="inline-block w-5 h-5 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center mx-auto">✕</span>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className="inline-block w-5 h-5 rounded-full bg-[#4DB8C4]/20 text-[#4DB8C4] flex items-center justify-center mx-auto">✓</span>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className="inline-block w-5 h-5 rounded-full bg-[#4DB8C4]/20 text-[#4DB8C4] flex items-center justify-center mx-auto">✓</span>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className="inline-block w-5 h-5 rounded-full bg-[#4DB8C4]/20 text-[#4DB8C4] flex items-center justify-center mx-auto">✓</span>
                </td>
              </tr>

              <tr className={`border-b ${effectiveTheme === "light" ? "border-gray-200 hover:bg-gray-50" : "border-gray-700 hover:bg-[#252525]"} transition-colors`}>
                <td className={`py-4 px-4 ${effectiveTheme === "light" ? "text-gray-700" : "text-gray-300"}`}>{t.repeatQuestionOptimization}</td>
                <td className="py-4 px-4 text-center">
                  <span className="inline-block w-5 h-5 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center mx-auto">✕</span>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className="inline-block w-5 h-5 rounded-full bg-[#4DB8C4]/20 text-[#4DB8C4] flex items-center justify-center mx-auto">✓</span>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className="inline-block w-5 h-5 rounded-full bg-[#4DB8C4]/20 text-[#4DB8C4] flex items-center justify-center mx-auto">✓</span>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className="inline-block w-5 h-5 rounded-full bg-[#4DB8C4]/20 text-[#4DB8C4] flex items-center justify-center mx-auto">✓</span>
                </td>
              </tr>

              {/* Performance & Reliability Section */}
              <tr className={`border-b ${effectiveTheme === "light" ? "border-gray-200" : "border-gray-800"}`}>
                <td colSpan={5} className="py-4 px-4">
                  <div className={`font-semibold ${effectiveTheme === "light" ? "text-gray-900" : "text-white"}`}>{t.performanceReliability}</div>
                </td>
              </tr>

              <tr className={`border-b ${effectiveTheme === "light" ? "border-gray-200 hover:bg-gray-50" : "border-gray-700 hover:bg-[#252525]"} transition-colors`}>
                <td className={`py-4 px-4 ${effectiveTheme === "light" ? "text-gray-700" : "text-gray-300"}`}>{t.responseSpeed}</td>
                <td className={`py-4 px-4 text-center ${effectiveTheme === "light" ? "text-gray-700" : "text-gray-300"}`}>{t.standard}</td>
                <td className={`py-4 px-4 text-center ${effectiveTheme === "light" ? "text-gray-700" : "text-gray-300"}`}>{t.faster}</td>
                <td className={`py-4 px-4 text-center ${effectiveTheme === "light" ? "text-gray-700" : "text-gray-300"}`}>{t.highestPriority}</td>
                <td className={`py-4 px-4 text-center ${effectiveTheme === "light" ? "text-gray-700" : "text-gray-300"}`}>{t.highestPriority}</td>
              </tr>

              <tr className={`border-b ${effectiveTheme === "light" ? "border-gray-200 hover:bg-gray-50" : "border-gray-700 hover:bg-[#252525]"} transition-colors`}>
                <td className={`py-4 px-4 ${effectiveTheme === "light" ? "text-gray-700" : "text-gray-300"}`}>{t.peakTimeStability}</td>
                <td className={`py-4 px-4 text-center ${effectiveTheme === "light" ? "text-gray-700" : "text-gray-300"}`}>{t.standard}</td>
                <td className={`py-4 px-4 text-center ${effectiveTheme === "light" ? "text-gray-700" : "text-gray-300"}`}>{t.standard}</td>
                <td className={`py-4 px-4 text-center ${effectiveTheme === "light" ? "text-gray-700" : "text-gray-300"}`}>{t.high}</td>
                <td className={`py-4 px-4 text-center ${effectiveTheme === "light" ? "text-gray-700" : "text-gray-300"}`}>{t.high}</td>
              </tr>

              <tr className={`border-b ${effectiveTheme === "light" ? "border-gray-200 hover:bg-gray-50" : "border-gray-700 hover:bg-[#252525]"} transition-colors`}>
                <td className={`py-4 px-4 ${effectiveTheme === "light" ? "text-gray-700" : "text-gray-300"}`}>{t.serviceSLA}</td>
                <td className="py-4 px-4 text-center">
                  <span className="inline-block w-5 h-5 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center mx-auto">✕</span>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className="inline-block w-5 h-5 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center mx-auto">✕</span>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className="inline-block w-5 h-5 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center mx-auto">✕</span>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className="inline-block w-5 h-5 rounded-full bg-[#4DB8C4]/20 text-[#4DB8C4] flex items-center justify-center mx-auto">✓</span>
                </td>
              </tr>

              {/* Support & Access Section */}
              <tr className={`border-b ${effectiveTheme === "light" ? "border-gray-200" : "border-gray-800"}`}>
                <td colSpan={5} className="py-4 px-4">
                  <div className={`font-semibold ${effectiveTheme === "light" ? "text-gray-900" : "text-white"}`}>{t.supportAccess}</div>
                </td>
              </tr>

              <tr className={`border-b ${effectiveTheme === "light" ? "border-gray-200 hover:bg-gray-50" : "border-gray-700 hover:bg-[#252525]"} transition-colors`}>
                <td className={`py-4 px-4 ${effectiveTheme === "light" ? "text-gray-700" : "text-gray-300"}`}>{t.customerSupport}</td>
                <td className={`py-4 px-4 text-center ${effectiveTheme === "light" ? "text-gray-700" : "text-gray-300"}`}>{t.community}</td>
                <td className={`py-4 px-4 text-center ${effectiveTheme === "light" ? "text-gray-700" : "text-gray-300"}`}>{t.email}</td>
                <td className={`py-4 px-4 text-center ${effectiveTheme === "light" ? "text-gray-700" : "text-gray-300"}`}>{t.priorityEmail}</td>
                <td className={`py-4 px-4 text-center ${effectiveTheme === "light" ? "text-gray-700" : "text-gray-300"}`}>{t.dedicated}</td>
              </tr>

              <tr className={`border-b ${effectiveTheme === "light" ? "border-gray-200 hover:bg-gray-50" : "border-gray-700 hover:bg-[#252525]"} transition-colors`}>
                <td className={`py-4 px-4 ${effectiveTheme === "light" ? "text-gray-700" : "text-gray-300"}`}>{t.contractBased}</td>
                <td className="py-4 px-4 text-center">
                  <span className="inline-block w-5 h-5 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center mx-auto">✕</span>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className="inline-block w-5 h-5 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center mx-auto">✕</span>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className="inline-block w-5 h-5 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center mx-auto">✕</span>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className="inline-block w-5 h-5 rounded-full bg-[#4DB8C4]/20 text-[#4DB8C4] flex items-center justify-center mx-auto">✓</span>
                </td>
              </tr>

              <tr className={`border-b ${effectiveTheme === "light" ? "border-gray-200 hover:bg-gray-50" : "border-gray-700 hover:bg-[#252525]"} transition-colors`}>
                <td className={`py-4 px-4 ${effectiveTheme === "light" ? "text-gray-700" : "text-gray-300"}`}>{t.legalCompliance}</td>
                <td className="py-4 px-4 text-center">
                  <span className="inline-block w-5 h-5 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center mx-auto">✕</span>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className="inline-block w-5 h-5 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center mx-auto">✕</span>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className="inline-block w-5 h-5 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center mx-auto">✕</span>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className="inline-block w-5 h-5 rounded-full bg-[#4DB8C4]/20 text-[#4DB8C4] flex items-center justify-center mx-auto">✓</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Disclaimer */}
        <div className="mt-12 text-center">
          <p className={`text-sm ${effectiveTheme === "light" ? "text-gray-600" : "text-gray-400"} max-w-3xl mx-auto`}>
            {t.disclaimer}
          </p>
        </div>
      </div>

      {/* Footer */}
      <Footer />

      {/* 로그인 모달 */}
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
