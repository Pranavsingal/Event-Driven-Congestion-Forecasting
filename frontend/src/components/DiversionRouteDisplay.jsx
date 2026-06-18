import React from 'react';
import { Navigation, Compass, Route, HelpCircle } from 'lucide-react';

export default function DiversionRouteDisplay({ diversions }) {
  if (!diversions || diversions.length === 0) {
    return (
      <div className="glass" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        Generating alternate diversion routes...
      </div>
    );
  }

  // Helper colors for ranks
  const getRankBadgeColor = (rank) => {
    if (rank === 1) return { bg: 'rgba(6, 182, 212, 0.15)', text: '#06b6d4', border: '#06b6d4' }; // Cyan (Best)
    if (rank === 2) return { bg: 'rgba(34, 197, 94, 0.15)', text: '#22c55e', border: '#22c55e' }; // Green
    return { bg: 'rgba(245, 158, 11, 0.15)', text: '#f59e0b', border: '#f59e0b' }; // Amber
  };

  return (
    <div className="glass" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', background: 'var(--card-bg)' }}>
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Navigation size={16} color="var(--primary)" />
          <span style={{ fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-primary)' }}>
            AI Suggested Diversion Routes
          </span>
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>
          Top-3 Ranked Alternates
        </div>
      </div>

      {/* Routes List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {diversions.map((route) => {
          const badge = getRankBadgeColor(route.rank);
          return (
            <div 
              key={route.rank}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '12px 16px',
                gap: '16px',
                flexWrap: 'wrap'
              }}
            >
              {/* Left Side: Rank Badge + Route Info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '200px' }}>
                <div 
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: badge.bg,
                    color: badge.text,
                    border: `1px solid ${badge.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '800',
                    fontSize: '12px',
                    flexShrink: 0
                  }}
                >
                  {route.rank}
                </div>
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
                    {route.route_name}
                  </h4>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>
                    {route.reason}
                  </span>
                </div>
              </div>

              {/* Right Side: Distance + ETA */}
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                {/* Distance */}
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>Distance</div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)' }}>
                    {route.distance_km} <span style={{ fontSize: '10px', fontWeight: 'normal' }}>km</span>
                  </div>
                </div>

                {/* ETA */}
                <div style={{ textAlign: 'right', minWidth: '60px' }}>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>ETA</div>
                  <div style={{ fontSize: '13px', fontWeight: '800', color: 'var(--primary-light)' }}>
                    {route.eta_mins} <span style={{ fontSize: '10px', fontWeight: 'normal' }}>mins</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
