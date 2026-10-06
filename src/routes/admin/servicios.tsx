import { createFileRoute } from "@tanstack/react-router";
import { AdminGuard, adminHead } from "@/components/admin/AdminGuard";
import { AdminPage } from "@/components/admin/AdminShell";
import { CollectionEditor } from "@/components/admin/CollectionEditor";

export const Route = createFileRoute("/admin/servicios")({
  ssr: false,
  head: adminHead("Servicios"),
  component: Page,
});

function Page() {
  return (
    <AdminGuard redirect="/admin/servicios">
      <AdminPage
        title="Servicios"
        description="Editá el nombre, la descripción, la duración y el precio de cada servicio. Podés ocultarlos sin borrarlos."
      >
        <CollectionEditor
          config={{
            table: "servicios",
            entityLabel: "servicio",
            activeField: "activo",
            titleField: "nombre",
            subtitleField: "descripcion",
            imageField: "imagen_url",
            emptyText: "Todavía no cargaste servicios.",
            defaults: {
              nombre: "",
              descripcion: "",
              duracion_minutos: 30,
              precio: null,
              precio_texto: "",
              imagen_url: null,
              imagen_alt: "",
              activo: true,
              destacado: false,
            },
            fields: [
              { name: "nombre", label: "Nombre", type: "text", required: true },
              { name: "descripcion", label: "Descripción", type: "textarea" },
              { name: "duracion_minutos", label: "Duración (minutos)", type: "number", min: 5, max: 480 },
              { name: "precio", label: "Precio", type: "number", min: 0, help: "Se muestra en pesos. Dejalo vacío si usás un texto libre." },
              { name: "precio_texto", label: "Precio (texto libre)", type: "text", placeholder: "Desde $12.000" },
              { name: "imagen_url", label: "Imagen", type: "image", bucket: "galeria" },
              { name: "imagen_alt", label: "Texto alternativo de la imagen", type: "text" },
            ],
          }}
        />
      </AdminPage>
    </AdminGuard>
  );
}
