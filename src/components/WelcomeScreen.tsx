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
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
      <div className="text-center max-w-md mx-auto space-y-8">
        <div className="flex justify-center">
          <OTAILogo />
        </div>

        <div className="space-y-4">
          <h1 className="text-3xl text-[#213E35] font-bold">
            Hej! Jag är OTAI
          </h1>

          <p className="text-[#213E35] leading-relaxed text-base">
            Berätta gärna om dina utmaningar i vardagen, så hjälper jag dig med
            arbetsterapeutiska förslag och strategier.
          </p>
        </div>

        <div className="bg-[#F8E6EC] p-6 rounded-2xl space-y-3">
          <p className="text-[#213E35] font-semibold text-sm">
            Exempel på vad du kan fråga:
          </p>
          <div className="text-[#213E35] text-sm space-y-2 text-left">
            <p>"Jag har svårt att komma ihåg att ta mina mediciner"</p>
            <p>"Jag får ont i ryggen när jag städar"</p>
            <p>"Mitt barn har svårt att koncentrera sig på läxorna"</p>
          </div>
        </div>

        <Button
          onClick={onGetStarted}
          className="bg-[#213E35] hover:bg-[#2d5548] text-white px-8 py-6 text-lg rounded-full shadow-lg transition-all duration-200 hover:shadow-xl w-full"
        >
          KOM IGÅNG
        </Button>

        <p className="text-sm text-slate-500 mt-6">
          Alla förslag granskas av legitimerade arbetsterapeuter
        </p>
      </div>
    </div>
  );
}
