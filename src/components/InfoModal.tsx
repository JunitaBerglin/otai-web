import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { ScrollArea } from "./ui/scroll-area";

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InfoModal({ isOpen, onClose }: InfoModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] !bg-white border-2 border-primary/10 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-primary text-2xl font-bold">
            Välkommen till OTAI – Occupational Therapist AI
          </DialogTitle>
          <DialogDescription className="text-base text-primary/80 italic">
            Din väg till ett fungerande vardagsliv börjar här.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6 text-primary">
            <p className="leading-relaxed">
              Vi tror på en värld där varje människa får möjlighet att vara sig
              själv fullt ut – oavsett funktionsvariation, behov eller
              förutsättningar. Där anpassningar sker efter individen, inte
              tvärtom. OTAI är skapat med den övertygelsen som grund.
            </p>

            <div className="space-y-5">
              <div className="space-y-2">
                <h3 className="font-semibold text-lg flex items-start gap-2">
                  <span className="text-xl">👤</span>
                  <span>Individanpassat stöd direkt i appen</span>
                </h3>
                <p className="leading-relaxed ml-7">
                  Du inleder med en chatt där vår AI – OTAI – lyssnar, ställer
                  frågor och samlar in viktig information om din situation.
                  Utifrån detta får du arbetsterapeutiska råd, strategier och
                  verktyg – direkt i din hand.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-lg flex items-start gap-2">
                  <span className="text-xl">🧠</span>
                  <span>
                    Tillgång till legitimerad arbetsterapeut – vid behov
                  </span>
                </h3>
                <p className="leading-relaxed ml-7">
                  Behövs mer än vad AI kan erbjuda, skapas en färdig remiss till
                  våra legitimerade arbetsterapeuter. Vi arbetar digitalt och
                  finns här för att ge dig det stöd som kräver mänsklig
                  expertis.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-lg flex items-start gap-2">
                  <span className="text-xl">🌍</span>
                  <span>Till för alla</span>
                </h3>
                <p className="leading-relaxed ml-7">
                  OTAI är till för dig – oavsett om du är förälder till ett barn
                  som behöver stöd i skolan, personal på ett äldreboende som
                  vill få vägledning, eller individ som vill få struktur i sin
                  vardag. Alla har rätt att leva ett liv anpassat efter sina
                  egna behov.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-lg flex items-start gap-2">
                  <span className="text-xl">📉</span>
                  <span>Vi kortar väntetiderna – och stärker vardagen</span>
                </h3>
                <p className="leading-relaxed ml-7">
                  I en tid där köer inom arbetsterapi kan vara över ett år
                  långa, erbjuder OTAI en ny lösning. Vi gör arbetsterapi
                  tillgänglig – för fler, snabbare.
                </p>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
