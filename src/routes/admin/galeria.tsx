import { createFileRoute } from "@tanstack/react-router";
import { AdminGuard, adminHead } from "@/components/admin/AdminGuard";
import { AdminPage } from "@/components/admin/AdminShell";
import { CollectionEditor } from "@/components/admin/CollectionEditor";

export const Route = createFileRoute("/admin/galeria")({
  ssr: false,
  head: adminHead("Galería"),
  component: Page,
});

function Page() {
  return (
    <AdminGuard redirect="/admin/galeria">
      <AdminPage
        title="Galería"
        description="Subí fotos del local y de los trabajos. Recomendado: imágenes de menos de 2 MB."
      >
        <CollectionEditor
          config={{
            table: "galeria",
            entityLabel: "foto",
            activeField: "activo",
            titleField: "texto_alt",
            subtitleField: "categoria",
            imageField: "imagen_url",
            emptyText: "Todavía no cargaste fotos.",
            defaults: {
              imagen_url: null,
              texto_alt: "",
              categoria: "warm",
              activo: true,
              destacado: false,
            },
            fields: [
              { name: "imagen_url", label: "Imagen", type: "image", bucket: "galeria" },
              { name: "texto_alt", label: "Descripción / texto alternativo", type: "text", required: true },
              {
                name: "categoria",
                label: "Estilo",
                type: "select",
                options: [
                  { value: "warm", label: "Color cálido" },
                  { value: "bw", label: "Blanco y negro" },
                ],
              },
            ],
          }}
        />
      </AdminPage>
    </AdminGuard>
  );
}
