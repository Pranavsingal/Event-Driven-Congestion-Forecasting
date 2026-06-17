import React from 'react';
import { Activity, AlertTriangle, Navigation, Zap } from 'lucide-react';

export default function MetricCards({ stats }) {
  const { congestionIndex, activeIncidents, avgSpeed, predictionAccuracy } = stats;

  // Helper to determine status color and css class for left border accent
  const getCongestionDetails = (val) => {
    if (val < 35) return { color: 'var(--success)', statusClass: 'success', desc: 'Optimal traffic conditions' };
    if (val < 65) return { color: 'var(--warning)', statusClass: 'warning', desc: 'Moderate flow constraints' };
    return { color: 'var(--danger)', statusClass: 'danger', desc: 'Critical delays detected' };
  };

  const getIncidentsDetails = (count) => {
    if (count > 3) return { color: 'var(--danger)', statusClass: 'danger', desc: `${count} blockages requiring dispatch` };
    if (count > 0) return { color: 'var(--warning)', statusClass: 'warning', desc: `${count} blockages requiring dispatch` };
    return { color: 'var(--success)', statusClass: 'success', desc: 'No major road obstructions' };
  };

  const getSpeedDetails = (speed) => {
    if (speed < 20) return { color: 'var(--danger)', statusClass: 'danger', desc: 'Heavy delays' };
    if (speed < 40) return { color: 'var(--warning)', statusClass: 'warning', desc: 'Slowing segment velocities' };
    return { color: 'var(--success)', statusClass: 'success', desc: 'Flow relative to 55 mph baseline' };
  };

  const cDet = getCongestionDetails(congestionIndex);
  const iDet = getIncidentsDetails(activeIncidents);
  const sDet = getSpeedDetails(avgSpeed);

  const getMetricCardsData = () => [
    {
      title: 'Congestion Index',
      value: `${congestionIndex}%`,
      icon: <Activity size={20} />,
      color: cDet.color,
      statusClass: cDet.statusClass,
      desc: cDet.desc,
    },
    {
      title: 'Active Incidents',
      value: activeIncidents,
      icon: <AlertTriangle size={20} />,
      color: iDet.color,
      statusClass: iDet.statusClass,
      desc: iDet.desc,
    },
    {
      title: 'Average Network Speed',
      value: `${avgSpeed} mph`,
      icon: <Navigation size={20} />,
      color: sDet.color,
      statusClass: sDet.statusClass,
      desc: sDet.desc,
    },
    {
      title: 'AI Forecast Precision',
      value: typeof predictionAccuracy === 'number' ? `${predictionAccuracy}%` : predictionAccuracy,
      icon: <Zap size={20} />,
      color: 'var(--primary)',
      statusClass: '', // default primary border
      desc: typeof predictionAccuracy === 'number' ? 'Confidence in current prediction' : 'Model training required',
    }
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', width: '100%' }}>
      {getMetricCardsData().map((card, idx) => (
        <div 
          key={idx} 
          className={`metric-card glass-interactive animate-fade-in ${card.statusClass}`} 
          style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '12px',
            animationDelay: `${idx * 0.04}s`,
            background: 'var(--card-bg)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>{card.title}</span>
            <div style={{ color: card.color }}>
              {card.icon}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <h3 style={{ fontSize: '28px', fontWeight: '800', fontFamily: 'var(--font-primary)', color: 'var(--text-primary)' }}>
              {card.value}
            </h3>
          </div>

          <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
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
