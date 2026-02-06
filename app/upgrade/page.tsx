"use client";

import { useState, useEffect, useRef } from "react";
import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from "@/contexts/ThemeContext";

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

export default function UpgradePage() {
  const router = useRouter();
  const { language } = useLanguage();
  const { effectiveTheme } = useTheme();
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");

  const content = {
    English: {
      title: "Upgrade Your Plan",
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
      currentPlan: "Current Plan",
      getPro: "Get Pro",
      getMax: "Get Max",
      contactSales: "Contact Sales",
      backToHome: "← Back to Home",
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
    "한국어": {
      title: "플랜 업그레이드",
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
      currentPlan: "현재 플랜",
      getPro: "프로 구매",
      getMax: "맥스 구매",
      contactSales: "영업팀 문의",
      backToHome: "← 홈으로 돌아가기",
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
    "日本語": {
      title: "プランをアップグレード",
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
      currentPlan: "現在のプラン",
      getPro: "プロを取得",
      getMax: "マックスを取得",
      contactSales: "営業に問い合わせ",
      backToHome: "← ホームに戻る",
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

  const getButtonStyle = (isPrimary: boolean, isDisabled?: boolean) => {
    if (isDisabled) {
      return effectiveTheme === "light"
        ? "border-2 border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed"
        : "border border-gray-700 bg-gray-800 text-gray-500 cursor-not-allowed";
    }
    if (isPrimary) {
      return "bg-gray-900 hover:bg-gray-800 text-white";
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
      buttonText: t.currentPlan,
      buttonStyle: getButtonStyle(false, true),
      disabled: true
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
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-20">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl md:text-5xl font-normal mb-4 text-white" style={{ fontFamily: "var(--font-hedvig-letters-serif), serif" }}>{t.title}</h1>
          <p className="text-lg md:text-xl text-gray-400 mb-8 md:mb-10" style={{ fontFamily: "var(--font-helvetica), sans-serif" }}>{t.subtitle}</p>

          {/* Billing Segment Control */}
          <div className="inline-flex items-center bg-black rounded-full p-1 mb-2">
            <button
              onClick={() => setBillingPeriod("monthly")}
              className={`px-4 md:px-6 py-2 rounded-full text-xs md:text-sm font-medium transition-all duration-200 ${
                billingPeriod === "monthly"
                  ? effectiveTheme === "light" ? "bg-white text-gray-900 shadow-sm" : "bg-[#3a3a3a] text-white"
                  : effectiveTheme === "light" ? "text-gray-600 hover:text-gray-900" : "text-gray-400 hover:text-gray-200"
              }`}
              style={{ fontFamily: "var(--font-helvetica), sans-serif" }}
            >
              {t.monthly}
            </button>
            <button
              onClick={() => setBillingPeriod("yearly")}
              className={`px-4 md:px-6 py-2 rounded-full text-xs md:text-sm font-medium transition-all duration-200 ${
                billingPeriod === "yearly"
                  ? effectiveTheme === "light" ? "bg-white text-gray-900 shadow-sm" : "bg-[#3a3a3a] text-white"
                  : effectiveTheme === "light" ? "text-gray-600 hover:text-gray-900" : "text-gray-400 hover:text-gray-200"
              }`}
              style={{ fontFamily: "var(--font-helvetica), sans-serif" }}
            >
              {t.yearly}
            </button>
          </div>
        </div>

        {/* Plans Section */}
        <div className="mb-10 md:mb-16 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 pt-6">
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
                        ? "bg-gradient-to-br from-gray-50 via-white to-gray-50 border-[#60A5FA]"
                        : "bg-gradient-to-br from-gray-50 via-white to-gray-100 border-gray-300"
                      : plan.recommended
                        ? "bg-[#0a0a0a] border-[#60A5FA]"
                        : "bg-[#0a0a0a] border-gray-700"
                  } border-2 rounded-2xl p-5 md:p-8 relative flex flex-col`}
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

                  <div className="mb-4 md:mb-6 relative z-20">
                    <h3 className={`text-xl md:text-2xl font-bold mb-2 ${effectiveTheme === "light" ? "text-gray-900" : "text-white"}`}>{plan.name}</h3>
                    <div className="flex items-baseline gap-2 md:gap-3 mb-2">
                      {plan.isEnterprise ? (
                        <div className="flex items-baseline">
                          <span className={`text-2xl md:text-4xl font-bold ${effectiveTheme === "light" ? "text-gray-900" : "text-white"}`} style={{ fontFamily: "var(--font-hedvig-letters-serif), serif" }}>{t.letsTalk}</span>
                        </div>
                      ) : plan.monthlyPrice === 0 ? (
                        <div className="flex items-baseline">
                          <span className={`text-2xl md:text-4xl font-bold ${effectiveTheme === "light" ? "text-gray-900" : "text-white"}`} style={{ fontFamily: "var(--font-hedvig-letters-serif), serif" }}>{t.free}</span>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-baseline">
                            <span className={`text-2xl md:text-4xl font-bold ${effectiveTheme === "light" ? "text-gray-900" : "text-white"}`} style={{ fontFamily: "var(--font-hedvig-letters-serif), serif" }}>${animatedPrice}</span>
                            <span className={`ml-1 md:ml-2 text-sm md:text-base ${effectiveTheme === "light" ? "text-gray-600" : "text-gray-400"}`}>{t.perMonth}</span>
                          </div>
                          {billingPeriod === "yearly" && discount > 0 && (
                            <span className="text-[#60A5FA] text-xs md:text-sm font-semibold">
                              {discount}{t.off}
                            </span>
                          )}
                        </>
                      )}
                    </div>
                    {plan.name === t.free && <p className={`text-xs md:text-sm ${effectiveTheme === "light" ? "text-gray-600" : "text-gray-400"}`}>{t.includes}</p>}
                    {plan.name !== t.free && <p className={`text-xs md:text-sm ${effectiveTheme === "light" ? "text-gray-600" : "text-gray-400"}`}>{plan.description}</p>}
                  </div>

                  <div className="mb-6 md:mb-8 space-y-2 md:space-y-3 flex-grow">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-start space-x-2">
                        <Check className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#60A5FA] mt-0.5 flex-shrink-0" />
                        <span className={`text-xs md:text-sm ${effectiveTheme === "light" ? "text-gray-700" : "text-gray-300"}`}>{feature}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    disabled={plan.disabled}
                    className={`w-full py-2.5 md:py-3 rounded-lg text-sm md:text-base font-medium transition-all duration-200 relative z-20 ${plan.buttonStyle}`}
                    style={{
                      boxShadow: plan.disabled
                        ? 'none'
                        : plan.buttonStyle.includes('bg-gray-900')
                          ? '0 4px 14px rgba(17, 24, 39, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2), inset 0 -1px 0 rgba(0, 0, 0, 0.2)'
                          : '0 2px 8px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.2)',
                      transform: 'translateZ(10px)',
                    }}
                    onMouseEnter={(e) => {
                      if (plan.disabled) return;
                      if (plan.buttonStyle.includes('bg-gray-900')) {
                        e.currentTarget.style.boxShadow = '0 6px 20px rgba(17, 24, 39, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.2), inset 0 -1px 0 rgba(0, 0, 0, 0.2)';
                        e.currentTarget.style.transform = 'translateY(-2px) translateZ(10px)';
                      } else {
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15), inset 0 -1px 0 rgba(0, 0, 0, 0.2)';
                        e.currentTarget.style.transform = 'translateY(-1px) translateZ(10px)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (plan.disabled) return;
                      if (plan.buttonStyle.includes('bg-gray-900')) {
                        e.currentTarget.style.boxShadow = '0 4px 14px rgba(17, 24, 39, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2), inset 0 -1px 0 rgba(0, 0, 0, 0.2)';
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

        {/* Back to Home */}
        <div className="text-center">
          <button
            onClick={() => router.push('/')}
            className="text-sm md:text-base text-gray-400 hover:text-white transition-colors"
            style={{ fontFamily: "var(--font-helvetica), sans-serif" }}
          >
            {t.backToHome}
          </button>
        </div>
      </div>
    </div>
  );
}
