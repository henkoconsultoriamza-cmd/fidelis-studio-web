import { createFileRoute } from "@tanstack/react-router";
import { IMAGE_BUCKETS } from "@/lib/media";

export const Route = createFileRoute("/api-publico-imagen/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const splat = (params as { _splat?: string })._splat ?? "";
        const [bucket, ...rest] = splat.split("/");
        const path = rest.join("/");

        if (!bucket || !path || path.includes("..")) {
          return new Response("Not found", { status: 404 });
        }
        if (!(IMAGE_BUCKETS as readonly string[]).includes(bucket)) {
          return new Response("Not found", { status: 404 });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data, error } = await supabaseAdmin.storage.from(bucket).download(path);
        if (error || !data) return new Response("Not found", { status: 404 });

        return new Response(await data.arrayBuffer(), {
          headers: {
            "content-type": data.type || "application/octet-stream",
            "cache-control": "public, max-age=300, s-maxage=86400, stale-while-revalidate=604800",
          },
        });
      },
    },
  },
});