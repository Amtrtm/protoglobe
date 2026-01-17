"use client";

import React from 'react';
import { Marker, Popup } from 'react-map-gl/maplibre';
import { useState } from 'react';

// Mock Data Type
export interface Project {
    id: string;
    name: string;
    coords: [number, number]; // [lng, lat]
    status: 'active' | 'maintenance' | 'deployed';
    details: string;
}

interface ProjectMarkersProps {
    projects: Project[];
}

export default function ProjectMarkers({ projects }: ProjectMarkersProps) {
    const [hoveredProject, setHoveredProject] = useState<Project | null>(null);

    return (
        <>
            {projects.map((project) => (
                <React.Fragment key={project.id}>
                    <Marker
                        longitude={project.coords[0]}
                        latitude={project.coords[1]}
                        anchor="center"
                        onClick={(e) => {
                            e.originalEvent.stopPropagation();
                            setHoveredProject(project);
                        }}
                    >
                        {/* Market-like Dot */}
                        <div
                            className="relative group cursor-pointer"
                            onMouseEnter={() => setHoveredProject(project)}
                            onMouseLeave={() => setHoveredProject(null)}
                        >
                            {/* Outer Glow / Halo for Active items */}
                            {project.status === 'active' && (
                                <div className="absolute -inset-2 bg-accent-green/30 rounded-full animate-pulse-slow blur-sm" />
                            )}

                            {/* Core Dot */}
                            <div className={`w-3 h-3 rounded-sm border border-black/50 shadow-[0_0_10px_currentColor] transition-transform duration-300 hover:scale-150
                ${project.status === 'active' ? 'bg-accent-green shadow-accent-green' :
                                    project.status === 'maintenance' ? 'bg-yellow-500 shadow-yellow-500' :
                                        'bg-polyglow shadow-polyglow'}`}
                            />
                        </div>
                    </Marker>

                    {/* Tooltip Popup */}
                    {hoveredProject && hoveredProject.id === project.id && (
                        <Popup
                            longitude={project.coords[0]}
                            latitude={project.coords[1]}
                            offset={15}
                            closeButton={false}
                            closeOnClick={false}
                            anchor="bottom"
                            className="z-50"
                        >
                            <div className="glass-panel p-2 rounded-md border border-polyglow/30 text-xs min-w-[120px]">
                                <h3 className="font-bold text-white mb-1">{project.name}</h3>
                                <div className="text-gray-400 capitalize">{project.status}</div>
                                <div className="text-polyglow mt-1">{project.details}</div>
                            </div>
                        </Popup>
                    )}
                </React.Fragment>
            ))}
        </>
    );
}
