import { transit_realtime as gtfs } from "gtfs-realtime-bindings";

export type ParsedFeed = {
  header: {
    gtfsVersion?: string;
    incrementality?: string;
    timestamp?: number;
  };
  summary: {
    vehicles: number;
    tripUpdates: number;
    alerts: number;
  };
  entities: gtfs.IFeedEntity[];
};

const toNumber = (value?: number | Long | null) => {
  if (value == null) return undefined;
  if (typeof value === "object" && typeof value.toNumber === "function") {
    return value.toNumber();
  }
  return Number(value);
};

export function parseGtfsRt(buffer: ArrayBuffer): ParsedFeed {
  const bytes = new Uint8Array(buffer);
  const decoded = gtfs.FeedMessage.decode(bytes);

  const vehicles = decoded.entity.filter((e) => e.vehicle).length;
  const tripUpdates = decoded.entity.filter((e) => e.tripUpdate).length;
  const alerts = decoded.entity.filter((e) => e.alert).length;

  return {
    header: {
      gtfsVersion: decoded.header.gtfsRealtimeVersion ?? undefined,
      incrementality: decoded.header.incrementality != null ? String(decoded.header.incrementality) : undefined,
      timestamp: toNumber(decoded.header.timestamp)
    },
    summary: { vehicles, tripUpdates, alerts },
    entities: decoded.entity
  };
}

export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

export function encodeGtfsRt(parsed: ParsedFeed): ArrayBuffer {
  const incrementality = parsed.header.incrementality === "FULL_DATASET" 
    ? gtfs.FeedHeader.Incrementality.FULL_DATASET 
    : gtfs.FeedHeader.Incrementality.DIFFERENTIAL;

  const header = gtfs.FeedHeader.create({
    gtfsRealtimeVersion: parsed.header.gtfsVersion ?? "2.0",
    incrementality,
    timestamp: parsed.header.timestamp
  });

  const feedMessage = gtfs.FeedMessage.create({
    header,
    entity: parsed.entities
  });

  const encoded = gtfs.FeedMessage.encode(feedMessage).finish();
  return encoded.buffer as ArrayBuffer;
}

