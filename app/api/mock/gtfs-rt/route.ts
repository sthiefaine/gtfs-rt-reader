import { NextRequest, NextResponse } from "next/server";
import { encodeGtfsRt, parseGtfsRt } from "@/lib/gtfs";

const mocks = new Map<string, ArrayBuffer>();

function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Paramètre 'id' requis" }, { status: 400 });
  }

  const buffer = mocks.get(id);
  if (!buffer) {
    return NextResponse.json({ error: `Aucun flux mock trouvé pour l'ID: ${id}` }, { status: 404 });
  }

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/x-protobuf",
      "Content-Disposition": `attachment; filename="gtfs-rt-mock-${id}.pb"`
    }
  });
}

export async function POST(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id") || generateId();

    const buffer = await request.arrayBuffer();
    mocks.set(id, buffer);

    const parsed = parseGtfsRt(buffer);
    const alerts = parsed.entities.filter((e) => e.alert);

    return NextResponse.json({
      success: true,
      message: "Flux mock enregistré",
      id,
      stats: {
        vehicles: parsed.summary.vehicles,
        trips: parsed.summary.tripUpdates,
        alerts: alerts.length
      }
    });
  } catch (error) {
    console.error("Error saving mock", error);
    return NextResponse.json({ error: "Erreur lors de l'enregistrement" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Paramètre 'id' requis" }, { status: 400 });
    }

    const deleted = mocks.delete(id);
    if (!deleted) {
      return NextResponse.json({ error: `Aucun flux mock trouvé pour l'ID: ${id}` }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Mock supprimé", id });
  } catch (error) {
    console.error("Error deleting mock", error);
    return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 });
  }
}

