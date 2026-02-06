"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Sidebar from "../components/Sidebar";
import MainContent from "../components/MainContent";
import ChatView from "../components/ChatView";
import HistoryView from "../components/HistoryView";
import CollectionsView from "../components/CollectionsView";
import ProjectDetailView from "../components/ProjectDetailView";
import LoginModal from "../components/LoginModal";
import { useAuth } from "@/contexts/AuthContext";
import { addConversationToProject } from "@/lib/projectService";

function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  // 로그인하지 않은 사용자는 랜딩 페이지로 리다이렉트
  useEffect(() => {
    if (!user) {
      router.push("/");
    }
  }, [user, router]);
  // 모바일에서는 기본적으로 사이드바 닫힘
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentView, setCurrentView] = useState<"home" | "chat" | "history" | "collections" | "projectDetail">("home");
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [sidebarRefreshKey, setSidebarRefreshKey] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // 데스크톱에서는 사이드바를 기본적으로 열림 상태로 설정
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        // md breakpoint
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    // 초기 실행
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  // URL 파라미터 확인 및 페이지 상태 복원
  useEffect(() => {
    const resetParam = searchParams.get("reset");

    // 로그인 후 리셋 요청이 있는 경우
    if (resetParam === "true") {
      // 명시적으로 초기 상태로 리셋
      setCurrentView("home");
      setCurrentQuestion("");
      setCurrentConversationId(null);
      setCurrentProjectId(null);
      setIsInitialized(true);

      // localStorage도 명시적으로 초기화
      localStorage.removeItem("currentView");
      localStorage.removeItem("currentConversationId");
      localStorage.removeItem("currentProjectId");

      console.log("Reset to initial state after login");
      return;
    }

    // 페이지 상태 복원
    const savedView = localStorage.getItem("currentView");
    const savedConversationId = localStorage.getItem("currentConversationId");
    const savedProjectId = localStorage.getItem("currentProjectId");

    if (savedView) {
      setCurrentView(savedView as any);
    }
    if (savedConversationId && savedConversationId !== "null") {
      setCurrentConversationId(savedConversationId);
    }
    if (savedProjectId && savedProjectId !== "null") {
      setCurrentProjectId(savedProjectId);
    }
    setIsInitialized(true);
  }, [searchParams]);

  // 페이지 상태 저장
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("currentView", currentView);
      localStorage.setItem("currentConversationId", currentConversationId || "null");
      localStorage.setItem("currentProjectId", currentProjectId || "null");
    }
  }, [currentView, currentConversationId, currentProjectId, isInitialized]);

  const handleQuestionSubmit = (question: string, projectId?: string | null) => {
    setCurrentQuestion(question);
    setCurrentConversationId(null); // 새 대화 시작
    if (projectId) {
      // 프로젝트 ID를 유지하면서 채팅방으로 이동
      setCurrentProjectId(projectId);
    }
    setCurrentView("chat");
  };

  const handleNewChat = () => {
    setCurrentView("home");
    setCurrentQuestion("");
    setCurrentConversationId(null);
  };

  const handleSelectChat = (conversationId: string) => {
    setCurrentConversationId(conversationId);
    setCurrentQuestion(""); // 기존 대화 불러올 때는 빈 문자열
    setCurrentView("chat");
  };

  const handleTitleUpdated = () => {
    // 제목이 업데이트되면 사이드바 새로고침
    setSidebarRefreshKey(prev => prev + 1);
  };

  const handleConversationDeleted = () => {
    // 대화가 삭제되면 사이드바 새로고침
    setSidebarRefreshKey(prev => prev + 1);
  };

  const handleConversationCreated = async (conversationId: string) => {
    setCurrentConversationId(conversationId);

    // 프로젝트 컨텍스트에서 생성된 경우 자동으로 프로젝트에 추가
    if (currentProjectId) {
      try {
        await addConversationToProject(currentProjectId, conversationId);
        console.log(`Conversation ${conversationId} added to project ${currentProjectId}`);
      } catch (error) {
        console.error("Failed to add conversation to project:", error);
      }
    }
  };

  const handleShowHistory = () => {
    setCurrentView("history");
  };

  const handleShowCollections = () => {
    setCurrentView("collections");
  };

  const handleShowProjectDetail = (projectId: string) => {
    setCurrentProjectId(projectId);
    setCurrentView("projectDetail");
  };

  const handleBackToCollections = () => {
    setCurrentView("collections");
    setCurrentProjectId(null);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* 사이드바 항상 표시 (Guest 모드에서도 표시, 프로필만 없음) */}
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        currentConversationId={currentConversationId}
        currentView={currentView}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        onShowHistory={handleShowHistory}
        onShowCollections={handleShowCollections}
        refreshKey={sidebarRefreshKey}
        onShowLoginModal={() => setShowLoginModal(true)}
      />
      {currentView === "home" ? (
        <MainContent
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onQuestionSubmit={handleQuestionSubmit}
        />
      ) : currentView === "history" ? (
        <HistoryView
          onSelectChat={handleSelectChat}
          onNewChat={handleNewChat}
          onConversationDeleted={handleConversationDeleted}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
      ) : currentView === "collections" ? (
        <CollectionsView
          onNewChat={handleNewChat}
          onSelectProject={handleShowProjectDetail}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
      ) : currentView === "projectDetail" && currentProjectId ? (
        <ProjectDetailView
          projectId={currentProjectId}
          onBack={handleBackToCollections}
          onSelectChat={handleSelectChat}
          onNewChat={handleNewChat}
          onQuestionSubmit={(question) => handleQuestionSubmit(question, currentProjectId)}
          onConversationDeleted={handleConversationDeleted}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
      ) : (
        <ChatView
          initialQuestion={currentQuestion}
          conversationId={currentConversationId}
          onNewQuestion={handleNewChat}
          onConversationCreated={handleConversationCreated}
          onTitleUpdated={handleTitleUpdated}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
      )}

      {/* Login Modal - 사이드바 외부에 렌더링 */}
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </div>
  );
}

export default function Home() {
  return <HomeContent />;
}
