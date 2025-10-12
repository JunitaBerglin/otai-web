import { Button } from "./ui/button";

export function OTAILogo({ className = "" }: { className?: string }) {
  return (
    <svg
      width="180"
      height="220"
      viewBox="0 0 200 250"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Yttre mörkgrön cirkel */}
      <circle
        cx="100"
        cy="80"
        r="50"
        fill="none"
        stroke="#213E35"
        strokeWidth="8"
      />

      {/* Inre ljusrosa cirkel */}
      <circle cx="100" cy="80" r="20" fill="#F8E6EC" />

      {/* Text: OTAI */}
      <text
        x="50%"
        y="200"
        textAnchor="middle"
        fontFamily="Inter, sans-serif"
        fontSize="42"
        fill="#213E35"
        fontWeight="700"
      >
        OTAI
      </text>
    </svg>
  );
}

interface WelcomeScreenProps {
  onGetStarted: () => void;
}

export function WelcomeScreen({ onGetStarted }: WelcomeScreenProps) {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 sm:p-6 overflow-x-hidden">
      <div
        className="text-center mx-auto space-y-6 sm:space-y-8 container"
        style={{ maxWidth: "28rem" }}
      >
        <div className="flex justify-center">
          <OTAILogo />
        </div>

        <div className="space-y-4 px-2">
          <h1 className="text-2xl sm:text-3xl text-primary font-bold">
            Hej! Jag är OTAI
          </h1>

          <p className="text-primary leading-relaxed text-sm sm:text-base">
            Berätta gärna om dina utmaningar i vardagen, så hjälper jag dig med
            arbetsterapeutiska förslag och strategier.
          </p>

          <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 sm:p-4">
            <p className="text-primary text-xs sm:text-sm leading-relaxed">
              <strong>💡 Första bedömning:</strong> Jag fungerar som en första
              bedömning och kan ge dig råd och förslag. Om du behöver mer
              omfattande hjälp, fysiska hjälpmedel eller personlig uppföljning,
              kan jag hjälpa dig skapa en remiss till vårt team av{" "}
              <strong>legitimerade arbetsterapeuter</strong> som tar över ditt
              ärende.
            </p>
          </div>
        </div>

        <div className="bg-secondary p-4 sm:p-6 rounded-2xl space-y-3">
          <p className="text-primary font-semibold text-xs sm:text-sm">
            Exempel på vad du kan fråga:
          </p>
          <div className="text-primary text-xs sm:text-sm space-y-2 text-left">
            <p>"Jag har svårt att komma ihåg att ta mina mediciner"</p>
            <p>"Jag får ont i ryggen när jag städar"</p>
            <p>"Mitt barn har svårt att koncentrera sig på läxorna"</p>
          </div>
        </div>

        <Button
          onClick={onGetStarted}
          variant="default"
          className="px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg rounded-full"
        >
          KOM IGÅNG
        </Button>

        <p className="text-xs sm:text-sm text-slate-500 mt-4 sm:mt-6 px-2">
          Alla förslag granskas av legitimerade arbetsterapeuter
        </p>
      </div>
    </div>
  );
}
