import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/reset-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Nueva contraseÃ±a | Fidelis Studio" },
      {
        name: "description",
        content: "DefinÃ­ una nueva contraseÃ±a para el panel de Fidelis Studio.",
      },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Nueva contraseÃ±a | Fidelis Studio" },
      {
        property: "og:description",
        content: "DefinÃ­ una nueva contraseÃ±a para el panel de Fidelis Studio.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResetPasswordPage,
});

const inputClass =
  "w-full rounded-[4px] border border-border bg-surface px-4 py-3 pr-12 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-acid focus-visible:ring-2 focus-visible:ring-acid/40";

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [listo, setListo] = useState(false);
  const [password, setPassword] = useState("");
  const [ver, setVer] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) setListo(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setListo(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 10) {
      setError("La contraseÃ±a debe tener al menos 10 caracteres.");
      return;
    }
    setEnviando(true);
    const { error: err } = await supabase.auth.updateUser({ password });
    setEnviando(false);
    if (err) {
      setError(err.message);
      return;
    }
    setOk(true);
    setTimeout(() => void navigate({ to: "/admin", replace: true }), 1200);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-16 text-foreground">
      <div className="w-full max-w-md">
        <p className="label-tech text-muted-foreground">Fidelis Studio</p>
        <h1 className="mt-2 font-display text-[clamp(2rem,6vw,2.8rem)] leading-[0.95]">
          Nueva contraseÃ±a<span className="text-acid">.</span>
        </h1>

        {!listo ? (
          <p className="mt-6 text-sm text-muted-foreground">
            AbrÃ­ esta pÃ¡gina desde el enlace que te enviamos por email. Si el enlace venciÃ³,{" "}
            <a href="/admin/login" className="text-acid underline-offset-4 hover:underline">
              pedÃ­ uno nuevo
            </a>
            .
          </p>
        ) : (
          <form onSubmit={onSubmit} className="mt-8 space-y-4" noValidate>
            <div>
              <label htmlFor="new-password" className="label-tech text-muted-foreground">
                ContraseÃ±a nueva
              </label>
              <div className="relative mt-2">
                <input
                  id="new-password"
                  type={ver ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={10}
                  autoComplete="new-password"
                  className={cn(inputClass)}
                />
                <button
                  type="button"
                  onClick={() => setVer((v) => !v)}
                  aria-label={ver ? "Ocultar contraseÃ±a" : "Mostrar contraseÃ±a"}
                  aria-pressed={ver}
                  className="absolute right-1 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-[4px] text-muted-foreground transition-colors hover:text-acid focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid/60"
                >
                  {ver ? (
                    <EyeOff className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Eye className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">MÃ­nimo 10 caracteres.</p>
            </div>

            {error ? (
              <p role="alert" className="text-sm text-red-400">
                {error}
              </p>
            ) : null}
            {ok ? (
              <p role="status" className="text-sm text-acid">
                ContraseÃ±a actualizada. Entrando al panelâ€¦
              </p>
            ) : null}

            <button
              type="submit"
              disabled={enviando}
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[4px] bg-acid px-5 text-xs font-medium tracking-[0.14em] uppercase text-background transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid/60 disabled:opacity-50"
            >
              {enviando ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
              Guardar contraseÃ±a
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
