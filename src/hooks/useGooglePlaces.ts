'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

// ─── Public Types ────────────────────────────────────────────
export interface PlacePrediction {
  placeId: string;
  main: string;
  sub: string;
  fullDescription: string;
}

export interface PlaceDetails {
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  lat: number;
  lng: number;
}

// ─── Script Loader (idempotent) ──────────────────────────────
const SCRIPT_ID = 'google-maps-places';

function loadScript(apiKey: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // Already loaded
    if ((window as any).google?.maps?.places) {
      resolve();
      return;
    }
    // Script tag already in DOM (loading)
    const existing = document.getElementById(SCRIPT_ID);
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject());
      return;
    }

    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Maps script'));
    document.head.appendChild(script);
  });
}

// ─── Hook ────────────────────────────────────────────────────
export function useGooglePlaces(countryCodes: string | string[] = ['ng', 'us', 'gb']) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Refs for Google Maps objects (no re-renders on change)
  const autocomplete = useRef<any>(null);
  const session = useRef<any>(null);
  const geo = useRef<any>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Load the SDK ────────────────────────────────────────────
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;
    if (!key) return;

    loadScript(key)
      .then(() => {
        const g = (window as any).google;
        autocomplete.current = new g.maps.places.AutocompleteService();
        session.current = new g.maps.places.AutocompleteSessionToken();
        geo.current = new g.maps.Geocoder();
        setIsLoaded(true);
      })
      .catch((err) => console.warn('Google Places load failed:', err));
  }, []);

  // ── Debounced autocomplete search ───────────────────────────
  const search = useCallback(
    (input: string) => {
      if (timer.current) clearTimeout(timer.current);

      if (!input.trim()) {
        setPredictions([]);
        setIsSearching(false);
        return;
      }

      if (!autocomplete.current) return;

      setIsSearching(true);

      timer.current = setTimeout(() => {
        autocomplete.current.getPlacePredictions(
          {
            input,
            sessionToken: session.current,
            componentRestrictions: { country: countryCodes },
            types: ['geocode', 'establishment'],
          },
          (results: any[] | null, status: string) => {
            setIsSearching(false);
            if (status === 'OK' && results) {
              setPredictions(
                results.map((r: any) => ({
                  placeId: r.place_id,
                  main: r.structured_formatting.main_text,
                  sub: r.structured_formatting.secondary_text || '',
                  fullDescription: r.description,
                }))
              );
            } else {
              setPredictions([]);
            }
          }
        );
      }, 300);
    },
    [countryCodes]
  );

  // ── Geocode a selected place → structured address details ───
  const getPlaceDetails = useCallback(
    async (placeId: string): Promise<PlaceDetails> => {
      if (!geo.current) throw new Error('Geocoder not initialized');

      const response = await geo.current.geocode({ placeId });
      const result = response.results?.[0];
      if (!result) throw new Error('Place not found');

      const get = (type: string): string => {
        const c = result.address_components?.find((comp: any) =>
          comp.types.includes(type)
        );
        return c?.long_name || '';
      };

      return {
        address: result.formatted_address,
        city: get('locality') || get('administrative_area_level_2'),
        state: get('administrative_area_level_1'),
        country: get('country'),
        postalCode: get('postal_code'),
        lat: result.geometry.location.lat(),
        lng: result.geometry.location.lng(),
      };
    },
    []
  );

  // ── Helpers ─────────────────────────────────────────────────
  const clearPredictions = useCallback(() => setPredictions([]), []);

  const resetSession = useCallback(() => {
    const g = (window as any).google;
    if (g?.maps?.places) {
      session.current = new g.maps.places.AutocompleteSessionToken();
    }
  }, []);

  return {
    isLoaded,
    predictions,
    isSearching,
    search,
    getPlaceDetails,
    clearPredictions,
    resetSession,
  };
}
