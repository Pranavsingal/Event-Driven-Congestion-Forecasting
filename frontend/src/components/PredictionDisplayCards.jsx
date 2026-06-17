import React from 'react';
import { Cpu, AlertCircle, Clock, Construction, Percent } from 'lucide-react';

export default function PredictionDisplayCards({ predictionData }) {
  if (!predictionData) {
    return (
      <div className="glass" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading AI Forecast matrices...
      </div>
    );
  }

  const {
    severity,
    severityConfidence,
    durationMins,
    durationRange,
    closureRequired,
    closureProbability,
    forecastedFlowRate
  } = predictionData;

  // Color mapping based on severity
  const getThemeColor = () => {
    if (severity === 'Critical') return 'var(--clr-red)';
    if (severity === 'High') return 'var(--clr-red)';
    if (severity === 'Moderate') return 'var(--clr-yellow)';
    return 'var(--clr-green)';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
      {/* Panel Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '12px' }}>
        <Cpu size={16} color="var(--clr-indigo)" />
        <span style={{ fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>
          Active AI Inference Predictions
        </span>
      </div>

      {/* Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        
        {/* Card 1: Severity (XGBoost) */}
        <div 
          className="glass animate-fade-in" 
          style={{ 
            padding: '16px', 
            position: 'relative', 
            overflow: 'hidden', 
            borderLeft: `3px solid ${getThemeColor()}`
          }}
        >
          <div style={{ display: 'flex', justifyBetween: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Severity Classifier</span>
            <span style={{ fontSize: '9px', padding: '2px 6px', background: 'rgba(255,255,255,0.04)', borderRadius: '4px', color: 'var(--text-muted)' }}>XGBoost</span>
          </div>

          <h4 style={{ fontSize: '22px', fontWeight: '700', color: getThemeColor(), margin: '4px 0' }}>
            {severity}
          </h4>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
            <Percent size={12} color="var(--clr-indigo)" />
            <span>Confidence: <strong style={{ color: 'var(--text-primary)' }}>{severityConfidence}</strong></span>
          </div>
        </div>

        {/* Card 2: Duration (Random Forest) */}
        <div 
          className="glass animate-fade-in" 
          style={{ 
            padding: '16px', 
            position: 'relative', 
            overflow: 'hidden',
            borderLeft: '3px solid var(--clr-yellow)',
            animationDelay: '0.05s'
          }}
        >
          <div style={{ display: 'flex', justifyBetween: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Duration Regressor</span>
            <span style={{ fontSize: '9px', padding: '2px 6px', background: 'rgba(255,255,255,0.04)', borderRadius: '4px', color: 'var(--text-muted)' }}>Random Forest</span>
          </div>

          <h4 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text-primary)', margin: '4px 0', display: 'flex', alignItems: 'baseline', gap: '4px' }}>
            {durationMins} <span style={{ fontSize: '13px', fontWeight: 'normal', color: 'var(--text-secondary)' }}>mins</span>
          </h4>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
            <Clock size={12} color="var(--clr-yellow)" />
            <span>Expected: <strong style={{ color: 'var(--text-primary)' }}>{durationRange}</strong></span>
          </div>
        </div>

        {/* Card 3: Closure Risk (LightGBM) */}
        <div 
          className="glass animate-fade-in" 
          style={{ 
            padding: '16px', 
            position: 'relative', 
            overflow: 'hidden',
            borderLeft: `3px solid ${closureRequired ? 'var(--clr-red)' : 'var(--clr-green)'}`,
            animationDelay: '0.1s'
          }}
        >
          <div style={{ display: 'flex', justifyBetween: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Closure Classifier</span>
            <span style={{ fontSize: '9px', padding: '2px 6px', background: 'rgba(255,255,255,0.04)', borderRadius: '4px', color: 'var(--text-muted)' }}>LightGBM</span>
          </div>

          <h4 style={{ fontSize: '20px', fontWeight: '700', color: closureRequired ? 'var(--clr-red)' : 'var(--clr-green)', margin: '4px 0' }}>
            {closureRequired ? 'Closure Required' : 'No Closure'}
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
              <span>Probability:</span>
              <strong style={{ color: 'var(--text-primary)' }}>{closureProbability}</strong>
            </div>
            {/* Tiny progress bar */}
            <div style={{ height: '4px', background: 'rgba(255,255,255,0.04)', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ 
                width: closureProbability, 
                height: '100%', 
                background: closureRequired ? 'var(--clr-red)' : 'var(--clr-green)' 
              }} />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
