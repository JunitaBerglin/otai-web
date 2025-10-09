import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { User, Bot, Calendar, Clock, ArrowLeft } from "lucide-react";
import { getAllUsers, getMessages } from "../services/localStorage";

interface Message {
  id: string;
  userId: string;
  message: string;
  role: "user" | "assistant";
  timestamp: string;
}

interface UserSession {
  [userId: string]: Message[];
}

interface ProviderDashboardProps {
  accessToken: string;
  onBack: () => void;
}

export function ProviderDashboard({ onBack }: ProviderDashboardProps) {
  const [userSessions, setUserSessions] = useState<UserSession>({});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState<string>("");

  useEffect(() => {
    loadAssessments();
  }, []);

  const loadAssessments = async () => {
    // TODO: Implement provider dashboard with localStorage
    // For now, just a placeholder
    try {
      const users = getAllUsers();
      const sessions: UserSession = {};

      users.forEach((user) => {
        const messages = getMessages(user.id);
        if (messages.length > 0) {
          sessions[user.id] = messages.map((msg) => ({
            id: msg.id,
            userId: user.id,
            message: msg.content,
            role: msg.role === "assistant" ? "assistant" : "user",
            timestamp: msg.timestamp,
          }));
        }
      });

      setUserSessions(sessions);
    } catch (error) {
      console.error("Error loading assessments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString("sv-SE", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getSessionSummary = (messages: Message[]) => {
    const userMessages = messages.filter((m) => m.role === "user");
    const lastMessage = messages[messages.length - 1];
    const firstMessage = messages[0];

    return {
      messageCount: userMessages.length,
      lastActivity: lastMessage?.timestamp,
      firstContact: firstMessage?.timestamp,
      lastUserMessage:
        userMessages[userMessages.length - 1]?.message?.substring(0, 100) +
        "...",
    };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-[#1C3D32] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-600">Laddar bedömningar...</p>
        </div>
      </div>
    );
  }

  const userIds = Object.keys(userSessions);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-200 p-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              onClick={onBack}
              className="text-[#1C3D32] hover:bg-[#F9E6EC]"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Tillbaka
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-[#1C3D32]">
                Vårdgivardashboard
              </h1>
              <p className="text-sm text-slate-600">Granska AI-bedömningar</p>
            </div>
          </div>

          <Badge variant="secondary" className="bg-[#F9E6EC] text-[#1C3D32]">
            {userIds.length} aktiva patienter
          </Badge>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {userIds.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-slate-500" />
            </div>
            <h2 className="text-xl text-slate-600 mb-2">
              Inga bedömningar ännu
            </h2>
            <p className="text-slate-500">
              När patienter använder OTAI kommer deras konversationer att visas
              här för granskning.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Patient List */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-[#1C3D32]">Patienter</CardTitle>
                  <CardDescription>
                    Klicka för att granska konversation
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-2 p-4">
                      {userIds.map((userId) => {
                        const summary = getSessionSummary(userSessions[userId]);
                        return (
                          <Card
                            key={userId}
                            className={`cursor-pointer transition-colors hover:bg-slate-50 ${
                              selectedUserId === userId
                                ? "ring-2 ring-[#1C3D32] bg-[#F9E6EC]"
                                : ""
                            }`}
                            onClick={() => setSelectedUserId(userId)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center space-x-3">
                                <Avatar className="w-10 h-10">
                                  <AvatarFallback className="bg-slate-300 text-slate-600">
                                    <User className="w-5 h-5" />
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm text-slate-900 truncate">
                                    Patient #{userId.substring(0, 8)}
                                  </p>
                                  <div className="flex items-center space-x-2 text-xs text-slate-500">
                                    <Calendar className="w-3 h-3" />
                                    <span>
                                      {formatDate(summary.lastActivity)}
                                    </span>
                                  </div>
                                  <p className="text-xs text-slate-600 mt-1 truncate">
                                    {summary.messageCount} meddelanden
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            {/* Conversation View */}
            <div className="lg:col-span-2">
              {selectedUserId ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-[#1C3D32]">
                      Konversation - Patient #{selectedUserId.substring(0, 8)}
                    </CardTitle>
                    <CardDescription>
                      Granska AI-bedömningen och patientinteraktionen
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <ScrollArea className="h-[500px] p-4">
                      <div className="space-y-4">
                        {userSessions[selectedUserId]
                          .sort(
                            (a, b) =>
                              new Date(a.timestamp).getTime() -
                              new Date(b.timestamp).getTime()
                          )
                          .map((message) => (
                            <div
                              key={message.id}
                              className={`flex gap-3 ${
                                message.role === "user"
                                  ? "justify-end"
                                  : "justify-start"
                              }`}
                            >
                              {message.role === "assistant" && (
                                <Avatar className="w-8 h-8 bg-[#1C3D32]">
                                  <AvatarFallback className="bg-[#1C3D32] text-white text-xs">
                                    <Bot className="w-4 h-4" />
                                  </AvatarFallback>
                                </Avatar>
                              )}

                              <div
                                className={`max-w-[80%] p-4 rounded-2xl ${
                                  message.role === "user"
                                    ? "bg-[#1C3D32] text-white rounded-br-md"
                                    : "bg-white border border-slate-200 rounded-bl-md shadow-sm"
                                }`}
                              >
                                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                  {message.message}
                                </p>
                                <div className="flex items-center space-x-2 mt-2">
                                  <Clock
                                    className={`w-3 h-3 ${
                                      message.role === "user"
                                        ? "text-green-100"
                                        : "text-slate-400"
                                    }`}
                                  />
                                  <p
                                    className={`text-xs ${
                                      message.role === "user"
                                        ? "text-green-100"
                                        : "text-slate-500"
                                    }`}
                                  >
                                    {formatDate(message.timestamp)}
                                  </p>
                                </div>
                              </div>

                              {message.role === "user" && (
                                <Avatar className="w-8 h-8">
                                  <AvatarFallback className="bg-slate-300 text-slate-600 text-xs">
                                    <User className="w-4 h-4" />
                                  </AvatarFallback>
                                </Avatar>
                              )}
                            </div>
                          ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Bot className="w-8 h-8 text-slate-500" />
                    </div>
                    <h3 className="text-lg text-slate-600 mb-2">
                      Välj en patient
                    </h3>
                    <p className="text-slate-500">
                      Klicka på en patient till vänster för att granska deras
                      AI-konversation.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
