import { useState, useEffect } from "react";
import { WelcomeScreen } from "./components/WelcomeScreen";
import { AuthScreen } from "./components/AuthScreen";
import { ChatScreen } from "./components/ChatScreen";
import { ProviderDashboard } from "./components/ProviderDashboard";
import type { user } from "./types/types";
import { getCurrentUser, clearCurrentUser } from "./services/localStorage";

type AppState = "welcome" | "auth" | "chat" | "provider-dashboard";

export default function App() {
  const [appState, setAppState] = useState<AppState>("welcome");
  const [user, setUser] = useState<user | null>(null);
  const [accessToken, setAccessToken] = useState<string>("");
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  // Check for existing session on app load
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = () => {
    try {
      const currentUser = getCurrentUser();

      if (currentUser) {
        setUser(currentUser);
        setAccessToken(`local_${currentUser.id}_${Date.now()}`);
        setAppState("chat");
      }
    } catch (error) {
      console.error("Error checking session:", error);
    } finally {
      setIsCheckingSession(false);
    }
  };

  const handleGetStarted = () => {
    setAppState("auth");
  };

  const handleBackToWelcome = () => {
    setAppState("welcome");
  };

  const handleAuthSuccess = (userData: user, token: string) => {
    setUser(userData);
    setAccessToken(token);
    setAppState("chat");
  };

  const handleSignOut = () => {
    clearCurrentUser();
    setUser(null);
    setAccessToken("");
    setAppState("welcome");
  };

  const handleShowProviderDashboard = () => {
    setAppState("provider-dashboard");
  };

  const handleBackToChat = () => {
    setAppState("chat");
  };

  // Show loading screen while checking for existing session
  if (isCheckingSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-[#1C3D32] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-600">Laddar OTAI...</p>
        </div>
      </div>
    );
  }

  switch (appState) {
    case "welcome":
      return <WelcomeScreen onGetStarted={handleGetStarted} />;

    case "auth":
      return (
        <AuthScreen
          onBack={handleBackToWelcome}
          onAuthSuccess={handleAuthSuccess}
        />
      );

    case "chat":
      return (
        <ChatScreen
          user={user}
          accessToken={accessToken}
          onSignOut={handleSignOut}
          onShowProviderDashboard={handleShowProviderDashboard}
        />
      );

    case "provider-dashboard":
      return (
        <ProviderDashboard
          accessToken={accessToken}
          onBack={handleBackToChat}
        />
      );

    default:
      return <WelcomeScreen onGetStarted={handleGetStarted} />;
  }
}
