import React, { useState } from 'react';
import { Compass, ArrowUpRight } from 'lucide-react';

export default function MapView({ sectors, incidents }) {
  const [hoveredSector, setHoveredSector] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Map sector ID to color styles matching traffic standards
  const getSectorStyles = (congestion) => {
    if (congestion < 35) {
      return {
        fill: 'rgba(46, 125, 50, 0.15)',
        stroke: 'var(--success)'
      };
    } else if (congestion < 65) {
      return {
        fill: 'rgba(237, 108, 2, 0.15)',
        stroke: 'var(--warning)'
      };
    } else {
      return {
        fill: 'rgba(198, 40, 40, 0.25)',
        stroke: 'var(--danger)'
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
    <div className="glass" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative', height: '100%', background: 'var(--card-bg)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Compass size={18} color="var(--primary)" />
          <h2 style={{ fontSize: '18px', margin: 0, color: 'var(--text-primary)' }}>Live Congestion Overlay Map</h2>
        </div>
        <div style={{ display: 'flex', gap: '12px', fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)' }}></span> Normal
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--warning)' }}></span> Moderate
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--danger)' }}></span> Critical
          </span>
        </div>
      </div>

      {/* SVG Interactive Map (Control Room style dark screen for high contrast overlay) */}
      <div 
        style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center', background: '#0f172a', borderRadius: '12px', padding: '10px', overflow: 'hidden', border: '1px solid var(--border-color)' }}
        onMouseMove={handleMouseMove}
      >
        <svg 
          viewBox="0 0 600 380" 
          style={{ width: '100%', maxHeight: '350px', display: 'block' }}
        >
          {/* Grid Background Lines */}
          <g stroke="rgba(255, 255, 255, 0.04)" strokeWidth="1">
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
                strokeWidth: '2',
                cursor: 'pointer',
                transition: 'all 0.2s'
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
                strokeWidth: '2',
                cursor: 'pointer',
                transition: 'all 0.2s'
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
                strokeWidth: '2',
                cursor: 'pointer',
                transition: 'all 0.2s'
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
                strokeWidth: '2',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={() => setHoveredSector(sectors.find(s => s.id === 'highway'))}
              onMouseLeave={() => setHoveredSector(null)}
            />
          )}

          {/* Arterial Highway Overlay Lines */}
          <path 
            d="M 150,10 Q 300,190 450,370" 
            fill="none" 
            stroke="rgba(255, 255, 255, 0.1)" 
            strokeWidth="3" 
            strokeDasharray="5,5" 
          />
          <path 
            d="M 10,200 L 590,200" 
            fill="none" 
            stroke="rgba(255, 255, 255, 0.1)" 
            strokeWidth="3" 
            strokeDasharray="5,5" 
          />

          {/* Texts indicating sector labels */}
          <text x="120" y="80" fill="rgba(255, 255, 255, 0.45)" fontSize="13" fontWeight="700" style={{ pointerEvents: 'none', letterSpacing: '0.05em' }}>UPTOWN</text>
          <text x="100" y="270" fill="rgba(255, 255, 255, 0.45)" fontSize="13" fontWeight="700" style={{ pointerEvents: 'none', letterSpacing: '0.05em' }}>WESTSIDE</text>
          <text x="420" y="130" fill="rgba(255, 255, 255, 0.45)" fontSize="13" fontWeight="700" style={{ pointerEvents: 'none', letterSpacing: '0.05em' }}>DOWNTOWN CORE</text>
          <text x="370" y="325" fill="rgba(255, 255, 255, 0.45)" fontSize="13" fontWeight="700" style={{ pointerEvents: 'none', letterSpacing: '0.05em' }}>HIGHWAY 101 LINK</text>

          {/* Incident Pins */}
          {incidents.map((inc) => {
            let coords = { x: 300, y: 190 };
            if (inc.sector === 'uptown') coords = { x: 160, y: 110 };
            else if (inc.sector === 'westside') coords = { x: 120, y: 220 };
            else if (inc.sector === 'downtown') coords = { x: 450, y: 80 };
            else if (inc.sector === 'highway') coords = { x: 420, y: 290 };

            return (
              <g key={inc.id} style={{ cursor: 'pointer' }}>
                <circle cx={coords.x} cy={coords.y} r="18" fill="rgba(198, 40, 40, 0.15)" stroke="var(--danger)" strokeWidth="1" strokeDasharray="3,2" />
                <circle cx={coords.x} cy={coords.y} r="6" fill="var(--danger)" />
                <path 
                  d={`M ${coords.x} ${coords.y} L ${coords.x - 10} ${coords.y - 25} L ${coords.x + 40} ${coords.y - 25}`} 
                  stroke="rgba(255, 255, 255, 0.25)" 
                  strokeWidth="1" 
                  fill="none" 
                />
                <text x={coords.x + 8} y={coords.y - 29} fill="var(--danger)" fontSize="10" fontWeight="800">
                  {inc.type}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Dynamic Tooltip Popup overlay (Light Solid Color Card for perfect contrast) */}
        {hoveredSector && (
          <div 
            style={{
              position: 'absolute',
              top: tooltipPos.y,
              left: tooltipPos.x,
              background: 'var(--card-bg)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '14px',
              pointerEvents: 'none',
              boxShadow: 'var(--shadow-md)',
              zIndex: 10,
              minWidth: '190px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px', marginBottom: '2px' }}>
              <span style={{ fontSize: '13px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--primary)', letterSpacing: '0.02em' }}>
                {hoveredSector.name}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
              <span style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>Congestion:</span>
              <span style={{ fontWeight: '700', color: hoveredSector.congestion > 65 ? 'var(--danger)' : hoveredSector.congestion > 35 ? 'var(--warning)' : 'var(--success)' }}>
                {hoveredSector.congestion}%
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
              <span style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>Flow Speed:</span>
              <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{hoveredSector.speed} mph</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
              <span style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>Traffic Load:</span>
              <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{hoveredSector.flowRate} veh/h</span>
            </div>
            {hoveredSector.diversionActive && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(15, 76, 129, 0.08)', borderRadius: '4px', padding: '4px 6px', marginTop: '6px', fontSize: '10px', color: 'var(--primary)', fontWeight: '700' }}>
                <ArrowUpRight size={12} />
                <span>AI Diversion Active</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
