"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowUp, ArrowDown, BookOpen, Copy, Check, Share2, RotateCcw, ThumbsUp, ThumbsDown, ChevronDown, ChevronUp, Loader2, MoreHorizontal, Bookmark, List, Menu, ChevronsLeft, Volume2, VolumeX } from "lucide-react";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import jsPDF from "jspdf";
import { Timestamp } from "firebase/firestore";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { getTranslation, getFontFamily } from "@/app/utils/translations";
import {
  createConversation,
  addMessageToConversation,
  updateConversationTitle,
  generateChatTitle,
  getConversation,
  toggleFavorite,
  updateMessage,
} from "@/lib/chatService";
import { uploadAudioFile, saveRecording, formatDate, formatTime as formatRecordingDateTime } from "@/lib/recordingService";
import ThinkingSteps from "./ThinkingSteps";
import CitationBanner from "./CitationBanner";
import OutOfScopeBanner from "./OutOfScopeBanner";
import type { Message as BaseMessage, ThinkingStep } from "@/types/chat";

// ChatView에서 사용하는 Message 타입 (timestamp를 optional로 확장)
interface Message extends Omit<BaseMessage, 'timestamp'> {
  timestamp?: Date | Timestamp;
  isStreaming?: boolean;
}

interface ChatViewProps {
  initialQuestion: string;
  conversationId: string | null;
  onNewQuestion: () => void;
  onConversationCreated?: (conversationId: string) => void;
  onTitleUpdated?: () => void;
  onToggleSidebar?: () => void;
  onToggleRecordingsSidebar?: () => void;
  isVisitMode?: boolean;
  isSidebarOpen?: boolean;
  isRecordingsSidebarOpen?: boolean;
  selectedRecording?: any;
}

