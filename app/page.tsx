"use client";

import React, { useState, useEffect } from 'react';
import GlobeViz from '@/components/GlobeViz';
import Overlay from '@/components/Overlay';
import ProjectMarkers, { Project } from '@/components/ProjectMarkers';
import StreaksOverlay from '@/components/StreaksOverlay';
import ConflictZones from '@/components/ConflictZones';

export default function Home() {
  const [isRotating, setIsRotating] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    fetch('/api/projects')
      .then(res => res.json())
      .then(data => setProjects(data))
      .catch(err => console.error('Failed to fetch projects:', err));
  }, []);

  return (
    <main className="relative w-full h-screen overflow-hidden bg-canvas">

      {/* 3D Globe Layer */}
      <GlobeViz autoRotate={isRotating}>
        <ProjectMarkers projects={projects} />
        <StreaksOverlay projects={projects} />
        <ConflictZones />
      </GlobeViz>

      {/* UI Overlay Layer */}
      <Overlay isRotating={isRotating} setIsRotating={setIsRotating} />

    </main>
  );
}
