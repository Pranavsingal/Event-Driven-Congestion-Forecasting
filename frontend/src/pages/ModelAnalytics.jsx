import React from 'react';
import { Cpu, ShieldCheck, TrendingUp, BarChart2, CheckCircle2 } from 'lucide-react';

export default function ModelAnalytics() {
  const modelMetrics = [
    { name: 'Severity Classifier', algorithm: 'XGBoost v1.7', accuracy: '94.2%', precision: '93.8%', metricName: 'F1-Score', metricVal: '0.940', status: 'Active (Production)' },
    { name: 'Duration Regressor', algorithm: 'Random Forest', accuracy: '--', precision: '--', metricName: 'MAE', metricVal: '3.4 mins', status: 'Active (Production)' },
    { name: 'Closure Classifier', algorithm: 'LightGBM', accuracy: '97.8%', precision: '96.5%', metricName: 'ROC-AUC', metricVal: '0.982', status: 'Active (Production)' },
    { name: 'DL Congestion Forecaster', algorithm: 'LSTM Neural Net', accuracy: '95.1%', precision: '94.9%', metricName: 'RMSE', metricVal: '0.045', status: 'Training (Shadow Mode)' }
  ];

  const featureImportances = [
    { rank: 1, feature: 'Scheduled Event Capacity (Cap)', weight: 0.38, color: 'var(--clr-indigo)' },
    { rank: 2, feature: 'Historical Hourly Traffic Volume', weight: 0.24, color: 'var(--clr-blue)' },
    { rank: 3, feature: 'Precipitation/Precipitation Intensity', weight: 0.16, color: 'var(--clr-yellow)' },
    { rank: 4, feature: 'Current Segment Average Speed', weight: 0.12, color: 'var(--clr-pink)' },
    { rank: 5, feature: 'Signal Cycle Timings', weight: 0.07, color: 'var(--clr-green)' },
    { rank: 6, feature: 'Day of Week / Holiday Flag', weight: 0.03, color: 'var(--text-muted)' }
  ];

  return (
    <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
      {/* Models Status and Metrics Card */}
      <div className="glass" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '20px' }}>
          <Cpu size={22} color="var(--clr-indigo)" />
          <h2 style={{ fontSize: '22px', margin: 0 }}>AI Engine Model Registry</h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {modelMetrics.map((model, idx) => (
            <div 
              key={idx}
              style={{
                background: 'rgba(0, 0, 0, 0.18)',
                border: '1px solid rgba(255, 255, 255, 0.04)',
                borderRadius: '12px',
                padding: '20px',
                display: 'grid',
                gridTemplateColumns: '2fr 1.5fr 1.5fr 1fr',
                alignItems: 'center',
                gap: '16px'
              }}
            >
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={16} color="var(--clr-green)" />
                  {model.name}
                </h3>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Engine: {model.algorithm}</span>
              </div>

              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>F1 / MAE / ROC-AUC</div>
                <div style={{ fontSize: '15px', fontWeight: '600', color: 'var(--clr-yellow)' }}>
                  {model.metricVal} <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>({model.metricName})</span>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Engine Accuracy</div>
                <div style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)' }}>{model.accuracy}</div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ 
                  display: 'inline-block', 
                  padding: '4px 10px', 
                  borderRadius: '20px', 
                  fontSize: '10px', 
                  fontWeight: 'bold', 
                  background: model.status.includes('Production') ? 'rgba(16, 185, 129, 0.12)' : 'rgba(99, 102, 241, 0.12)', 
                  color: model.status.includes('Production') ? 'var(--clr-green)' : 'var(--clr-indigo)',
                  border: `1px solid ${model.status.includes('Production') ? 'rgba(16, 185, 129, 0.2)' : 'rgba(99, 102, 241, 0.2)'}`
                }}>
                  {model.status.split(' ')[0]}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Feature Importance Column */}
      <div className="glass" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '20px' }}>
          <TrendingUp size={22} color="var(--clr-yellow)" />
          <h2 style={{ fontSize: '20px', margin: 0 }}>Gini Feature Importance</h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
          {featureImportances.map((f, idx) => (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>
                  {f.rank}. {f.feature}
                </span>
                <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {Math.round(f.weight * 100)}%
                </span>
              </div>
              <div style={{ height: '6px', background: 'rgba(255,255,255,0.04)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ 
                  width: `${f.weight * 100}%`, 
                  height: '100%', 
                  background: f.color, 
                  borderRadius: '3px',
                  boxShadow: `0 0 10px ${f.color}`
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
