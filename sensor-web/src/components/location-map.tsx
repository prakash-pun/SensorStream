"use client";

import type React from "react";
import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

// Replace with your actual Mapbox access token
mapboxgl.accessToken =
  "pk.eyJ1IjoicHJha2FzaHB1bjIyIiwiYSI6ImNrbG9pYjIwYzBjOWMyb253a2w0eGFlbG8ifQ.LwyWuflhkvzQ4Mt73nK0Tw";

interface LocationMapProps {
  latitude?: number | null;
  longitude?: number | null;
}

const LocationMap: React.FC<LocationMapProps> = ({ latitude, longitude }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);

  useEffect(() => {
    if (map.current) return; // initialize map only once
    if (!mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/prakashpun22/cm1zvmh40000z01qkdlyj3u3h",

      center: [-74.0242, 40.6941],
      zoom: 10.12,
    });

    marker.current = new mapboxgl.Marker().setLngLat([0, 0]).addTo(map.current);
  }, []);

  // useEffect(() => {
  //   if (!map.current || !marker.current) return;
  //   if (latitude === null || longitude === null) return;

  //   map.current.flyTo({
  //     center: [43.6901917, -79.3028316],
  //     zoom: 14,
  //     // essential: true,
  //   });

  //   marker.current.setLngLat([43.6901917, -79.3028316]);
  // }, []);

  return (
    <div className="relative rounded-lg">
      <div className="sidebar">
        Longitude: {latitude}, Longitude: {longitude}
      </div>
      <div
        ref={mapContainer}
        className="w-full h-full min-h-[250px] md:min-h-[330px] rounded-lg"
      />
    </div>
  );
};

export default LocationMap;
