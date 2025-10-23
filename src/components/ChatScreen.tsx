import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { ScrollArea } from "./ui/scroll-area";
import {
  Send,
  User,
  Bot,
  LogOut,
  Users,
  Plus,
  MessageSquare,
  FileText,
  Info,
} from "lucide-react";
import { OTAILogo } from "./WelcomeScreen";
import { SystemStatus } from "./SystemStatus";
import { ConversationHistory } from "./ConversationHistory";
import { ReferralForm } from "./ReferralForm";
import { InfoModal } from "./InfoModal";
import type {
  user,
  message,
  ReferralForm as ReferralFormType,
} from "../types/types";
import {
  getActiveSession,
  saveActiveSession,
  clearActiveSession,
  archiveSession,
  saveReferral,
  updateReferralStatus,
} from "../services/localStorage";
import {
  sendMessageToGemini,
  isGeminiConfigured,
} from "../services/geminiService";
import { sendReferral } from "../services/emailService";

interface ChatScreenProps {
  user: user | null;
  accessToken: string;
  onSignOut: () => void;
  onShowProviderDashboard?: () => void;
}

export function ChatScreen({
  user,
  onSignOut,
  onShowProviderDashboard,
}: ChatScreenProps) {
  const [messages, setMessages] = useState<message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [showReferralForm, setShowReferralForm] = useState(false);
  const [escalationSuggested, setEscalationSuggested] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);

  // Load active session on component mount
  useEffect(() => {
    loadActiveSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Check session age every minute and archive if > 3 hours
  useEffect(() => {
    if (!user) return;

    const checkSessionAge = () => {
      const session = getActiveSession(user.id);
      if (!session && messages.length > 0) {
        // Session was archived, clear messages
        setMessages([]);
      }
    };

    const interval = setInterval(checkSessionAge, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [user, messages.length]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    const scrollContainer = document.querySelector(
      "[data-radix-scroll-area-viewport]"
    );
    if (scrollContainer) {
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }
  }, [messages]);

  const loadActiveSession = async () => {
    if (!user) {
      setIsLoadingHistory(false);
      return;
    }

    try {
      const session = getActiveSession(user.id);
      if (session) {
        setMessages(session.messages);
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error("Error loading active session:", error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleLoadArchivedSession = (archivedMessages: message[]) => {
    // Archive current session if it has messages
    if (user && messages.length > 0) {
      const currentSession = getActiveSession(user.id);
      if (currentSession) {
        archiveSession(user.id, currentSession);
      }
    }

    // Load archived session
    setMessages(archivedMessages);

    // Save as new active session
    if (user) {
      saveActiveSession(user.id, archivedMessages);
    }
  };

  const handleNewConversation = () => {
    if (!user) return;

    // Archive current session if it has messages
    if (messages.length > 0) {
      const currentSession = getActiveSession(user.id);
      if (currentSession) {
        archiveSession(user.id, currentSession);
      }
      clearActiveSession(user.id);
    }

    // Clear messages for new conversation
    setMessages([]);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputMessage.trim() || isLoading || !user) return;

    // Check if Gemini is configured
    if (!isGeminiConfigured()) {
      const errorMsg: message = {
        id: crypto.randomUUID(),
        content:
          "⚠️ Gemini API är inte konfigurerad. Lägg till din API-nyckel i .env-filen för att aktivera AI-funktionalitet.",
        role: {
          id: "system",
          email: "system@otai.se",
          name: "System",
          userType: "provider",
        },
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
      return;
    }

    const userMessage = inputMessage.trim();
    setInputMessage("");

    // Add user message to UI immediately
    const tempUserMessage: message = {
      id: crypto.randomUUID(),
      content: userMessage,
      role: user,
      timestamp: new Date().toISOString(),
    };

    const updatedMessages = [...messages, tempUserMessage];
    setMessages(updatedMessages);

    // Save to active session
    saveActiveSession(user.id, updatedMessages);

    setIsLoading(true);

    try {
      // Get AI response from Gemini
      const aiResponse = await sendMessageToGemini(userMessage, messages);

      // Check if AI suggested escalation (before removing the marker)
      const shouldEscalate = aiResponse.includes("[ESKALERING_FÖRESLAGEN]");

      // Remove the escalation marker from the displayed message
      const cleanedResponse = aiResponse
        .replace("[ESKALERING_FÖRESLAGEN]", "")
        .trim();

      // Create AI message
      const aiMessage: message = {
        id: crypto.randomUUID(),
        content: cleanedResponse,
        role: {
          id: "otai",
          email: "ai@otai.se",
          name: "OTAI",
          userType: "provider",
        },
        timestamp: new Date().toISOString(),
      };

      const finalMessages = [...updatedMessages, aiMessage];
      setMessages(finalMessages);

      // Set escalation flag if marker was found
      if (shouldEscalate) {
        setEscalationSuggested(true);
      }

      // Save to active session
      saveActiveSession(user.id, finalMessages);
    } catch (error) {
      console.error("Error sending message:", error);

      const errorMessage =
        error instanceof Error ? error.message : "Ett okänt fel inträffade";

      // Add error message to UI
      const errorMsg: message = {
        id: crypto.randomUUID(),
        content: `Ursäkta, något gick fel: ${errorMessage}`,
        role: {
          id: "system",
          email: "system@otai.se",
          name: "System",
          userType: "provider",
        },
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = () => {
    onSignOut();
  };

  const handleReferralSubmit = async (referral: ReferralFormType) => {
    if (!user) return;

    try {
      // Save as draft first
      referral.status = "submitted";
      saveReferral(referral);

      // Send email
      const result = await sendReferral(referral);

      if (result.success) {
        // Update status to sent
        updateReferralStatus(referral.id, "sent");

        // Add confirmation message to chat
        const confirmationMsg: message = {
          id: crypto.randomUUID(),
          content:
            "✅ Din remiss har skickats till vårt team av legitimerade arbetsterapeuter. De kommer att kontakta dig inom kort.",
          role: {
            id: "system",
            email: "system@otai.se",
            name: "System",
            userType: "provider",
          },
          timestamp: new Date().toISOString(),
        };

        const updatedMessages = [...messages, confirmationMsg];
        setMessages(updatedMessages);
        saveActiveSession(user.id, updatedMessages);

        // Close form and reset escalation flag
        setShowReferralForm(false);
        setEscalationSuggested(false);
      } else {
        // Update status to failed
        updateReferralStatus(referral.id, "failed");

        // Show error message
        const errorMsg: message = {
          id: crypto.randomUUID(),
          content: `❌ ${
            result.error ||
            "Kunde inte skicka remissen. Den har sparats som utkast."
          }`,
          role: {
            id: "system",
            email: "system@otai.se",
            name: "System",
            userType: "provider",
          },
          timestamp: new Date().toISOString(),
        };

        const updatedMessages = [...messages, errorMsg];
        setMessages(updatedMessages);
        saveActiveSession(user.id, updatedMessages);

        setShowReferralForm(false);
      }
    } catch (error) {
      console.error("Error handling referral:", error);
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString("sv-SE", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoadingHistory) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <OTAILogo className="mx-auto scale-50" />
          <p className="text-slate-600">Laddar din chatt...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex overflow-x-hidden">
      {/* Conversation History - desktop sidebar, mobile sheet */}
      {user && (
        <ConversationHistory
          userId={user.id}
          onLoadSession={handleLoadArchivedSession}
          isOpen={historyOpen}
          setIsOpen={setHistoryOpen}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="bg-primary shadow-md p-3 sm:p-4">
          <div className="flex items-center justify-between mx-auto gap-2 container">
            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
              <div className="bg-white rounded-full flex items-center justify-center flex-shrink-0 p-2">
                <Bot className="text-primary" />
              </div>
              <div className="min-w-0">
                <h1 className="font-semibold text-white text-base sm:text-lg truncate">
                  OTAI
                </h1>
                <p className="text-xs sm:text-sm text-white/80 hidden sm:block truncate">
                  Arbetsterapeutisk AI-assistent
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
              <span className="text-xs sm:text-sm text-white/80 hidden md:block truncate">
                {user?.name || user?.email}
              </span>
              {/* History button - only visible on mobile/tablet (< 1024px) */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setHistoryOpen(true)}
                className="text-white hover:bg-white/20 px-2 sm:px-3 lg:hidden"
              >
                <MessageSquare className="flex-shrink-0" />
                <span className="hidden sm:inline ml-2 text-sm">Historik</span>
              </Button>
              {escalationSuggested && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowReferralForm(true)}
                  className="text-white bg-white/20 hover:bg-white/30 px-2 sm:px-3 font-semibold"
                  title="Skapa remiss till legitimerad arbetsterapeut"
                >
                  <FileText className="flex-shrink-0" />
                  <span className="hidden sm:inline ml-2 text-sm">Remiss</span>
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleNewConversation}
                className="text-white hover:bg-white/20 px-2 sm:px-3"
                title="Starta ny konversation"
              >
                <Plus className="flex-shrink-0" />
                <span className="hidden sm:inline ml-2 text-sm">Ny</span>
              </Button>
              {user?.userType === "provider" && onShowProviderDashboard && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onShowProviderDashboard}
                  className="text-white hover:bg-white/20 h-8 w-8 sm:h-9 sm:w-auto px-2 sm:px-3"
                >
                  <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline ml-2 text-sm">
                    Dashboard
                  </span>
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowInfoModal(true)}
                className="text-white hover:bg-white/20 h-8 w-8 sm:h-9 sm:w-auto px-2 sm:px-3"
                title="Information om OTAI"
              >
                <Info className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline ml-2 text-sm">Info</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="text-white hover:bg-white/20 h-8 w-8 sm:h-9 sm:w-auto px-2 sm:px-3"
              >
                <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline ml-2 text-sm">Logga ut</span>
              </Button>
            </div>
          </div>
        </div>

        {/* System Status */}
        <SystemStatus className="mx-auto px-3 sm:px-4 pt-3 sm:pt-4 container" />

        {/* Chat Area */}
        <div className="flex-1 flex flex-col mx-auto container min-w-0">
          <ScrollArea className="flex-1 p-3 sm:p-4">
            <div className="space-y-3 sm:space-y-4">
              {messages.length === 0 && (
                <div className="text-center py-8 sm:py-12 space-y-3 sm:space-y-4 px-2">
                  <OTAILogo className="mx-auto scale-[0.4] sm:scale-50" />
                  <div>
                    <h2 className="text-lg sm:text-xl text-[#1C3D32] mb-2">
                      Hej! Jag är OTAI
                    </h2>
                    <p
                      className="text-sm sm:text-base text-slate-600 mx-auto px-2"
                      style={{ maxWidth: "28rem" }}
                    >
                      Berätta gärna om dina utmaningar i vardagen, så hjälper
                      jag dig med arbetsterapeutiska förslag och strategier.
                    </p>
                  </div>
                  <div className="bg-[#F9E6EC] p-3 sm:p-4 rounded-lg max-w-md mx-auto">
                    <p className="text-xs sm:text-sm text-[#1C3D32]">
                      <strong>Exempel på vad du kan fråga:</strong>
                      <br />
                      "Jag har svårt att komma ihåg att ta mina mediciner"
                      <br />
                      "Jag får ont i ryggen när jag städar"
                      <br />
                      "Mitt barn har svårt att koncentrera sig på läxorna"
                    </p>
                  </div>
                </div>
              )}

              {messages.map((message) => {
                const isAssistant =
                  message.role === "assistant" ||
                  (typeof message.role === "object" &&
                    message.role.id === "otai");
                const isUser = !isAssistant;

                return (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      isUser ? "justify-end" : "justify-start"
                    }`}
                  >
                    {!isUser && (
                      <Avatar className="w-8 h-8 bg-primary flex-shrink-0">
                        <AvatarFallback className="bg-primary text-white text-xs">
                          <Bot className="w-4 h-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}

                    <div
                      className={`px-3 sm:px-4 py-2 sm:py-3 rounded-2xl shadow-sm ${
                        isUser ? "text-white rounded-br-sm" : "rounded-bl-sm"
                      }`}
                      style={{
                        backgroundColor: isUser ? "#213E35" : "#F8E6EC",
                        color: isUser ? "white" : "#213E35",
                        maxWidth: isUser ? "85%" : "75%",
                      }}
                    >
                      <p className="text-sm sm:text-[15px] leading-relaxed whitespace-pre-wrap break-words">
                        {message.content}
                      </p>
                      <p
                        className={`text-[10px] sm:text-xs mt-1 sm:mt-1.5 ${
                          isUser ? "text-white/70" : "text-primary/60"
                        }`}
                      >
                        {formatTime(message.timestamp)}
                      </p>
                    </div>

                    {isUser && (
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarFallback className="bg-primary text-white text-xs">
                          <User className="w-4 h-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                );
              })}

              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <Avatar className="w-8 h-8 bg-primary flex-shrink-0">
                    <AvatarFallback className="bg-primary text-white text-xs">
                      <Bot className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-secondary rounded-2xl rounded-bl-sm shadow-sm px-4 py-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="border-t border-slate-200 bg-white p-3 sm:p-4 shadow-lg">
            <form
              onSubmit={handleSendMessage}
              className="flex gap-2 sm:gap-3 mx-auto container"
            >
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Skriv ditt meddelande här..."
                disabled={isLoading}
                className="flex-1 min-w-0 rounded-full border-slate-300 bg-slate-50 focus:border-primary focus:ring-primary px-4 sm:px-5 py-5 sm:py-6 text-sm sm:text-base"
              />
              <Button
                type="submit"
                variant="default"
                disabled={isLoading || !inputMessage.trim()}
                className="rounded-full p-3 sm:p-4 flex items-center justify-center flex-shrink-0"
              >
                <Send className="flex-shrink-0" />
              </Button>
            </form>

            <p className="text-[10px] sm:text-xs text-slate-500 text-center mt-2 sm:mt-3 px-2">
              OTAI ger förslag baserat på arbetsterapeutisk kunskap. Alla
              bedömningar granskas av legitimerad personal.
            </p>
          </div>
        </div>
      </div>

      {/* Referral Form Modal */}
      {showReferralForm && user && (
        <ReferralForm
          user={user}
          conversationMessages={messages}
          onSubmit={handleReferralSubmit}
          onCancel={() => setShowReferralForm(false)}
        />
      )}

      {/* Info Modal */}
      <InfoModal
        isOpen={showInfoModal}
        onClose={() => setShowInfoModal(false)}
      />
    </div>
  );
}
