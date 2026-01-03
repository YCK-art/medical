"use client";

import { useState } from "react";
import { ChevronDown, BookOpen, Shield, Briefcase, HelpCircle, Target, Menu, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";

interface ToolbarProps {
  onLoginClick: () => void;
  onMenuClick?: (menu: string) => void;
}

export default function Toolbar({ onLoginClick, onMenuClick }: ToolbarProps) {
  const router = useRouter();
  const { effectiveTheme } = useTheme();
  const { language } = useLanguage();
  const [isResourcesOpen, setIsResourcesOpen] = useState(false);
  const [closeTimeout, setCloseTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileResourcesOpen, setIsMobileResourcesOpen] = useState(false);

  const content = {
    English: {
      // features: "Features",
      // enterprise: "Enterprise",
      mission: "Mission",
      pricing: "Pricing",
      resources: "Resources",
      contactSales: "Contact Sales",
      getStarted: "Get Started",
      resourceItems: [
        { id: "blog", icon: BookOpen, label: "Blog", description: "Latest news and updates", column: 1 },
        { id: "careers", icon: Briefcase, label: "Careers", description: "Join our team", column: 1 },
        // { id: "security", icon: Shield, label: "Security", description: "Trust and compliance", column: 2 },
        { id: "support", icon: HelpCircle, label: "Support", description: "Get help anytime", column: 2 },
      ]
    },
    한국어: {
      // features: "기능",
      // enterprise: "기업",
      mission: "미션",
      pricing: "요금제",
      resources: "리소스",
      contactSales: "영업팀 문의",
      getStarted: "시작하기",
      resourceItems: [
        { id: "blog", icon: BookOpen, label: "블로그", description: "최신 뉴스 및 업데이트", column: 1 },
        { id: "careers", icon: Briefcase, label: "채용", description: "우리 팀에 합류하세요", column: 1 },
        // { id: "security", icon: Shield, label: "보안", description: "신뢰와 규정 준수", column: 2 },
        { id: "support", icon: HelpCircle, label: "지원", description: "언제든지 도움을 받으세요", column: 2 },
      ]
    },
    日本語: {
      // features: "機能",
      // enterprise: "エンタープライズ",
      mission: "ミッション",
      pricing: "料金",
      resources: "リソース",
      contactSales: "営業に問い合わせ",
      getStarted: "始める",
      resourceItems: [
        { id: "blog", icon: BookOpen, label: "ブログ", description: "最新のニュースと更新情報", column: 1 },
        { id: "careers", icon: Briefcase, label: "採用", description: "私たちのチームに参加", column: 1 },
        // { id: "security", icon: Shield, label: "セキュリティ", description: "信頼とコンプライアンス", column: 2 },
        { id: "support", icon: HelpCircle, label: "サポート", description: "いつでもサポート", column: 2 },
      ]
    }
  };

  const currentContent = content[language as keyof typeof content];
  const resourceItems = currentContent.resourceItems;

  const handleMouseEnter = () => {
    if (closeTimeout) {
      clearTimeout(closeTimeout);
      setCloseTimeout(null);
    }
    setIsResourcesOpen(true);
  };

  const handleMouseLeave = () => {
    const timeout = setTimeout(() => {
      setIsResourcesOpen(false);
    }, 200);
    setCloseTimeout(timeout);
  };

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 border-b backdrop-blur-md z-50 ${
        effectiveTheme === 'light'
          ? 'border-gray-200 bg-white/80'
          : 'border-gray-800 bg-[#1a1a1a]/80'
      }`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* 로고 */}
            <div
              className="flex items-center gap-[7px] cursor-pointer"
              onClick={() => router.push('/')}
            >
              <Image
                src="/image/logo_candidate1 복사본.png"
                alt="Ruleout Logo"
                width={28}
                height={28}
                className="object-contain"
              />
              <span className={`text-xl font-semibold ${
                effectiveTheme === 'light' ? 'text-gray-900' : 'text-white'
              }`}>Ruleout</span>
            </div>

            {/* Navigation Menu */}
            <div className="hidden md:flex items-center space-x-8">
              {/* <button
                onClick={() => router.push('/features')}
                className={`transition-colors ${
                  effectiveTheme === 'light'
                    ? 'text-gray-900 hover:text-[#20808D]'
                    : 'text-gray-300 hover:text-[#4DB8C4]'
                }`}
              >
                <span>{currentContent.features}</span>
              </button> */}
              <button
                onClick={() => router.push('/mission')}
                className={`transition-colors ${
                  effectiveTheme === 'light'
                    ? 'text-gray-900 hover:text-[#20808D]'
                    : 'text-gray-300 hover:text-[#4DB8C4]'
                }`}
              >
                <span>{currentContent.mission}</span>
              </button>
              {/* <button
                onClick={() => router.push('/enterprise')}
                className={`transition-colors ${
                  effectiveTheme === 'light'
                    ? 'text-gray-900 hover:text-[#20808D]'
                    : 'text-gray-300 hover:text-[#4DB8C4]'
                }`}
              >
                <span>{currentContent.enterprise}</span>
              </button> */}
              <button
                onClick={() => router.push('/pricing')}
                className={`transition-colors ${
                  effectiveTheme === 'light'
                    ? 'text-gray-900 hover:text-[#20808D]'
                    : 'text-gray-300 hover:text-[#4DB8C4]'
                }`}
              >
                <span>{currentContent.pricing}</span>
              </button>
              <div
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                className="relative"
              >
                <button className={`flex items-center space-x-1 transition-colors ${
                  effectiveTheme === 'light'
                    ? 'text-gray-900 hover:text-[#20808D]'
                    : 'text-gray-300 hover:text-[#4DB8C4]'
                }`}>
                  <span>{currentContent.resources}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                {/* 드롭다운과 버튼 사이의 gap을 채우는 보이지 않는 영역 */}
                {isResourcesOpen && (
                  <div className="absolute left-0 right-0 h-4" style={{ top: '100%' }} />
                )}
              </div>
            </div>

            {/* Right Buttons - Desktop */}
            <div className="hidden md:flex items-center space-x-4">
              <button
                onClick={() => window.open('https://calendly.com/d/ctf4-n6s-3yp/ruleout-enterprise', '_blank')}
                className={`px-4 py-2 transition-colors border rounded-lg ${
                  effectiveTheme === 'light'
                    ? 'text-gray-700 hover:text-gray-900 border-gray-300 hover:border-gray-400'
                    : 'text-gray-300 hover:text-white border-gray-700 hover:border-gray-600'
                }`}
              >
                {currentContent.contactSales}
              </button>
              <button
                onClick={onLoginClick}
                className="px-4 py-2 bg-[#20808D] text-white rounded-lg hover:bg-[#1a6b77] transition-colors"
              >
                {currentContent.getStarted}
              </button>
            </div>

            {/* Hamburger Menu Button - Mobile */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`md:hidden p-2 ${
                effectiveTheme === 'light' ? 'text-gray-900' : 'text-white'
              }`}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div
          className={`fixed top-[65px] left-0 right-0 bottom-0 z-40 md:hidden overflow-y-auto ${
            effectiveTheme === 'light' ? 'bg-white' : 'bg-[#1a1a1a]'
          }`}
        >
          <div className="px-6 py-4 space-y-4">
            {/* Mobile Menu Items */}
            {/* <button
              onClick={() => {
                router.push('/features');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full text-left py-3 px-4 rounded-lg transition-colors ${
                effectiveTheme === 'light'
                  ? 'text-gray-900 hover:bg-gray-100'
                  : 'text-white hover:bg-[#2a2a2a]'
              }`}
            >
              {currentContent.features}
            </button> */}

            <button
              onClick={() => {
                router.push('/mission');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full text-left py-3 px-4 rounded-lg transition-colors ${
                effectiveTheme === 'light'
                  ? 'text-gray-900 hover:bg-gray-100'
                  : 'text-white hover:bg-[#2a2a2a]'
              }`}
            >
              {currentContent.mission}
            </button>

            {/* <button
              onClick={() => {
                router.push('/enterprise');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full text-left py-3 px-4 rounded-lg transition-colors ${
                effectiveTheme === 'light'
                  ? 'text-gray-900 hover:bg-gray-100'
                  : 'text-white hover:bg-[#2a2a2a]'
              }`}
            >
              {currentContent.enterprise}
            </button> */}

            <button
              onClick={() => {
                router.push('/pricing');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full text-left py-3 px-4 rounded-lg transition-colors ${
                effectiveTheme === 'light'
                  ? 'text-gray-900 hover:bg-gray-100'
                  : 'text-white hover:bg-[#2a2a2a]'
              }`}
            >
              {currentContent.pricing}
            </button>

            {/* Resources Dropdown in Mobile */}
            <div>
              <button
                onClick={() => setIsMobileResourcesOpen(!isMobileResourcesOpen)}
                className={`w-full flex items-center justify-between py-3 px-4 rounded-lg transition-colors ${
                  effectiveTheme === 'light'
                    ? 'text-gray-900 hover:bg-gray-100'
                    : 'text-white hover:bg-[#2a2a2a]'
                }`}
              >
                <span>{currentContent.resources}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isMobileResourcesOpen ? 'rotate-180' : ''}`} />
              </button>

              {isMobileResourcesOpen && (
                <div className={`mt-2 space-y-2 pl-4 ${effectiveTheme === 'light' ? 'border-l-2 border-gray-200' : 'border-l-2 border-gray-700'}`}>
                  {resourceItems.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={index}
                        onClick={() => {
                          if (item.id === "blog") {
                            router.push('/blog');
                          } else if (item.id === "careers") {
                            router.push('/careers');
                          } else if (item.id === "security") {
                            router.push('/security');
                          } else if (item.id === "mission") {
                            router.push('/mission');
                          }
                          setIsMobileMenuOpen(false);
                          setIsMobileResourcesOpen(false);
                        }}
                        className={`w-full flex items-center space-x-3 py-3 px-4 rounded-lg transition-colors text-left ${
                          effectiveTheme === 'light'
                            ? 'hover:bg-gray-100'
                            : 'hover:bg-[#2a2a2a]'
                        }`}
                      >
                        <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                          effectiveTheme === 'light' ? 'bg-[#20808D]/10' : 'bg-[#20808D]/20'
                        }`}>
                          <Icon className="w-4 h-4 text-[#20808D]" />
                        </div>
                        <div>
                          <div className={`text-sm font-medium ${
                            effectiveTheme === 'light' ? 'text-gray-900' : 'text-white'
                          }`}>
                            {item.label}
                          </div>
                          <div className={`text-xs ${
                            effectiveTheme === 'light' ? 'text-gray-600' : 'text-gray-400'
                          }`}>
                            {item.description}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Divider */}
            <div className={`border-t ${effectiveTheme === 'light' ? 'border-gray-200' : 'border-gray-800'} my-4`}></div>

            {/* Mobile Action Buttons */}
            <button
              onClick={() => {
                window.open('https://calendly.com/d/ctf4-n6s-3yp/ruleout-enterprise', '_blank');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full px-4 py-3 transition-colors border rounded-lg ${
                effectiveTheme === 'light'
                  ? 'text-gray-700 hover:text-gray-900 border-gray-300 hover:border-gray-400'
                  : 'text-gray-300 hover:text-white border-gray-700 hover:border-gray-600'
              }`}
            >
              {currentContent.contactSales}
            </button>

            <button
              onClick={() => {
                onLoginClick();
                setIsMobileMenuOpen(false);
              }}
              className="w-full px-4 py-3 bg-[#20808D] text-white rounded-lg hover:bg-[#1a6b77] transition-colors"
            >
              {currentContent.getStarted}
            </button>
          </div>
        </div>
      )}

      {/* Dropdown Menu - 툴바 외부에서 렌더링 */}
      {isResourcesOpen && (
        <div
          className="fixed left-0 right-0 z-40 animate-fadeIn"
          style={{ top: '57px' }}
        >
          <div
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={`border-t shadow-2xl ${
              effectiveTheme === 'light'
                ? 'bg-white border-gray-200'
                : 'bg-[#1a1a1a] border-gray-800'
            }`}
          >
            <div className="max-w-7xl mx-auto px-6 py-10">
              <div className="flex gap-x-4 justify-center max-w-4xl mx-auto">
                {/* Column 1: Blog, Careers */}
                <div className="flex flex-col gap-y-3 flex-1">
                  {resourceItems.filter(item => item.column === 1).map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={index}
                        onClick={() => {
                          if (item.id === "blog") {
                            router.push('/blog');
                          } else if (item.id === "careers") {
                            router.push('/careers');
                          }
                        }}
                        className={`flex items-center space-x-3 p-3 rounded-lg transition-colors text-left group ${
                          effectiveTheme === 'light'
                            ? 'hover:bg-gray-100'
                            : 'hover:bg-[#252525]'
                        }`}
                      >
                        <div className="flex-shrink-0 w-12 h-12 bg-[#20808D]/10 rounded-lg flex items-center justify-center group-hover:bg-[#20808D]/20 transition-colors">
                          <Icon className="w-5 h-5 text-[#20808D]" />
                        </div>
                        <div>
                          <h3 className={`font-semibold text-sm mb-0.5 transition-colors ${
                            effectiveTheme === 'light'
                              ? 'text-gray-900 group-hover:text-[#20808D]'
                              : 'text-white group-hover:text-[#4DB8C4]'
                          }`}>
                            {item.label}
                          </h3>
                          <p className={`text-sm ${
                            effectiveTheme === 'light' ? 'text-gray-600' : 'text-gray-400'
                          }`}>
                            {item.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Column 2: Security, Support */}
                <div className="flex flex-col gap-y-3 flex-1">
                  {resourceItems.filter(item => item.column === 2).map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={index}
                        onClick={() => {
                          if (item.id === "security") {
                            router.push('/security');
                          }
                        }}
                        className={`flex items-center space-x-3 p-3 rounded-lg transition-colors text-left group ${
                          effectiveTheme === 'light'
                            ? 'hover:bg-gray-100'
                            : 'hover:bg-[#252525]'
                        }`}
                      >
                        <div className="flex-shrink-0 w-12 h-12 bg-[#20808D]/10 rounded-lg flex items-center justify-center group-hover:bg-[#20808D]/20 transition-colors">
                          <Icon className="w-5 h-5 text-[#20808D]" />
                        </div>
                        <div>
                          <h3 className={`font-semibold text-sm mb-0.5 transition-colors ${
                            effectiveTheme === 'light'
                              ? 'text-gray-900 group-hover:text-[#20808D]'
                              : 'text-white group-hover:text-[#4DB8C4]'
                          }`}>
                            {item.label}
                          </h3>
                          <p className={`text-sm ${
                            effectiveTheme === 'light' ? 'text-gray-600' : 'text-gray-400'
                          }`}>
                            {item.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Column 3: Mission */}
                <div className="flex flex-col gap-y-3 flex-1">
                  {resourceItems.filter(item => item.column === 3).map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={index}
                        onClick={() => {
                          if (item.id === "mission") {
                            router.push('/mission');
                          }
                        }}
                        className={`flex items-center space-x-3 p-3 rounded-lg transition-colors text-left group ${
                          effectiveTheme === 'light'
                            ? 'hover:bg-gray-100'
                            : 'hover:bg-[#252525]'
                        }`}
                      >
                        <div className="flex-shrink-0 w-12 h-12 bg-[#20808D]/10 rounded-lg flex items-center justify-center group-hover:bg-[#20808D]/20 transition-colors">
                          <Icon className="w-5 h-5 text-[#20808D]" />
                        </div>
                        <div>
                          <h3 className={`font-semibold text-sm mb-0.5 transition-colors ${
                            effectiveTheme === 'light'
                              ? 'text-gray-900 group-hover:text-[#20808D]'
                              : 'text-white group-hover:text-[#4DB8C4]'
                          }`}>
                            {item.label}
                          </h3>
                          <p className={`text-sm ${
                            effectiveTheme === 'light' ? 'text-gray-600' : 'text-gray-400'
                          }`}>
                            {item.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
