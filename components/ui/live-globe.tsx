"use client";

import React, { useEffect, useRef } from "react";
import createGlobe from "cobe";

export default function LiveGlobe({ locations }: { locations: { lat: number, lng: number, size: number }[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerInteracting = useRef<number | null>(null);
  const pointerInteractionMovement = useRef(0);

  useEffect(() => {
    let phi = 4.7; // Start focused roughly on South Asia / Pakistan
    let width = 0;
    const onResize = () => canvasRef.current && (width = canvasRef.current.offsetWidth)
    window.addEventListener('resize', onResize)
    onResize()
    
    // Smartwear Dark Luxury Theme
    const globe = createGlobe(canvasRef.current!, {
      devicePixelRatio: 2,
      width: width * 2,
      height: width * 2,
      phi: 0,
      theta: 0.1, // tilt slightly
      dark: 1, // Dark theme globe!
      diffuse: 1.2,
      scale: 1.15, // slightly larger
      mapSamples: 24000, // Higher res
      mapBrightness: 6, // Brightness
      baseColor: [0.1, 0.1, 0.1], // Dark gray body
      markerColor: [0.72, 0.52, 0.04], // Gold markers (#B8860B is roughly this)
      glowColor: [0.05, 0.05, 0.05], // Very dark glow
      offset: [0, 0],
      markers: locations.map(loc => ({
        location: [loc.lat, loc.lng],
        size: loc.size
      })),
      onRender: (state) => {
        // Only move when the user interacts
        state.phi = phi + pointerInteractionMovement.current
        state.width = width * 2
        state.height = width * 2
      }
    })
    
    setTimeout(() => canvasRef.current!.style.opacity = '1')
    return () => {
      globe.destroy()
      window.removeEventListener('resize', onResize)
    }
  }, [locations])

  return (
    <div className="w-full h-full min-h-[280px] flex items-center justify-center relative pointer-events-auto">
      {/* Soft background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(184,134,11,0.05)_0%,transparent_70%)] pointer-events-none"></div>
      
      <canvas
        ref={canvasRef}
        onPointerDown={(e) => {
          pointerInteracting.current = e.clientX - (pointerInteractionMovement.current * 150);
          canvasRef.current!.style.cursor = 'grabbing';
        }}
        onPointerUp={() => {
          pointerInteracting.current = null;
          canvasRef.current!.style.cursor = 'grab';
        }}
        onPointerOut={() => {
          pointerInteracting.current = null;
          canvasRef.current!.style.cursor = 'grab';
        }}
        onMouseMove={(e) => {
          if (pointerInteracting.current !== null) {
            const delta = e.clientX - pointerInteracting.current;
            pointerInteractionMovement.current = delta / 150;
          }
        }}
        style={{
          width: '100%',
          maxWidth: '800px',
          aspectRatio: '1',
          cursor: 'grab',
          opacity: 0,
          transition: 'opacity 1s ease',
        }}
      />
    </div>
  );
}
