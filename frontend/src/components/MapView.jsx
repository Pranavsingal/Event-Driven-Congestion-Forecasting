import React, { useState } from 'react';
import { MapPin, Info, ArrowUpRight, Compass } from 'lucide-react';

export default function MapView({ sectors, incidents }) {
  const [hoveredSector, setHoveredSector] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Map sector ID to color styles
  const getSectorStyles = (congestion) => {
    if (congestion < 35) {
      return {
        fill: 'rgba(16, 185, 129, 0.15)',
        stroke: 'rgba(16, 185, 129, 0.7)',
        glow: 'rgba(16, 185, 129, 0.2)'
      };
    } else if (congestion < 65) {
      return {
        fill: 'rgba(245, 158, 11, 0.15)',
        stroke: 'rgba(245, 158, 11, 0.7)',
        glow: 'rgba(245, 158, 11, 0.2)'
      };
    } else {
      return {
        fill: 'rgba(239, 68, 68, 0.25)',
        stroke: 'rgba(239, 68, 68, 0.85)',
        glow: 'rgba(239, 68, 68, 0.35)'
      };
    }
  };

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPos({
      x: e.clientX - rect.left + 15,
      y: e.clientY - rect.top + 15
    });
  };

  return (
    <div className="glass" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Compass size={18} color="var(--clr-indigo)" />
          <h2 style={{ fontSize: '18px', margin: 0 }}>Live Congestion Overlay Map</h2>
        </div>
        <div style={{ display: 'flex', gap: '12px', fontSize: '11px', color: 'var(--text-muted)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--clr-green)' }}></span> Normal
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--clr-yellow)' }}></span> Moderate
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--clr-red)' }}></span> Critical
          </span>
        </div>
      </div>

      {/* SVG Interactive Map */}
      <div 
        style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center', background: 'rgba(0, 0, 0, 0.2)', borderRadius: '12px', padding: '10px', overflow: 'hidden' }}
        onMouseMove={handleMouseMove}
      >
        <svg 
          viewBox="0 0 600 380" 
          style={{ width: '100%', maxHeight: '350px', display: 'block' }}
        >
          {/* Defs for gradients or filter effects */}
          <defs>
            <filter id="glow-indigo">
              <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Grid Background Lines (Sleek Cyber Grid) */}
          <g stroke="rgba(255, 255, 255, 0.03)" strokeWidth="1">
            {Array.from({ length: 12 }).map((_, i) => (
              <line key={`x-${i}`} x1={i * 50} y1="0" x2={i * 50} y2="380" />
            ))}
            {Array.from({ length: 8 }).map((_, i) => (
              <line key={`y-${i}`} x1="0" y1={i * 50} x2="600" y2={i * 50} />
            ))}
          </g>

          {/* District 1: Uptown */}
          {sectors.find(s => s.id === 'uptown') && (
            <polygon
              points="10,10 320,10 280,160 10,160"
              style={{
                fill: getSectorStyles(sectors.find(s => s.id === 'uptown').congestion).fill,
                stroke: getSectorStyles(sectors.find(s => s.id === 'uptown').congestion).stroke,
                strokeWidth: '1.5',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
              onMouseEnter={() => setHoveredSector(sectors.find(s => s.id === 'uptown'))}
              onMouseLeave={() => setHoveredSector(null)}
            />
          )}

          {/* District 2: Westside */}
          {sectors.find(s => s.id === 'westside') && (
            <polygon
              points="10,160 280,160 240,370 10,370"
              style={{
                fill: getSectorStyles(sectors.find(s => s.id === 'westside').congestion).fill,
                stroke: getSectorStyles(sectors.find(s => s.id === 'westside').congestion).stroke,
                strokeWidth: '1.5',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
              onMouseEnter={() => setHoveredSector(sectors.find(s => s.id === 'westside'))}
              onMouseLeave={() => setHoveredSector(null)}
            />
          )}

          {/* District 3: Downtown */}
          {sectors.find(s => s.id === 'downtown') && (
            <polygon
              points="320,10 590,10 590,260 280,260"
              style={{
                fill: getSectorStyles(sectors.find(s => s.id === 'downtown').congestion).fill,
                stroke: getSectorStyles(sectors.find(s => s.id === 'downtown').congestion).stroke,
                strokeWidth: '1.5',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
              onMouseEnter={() => setHoveredSector(sectors.find(s => s.id === 'downtown'))}
              onMouseLeave={() => setHoveredSector(null)}
            />
          )}

          {/* District 4: Highway Corridor */}
          {sectors.find(s => s.id === 'highway') && (
            <polygon
              points="280,260 590,260 590,370 240,370"
              style={{
                fill: getSectorStyles(sectors.find(s => s.id === 'highway').congestion).fill,
                stroke: getSectorStyles(sectors.find(s => s.id === 'highway').congestion).stroke,
                strokeWidth: '1.5',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
              onMouseEnter={() => setHoveredSector(sectors.find(s => s.id === 'highway'))}
              onMouseLeave={() => setHoveredSector(null)}
            />
          )}

          {/* Arterial Highway Overlay Lines */}
          <path 
            d="M 150,10 Q 300,190 450,370" 
            fill="none" 
            stroke="rgba(255, 255, 255, 0.15)" 
            strokeWidth="3" 
            strokeDasharray="5,5" 
          />
          <path 
            d="M 10,200 L 590,200" 
            fill="none" 
            stroke="rgba(255, 255, 255, 0.15)" 
            strokeWidth="3" 
            strokeDasharray="5,5" 
          />

          {/* Texts indicating sector labels */}
          <text x="120" y="80" fill="rgba(255, 255, 255, 0.5)" fontSize="14" fontWeight="600" style={{ pointerEvents: 'none' }}>UPTOWN</text>
          <text x="100" y="270" fill="rgba(255, 255, 255, 0.5)" fontSize="14" fontWeight="600" style={{ pointerEvents: 'none' }}>WESTSIDE</text>
          <text x="430" y="130" fill="rgba(255, 255, 255, 0.5)" fontSize="14" fontWeight="600" style={{ pointerEvents: 'none' }}>DOWNTOWN CORE</text>
          <text x="380" y="325" fill="rgba(255, 255, 255, 0.5)" fontSize="14" fontWeight="600" style={{ pointerEvents: 'none' }}>HIGHWAY 101 LINK</text>

          {/* Incident Pins */}
          {incidents.map((inc) => {
            // Coordinate mappings
            let coords = { x: 300, y: 190 };
            if (inc.sector === 'uptown') coords = { x: 160, y: 110 };
            else if (inc.sector === 'westside') coords = { x: 120, y: 220 };
            else if (inc.sector === 'downtown') coords = { x: 450, y: 80 };
            else if (inc.sector === 'highway') coords = { x: 420, y: 290 };

            return (
              <g key={inc.id} style={{ cursor: 'pointer' }}>
                <circle cx={coords.x} cy={coords.y} r="18" fill="rgba(239, 68, 68, 0.2)" stroke="var(--clr-red)" strokeWidth="1" strokeDasharray="3,2" />
                <circle cx={coords.x} cy={coords.y} r="6" fill="var(--clr-red)" />
                <path 
                  d={`M ${coords.x} ${coords.y} L ${coords.x - 10} ${coords.y - 25} L ${coords.x + 40} ${coords.y - 25}`} 
                  stroke="rgba(255, 255, 255, 0.3)" 
                  strokeWidth="1" 
                  fill="none" 
                />
                <text x={coords.x + 8} y={coords.y - 29} fill="var(--clr-red)" fontSize="10" fontWeight="bold">
                  {inc.type}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Dynamic Tooltip Popup overlay */}
        {hoveredSector && (
          <div 
            style={{
              position: 'absolute',
              top: tooltipPos.y,
              left: tooltipPos.x,
              background: 'rgba(15, 23, 42, 0.95)',
              border: '1px solid var(--border-color-glow)',
              borderRadius: '8px',
              padding: '12px',
              pointerEvents: 'none',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
              zIndex: 10,
              minWidth: '180px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '4px' }}>
              <span style={{ fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--text-primary)' }}>
                {hoveredSector.name}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Congestion:</span>
              <span style={{ fontWeight: 'bold', color: hoveredSector.congestion > 65 ? 'var(--clr-red)' : hoveredSector.congestion > 35 ? 'var(--clr-yellow)' : 'var(--clr-green)' }}>
                {hoveredSector.congestion}%
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Flow Speed:</span>
              <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>{hoveredSector.speed} mph</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Traffic Load:</span>
              <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>{hoveredSector.flowRate} veh/h</span>
            </div>
            {hoveredSector.diversionActive && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(99, 102, 241, 0.15)', borderRadius: '4px', padding: '4px 6px', marginTop: '4px', fontSize: '10px', color: 'var(--clr-indigo)' }}>
                <ArrowUpRight size={12} />
                <span>AI Diversion Route Active</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
