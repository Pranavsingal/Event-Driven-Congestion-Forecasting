import React from 'react';
import { Cpu, AlertTriangle } from 'lucide-react';

export default function PredictionDisplayCards() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
      {/* Panel Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
        <Cpu size={16} color="var(--warning)" />
        <span style={{ fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>
          Active AI Inference Predictions
        </span>
      </div>

      {/* Warning Alert Panel about Untrained Models */}
      <div className="glass" style={{ padding: '20px', display: 'flex', gap: '16px', alignItems: 'center', borderLeft: '4px solid var(--warning)', background: 'var(--card-bg)' }}>
        <AlertTriangle size={36} color="var(--warning)" style={{ flexShrink: 0 }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <h4 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>ML Inference Offline (Untrained Models)</h4>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '145%' }}>
            Real-time inference predictions cannot be calculated because the classifier scripts (e.g. <code>closure_classifier.py</code>) are empty placeholder templates. Train the models on historical event datasets inside the <code>ai-service/models/</code> module to enable prediction outputs.
          </p>
        </div>
      </div>

      {/* Cards Grid showing N/A status */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        
        {/* Card 1: Severity (XGBoost) */}
        <div 
          className="glass animate-fade-in" 
          style={{ 
            padding: '16px', 
            borderLeft: '3px solid var(--text-muted)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Severity Classifier</span>
            <span style={{ fontSize: '9px', padding: '2px 6px', background: 'rgba(255,255,255,0.04)', borderRadius: '4px', color: 'var(--text-muted)' }}>XGBoost</span>
          </div>
          <h4 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-muted)', margin: '4px 0' }}>
            N/A (Untrained)
          </h4>
        </div>

        {/* Card 2: Duration (Random Forest) */}
        <div 
          className="glass animate-fade-in" 
          style={{ 
            padding: '16px', 
            borderLeft: '3px solid var(--text-muted)',
            animationDelay: '0.05s'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Duration Regressor</span>
            <span style={{ fontSize: '9px', padding: '2px 6px', background: 'rgba(255,255,255,0.04)', borderRadius: '4px', color: 'var(--text-muted)' }}>Random Forest</span>
          </div>
          <h4 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-muted)', margin: '4px 0' }}>
            N/A (Untrained)
          </h4>
        </div>

        {/* Card 3: Closure Risk (LightGBM) */}
        <div 
          className="glass animate-fade-in" 
          style={{ 
            padding: '16px', 
            borderLeft: '3px solid var(--text-muted)',
            animationDelay: '0.1s'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Closure Classifier</span>
            <span style={{ fontSize: '9px', padding: '2px 6px', background: 'rgba(255,255,255,0.04)', borderRadius: '4px', color: 'var(--text-muted)' }}>LightGBM</span>
          </div>
          <h4 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-muted)', margin: '4px 0' }}>
            N/A (Untrained)
          </h4>
        </div>

      </div>
    </div>
  );
}
