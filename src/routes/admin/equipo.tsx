import { createFileRoute } from "@tanstack/react-router";
import { AdminGuard, adminHead } from "@/components/admin/AdminGuard";
import { AdminPage } from "@/components/admin/AdminShell";
import { CollectionEditor } from "@/components/admin/CollectionEditor";

export const Route = createFileRoute("/admin/equipo")({
  ssr: false,
  head: adminHead("Equipo"),
  component: Page,
});

function Page() {
  return (
    <AdminGuard redirect="/admin/equipo">
      <AdminPage
        title="Equipo"
        description="Cargá a los barberos con su foto, cargo y redes. El orden del listado es el que se ve en la web."
      >
        <CollectionEditor
          config={{
            table: "equipo",
            entityLabel: "integrante",
            activeField: "activo",
            titleField: "nombre",
            subtitleField: "cargo",
            imageField: "foto_url",
            emptyText: "Todavía no cargaste integrantes del equipo.",
            defaults: {
              nombre: "",
              cargo: "",
              especialidad: "",
              descripcion: "",
              foto_url: null,
              foto_alt: "",
              instagram_url: "",
              instagram_handle: "",
              activo: true,
            },
            fields: [
              { name: "nombre", label: "Nombre", type: "text", required: true },
              { name: "cargo", label: "Cargo", type: "text", placeholder: "Master barber" },
              { name: "especialidad", label: "Especialidad", type: "text" },
              { name: "descripcion", label: "Bio", type: "textarea" },
              { name: "foto_url", label: "Foto", type: "image", bucket: "equipo" },
              { name: "foto_alt", label: "Texto alternativo de la foto", type: "text" },
              { name: "instagram_handle", label: "Usuario de Instagram", type: "text", placeholder: "@mateo" },
              { name: "instagram_url", label: "Link de Instagram", type: "text", placeholder: "https://instagram.com/..." },
            ],
          }}
        />
      </AdminPage>
    </AdminGuard>
  );
}
