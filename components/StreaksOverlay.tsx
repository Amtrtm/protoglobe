"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useMap } from 'react-map-gl/maplibre';
import { Project } from './ProjectMarkers';

// Streak Particle Class
class Streak {
    x: number; // Current X
    y: number; // Current Y
    startX: number;
    startY: number;
    targetLat: number;
    targetLng: number;
    speed: number;
    progress: number; // 0 to 1
    dead: boolean = false;
    color: string;

    constructor(w: number, h: number, tLat: number, tLng: number) {
        // Start from a random edge
        const edge = Math.floor(Math.random() * 4); // 0:top, 1:right, 2:bottom, 3:left
        if (edge === 0) { this.x = Math.random() * w; this.y = -50; }
        else if (edge === 1) { this.x = w + 50; this.y = Math.random() * h; }
        else if (edge === 2) { this.x = Math.random() * w; this.y = h + 50; }
        else { this.x = -50; this.y = Math.random() * h; }

        this.startX = this.x;
        this.startY = this.y;
        this.targetLat = tLat;
        this.targetLng = tLng;
        this.speed = 0.01 + Math.random() * 0.01; // Random speed
        this.progress = 0;

        // Random color: Cyan or White or Accent
        const colors = ["#00f3ff", "#ffffff", "#00ff66"];
        this.color = colors[Math.floor(Math.random() * colors.length)];
    }

    update(currTargetX: number, currTargetY: number) {
        this.progress += this.speed;
        if (this.progress >= 1) {
            this.progress = 1;
            this.dead = true;
        }

        // Linear interpolation from Start to CURRENT Target position
        // This allows the target to move (spin) while the ball flies
        this.x = this.startX + (currTargetX - this.startX) * this.progress;
        this.y = this.startY + (currTargetY - this.startY) * this.progress;
    }

    draw(ctx: CanvasRenderingContext2D) {
        const opacity = 1 - Math.pow(this.progress, 5); // Fade out near end? Or fade in?
        // Actually streaks usually look solid.

        // Draw Head
        ctx.beginPath();
        ctx.arc(this.x, this.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();

        // Draw Trail (simple line from previous pos or just backward vector)
        // For a nice trail, we can calculate a point backwards along the path
        const dx = this.x - this.startX;
        const dy = this.y - this.startY;
        const len = Math.sqrt(dx * dx + dy * dy);
        if (len > 0) {
            // Trail length proportional to speed/progress but capped
            const trailLen = Math.min(len, 150 * this.progress);
            const trailX = this.x - (dx / len) * trailLen;
            const trailY = this.y - (dy / len) * trailLen;

            const grad = ctx.createLinearGradient(this.x, this.y, trailX, trailY);
            grad.addColorStop(0, this.color);
            grad.addColorStop(1, "rgba(0,0,0,0)");

            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(trailX, trailY);
            ctx.strokeStyle = grad;
            ctx.lineWidth = 4;
            ctx.stroke();
        }
    }
}

interface StreaksOverlayProps {
    projects: Project[];
}

export default function StreaksOverlay({ projects }: StreaksOverlayProps) {
    const { current: map } = useMap();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streaksRef = useRef<Streak[]>([]);
    const requestRef = useRef<number>(0);

    useEffect(() => {
        if (!map || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const spawnStreak = () => {
            // Pick a random project
            // Optimization: Only target visible projects?
            // MapLibre's project() works even for wrapped coords, but simple visibility check:
            // We can't easily check occlusion on the globe without complex math or inspecting standard projection.
            // We'll just spawn and let them fly. If the target is behind, it will fly to the "screen coordinate" which might be valid or off.
            // Actually, standard project() on a Globe view sometimes returns weird values for back-facing points.

            const p = projects[Math.floor(Math.random() * projects.length)];
            streaksRef.current.push(new Streak(canvas.width, canvas.height, p.coords[1], p.coords[0]));
        };

        const animate = () => {
            // Resize canvas to confirm match map size
            if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
                canvas.width = canvas.clientWidth;
                canvas.height = canvas.clientHeight;
            }

            ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear

            // Chance to spawn
            if (Math.random() < 0.03) { // Adjust frequency
                spawnStreak();
            }

            // Update and Draw
            for (let i = streaksRef.current.length - 1; i >= 0; i--) {
                const s = streaksRef.current[i];

                // Project target lat/lng to screen pixels
                // NOTE: React-map-gl/maplibre project accepts [lng, lat]
                const p = map.project([s.targetLng, s.targetLat]);

                s.update(p.x, p.y);
                s.draw(ctx);

                if (s.dead) {
                    streaksRef.current.splice(i, 1);
                }
            }

            requestRef.current = requestAnimationFrame(animate);
        };

        requestRef.current = requestAnimationFrame(animate);

        return () => cancelAnimationFrame(requestRef.current);
    }, [map, projects]);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 pointer-events-none z-10 w-full h-full"
        />
    );
}
