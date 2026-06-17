import React from 'react';
import { Cpu, Clock, ShieldAlert, Percent, CheckCircle } from 'lucide-react';

export default function PredictionDisplayCards({ predictionData }) {
  if (!predictionData) {
    return (
      <div className="glass" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        Fetching live AI predictions...
      </div>
    );
  }

  const {
    severity,
    severityConfidence,
    durationMins,
    durationRange,
    closureRequired,
    closureProbability
  } = predictionData;

  // Determine indicator colors based on severity
  const getThemeColor = () => {
    if (severity === 'Critical' || severity === 'High') return 'var(--danger)';
    if (severity === 'Moderate') return 'var(--warning)';
    return 'var(--success)';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
      {/* Panel Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Cpu size={16} color="var(--primary)" />
          <span style={{ fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-primary)' }}>
            AI Real-Time Inference Predictions
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--success)', fontWeight: '700' }}>
          <span className="pulse-dot"></span>
          <span>Inference Engine: ONLINE</span>
        </div>
      </div>

      {/* Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        
        {/* Card 1: Severity (XGBoost) */}
        <div 
          className="glass animate-fade-in" 
          style={{ 
            padding: '16px', 
            borderLeft: `4px solid ${getThemeColor()}`,
            background: 'var(--card-bg)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>Severity Level</span>
            <span style={{ fontSize: '9px', padding: '2px 6px', background: 'var(--bg-secondary)', borderRadius: '4px', color: 'var(--text-muted)', fontWeight: 'bold' }}>XGBoost</span>
          </div>

          <h4 style={{ fontSize: '20px', fontWeight: '800', color: getThemeColor(), margin: '4px 0' }}>
            {severity}
          </h4>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
            <Percent size={12} color="var(--primary)" />
            <span>Confidence: <strong style={{ color: 'var(--text-primary)' }}>{severityConfidence}</strong></span>
          </div>
        </div>

        {/* Card 2: Duration (Random Forest) */}
        <div 
          className="glass animate-fade-in" 
          style={{ 
            padding: '16px', 
            borderLeft: '4px solid var(--warning)',
            background: 'var(--card-bg)',
            animationDelay: '0.04s'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>Expected Delay</span>
            <span style={{ fontSize: '9px', padding: '2px 6px', background: 'var(--bg-secondary)', borderRadius: '4px', color: 'var(--text-muted)', fontWeight: 'bold' }}>XGBoost</span>
          </div>

          <h4 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-primary)', margin: '4px 0', display: 'flex', alignItems: 'baseline', gap: '4px' }}>
            {durationMins} <span style={{ fontSize: '13px', fontWeight: 'normal', color: 'var(--text-secondary)' }}>mins</span>
          </h4>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
            <Clock size={12} color="var(--warning)" />
            <span>Range: <strong style={{ color: 'var(--text-primary)' }}>{durationRange}</strong></span>
          </div>
        </div>

        {/* Card 3: Closure Risk (RandomForest) */}
        <div 
          className="glass animate-fade-in" 
          style={{ 
            padding: '16px', 
            borderLeft: `4px solid ${closureRequired ? 'var(--danger)' : 'var(--success)'}`,
            background: 'var(--card-bg)',
            animationDelay: '0.08s'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>Closure Requirement</span>
            <span style={{ fontSize: '9px', padding: '2px 6px', background: 'var(--bg-secondary)', borderRadius: '4px', color: 'var(--text-muted)', fontWeight: 'bold' }}>RandomForest</span>
          </div>

          <h4 style={{ fontSize: '18px', fontWeight: '800', color: closureRequired ? 'var(--danger)' : 'var(--success)', margin: '4px 0' }}>
            {closureRequired ? 'Closure Required' : 'No Closure'}
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
              <span>Probability:</span>
              <strong style={{ color: 'var(--text-primary)' }}>{closureProbability}</strong>
            </div>
            {/* Solid progress bar */}
            <div style={{ height: '4px', background: 'var(--bg-secondary)', borderRadius: '2px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
              <div style={{ 
                width: closureProbability, 
                height: '100%', 
                background: closureRequired ? 'var(--danger)' : 'var(--success)' 
              }} />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
