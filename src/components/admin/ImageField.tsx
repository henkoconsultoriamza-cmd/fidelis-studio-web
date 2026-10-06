import { useRef, useState } from "react";
import { Loader2, Upload, X } from "lucide-react";
import { subirImagen } from "@/lib/admin-data";
import { resolveImageUrl } from "@/lib/media";

export function ImageField({
  label,
  bucket,
  barberiaId,
  value,
  onChange,
  help,
}: {
  label: string;
  bucket: string;
  barberiaId: string | null;
  value: string | null;
  onChange: (value: string | null) => void;
  help?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const preview = resolveImageUrl(value);

  async function handleFile(file: File) {
    setError(null);
    if (!barberiaId) {
      setError("No se pudo identificar la barbería.");
      return;
    }
    if (!file.type.startsWith("image/")) {
      setError("El archivo debe ser una imagen.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("La imagen no puede superar los 5 MB.");
      return;
    }
    setUploading(true);
    try {
      onChange(await subirImagen(bucket, barberiaId, file));
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo subir la imagen.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <span className="label-tech">{label}</span>
      <div className="mt-2 flex items-start gap-4">
        <div className="h-24 w-24 shrink-0 overflow-hidden rounded-[4px] border border-border bg-surface">
          {preview ? (
            <img src={preview} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-[0.6rem] tracking-widest text-muted-foreground uppercase">
              Sin foto
            </span>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleFile(file);
              e.target.value = "";
            }}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="inline-flex min-h-11 items-center gap-2 rounded-[4px] border border-border px-4 text-xs tracking-[0.12em] uppercase transition-colors hover:border-acid hover:text-acid disabled:opacity-60"
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Upload className="h-4 w-4" aria-hidden="true" />
            )}
            {uploading ? "Subiendo…" : "Subir imagen"}
          </button>
          {value ? (
            <button
              type="button"
              onClick={() => onChange(null)}
              className="inline-flex min-h-11 items-center gap-2 text-xs tracking-[0.12em] text-muted-foreground uppercase hover:text-foreground"
            >
              <X className="h-4 w-4" aria-hidden="true" /> Quitar
            </button>
          ) : null}
          {help ? <p className="max-w-xs text-xs text-muted-foreground">{help}</p> : null}
          {error ? <p className="text-xs text-red-400">{error}</p> : null}
        </div>
      </div>
    </div>
  );
}