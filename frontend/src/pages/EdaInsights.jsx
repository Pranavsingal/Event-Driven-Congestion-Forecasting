import React from 'react';
import { BarChart2, TrendingUp, Calendar, AlertTriangle, Layers } from 'lucide-react';

export default function EdaInsights() {
  const AI_SERVICE_URL = import.meta.env.VITE_AI_SERVICE_URL || 
    (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
      ? 'http://localhost:8000'
      : '/api/ai');

  const charts = [
    {
      title: 'Top 5 Traffic Incident Causes',
      description: 'Historical breakdown of leading event causes across Bangalore corridors.',
      filename: 'top5_causes.png',
      icon: <AlertTriangle size={18} color="var(--primary)" />
    },
    {
      title: 'Incidents by Hour of Day',
      description: 'Volume distribution highlighting morning and evening peak hour spikes.',
      filename: 'incidents_by_hour.png',
      icon: <TrendingUp size={18} color="var(--warning)" />
    },
    {
      title: 'Incidents by Day of Week',
      description: 'Weekly breakdown mapping weekend vs. weekday traffic bottleneck profiles.',
      filename: 'incidents_by_day.png',
      icon: <Calendar size={18} color="var(--success)" />
    },
    {
      title: 'Incident Threat Severity Split',
      description: 'Percentage distribution of severity levels across historically logged alerts.',
      filename: 'severity_split.png',
      icon: <Layers size={18} color="var(--primary-light)" />
    },
    {
      title: 'Corridor Heatmap Analysis',
      description: 'Correlation matrix comparing top 10 corridors against time-of-day peak volumes.',
      filename: 'corridor_heatmap.png',
      icon: <BarChart2 size={18} color="var(--primary)" />
    }
  ];

  return (
    <div className="glass animate-fade-in" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '24px', background: 'var(--card-bg)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px' }}>
        <BarChart2 size={24} color="var(--primary)" />
        <div>
          <h2 style={{ fontSize: '22px', margin: 0, color: 'var(--text-primary)' }}>Exploratory Data Analysis (EDA) Insights</h2>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Pre-generated historical data charts visualised directly from the ML training pipeline.</span>
        </div>
      </div>

      {/* Charts List Stack / Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
        {charts.map((chart, idx) => (
          <div 
            key={idx} 
            className="glass" 
            style={{ 
              background: 'var(--bg-secondary)', 
              border: '1px solid var(--border-color)', 
              borderRadius: '12px', 
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}
          >
            {/* Title & Description */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {chart.icon}
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
                  {chart.title}
                </h3>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{chart.description}</span>
              </div>
            </div>

            {/* Image Container with Dark Overlay Border */}
            <div 
              style={{ 
                width: '100%', 
                background: '#111111', 
                borderRadius: '8px', 
                border: '1px solid var(--border-color)', 
                overflow: 'hidden',
                display: 'flex',
                justifyContent: 'center',
                padding: '10px'
              }}
            >
              <img 
                src={`${AI_SERVICE_URL}/charts/${chart.filename}`} 
                alt={chart.title}
                style={{ 
                  maxWidth: '100%', 
                  height: 'auto', 
                  maxHeight: '450px',
                  display: 'block',
                  borderRadius: '4px'
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentNode.innerHTML = `<div style="padding: 40px; color: var(--text-muted); font-size: 13px;">Pre-generated chart (${chart.filename}) not found. Run pipeline training to output the image.</div>`;
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