export default function ChatView({ initialQuestion, conversationId, onNewQuestion, onConversationCreated, onTitleUpdated, onToggleSidebar, onToggleRecordingsSidebar, isVisitMode = false, isSidebarOpen = false, isRecordingsSidebarOpen = false, selectedRecording }: ChatViewProps) {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [referencesCollapsed, setReferencesCollapsed] = useState<{[key: number]: boolean}>({});
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const hasCalledAPI = useRef(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const isLoadingConversation = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [copiedTableIndex, setCopiedTableIndex] = useState<string | null>(null);
  const [loadingStatus, setLoadingStatus] = useState<string>("");
  const currentThinkingSteps = useRef<ThinkingStep[]>([]);
  const thinkingStartTime = useRef<number>(0);
  const [contextChunks, setContextChunks] = useState<any[]>([]);  // 🔥 누적 컨텍스트 저장
  const [hoveredUserMessage, setHoveredUserMessage] = useState<number | null>(null);
  const [copiedUserMessage, setCopiedUserMessage] = useState<number | null>(null);
  const userScrolledUp = useRef(false); // 사용자가 스크롤을 위로 올렸는지 추적
  const lastScrollHeight = useRef(0); // 이전 스크롤 높이 추적
  const isComposingRef = useRef(false); // IME 입력 중인지 추적

  // Recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<'transcribing' | 'aligning' | 'diarizing' | 'finalizing' | null>(null);
  const [showBetaBanner, setShowBetaBanner] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Transcript results
  interface TranscriptSegment {
    speaker: 'vet' | 'caregiver';
    text: string;
    start: number; // seconds
    end: number;
  }
  const [transcriptSegments, setTranscriptSegments] = useState<TranscriptSegment[]>([]);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Smooth audio progress update using requestAnimationFrame
  useEffect(() => {
    const updateProgress = () => {
      if (audioRef.current && isPlaying) {
        setCurrentTime(audioRef.current.currentTime);
        animationFrameRef.current = requestAnimationFrame(updateProgress);
      }
    };

    if (isPlaying) {
      animationFrameRef.current = requestAnimationFrame(updateProgress);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying]);

  // Load selected recording from sidebar
  useEffect(() => {
    if (selectedRecording) {
      console.log('📋 Loading selected recording:', selectedRecording);
      setTranscriptSegments(selectedRecording.transcript || []);
      setAudioUrl(selectedRecording.audioUrl || null);
      // Clear any existing recording state
      setIsRecording(false);
      setIsProcessing(false);
      setRecordingTime(0);
    } else {
      // selectedRecording이 null이면 상태 리셋 (New Visit 클릭 시)
      console.log('🏠 Resetting to home screen (selectedRecording is null)');
      setTranscriptSegments([]);
      setAudioUrl(null);
      setIsRecording(false);
      setIsProcessing(false);
      setRecordingTime(0);
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
    }
  }, [selectedRecording]);

  // User 상태 로깅
  useEffect(() => {
    console.log("👤 ChatView - User 상태:", user ? `로그인됨 (${user.uid})` : "로그인 안됨");
    console.log("💬 ChatView - Conversation ID:", currentConversationId);
  }, [user, currentConversationId]);

  // Multilingual content
  const content = {
    English: {
      share: "Share",
      export: "Export",
      rewrite: "Rewrite",
      copy: "Copy",
      like: "Like",
      dislike: "Dislike",
      references: "References",
      relatedQuestions: "Related Questions",
      generatingAnswer: "Synthesizing relevant information",
      translating: "Understanding your question",
      embedding: "Converting to vector",
      searching: "Searching veterinary literature and clinical guidelines",
      stop: "Stop",
      freeQueriesRemaining: "Free queries remaining:",
      queryLimitReached: "Query limit reached. Please log in to continue.",
      placeholder: "Ask a follow-up question...",
      more: "More",
      bookmark: "Bookmark",
      finishedThinking: "Finished thinking",
      newBadge: "New"
    },
    한국어: {
      share: "공유",
      export: "내보내기",
      rewrite: "다시 작성",
      copy: "복사",
      like: "좋아요",
      dislike: "싫어요",
      references: "참고문헌",
      relatedQuestions: "관련 질문",
      generatingAnswer: "관련 정보 종합 중",
      translating: "질문 이해 중",
      embedding: "벡터로 변환 중",
      searching: "수의학 문헌 및 임상 가이드라인 검색 중",
      stop: "중지",
      freeQueriesRemaining: "남은 무료 쿼리:",
      queryLimitReached: "쿼리 제한에 도달했습니다. 계속하려면 로그인하세요.",
      placeholder: "후속 질문을 입력하세요...",
      more: "더보기",
      bookmark: "북마크",
      finishedThinking: "사고 완료",
      newBadge: "신규"
    },
    日本語: {
      share: "共有",
      export: "エクスポート",
      rewrite: "書き直す",
      copy: "コピー",
      like: "いいね",
      dislike: "よくないね",
      references: "参考文献",
      relatedQuestions: "関連質問",
      generatingAnswer: "関連情報を統合中",
      translating: "質問を理解中",
      embedding: "ベクトルに変換中",
      searching: "獣医学文献および臨床ガイドライン検索中",
      stop: "停止",
      freeQueriesRemaining: "残りの無料クエリ:",
      queryLimitReached: "クエリ制限に達しました。続行するにはログインしてください。",
      placeholder: "フォローアップの質問を入力...",
      more: "もっと",
      bookmark: "ブックマーク",
      finishedThinking: "思考完了",
      newBadge: "新規"
    }
  };

  const currentContent = content[language as keyof typeof content];


  // 스크롤 위치 감지
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowScrollToBottom(!isNearBottom);

      // 사용자가 직접 스크롤을 위로 올렸는지 감지
      if (!isNearBottom && scrollHeight > lastScrollHeight.current) {
        userScrolledUp.current = true;
      } else if (isNearBottom) {
        userScrolledUp.current = false;
      }

      lastScrollHeight.current = scrollHeight;
    };

    container.addEventListener('scroll', handleScroll);
    handleScroll(); // 초기 상태 체크

    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // 맨 아래로 스크롤하는 함수
  const scrollToBottom = (force = false) => {
    // 사용자가 스크롤을 위로 올렸고, 강제 스크롤이 아니면 자동 스크롤 안함
    if (userScrolledUp.current && !force) {
      return;
    }

    // DOM 업데이트 완료 후 스크롤 (setTimeout 사용)
    setTimeout(() => {
      const container = messagesContainerRef.current;
      if (container) {
        // force가 true면 부드러운 스크롤, 아니면 즉시 스크롤
        container.scrollTo({
          top: container.scrollHeight,
          behavior: force ? 'smooth' : 'auto'
        });
        lastScrollHeight.current = container.scrollHeight;
      }
    }, 100);
  };

  // 스크롤 관리는 명시적 사용자 액션에서만 수행
  // 참고문헌 추가 시 자동 스크롤 방지를 위해 messages dependency useEffect 제거

  // 기존 대화 불러오기 또는 새 대화 시작
  useEffect(() => {
    const loadConversation = async () => {
      if (conversationId) {
        // 기존 대화 불러오기 (conversationId가 변경될 때마다 실행)
        // 단, 현재 conversationId와 동일하면 스킵 (불필요한 리로드 방지)
        if (conversationId === currentConversationId) {
          return;
        }

        try {
          const conversation = await getConversation(conversationId);
          if (conversation && conversation.messages) {
            isLoadingConversation.current = true; // setMessages 직전에 플래그 설정
            // Firebase에서 가져온 메시지를 Message 타입으로 변환
            const typedMessages = conversation.messages.map((msg: any) => ({
              ...msg,
              references: msg.references?.map((ref: any) => ({
                ...ref,
                text: ref.text || '' // text 속성이 없으면 빈 문자열
              }))
            })) as Message[];
            setMessages(typedMessages);
            setCurrentConversationId(conversationId);
            setIsFavorite(conversation.isFavorite || false);
            setContextChunks([]);  // 🔥 기존 대화 불러올 때 컨텍스트 초기화
          }
          // 대화 불러오기 완료 후 hasCalledAPI 리셋
          hasCalledAPI.current = false;
        } catch (error) {
          console.error("대화 불러오기 실패:", error);
          isLoadingConversation.current = false;
        }
      } else if (initialQuestion && !hasCalledAPI.current && messages.length === 0) {
        // 메시지가 없을 때만 새 대화 시작 (새로고침 시 중복 호출 방지)

        // 새 대화 시작
        hasCalledAPI.current = true;
        setContextChunks([]);  // 🔥 새 대화 시작 시 컨텍스트 초기화
        queryAPI(initialQuestion, true);
      }
    };

    loadConversation();
  }, [initialQuestion, conversationId]);

  // Recording time counter
  useEffect(() => {
    if (isRecording) {
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      setRecordingTime(0);
    }

    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    };
  }, [isRecording]);

  // Format recording time (MM:SS)
  const formatRecordingTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Start recording
  const startRecording = async () => {
    // 베타 서비스 준비 중 배너 표시
    setShowBetaBanner(true);

    // 3초 후 배너 자동 숨김
    setTimeout(() => {
      setShowBetaBanner(false);
    }, 3000);

    // 실제 녹음은 시작하지 않음 (베타 서비스 준비 중이므로)
    return;

    /* 원래 녹음 코드 (베타 서비스 준비 완료 시 활성화)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const capturedRecordingTime = recordingTime; // Capture recording time before it resets
        await processRecording(audioBlob, capturedRecordingTime);

        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      console.log('🎙️ Recording started');
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Failed to access microphone. Please check your permissions.');
    }
    */
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      console.log('🛑 Recording stopped');
    }
  };

  // Process recording (transcribe + diarize)
  const processRecording = async (audioBlob: Blob, capturedRecordingTime: number) => {
    if (!user) {
      alert('Please log in to save recordings.');
      return;
    }

    setIsProcessing(true);
    setProcessingStep('transcribing'); // Start with first step immediately

    try {
      // Backend API call for STT + diarization with SSE streaming
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
      const formData = new FormData();
      formData.append('file', audioBlob, 'recording.webm');
      // Don't specify language - let Whisper auto-detect
      formData.append('num_speakers', '2');

      console.log('🎙️ Starting transcription API with SSE...');
      const transcriptionResponse = await fetch(`${backendUrl}/transcribe`, {
        method: 'POST',
        body: formData
      });

      if (!transcriptionResponse.ok) {
        throw new Error(`Transcription API failed: ${transcriptionResponse.statusText}`);
      }

      // Read SSE stream
      const reader = transcriptionResponse.body?.getReader();
      const decoder = new TextDecoder();
      let transcriptionResult: any = null;

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = JSON.parse(line.slice(6));
              console.log('📡 SSE event:', data);

              if (data.status === 'step') {
                // Update processing step based on backend progress
                setProcessingStep(data.step);
              } else if (data.status === 'complete') {
                // Final result received
                transcriptionResult = data;
              } else if (data.status === 'error') {
                throw new Error(data.message);
              }
            }
          }
        }
      }

      if (!transcriptionResult) {
        throw new Error('No transcription result received');
      }

      console.log('📝 Transcription complete:', transcriptionResult);

      const finalTranscript: TranscriptSegment[] = transcriptionResult.segments;

      // Upload audio to Firebase Storage
      console.log('📤 Uploading audio to Firebase Storage...');
      const audioUrl = await uploadAudioFile(audioBlob, user.uid);

      // Calculate duration from transcript (use capturedRecordingTime as fallback)
      const duration = transcriptionResult.duration || capturedRecordingTime;
      console.log('💾 Saving recording with duration:', duration, 'seconds (capturedRecordingTime:', capturedRecordingTime, ', transcriptionResult.duration:', transcriptionResult.duration, ')');

      // Save recording metadata to Firestore
      const now = new Date();
      await saveRecording({
        userId: user.uid,
        date: formatDate(now),
        time: formatRecordingDateTime(now),
        duration,
        audioUrl,
        transcript: finalTranscript,
        createdAt: Timestamp.now()
      });

      setTranscriptSegments(finalTranscript);
      setAudioUrl(audioUrl);

      console.log('✅ Processing complete');
      setIsProcessing(false);
      setProcessingStep(null);

      // Trigger recordings sidebar refresh
      console.log('🔄 Calling onTitleUpdated to refresh RecordingsSidebar...');
      if (onTitleUpdated) {
        onTitleUpdated(); // This triggers sidebarRefreshKey increment in parent
        console.log('✅ onTitleUpdated called successfully');
      } else {
        console.warn('⚠️ onTitleUpdated is not defined!');
      }
    } catch (error) {
      console.error('Error processing recording:', error);
      setIsProcessing(false);
      setProcessingStep(null);
      alert('Failed to process recording. Please try again.');
    }
  };

  // Audio player controls
  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const seekToTime = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const changePlaybackRate = (rate: number) => {
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
      setPlaybackRate(rate);
      setShowSpeedMenu(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // API 호출
  const queryAPI = async (question: string, isFirstMessage: boolean = false, skipUserMessage: boolean = false) => {
    console.log("🚀 queryAPI 호출 시작");
    console.log("   - 질문:", question.slice(0, 50));
    console.log("   - isFirstMessage:", isFirstMessage);
    console.log("   - skipUserMessage:", skipUserMessage);
    console.log("   - user:", user ? `로그인됨 (${user.uid})` : "로그인 안됨");
    console.log("   - currentConversationId:", currentConversationId);

    // Rewrite가 아닌 경우에만 사용자 메시지 추가
    const userMessage: Message = {
      role: "user",
      content: question,
      timestamp: new Date(),
    };

    // 🚀 대화 히스토리 준비 - setMessages 전에 현재 messages 상태 캡처
    const currentMessages = messages; // 현재 messages 상태 저장

    if (!skipUserMessage) {
      setMessages((prev) => [...prev, userMessage]);
    }

    setIsStreaming(true);
    setLoadingStatus(currentContent.translating); // 즉시 로딩 표시 시작

    // Firebase에 사용자 메시지 저장 (Rewrite가 아닌 경우에만)
    if (user && currentConversationId && !skipUserMessage) {
      try {
        // ChatView의 Message를 BaseMessage로 변환 (undefined 제거)
        const baseMessage: BaseMessage = {
          role: userMessage.role,
          content: userMessage.content,
          timestamp: userMessage.timestamp || new Date(),
          ...(userMessage.references && { references: userMessage.references }),
          ...(userMessage.followupQuestions && { followupQuestions: userMessage.followupQuestions }),
          ...(userMessage.feedback && { feedback: userMessage.feedback }),
        };
        await addMessageToConversation(currentConversationId, baseMessage);
      } catch (error) {
        console.error("사용자 메시지 저장 실패:", error);
      }
    }

    try {
      // AbortController 생성
      abortControllerRef.current = new AbortController();

      // 🚀 대화 히스토리 준비 (캡처한 currentMessages 사용)
      // 최근 3턴(6개 메시지)까지만 포함
      const conversationHistory = currentMessages
        .slice(-6) // 최근 6개 메시지만 (3턴)
        .map(msg => ({
          role: msg.role,
          content: msg.content
        }));

      console.log("📝 전송할 대화 히스토리:", conversationHistory.length, "개 메시지");
      if (conversationHistory.length > 0) {
        console.log("   마지막 메시지:", conversationHistory[conversationHistory.length - 1].role, conversationHistory[conversationHistory.length - 1].content.slice(0, 50));
      }

      // 백엔드 SSE 스트리밍 호출 (대화 히스토리 + 누적 컨텍스트 포함)
      console.log("🌐 프론트엔드에서 전송하는 언어:", language);
      console.log("📚 프론트엔드에서 전송하는 이전 컨텍스트:", contextChunks.length, "개");
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
      const response = await fetch(`${backendUrl}/query-stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: question,
          conversation_history: conversationHistory,
          previous_context_chunks: contextChunks,  // 🔥 이전 컨텍스트 전달
          language: language, // 현재 선택된 언어 전송
        }),
        signal: abortControllerRef.current.signal, // AbortController 시그널 추가
      });

      if (!response.ok) {
        throw new Error("응답 실패");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("스트림을 읽을 수 없습니다");
      }

      let buffer = "";
      let streamingAnswer = "";  // 실시간 스트리밍 답변
      let finalAnswer = "";
      let finalReferences: any[] = [];
      let finalFollowupQuestions: string[] = [];
      let hasError = false;
      let errorMessage = "";

      // 사고 과정 초기화
      currentThinkingSteps.current = [];
      thinkingStartTime.current = Date.now();

      // SSE 스트림 읽기 (assistant 메시지는 첫 청크에서 생성)
      const streamStartTime = Date.now();
      console.log(`🕐 [0ms] SSE stream reading started at ${new Date().toISOString()}`);
      let assistantMessageCreated = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));

              // 로딩 상태 업데이트 및 사고 과정 단계 수집
              const now = Date.now();
              const elapsed = now - streamStartTime;
              console.log(`🕐 [+${elapsed}ms] Received event: ${data.status}`);

              if (data.status === "translating") {
                setLoadingStatus(currentContent.translating);
                currentThinkingSteps.current.push({
                  icon: "Languages",
                  text: currentContent.translating,
                  timestamp: now
                });
                console.log("📝 Added translating step:", currentThinkingSteps.current);
              } else if (data.status === "embedding") {
                // 이전 단계(translating)의 duration 계산
                if (currentThinkingSteps.current.length > 0) {
                  const lastStep = currentThinkingSteps.current[currentThinkingSteps.current.length - 1];
                  if (!lastStep.duration) {
                    lastStep.duration = now - lastStep.timestamp;
                  }
                }
                setLoadingStatus(currentContent.embedding);
                currentThinkingSteps.current.push({
                  icon: "Network",
                  text: currentContent.embedding,
                  timestamp: now
                });
                console.log("📝 Added embedding step:", currentThinkingSteps.current);
              } else if (data.status === "searching") {
                // 이전 단계(embedding)의 duration 계산
                if (currentThinkingSteps.current.length > 0) {
                  const lastStep = currentThinkingSteps.current[currentThinkingSteps.current.length - 1];
                  if (!lastStep.duration) {
                    lastStep.duration = now - lastStep.timestamp;
                  }
                }
                setLoadingStatus(currentContent.searching);
                currentThinkingSteps.current.push({
                  icon: "Search",
                  text: currentContent.searching,
                  timestamp: now
                });
                console.log("📝 Added searching step:", currentThinkingSteps.current);
              } else if (data.status === "generating") {
                console.log(`🕐 [+${elapsed}ms] 🔵 GENERATING event received`);
                // 이전 단계(searching)의 duration 계산
                if (currentThinkingSteps.current.length > 0) {
                  const lastStep = currentThinkingSteps.current[currentThinkingSteps.current.length - 1];
                  if (!lastStep.duration) {
                    lastStep.duration = now - lastStep.timestamp;
                  }
                }
                setLoadingStatus(currentContent.generatingAnswer);
                currentThinkingSteps.current.push({
                  icon: "Sparkles",
                  text: currentContent.generatingAnswer,
                  timestamp: now
                });
                console.log(`🕐 [+${elapsed}ms] 📝 Added generating step to thinking steps`);
              }

              if (data.status === "streaming") {
                console.log(`🕐 [+${elapsed}ms] 🟢 STREAMING chunk received (${data.chunk?.length || 0} chars)`);
                // 실시간 스트리밍 청크 수신 (ChatGPT처럼 타이핑 효과)
                streamingAnswer += data.chunk;

                // 첫 번째 스트리밍 청크일 때 assistant 메시지 생성 및 thinking steps 추가
                if (!assistantMessageCreated) {
                  assistantMessageCreated = true;
                  console.log(`🕐 [+${elapsed}ms] 🎯 FIRST STREAMING CHUNK - creating assistant message`);

                  // 로딩 상태 즉시 제거 (텍스트가 보일 준비 완료)
                  setLoadingStatus("");

                  // 마지막 단계(generating)의 duration 계산
                  const now = Date.now();
                  if (currentThinkingSteps.current.length > 0) {
                    const lastStep = currentThinkingSteps.current[currentThinkingSteps.current.length - 1];
                    if (!lastStep.duration) {
                      lastStep.duration = now - lastStep.timestamp;
                    }
                  }

                  // assistant 메시지 생성 (thinking steps와 첫 content 포함)
                  const tempAssistantMessage: Message = {
                    role: "assistant",
                    content: streamingAnswer,
                    isStreaming: true,
                    timestamp: new Date(),
                    thinkingSteps: currentThinkingSteps.current.length > 0 ? [...currentThinkingSteps.current] : undefined,
                  };
                  setMessages((prev) => [...prev, tempAssistantMessage]);
                  console.log(`🕐 [+${elapsed}ms] ✨ Assistant message created with thinking steps and first content`);
                } else {
                  // 실시간으로 UI 업데이트 (타이핑 애니메이션 효과)
                  setMessages((prev) => {
                    const newMessages = [...prev];
                    const lastMsg = newMessages[newMessages.length - 1];
                    if (lastMsg && lastMsg.role === "assistant") {
                      lastMsg.content = streamingAnswer;
                      lastMsg.isStreaming = true;
                    }
                    return newMessages;
                  });
                  console.log(`🕐 [+${elapsed}ms] 💬 UI UPDATED: Content length = ${streamingAnswer.length}`);
                }
              } else if (data.status === "references_ready") {
                // 🚀 스트리밍 완료 직후 참고문헌 즉시 표시
                console.log("📚 References ready - 즉시 표시");
                // 백엔드에서 remapped된 답변 사용 (citation 번호가 0부터 시작하도록 재정렬됨)
                finalAnswer = data.answer || streamingAnswer;
                finalReferences = data.references || [];
                console.log("🔗 Received remapped answer:", finalAnswer.substring(0, 200));
                console.log("🔗 Received references immediately:", finalReferences);

                // 참고문헌 추가 전 현재 스크롤 위치 저장
                const container = messagesContainerRef.current;
                const scrollBefore = container ? container.scrollTop : 0;
                const heightBefore = container ? container.scrollHeight : 0;

                // 참고문헌 즉시 UI 업데이트 (isStreaming = false로 설정하여 버튼과 참고문헌 표시)
                setMessages((prev) => {
                  const newMessages = [...prev];
                  const lastMsg = newMessages[newMessages.length - 1];
                  if (lastMsg && lastMsg.role === "assistant") {
                    lastMsg.content = finalAnswer;  // remapped된 답변 사용
                    lastMsg.references = finalReferences;
                    lastMsg.thinkingSteps = currentThinkingSteps.current.length > 0 ? [...currentThinkingSteps.current] : undefined;
                    lastMsg.isStreaming = false;  // 스트리밍 완료 표시
                    console.log("✅ References added immediately with remapped answer");
                  }
                  return newMessages;
                });

                // 참고문헌 렌더링 후 스크롤 위치 복원 (사용자가 읽던 위치 유지)
                setTimeout(() => {
                  if (container && userScrolledUp.current) {
                    const heightAfter = container.scrollHeight;
                    const heightDiff = heightAfter - heightBefore;
                    // 참고문헌이 추가되어 높이가 증가한 만큼 스크롤 위치 유지
                    container.scrollTop = scrollBefore;
                    console.log(`📍 Scroll position preserved: ${scrollBefore}px (height diff: ${heightDiff}px)`);
                  }
                }, 50);
              } else if (data.status === "done") {
                // 🚀 스트리밍 완료 (References는 이미 references_ready에서 처리됨)
                setLoadingStatus(""); // 로딩 완료
                console.log("✅ Streaming done event received");

                // 🔥 누적 컨텍스트 저장 (다음 질문에서 사용)
                if (data.context_chunks) {
                  setContextChunks(data.context_chunks);
                  console.log("📚 컨텍스트 저장 완료:", data.context_chunks.length, "개");
                }
              } else if (data.status === "followup_ready") {
                // 🚀 후속 질문이 준비되면 추가
                finalFollowupQuestions = data.followup_questions || [];
                console.log("📊 Received follow-up questions:", finalFollowupQuestions);

                // 후속 질문만 추가 (모든 이전 메시지의 followupQuestions는 제거)
                setMessages((prev) => {
                  const newMessages = [...prev];
                  // 모든 이전 assistant 메시지에서 followupQuestions 제거
                  for (let i = 0; i < newMessages.length - 1; i++) {
                    if (newMessages[i].role === "assistant") {
                      newMessages[i].followupQuestions = undefined;
                    }
                  }
                  // 가장 최근 메시지에만 followupQuestions 추가
                  const lastMsg = newMessages[newMessages.length - 1];
                  if (lastMsg && lastMsg.role === "assistant") {
                    lastMsg.followupQuestions = finalFollowupQuestions;
                    console.log("✅ Follow-up questions added to latest message only");
                  }
                  return newMessages;
                });
              } else if (data.status === "out_of_scope") {
                // 범위 밖 질문 처리
                setLoadingStatus("");
                console.log("⚠️  Out of scope query detected in frontend");

                // 사용자 질문 메시지 제거
                setMessages((prev) => {
                  const newMessages = prev.filter(msg => msg.role !== "user" || msg.content !== question);
                  return newMessages;
                });

                // Assistant 메시지를 out_of_scope로 표시
                setMessages((prev) => {
                  const newMessages = [...prev];
                  const lastMsg = newMessages[newMessages.length - 1];
                  if (lastMsg && lastMsg.role === "assistant") {
                    lastMsg.isOutOfScope = true;
                    lastMsg.isStreaming = false;
                    lastMsg.content = ""; // 내용은 비움
                  }
                  return newMessages;
                });
                return; // 더 이상 처리하지 않음
              } else if (data.status === "error") {
                setLoadingStatus(""); // 에러 시에도 로딩 상태 초기화
                hasError = true;
                // 백엔드에서 언어별 에러 메시지를 보내므로 그대로 사용
                const fallbackMessages: { [key: string]: string } = {
                  "한국어": "Ruleout은 수의사가 근거 기반 임상 결정을 내리도록 돕기 위해 설계되었습니다.\n\n다음과 같은 질문을 시도해보세요:\n\"급성 심부전이 의심되는 개에게 어떤 진단 검사를 지시해야 하나요?\"",
                  "English": "Ruleout is designed to help veterinarians make evidence-based clinical decisions.\n\nTry asking a question like:\n\"What diagnostic tests should I order for a dog with suspected acute heart failure?\"",
                  "日本語": "Ruleoutは、獣医師がエビデンスに基づいた臨床判断を下すのを支援するために設計されています。\n\n次のような質問を試してみてください：\n「急性心不全が疑われる犬にどのような診断検査を指示すべきですか？\""
                };
                errorMessage = data.message || fallbackMessages[language] || fallbackMessages["한국어"];
              }
            } catch (e) {
              console.error("SSE 파싱 오류:", e);
            }
          }
        }
      }

      // 에러 처리
      if (hasError) {
        setMessages((prev) => {
          const newMessages = [...prev];
          const lastMsg = newMessages[newMessages.length - 1];
          if (lastMsg && lastMsg.role === "assistant") {
            lastMsg.content = errorMessage;
            lastMsg.isStreaming = false;
          }
          return newMessages;
        });
        return;
      }

      // 🚀 Firebase 저장 로직 (references와 followup questions 모두 받은 후)
      if (finalAnswer && finalReferences.length > 0) {
        console.log("💬 All data ready - saving to Firebase");

        // Firebase에 AI 메시지 저장
        const completedAssistantMessage: Message = {
          role: "assistant",
          content: finalAnswer,
          references: finalReferences,
          followupQuestions: finalFollowupQuestions,
          thinkingSteps: currentThinkingSteps.current.length > 0 ? [...currentThinkingSteps.current] : undefined,
          timestamp: new Date(),
        };

        if (user) {
          try {
            // 첫 메시지인 경우 대화 생성
            if (isFirstMessage && !currentConversationId) {
              console.log("🆕 새 대화 생성 시작 - userId:", user.uid);
              const newConvId = await createConversation(user.uid);
              console.log("✅ 대화 생성 완료 - conversationId:", newConvId);

              setCurrentConversationId(newConvId);
              if (onConversationCreated) {
                onConversationCreated(newConvId);
              }

              // ChatView Message를 BaseMessage로 변환 (undefined 제거)
              const baseUserMessage: BaseMessage = {
                role: userMessage.role,
                content: userMessage.content,
                timestamp: userMessage.timestamp || new Date(),
                ...(userMessage.references && { references: userMessage.references }),
                ...(userMessage.followupQuestions && { followupQuestions: userMessage.followupQuestions }),
                ...(userMessage.feedback && { feedback: userMessage.feedback }),
              };

              const baseAssistantMessage: BaseMessage = {
                role: completedAssistantMessage.role,
                content: completedAssistantMessage.content,
                timestamp: completedAssistantMessage.timestamp || new Date(),
                ...(completedAssistantMessage.references && { references: completedAssistantMessage.references }),
                ...(completedAssistantMessage.followupQuestions && { followupQuestions: completedAssistantMessage.followupQuestions }),
                ...(completedAssistantMessage.feedback && { feedback: completedAssistantMessage.feedback }),
                ...(completedAssistantMessage.thinkingSteps && { thinkingSteps: completedAssistantMessage.thinkingSteps }),
              };

              // 사용자 메시지와 AI 메시지 모두 저장
              console.log("💾 사용자 메시지 저장 중...");
              await addMessageToConversation(newConvId, baseUserMessage);
              console.log("💾 AI 메시지 저장 중...");
              await addMessageToConversation(newConvId, baseAssistantMessage);
              console.log("✅ 메시지 저장 완료");

              // 제목 생성 및 업데이트
              console.log("🎯 제목 생성 시작 - 질문:", question.slice(0, 50));
              const title = await generateChatTitle(question);
              console.log("✅ 제목 생성 완료:", title);

              console.log("💾 제목 업데이트 중...");
              await updateConversationTitle(newConvId, title);
              console.log("✅ 제목 업데이트 완료");

              // Firebase 저장 완료 대기 (약간의 지연)
              await new Promise(resolve => setTimeout(resolve, 100));

              // 제목 업데이트 알림
              if (onTitleUpdated) {
                console.log("🔄 Sidebar 새로고침 트리거");
                onTitleUpdated();
              }
            } else if (currentConversationId) {
              // ChatView Message를 BaseMessage로 변환 (undefined 제거)
              const baseAssistantMessage: BaseMessage = {
                role: completedAssistantMessage.role,
                content: completedAssistantMessage.content,
                timestamp: completedAssistantMessage.timestamp || new Date(),
                ...(completedAssistantMessage.references && { references: completedAssistantMessage.references }),
                ...(completedAssistantMessage.followupQuestions && { followupQuestions: completedAssistantMessage.followupQuestions }),
                ...(completedAssistantMessage.feedback && { feedback: completedAssistantMessage.feedback }),
                ...(completedAssistantMessage.thinkingSteps && { thinkingSteps: completedAssistantMessage.thinkingSteps }),
              };

              // 기존 대화에 AI 메시지만 추가
              console.log("💾 기존 대화에 AI 메시지만 추가 - conversationId:", currentConversationId);
              await addMessageToConversation(currentConversationId, baseAssistantMessage);
              console.log("✅ 메시지 추가 완료");
            }
          } catch (error) {
            console.error("❌ Firebase 저장 실패:", error);
          }
        }
      }
    } catch (error: any) {
      // 사용자가 취소한 경우 에러 메시지 표시하지 않음
      if (error.name === 'AbortError') {
        console.log("Request cancelled by user");
        const cancelMessage: Message = {
          role: "assistant",
          content: "_Request cancelled._",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, cancelMessage]);
      } else {
        console.error("API error:", error);
        const errorMessage: Message = {
          role: "assistant",
          content: "Sorry, an error occurred while generating the response.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } finally {
      setIsStreaming(false);
      setLoadingStatus(""); // 로딩 상태 초기화
      abortControllerRef.current = null;
    }
  };

  // Stop 버튼 핸들러
  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
      setLoadingStatus(""); // 로딩 상태 초기화
    }
  };

  // 후속 질문 클릭 핸들러 - 질문을 즉시 전송
  const handleFollowupQuestionClick = async (question: string) => {
    if (isStreaming) return;

    // 후속 질문 클릭 시 스크롤 플래그 리셋 (자동 스크롤 허용)
    userScrolledUp.current = false;

    // 모든 이전 메시지들의 followupQuestions를 제거 (가장 최신 답변만 표시)
    setMessages((prev) => {
      return prev.map((msg) => {
        if (msg.role === "assistant" && msg.followupQuestions) {
          return {
            ...msg,
            followupQuestions: undefined,
          };
        }
        return msg;
      });
    });

    // 약간의 딜레이 후 질문 전송 (UI 업데이트를 위해)
    setTimeout(async () => {
      await queryAPI(question, false);
      // 후속 질문 클릭 시 입력창으로 스크롤
      scrollToBottom();
    }, 50);
  };

  // Toggle favorite
  const handleToggleFavorite = async () => {
    if (!currentConversationId) {
      console.log("No conversation ID");
      return;
    }

    try {
      console.log("Toggling favorite:", currentConversationId, "from", isFavorite, "to", !isFavorite);
      await toggleFavorite(currentConversationId, isFavorite);
      setIsFavorite(!isFavorite);
      console.log("Favorite toggled successfully");
      if (onTitleUpdated) {
        onTitleUpdated();
      }
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
    }
  };

  // 메시지 피드백 핸들러
  const handleMessageFeedback = async (messageIndex: number, feedbackType: 'like' | 'dislike') => {
    if (!currentConversationId) return;

    const currentFeedback = messages[messageIndex].feedback;
    const newFeedback = currentFeedback === feedbackType ? null : feedbackType;

    // UI 즉시 업데이트
    setMessages((prev) => {
      const newMessages = [...prev];
      newMessages[messageIndex] = {
        ...newMessages[messageIndex],
        feedback: newFeedback,
      };
      return newMessages;
    });

    // Firestore 업데이트
    try {
      await updateMessage(currentConversationId, messageIndex, { feedback: newFeedback });
    } catch (error) {
      console.error("Failed to update message feedback:", error);
    }
  };

  // Reference 피드백 핸들러
  const handleReferenceFeedback = async (messageIndex: number, referenceIndex: number, feedbackType: 'like' | 'dislike') => {
    if (!currentConversationId) return;

    const message = messages[messageIndex];
    if (!message.references) return;

    const currentFeedback = message.references[referenceIndex].feedback;
    const newFeedback = currentFeedback === feedbackType ? null : feedbackType;

    // UI 즉시 업데이트
    setMessages((prev) => {
      const newMessages = [...prev];
      const newReferences = [...(newMessages[messageIndex].references || [])];
      newReferences[referenceIndex] = {
        ...newReferences[referenceIndex],
        feedback: newFeedback,
      };
      newMessages[messageIndex] = {
        ...newMessages[messageIndex],
        references: newReferences,
      };
      return newMessages;
    });

    // Firestore 업데이트
    try {
      const updatedReferences = [...message.references];
      updatedReferences[referenceIndex] = {
        ...updatedReferences[referenceIndex],
        feedback: newFeedback,
      };
      await updateMessage(currentConversationId, messageIndex, { references: updatedReferences });
    } catch (error) {
      console.error("Failed to update reference feedback:", error);
    }
  };

  // Rewrite 핸들러 - 답변 재생성
  const handleRewrite = async (messageIndex: number) => {
    if (isStreaming || messageIndex < 1) return;

    // 이전 사용자 메시지 찾기
    const userMessage = messages[messageIndex - 1];
    if (!userMessage || userMessage.role !== "user") return;

    const userQuestion = userMessage.content;

    // 현재 assistant 메시지부터 끝까지 제거 (해당 답변과 그 이후 모든 메시지)
    setMessages((prev) => prev.slice(0, messageIndex));

    // Firestore에서도 메시지 제거 (나중에 새로운 답변으로 업데이트됨)
    // 여기서는 UI만 업데이트하고, 새 답변이 저장될 때 자동으로 덮어써집니다

    // 약간의 딜레이 후 질문 재전송 (skipUserMessage=true로 사용자 메시지 추가 안 함)
    setTimeout(async () => {
      await queryAPI(userQuestion, false, true);
    }, 100);
  };

  // 폼 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;

    const question = input.trim();
    setInput("");

    // 새 질문 제출 시 스크롤 플래그 리셋 (자동 스크롤 허용)
    userScrolledUp.current = false;

    // 모든 이전 메시지들의 followupQuestions를 제거 (가장 최신 답변만 표시)
    setMessages((prev) => {
      return prev.map((msg) => {
        if (msg.role === "assistant" && msg.followupQuestions) {
          return {
            ...msg,
            followupQuestions: undefined,
          };
        }
        return msg;
      });
    });

    // 질문 전송 즉시 맨 아래로 스크롤 (답변 기다리지 않음)
    scrollToBottom();

    await queryAPI(question, false); // 후속 질문
  };

  // 답변 복사
  const handleCopyAnswer = async (message: Message, index: number) => {
    let textToCopy = message.content;

    if (message.references && message.references.length > 0) {
      textToCopy += "\n\nReferences:\n";
      message.references.forEach((ref, idx) => {
        textToCopy += `${idx + 1}. ${ref.title}\n   ${ref.source}\n   ${ref.year}\n\n`;
      });
    }

    await navigator.clipboard.writeText(textToCopy);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // 유저 메시지 복사
  const handleCopyUserMessage = async (content: string, index: number) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedUserMessage(index);
      setTimeout(() => setCopiedUserMessage(null), 2000);
    } catch (err) {
      console.error('Failed to copy user message:', err);
    }
  };

  // PDF 내보내기 - HTML을 이용한 방식
  const handleExportToPDF = (userMessage: string, assistantMessage: Message) => {
    // 새 창에서 프린트 가능한 HTML 생성
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Popup blocked. Please allow popups for this site.');
      return;
    }

    // 마크다운 제거
    const plainText = assistantMessage.content
      .replace(/#{1,6}\s/g, '')
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/`{1,3}[^\n]*`{1,3}/g, '')
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    const date = new Date().toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // References HTML 생성
    let referencesHTML = '';
    if (assistantMessage.references && assistantMessage.references.length > 0) {
      const referencesList = assistantMessage.references
        .map((ref: any, index: number) => `
          <div class="reference-item">
            <span class="reference-number">[${index + 1}]</span>
            <div class="reference-content">
              <div class="reference-title">${ref.title}</div>
              <div class="reference-details">
                ${ref.source} (${ref.year})
              </div>
            </div>
          </div>
        `)
        .join('');

      referencesHTML = `
        <div class="section">
          <div class="section-title">References</div>
          <div class="references-list">
            ${referencesList}
          </div>
        </div>
      `;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="ko">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Ruleout AI - Medical Answer</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Malgun Gothic', '맑은 고딕', sans-serif;
            line-height: 1.6;
            color: #333;
            padding: 40px;
            max-width: 800px;
            margin: 0 auto;
          }

          .header {
            border-bottom: 3px solid #20808D;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }

          .logo {
            font-size: 28px;
            font-weight: bold;
            color: #20808D;
            margin-bottom: 8px;
          }

          .date {
            font-size: 14px;
            color: #666;
          }

          .section {
            margin-bottom: 30px;
          }

          .section-title {
            font-size: 18px;
            font-weight: 600;
            color: #20808D;
            margin-bottom: 12px;
            padding-bottom: 8px;
            border-bottom: 1px solid #e0e0e0;
          }

          .section-content {
            font-size: 14px;
            white-space: pre-wrap;
            word-wrap: break-word;
            color: #444;
          }

          .references-list {
            display: flex;
            flex-direction: column;
            gap: 16px;
          }

          .reference-item {
            display: flex;
            gap: 12px;
            padding: 12px;
            background-color: #f8f9fa;
            border-radius: 6px;
            border-left: 3px solid #20808D;
          }

          .reference-number {
            font-weight: 600;
            color: #20808D;
            font-size: 14px;
            flex-shrink: 0;
          }

          .reference-content {
            flex: 1;
          }

          .reference-title {
            font-weight: 500;
            font-size: 14px;
            color: #333;
            margin-bottom: 4px;
          }

          .reference-details {
            font-size: 12px;
            color: #666;
          }

          .footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 1px solid #e0e0e0;
            text-align: center;
            font-size: 12px;
            color: #999;
          }

          @media print {
            body {
              padding: 20px;
            }

            .no-print {
              display: none;
            }

            .reference-item {
              break-inside: avoid;
              page-break-inside: avoid;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">Ruleout AI</div>
          <div class="date">${date}</div>
        </div>

        <div class="section">
          <div class="section-title">Question</div>
          <div class="section-content">${userMessage}</div>
        </div>

        <div class="section">
          <div class="section-title">Answer</div>
          <div class="section-content">${plainText}</div>
        </div>

        ${referencesHTML}

        <div class="footer">
          Generated by Ruleout AI © ${new Date().getFullYear()}
        </div>

        <script>
          // 페이지 로드 후 자동으로 인쇄 대화상자 열기
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 500);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  // 테이블 내용 복사 함수
  const copyTableContent = async (tableElement: HTMLTableElement, tableId: string) => {
    try {
      // HTML 형식으로 복사 (테이블 구조 유지)
      const tableHTML = tableElement.outerHTML;

      // 텍스트 형식도 함께 준비 (폴백용)
      let tableText = '';
      const rows = tableElement.querySelectorAll('tr');
      rows.forEach((row) => {
        const cells = row.querySelectorAll('th, td');
        const cellTexts: string[] = [];
        cells.forEach((cell) => {
          cellTexts.push(cell.textContent?.trim() || '');
        });
        tableText += cellTexts.join('\t') + '\n';
      });

      // 클립보드에 HTML과 텍스트 모두 복사
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': new Blob([tableHTML], { type: 'text/html' }),
          'text/plain': new Blob([tableText], { type: 'text/plain' })
        })
      ]);

      // 복사 완료 표시
      setCopiedTableIndex(tableId);
      setTimeout(() => {
        setCopiedTableIndex(null);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy table:', err);
    }
  };

  // {{citation:N}} 또는 {citation:N} 파싱 및 CitationBanner 렌더링 함수
  const processCitations = (text: string, references: any[], messageIndex: number, isStreaming: boolean): any => {
    // 스트리밍 중이든 완료 후든 항상 배너로 표시
    // {{citation:0}}, {{citation:0,1,2}} 형태만 파싱하여 배너로 표시
    // 🔥 정확한 매칭: 반드시 {{로 시작하고 }}로 끝나야 함
    const parts = text.split(/(\{\{citation:\d+(?:,\d+)*\}\})/g);

    return parts.map((part: string, index: number) => {
      // 🔥 정확한 citation 태그만 매칭 (잘못된 태그는 무시)
      const match = part.match(/^\{\{citation:(\d+(?:,\d+)*)\}\}$/);
      if (match) {
        // citation 인덱스 추출 (쉼표로 구분된 숫자들)
        const citationIndices = match[1].split(',').map(n => parseInt(n.trim()));

        // 🔥 유효한 citation인지 확인 (references 범위 내)
        const validIndices = citationIndices.filter(idx => !isNaN(idx) && idx >= 0);

        if (validIndices.length > 0) {
          return (
            <CitationBanner
              key={index}
              citationIndices={validIndices}
              references={references}
              messageIndex={messageIndex}
            />
          );
        }
      }

      // 🔥 잘못된 citation 태그가 있으면 숨김 처리 (스트리밍 완료 후에만)
      if (!isStreaming && part.includes('citation:') && part.includes('}}')) {
        console.warn("⚠️ Invalid citation tag detected:", part);
        return null; // 잘못된 태그는 렌더링하지 않음
      }

      return part;
    });
  };

  // 재귀적으로 children 처리
  const processChildrenWithCitations = (children: any, references: any[], messageIndex: number, isStreaming: boolean): any => {
    if (typeof children === 'string') {
      return processCitations(children, references, messageIndex, isStreaming);
    }
    if (Array.isArray(children)) {
      return children.map((child, idx) => {
        if (typeof child === 'string') {
          return <span key={idx}>{processCitations(child, references, messageIndex, isStreaming)}</span>;
        }
        return child;
      });
    }
    return children;
  };

  // 영어 텍스트 감지 함수
  const isEnglishText = (text: string): boolean => {
    // 영어 알파벳이 전체 텍스트의 50% 이상이면 영어로 판단
    const englishChars = text.match(/[a-zA-Z]/g);
    const totalChars = text.replace(/\s/g, '').length;
    return englishChars ? (englishChars.length / totalChars) > 0.5 : false;
  };

  // Markdown 렌더링 시 citation 처리 (messageIndex, references, isStreaming을 받는 함수로 변경)
  const createComponents = (messageIndex: number, references: any[], isStreaming: boolean) => ({
    p: ({ children, ...props }: any) => {
      return <p {...props}>{processChildrenWithCitations(children, references, messageIndex, isStreaming)}</p>;
    },
    h2: ({ children, ...props }: any) => (
      <h2 className="text-xl font-bold mt-6 mb-3 text-white" {...props}>{children}</h2>
    ),
    h3: ({ children, ...props }: any) => (
      <h3 className="text-lg font-semibold mt-4 mb-2 text-white" {...props}>{children}</h3>
    ),
    ul: ({ children, ...props }: any) => (
      <ul className="list-disc list-outside space-y-2 my-3 ml-6 pl-0" {...props}>{children}</ul>
    ),
    ol: ({ children, ...props }: any) => (
      <ol className="list-decimal list-outside space-y-2 my-3 ml-6 pl-0" {...props}>{children}</ol>
    ),
    li: ({ children, ...props }: any) => (
      <li className="text-gray-200 leading-relaxed pl-2" {...props}>
        {processChildrenWithCitations(children, references, messageIndex, isStreaming)}
      </li>
    ),
    table: ({ children, node, ...props }: any) => {
      // 테이블의 고유 ID를 node position 기반으로 생성 (렌더링마다 일관성 유지)
      const tableId = `table-${messageIndex}-${node?.position?.start?.line || 0}`;
      const isCopied = copiedTableIndex === tableId;
      return (
        <div className="relative group overflow-x-auto my-4">
          <table className="min-w-full border border-gray-600" {...props}>{children}</table>
          {/* 복사 버튼 - 스트리밍 완료 후에만 표시 (깜빡임 방지) */}
          {!isStreaming && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const tableElement = e.currentTarget.parentElement?.querySelector('table') as HTMLTableElement;
                if (tableElement) {
                  copyTableContent(tableElement, tableId);
                }
              }}
              className={`absolute bottom-2 right-2 transition-all duration-200 p-2 rounded-lg z-10 bg-gray-700 hover:bg-gray-600 ${
                isCopied ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
              }`}
              title={isCopied ? "Copied!" : "Copy table"}
            >
              {isCopied ? (
                <Check className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4 text-gray-300" />
              )}
            </button>
          )}
        </div>
      );
    },
    thead: ({ children, ...props }: any) => (
      <thead className="bg-gray-700" {...props}>{children}</thead>
    ),
    tbody: ({ children, ...props }: any) => (
      <tbody {...props}>{children}</tbody>
    ),
    tr: ({ children, ...props }: any) => (
      <tr className="hover:bg-[#4DB8C4]/10 transition-colors duration-150" {...props}>{children}</tr>
    ),
    th: ({ children, ...props }: any) => (
      <th className="border border-gray-600 px-4 py-2 text-left font-semibold" {...props}>{processChildrenWithCitations(children, references, messageIndex, isStreaming)}</th>
    ),
    td: ({ children, ...props }: any) => (
      <td className="border border-gray-600 px-4 py-2" {...props}>{processChildrenWithCitations(children, references, messageIndex, isStreaming)}</td>
    ),
  });

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#1a1a1a]">
      {/* 헤더 */}
      <div className="sticky top-0 z-10 border-b border-gray-700 px-4 py-2 md:py-4 bg-[rgba(26,26,26,0.7)] backdrop-blur-md">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center space-x-2">
            {/* 모바일 햄버거 메뉴 */}
            {onToggleSidebar && (
              <button
                onClick={onToggleSidebar}
                className="md:hidden p-1.5 hover:bg-gray-700 rounded-lg transition-colors"
                aria-label="Toggle sidebar"
              >
                <Menu className="w-5 h-5 text-gray-300" />
              </button>
            )}
            <Image src="/image/logo_candidate1 복사본.png" alt="Ruleout" width={28} height={28} className="hidden md:block" />
            <span className="text-lg font-semibold hidden md:block">Ruleout</span>
          </div>
          {isVisitMode ? (
            <button
              onClick={onToggleRecordingsSidebar}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="Toggle recordings sidebar"
            >
              <ChevronsLeft className="w-5 h-5 text-gray-300" />
            </button>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                title={currentContent.more}
              >
                <MoreHorizontal className="w-5 h-5 text-gray-400" />
              </button>
              <button
                onClick={handleToggleFavorite}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                title={currentContent.bookmark}
              >
                <Bookmark
                  className="w-5 h-5"
                  style={{ color: isFavorite ? '#20808D' : '#9ca3af' }}
                  fill={isFavorite ? '#20808D' : 'none'}
                />
              </button>
              <button
                className="flex items-center space-x-2 px-3 py-2 hover:bg-gray-700 rounded-lg transition-colors"
                title={currentContent.share}
              >
                <Share2 className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-400">{currentContent.share}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 베타 서비스 준비 중 배너 */}
      {showBetaBanner && (
        <div className="bg-[#20808D] px-4 py-3 text-center animate-slideDown">
          <p className="text-white text-sm font-medium" style={{ fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
            {getTranslation('recording.betaInProgress', language)}
          </p>
        </div>
      )}

      {/* 메시지 영역 */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-4 md:px-8 py-12">
        {/* New Visit 초기 화면 - 메시지가 없고 transcript도 없을 때만 표시 */}
        {messages.length === 0 && !isStreaming && !isProcessing && transcriptSegments.length === 0 && (
          <div className="flex items-center justify-center h-full -mt-20">
            {!isRecording ? (
              // STEP 1: Ready to Record 화면
              <div className="text-center space-y-10 max-w-3xl">
                <h2 className="text-3xl md:text-4xl text-gray-300 mb-10" style={{ fontFamily: getFontFamily(language) }}>
                  {getTranslation('recording.readyToRecord', language)}
                </h2>

                {/* 마이크 버튼 */}
                <div className="flex justify-center mb-10">
                  <button
                    onClick={startRecording}
                    className="relative w-56 h-56 rounded-full flex items-center justify-center transition-all duration-300 hover:brightness-110 group overflow-hidden"
                    style={{
                      background: 'linear-gradient(135deg, #20808D 0%, #4DB8C4 100%)',
                      boxShadow: '0 10px 40px rgba(32, 128, 141, 0.3)'
                    }}
                  >
                    {/* Shimmer effect on hover */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div
                        className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"
                        style={{
                          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)'
                        }}
                      />
                    </div>

                    <svg
                      className="w-28 h-28 text-white relative z-10"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                      />
                    </svg>
                  </button>
                </div>

                {/* 안내 문구 */}
                <p className="text-sm text-gray-400 leading-relaxed px-8 max-w-3xl mx-auto" style={{ fontFamily: language === '한국어' || language === '日本語' ? 'Pretendard, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' : undefined }}>
                  {language === 'English' ? (
                    <>
                      {getTranslation('recording.consentNotice', language)}{' '}
                      <a
                        href="/privacy"
                        className="underline hover:text-[#4DB8C4] transition-colors"
                      >
                        {getTranslation('recording.regulations', language)}
                      </a>
                      {' '}in their jurisdiction.
                    </>
                  ) : (
                    <>
                      {getTranslation('recording.consentNotice', language)}{' '}
                      <a
                        href="/privacy"
                        className="underline hover:text-[#4DB8C4] transition-colors"
                      >
                        {getTranslation('recording.regulations', language)}
                      </a>
                    </>
                  )}
                </p>
              </div>
            ) : (
              // STEP 1: Recording in progress 화면
              <div className="text-center space-y-10 max-w-3xl">
                {/* Recording text */}
                <h2 className="text-3xl text-gray-300" style={{ fontFamily: 'Hedvig Letters Serif, serif' }}>
                  Recording
                </h2>

                {/* Timer */}
                <div className="text-6xl text-gray-200 mb-8" style={{ fontFamily: 'Hedvig Letters Serif, serif', fontWeight: 400, letterSpacing: '0.05em' }}>
                  {formatRecordingTime(recordingTime)}
                </div>

                {/* Pulsing gradient orb animation */}
                <div className="flex items-center justify-center mb-16">
                  <div
                    className="relative w-64 h-64"
                    style={{
                      animation: 'orbPulse 3s ease-in-out infinite'
                    }}
                  >
                    {/* Main gradient orb */}
                    <div
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: 'radial-gradient(circle at 30% 30%, #4DB8C4 0%, #20808D 50%, #165761 100%)',
                        filter: 'blur(2px)',
                        animation: 'orbRotate 8s linear infinite'
                      }}
                    />
                    {/* Glow effect */}
                    <div
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: 'radial-gradient(circle at 30% 30%, rgba(77, 184, 196, 0.6) 0%, rgba(32, 128, 141, 0.3) 50%, transparent 100%)',
                        filter: 'blur(20px)',
                        animation: 'orbGlow 2s ease-in-out infinite alternate'
                      }}
                    />
                  </div>
                </div>

                {/* Stop recording button */}
                <button
                  onClick={stopRecording}
                  className="px-8 py-3 rounded-full text-white text-sm font-medium transition-all duration-300 hover:brightness-110"
                  style={{
                    background: 'linear-gradient(135deg, #20808D 0%, #4DB8C4 100%)',
                    boxShadow: '0 8px 30px rgba(32, 128, 141, 0.4)'
                  }}
                >
                  STOP RECORDING
                </button>
              </div>
            )}
          </div>
        )}

        {/* STEP 2: Processing 화면 */}
        {isProcessing && (
          <div className="flex items-center justify-center h-full -mt-20">
            <div className="text-center space-y-8 max-w-2xl">
              <h2 className="text-3xl text-gray-300 mb-12" style={{ fontFamily: getFontFamily(language) }}>
                {getTranslation('processing.title', language)}
              </h2>

              {/* Processing steps - Vertical layout */}
              <div className="flex flex-col items-start max-w-md mx-auto">
                {/* Step 1: Transcribing */}
                <div className="flex items-start">
                  <div className="flex flex-col items-center mr-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                      processingStep === 'transcribing' ? 'bg-[#4DB8C4] ring-4 ring-[#4DB8C4]/30' :
                      ['aligning', 'diarizing', 'finalizing'].includes(processingStep || '') ? 'bg-[#20808D]' :
                      'bg-gray-600'
                    }`}>
                      {['aligning', 'diarizing', 'finalizing'].includes(processingStep || '') ? (
                        <Check className="w-6 h-6 text-white" />
                      ) : processingStep === 'transcribing' ? (
                        <Loader2 className="w-6 h-6 text-white animate-spin" />
                      ) : (
                        <span className="text-white text-sm">1</span>
                      )}
                    </div>
                    {/* Vertical line */}
                    <div className={`w-0.5 h-16 mt-2 transition-all duration-300 ${
                      ['aligning', 'diarizing', 'finalizing'].includes(processingStep || '') ? 'bg-[#20808D]' : 'bg-gray-600'
                    }`}></div>
                  </div>
                  <div className="pt-3">
                    <div className={`text-lg font-medium transition-all duration-300 ${
                      processingStep === 'transcribing' ? 'text-[#4DB8C4]' :
                      ['aligning', 'diarizing', 'finalizing'].includes(processingStep || '') ? 'text-[#20808D]' :
                      'text-gray-500'
                    }`} style={{ fontFamily: language === '한국어' || language === '日本語' ? 'Pretendard, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' : undefined }}>
                      {getTranslation('processing.steps.transcribing', language)}
                    </div>
                  </div>
                </div>

                {/* Step 2: Aligning timestamps */}
                <div className="flex items-start">
                  <div className="flex flex-col items-center mr-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                      processingStep === 'aligning' ? 'bg-[#4DB8C4] ring-4 ring-[#4DB8C4]/30' :
                      ['diarizing', 'finalizing'].includes(processingStep || '') ? 'bg-[#20808D]' :
                      'bg-gray-600'
                    }`}>
                      {['diarizing', 'finalizing'].includes(processingStep || '') ? (
                        <Check className="w-6 h-6 text-white" />
                      ) : processingStep === 'aligning' ? (
                        <Loader2 className="w-6 h-6 text-white animate-spin" />
                      ) : (
                        <span className="text-white text-sm">2</span>
                      )}
                    </div>
                    {/* Vertical line */}
                    <div className={`w-0.5 h-16 mt-2 transition-all duration-300 ${
                      ['diarizing', 'finalizing'].includes(processingStep || '') ? 'bg-[#20808D]' : 'bg-gray-600'
                    }`}></div>
                  </div>
                  <div className="pt-3">
                    <div className={`text-lg font-medium transition-all duration-300 ${
                      processingStep === 'aligning' ? 'text-[#4DB8C4]' :
                      ['diarizing', 'finalizing'].includes(processingStep || '') ? 'text-[#20808D]' :
                      'text-gray-500'
                    }`} style={{ fontFamily: language === '한국어' || language === '日本語' ? 'Pretendard, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' : undefined }}>
                      {getTranslation('processing.steps.aligning', language)}
                    </div>
                  </div>
                </div>

                {/* Step 3: Speaker diarization */}
                <div className="flex items-start">
                  <div className="flex flex-col items-center mr-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                      processingStep === 'diarizing' ? 'bg-[#4DB8C4] ring-4 ring-[#4DB8C4]/30' :
                      processingStep === 'finalizing' ? 'bg-[#20808D]' :
                      'bg-gray-600'
                    }`}>
                      {processingStep === 'finalizing' ? (
                        <Check className="w-6 h-6 text-white" />
                      ) : processingStep === 'diarizing' ? (
                        <Loader2 className="w-6 h-6 text-white animate-spin" />
                      ) : (
                        <span className="text-white text-sm">3</span>
                      )}
                    </div>
                    {/* Vertical line */}
                    <div className={`w-0.5 h-16 mt-2 transition-all duration-300 ${
                      processingStep === 'finalizing' ? 'bg-[#20808D]' : 'bg-gray-600'
                    }`}></div>
                  </div>
                  <div className="pt-3">
                    <div className={`text-lg font-medium transition-all duration-300 ${
                      processingStep === 'diarizing' ? 'text-[#4DB8C4]' :
                      processingStep === 'finalizing' ? 'text-[#20808D]' :
                      'text-gray-500'
                    }`} style={{ fontFamily: language === '한국어' || language === '日本語' ? 'Pretendard, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' : undefined }}>
                      {getTranslation('processing.steps.diarizing', language)}
                    </div>
                  </div>
                </div>

                {/* Step 4: Finalizing */}
                <div className="flex items-start">
                  <div className="flex flex-col items-center mr-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                      processingStep === 'finalizing' ? 'bg-[#4DB8C4] ring-4 ring-[#4DB8C4]/30' : 'bg-gray-600'
                    }`}>
                      {processingStep === 'finalizing' ? (
                        <Loader2 className="w-6 h-6 text-white animate-spin" />
                      ) : (
                        <span className="text-white text-sm">4</span>
                      )}
                    </div>
                  </div>
                  <div className="pt-3">
                    <div className={`text-lg font-medium transition-all duration-300 ${
                      processingStep === 'finalizing' ? 'text-[#4DB8C4]' : 'text-gray-500'
                    }`} style={{ fontFamily: language === '한국어' || language === '日本語' ? 'Pretendard, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' : undefined }}>
                      {getTranslation('processing.steps.finalizing', language)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Transcript Results */}
        {transcriptSegments.length > 0 && audioUrl && (
          <div className="md:max-w-4xl mx-auto pb-32">
            {/* Transcript bubbles */}
            <div className="space-y-4 mb-8">
              {transcriptSegments.map((segment, index) => (
                <div
                  key={index}
                  onClick={() => seekToTime(segment.start)}
                  className={`flex ${segment.speaker === 'vet' ? 'justify-end' : 'justify-start'} cursor-pointer group`}
                >
                  <div className={`max-w-2xl px-6 py-4 rounded-2xl transition-all duration-200 ${
                    segment.speaker === 'vet'
                      ? 'bg-[#20808D]/20 border border-[#4DB8C4]/30 hover:bg-[#20808D]/30'
                      : 'bg-gray-800 hover:bg-gray-750'
                  }`}>
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`text-xs font-medium ${
                        segment.speaker === 'vet' ? 'text-[#4DB8C4]' : 'text-gray-400'
                      }`}>
                        {segment.speaker === 'vet' ? 'Vet' : 'Caregiver'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatTime(segment.start)}
                      </span>
                    </div>
                    <p className="text-gray-200 leading-relaxed">{segment.text}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Audio Player */}
            <div
              className="fixed bottom-0 bg-[#1a1a1a] border-t border-gray-700 p-4 z-30 transition-all duration-300"
              style={{
                left: isSidebarOpen ? '256px' : '0',  // Sidebar width is 256px (w-64)
                right: '0'  // Don't adjust for right sidebar - it will overlay
              }}
            >
              <div className="max-w-4xl mx-auto">
                {/* Hidden audio element */}
                <audio
                  ref={audioRef}
                  src={audioUrl}
                  onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onEnded={() => setIsPlaying(false)}
                />

                {/* Controls */}
                <div className="flex items-center space-x-3">
                  {/* Play/Pause button */}
                  <button
                    onClick={togglePlayPause}
                    className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:brightness-110 flex-shrink-0"
                    style={{
                      background: 'linear-gradient(135deg, #20808D 0%, #4DB8C4 100%)',
                      boxShadow: '0 2px 8px rgba(32, 128, 141, 0.3)'
                    }}
                  >
                    {isPlaying ? (
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24" style={{ transform: 'translateX(1px)' }}>
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    )}
                  </button>

                  {/* Time display */}
                  <span className="text-sm text-gray-400 flex-shrink-0 min-w-[40px]">
                    {formatTime(currentTime)}
                  </span>

                  {/* Progress bar */}
                  <div className="flex-1 flex items-center">
                    <input
                      type="range"
                      min="0"
                      max={duration || 0}
                      value={currentTime}
                      onChange={(e) => seekToTime(Number(e.target.value))}
                      className="w-full h-1 bg-gray-700 rounded-full appearance-none cursor-pointer transition-all
                        [&::-webkit-slider-thumb]:appearance-none
                        [&::-webkit-slider-thumb]:w-3
                        [&::-webkit-slider-thumb]:h-3
                        [&::-webkit-slider-thumb]:rounded-full
                        [&::-webkit-slider-thumb]:bg-[#4DB8C4]
                        [&::-webkit-slider-thumb]:cursor-pointer
                        [&::-webkit-slider-thumb]:transition-all
                        [&::-webkit-slider-thumb]:shadow-md
                        hover:[&::-webkit-slider-thumb]:w-3.5
                        hover:[&::-webkit-slider-thumb]:h-3.5
                        [&::-moz-range-thumb]:w-3
                        [&::-moz-range-thumb]:h-3
                        [&::-moz-range-thumb]:rounded-full
                        [&::-moz-range-thumb]:bg-[#4DB8C4]
                        [&::-moz-range-thumb]:border-0
                        [&::-moz-range-thumb]:cursor-pointer
                        [&::-moz-range-thumb]:transition-all
                        hover:[&::-moz-range-thumb]:w-3.5
                        hover:[&::-moz-range-thumb]:h-3.5"
                      style={{
                        background: `linear-gradient(to right, #4DB8C4 0%, #4DB8C4 ${(currentTime / (duration || 1)) * 100}%, #374151 ${(currentTime / (duration || 1)) * 100}%, #374151 100%)`
                      }}
                    />
                  </div>

                  {/* Total duration */}
                  <span className="text-sm text-gray-400 flex-shrink-0 min-w-[40px]">
                    {formatTime(duration)}
                  </span>

                  {/* Mute button */}
                  <button
                    onClick={toggleMute}
                    className="p-2 hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
                    aria-label={isMuted ? "Unmute" : "Mute"}
                  >
                    {isMuted ? (
                      <VolumeX className="w-5 h-5 text-gray-300" />
                    ) : (
                      <Volume2 className="w-5 h-5 text-gray-300" />
                    )}
                  </button>

                  {/* Playback speed button */}
                  <div className="relative flex-shrink-0">
                    <button
                      onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                      className="px-3 py-2 hover:bg-gray-700 rounded-lg transition-colors text-sm text-gray-300 font-medium min-w-[60px]"
                    >
                      {playbackRate}x
                    </button>

                    {/* Speed dropdown menu */}
                    {showSpeedMenu && (
                      <div className="absolute bottom-full right-0 mb-2 bg-[#2a2a2a] rounded-lg border border-gray-700 shadow-lg py-1 min-w-[80px]">
                        {[0.5, 0.75, 1.0, 1.25, 1.75].map((speed) => (
                          <button
                            key={speed}
                            onClick={() => changePlaybackRate(speed)}
                            className={`w-full px-4 py-2 text-sm text-left hover:bg-gray-700 transition-colors ${
                              playbackRate === speed ? 'text-[#4DB8C4] font-semibold' : 'text-gray-300'
                            }`}
                          >
                            {speed}x
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="md:max-w-4xl mx-auto space-y-12">
          {messages.map((message, index) => (
            <div key={index}>
              {message.role === "user" ? (
                // 사용자 메시지
                <div
                  className="flex justify-end mb-4 group"
                  onMouseEnter={() => setHoveredUserMessage(index)}
                  onMouseLeave={() => setHoveredUserMessage(null)}
                >
                  <div className="flex items-start space-x-2">
                    {/* 복사 버튼 - 호버 시에만 표시 */}
                    {hoveredUserMessage === index && (
                      <button
                        onClick={() => handleCopyUserMessage(message.content, index)}
                        className="p-2 rounded-lg hover:bg-gray-700 transition-all mt-2"
                        title={copiedUserMessage === index ? "Copied!" : "Copy message"}
                      >
                        {copiedUserMessage === index ? (
                          <Check className="w-4 h-4 text-green-400" />
                        ) : (
                          <Copy className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    )}
                    <div className="bg-[#2a2a2a] rounded-2xl px-6 py-4 max-w-2xl">
                      <p className="text-white whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                </div>
              ) : (
                // AI 메시지
                <div className="space-y-4">
                  {message.isOutOfScope ? (
                    // Out of Scope 배너만 표시 (사용자 질문은 이미 제거됨)
                    <OutOfScopeBanner
                      onClose={() => {
                        setMessages((prev) => prev.filter((_, i) => i !== index));
                      }}
                      isDark={true}
                    />
                  ) : (
                    <div className="flex items-start">
                      <div className="flex-1 min-w-0 w-full">
                        {/* 사고 과정 (Thinking Steps) - 스트리밍 시작되면 바로 표시 */}
                        {message.thinkingSteps && message.thinkingSteps.length > 0 && (
                          <ThinkingSteps
                            steps={message.thinkingSteps}
                            finishedText={currentContent.finishedThinking}
                            isDark={true}
                          />
                        )}

                        {/* AI 답변 */}
                        <div
                          className={`text-gray-200 prose prose-invert max-w-none ${
                            isEnglishText(message.content) ? 'font-noto-serif' : ''
                          }`}
                        >
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={createComponents(index, message.references || [], message.isStreaming || false) as any}
                          >
                            {message.content}
                          </ReactMarkdown>
                        </div>

                      {/* 액션 버튼들 */}
                      {!message.isStreaming && (
                        <div className="flex items-center justify-between mt-4">
                          {/* 왼쪽: 텍스트가 있는 버튼들 (데스크톱만) */}
                          <div className="hidden md:flex items-center space-x-2">
                            <button className="flex items-center space-x-2 px-3 py-1.5 hover:bg-gray-700 rounded-lg transition-colors">
                              <Share2 className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-400">{currentContent.share}</span>
                            </button>
                            <button
                              onClick={() => handleExportToPDF(messages[index - 1]?.content || "", message)}
                              className="flex items-center space-x-2 px-3 py-1.5 hover:bg-gray-700 rounded-lg transition-colors"
                            >
                              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              <span className="text-sm text-gray-400">{currentContent.export}</span>
                            </button>
                            <button
                              onClick={() => handleRewrite(index)}
                              className="flex items-center space-x-2 px-3 py-1.5 hover:bg-gray-700 rounded-lg transition-colors"
                              disabled={isStreaming}
                            >
                              <RotateCcw className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-400">{currentContent.rewrite}</span>
                            </button>
                          </div>

                          {/* 오른쪽: 아이콘만 있는 버튼들 */}
                          <div className="flex items-center space-x-2 ml-auto">
                            <button
                              onClick={() => handleCopyAnswer(message, index)}
                              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                              title={currentContent.copy}
                            >
                              {copiedIndex === index ? (
                                <Check className="w-4 h-4" style={{ color: '#20808D' }} />
                              ) : (
                                <Copy className="w-4 h-4 text-gray-400" />
                              )}
                            </button>
                            <button
                              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                              title={currentContent.like}
                              onClick={() => handleMessageFeedback(index, 'like')}
                            >
                              <ThumbsUp
                                className="w-4 h-4 transition-colors"
                                fill="none"
                                stroke={message.feedback === 'like' ? '#20808D' : '#9ca3af'}
                                strokeWidth={message.feedback === 'like' ? 2.5 : 2}
                              />
                            </button>
                            <button
                              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                              title={currentContent.dislike}
                              onClick={() => handleMessageFeedback(index, 'dislike')}
                            >
                              <ThumbsDown
                                className="w-4 h-4 transition-colors"
                                fill="none"
                                stroke={message.feedback === 'dislike' ? '#20808D' : '#9ca3af'}
                                strokeWidth={message.feedback === 'dislike' ? 2.5 : 2}
                              />
                            </button>
                          </div>
                        </div>
                      )}

                      {/* 참고문헌 */}
                      {message.references && message.references.length > 0 && !message.isStreaming && (
                        <div className="mt-6 pt-6 border-t border-gray-700 mb-6">
                          <button
                            onClick={() => setReferencesCollapsed({
                              ...referencesCollapsed,
                              [index]: !referencesCollapsed[index]
                            })}
                            className="flex items-center space-x-2 hover:text-white transition-colors mb-4"
                          >
                            <BookOpen className="w-5 h-5 text-gray-400" />
                            <h3 className="text-base font-medium text-gray-300">
                              {currentContent.references} ({message.references.length})
                            </h3>
                            {referencesCollapsed[index] ? (
                              <ChevronDown className="w-4 h-4 text-gray-400" />
                            ) : (
                              <ChevronUp className="w-4 h-4 text-gray-400" />
                            )}
                          </button>

                          <div
                            className={`overflow-hidden transition-all duration-500 ${
                              referencesCollapsed[index] ? 'max-h-0 opacity-0' : 'max-h-[5000px] opacity-100'
                            }`}
                            style={{ transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
                          >
                            <div className="space-y-3">
                              {message.references.map((ref: any, refIdx: number) => (
                                <div
                                  key={refIdx}
                                  id={`ref-${index}-${refIdx + 1}`}
                                  className="flex items-start justify-between py-3 transition-colors duration-500"
                                >
                                  <div className="flex items-start space-x-3 flex-1">
                                    <span className="font-medium text-base text-white">{refIdx + 1}.</span>
                                    <div className="flex-1 space-y-1.5">
                                      {ref.url ? (
                                        <a
                                          href={ref.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-base font-medium hover:underline cursor-pointer"
                                          style={{ color: '#5AC8D8' }}
                                        >
                                          {ref.title}
                                        </a>
                                      ) : (
                                        <h4 className="text-base font-medium" style={{ color: '#5AC8D8' }}>{ref.title}</h4>
                                      )}
                                      {ref.authors && ref.authors !== 'Unknown' && (
                                        <p className="text-sm text-white">{ref.authors}</p>
                                      )}
                                      {(ref.journal || ref.year) && (
                                        <p className="text-sm text-gray-300 flex items-center gap-2">
                                          <span>
                                            {ref.journal && ref.journal !== 'Unknown' && `${ref.journal}. `}
                                            {ref.year && ref.year !== 'Unknown' && ref.year}
                                          </span>
                                          {ref.year && (ref.year === '2024' || ref.year === '2025' || parseInt(ref.year) >= 2024) && (
                                            <span
                                              className="px-1.5 py-0 rounded-full text-xs font-medium"
                                              style={{
                                                backgroundColor: 'rgba(32, 128, 141, 0.25)',
                                                color: '#4DB8C4',
                                                fontSize: '0.65rem'
                                              }}
                                            >
                                              {currentContent.newBadge}
                                            </span>
                                          )}
                                        </p>
                                      )}
                                      {ref.doi && ref.doi !== 'Unknown' && (
                                        <p className="text-sm text-gray-300">
                                          doi: {ref.doi}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-1 ml-4">
                                    <button
                                      className="p-1.5 hover:bg-gray-700 rounded transition-colors"
                                      title={currentContent.like}
                                      onClick={() => handleReferenceFeedback(index, refIdx, 'like')}
                                    >
                                      <ThumbsUp
                                        className="w-3.5 h-3.5 transition-colors"
                                        fill="none"
                                        stroke={ref.feedback === 'like' ? '#20808D' : '#9ca3af'}
                                        strokeWidth={ref.feedback === 'like' ? 2.5 : 2}
                                      />
                                    </button>
                                    <button
                                      className="p-1.5 hover:bg-gray-700 rounded transition-colors"
                                      title={currentContent.dislike}
                                      onClick={() => handleReferenceFeedback(index, refIdx, 'dislike')}
                                    >
                                      <ThumbsDown
                                        className="w-3.5 h-3.5 transition-colors"
                                        fill="none"
                                        stroke={ref.feedback === 'dislike' ? '#20808D' : '#9ca3af'}
                                        strokeWidth={ref.feedback === 'dislike' ? 2.5 : 2}
                                      />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 후속 질문 섹션 - 타이핑 완료 후에만 표시 */}
                      {!message.isStreaming && message.followupQuestions && message.followupQuestions.length > 0 && (
                        <div className="mt-10">
                          <div className="rounded-xl border border-gray-700 bg-gray-800/30 p-5">
                            <h3 className="text-lg font-medium text-gray-300 mb-4 flex items-center gap-2">
                              <List className="w-5 h-5" />
                              {currentContent.relatedQuestions}
                            </h3>
                            <div className="divide-y divide-gray-700">
                              {message.followupQuestions.map((question, qIdx) => (
                                <button
                                  key={qIdx}
                                  onClick={() => handleFollowupQuestionClick(question)}
                                  className="w-full text-left py-3 px-3 transition-all duration-200 text-base text-gray-300 hover:text-[#5AC8D8] flex items-start group"
                                >
                                  <span className="mr-2 flex-shrink-0">↳</span>
                                  <span className="flex-1">{question}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* 로딩 표시 */}
          {isStreaming && loadingStatus && (
            <div className="flex flex-col items-center space-y-6">
              <div className="flex items-start space-x-3 w-full">
                <Image
                  src="/image/logo_candidate1 복사본.png"
                  alt="Ruleout AI"
                  width={28}
                  height={28}
                  className="rounded-full flex-shrink-0"
                />
                <div className="flex items-center space-x-2 text-gray-400">
                  <div
                    className="text-sm shimmer-text"
                    style={{
                      background: 'linear-gradient(90deg, rgba(156, 163, 175, 0.4) 0%, rgba(156, 163, 175, 1) 50%, rgba(156, 163, 175, 0.4) 100%)',
                      backgroundSize: '200% 100%',
                      animation: 'shimmer 3.5s infinite',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    {loadingStatus || currentContent.generatingAnswer}
                  </div>
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
                <style jsx>{`
                  @keyframes shimmer {
                    0% {
                      background-position: -200% 0;
                    }
                    100% {
                      background-position: 200% 0;
                    }
                  }
                `}</style>
              </div>

              {/* Stop 버튼 */}
              <button
                onClick={handleStopGeneration}
                className="px-4 py-1.5 rounded-md border transition-all hover:brightness-110 text-xs"
                style={{
                  borderColor: '#20808D',
                  color: '#20808D',
                  backgroundColor: 'transparent'
                }}
              >
                {currentContent.stop}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 입력 영역 - New Visit 홈화면에서는 숨김 */}
      {!(isVisitMode && messages.length === 0) && (
        <div className="p-4">
          <div className="md:max-w-4xl mx-auto relative">
            {/* 맨 아래로 스크롤 버튼 */}
            {showScrollToBottom && (
              <div className="absolute -top-16 left-1/2 transform -translate-x-1/2">
                <button
                  onClick={() => scrollToBottom(true)}
                  className="flex items-center justify-center w-10 h-10 bg-[#2a2a2a] hover:bg-[#3a3a3a] border border-gray-700 rounded-full shadow-lg transition-all"
                  title="Scroll to bottom"
                >
                  <ArrowDown className="w-5 h-5 text-gray-300" />
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit}>
            <div className="flex items-center bg-[#2a2a2a] rounded-2xl border border-gray-700 px-4 md:px-6 pr-2 py-1 hover:border-gray-600 transition-colors">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onCompositionStart={() => {
                  isComposingRef.current = true;
                }}
                onCompositionEnd={() => {
                  // composition이 끝난 후 약간의 딜레이를 두고 플래그 해제
                  // 이렇게 하면 Enter 키 이벤트보다 확실히 나중에 처리됨
                  setTimeout(() => {
                    isComposingRef.current = false;
                  }, 0);
                }}
                onKeyDown={(e) => {
                  // IME 입력 중이면 Enter를 무시
                  if (e.key === 'Enter' && !e.shiftKey) {
                    // 두 가지 모두 체크: nativeEvent와 ref
                    if (e.nativeEvent.isComposing || isComposingRef.current) {
                      // IME 변환 중이면 그냥 리턴 (preventDefault 안 함)
                      return;
                    }
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                placeholder={currentContent.placeholder}
                className="flex-1 bg-transparent outline-none text-white placeholder-gray-500 resize-none max-h-[120px] overflow-y-auto"
                disabled={isStreaming}
                rows={1}
                style={{
                  height: '20px',
                  lineHeight: '20px'
                }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = '20px';
                  target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
                }}
              />
              <button
                type="submit"
                disabled={isStreaming || !input.trim()}
                className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110 flex-shrink-0 self-start"
                style={{ backgroundColor: '#20808D' }}
              >
                <ArrowUp className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </div>
          </form>
          </div>
        </div>
      )}
    </div>
  );
}
