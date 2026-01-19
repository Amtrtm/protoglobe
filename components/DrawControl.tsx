"use client";

import React, { useRef, useEffect } from 'react';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import { useControl } from 'react-map-gl/maplibre';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';

import { DrawTheme } from './DrawTheme';

interface DrawControlProps {
    onCreate?: (evt: any) => void;
    onUpdate?: (evt: any) => void;
    onDelete?: (evt: any) => void;
    onDrawReady?: (draw: MapboxDraw) => void;
}

export default function DrawControl(props: DrawControlProps) {
    // Keep refs to props to avoid stale closures in event listeners
    const propsRef = React.useRef(props);
    useEffect(() => {
        propsRef.current = props;
    });

    const draw = useControl<any>(
        () => {
            return new MapboxDraw({
                displayControlsDefault: false,
                controls: {
                    polygon: true,
                    trash: true
                },
                defaultMode: 'simple_select',
                styles: DrawTheme
            });
        },
        ({ map }) => {
            const onCreate = (e: any) => propsRef.current.onCreate?.(e);
            const onUpdate = (e: any) => propsRef.current.onUpdate?.(e);
            const onDelete = (e: any) => propsRef.current.onDelete?.(e);

            map.on('draw.create', onCreate);
            map.on('draw.update', onUpdate);
            map.on('draw.delete', onDelete);

            // Store references to the bound listeners for cleanup
            // This is a common pattern when `map.off` needs the exact same function reference
            // that was passed to `map.on`.
            (map as any)._drawListeners = { onCreate, onUpdate, onDelete };
        },
        ({ map }) => {
            const { onCreate, onUpdate, onDelete } = (map as any)._drawListeners || {};
            if (onCreate) map.off('draw.create', onCreate);
            if (onUpdate) map.off('draw.update', onUpdate);
            if (onDelete) map.off('draw.delete', onDelete);
        },
        {
            position: 'top-left'
        }
    );

    useEffect(() => {
        if (draw && props.onDrawReady) {
            props.onDrawReady(draw);
        }
    }, [draw, props.onDrawReady]);

    return null;
}
