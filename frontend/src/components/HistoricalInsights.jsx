import React, { useState } from 'react';
import { ChevronDown, ChevronUp, History, TrendingUp, Clock, AlertCircle } from 'lucide-react';

export default function HistoricalInsights({ insights }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!insights) {
    return (
      <div className="glass" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        Retrieving historical insights...
      </div>
    );
  }

  const { avg_duration, peak_hour, similar_incidents = [] } = insights;

  return (
    <div className="glass" style={{ background: 'var(--card-bg)', overflow: 'hidden' }}>
      {/* Header (Acts as the expander trigger) */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{ 
          padding: '16px 24px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          cursor: 'pointer',
          borderBottom: isOpen ? '1px solid var(--border-color)' : 'none',
          userSelect: 'none'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <History size={16} color="var(--primary)" />
          <span style={{ fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-primary)' }}>
            Historical Insights & Zone Analytics
          </span>
        </div>
        <div>
          {isOpen ? <ChevronUp size={18} color="var(--text-secondary)" /> : <ChevronDown size={18} color="var(--text-secondary)" />}
        </div>
      </div>

      {/* Expander Content */}
      {isOpen && (
        <div className="animate-fade-in" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Main Metrics (Avg Duration & Peak Times) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            
            {/* Avg Duration in this Zone */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <TrendingUp size={20} color="var(--primary)" />
              <div>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold', display: 'block' }}>
                  Zone Avg Duration
                </span>
                <span style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-primary)' }}>
                  {avg_duration} mins
                </span>
              </div>
            </div>

            {/* Zone Peak Hour */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <Clock size={20} color="var(--warning)" />
              <div>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold', display: 'block' }}>
                  Zone Peak Hour
                </span>
                <span style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-primary)' }}>
                  {peak_hour}
                </span>
              </div>
            </div>

          </div>

          {/* Similar Past Incidents */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <AlertCircle size={14} color="var(--primary)" />
              <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                Similar Past Incidents in Zone
              </span>
            </div>
            {similar_incidents.length === 0 ? (
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', background: 'var(--bg-secondary)', padding: '10px', borderRadius: '6px', textAlign: 'center' }}>
                No similar past incidents found in this zone.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {similar_incidents.map((inc, index) => (
                  <div 
                    key={index}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: 'var(--bg-secondary)',
                      borderRadius: '6px',
                      padding: '8px 12px',
                      fontSize: '12px',
                      border: '1px solid var(--border-color)'
                    }}
                  >
                    <span style={{ fontWeight: '700', color: 'var(--primary-light)', fontFamily: 'var(--font-mono)' }}>
                      {inc.id}
                    </span>
                    <span style={{ color: 'var(--text-secondary)' }}>
                      {inc.corridor}
                    </span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
                      {inc.date}
                    </span>
                    <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>
                      {inc.duration} mins
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
