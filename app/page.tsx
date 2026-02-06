"use client";

import { useState, useEffect } from "react";
import { ChevronDown, ArrowRight, BookText, Pill, Stethoscope, ArrowUpRight, Activity } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Toolbar from "@/app/components/Toolbar";
import { getAllBlogPosts, BlogPost } from "@/lib/blogService";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import Footer from "@/app/components/Footer";
import { useAuth } from "@/contexts/AuthContext";

// FAQ Item Component
function FAQItem({ question, answer, theme }: { question: string; answer: string; theme: "light" | "dark" }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-white/20 mx-auto max-w-4xl">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-6 flex items-center justify-between text-left hover:text-[#4DB8C4] transition-colors group"
      >
        <span className={`text-lg md:text-xl font-normal ${theme === "light" ? "text-gray-900" : "text-white"} group-hover:text-[#4DB8C4] transition-colors`} style={{ fontFamily: "var(--font-helvetica), sans-serif" }}>
          {question}
        </span>
        <ChevronDown
          className={`w-6 h-6 ${theme === "light" ? "text-gray-500" : "text-gray-400"} transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? "max-h-96 pb-6" : "max-h-0"
        }`}
      >
        <p className={`${theme === "light" ? "text-gray-600" : "text-gray-400"} leading-relaxed max-w-3xl`} style={{ fontFamily: "var(--font-helvetica), sans-serif" }}>{answer}</p>
      </div>
    </div>
  );
}

// Solutions Section Component
function SolutionsSection({ effectiveTheme }: { effectiveTheme: "light" | "dark" }) {
  const [selectedTab, setSelectedTab] = useState("clinic");
  const [progress, setProgress] = useState(0);

  const tabs = [
    { id: "clinic", label: "Veterinary Clinics" },
    { id: "hospital", label: "Animal Hospitals" },
    { id: "research", label: "Research Teams" },
    { id: "education", label: "Education" }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          // Move to next tab
          const currentIndex = tabs.findIndex((tab) => tab.id === selectedTab);
          const nextIndex = (currentIndex + 1) % tabs.length;
          setSelectedTab(tabs[nextIndex].id);
          return 0;
        }
        return prev + 0.5;
      });
    }, 50); // Complete in 10 seconds (200 * 50ms)

    return () => clearInterval(interval);
  }, [selectedTab]);

  const handleTabClick = (tabId: string) => {
    setSelectedTab(tabId);
    setProgress(0);
  };

  const content = {
    clinic: {
      title: "Veterinary Clinics",
      description: "Streamline high-volume work across practice areas to free up time for strategic guidance.",
      link: "Solutions for Veterinary Clinics",
      placeholder: "Image Placeholder 1"
    },
    hospital: {
      title: "Animal Hospitals",
      description: "Access evidence-based protocols and treatment guidelines for comprehensive patient care.",
      link: "Solutions for Animal Hospitals",
      placeholder: "Image Placeholder 2"
    },
    research: {
      title: "Research Teams",
      description: "Accelerate veterinary research with AI-powered literature review and data analysis.",
      link: "Solutions for Research Teams",
      placeholder: "Image Placeholder 3"
    },
    education: {
      title: "Education",
      description: "Enhance veterinary education with interactive learning tools and case studies.",
      link: "Solutions for Education",
      placeholder: "Image Placeholder 4"
    }
  };

  const currentContent = content[selectedTab as keyof typeof content];

  return (
    <div className={`${effectiveTheme === "light" ? "bg-gray-50" : "bg-[#0a0a0a]"} py-20`}>
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h2
            className={`text-3xl md:text-4xl font-normal ${effectiveTheme === "light" ? "text-gray-900" : "text-white"}`}
            style={{ fontFamily: "var(--font-hedvig-letters-serif), serif" }}
          >
            How Veterinarians Use Ruleout
          </h2>
        </div>

        {/* Individual Buttons */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`relative px-4 py-2 rounded-full text-sm font-normal transition-all duration-300 overflow-hidden border ${
                selectedTab === tab.id
                  ? "border-white shadow-lg"
                  : effectiveTheme === "light"
                  ? "bg-white text-gray-600 hover:text-gray-900 border-gray-300"
                  : "bg-[#0a0a0a] text-gray-400 hover:text-white border-gray-700"
              }`}
              style={{ fontFamily: "var(--font-helvetica), sans-serif" }}
            >
              {/* Progress fill background - straight edge */}
              {selectedTab === tab.id && (
                <span
                  className="absolute left-0 top-0 h-full bg-white z-0"
                  style={{
                    width: `${progress}%`
                  }}
                ></span>
              )}
              {/* Button text with smooth color transition */}
              <span className="relative z-10 inline-block mix-blend-difference">
                {tab.label}
              </span>
            </button>
          ))}
        </div>

        {/* Single Content Card */}
        <div className={`${effectiveTheme === "light" ? "bg-gray-50 border-gray-200" : "bg-[#0a0a0a] border-gray-800"} rounded-2xl border overflow-hidden shadow-2xl`}>
          <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[500px]">
            {/* Left: Image Placeholder */}
            <div className={`${effectiveTheme === "light" ? "bg-gray-100" : "bg-gray-900"} flex items-center justify-center`}>
              <div className={`text-lg ${effectiveTheme === "light" ? "text-gray-400" : "text-gray-600"}`}>
                {currentContent.placeholder}
              </div>
            </div>

            {/* Right: Description */}
            <div className="p-8 md:p-12 flex flex-col justify-center">
              <h3
                className={`text-2xl md:text-3xl font-normal mb-4 ${effectiveTheme === "light" ? "text-gray-900" : "text-white"}`}
                style={{ fontFamily: "var(--font-hedvig-letters-serif), serif" }}
              >
                {currentContent.title}
              </h3>
              <p className={`text-base mb-6 ${effectiveTheme === "light" ? "text-gray-600" : "text-gray-400"}`} style={{ fontFamily: "var(--font-helvetica), sans-serif" }}>
                {currentContent.description}
              </p>
              <button className="flex items-center space-x-2 text-[#4DB8C4] hover:text-[#6dccd7] transition-colors group">
                <span className="text-sm font-normal" style={{ fontFamily: "var(--font-helvetica), sans-serif" }}>
                  {currentContent.link}
                </span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


