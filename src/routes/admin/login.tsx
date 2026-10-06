import { useEffect, useMemo, useState } from "react";
import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { necesitaBootstrap, crearPrimerAdmin } from "@/lib/admin.functions";
import { cn } from "@/lib/utils";

const searchSchema = z.object({
  motivo: z.enum(["expirada", "sin-permisos"]).optional(),
  redirect: z
    .string()
    .optional()
    .refine((v) => !v || (v.startsWith("/admin") && !v.startsWith("//")), {
      message: "destino invÃ¡lido",
    }),
});

export const Route = createFileRoute("/admin/login")({
  ssr: false,
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Acceso al panel | Fidelis Studio" },
      {
        name: "description",
        content: "Ingreso privado al panel de administraciÃ³n de Fidelis Studio.",
      },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Acceso al panel | Fidelis Studio" },
      {
        property: "og:description",
        content: "Ingreso privado al panel de administraciÃ³n de Fidelis Studio.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LoginPage,
});

const inputClass =
  "w-full rounded-[4px] border border-border bg-surface px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-acid focus-visible:ring-2 focus-visible:ring-acid/40";

const buttonClass =
  "inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[4px] bg-acid px-5 text-xs font-medium tracking-[0.14em] uppercase text-background transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid/60 disabled:opacity-50";

type Modo = "login" | "recuperar" | "bootstrap";

function LoginPage() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/admin/login" });
  const bootstrapFn = useServerFn(necesitaBootstrap);
  const crearFn = useServerFn(crearPrimerAdmin);

  const bootstrap = useQuery({
    queryKey: ["admin-bootstrap"],
    queryFn: () => bootstrapFn(),
    staleTime: 60_000,
  });

  const [modo, setModo] = useState<Modo>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombre, setNombre] = useState("");
  const [verPass, setVerPass] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  const necesita = bootstrap.data?.necesita === true;

  useEffect(() => {
    if (necesita) setModo("bootstrap");
  }, [necesita]);

  // Si ya hay sesiÃ³n activa, no mostramos el login.
  useEffect(() => {
    let activo = true;
    supabase.auth.getSession().then(({ data }) => {
      if (activo && data.session) {
        void navigate({ to: search.redirect ?? "/admin", replace: true });
      }
    });
    return () => {
      activo = false;
    };
  }, [navigate, search.redirect]);

  const mensajeMotivo = useMemo(() => {
    if (search.motivo === "expirada") return "Tu sesiÃ³n venciÃ³ por inactividad. IngresÃ¡ de nuevo.";
    if (search.motivo === "sin-permisos")
      return "Tu cuenta no tiene permisos para el panel. ContactÃ¡ al administrador.";
    return null;
  }, [search.motivo]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setAviso(null);
    setEnviando(true);
    try {
      if (modo === "login") {
        const { error: err } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (err) {
          setError(
            err.message.toLowerCase().includes("invalid")
              ? "Email o contraseÃ±a incorrectos."
              : err.message,
          );
          return;
        }
        await navigate({ to: search.redirect ?? "/admin", replace: true });
        return;
      }

      if (modo === "recuperar") {
        const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${window.location.origin}/admin/reset-password`,
        });
        if (err) {
          setError(err.message);
          return;
        }
        setAviso("Si el email existe, te enviamos un enlace para restablecer la contraseÃ±a.");
        return;
      }

      // bootstrap
      if (password.length < 10) {
        setError("La contraseÃ±a debe tener al menos 10 caracteres.");
        return;
      }
      await crearFn({
        data: { email: email.trim(), password, nombre: nombre.trim() },
      });
      const { error: err } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (err) {
        setAviso("Cuenta creada. IngresÃ¡ con tus datos.");
        setModo("login");
        return;
      }
      await navigate({ to: "/admin", replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos procesar la solicitud.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-16 text-foreground">
      <div className="w-full max-w-md">
        <p className="label-tech text-muted-foreground">Fidelis Studio</p>
        <h1 className="mt-2 font-display text-[clamp(2rem,6vw,2.8rem)] leading-[0.95]">
          {modo === "bootstrap" ? (
            <>
              Crear admin<span className="text-acid">.</span>
            </>
          ) : modo === "recuperar" ? (
            <>
              Recuperar<span className="text-acid">.</span>
            </>
          ) : (
            <>
              Panel privado<span className="text-acid">.</span>
            </>
          )}
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {modo === "bootstrap"
            ? "No existe ninguna cuenta todavÃ­a. CreÃ¡ la primera cuenta de administraciÃ³n."
            : modo === "recuperar"
              ? "IngresÃ¡ tu email y te enviamos un enlace para crear una nueva contraseÃ±a."
              : "Acceso exclusivo para el equipo de la barberÃ­a."}
        </p>

        {mensajeMotivo ? (
          <p
            role="status"
            className="mt-6 rounded-[4px] border border-border bg-surface px-4 py-3 text-sm text-muted-foreground"
          >
            {mensajeMotivo}
          </p>
        ) : null}

        <form onSubmit={onSubmit} className="mt-8 space-y-4" noValidate>
          {modo === "bootstrap" ? (
            <div>
              <label htmlFor="nombre" className="label-tech text-muted-foreground">
                Nombre
              </label>
              <input
                id="nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                minLength={2}
                maxLength={80}
                autoComplete="name"
                className={cn(inputClass, "mt-2")}
              />
            </div>
          ) : null}

          <div>
            <label htmlFor="email" className="label-tech text-muted-foreground">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              maxLength={255}
              autoComplete="email"
              className={cn(inputClass, "mt-2")}
            />
          </div>

          {modo !== "recuperar" ? (
            <div>
              <label htmlFor="password" className="label-tech text-muted-foreground">
                ContraseÃ±a
              </label>
              <div className="relative mt-2">
                <input
                  id="password"
                  type={verPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={modo === "bootstrap" ? 10 : 6}
                  autoComplete={modo === "bootstrap" ? "new-password" : "current-password"}
                  className={cn(inputClass, "pr-12")}
                />
                <button
                  type="button"
                  onClick={() => setVerPass((v) => !v)}
                  aria-label={verPass ? "Ocultar contraseÃ±a" : "Mostrar contraseÃ±a"}
                  aria-pressed={verPass}
                  className="absolute right-1 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-[4px] text-muted-foreground transition-colors hover:text-acid focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid/60"
                >
                  {verPass ? (
                    <EyeOff className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Eye className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
              </div>
              {modo === "bootstrap" ? (
                <p className="mt-2 text-xs text-muted-foreground">MÃ­nimo 10 caracteres.</p>
              ) : null}
            </div>
          ) : null}

          {error ? (
            <p role="alert" className="text-sm text-red-400">
              {error}
            </p>
          ) : null}
          {aviso ? (
            <p role="status" className="text-sm text-acid">
              {aviso}
            </p>
          ) : null}

          <button type="submit" disabled={enviando} className={buttonClass}>
            {enviando ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
            {modo === "bootstrap"
              ? "Crear cuenta"
              : modo === "recuperar"
                ? "Enviar enlace"
                : "Ingresar"}
          </button>
        </form>

        {modo !== "bootstrap" ? (
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-xs">
            <button
              type="button"
              onClick={() => {
                setError(null);
                setAviso(null);
                setModo(modo === "recuperar" ? "login" : "recuperar");
              }}
              className="min-h-11 text-muted-foreground underline-offset-4 transition-colors hover:text-acid hover:underline"
            >
              {modo === "recuperar" ? "Volver al ingreso" : "Â¿Olvidaste tu contraseÃ±a?"}
            </button>
            <a
              href="/"
              className="min-h-11 text-muted-foreground underline-offset-4 transition-colors hover:text-acid hover:underline"
            >
              Ir a la web
            </a>
          </div>
        ) : null}
      </div>
    </main>
  );
}
