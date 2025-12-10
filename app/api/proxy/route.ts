import { NextRequest, NextResponse } from "next/server";

// Configuration pour s'assurer que la route fonctionne en production
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "Paramètre 'url' requis" }, { status: 400 });
  }

  try {
    // Valider que l'URL est bien formée
    let targetUrl: URL;
    try {
      targetUrl = new URL(url);
    } catch (urlError) {
      return NextResponse.json(
        { error: `URL invalide: ${url}` },
        { status: 400 }
      );
    }
    
    // Optionnel : restreindre aux domaines autorisés pour la sécurité
    // const allowedDomains = ['app.pysae.com', 'example.com'];
    // if (!allowedDomains.some(domain => targetUrl.hostname.endsWith(domain))) {
    //   return NextResponse.json({ error: "Domaine non autorisé" }, { status: 403 });
    // }

    console.log(`[Proxy] Fetching: ${url}`);
    
    // Créer un AbortController pour le timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    
    try {
      const response = await fetch(url, {
        cache: "no-cache",
        headers: {
          "User-Agent": "GTFS-RT-Reader/1.0",
          "Accept": "application/x-protobuf, application/octet-stream, */*",
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text().catch(() => response.statusText);
        console.error(`[Proxy] HTTP ${response.status} from ${url}: ${errorText}`);
        return NextResponse.json(
          { error: `HTTP ${response.status}: ${response.statusText}`, details: errorText.substring(0, 200) },
          { status: response.status }
        );
      }

      const buffer = await response.arrayBuffer();
      console.log(`[Proxy] Success: ${url} (${buffer.byteLength} bytes)`);

      return new NextResponse(buffer, {
        headers: {
          "Content-Type": response.headers.get("Content-Type") || "application/x-protobuf",
          "Cache-Control": "no-cache",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (fetchError) {
      clearTimeout(timeoutId);
      throw fetchError;
    }
  } catch (error) {
    console.error("[Proxy] Fetch error:", error);
    let message = "Erreur lors de la récupération du flux";
    
    if (error instanceof TypeError && error.message.includes("fetch")) {
      message = "Impossible de se connecter au serveur (vérifiez l'URL et votre connexion)";
    } else if (error instanceof Error) {
      if (error.name === "AbortError" || error.message.includes("timeout")) {
        message = "Timeout: le serveur met trop de temps à répondre";
      } else {
        message = error.message;
      }
    }
    
    return NextResponse.json(
      { error: message, details: error instanceof Error ? error.stack : String(error) },
      { status: 500 }
    );
  }
}
