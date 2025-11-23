"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { signIn, signUp, useSession } from "../../lib/auth-client";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);

  const sessionResult = useSession();
  const session =
    (sessionResult?.data as { user?: { id: string } } | null) ?? null;
  const isPending = sessionResult?.isPending ?? false;

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleEmailAuth = async () => {
    try {
      setLoading(true);
      setError(null);

      if (isSignUp) {
        const result = await signUp.email({
          email,
          password,
          name: email.split("@")[0],
        });

        if (result.error) {
          throw new Error(result.error.message || "Error al registrar usuario");
        }

        await signIn.email({
          email,
          password,
        });
      } else {
        const result = await signIn.email({
          email,
          password,
        });

        if (result.error) {
          throw new Error(result.error.message || "Error al iniciar sesión");
        }
      }

      await new Promise((resolve) => setTimeout(resolve, 500));
      router.push("/");
    } catch (err) {
      console.error("Auth error:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : typeof err === "object" && err !== null && "message" in err
          ? String(err.message)
          : "Error al autenticar";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <Image
              src="/meditrack-logo.png"
              alt="MediTrack"
              width={180}
              height={50}
              priority
              className="h-12 w-auto"
            />
          </div>
          <CardTitle className="text-2xl">Bienvenido a MediTrack</CardTitle>
          <CardDescription>
            Inicia sesión para acceder a tus registros médicos y línea de tiempo
            de salud
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
            <Button
              onClick={handleEmailAuth}
              className="w-full"
              disabled={loading || !email || !password}
            >
              {loading
                ? "Cargando..."
                : isSignUp
                ? "Registrarse"
                : "Iniciar sesión"}
            </Button>
            <Button
              variant="ghost"
              onClick={() => setIsSignUp(!isSignUp)}
              className="w-full text-sm"
            >
              {isSignUp
                ? "¿Ya tienes una cuenta? Inicia sesión"
                : "¿No tienes una cuenta? Regístrate"}
            </Button>
          </div>

          <div className="text-center text-sm text-gray-500">
            Al iniciar sesión, aceptas nuestros Términos de Servicio y Política
            de Privacidad
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
