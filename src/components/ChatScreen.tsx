import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { ScrollArea } from "./ui/scroll-area";
import { Send, User, Bot, LogOut, Users } from "lucide-react";
import { OTAILogo } from "./WelcomeScreen";
import { SystemStatus } from "./SystemStatus";
import type { user, message } from "../types/types";
import { getMessages, saveMessage } from "../services/localStorage";
import {
  sendMessageToGemini,
  isGeminiConfigured,
} from "../services/geminiService";

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

  // Load chat history on component mount
  useEffect(() => {
    loadChatHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    const scrollContainer = document.querySelector(
      "[data-radix-scroll-area-viewport]"
    );
    if (scrollContainer) {
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }
  }, [messages]);

  const loadChatHistory = async () => {
    if (!user) {
      setIsLoadingHistory(false);
      return;
    }

    try {
      const history = getMessages(user.id);
      setMessages(history);
    } catch (error) {
      console.error("Error loading chat history:", error);
    } finally {
      setIsLoadingHistory(false);
    }
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

    setMessages((prev) => [...prev, tempUserMessage]);

    // Save user message
    saveMessage(user.id, tempUserMessage);

    setIsLoading(true);

    try {
      // Get AI response from Gemini
      const aiResponse = await sendMessageToGemini(userMessage, messages);

      // Create AI message
      const aiMessage: message = {
        id: crypto.randomUUID(),
        content: aiResponse,
        role: {
          id: "otai",
          email: "ai@otai.se",
          name: "OTAI",
          userType: "provider",
        },
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, aiMessage]);

      // Save AI message
      saveMessage(user.id, aiMessage);
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
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="bg-[#213E35] shadow-md p-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <Bot className="w-6 h-6 text-[#213E35]" />
            </div>
            <div>
              <h1 className="font-semibold text-white text-lg">OTAI</h1>
              <p className="text-sm text-white/80">
                Arbetsterapeutisk AI-assistent
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-white/80 hidden sm:block">
              {user?.name || user?.email}
            </span>
            {user?.userType === "provider" && onShowProviderDashboard && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onShowProviderDashboard}
                className="text-white hover:bg-white/10"
              >
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline ml-2">Dashboard</span>
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="text-white hover:bg-white/10"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline ml-2">Logga ut</span>
            </Button>
          </div>
        </div>
      </div>

      {/* System Status */}
      <SystemStatus className="max-w-4xl mx-auto px-4 pt-4" />

      {/* Chat Area */}
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-12 space-y-4">
                <OTAILogo className="mx-auto scale-50" />
                <div>
                  <h2 className="text-xl text-[#1C3D32] mb-2">
                    Hej! Jag är OTAI
                  </h2>
                  <p className="text-slate-600 max-w-md mx-auto">
                    Berätta gärna om dina utmaningar i vardagen, så hjälper jag
                    dig med arbetsterapeutiska förslag och strategier.
                  </p>
                </div>
                <div className="bg-[#F9E6EC] p-4 rounded-lg max-w-md mx-auto">
                  <p className="text-sm text-[#1C3D32]">
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
                    <Avatar className="w-8 h-8 bg-[#213E35] flex-shrink-0">
                      <AvatarFallback className="bg-[#213E35] text-white text-xs">
                        <Bot className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}

                  <div
                    className={`max-w-[75%] px-4 py-3 rounded-2xl shadow-sm ${
                      isUser
                        ? "bg-[#213E35] text-white rounded-br-sm"
                        : "bg-[#F8E6EC] text-[#213E35] rounded-bl-sm"
                    }`}
                  >
                    <p className="text-[15px] leading-relaxed whitespace-pre-wrap">
                      {message.content}
                    </p>
                    <p
                      className={`text-xs mt-1.5 ${
                        isUser ? "text-green-100/70" : "text-[#213E35]/60"
                      }`}
                    >
                      {formatTime(message.timestamp)}
                    </p>
                  </div>

                  {isUser && (
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarFallback className="bg-[#213E35] text-white text-xs">
                        <User className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              );
            })}

            {isLoading && (
              <div className="flex gap-3 justify-start">
                <Avatar className="w-8 h-8 bg-[#213E35] flex-shrink-0">
                  <AvatarFallback className="bg-[#213E35] text-white text-xs">
                    <Bot className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-[#F8E6EC] rounded-2xl rounded-bl-sm shadow-sm px-4 py-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-[#213E35]/40 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-[#213E35]/40 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-[#213E35]/40 rounded-full animate-bounce"></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t border-slate-200 bg-white p-4 shadow-lg">
          <form
            onSubmit={handleSendMessage}
            className="flex gap-3 max-w-3xl mx-auto"
          >
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Skriv ditt meddelande här..."
              disabled={isLoading}
              className="flex-1 rounded-full border-slate-300 bg-slate-50 focus:border-[#213E35] focus:ring-[#213E35] px-5 py-6"
            />
            <Button
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
              className="bg-[#213E35] hover:bg-[#2d5548] rounded-full px-6 h-12 w-12 p-0 flex items-center justify-center"
            >
              <Send className="w-5 h-5" />
            </Button>
          </form>

          <p className="text-xs text-slate-500 text-center mt-3">
            OTAI ger förslag baserat på arbetsterapeutisk kunskap. Alla
            bedömningar granskas av legitimerad personal.
          </p>
        </div>
      </div>
    </div>
  );
}
