"use client";

import { useCallback, useState } from "react";

/**
 * Gets the device's GPS position and reverse-geocodes it into a detailed
 * address using OpenStreetMap Nominatim (free, no API key).
 */
export function useCurrentLocation() {
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState("");

  const locate = useCallback(async () => {
    setError("");
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setError("Location is not supported on this device.");
      return null;
    }
    setLocating(true);
    try {
      const pos = await new Promise((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 12000,
          maximumAge: 30000,
        })
      );
      const { latitude, longitude } = pos.coords;

      let address = null;
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&addressdetails=1&zoom=18`,
          { headers: { Accept: "application/json" } }
        );
        if (res.ok) {
          const data = await res.json();
          const a = data.address || {};
          address = {
            full: data.display_name || "",
            line: [a.house_number, a.road, a.neighbourhood || a.suburb || a.village || a.hamlet]
              .filter(Boolean)
              .join(", "),
            city: a.city || a.town || a.village || a.municipality || a.county || "",
            district: a.state_district || "",
            state: a.state || "",
            postcode: a.postcode || "",
          };
        }
      } catch {
        // Geocoding failed — still return coordinates so they can be saved.
      }

      setLocating(false);
      return { latitude, longitude, address };
    } catch (e) {
      setLocating(false);
      setError(
        e?.code === 1
          ? "Location permission denied. Allow location access in your browser and try again."
          : "Couldn't detect your location. Please try again."
      );
      return null;
    }
  }, []);

  return { locate, locating, error };
}
