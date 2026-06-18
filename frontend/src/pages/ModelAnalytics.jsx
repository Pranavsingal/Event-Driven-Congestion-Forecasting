import React from 'react';
import { Cpu, CheckCircle2, TrendingUp } from 'lucide-react';

export default function ModelAnalytics() {
  const modelMetrics = [
    { name: 'Severity Classifier', algorithm: 'XGBoost v1.7', accuracy: '99.1%', precision: '99.8%', metricName: 'F1-Score', metricVal: '0.99', status: 'Active (Production)' },
    { name: 'Duration Regressor', algorithm: 'XGBoost', accuracy: '88.5%', precision: '89.2%', metricName: 'RMSE', metricVal: '232.4 mins', status: 'Active (Production)' },
    { name: 'Closure Classifier', algorithm: 'RandomForest', accuracy: '88.3%', precision: '89.4%', metricName: 'Weighted F1', metricVal: '0.89', status: 'Active (Production)' },
    { name: 'DL Duration Forecaster', algorithm: 'PyTorch MLP', accuracy: '91.8%', precision: '90.1%', metricName: 'RMSE', metricVal: '183.6 mins', status: 'Active (Production)' }
  ];

  const featureImportances = [
    { rank: 1, feature: 'Scheduled Event Capacity (Cap)', weight: 0.38, color: 'var(--primary)' },
    { rank: 2, feature: 'Historical Hourly segment Volume', weight: 0.24, color: 'var(--primary-light)' },
    { rank: 3, feature: 'Precipitation / Rain Intensity', weight: 0.16, color: 'var(--warning)' },
    { rank: 4, feature: 'Current Segment Average Speed', weight: 0.12, color: 'var(--neutral)' },
    { rank: 5, feature: 'Signal Cycle Timings', weight: 0.07, color: 'var(--success)' },
    { rank: 6, feature: 'Day of Week / Holiday Flag', weight: 0.03, color: 'var(--text-muted)' }
  ];

  const [evalLog, setEvalLog] = React.useState('Loading AI evaluation logs...');

  React.useEffect(() => {
    fetch('/ai-assets/model_eval_report.txt')
      .then(res => res.text())
      .then(text => setEvalLog(text))
      .catch(err => setEvalLog('Failed to load evaluation logs.'));
  }, []);

  return (
    <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
      {/* Models Status and Metrics Card */}
      <div className="glass" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '24px', background: 'var(--card-bg)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px' }}>
          <Cpu size={22} color="var(--primary)" />
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
                <h3 style={{ fontSize: '15px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
                  <CheckCircle2 size={16} color="var(--success)" />
                  {model.name}
                </h3>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Engine: {model.algorithm}</span>
              </div>

              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>F1 / MAE / RMSE</div>
                <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--primary)' }}>
                  {model.metricVal} <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>({model.metricName})</span>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Engine Accuracy</div>
                <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>{model.accuracy}</div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ 
                  display: 'inline-block', 
                  padding: '4px 10px', 
                  borderRadius: '20px', 
                  fontSize: '10px', 
                  fontWeight: 'bold', 
                  background: model.status.includes('Production') ? '#e8f5e9' : 'var(--bg-tertiary)', 
                  color: model.status.includes('Production') ? 'var(--success)' : 'var(--text-secondary)',
                  border: `1px solid ${model.status.includes('Production') ? 'var(--success)' : 'var(--border-color)'}`
                }}>
                  {model.status.split(' ')[0]}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Live Evaluation Logs */}
        <div style={{ marginTop: '20px' }}>
          <h3 style={{ fontSize: '16px', color: 'var(--text-primary)', marginBottom: '12px' }}>Raw Evaluation Output</h3>
          <pre style={{
            background: '#1e1e1e',
            color: '#a9dc76',
            padding: '16px',
            borderRadius: '8px',
            fontSize: '12px',
            fontFamily: 'monospace',
            overflowX: 'auto',
            maxHeight: '300px',
            overflowY: 'auto'
          }}>
            {evalLog}
          </pre>
        </div>
      </div>

      {/* Feature Importance Column */}
      <div className="glass" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '24px', background: 'var(--card-bg)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px' }}>
          <TrendingUp size={22} color="var(--primary)" />
          <h2 style={{ fontSize: '20px', margin: 0, color: 'var(--text-secondary)' }}>Feature Importance</h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Live XGBoost global feature weights determining event severity & duration predictions.</p>
          <img 
            src="/ai-assets/feature_importance.png" 
            alt="Feature Importance Chart" 
            style={{ width: '100%', borderRadius: '8px', border: '1px solid var(--border-color)' }}
          />
        </div>
      </div>
    </div>
  );
}
