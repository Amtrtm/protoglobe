"use client";

import React, { useState, useEffect } from 'react';
import { Globe, Pause, Play, Search, Activity, Zap } from 'lucide-react';

interface OverlayProps {
    isRotating: boolean;
    setIsRotating: (val: boolean) => void;
}

export default function Overlay({ isRotating, setIsRotating }: OverlayProps) {
    // Real Data for the Ticker - fetch from API to avoid hydration mismatch
    const [projects, setProjects] = useState<Array<{name: string, location: string, status: string}>>([]);

    useEffect(() => {
        fetch('/api/projects')
            .then(res => res.json())
            .then(data => {
                const formattedProjects = data.map((p: any) => ({
                    name: p.name,
                    location: `${p.coords[0].toFixed(2)}, ${p.coords[1].toFixed(2)}`,
                    status: p.status
                }));
                setProjects(formattedProjects);
            })
            .catch(err => console.error('Failed to fetch projects:', err));
    }, []);

    return (
        <div className="absolute inset-0 pointer-events-none flex flex-col justify-between">

            {/* --- Top Navigation Bar --- */}
            <div className="pointer-events-auto w-full glass-panel border-b border-white/10 p-3 flex items-center justify-between z-10">
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-bold tracking-wider polyglow-text flex items-center gap-2">
                        <Globe className="w-6 h-6 animate-pulse" />
                        POLYGLOBE <span className="text-xs text-gray-400 font-normal opacity-70">ENTERPRISE</span>
                    </h1>

                    <div className="hidden md:flex items-center gap-1 bg-black/40 rounded-full px-1 py-1 border border-white/10">
                        <button className="px-3 py-1 rounded-full text-xs font-semibold bg-accent-red/20 text-accent-red border border-accent-red/50 animate-pulse">BREAKING</button>
                        <button className="px-3 py-1 rounded-full text-xs font-semibold hover:bg-white/5 text-gray-300">OSINT</button>
                        <button className="px-3 py-1 rounded-full text-xs font-semibold hover:bg-white/5 text-gray-300">LIVE</button>
                    </div>
                </div>

                {/* Search & Controls */}
                <div className="flex items-center gap-3">
                    <div className="relative hidden sm:block">
                        <Search className="absolute left-2 top-1.5 w-4 h-4 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search markets..."
                            className="bg-black/50 border border-white/10 rounded-md py-1 pl-8 pr-4 text-sm focus:outline-none focus:border-polyglow transition-colors w-48 text-white placeholder-gray-600"
                        />
                    </div>
                    <button
                        onClick={() => setIsRotating(!isRotating)}
                        className="p-2 hover:bg-white/10 rounded-full border border-white/10 transition-colors"
                    >
                        {isRotating ? <Pause className="w-4 h-4 text-polyglow" /> : <Play className="w-4 h-4 text-polyglow" />}
                    </button>
                </div>
            </div>



            {/* --- Right Sidebar / Floating Panels --- */}
            <div className="pointer-events-auto absolute top-24 right-4 w-64 flex flex-col gap-2">
                {/* NEH Index / Summary Card */}
                <div className="glass-panel p-4 rounded-xl border-l-4 border-l-accent-green">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-xs font-bold text-gray-400">PROJECTS LIVE</h3>
                        <Activity className="w-4 h-4 text-accent-green" />
                    </div>
                    <div className="text-2xl font-bold font-mono">12 <span className="text-sm text-gray-500 font-normal">/ 15</span></div>
                    <div className="mt-2 text-xs text-accent-green flex items-center gap-1">
                        <Zap className="w-3 h-3" /> +3 deployed today
                    </div>
                </div>
            </div>

            {/* --- Bottom Section (Ticker + Footer) --- */}
            <div className="w-full flex flex-col pointer-events-none">

                {/* Ticker - Moved to bottom */}
                <div className="pointer-events-auto w-full bg-black/80 border-t border-b border-white/5 overflow-hidden whitespace-nowrap py-1 backdrop-blur-md">
                    <div className="animate-marquee inline-block">
                        {projects.map((p, i) => (
                            <span key={i} className="mx-6 text-sm font-mono text-gray-300">
                                <span className="text-polyglow">[{p.status.toUpperCase()}]</span> {p.name} <span className="text-gray-500">@ {p.location}</span>
                            </span>
                        ))}
                        {/* Duplicate for seamless loop */}
                        {projects.map((p, i) => (
                            <span key={`dup-${i}`} className="mx-6 text-sm font-mono text-gray-300">
                                <span className="text-polyglow">[{p.status.toUpperCase()}]</span> {p.name} <span className="text-gray-500">@ {p.location}</span>
                            </span>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="pointer-events-auto w-full p-2 bg-gradient-to-t from-black via-black/80 to-transparent flex justify-center pb-4">
                    <div className="text-xs text-gray-600 tracking-widest uppercase">
                        Replicating PolyGlobe Logic // Visualization
                    </div>
                </div>
            </div>

        </div>
    );
}
