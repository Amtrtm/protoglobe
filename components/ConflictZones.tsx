"use client";

import React, { useEffect, useState } from 'react';
import { Source, Layer } from 'react-map-gl/maplibre';

export default function ConflictZones() {
    const [data, setData] = useState(null);

    useEffect(() => {
        fetch('/api/conflicts')
            .then(res => res.json())
            .then(data => setData(data))
            .catch(err => console.error('Failed to fetch conflicts:', err));
    }, []);

    if (!data) return null;

    return (
        <Source type="geojson" data={data}>
            {/* Inner Glow / Fill */}
            <Layer
                id="conflict-fill"
                type="fill"
                paint={{
                    'fill-color': '#ff2a2a', // Accent Red
                    'fill-opacity': 0.15,
                }}
            />

            {/* Stroke / Outline */}
            <Layer
                id="conflict-outline"
                type="line"
                paint={{
                    'line-color': '#ff2a2a',
                    'line-width': 2,
                    'line-opacity': 1,
                    'line-blur': 1
                }}
            />

            {/* Outer Glow Effect (Simulated with thicker blurred line) */}
            <Layer
                id="conflict-glow"
                type="line"
                paint={{
                    'line-color': '#ff2a2a',
                    'line-width': 6,
                    'line-opacity': 0.4,
                    'line-blur': 4
                }}
            />
        </Source>
    );
}
