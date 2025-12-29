"use client";

import { useState, useEffect } from "react";
import { MoreVertical, Trash2, ChevronsRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getUserRecordings, deleteRecording, formatDuration, type RecordingMetadata } from "@/lib/recordingService";

interface RecordingsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRecording?: (recording: RecordingMetadata) => void;
  refreshKey?: number;
  selectedRecordingId?: string | null;
}

export default function RecordingsSidebar({ isOpen, onClose, onSelectRecording, refreshKey, selectedRecordingId }: RecordingsSidebarProps) {
  const { user } = useAuth();
  const [recordings, setRecordings] = useState<RecordingMetadata[]>([]);
  const [hoveredRecording, setHoveredRecording] = useState<string | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load recordings when user changes or refreshKey changes
  useEffect(() => {
    const loadRecordings = async () => {
      if (!user) {
        setRecordings([]);
        return;
      }

      console.log('🔄 RecordingsSidebar: Loading recordings...', { userId: user.uid, refreshKey });
      setIsLoading(true);
      try {
        const userRecordings = await getUserRecordings(user.uid);
        console.log('✅ RecordingsSidebar: Loaded recordings:', userRecordings.length, userRecordings);
        setRecordings(userRecordings);
      } catch (error) {
        console.error('❌ RecordingsSidebar: Failed to load recordings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRecordings();
  }, [user, refreshKey]);

  const handleDelete = async (recordingId: string) => {
    try {
      await deleteRecording(recordingId);
      setRecordings(recordings.filter(r => r.id !== recordingId));
      setActiveDropdown(null);
    } catch (error) {
      console.error('Failed to delete recording:', error);
      alert('Failed to delete recording. Please try again.');
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Sidebar - z-50 ensures it overlays the audio player (z-30) */}
      <div className={`fixed right-0 top-0 h-screen w-80 bg-[#1a1a1a] border-l border-gray-700 z-50 flex flex-col transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        {/* Header */}
        <div className="p-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-200">Recordings</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Close recordings sidebar"
          >
            <ChevronsRight className="w-5 h-5 text-gray-300" />
          </button>
        </div>

        {/* Recordings List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8 text-gray-500">
              <span className="text-sm">Loading recordings...</span>
            </div>
          ) : recordings.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-gray-500">
              <span className="text-sm">No recordings yet</span>
            </div>
          ) : (
            recordings.map((recording) => (
              <div
                key={recording.id}
                className="relative"
                onMouseEnter={() => setHoveredRecording(recording.id!)}
                onMouseLeave={() => setHoveredRecording(null)}
              >
                <div
                  className={`flex items-center px-4 py-2.5 hover:bg-gray-800/50 transition-colors cursor-pointer ${
                    selectedRecordingId === recording.id ? 'bg-gray-700' : ''
                  }`}
                  onClick={() => {
                    if (onSelectRecording) {
                      onSelectRecording(recording);
                    }
                  }}
                >
                  <span className="text-xs text-gray-300 whitespace-nowrap flex-shrink-0 w-24">{recording.date}</span>
                  <span className="text-xs text-gray-500 whitespace-nowrap flex-shrink-0 w-16">{recording.time}</span>
                  <span className="text-xs text-gray-500 whitespace-nowrap flex-shrink-0 w-12">{formatDuration(recording.duration)}</span>

                  {/* 3점 메뉴 버튼 - 항상 표시 */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveDropdown(activeDropdown === recording.id ? null : recording.id!);
                    }}
                    className="ml-auto p-1 hover:bg-gray-700 rounded transition-colors flex-shrink-0"
                  >
                    <MoreVertical className="w-4 h-4 text-gray-400" />
                  </button>
                </div>

                {/* 드롭다운 메뉴 */}
                {activeDropdown === recording.id && (
                  <div className="absolute right-4 top-12 bg-[#2a2a2a] rounded-lg border border-gray-700 shadow-lg z-50 min-w-[160px]">
                    <div className="py-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (recording.id) {
                            handleDelete(recording.id);
                          }
                        }}
                        className="w-full flex items-center space-x-3 px-4 py-2.5 hover:bg-gray-700 transition-colors text-left"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                        <span className="text-sm text-red-400">Delete</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
