import React from 'react';
import { Cpu, AlertTriangle, TrendingUp, HelpCircle, CircleDashed } from 'lucide-react';

export default function ModelAnalytics() {
  const modelMetrics = [
    { name: 'Severity Classifier', algorithm: 'XGBoost v1.7', accuracy: 'N/A', precision: 'N/A', metricName: 'F1-Score', metricVal: 'N/A', status: 'Untrained (Empty File)' },
    { name: 'Duration Regressor', algorithm: 'Random Forest', accuracy: 'N/A', precision: 'N/A', metricName: 'MAE', metricVal: 'N/A', status: 'Untrained (Empty File)' },
    { name: 'Closure Classifier', algorithm: 'LightGBM', accuracy: 'N/A', precision: 'N/A', metricName: 'ROC-AUC', metricVal: 'N/A', status: 'Untrained (Empty File)' },
    { name: 'DL Congestion Forecaster', algorithm: 'LSTM Neural Net', accuracy: 'N/A', precision: 'N/A', metricName: 'RMSE', metricVal: 'N/A', status: 'Untrained (Empty File)' }
  ];

  return (
    <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
      {/* Models Status and Metrics Card */}
      <div className="glass" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '24px', background: 'var(--card-bg)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px' }}>
          <Cpu size={22} color="var(--warning)" />
          <h2 style={{ fontSize: '22px', margin: 0, color: 'var(--text-primary)' }}>AI Engine Model Registry</h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {modelMetrics.map((model, idx) => (
            <div 
              key={idx}
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '20px',
                display: 'grid',
                gridTemplateColumns: '2fr 1.5fr 1.5fr 1fr',
                alignItems: 'center',
                gap: '16px'
              }}
            >
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CircleDashed size={16} color="var(--warning)" />
                  {model.name}
                </h3>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Engine: {model.algorithm}</span>
              </div>

              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>F1 / MAE / ROC-AUC</div>
                <div style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-muted)' }}>
                  {model.metricVal} <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>({model.metricName})</span>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Engine Accuracy</div>
                <div style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-muted)' }}>{model.accuracy}</div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ 
                  display: 'inline-block', 
                  padding: '4px 10px', 
                  borderRadius: '20px', 
                  fontSize: '10px', 
                  fontWeight: 'bold', 
                  background: '#fff3e0', 
                  color: 'var(--warning)',
                  border: '1px solid var(--warning)'
                }}>
                  {model.status.split(' ')[0]}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Feature Importance Column */}
      <div className="glass" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '24px', background: 'var(--card-bg)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px' }}>
          <TrendingUp size={22} color="var(--text-muted)" />
          <h2 style={{ fontSize: '20px', margin: 0, color: 'var(--text-secondary)' }}>Feature Importance</h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1, alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px 10px' }}>
          <AlertTriangle size={36} color="var(--warning)" style={{ marginBottom: '8px' }} />
          <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' }}>Weights Unavailable</h3>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '150%' }}>
            Gini feature weights cannot be plotted. The training files (such as <code>closure_classifier.py</code>) are currently empty template shells. Fit models on raw datasets inside <code>ai-service/models/</code> to calculate parameters.
          </p>
        </div>
      </div>
    </div>
  );
}
