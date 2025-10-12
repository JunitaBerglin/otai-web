import { useEffect, useState } from "react";
import { Alert, AlertDescription } from "./ui/alert";
import { AlertTriangle, CheckCircle } from "lucide-react";
import { isGeminiConfigured } from "../services/geminiService";

interface SystemStatusProps {
  className?: string;
}

export function SystemStatus({ className = "" }: SystemStatusProps) {
  const [status, setStatus] = useState<{
    ok: boolean;
    openai_configured: boolean;
    message?: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkSystemStatus();
  }, []);

  const checkSystemStatus = async () => {
    try {
      // Check if Gemini API is configured
      const geminiConfigured = isGeminiConfigured();

      setStatus({
        ok: geminiConfigured,
        openai_configured: geminiConfigured,
        message: geminiConfigured
          ? "Gemini AI är konfigurerad och redo"
          : "Gemini API-nyckel saknas. Lägg till VITE_GEMINI_API_KEY i .env-filen.",
      });
    } catch (error) {
      console.error("System status check failed:", error);
      setStatus({
        ok: false,
        openai_configured: false,
        message: "Kunde inte kontrollera systemstatus",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return null;
  }

  if (!status || !status.ok || !status.openai_configured) {
    return (
      <div className={className}>
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            {!status?.openai_configured
              ? "AI-tjänsten är inte helt konfigurerad. Kontakta systemadministratören."
              : status?.message || "Systemet är inte helt funktionellt."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className={className}>
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          <div className="space-y-1">
            <div>Alla system fungerar normalt</div>
            <div className="text-xs text-green-700">
              ✓ AI-bedömning aktiv · ✓ Remisser till legitimerade
              arbetsterapeuter tillgängliga
            </div>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}
