"use client";

import React, { useEffect, useRef, useState } from 'react';
import Map, { MapRef } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';

// Fallback style if no API key is provided
const DEFAULT_MAP_STYLE = "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

interface GlobeVizProps {
    autoRotate?: boolean; // Control rotation externally
    children?: React.ReactNode;
}

export default function GlobeViz({ autoRotate = true, children }: GlobeVizProps) {
    const mapRef = useRef<MapRef>(null);
    const [isMounted, setIsMounted] = useState(false);
    // Default to a zoomed out view of the globe
    const [viewState, setViewState] = useState({
        longitude: -98,
        latitude: 38,
        zoom: 3.2,
        pitch: 0,
        bearing: 0
    });

    // Only render on client to avoid hydration issues
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Rotation Animation
    useEffect(() => {
        let animationFrameId: number;

        const rotate = () => {
            // Rotate only if autoRotate is true.
            // We check for mapRef.current effectively by the fact that the loop runs.
            if (autoRotate) {
                setViewState((prev) => ({
                    ...prev,
                    longitude: prev.longitude + 0.2, // Adjust speed here
                }));
            }
            animationFrameId = requestAnimationFrame(rotate);
        };

        rotate();

        return () => cancelAnimationFrame(animationFrameId);
    }, [autoRotate]);

    // Don't render map during SSR to avoid hydration issues
    if (!isMounted) {
        return <div className="w-full h-full absolute inset-0 bg-canvas" />;
    }

    return (
        <div className="w-full h-full absolute inset-0 bg-canvas">
            <Map
                ref={mapRef}
                {...viewState}
                onMove={evt => setViewState(evt.viewState)}
                mapStyle={DEFAULT_MAP_STYLE}
                style={{ width: '100%', height: '100%' }}
                // @ts-ignore - 'projection' is valid in MapLibre v2+ but react-map-gl types might be strict or differ
                projection="globe"
                logoPosition="bottom-right"
                attributionControl={false}
            >
                {children}
            </Map>

            {/* Custom Attribution */}
            <div className="absolute bottom-2 right-2 text-xs text-gray-500 pointer-events-none opacity-50 z-10">
                © OpenStreetMap © Carto
            </div>
        </div>
    );
}
