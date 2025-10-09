import { Button } from "./ui/button";

export function OTAILogo({ className = "" }: { className?: string }) {
  return (
    <svg 
      width="200" 
      height="250" 
      viewBox="0 0 200 250" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Yttre mörkgrön cirkel */}
      <circle cx="100" cy="80" r="50" fill="none" stroke="#1C3D32" strokeWidth="8"/>
      
      {/* Inre ljusrosa cirkel */}
      <circle cx="100" cy="80" r="20" fill="#F9E6EC"/>
      
      {/* Text: OTAI */}
      <text 
        x="50%" 
        y="200" 
        textAnchor="middle" 
        fontFamily="Noto Sans, Arial, sans-serif" 
        fontSize="40" 
        fill="#1C3D32" 
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col items-center justify-center p-6">
      <div className="text-center max-w-md mx-auto space-y-8">
        <OTAILogo className="mx-auto" />
        
        <div className="space-y-4">
          <h1 className="text-2xl text-[#1C3D32] font-semibold">
            Beslutsstöd som sätter dig i centrum
          </h1>
          
          <p className="text-slate-600 leading-relaxed">
            OTAI hjälper dig att få arbetsterapeutisk bedömning och stöd för dina vardagsutmaningar. 
            Beskriv dina behov så ger vi dig personliga förslag och strategier.
          </p>
        </div>
        
        <Button 
          onClick={onGetStarted}
          className="bg-[#1C3D32] hover:bg-[#2A5A47] text-white px-8 py-6 text-lg rounded-xl shadow-lg transition-all duration-200 hover:shadow-xl transform hover:-translate-y-1"
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