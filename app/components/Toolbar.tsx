"use client";

import { useState } from "react";
import { ChevronDown, BookOpen, Briefcase, HelpCircle, Menu, X, ArrowRight } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { US, KR, JP } from 'country-flag-icons/react/3x2';

interface ToolbarProps {
  onLoginClick?: () => void;
  onMenuClick?: (menu: string) => void;
  variant?: 'light' | 'dark';
}

type MenuKey = "resources" | null;

export default function Toolbar({ onLoginClick, variant = 'dark' }: ToolbarProps) {
  const router = useRouter();
  const { effectiveTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const [activeMenu, setActiveMenu] = useState<MenuKey>(null);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileResourcesOpen, setIsMobileResourcesOpen] = useState(false);

  const content = {
    English: {
      feature: "Feature",
      mission: "Mission",
      pricing: "Pricing",
      resources: "Resources",
      login: "Log in",
      resourceItems: [
        { id: "blog", icon: BookOpen, label: "Blog", description: "Explore the latest insights, research updates, and veterinary medicine innovations from our team and community" },
        { id: "careers", icon: Briefcase, label: "Careers", description: "Join our mission to transform veterinary care. Discover open positions and opportunities to make an impact" },
        { id: "support", icon: HelpCircle, label: "Support", description: "Get expert assistance whenever you need it. Our support team is here to help you succeed" },
      ],
      imageArea: {
        title: "Explore Our Resources",
        description: "Discover insights, updates, and opportunities to join our team and community."
      }
    },
    한국어: {
      feature: "기능",
      mission: "미션",
      pricing: "요금제",
      resources: "리소스",
      login: "로그인",
      resourceItems: [
        { id: "blog", icon: BookOpen, label: "블로그", description: "최신 인사이트, 연구 업데이트, 수의학 혁신에 대한 우리 팀과 커뮤니티의 이야기를 확인하세요" },
        { id: "careers", icon: Briefcase, label: "채용", description: "수의학 케어를 혁신하는 미션에 동참하세요. 열린 포지션과 임팩트를 만들 기회를 찾아보세요" },
        { id: "support", icon: HelpCircle, label: "지원", description: "필요할 때 언제든지 전문가의 도움을 받으세요. 우리 지원팀이 여러분의 성공을 돕습니다" },
      ],
      imageArea: {
        title: "리소스 탐색",
        description: "인사이트, 업데이트, 그리고 우리 팀과 커뮤니티에 참여할 기회를 발견하세요."
      }
    },
    日本語: {
      feature: "機能",
      mission: "ミッション",
      pricing: "料金",
      resources: "リソース",
      login: "ログイン",
      resourceItems: [
        { id: "blog", icon: BookOpen, label: "ブログ", description: "最新のインサイト、研究アップデート、獣医学のイノベーションについて、チームとコミュニティからの情報をご覧ください" },
        { id: "careers", icon: Briefcase, label: "採用", description: "獣医療を変革するミッションに参加してください。オープンポジションとインパクトを生み出す機会を見つけましょう" },
        { id: "support", icon: HelpCircle, label: "サポート", description: "必要なときにいつでも専門家のサポートを受けられます。サポートチームが成功をお手伝いします" },
      ],
      imageArea: {
        title: "リソースを探索",
        description: "インサイト、アップデート、そしてチームとコミュニティに参加する機会を見つけてください。"
      }
    }
  };

  const currentContent = content[language as keyof typeof content];
  const resourceItems = currentContent.resourceItems;

  const handleMouseEnter = (menu: MenuKey) => {
    setActiveMenu(menu);
  };

  const handleMouseLeave = () => {
    setActiveMenu(null);
  };

  const handleLocaleChange = (newLocale: 'English' | '한국어' | '日本語') => {
    setLanguage(newLocale);
    setIsLanguageOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    setIsMobileResourcesOpen(false);
  };

  const toggleMobileSubmenu = () => {
    setIsMobileResourcesOpen(!isMobileResourcesOpen);
  };

  return (
    <div onMouseLeave={handleMouseLeave}>
      {/* Top Banner */}
      <div className="bg-gray-900">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <p className="text-center text-white text-[11px] sm:text-[13px] flex items-center justify-center gap-2" style={{ fontFamily: "var(--font-helvetica), sans-serif" }}>
            <span>2025 Veterinary Literature Review</span>
            <ArrowRight className="w-3 h-3" />
          </p>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className={`${variant === 'light' ? 'bg-[#f5f5f5]' : 'bg-[#0a0a0a]'} relative`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
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
              <span className={`text-xl font-semibold font-hedvig ${
                variant === 'light' ? 'text-gray-900' : 'text-white'
              }`}>Ruleout</span>
            </div>

            {/* Center Navigation */}
            <div className="hidden md:flex items-center space-x-8" style={{ fontFamily: "var(--font-helvetica), sans-serif" }}>
              <button
                onClick={() => router.push('/feature')}
                className={`text-sm transition-colors ${
                  variant === 'light'
                    ? 'text-gray-700 hover:text-gray-900'
                    : 'text-gray-300 hover:text-white'
                }`}
                onMouseEnter={() => setActiveMenu(null)}
              >
                {currentContent.feature}
              </button>
              <button
                onClick={() => router.push('/mission')}
                className={`text-sm transition-colors ${
                  variant === 'light'
                    ? 'text-gray-700 hover:text-gray-900'
                    : 'text-gray-300 hover:text-white'
                }`}
                onMouseEnter={() => setActiveMenu(null)}
              >
                {currentContent.mission}
              </button>
              <button
                onClick={() => router.push('/pricing')}
                className={`text-sm transition-colors ${
                  variant === 'light'
                    ? 'text-gray-700 hover:text-gray-900'
                    : 'text-gray-300 hover:text-white'
                }`}
                onMouseEnter={() => setActiveMenu(null)}
              >
                {currentContent.pricing}
              </button>
              <div
                className="relative flex items-center"
                onMouseEnter={() => handleMouseEnter("resources")}
              >
                <button
                  className={`flex items-center text-sm transition-colors ${
                    variant === 'light'
                      ? activeMenu === "resources"
                        ? "text-gray-900"
                        : "text-gray-700 hover:text-gray-900"
                      : activeMenu === "resources"
                        ? "text-white"
                        : "text-gray-300 hover:text-white"
                  }`}
                >
                  {currentContent.resources}
                  <ChevronDown className={`ml-1 w-4 h-4 transition-transform ${
                    activeMenu === "resources" ? "rotate-180" : ""
                  }`} />
                </button>
              </div>
            </div>

            {/* Right side - Login & Language */}
            <div className="hidden md:flex items-center space-x-4">
              <button
                onClick={() => router.push('/login')}
                className={`text-sm transition-colors ${
                  variant === 'light'
                    ? 'text-gray-700 hover:text-gray-900'
                    : 'text-gray-300 hover:text-white'
                }`}
                style={{ fontFamily: "var(--font-helvetica), sans-serif" }}
              >
                {currentContent.login}
              </button>
              <div className="relative">
                <button
                  onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                  className={`flex items-center space-x-1 text-sm transition-colors ${
                    variant === 'light'
                      ? 'text-gray-700 hover:text-gray-900'
                      : 'text-gray-300 hover:text-white'
                  }`}
                  style={{ fontFamily: "var(--font-helvetica), sans-serif" }}
                >
                  <span>{language === 'English' ? 'EN' : language === '한국어' ? 'KO' : 'JP'}</span>
                  <ChevronDown className="w-3 h-3" />
                </button>
                {isLanguageOpen && (
                  <div className={`absolute right-0 mt-2 w-32 rounded-lg shadow-lg overflow-hidden z-[60] ${
                    variant === 'light'
                      ? 'bg-white border border-gray-200'
                      : 'bg-[#0a0a0a] border border-gray-800'
                  }`}>
                    <button
                      onClick={() => handleLocaleChange('English')}
                      className={`w-full px-4 py-2 text-left text-sm transition-colors flex items-center space-x-3 ${
                        variant === 'light'
                          ? 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                          : 'text-gray-300 hover:bg-[#1a1a1a] hover:text-white'
                      }`}
                      style={{ fontFamily: "var(--font-helvetica), sans-serif" }}
                    >
                      <US className="w-5 h-4" />
                      <span>EN</span>
                    </button>
                    <button
                      onClick={() => handleLocaleChange('한국어')}
                      className={`w-full px-4 py-2 text-left text-sm transition-colors flex items-center space-x-3 ${
                        variant === 'light'
                          ? 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                          : 'text-gray-300 hover:bg-[#1a1a1a] hover:text-white'
                      }`}
                      style={{ fontFamily: "var(--font-helvetica), sans-serif" }}
                    >
                      <KR className="w-5 h-4" />
                      <span>KO</span>
                    </button>
                    <button
                      onClick={() => handleLocaleChange('日本語')}
                      className={`w-full px-4 py-2 text-left text-sm transition-colors flex items-center space-x-3 ${
                        variant === 'light'
                          ? 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                          : 'text-gray-300 hover:bg-[#1a1a1a] hover:text-white'
                      }`}
                      style={{ fontFamily: "var(--font-helvetica), sans-serif" }}
                    >
                      <JP className="w-5 h-4" />
                      <span>JP</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Hamburger Button */}
            <button
              onClick={toggleMobileMenu}
              className={`md:hidden p-2 ${
                effectiveTheme === 'light' ? 'text-gray-900' : 'text-white'
              }`}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Full-width Dropdown */}
        <div
          className={`absolute left-0 right-0 shadow-xl z-50 transition-all duration-300 ease-in-out ${
            variant === 'light' ? 'bg-[#f5f5f5]' : 'bg-[#0a0a0a]'
          } ${
            activeMenu
              ? "opacity-100 visible translate-y-0"
              : "opacity-0 invisible -translate-y-2"
          }`}
          onMouseEnter={() => activeMenu && setActiveMenu(activeMenu)}
        >
          {activeMenu && (
            <div className="max-w-4xl mx-auto px-6 py-8">
              <div className="flex justify-center gap-8">
                {/* Left side - Menu Items */}
                <div className="w-[320px]">
                  <div className="space-y-4">
                    {resourceItems.map((item, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          if (item.id === "blog") {
                            router.push('/blog');
                          } else if (item.id === "careers") {
                            router.push('/careers');
                          }
                          setActiveMenu(null);
                        }}
                        className="block group w-full text-left"
                      >
                        <div className="p-4 rounded-lg transition-colors">
                          <h3 className={`text-sm font-medium transition-colors mb-1 ${
                            variant === 'light'
                              ? 'text-gray-900 group-hover:text-[#20808D]'
                              : 'text-white group-hover:text-[#4DB8C4]'
                          }`} style={{ fontFamily: "var(--font-helvetica), sans-serif" }}>
                            {item.label}
                          </h3>
                          <p className={`text-xs leading-relaxed ${
                            variant === 'light' ? 'text-gray-600' : 'text-gray-400'
                          }`} style={{ fontFamily: "var(--font-helvetica), sans-serif" }}>
                            {item.description}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Right side - Image Placeholder */}
                <div className="w-[360px]">
                  <div className={`h-full rounded-lg relative overflow-hidden p-6 flex flex-col justify-end min-h-[280px] ${
                    variant === 'light' ? 'bg-gray-100' : 'bg-gray-900'
                  }`}>
                    <div className="text-left">
                      <h3 className={`font-semibold text-base mb-2 ${
                        variant === 'light' ? 'text-gray-900' : 'text-white'
                      }`}>
                        {currentContent.imageArea.title}
                      </h3>
                      <p className={`text-xs leading-relaxed ${
                        variant === 'light' ? 'text-gray-700' : 'text-gray-300'
                      }`}>
                        {currentContent.imageArea.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 bg-[#0a0a0a] z-50 md:hidden transition-transform duration-300 ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Mobile Menu Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
            <div
              className="flex items-center gap-[7px] cursor-pointer"
              onClick={() => {
                router.push('/');
                setIsMobileMenuOpen(false);
              }}
            >
              <Image
                src="/image/logo_candidate1 복사본.png"
                alt="Ruleout Logo"
                width={28}
                height={28}
                className="object-contain"
              />
              <span className="text-xl font-semibold text-white font-hedvig">Ruleout</span>
            </div>
            <button
              onClick={toggleMobileMenu}
              className="text-white p-2"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Mobile Menu Items */}
          <div className="flex-1 px-6 pt-8 overflow-y-auto">
            <nav className="space-y-2">
              <button
                onClick={() => {
                  router.push('/feature');
                  setIsMobileMenuOpen(false);
                }}
                className="block w-full text-left py-3 text-white text-lg hover:text-gray-300 transition-colors"
              >
                {currentContent.feature}
              </button>

              <button
                onClick={() => {
                  router.push('/mission');
                  setIsMobileMenuOpen(false);
                }}
                className="block w-full text-left py-3 text-white text-lg hover:text-gray-300 transition-colors"
              >
                {currentContent.mission}
              </button>

              <button
                onClick={() => {
                  router.push('/pricing');
                  setIsMobileMenuOpen(false);
                }}
                className="block w-full text-left py-3 text-white text-lg hover:text-gray-300 transition-colors"
              >
                {currentContent.pricing}
              </button>

              {/* Resources Menu */}
              <div>
                <button
                  onClick={toggleMobileSubmenu}
                  className="flex items-center justify-between w-full py-3 text-white text-lg"
                >
                  {currentContent.resources}
                  <ChevronDown className={`w-5 h-5 transition-transform ${
                    isMobileResourcesOpen ? "rotate-180" : ""
                  }`} />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ease-out ${
                    isMobileResourcesOpen
                      ? "max-h-[800px] opacity-100"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="pb-6 space-y-5 pl-4">
                    {resourceItems.map((item, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          if (item.id === "blog") {
                            router.push('/blog');
                          } else if (item.id === "careers") {
                            router.push('/careers');
                          }
                          setIsMobileMenuOpen(false);
                        }}
                        className="block group w-full text-left"
                      >
                        <h3 className="text-white font-medium group-hover:text-gray-300 transition-colors">
                          {item.label}
                        </h3>
                        <p className="text-gray-500 text-sm mt-1 leading-relaxed">
                          {item.description}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </nav>
          </div>

          {/* Mobile Menu Bottom Buttons */}
          <div className="px-6 py-8 space-y-3 border-t border-gray-800">
            <button
              onClick={() => {
                router.push('/login');
                setIsMobileMenuOpen(false);
              }}
              className="block w-full py-3 text-center text-white border border-gray-600 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              {currentContent.login}
            </button>
            {/* Language Selector in Mobile */}
            <div className="flex justify-center gap-4">
              {([
                { code: 'English' as const, label: 'EN' },
                { code: '한국어' as const, label: 'KO' },
                { code: '日本語' as const, label: 'JP' }
              ]).map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    handleLocaleChange(lang.code);
                  }}
                  className={`text-sm transition-colors ${
                    language === lang.code
                      ? "text-white"
                      : "text-gray-500 hover:text-white"
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
