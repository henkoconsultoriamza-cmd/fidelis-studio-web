import { createFileRoute } from "@tanstack/react-router";
import { AdminGuard, adminHead } from "@/components/admin/AdminGuard";
import { AdminPage } from "@/components/admin/AdminShell";
import { CollectionEditor } from "@/components/admin/CollectionEditor";

export const Route = createFileRoute("/admin/testimonios")({
  ssr: false,
  head: adminHead("Testimonios"),
  component: Page,
});

function Page() {
  return (
    <AdminGuard redirect="/admin/testimonios">
      <AdminPage
        title="Testimonios"
        description="Reseñas de clientes que se muestran en la web."
      >
        <CollectionEditor
          config={{
            table: "testimonios",
            entityLabel: "testimonio",
            activeField: "activo",
            titleField: "nombre_cliente",
            subtitleField: "texto",
            emptyText: "Todavía no cargaste testimonios.",
            defaults: {
              nombre_cliente: "",
              texto: "",
              calificacion: 5,
              fuente: "Google",
              activo: true,
            },
            fields: [
              { name: "nombre_cliente", label: "Nombre del cliente", type: "text", required: true },
              { name: "texto", label: "Reseña", type: "textarea", required: true },
              { name: "calificacion", label: "Estrellas (1 a 5)", type: "number", min: 1, max: 5 },
              { name: "fuente", label: "Fuente", type: "text", placeholder: "Google" },
            ],
          }}
        />
      </AdminPage>
    </AdminGuard>
  );
}
