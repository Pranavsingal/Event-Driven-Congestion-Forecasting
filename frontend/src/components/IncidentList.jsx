import React from 'react';
import { Send, Clock, ShieldAlert, CheckCircle, Truck } from 'lucide-react';

export default function IncidentList({ incidents, onDispatch }) {
  const getSeverityBadge = (level) => {
    switch (level) {
      case 'High':
      case 'Critical':
        return <span style={{ padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', background: '#ffebee', color: 'var(--danger)' }}>{level}</span>;
      case 'Moderate':
        return <span style={{ padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', background: '#fff3e0', color: 'var(--warning)' }}>{level}</span>;
      default:
        return <span style={{ padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', background: '#e8f5e9', color: 'var(--success)' }}>{level}</span>;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'dispatched':
        return <Truck size={14} color="var(--warning)" />;
      case 'resolved':
        return <CheckCircle size={14} color="var(--success)" />;
      default:
        return <Clock size={14} color="var(--text-muted)" />;
    }
  };

  return (
    <div className="glass" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', height: '100%', background: 'var(--card-bg)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px' }}>
        <ShieldAlert size={18} color="var(--danger)" />
        <h2 style={{ fontSize: '18px', margin: 0, color: 'var(--text-primary)' }}>Incident Dispatch Logs</h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', maxHeight: '380px' }}>
        {incidents.length === 0 ? (
          <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
            <CheckCircle size={32} color="var(--success)" />
            <span style={{ fontSize: '14px' }}>No active incidents reported in this layout.</span>
          </div>
        ) : (
          incidents.map((inc) => (
            <div 
              key={inc.id}
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '10px',
                padding: '14px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '12px',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>{inc.title}</span>
                  {getSeverityBadge(inc.severity)}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Sector: <strong style={{ color: 'var(--text-primary)', textTransform: 'capitalize' }}>{inc.sector}</strong> | Reported: {inc.reportedAt}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  Impact: {inc.impact}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  {getStatusIcon(inc.status)}
                  <span style={{ textTransform: 'capitalize' }}>Dispatch: <strong style={{ color: 'var(--text-primary)' }}>{inc.status}</strong></span>
                </div>
              </div>

              {inc.status === 'pending' && (
                <button
                  type="button"
                  onClick={() => onDispatch(inc.id)}
                  style={{
                    background: 'var(--primary)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '8px 14px',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: 'var(--shadow-sm)',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                  }}
                >
                  <Send size={12} />
                  Dispatch
                </button>
              )}

              {inc.status === 'dispatched' && (
                <button
                  type="button"
                  onClick={() => onDispatch(inc.id)}
                  style={{
                    background: '#e8f5e9',
                    color: 'var(--success)',
                    border: '1px solid var(--success)',
                    borderRadius: '6px',
                    padding: '8px 14px',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.2s'
                  }}
                >
                  <CheckCircle size={12} />
                  Clear Unit
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
