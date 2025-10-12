import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { OTAILogo } from "./WelcomeScreen";
import { ArrowLeft } from "lucide-react";
import type { user } from "../types/types";
import {
  saveUser,
  findUserByEmail,
  saveCurrentUser,
} from "../services/localStorage";

interface AuthScreenProps {
  onBack: () => void;
  onAuthSuccess: (user: user, accessToken: string) => void;
}

export function AuthScreen({ onBack, onAuthSuccess }: AuthScreenProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [userType, setUserType] = useState<"patient" | "provider">("patient");

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    // Note: Password is collected but not verified in this prototype
    // In a real app, you'd hash and verify passwords
    const name = formData.get("name") as string;

    try {
      const existingUser = findUserByEmail(email);
      if (existingUser) {
        throw new Error("En användare med denna e-post finns redan");
      }

      // Create new user
      const newUser: user = {
        id: crypto.randomUUID(),
        email,
        name,
        userType: userType,
      };

      saveUser(newUser);
      saveCurrentUser(newUser);

      // Generate a simple token (for consistency with old API)
      const token = `local_${newUser.id}_${Date.now()}`;

      onAuthSuccess(newUser, token);
    } catch (err) {
      console.error("Signup error:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Ett fel uppstod vid registrering";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    // Note: In a real app, you'd verify password. For this prototype, we skip it.

    try {
      // Find user by email
      const user = findUserByEmail(email);

      if (!user) {
        throw new Error("Användaren finns inte. Skapa ett konto först.");
      }

      // Save as current user
      saveCurrentUser(user);

      // Generate a simple token
      const token = `local_${user.id}_${Date.now()}`;

      onAuthSuccess(user, token);
    } catch (err) {
      console.error("Sign in error:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Fel e-post eller lösenord";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col p-4 sm:p-6 overflow-x-hidden">
      <Button
        variant="ghost"
        onClick={onBack}
        className="self-start mb-4 sm:mb-6"
      >
        <ArrowLeft className="mr-2 flex-shrink-0" />
        Tillbaka
      </Button>

      <div className="flex-1 flex items-center justify-center px-2">
        <div
          className="space-y-4 sm:space-y-6 container"
          style={{ maxWidth: "28rem" }}
        >
          <div className="text-center flex justify-center">
            <OTAILogo className="scale-[0.6] sm:scale-75" />
          </div>

          <Card className="border-0 shadow-xl">
            <CardHeader className="text-center pb-3 sm:pb-4 px-4 sm:px-6">
              <CardTitle className="text-primary text-xl sm:text-2xl font-bold">
                Välkommen till OTAI
              </CardTitle>
              <CardDescription className="text-sm">
                Logga in eller skapa ett konto för att komma igång
              </CardDescription>
            </CardHeader>

            <CardContent className="px-4 sm:px-6">
              <Tabs defaultValue="signin" className="w-full">
                <TabsList className="grid w-full grid-cols-2 h-9 sm:h-10">
                  <TabsTrigger value="signin" className="text-sm">
                    Logga in
                  </TabsTrigger>
                  <TabsTrigger value="signup" className="text-sm">
                    Skapa konto
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="signin" className="space-y-4">
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email">E-post</Label>
                      <Input
                        id="signin-email"
                        name="email"
                        type="email"
                        placeholder="din@email.se"
                        required
                        disabled={isLoading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signin-password">Lösenord</Label>
                      <Input
                        id="signin-password"
                        name="password"
                        type="password"
                        required
                        disabled={isLoading}
                      />
                    </div>

                    {error && (
                      <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                        {error}
                      </div>
                    )}

                    <Button
                      type="submit"
                      variant="default"
                      className="w-full rounded-full py-5 sm:py-6 text-sm sm:text-base"
                      disabled={isLoading}
                    >
                      {isLoading ? "Loggar in..." : "Logga in"}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup" className="space-y-4">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Namn</Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="Ditt namn"
                        required
                        disabled={isLoading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">E-post</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="din@email.se"
                        required
                        disabled={isLoading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Lösenord</Label>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="Minst 6 tecken"
                        required
                        minLength={6}
                        disabled={isLoading}
                      />
                    </div>

                    <div className="space-y-3">
                      <Label>Jag är en:</Label>
                      <RadioGroup
                        value={userType}
                        onValueChange={(value) =>
                          setUserType(value as "patient" | "provider")
                        }
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="patient" id="patient" />
                          <Label htmlFor="patient" className="cursor-pointer">
                            Patient/Brukare
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="provider" id="provider" />
                          <Label htmlFor="provider" className="cursor-pointer">
                            Vårdgivare
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {error && (
                      <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                        {error}
                      </div>
                    )}

                    <Button
                      type="submit"
                      variant="default"
                      className="w-full rounded-full py-5 sm:py-6 text-sm sm:text-base"
                      disabled={isLoading}
                    >
                      {isLoading ? "Skapar konto..." : "Skapa konto"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <p className="text-xs text-slate-500 text-center">
            Genom att använda OTAI godkänner du vår hantering av personuppgifter
            enligt GDPR
          </p>
        </div>
      </div>
    </div>
  );
}
