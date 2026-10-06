import { createFileRoute } from "@tanstack/react-router";
import { AdminGuard, adminHead } from "@/components/admin/AdminGuard";
import { AdminPage } from "@/components/admin/AdminShell";
import { CollectionEditor } from "@/components/admin/CollectionEditor";

export const Route = createFileRoute("/admin/promociones")({
  ssr: false,
  head: adminHead("Promociones"),
  component: Page,
});

function Page() {
  return (
    <AdminGuard redirect="/admin/promociones">
      <AdminPage
        title="Promociones"
        description="Promos y combos que aparecen en la web. Ocultá las que no estén vigentes."
      >
        <CollectionEditor
          config={{
            table: "promociones",
            entityLabel: "promoción",
            activeField: "activa",
            titleField: "titulo",
            subtitleField: "descripcion",
            imageField: "imagen_url",
            emptyText: "Todavía no cargaste promociones.",
            defaults: {
              titulo: "",
              descripcion: "",
              precio_promocional: null,
              texto_boton: "Reservar",
              enlace_boton: "",
              imagen_url: null,
              activa: true,
            },
            fields: [
              { name: "titulo", label: "Título", type: "text", required: true },
              { name: "descripcion", label: "Descripción", type: "textarea" },
              { name: "precio_promocional", label: "Precio promocional", type: "number", min: 0 },
              { name: "texto_boton", label: "Texto del botón", type: "text" },
              { name: "enlace_boton", label: "Link del botón", type: "text", placeholder: "https://..." },
              { name: "imagen_url", label: "Imagen", type: "image", bucket: "promociones" },
            ],
          }}
        />
      </AdminPage>
    </AdminGuard>
  );
}
