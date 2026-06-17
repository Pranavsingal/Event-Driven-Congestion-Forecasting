import React from 'react';
import { Activity, AlertTriangle, Navigation, Zap } from 'lucide-react';

export default function MetricCards({ stats }) {
  const { congestionIndex, activeIncidents, avgSpeed, predictionAccuracy } = stats;

  // Helper to determine status color for congestion
  const getCongestionColor = (val) => {
    if (val < 35) return 'var(--clr-green)';
    if (val < 65) return 'var(--clr-yellow)';
    return 'var(--clr-red)';
  };

  const getMetricCardsData = () => [
    {
      title: 'Congestion Index',
      value: `${congestionIndex}%`,
      icon: <Activity size={22} />,
      color: getCongestionColor(congestionIndex),
      desc: congestionIndex > 65 ? 'Critical delays detected' : congestionIndex > 35 ? 'Moderate flow constraints' : 'Optimal traffic conditions',
    },
    {
      title: 'Active Incidents',
      value: activeIncidents,
      icon: <AlertTriangle size={22} />,
      color: activeIncidents > 3 ? 'var(--clr-red)' : activeIncidents > 0 ? 'var(--clr-yellow)' : 'var(--clr-green)',
      desc: activeIncidents > 0 ? `${activeIncidents} blockages requiring dispatch` : 'No major road obstructions',
    },
    {
      title: 'Average Network Speed',
      value: `${avgSpeed} mph`,
      icon: <Navigation size={22} />,
      color: avgSpeed < 20 ? 'var(--clr-red)' : avgSpeed < 40 ? 'var(--clr-yellow)' : 'var(--clr-green)',
      desc: `Flow relative to 55 mph baseline`,
    },
    {
      title: 'AI Forecast Precision',
      value: typeof predictionAccuracy === 'number' ? `${predictionAccuracy}%` : predictionAccuracy,
      icon: <Zap size={22} />,
      color: typeof predictionAccuracy === 'number' ? 'var(--clr-indigo)' : 'var(--text-muted)',
      desc: typeof predictionAccuracy === 'number' ? 'Confidence in current prediction' : 'Model training required',
    }
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', width: '100%' }}>
      {getMetricCardsData().map((card, idx) => (
        <div 
          key={idx} 
          className="glass glass-interactive animate-fade-in" 
          style={{ 
            padding: '20px', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '12px',
            position: 'relative',
            overflow: 'hidden',
            animationDelay: `${idx * 0.05}s`
          }}
        >
          {/* Subtle colored accent glow line on top of each card */}
          <div style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            height: '3px', 
            background: card.color,
            boxShadow: `0 2px 8px ${card.color}` 
          }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>{card.title}</span>
            <div style={{ color: card.color }}>
              {card.icon}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <h3 style={{ fontSize: '32px', fontWeight: '700', fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>
              {card.value}
            </h3>
          </div>

          <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ 
              width: '6px', 
              height: '6px', 
              borderRadius: '50%', 
              backgroundColor: card.color, 
              display: 'inline-block' 
            }} />
            {card.desc}
          </div>
        </div>
      ))}
    </div>
  );
}
