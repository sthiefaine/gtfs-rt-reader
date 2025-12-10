export function extractVehiclePositions(entities: any[]): Array<{ lat: number; lon: number }> {
  const positions: Array<{ lat: number; lon: number }> = [];

  entities.forEach((entity) => {
    const pos = entity.vehicle?.position;
    if (pos?.latitude != null && pos?.longitude != null) {
      const lat = typeof pos.latitude === "number" ? pos.latitude : Number(pos.latitude);
      const lon = typeof pos.longitude === "number" ? pos.longitude : Number(pos.longitude);
      if (!isNaN(lat) && !isNaN(lon)) {
        positions.push({ lat, lon });
      }
    }
  });

  return positions;
}

function calculateDistance(
  pos1: { lat: number; lon: number },
  pos2: { lat: number; lon: number }
): number {
  const R = 6371;
  const dLat = ((pos2.lat - pos1.lat) * Math.PI) / 180;
  const dLon = ((pos2.lon - pos1.lon) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((pos1.lat * Math.PI) / 180) *
      Math.cos((pos2.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function calculateSimpleAverage(
  positions: Array<{ lat: number; lon: number }>
): { lat: number; lon: number } | null {
  if (positions.length === 0) return null;

  const sum = positions.reduce(
    (acc, pos) => ({ lat: acc.lat + pos.lat, lon: acc.lon + pos.lon }),
    { lat: 0, lon: 0 }
  );

  return {
    lat: sum.lat / positions.length,
    lon: sum.lon / positions.length
  };
}

function filterClusteredPositions(
  positions: Array<{ lat: number; lon: number }>,
  maxDistanceKm: number = 50
): Array<{ lat: number; lon: number }> {
  if (positions.length <= 1) return positions;

  const avgPos = calculateSimpleAverage(positions);
  if (!avgPos) return positions;

  const filtered = positions.filter((pos) => {
    const distance = calculateDistance(pos, avgPos);
    return distance <= maxDistanceKm;
  });

  if (filtered.length < positions.length * 0.3 && maxDistanceKm < 200) {
    return filterClusteredPositions(positions, maxDistanceKm * 1.5);
  }

  return filtered.length > 0 ? filtered : positions;
}

export function calculateAveragePosition(
  positions: Array<{ lat: number; lon: number }>
): { lat: number; lon: number } | null {
  if (positions.length === 0) return null;

  const filteredPositions = filterClusteredPositions(positions);

  const sum = filteredPositions.reduce(
    (acc, pos) => ({ lat: acc.lat + pos.lat, lon: acc.lon + pos.lon }),
    { lat: 0, lon: 0 }
  );

  return {
    lat: sum.lat / filteredPositions.length,
    lon: sum.lon / filteredPositions.length
  };
}

export async function detectCityFromPosition(
  lat: number,
  lon: number
): Promise<string | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`,
      {
        headers: {
          "User-Agent": "GTFS-RT-Reader/1.0"
        }
      }
    );

    if (!response.ok) return null;

    const data = await response.json();
    const address = data.address;

    if (!address) return null;

    const city =
      address.city ||
      address.town ||
      address.village ||
      address.municipality ||
      address.county;

    const country = address.country;

    if (city && country) {
      return `${city}, ${country}`;
    } else if (city) {
      return city;
    }

    return null;
  } catch (error) {
    console.error("Reverse geocoding error", error);
    return null;
  }
}

