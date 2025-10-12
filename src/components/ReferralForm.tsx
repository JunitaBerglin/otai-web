import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Checkbox } from "./ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";
import { CheckCircle, AlertCircle, ArrowRight, ArrowLeft } from "lucide-react";
import type {
  ReferralForm as ReferralFormType,
  ReferralUrgency,
  user,
  message,
} from "../types/types";

interface ReferralFormProps {
  user: user;
  conversationMessages: message[];
  onSubmit: (referral: ReferralFormType) => Promise<void>;
  onCancel: () => void;
}

export function ReferralForm({
  user,
  conversationMessages,
  onSubmit,
  onCancel,
}: ReferralFormProps) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [formData, setFormData] = useState<Partial<ReferralFormType>>({
    patientInfo: {
      name: user.name,
      email: user.email,
      phone: "",
    },
    challenges: {
      primary: "",
      secondary: [],
      impact: "",
    },
    needs: {
      physicalAids: false,
      homeVisit: false,
      workplaceVisit: false,
      followUp: false,
    },
    urgency: "medium",
    consentGiven: false,
  });

  const totalSteps = 5;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    if (!formData.consentGiven) {
      setError(
        "Du måste godkänna behandling av personuppgifter för att skicka remissen."
      );
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      // Generate conversation summary
      const conversationSummary = {
        messageCount: conversationMessages.length,
        mainTopics: extractMainTopics(conversationMessages),
        aiSuggestionsTried: extractSuggestions(conversationMessages),
        conversationText: conversationMessages
          .map(
            (msg) =>
              `${msg.role === "assistant" ? "OTAI" : user.name}: ${msg.content}`
          )
          .join("\n\n"),
      };

      const referral: ReferralFormType = {
        id: crypto.randomUUID(),
        userId: user.id,
        createdAt: new Date().toISOString(),
        status: "draft",
        patientInfo: formData.patientInfo!,
        challenges: formData.challenges!,
        conversationSummary,
        needs: formData.needs!,
        urgency: formData.urgency!,
        urgencyReason: formData.urgencyReason,
        additionalNotes: formData.additionalNotes,
        consentGiven: formData.consentGiven!,
        consentTimestamp: new Date().toISOString(),
      };

      await onSubmit(referral);
    } catch (err) {
      console.error("Error submitting referral:", err);
      setError("Ett fel uppstod när remissen skulle skickas. Försök igen.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const extractMainTopics = (messages: message[]): string[] => {
    // Simple extraction - you can make this more sophisticated
    const topics = new Set<string>();
    messages.forEach((msg) => {
      if (msg.content.includes("medicin")) topics.add("Medicinhantering");
      if (msg.content.includes("smärta") || msg.content.includes("ont"))
        topics.add("Smärthantering");
      if (msg.content.includes("städ") || msg.content.includes("hushåll"))
        topics.add("Hushållsaktiviteter");
      if (
        msg.content.includes("koncentration") ||
        msg.content.includes("minne")
      )
        topics.add("Kognitiva svårigheter");
      if (msg.content.includes("ergonomi") || msg.content.includes("arbete"))
        topics.add("Arbetsmiljö");
    });
    return Array.from(topics);
  };

  const extractSuggestions = (messages: message[]): string[] => {
    // Extract AI suggestions that were given
    return messages
      .filter((msg) => msg.role === "assistant")
      .flatMap((msg) => {
        const suggestions: string[] = [];
        if (msg.content.includes("rutiner")) suggestions.push("Skapa rutiner");
        if (msg.content.includes("påminnelse"))
          suggestions.push("Använda påminnelser");
        if (msg.content.includes("anpassning"))
          suggestions.push("Miljöanpassningar");
        if (msg.content.includes("pauser"))
          suggestions.push("Ta regelbundna pauser");
        return suggestions;
      });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <Card className="w-full max-w-2xl my-8">
        <CardHeader>
          <CardTitle className="text-primary text-xl sm:text-2xl">
            Remiss till Legitimerad Arbetsterapeut
          </CardTitle>
          <CardDescription>
            Steg {step} av {totalSteps}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Step 1: Personal Information */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-primary">
                Dina Kontaktuppgifter
              </h3>

              <div className="space-y-2">
                <Label htmlFor="name">Namn *</Label>
                <Input
                  id="name"
                  value={formData.patientInfo?.name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      patientInfo: {
                        ...formData.patientInfo!,
                        name: e.target.value,
                      },
                    })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-post *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.patientInfo?.email}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      patientInfo: {
                        ...formData.patientInfo!,
                        email: e.target.value,
                      },
                    })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefonnummer *</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="070-123 45 67"
                  value={formData.patientInfo?.phone}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      patientInfo: {
                        ...formData.patientInfo!,
                        phone: e.target.value,
                      },
                    })
                  }
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age">Ålder (valfritt)</Label>
                  <Input
                    id="age"
                    type="number"
                    value={formData.patientInfo?.age || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        patientInfo: {
                          ...formData.patientInfo!,
                          age: parseInt(e.target.value),
                        },
                      })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Adress (valfritt, för hembesök)</Label>
                <Input
                  id="address"
                  value={formData.patientInfo?.address || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      patientInfo: {
                        ...formData.patientInfo!,
                        address: e.target.value,
                      },
                    })
                  }
                />
              </div>
            </div>
          )}

          {/* Step 2: Main Challenges */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-primary">
                Beskriv Dina Utmaningar
              </h3>

              <div className="space-y-2">
                <Label htmlFor="primary">Huvudsaklig utmaning *</Label>
                <Textarea
                  id="primary"
                  placeholder="T.ex. 'Jag har svårt att komma ihåg att ta mina mediciner varje dag...'"
                  value={formData.challenges?.primary}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      challenges: {
                        ...formData.challenges!,
                        primary: e.target.value,
                      },
                    })
                  }
                  rows={4}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">
                  Hur länge har detta varit ett problem?
                </Label>
                <Input
                  id="duration"
                  placeholder="T.ex. '3 månader', '1 år'"
                  value={formData.challenges?.duration || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      challenges: {
                        ...formData.challenges!,
                        duration: e.target.value,
                      },
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="impact">Hur påverkar detta din vardag? *</Label>
                <Textarea
                  id="impact"
                  placeholder="T.ex. 'Jag missar medicindoser och får då mer smärta...'"
                  value={formData.challenges?.impact}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      challenges: {
                        ...formData.challenges!,
                        impact: e.target.value,
                      },
                    })
                  }
                  rows={3}
                  required
                />
              </div>
            </div>
          )}

          {/* Step 3: Specific Needs */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-primary">
                Vad Behöver Du Hjälp Med?
              </h3>
              <p className="text-sm text-slate-600">Välj alla som stämmer</p>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="physicalAids"
                    checked={formData.needs?.physicalAids}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        needs: {
                          ...formData.needs!,
                          physicalAids: checked as boolean,
                        },
                      })
                    }
                  />
                  <Label
                    htmlFor="physicalAids"
                    className="font-normal cursor-pointer"
                  >
                    Fysiska hjälpmedel (t.ex. rollator, greppstöd, tekniska
                    hjälpmedel)
                  </Label>
                </div>

                {formData.needs?.physicalAids && (
                  <div className="ml-6 space-y-2">
                    <Label htmlFor="aidsList" className="text-sm">
                      Vilka hjälpmedel?
                    </Label>
                    <Textarea
                      id="aidsList"
                      placeholder="Beskriv vilka hjälpmedel du tror att du behöver..."
                      value={formData.needs?.physicalAidsList?.join(", ") || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          needs: {
                            ...formData.needs!,
                            physicalAidsList: e.target.value
                              .split(",")
                              .map((s) => s.trim()),
                          },
                        })
                      }
                      rows={2}
                    />
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="homeVisit"
                    checked={formData.needs?.homeVisit}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        needs: {
                          ...formData.needs!,
                          homeVisit: checked as boolean,
                        },
                      })
                    }
                  />
                  <Label
                    htmlFor="homeVisit"
                    className="font-normal cursor-pointer"
                  >
                    Hembesök för bedömning av bostaden
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="workplaceVisit"
                    checked={formData.needs?.workplaceVisit}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        needs: {
                          ...formData.needs!,
                          workplaceVisit: checked as boolean,
                        },
                      })
                    }
                  />
                  <Label
                    htmlFor="workplaceVisit"
                    className="font-normal cursor-pointer"
                  >
                    Arbetsplatsbesök för ergonomisk bedömning
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="followUp"
                    checked={formData.needs?.followUp}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        needs: {
                          ...formData.needs!,
                          followUp: checked as boolean,
                        },
                      })
                    }
                  />
                  <Label
                    htmlFor="followUp"
                    className="font-normal cursor-pointer"
                  >
                    Kontinuerlig uppföljning och stöd
                  </Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="otherNeeds">Annat behov?</Label>
                  <Textarea
                    id="otherNeeds"
                    placeholder="Beskriv andra behov..."
                    value={formData.needs?.other || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        needs: { ...formData.needs!, other: e.target.value },
                      })
                    }
                    rows={2}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Urgency */}
          {step === 4 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-primary">
                Hur Brådskande Är Detta?
              </h3>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="low"
                    name="urgency"
                    value="low"
                    checked={formData.urgency === "low"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        urgency: e.target.value as ReferralUrgency,
                      })
                    }
                    className="w-4 h-4"
                  />
                  <Label htmlFor="low" className="font-normal cursor-pointer">
                    <strong>Låg brådskande</strong> - Kan vänta 2-4 veckor
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="medium"
                    name="urgency"
                    value="medium"
                    checked={formData.urgency === "medium"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        urgency: e.target.value as ReferralUrgency,
                      })
                    }
                    className="w-4 h-4"
                  />
                  <Label
                    htmlFor="medium"
                    className="font-normal cursor-pointer"
                  >
                    <strong>Medel brådskande</strong> - Önskar kontakt inom 1-2
                    veckor
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="high"
                    name="urgency"
                    value="high"
                    checked={formData.urgency === "high"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        urgency: e.target.value as ReferralUrgency,
                      })
                    }
                    className="w-4 h-4"
                  />
                  <Label htmlFor="high" className="font-normal cursor-pointer">
                    <strong>Hög brådskande</strong> - Behöver kontakt inom några
                    dagar
                  </Label>
                </div>
              </div>

              {formData.urgency === "high" && (
                <div className="space-y-2">
                  <Label htmlFor="urgencyReason">
                    Varför är detta brådskande?
                  </Label>
                  <Textarea
                    id="urgencyReason"
                    placeholder="Förklara varför du behöver snabb hjälp..."
                    value={formData.urgencyReason || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        urgencyReason: e.target.value,
                      })
                    }
                    rows={3}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="notes">Övriga kommentarer</Label>
                <Textarea
                  id="notes"
                  placeholder="Något mer du vill att arbetsterapeuten ska veta..."
                  value={formData.additionalNotes || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      additionalNotes: e.target.value,
                    })
                  }
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* Step 5: Consent and Submit */}
          {step === 5 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-primary">Granska och Skicka</h3>

              <Alert className="border-blue-200 bg-blue-50">
                <CheckCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  Din remiss kommer att skickas till vårt team av legitimerade
                  arbetsterapeuter som kommer att kontakta dig.
                </AlertDescription>
              </Alert>

              <Card className="bg-slate-50">
                <CardContent className="pt-4 space-y-3 text-sm">
                  <div>
                    <strong>Kontakt:</strong> {formData.patientInfo?.name} (
                    {formData.patientInfo?.phone})
                  </div>
                  <div>
                    <strong>Huvudutmaning:</strong>{" "}
                    {formData.challenges?.primary?.substring(0, 100)}...
                  </div>
                  <div>
                    <strong>Brådskande:</strong>{" "}
                    {formData.urgency === "high"
                      ? "Hög"
                      : formData.urgency === "medium"
                      ? "Medel"
                      : "Låg"}
                  </div>
                  <div>
                    <strong>Konversation med OTAI:</strong>{" "}
                    {conversationMessages.length} meddelanden
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-4 border-t pt-4">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="consent"
                    checked={formData.consentGiven}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        consentGiven: checked as boolean,
                      })
                    }
                  />
                  <Label
                    htmlFor="consent"
                    className="font-normal cursor-pointer text-sm"
                  >
                    Jag samtycker till att mina personuppgifter och konversation
                    med OTAI delas med legitimerade arbetsterapeuter för
                    bedömning och behandling. Uppgifterna hanteras enligt GDPR
                    och kommer att raderas när ärendet är avslutat.
                  </Label>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={step === 1 ? onCancel : handleBack}
              disabled={isSubmitting}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {step === 1 ? "Avbryt" : "Tillbaka"}
            </Button>

            {step < totalSteps ? (
              <Button onClick={handleNext}>
                Nästa
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!formData.consentGiven || isSubmitting}
              >
                {isSubmitting ? "Skickar..." : "Skicka Remiss"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
