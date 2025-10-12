import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "./ui/sheet";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import {
  MessageSquare,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Clock,
} from "lucide-react";
import {
  getArchivedSessions,
  deleteArchivedSession,
} from "../services/localStorage";
import type { message } from "../types/types";

interface ChatSession {
  id: string;
  userId: string;
  messages: message[];
  createdAt: string;
  lastActivityAt: string;
  title: string;
}

interface ConversationHistoryProps {
  userId: string;
  onLoadSession: (messages: message[]) => void;
  isOpen?: boolean;
  setIsOpen?: (open: boolean) => void;
}

export function ConversationHistory({
  userId,
  onLoadSession,
  isOpen: externalIsOpen,
  setIsOpen: externalSetIsOpen,
}: ConversationHistoryProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  // Use external state if provided, otherwise use internal
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setIsOpen = externalSetIsOpen || setInternalIsOpen;

  const loadSessions = () => {
    const archivedSessions = getArchivedSessions(userId);
    setSessions(archivedSessions);
  };

  useEffect(() => {
    loadSessions();

    // Check if desktop on mount and on resize
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    checkDesktop();
    window.addEventListener("resize", checkDesktop);

    // Auto-open on desktop
    if (window.innerWidth >= 1024) {
      setIsOpen(true);
    }

    return () => window.removeEventListener("resize", checkDesktop);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Reload sessions when userId changes
    loadSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const handleLoadSession = (session: ChatSession) => {
    onLoadSession(session.messages);
    if (!isDesktop) {
      setIsOpen(false);
    }
  };

  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Är du säker på att du vill radera denna konversation?")) {
      deleteArchivedSession(sessionId, userId);
      loadSessions();
    }
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 24) {
      return `${diffHours}h sedan`;
    } else if (diffDays < 7) {
      return `${diffDays}d sedan`;
    } else {
      return date.toLocaleDateString("sv-SE", {
        month: "short",
        day: "numeric",
      });
    }
  };

  const sessionsList = (
    <div className="space-y-2">
      {sessions.map((session) => (
        <Card
          key={session.id}
          className="cursor-pointer hover:bg-slate-50 transition-colors border-slate-200"
          onClick={() => handleLoadSession(session)}
        >
          <CardContent className="p-2.5 sm:p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-[#213E35] line-clamp-2 mb-1 break-words">
                  {session.title}
                </p>
                <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-slate-500">
                  <Clock
                    className="flex-shrink-0"
                    style={{ width: "0.75rem", height: "0.75rem" }}
                  />
                  <span className="truncate">
                    {formatDate(session.lastActivityAt)}
                  </span>
                  <span>•</span>
                  <span className="truncate">
                    {session.messages.length} meddelanden
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-slate-400 hover:text-red-600 flex-shrink-0 p-1.5 sm:p-2"
                onClick={(e) => handleDeleteSession(session.id, e)}
              >
                <Trash2
                  className="flex-shrink-0"
                  style={{ width: "1rem", height: "1rem" }}
                />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const emptyState = (
    <div className="text-center py-6 sm:py-8 text-slate-500 px-2">
      <MessageSquare
        className="mx-auto mb-2 sm:mb-3 opacity-30"
        style={{ width: "2.5rem", height: "2.5rem" }}
      />
      <p className="text-xs sm:text-sm">Inga tidigare konversationer</p>
      <p className="text-[10px] sm:text-xs mt-1">
        Konversationer sparas automatiskt efter 3 timmar
      </p>
    </div>
  );

  // Desktop: Persistent sidebar with collapse button
  if (isDesktop) {
    return (
      <>
        {/* Collapsed toggle button */}
        {!isOpen && (
          <div className="fixed left-0 top-20 z-40">
            <Button
              variant="secondary"
              size="icon"
              onClick={() => setIsOpen(true)}
              className="rounded-l-none rounded-r-lg shadow-lg"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Sidebar */}
        {isOpen && (
          <div
            className="fixed left-0 top-0 h-full bg-white border-r border-slate-200 shadow-lg z-40 flex flex-col pt-16 sm:pt-20 pb-3 sm:pb-4 px-4 sm:px-6"
            style={{ width: "clamp(250px, 25vw, 320px)" }}
          >
            <div className="absolute right-2 top-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
              >
                <ChevronLeft className="h-4" />
              </Button>
            </div>

            {/* Header */}
            <div className="mb-3 sm:mb-4">
              <h2 className="text-base sm:text-lg font-semibold text-[#213E35] flex items-center gap-2">
                <MessageSquare className="flex-shrink-0" />
                <span className="truncate">Tidigare konversationer</span>
              </h2>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto -mx-4 sm:-mx-6 px-4 sm:px-6">
              {sessions.length === 0 ? emptyState : sessionsList}
            </div>
          </div>
        )}

        {/* Spacer to push content when sidebar is open */}
        {isOpen && (
          <div
            className="flex-shrink-0"
            style={{ width: "clamp(250px, 25vw, 320px)" }}
          />
        )}
      </>
    );
  }

  // Mobile/Tablet: Sheet with external trigger (controlled by parent)
  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent
        side="left"
        className="bg-white !w-auto p-0"
        style={{ width: "min(85vw, 400px)", maxWidth: "400px" }}
      >
        <div className="flex flex-col h-full p-4 sm:p-6">
          <SheetHeader className="p-0 mb-4">
            <SheetTitle className="text-[#213E35] flex items-center gap-2 text-base sm:text-lg">
              <MessageSquare
                style={{ width: "1.25rem", height: "1.25rem" }}
                className="flex-shrink-0"
              />
              <span>Tidigare konversationer</span>
            </SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto">
            {sessions.length === 0 ? emptyState : sessionsList}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
