export const UNS_COORDINATES = { lat: -7.558, lng: 110.856 };

export const extractGoogleMapsCoordinates = (mapUrl) => {
  const match = String(mapUrl || "").match(
    /@(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/,
  );

  if (!match) return null;

  const lat = Number(match[1]);
  const lng = Number(match[2]);
  return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null;
};

// 1. Rumus Haversine untuk menghitung jarak antara 2 koordinat (Lat, Lng) dalam KM
export const calculateDistanceInKm = (lat1, lon1, lat2, lon2) => {
  if (![lat1, lon1, lat2, lon2].every(Number.isFinite)) return null;

  const R = 6371; // Jari-jari bumi dalam Kilometer
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
};

// 2. Helper untuk mengambil koordinat GPS browser pengguna
export const getUserCoordinates = (onSuccess, onError) => {
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        onSuccess({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        if (onError) onError(error);
      },
    );
  } else {
    if (onError)
      onError(new Error("Geolocation tidak didukung di browser ini."));
  }
};
