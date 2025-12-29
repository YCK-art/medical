"use client";

import { useState, useEffect, useRef } from "react";
import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
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

export default function UpgradePage() {
  const router = useRouter();
  const { language } = useLanguage();
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");

  const content = {
    English: {
      title: "Upgrade Your Plan",
      monthly: "Monthly",
      yearly: "Yearly",
      perMonth: "/mo.",
      off: "% off",
      recommended: "Recommended",
      includes: "Includes:",
      backToHome: "← Back to Home",
      free: {
        name: "Free",
        description: "Get started with basic features",
        features: [
          "One-week Pro trial",
          "Limited Agent requests",
          "Limited Tab completions"
        ],
        buttonText: "Current Plan"
      },
      pro: {
        name: "Pro",
        description: "Everything in Free, plus:",
        features: [
          "Extended limits on Agent",
          "Unlimited Tab completions",
          "Background Agents",
          "Maximum context windows"
        ],
        buttonText: "Upgrade to Pro"
      },
      max: {
        name: "Max",
        description: "Everything in Pro, plus:",
        features: [
          "3x usage on all OpenAI, Claude, Gemini models",
          "Priority access to new features"
        ],
        buttonText: "Upgrade to Max"
      }
    },
    "한국어": {
      title: "플랜 업그레이드",
      monthly: "월간",
      yearly: "연간",
      perMonth: "/월",
      off: "% 할인",
      recommended: "추천",
      includes: "포함 내용:",
      backToHome: "← 홈으로 돌아가기",
      free: {
        name: "무료",
        description: "기본 기능으로 시작하기",
        features: [
          "1주일 Pro 체험판",
          "제한된 Agent 요청",
          "제한된 Tab 자동완성"
        ],
        buttonText: "현재 플랜"
      },
      pro: {
        name: "Pro",
        description: "무료 플랜의 모든 기능 및:",
        features: [
          "Agent 사용량 확대",
          "무제한 Tab 자동완성",
          "백그라운드 Agents",
          "최대 컨텍스트 윈도우"
        ],
        buttonText: "Pro로 업그레이드"
      },
      max: {
        name: "Max",
        description: "Pro 플랜의 모든 기능 및:",
        features: [
          "모든 OpenAI, Claude, Gemini 모델 3배 사용량",
          "신규 기능 우선 액세스"
        ],
        buttonText: "Max로 업그레이드"
      }
    },
    "日本語": {
      title: "プランをアップグレード",
      monthly: "月額",
      yearly: "年額",
      perMonth: "/月",
      off: "% オフ",
      recommended: "おすすめ",
      includes: "含む内容：",
      backToHome: "← ホームに戻る",
      free: {
        name: "無料",
        description: "基本機能から始める",
        features: [
          "1週間のProトライアル",
          "限定的なAgentリクエスト",
          "限定的なTab補完"
        ],
        buttonText: "現在のプラン"
      },
      pro: {
        name: "Pro",
        description: "無料プランのすべての機能に加えて：",
        features: [
          "Agentの利用制限を拡大",
          "無制限のTab補完",
          "バックグラウンドAgents",
          "最大コンテキストウィンドウ"
        ],
        buttonText: "Proにアップグレード"
      },
      max: {
        name: "Max",
        description: "Proプランのすべての機能に加えて：",
        features: [
          "すべてのOpenAI、Claude、Geminiモデルで3倍の使用量",
          "新機能への優先アクセス"
        ],
        buttonText: "Maxにアップグレード"
      }
    }
  };

  const t = content[language];

  const plans = [
    {
      name: t.free.name,
      monthlyPrice: 0,
      yearlyPricePerMonth: 0,
      description: t.free.description,
      features: t.free.features,
      buttonText: t.free.buttonText,
      buttonStyle: "border border-gray-700 bg-gray-800 cursor-not-allowed",
      disabled: true
    },
    {
      name: t.pro.name,
      monthlyPrice: 20,
      yearlyPricePerMonth: 12,
      description: t.pro.description,
      features: t.pro.features,
      buttonText: t.pro.buttonText,
      buttonStyle: "bg-[#20808D] hover:bg-[#1a6a78] text-white",
      recommended: true
    },
    {
      name: t.max.name,
      monthlyPrice: 60,
      yearlyPricePerMonth: 45,
      description: t.max.description,
      features: t.max.features,
      buttonText: t.max.buttonText,
      buttonStyle: "border border-gray-700 hover:bg-gray-800"
    }
  ];

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white">
      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-20">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-5xl font-bold mb-6 md:mb-10">{t.title}</h1>

          {/* Billing Segment Control */}
          <div className="inline-flex items-center bg-[#2a2a2a] rounded-lg p-1 mb-4">
            <button
              onClick={() => setBillingPeriod("monthly")}
              className={`px-4 md:px-6 py-2 rounded-md text-xs md:text-sm font-medium transition-all duration-200 ${
                billingPeriod === "monthly"
                  ? "bg-[#3a3a3a] text-white"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              {t.monthly}
            </button>
            <button
              onClick={() => setBillingPeriod("yearly")}
              className={`px-4 md:px-6 py-2 rounded-md text-xs md:text-sm font-medium transition-all duration-200 ${
                billingPeriod === "yearly"
                  ? "bg-[#3a3a3a] text-white"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              {t.yearly}
            </button>
          </div>
        </div>

        {/* Plans Section */}
        <div className="mb-10 md:mb-16 max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {plans.map((plan, index) => {
              const price = billingPeriod === "monthly" ? plan.monthlyPrice : plan.yearlyPricePerMonth;
              const animatedPrice = useCountUp(price);
              const discount = plan.monthlyPrice > 0
                ? Math.round((1 - plan.yearlyPricePerMonth / plan.monthlyPrice) * 100)
                : 0;

              return (
                <div
                  key={index}
                  className={`bg-[#212121] border ${
                    plan.recommended ? "border-[#20808D]" : "border-gray-800"
                  } rounded-2xl p-5 md:p-8 relative flex flex-col`}
                >
                  {plan.recommended && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-[#20808D] text-white text-xs font-semibold px-3 py-1 rounded-full">
                        {t.recommended}
                      </span>
                    </div>
                  )}

                  <div className="mb-4 md:mb-6">
                    <h3 className="text-xl md:text-2xl font-bold mb-2">{plan.name}</h3>
                    <div className="flex items-baseline gap-2 md:gap-3 mb-2">
                      <div className="flex items-baseline">
                        <span className="text-3xl md:text-4xl font-bold">${animatedPrice}</span>
                        {price > 0 && (
                          <span className="text-gray-400 ml-1 md:ml-2 text-sm md:text-base">{t.perMonth}</span>
                        )}
                      </div>
                      {billingPeriod === "yearly" && discount > 0 && (
                        <span className="text-[#20808D] text-xs md:text-sm font-semibold">
                          {discount}{t.off}
                        </span>
                      )}
                    </div>
                    {plan.name === t.free.name && <p className="text-xs md:text-sm text-gray-400">{t.includes}</p>}
                    {plan.name !== t.free.name && <p className="text-xs md:text-sm text-gray-400">{plan.description}</p>}
                  </div>

                  <div className="mb-6 md:mb-8 space-y-2 md:space-y-3 flex-grow">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-start space-x-2">
                        <Check className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#20808D] mt-0.5 flex-shrink-0" />
                        <span className="text-xs md:text-sm text-gray-300">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    disabled={plan.disabled}
                    className={`w-full py-2.5 md:py-3 rounded-lg text-sm md:text-base font-medium transition-colors ${plan.buttonStyle}`}
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
          >
            {t.backToHome}
          </button>
        </div>
      </div>
    </div>
  );
}
