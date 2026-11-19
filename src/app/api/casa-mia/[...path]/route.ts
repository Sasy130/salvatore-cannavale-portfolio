import { after } from "next/server";
import { bookingEnvironment } from "@/features/casa-mia/server/database";
import { handleAPI } from "@/features/casa-mia/server/api.mjs";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;
async function dispatch(request: Request) {
  const env = { ...bookingEnvironment(), BACKGROUND: after },
    path = new URL(request.url).pathname;
  const requested = process.env.CASA_MIA_ENABLE_BOOKING === "true";
  const configured = !!env.DB && (env.ADMIN_PASSWORD?.length ?? 0) >= 12;
  let ready = false;
  if (requested && configured) {
    try {
      const result = await env
        .DB!.prepare("SELECT version FROM schema_migrations WHERE version=5")
        .all();
      ready = result.results.length === 1;
    } catch {}
  }
  if (path === "/api/casa-mia/status") {
    return Response.json(
      {
        configured,
        enabled: requested && configured && ready,
        unavailable: requested && !ready,
        paymentMode: "test",
        app: "DIMORA MIA",
        schemaVersion: 5,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  }
  if (!requested || !configured || !ready)
    return Response.json(
      {
        error:
          "Il servizio condiviso non è ancora configurato. La demo del portfolio rimane una simulazione locale.",
      },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  try {
    return await handleAPI(request, env);
  } catch {
    return Response.json(
      { error: "Servizio temporaneamente non disponibile. Riprova tra poco." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
export const GET = dispatch;
export const POST = dispatch;