export default function LandingPage() {
  const router = useRouter();
  const { effectiveTheme } = useTheme();
  const { language } = useLanguage();
  const { user } = useAuth();
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [isLoadingBlogs, setIsLoadingBlogs] = useState(true);

  // 로그인한 사용자는 채팅 페이지로 리다이렉트
  useEffect(() => {
    if (user) {
      router.push("/chat");
    }
  }, [user, router]);

  // Fetch blog posts on mount
  useEffect(() => {
    const fetchBlogPosts = async () => {
      setIsLoadingBlogs(true);
      const posts = await getAllBlogPosts();
      setBlogPosts(posts.slice(0, 4)); // Get only first 4 posts
      setIsLoadingBlogs(false);
    };
    fetchBlogPosts();
  }, []);

  const handleLogin = () => {
    // 로그인 페이지로 이동
    router.push('/login');
  };

  // Language content
  const content = {
    English: {
      hero: {
        title: "Science Behind Every\nAnimal Diagnosis",
        subtitle: "Empower veterinarians to make faster, smarter decisions",
        placeholder: "Ask a medical question..."
      },
      suggestions: [
        {
          icon: BookText,
          text: "Guidelines",
          questions: [
            "What are the WSAVA guidelines for canine vaccination protocols?",
            "What is the standard protocol for feline diabetes management?",
            "What are the pain management guidelines for post-operative dogs?"
          ]
        },
        {
          icon: Pill,
          text: "Drug Administration",
          questions: [
            "What is the safe dosage of meloxicam for a 15kg dog with osteoarthritis?",
            "Can I administer acepromazine to a cat with heart disease?",
            "How should antibiotic doses be adjusted for dogs with renal insufficiency?"
          ]
        },
        {
          icon: Stethoscope,
          text: "Treatment Alternatives",
          questions: [
            "What are alternative antibiotics for dogs allergic to penicillin?",
            "What NSAIDs can be used if a cat cannot tolerate meloxicam?",
            "What are treatment alternatives for canine atopic dermatitis besides steroids?"
          ]
        },
        {
          icon: Activity,
          text: "Diagnostic Protocols",
          questions: [
            "What diagnostic tests are recommended for suspected feline hyperthyroidism?",
            "What is the protocol for diagnosing canine Cushing's disease?",
            "How should I approach a dog with suspected pancreatitis?"
          ]
        }
      ],
      partners: {
        subtitle: "",
        title: "Built for Veterinarians",
        footnote: "Journal logos are the property of their respective owners. Display does not imply endorsement or affiliation."
      },
      features: {
        title: "Clinically intelligent, Instantly responsive.",
        description: "Our model delivers veterinary answers with remarkable speed and medical precision.",
        link: "Learn about Features"
      },
      carousel: {
        title: "Advanced clinical insights at your fingertips",
        description: "Access evidence-based guidelines and treatment protocols instantly, helping you make confident clinical decisions with comprehensive reference support.",
        slides: [
          {
            title: "Comprehensive guideline database",
            description: "Access thousands of peer-reviewed clinical guidelines updated regularly with the latest veterinary research."
          },
          {
            title: "Evidence-based decision support",
            description: "Make confident clinical decisions with AI-powered recommendations backed by the latest medical literature."
          },
          {
            title: "Instant reference lookup",
            description: "Find relevant treatment protocols and diagnostic criteria in seconds, streamlining your clinical workflow."
          }
        ]
      },
      features2: {
        title: "Built for veterinary excellence",
        cards: [
          {
            title: "Trained on Leading veterinary journals",
            description: "Our AI is built on extensive clinical research, providing expert insight you can trust.",
            link: "Explore knowledge"
          },
          {
            title: "Made for vets to use",
            description: "Built for real clinical work, our AI delivers fast and precise understanding.",
            link: "Learn more"
          },
          {
            title: "For every animal's health and dignity",
            description: "Empowering better care and advancing animal welfare through intelligent medicine.",
            link: "See our mission"
          }
        ]
      },
      blog: {
        title: "Insights",
        viewMore: "View more posts",
        noPosts: "No blog posts available yet."
      },
      faq: {
        title: "Common Questions",
        items: [
          {
            question: "What veterinary guidelines are included in Ruleout?",
            answer: "Ruleout includes comprehensive clinical guidelines from major veterinary associations worldwide, covering companion animals, exotic species, and emergency medicine. Our database is continuously updated with the latest evidence-based recommendations."
          },
          {
            question: "Who is Ruleout for?",
            answer: "Ruleout is designed for veterinarians, veterinary technicians, and veterinary students who need quick, reliable access to clinical guidelines during patient care. It's perfect for busy practices, emergency clinics, and educational settings."
          },
          {
            question: "Is Ruleout free?",
            answer: "Ruleout offers a free tier that allows limited access to evidence-based content derived from open-access veterinary literature. For users with higher research needs, Pro and Max plans are available. These plans provide higher research query limits and expanded access to evidence drawn from a broader range of open-access sources, with regular content updates."
          },
          {
            question: "How are the clinical references sourced and maintained?",
            answer: "Ruleout references and analyzes content from open-access (CC BY) veterinary research publications and publicly available evidence-based resources. All source materials are used in accordance with their respective licenses, and original authorship and publication information are preserved. Content is updated regularly as new open-access literature becomes available."
          },
          {
            question: "What search capabilities does Ruleout offer?",
            answer: "Ruleout uses advanced AI to understand your clinical queries in natural language. You can search by symptoms, diagnosis, species, or treatment protocols, and get instant, relevant guideline recommendations with citations."
          },
          {
            question: "Can I access Ruleout on mobile devices?",
            answer: "Yes! Ruleout is fully responsive and works seamlessly on smartphones, tablets, and desktop computers. Access critical guidelines anywhere in your clinic or on the go."
          }
        ]
      },
      banner: {
        title: "Unlock Professional Class AI for Your Firm",
        button: "Request a Demo"
      }
    },
    한국어: {
      hero: {
        title: "모든 동물 진단에\n과학적 근거를",
        subtitle: "수의사가 더 빠르고, 명확한 의사결정을 내릴 수 있도록 돕습니다",
        placeholder: "의학 질문을 입력하세요..."
      },
      suggestions: [
        {
          icon: BookText,
          text: "가이드라인",
          questions: [
            "WSAVA 개 백신 접종 프로토콜 가이드라인은 무엇인가요?",
            "고양이 당뇨병 관리의 표준 프로토콜은 무엇인가요?",
            "수술 후 개의 통증 관리 가이드라인은 무엇인가요?"
          ]
        },
        {
          icon: Pill,
          text: "약물 투여",
          questions: [
            "골관절염이 있는 15kg 개에게 멜록시캄의 안전한 용량은?",
            "심장 질환이 있는 고양이에게 아세프로마진을 투여할 수 있나요?",
            "신장 기능 부전이 있는 개의 항생제 용량을 어떻게 조정해야 하나요?"
          ]
        },
        {
          icon: Stethoscope,
          text: "치료 대안",
          questions: [
            "페니실린 알레르기가 있는 개를 위한 대체 항생제는?",
            "고양이가 멜록시캄을 견디지 못할 경우 사용할 수 있는 NSAID는?",
            "스테로이드 외에 개 아토피 피부염의 치료 대안은?"
          ]
        },
        {
          icon: Activity,
          text: "진단 프로토콜",
          questions: [
            "고양이 갑상선 기능 항진증이 의심될 때 권장되는 진단 검사는?",
            "개 쿠싱 증후군 진단 프로토콜은 무엇인가요?",
            "췌장염이 의심되는 개에게 어떻게 접근해야 하나요?"
          ]
        }
      ],
      partners: {
        subtitle: "",
        title: "수의사를 위해 만들어졌습니다",
        footnote: "저널 로고는 각 소유자의 재산입니다. 표시는 보증이나 제휴를 의미하지 않습니다."
      },
      features: {
        title: "임상적으로 똑똑하고, 즉각적으로 반응합니다.",
        description: "우리 모델은 놀라운 속도와 의학적 정확도로 수의학적 답변을 제공합니다.",
        link: "기능 알아보기"
      },
      carousel: {
        title: "손끝에서 제공되는 고급 임상 통찰력",
        description: "증거 기반 가이드라인과 치료 프로토콜에 즉시 액세스하여 포괄적인 참고 자료로 자신감 있는 임상 결정을 내릴 수 있습니다.",
        slides: [
          {
            title: "포괄적인 가이드라인 데이터베이스",
            description: "최신 수의학 연구로 정기적으로 업데이트되는 수천 개의 동료 검토 임상 가이드라인에 액세스하세요."
          },
          {
            title: "증거 기반 의사결정 지원",
            description: "최신 의학 문헌을 기반으로 한 AI 기반 권장 사항으로 자신감 있는 임상 결정을 내리세요."
          },
          {
            title: "즉각적인 참고 자료 검색",
            description: "관련 치료 프로토콜 및 진단 기준을 몇 초 만에 찾아 임상 워크플로를 간소화하세요."
          }
        ]
      },
      features2: {
        title: "수의학 우수성을 위해 제작됨",
        cards: [
          {
            title: "주요 수의학 저널로 학습",
            description: "우리 AI는 광범위한 임상 연구를 기반으로 구축되어 신뢰할 수 있는 전문가 통찰력을 제공합니다.",
            link: "지식 탐색"
          },
          {
            title: "수의사가 사용하도록 제작됨",
            description: "실제 임상 작업을 위해 구축된 우리 AI는 빠르고 정확한 이해를 제공합니다.",
            link: "자세히 알아보기"
          },
          {
            title: "모든 동물의 건강과 존엄성을 위해",
            description: "지능형 의학을 통해 더 나은 치료를 가능하게 하고 동물 복지를 향상시킵니다.",
            link: "우리의 미션 보기"
          }
        ]
      },
      blog: {
        title: "인사이트 & 새소식",
        viewMore: "모두 보기",
        noPosts: "아직 블로그 게시물이 없습니다."
      },
      faq: {
        title: "자주 묻는 질문",
        items: [
          {
            question: "Ruleout에는 어떤 수의학 가이드라인이 포함되어 있나요?",
            answer: "Ruleout은 반려동물, 이국적 종, 응급 의학을 다루는 전 세계 주요 수의학 협회의 포괄적인 임상 가이드라인을 포함합니다. 우리 데이터베이스는 최신 증거 기반 권장 사항으로 지속적으로 업데이트됩니다."
          },
          {
            question: "Ruleout은 누구를 위한 것인가요?",
            answer: "Ruleout은 환자 치료 중 빠르고 신뢰할 수 있는 임상 가이드라인 액세스가 필요한 수의사, 수의 기술자 및 수의학 학생을 위해 설계되었습니다. 바쁜 진료소, 응급 클리닉 및 교육 환경에 완벽합니다."
          },
          {
            question: "Ruleout은 무료인가요?",
            answer: "Ruleout은 오픈 액세스 수의학 문헌에서 파생된 근거 기반 콘텐츠에 대한 제한적인 액세스를 허용하는 무료 플랜을 제공합니다. 더 높은 연구 요구를 가진 사용자를 위해 Pro 및 Max 플랜을 이용할 수 있습니다. 이러한 플랜은 더 높은 연구 쿼리 제한과 더 광범위한 오픈 액세스 소스에서 도출된 증거에 대한 확장된 액세스를 제공하며, 정기적인 콘텐츠 업데이트가 포함됩니다."
          },
          {
            question: "임상 참고 자료는 어떻게 조달되고 유지 관리되나요?",
            answer: "Ruleout은 오픈 액세스(CC BY) 수의학 연구 출판물 및 공개적으로 이용 가능한 근거 기반 자료의 콘텐츠를 참조하고 분석합니다. 모든 소스 자료는 해당 라이선스에 따라 사용되며, 원저자 및 출판 정보가 보존됩니다. 콘텐츠는 새로운 오픈 액세스 문헌이 제공됨에 따라 정기적으로 업데이트됩니다."
          },
          {
            question: "Ruleout은 어떤 검색 기능을 제공하나요?",
            answer: "Ruleout은 고급 AI를 사용하여 자연어로 된 임상 쿼리를 이해합니다. 증상, 진단, 종 또는 치료 프로토콜로 검색하고 인용과 함께 즉각적이고 관련성 있는 가이드라인 권장 사항을 얻을 수 있습니다."
          },
          {
            question: "모바일 기기에서 Ruleout에 액세스할 수 있나요?",
            answer: "네! Ruleout은 완전히 반응형이며 스마트폰, 태블릿 및 데스크톱 컴퓨터에서 원활하게 작동합니다. 클리닉 어디에서나 또는 이동 중에도 중요한 가이드라인에 액세스하세요."
          }
        ]
      },
      banner: {
        title: "귀사를 위한 전문가급 AI를 경험하세요",
        button: "데모 요청하기"
      }
    },
    日本語: {
      hero: {
        title: "すべての動物診断の\n科学的根拠",
        subtitle: "獣医師がより迅速で正確な診断を下せるように",
        placeholder: "医学的な質問を入力してください..."
      },
      suggestions: [
        {
          icon: BookText,
          text: "ガイドライン",
          questions: [
            "犬のワクチン接種プロトコルに関するWSAVAガイドラインは何ですか？",
            "猫の糖尿病管理の標準プロトコルは何ですか？",
            "術後の犬の疼痛管理ガイドラインは何ですか？"
          ]
        },
        {
          icon: Pill,
          text: "薬物投与",
          questions: [
            "骨関節炎のある15kgの犬に対するメロキシカムの安全な投与量は？",
            "心臓病のある猫にアセプロマジンを投与できますか？",
            "腎機能不全のある犬の抗生物質投与量をどのように調整すべきですか？"
          ]
        },
        {
          icon: Stethoscope,
          text: "治療の代替案",
          questions: [
            "ペニシリンアレルギーのある犬のための代替抗生物質は？",
            "猫がメロキシカムを耐えられない場合に使用できるNSAIDは？",
            "ステロイド以外の犬のアトピー性皮膚炎の治療代替案は？"
          ]
        },
        {
          icon: Activity,
          text: "診断プロトコル",
          questions: [
            "猫の甲状腺機能亢進症が疑われる場合に推奨される診断検査は？",
            "犬のクッシング症候群の診断プロトコルは何ですか？",
            "膵炎が疑われる犬にどのようにアプローチすべきですか？"
          ]
        }
      ],
      partners: {
        subtitle: "",
        title: "獣医師のために構築",
        footnote: "ジャーナルロゴは各所有者の財産です。表示は推奨または提携を意味するものではありません。"
      },
      features: {
        title: "臨床的に高度で、即座に応答します。",
        description: "当社のモデルは、驚異的なスピードと医学的精度で獣医学の回答を提供します。",
        link: "機能について詳しく見る"
      },
      carousel: {
        title: "指先で高度な臨床知見にアクセス",
        description: "エビデンスに基づくガイドラインと治療プロトコルに即座にアクセスし、包括的な参照サポートで自信を持って臨床判断を下すことができます。",
        slides: [
          {
            title: "包括的なガイドラインデータベース",
            description: "最新の獣医学研究で定期的に更新される数千のピアレビュー臨床ガイドラインにアクセスできます。"
          },
          {
            title: "エビデンスに基づく意思決定支援",
            description: "最新の医学文献に裏付けられたAI搭載の推奨事項で、自信を持って臨床決定を下すことができます。"
          },
          {
            title: "即座の参照検索",
            description: "関連する治療プロトコルと診断基準を数秒で見つけ、臨床ワークフローを効率化します。"
          }
        ]
      },
      features2: {
        title: "獣医学の卓越性のために構築",
        cards: [
          {
            title: "主要な獣医学ジャーナルで訓練",
            description: "当社のAIは広範な臨床研究に基づいて構築され、信頼できる専門的な洞察を提供します。",
            link: "知識を探索"
          },
          {
            title: "獣医師が使用するために作成",
            description: "実際の臨床業務のために構築された当社のAIは、迅速で正確な理解を提供します。",
            link: "詳細を見る"
          },
          {
            title: "すべての動物の健康と尊厳のために",
            description: "インテリジェントな医療を通じて、より良いケアを可能にし、動物福祉を向上させます。",
            link: "私たちのミッションを見る"
          }
        ]
      },
      blog: {
        title: "インサイト",
        viewMore: "もっと見る",
        noPosts: "まだブログ投稿はありません。"
      },
      faq: {
        title: "よくある質問",
        items: [
          {
            question: "Ruleoutにはどのような獣医学ガイドラインが含まれていますか？",
            answer: "Ruleoutには、コンパニオンアニマル、エキゾチック種、救急医療をカバーする世界中の主要な獣医学協会の包括的な臨床ガイドラインが含まれています。当社のデータベースは、最新のエビデンスに基づく推奨事項で継続的に更新されています。"
          },
          {
            question: "Ruleoutは誰のためのものですか？",
            answer: "Ruleoutは、患者ケア中に迅速で信頼できる臨床ガイドラインへのアクセスを必要とする獣医師、獣医技術者、獣医学生向けに設計されています。多忙な診療所、救急クリニック、教育環境に最適です。"
          },
          {
            question: "Ruleoutは無料ですか？",
            answer: "Ruleoutは、オープンアクセス獣医学文献から得られたエビデンスに基づくコンテンツへの限定的なアクセスを可能にする無料プランを提供しています。より高い研究ニーズを持つユーザーには、ProおよびMaxプランが利用可能です。これらのプランは、より高い研究クエリ制限と、より広範なオープンアクセスソースから得られたエビデンスへの拡張アクセスを提供し、定期的なコンテンツ更新が含まれます。"
          },
          {
            question: "臨床参考資料はどのように調達され、維持されていますか？",
            answer: "Ruleoutは、オープンアクセス(CC BY)獣医学研究出版物および一般に利用可能なエビデンスに基づくリソースからのコンテンツを参照および分析します。すべてのソース資料は、それぞれのライセンスに従って使用され、元の著者および出版情報が保持されます。コンテンツは、新しいオープンアクセス文献が利用可能になるにつれて定期的に更新されます。"
          },
          {
            question: "Ruleoutはどのような検索機能を提供していますか？",
            answer: "Ruleoutは、自然言語での臨床クエリを理解する高度なAIを使用しています。症状、診断、種、または治療プロトコルで検索し、引用付きの即座で関連性の高いガイドライン推奨事項を取得できます。"
          },
          {
            question: "モバイルデバイスでRuleoutにアクセスできますか？",
            answer: "はい！Ruleoutは完全にレスポンシブで、スマートフォン、タブレット、デスクトップコンピュータでシームレスに動作します。クリニックのどこからでも、または外出先でも重要なガイドラインにアクセスできます。"
          }
        ]
      },
      banner: {
        title: "貴社のためのプロフェッショナルクラスAIを体験",
        button: "デモをリクエスト"
      }
    }
  };

  const currentContent = content[language as keyof typeof content];

  return (
    <div className={`min-h-screen ${effectiveTheme === "light" ? "bg-white text-gray-900" : "bg-[#1a1a1a] text-white"}`}>
      {/* Toolbar */}
      <Toolbar onLoginClick={handleLogin} />

      {/* Hero Section */}
      <div className="bg-[#0a0a0a] py-20 pt-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          {/* 메인 문구 */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-normal leading-tight text-white mb-6 font-hedvig" style={{ fontFamily: "var(--font-hedvig-letters-serif), serif !important" }}>
            {currentContent.hero.title.split('\n').map((line, i) => (
              <span key={i}>
                {line}
                {i === 0 && <br />}
              </span>
            ))}
          </h1>

          {/* 세부 문구 */}
          <p className="text-base sm:text-lg md:text-xl text-gray-400 mb-8 max-w-2xl mx-auto" style={{ fontFamily: "var(--font-helvetica), sans-serif" }}>
            {currentContent.hero.subtitle}
          </p>

          {/* Start Now 버튼 */}
          <button
            onClick={() => router.push('/login')}
            className="px-6 py-3 bg-white text-black text-sm font-normal rounded-lg hover:bg-gray-100 transition-all duration-300"
            style={{ fontFamily: "var(--font-helvetica), sans-serif" }}
          >
            Start Now
          </button>

          {/* 이미지 플레이스홀더 섹션 */}
          <div className="mt-16 relative rounded-xl overflow-hidden shadow-2xl bg-gray-900 border border-gray-800">
            <div className="relative aspect-video flex items-center justify-center">
              <div className="text-gray-500 text-lg">Image Placeholder</div>
            </div>
          </div>
        </div>
      </div>

      {/* Partners Section */}
      <div className={`${effectiveTheme === "light" ? "bg-gray-50" : "bg-[#0a0a0a]"} py-12`}>
        <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl font-normal text-white mb-6" style={{ fontFamily: "var(--font-hedvig-letters-serif), serif" }}>
              {currentContent.partners.title}
            </h2>
          </div>

          {/* 파트너 로고 무한 스크롤 */}
          <div className="relative overflow-hidden">
            <div className="flex animate-scroll">
              {/* 첫 번째 세트 */}
              <div className="flex items-center justify-center h-20 bg-transparent rounded-lg p-3 min-w-[200px]">
                <Image
                  src="/image/acvim.png"
                  alt="ACVIM"
                  width={130}
                  height={50}
                  className="object-contain"
                />
              </div>
              <div className="flex items-center justify-center h-20 bg-transparent rounded-lg p-3 min-w-[200px]">
                <Image
                  src="/image/annual reviews.png"
                  alt="Annual Reviews"
                  width={130}
                  height={50}
                  className="object-contain"
                />
              </div>
              <div className="flex items-center justify-center h-20 bg-transparent rounded-lg p-3 min-w-[200px]">
                <Image
                  src="/image/frontiers.png"
                  alt="Frontiers"
                  width={130}
                  height={50}
                  className="object-contain"
                />
              </div>
              <div className="flex items-center justify-center h-20 bg-transparent rounded-lg p-3 min-w-[200px]">
                <Image
                  src="/image/BMC.png"
                  alt="BMC"
                  width={130}
                  height={50}
                  className="object-contain"
                />
              </div>
              <div className="flex items-center justify-center h-20 bg-transparent rounded-lg p-3 min-w-[200px]">
                <Image
                  src="/image/acvim.png"
                  alt="ACVIM"
                  width={130}
                  height={50}
                  className="object-contain"
                />
              </div>
              <div className="flex items-center justify-center h-20 bg-transparent rounded-lg p-3 min-w-[200px]">
                <Image
                  src="/image/annual reviews.png"
                  alt="Annual Reviews"
                  width={130}
                  height={50}
                  className="object-contain"
                />
              </div>
              <div className="flex items-center justify-center h-20 bg-transparent rounded-lg p-3 min-w-[200px]">
                <Image
                  src="/image/frontiers.png"
                  alt="Frontiers"
                  width={130}
                  height={50}
                  className="object-contain"
                />
              </div>
              <div className="flex items-center justify-center h-20 bg-transparent rounded-lg p-3 min-w-[200px]">
                <Image
                  src="/image/BMC.png"
                  alt="BMC"
                  width={130}
                  height={50}
                  className="object-contain"
                />
              </div>

              {/* 두 번째 세트 (무한 스크롤을 위한 복사본) */}
              <div className="flex items-center justify-center h-20 bg-transparent rounded-lg p-3 min-w-[200px]">
                <Image
                  src="/image/acvim.png"
                  alt="ACVIM"
                  width={130}
                  height={50}
                  className="object-contain"
                />
              </div>
              <div className="flex items-center justify-center h-20 bg-transparent rounded-lg p-3 min-w-[200px]">
                <Image
                  src="/image/annual reviews.png"
                  alt="Annual Reviews"
                  width={130}
                  height={50}
                  className="object-contain"
                />
              </div>
              <div className="flex items-center justify-center h-20 bg-transparent rounded-lg p-3 min-w-[200px]">
                <Image
                  src="/image/frontiers.png"
                  alt="Frontiers"
                  width={130}
                  height={50}
                  className="object-contain"
                />
              </div>
              <div className="flex items-center justify-center h-20 bg-transparent rounded-lg p-3 min-w-[200px]">
                <Image
                  src="/image/BMC.png"
                  alt="BMC"
                  width={130}
                  height={50}
                  className="object-contain"
                />
              </div>
              <div className="flex items-center justify-center h-20 bg-transparent rounded-lg p-3 min-w-[200px]">
                <Image
                  src="/image/acvim.png"
                  alt="ACVIM"
                  width={130}
                  height={50}
                  className="object-contain"
                />
              </div>
              <div className="flex items-center justify-center h-20 bg-transparent rounded-lg p-3 min-w-[200px]">
                <Image
                  src="/image/annual reviews.png"
                  alt="Annual Reviews"
                  width={130}
                  height={50}
                  className="object-contain"
                />
              </div>
              <div className="flex items-center justify-center h-20 bg-transparent rounded-lg p-3 min-w-[200px]">
                <Image
                  src="/image/frontiers.png"
                  alt="Frontiers"
                  width={130}
                  height={50}
                  className="object-contain"
                />
              </div>
              <div className="flex items-center justify-center h-20 bg-transparent rounded-lg p-3 min-w-[200px]">
                <Image
                  src="/image/BMC.png"
                  alt="BMC"
                  width={130}
                  height={50}
                  className="object-contain"
                />
              </div>
            </div>
          </div>

          {/* Footnote */}
          <div className="text-right mt-6">
            <p className="text-xs text-gray-500" style={{ fontFamily: "var(--font-helvetica), sans-serif" }}>
              {currentContent.partners.footnote}
            </p>
          </div>
        </div>
      </div>

      {/* New Platform Section */}
      <div className={`${effectiveTheme === "light" ? "bg-gray-50" : "bg-[#0a0a0a]"} py-32`}>
        <div className="max-w-7xl mx-auto px-6">
          {/* Title - Center Aligned */}
          <div className="text-center mb-16">
            <h2
              className={`text-2xl md:text-3xl ${effectiveTheme === "light" ? "text-gray-900" : "text-white"}`}
              style={{ fontFamily: "var(--font-hedvig-letters-serif), serif" }}
            >
              Augment All of Your Work on<br />One Integrated, Secure Platform
            </h2>
          </div>

          {/* Feature Cards Container */}
          <div className="space-y-32">
            {/* Feature Card 1 - Image Left */}
            <div className={`rounded-lg overflow-hidden shadow-2xl ${effectiveTheme === "light" ? "border border-gray-200" : "border border-gray-800"}`}>
              <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[600px]">
                {/* Left: Image Placeholder */}
                <div className={`${effectiveTheme === "light" ? "bg-gray-100" : "bg-gray-900"} flex items-center justify-center`}>
                  <div className={`text-lg ${effectiveTheme === "light" ? "text-gray-400" : "text-gray-600"}`}>
                    Image Placeholder
                  </div>
                </div>

                {/* Right: Description with light blue background */}
                <div
                  className="p-8 md:p-12 flex flex-col justify-center"
                  style={{ backgroundColor: effectiveTheme === "light" ? "#F0F8FF" : "#0A1628" }}
                >
                  <div className="mb-4">
                    <span className="text-base font-normal text-white">
                      Assistant
                    </span>
                  </div>
                  <h3
                    className={`text-3xl md:text-4xl font-normal mb-4 ${effectiveTheme === "light" ? "text-gray-900" : "text-white"}`}
                    style={{ fontFamily: "var(--font-hedvig-letters-serif), serif" }}
                  >
                    Tailored to Your Expertise
                  </h3>
                  <p className={`text-sm md:text-base mb-6 ${effectiveTheme === "light" ? "text-gray-700" : "text-gray-300"}`}>
                    Delegate complex tasks in natural language to your domain-specific personal assistant.
                  </p>
                  <button className={`flex items-center transition-colors ${effectiveTheme === "light" ? "text-gray-400 hover:text-gray-500" : "text-gray-400 hover:text-gray-300"}`}>
                    <span className="font-normal">Explore Assistant</span>
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Feature Card 2 - Image Right */}
            <div className={`rounded-lg overflow-hidden shadow-2xl ${effectiveTheme === "light" ? "border border-gray-200" : "border border-gray-800"}`}>
              <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[600px]">
                {/* Left: Description with light blue background */}
                <div
                  className="p-8 md:p-12 flex flex-col justify-center"
                  style={{ backgroundColor: effectiveTheme === "light" ? "#F0F8FF" : "#0A1628" }}
                >
                  <div className="mb-4">
                    <span className="text-base font-normal text-white">
                      Feature
                    </span>
                  </div>
                  <h3
                    className={`text-3xl md:text-4xl font-normal mb-4 ${effectiveTheme === "light" ? "text-gray-900" : "text-white"}`}
                    style={{ fontFamily: "var(--font-hedvig-letters-serif), serif" }}
                  >
                    Advanced Analytics
                  </h3>
                  <p className={`text-sm md:text-base mb-6 ${effectiveTheme === "light" ? "text-gray-700" : "text-gray-300"}`}>
                    Gain insights from comprehensive data analysis and reporting tools designed for veterinary professionals.
                  </p>
                  <button className={`flex items-center transition-colors ${effectiveTheme === "light" ? "text-gray-400 hover:text-gray-500" : "text-gray-400 hover:text-gray-300"}`}>
                    <span className="font-normal">Learn More</span>
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </button>
                </div>

                {/* Right: Image Placeholder */}
                <div className={`${effectiveTheme === "light" ? "bg-gray-100" : "bg-gray-900"} flex items-center justify-center`}>
                  <div className={`text-lg ${effectiveTheme === "light" ? "text-gray-400" : "text-gray-600"}`}>
                    Image Placeholder
                  </div>
                </div>
              </div>
            </div>

            {/* Feature Card 3 - Image Left */}
            <div className={`rounded-lg overflow-hidden shadow-2xl ${effectiveTheme === "light" ? "border border-gray-200" : "border border-gray-800"}`}>
              <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[600px]">
                {/* Left: Image Placeholder */}
                <div className={`${effectiveTheme === "light" ? "bg-gray-100" : "bg-gray-900"} flex items-center justify-center`}>
                  <div className={`text-lg ${effectiveTheme === "light" ? "text-gray-400" : "text-gray-600"}`}>
                    Image Placeholder
                  </div>
                </div>

                {/* Right: Description with light blue background */}
                <div
                  className="p-8 md:p-12 flex flex-col justify-center"
                  style={{ backgroundColor: effectiveTheme === "light" ? "#F0F8FF" : "#0A1628" }}
                >
                  <div className="mb-4">
                    <span className="text-base font-normal text-white">
                      Integration
                    </span>
                  </div>
                  <h3
                    className={`text-3xl md:text-4xl font-normal mb-4 ${effectiveTheme === "light" ? "text-gray-900" : "text-white"}`}
                    style={{ fontFamily: "var(--font-hedvig-letters-serif), serif" }}
                  >
                    Seamless Workflow
                  </h3>
                  <p className={`text-sm md:text-base mb-6 ${effectiveTheme === "light" ? "text-gray-700" : "text-gray-300"}`}>
                    Integrate with your existing practice management systems for a unified experience.
                  </p>
                  <button className={`flex items-center transition-colors ${effectiveTheme === "light" ? "text-gray-400 hover:text-gray-500" : "text-gray-400 hover:text-gray-300"}`}>
                    <span className="font-normal">View Integrations</span>
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quantifiable Impact Section */}
      <div className={`${effectiveTheme === "light" ? "bg-gray-50" : "bg-[#0a0a0a]"} py-10`}>
        <div className="max-w-7xl mx-auto px-6">
          {/* Title */}
          <div className="text-center mb-20">
            <h2
              className={`text-2xl md:text-3xl font-normal ${effectiveTheme === "light" ? "text-gray-900" : "text-white"}`}
              style={{ fontFamily: "var(--font-hedvig-letters-serif), serif" }}
            >
              Quantifiable Impact
            </h2>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
            {/* Stat 1 */}
            <div className="text-center py-12 relative">
              <div className={`text-4xl md:text-5xl font-normal mb-6 ${effectiveTheme === "light" ? "text-gray-900" : "text-white"}`} style={{ fontFamily: "var(--font-hedvig-letters-serif), serif" }}>
                700
              </div>
              <p className={`text-base md:text-lg font-normal ${effectiveTheme === "light" ? "text-gray-600" : "text-gray-300"}`}>
                Leading law firms and<br />enterprises
              </p>
              {/* Short divider */}
              <div className={`hidden md:block absolute right-0 top-1/2 -translate-y-1/2 h-24 w-px ${effectiveTheme === "light" ? "bg-gray-300" : "bg-gray-700"}`}></div>
            </div>

            {/* Stat 2 */}
            <div className="text-center py-12 relative">
              <div className={`text-4xl md:text-5xl font-normal mb-6 ${effectiveTheme === "light" ? "text-gray-900" : "text-white"}`} style={{ fontFamily: "var(--font-hedvig-letters-serif), serif" }}>
                50
              </div>
              <p className={`text-base md:text-lg font-normal ${effectiveTheme === "light" ? "text-gray-600" : "text-gray-300"}`}>
                of AmLaw 100 firms on Harvey
              </p>
              {/* Short divider */}
              <div className={`hidden md:block absolute right-0 top-1/2 -translate-y-1/2 h-24 w-px ${effectiveTheme === "light" ? "bg-gray-300" : "bg-gray-700"}`}></div>
            </div>

            {/* Stat 3 */}
            <div className="text-center py-12">
              <div className={`text-4xl md:text-5xl font-normal mb-6 ${effectiveTheme === "light" ? "text-gray-900" : "text-white"}`} style={{ fontFamily: "var(--font-hedvig-letters-serif), serif" }}>
                74k+
              </div>
              <p className={`text-base md:text-lg font-normal ${effectiveTheme === "light" ? "text-gray-600" : "text-gray-300"}`}>
                Lawyers using Harvey
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Solutions Section */}
      <SolutionsSection effectiveTheme={effectiveTheme} />

      {/* Enterprise Features Section */}
      <div className="bg-[#0a0a0a] py-20">
        <div className="max-w-7xl mx-auto px-6">
          {/* Title */}
          <div className="text-center mb-16">
            <h2
              className="text-white text-3xl md:text-4xl font-normal"
              style={{ fontFamily: "var(--font-hedvig-letters-serif), serif" }}
            >
              Unlock Professional Class AI For Your Firm
            </h2>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1: Enterprise-Grade Security */}
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-white text-base font-normal mb-2" style={{ fontFamily: "var(--font-helvetica), sans-serif" }}>
                Enterprise-Grade Security
              </h3>
              <p className="text-gray-400 text-sm" style={{ fontFamily: "var(--font-helvetica), sans-serif" }}>
                Robust, industry-standard protection with zero training on your data.
              </p>
            </div>

            {/* Feature 2: Agentive Workflows */}
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-white text-base font-normal mb-2" style={{ fontFamily: "var(--font-helvetica), sans-serif" }}>
                Agentive Workflows
              </h3>
              <p className="text-gray-400 text-sm" style={{ fontFamily: "var(--font-helvetica), sans-serif" }}>
                Produce expert-quality work product for complex workflows, with no prompting required.
              </p>
            </div>

            {/* Feature 3: Domain-Specific Models */}
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
              </div>
              <h3 className="text-white text-base font-normal mb-2" style={{ fontFamily: "var(--font-helvetica), sans-serif" }}>
                Domain-Specific Models
              </h3>
              <p className="text-gray-400 text-sm" style={{ fontFamily: "var(--font-helvetica), sans-serif" }}>
                High-performing custom models built for complex professional work.
              </p>
            </div>

            {/* Feature 4: 24/7 Customer Support */}
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-white text-base font-normal mb-2" style={{ fontFamily: "var(--font-helvetica), sans-serif" }}>
                24/7 Customer Support
              </h3>
              <p className="text-gray-400 text-sm" style={{ fontFamily: "var(--font-helvetica), sans-serif" }}>
                White glove support to resolve issues and maximize your Harvey experience.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Blog Section - Insights */}
      <div className={`${effectiveTheme === "light" ? "bg-gray-50" : "bg-[#0a0a0a]"} py-20`}>
        <div className="max-w-[1600px] mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-12 items-start">
            {/* Left: Header */}
            <div className="lg:w-56 lg:ml-8 flex-shrink-0">
              <h2
                className={`text-4xl md:text-5xl font-normal ${effectiveTheme === "light" ? "text-gray-900" : "text-white"} mb-2`}
                style={{ fontFamily: "var(--font-hedvig-letters-serif), serif" }}
              >
                {currentContent.blog.title}
              </h2>
              <button
                onClick={() => router.push('/blog')}
                className={`text-sm ${effectiveTheme === "light" ? "text-gray-600 hover:text-gray-900" : "text-gray-400 hover:text-white"} transition-colors flex items-center space-x-1`}
              >
                <span>{currentContent.blog.viewMore}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Right: Blog Cards */}
            <div className="flex-1">
              {isLoadingBlogs ? (
                // Loading state
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="rounded-2xl overflow-hidden animate-pulse">
                      <div className={`${effectiveTheme === "light" ? "bg-gray-200" : "bg-gray-800"} h-64`}></div>
                      <div className={`${effectiveTheme === "light" ? "bg-white" : "bg-[#1a1a1a]"} p-6`}>
                        <div className={`h-6 ${effectiveTheme === "light" ? "bg-gray-200" : "bg-gray-800"} rounded w-3/4 mb-3`}></div>
                        <div className={`h-4 ${effectiveTheme === "light" ? "bg-gray-200" : "bg-gray-800"} rounded w-1/2`}></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : blogPosts.length > 0 ? (
                // Display actual blog posts
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {blogPosts.slice(0, 3).map((post, index) => {
                    // Different background colors for each card
                    const cardColors = [
                      { bg: "#1a3d2e", text: "white" }, // Dark green
                      { bg: "#d97736", text: "white" }, // Orange
                      { bg: "#d4e89e", text: "#1a1a1a" }, // Light yellow-green
                    ];
                    const color = cardColors[index % cardColors.length];

                    return (
                      <div
                        key={post.id}
                        onClick={() => router.push(`/blog/${post.slug}`)}
                        className="group cursor-pointer"
                      >
                        {/* Image/Preview Area */}
                        <div
                          className="w-full aspect-[4/3] flex items-center justify-center p-8 rounded-sm shadow-lg overflow-hidden"
                          style={{ backgroundColor: color.bg }}
                        >
                          {post.imageUrl ? (
                            <Image
                              src={post.imageUrl}
                              alt={post.title}
                              width={400}
                              height={300}
                              className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                            />
                          ) : (
                            <div className="text-center transition-transform duration-500 group-hover:scale-110" style={{ color: color.text }}>
                              <h3 className="text-xl md:text-2xl font-normal mb-4" style={{ fontFamily: "var(--font-hedvig-letters-serif), serif" }}>
                                {post.title.length > 40 ? post.title.substring(0, 40) + "..." : post.title}
                              </h3>
                              {post.subtitle && (
                                <p className="text-sm opacity-90" style={{ fontFamily: "var(--font-helvetica), sans-serif" }}>
                                  {post.subtitle.length > 60 ? post.subtitle.substring(0, 60) + "..." : post.subtitle}
                                </p>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Content Area - Transparent Background */}
                        <div className="p-6 bg-transparent max-w-md">
                          <h3 className={`text-base font-normal ${effectiveTheme === "light" ? "text-gray-900" : "text-white"} mb-3 group-hover:text-[#4DB8C4] transition-colors`} style={{ fontFamily: "var(--font-helvetica), sans-serif" }}>
                            {post.title}
                          </h3>
                          {/* Badge for Category */}
                          <span className={`inline-block px-3 py-1 text-xs font-normal rounded-full ${effectiveTheme === "light" ? "bg-gray-200 text-gray-700" : "bg-gray-800 text-gray-300"}`}>
                            {post.category}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                // No posts found
                <div className={`${effectiveTheme === "light" ? "bg-gray-50 border-gray-200" : "bg-[#0d0d0d] border-gray-800"} rounded-xl p-12 border text-center`}>
                  <p className={`${effectiveTheme === "light" ? "text-gray-600" : "text-gray-400"}`}>{currentContent.blog.noPosts}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Testimonial Section */}
      <div className="py-20" style={{ backgroundColor: "#A8C5E3" }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Image */}
            <div className="flex justify-center lg:justify-start">
              <div className="w-11/12">
                <div className="bg-gray-300 aspect-[4/5] rounded flex items-center justify-center">
                  <span className="text-gray-500 text-sm">Image Placeholder</span>
                </div>
              </div>
            </div>

            {/* Right: Quote */}
            <div className="flex flex-col justify-center">
              <blockquote className="text-black text-xl md:text-2xl font-normal mb-6 leading-relaxed" style={{ fontFamily: "var(--font-hedvig-letters-serif), serif" }}>
                "When it comes to AI and technology, it's all about learning by doing. You won't figure everything out right away, but the more you engage with it, the more opportunities you'll see."
              </blockquote>
              <div className="text-black">
                <p className="font-medium text-base" style={{ fontFamily: "var(--font-helvetica), sans-serif" }}>
                  Thomas Lambert
                </p>
                <p className="text-sm text-black/70" style={{ fontFamily: "var(--font-helvetica), sans-serif" }}>
                  General Counsel, Ryer
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className={`${effectiveTheme === "light" ? "bg-white" : "bg-[#0a0a0a]"} py-24`}>
        <div className="max-w-5xl mx-auto px-6">
          <h2 className={`text-3xl md:text-4xl font-normal ${effectiveTheme === "light" ? "text-gray-900" : "text-white"} mb-12`} style={{ fontFamily: "var(--font-hedvig-letters-serif), serif" }}>
            {currentContent.faq.title}
          </h2>

          <div className="space-y-4">
            {currentContent.faq.items.map((faq, index) => (
              <FAQItem key={index} question={faq.question} answer={faq.answer} theme={effectiveTheme} />
            ))}
          </div>
        </div>
      </div>

      {/* Banner Section */}
      <div className="bg-[#0a0a0a] py-20">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <h2
            className="text-white text-2xl md:text-3xl font-normal max-w-2xl"
            style={{ fontFamily: "var(--font-hedvig-letters-serif), serif" }}
          >
            {currentContent.banner.title}
          </h2>
          <button
            onClick={() => router.push('/login')}
            className="bg-white text-black px-8 py-4 rounded-lg text-base font-normal hover:bg-gray-100 transition-colors"
            style={{ fontFamily: "var(--font-helvetica), sans-serif" }}
          >
            {currentContent.banner.button}
          </button>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
