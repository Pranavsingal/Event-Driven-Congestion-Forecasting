import React from 'react';
import { Filter, Sliders, ShieldAlert, Sparkles, Calendar } from 'lucide-react';

export default function SidebarFilters({ filters, setFilters }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="glass sidebar-container" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '16px' }}>
        <Sliders size={20} color="var(--clr-indigo)" />
        <h2 style={{ fontSize: '18px', margin: 0 }}>Control Center</h2>
      </div>

      {/* AI Mode Toggles */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Forecasting Engine
        </label>
        <div style={{ display: 'flex', background: 'rgba(0, 0, 0, 0.25)', borderRadius: '8px', padding: '4px' }}>
          <button 
            type="button"
            onClick={() => setFilters(prev => ({ ...prev, mode: 'reactive' }))}
            style={{
              flex: 1,
              padding: '8px',
              border: 'none',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: '500',
              cursor: 'pointer',
              background: filters.mode === 'reactive' ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
              color: filters.mode === 'reactive' ? 'var(--text-primary)' : 'var(--text-muted)',
              transition: 'all 0.2s'
            }}
          >
            Reactive (Live)
          </button>
          <button 
            type="button"
            onClick={() => setFilters(prev => ({ ...prev, mode: 'predictive' }))}
            style={{
              flex: 1,
              padding: '8px',
              border: 'none',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: '500',
              cursor: 'pointer',
              background: filters.mode === 'predictive' ? 'var(--clr-indigo)' : 'transparent',
              color: 'var(--text-primary)',
              boxShadow: filters.mode === 'predictive' ? '0 0 12px rgba(99, 102, 241, 0.4)' : 'none',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <Sparkles size={14} />
            AI Predictive
          </button>
        </div>
      </div>

      {/* Time of Day */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label htmlFor="timeOfDay" style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>
          Time Period
        </label>
        <select 
          id="timeOfDay"
          name="timeOfDay"
          value={filters.timeOfDay} 
          onChange={handleChange}
          style={{ width: '100%' }}
        >
          <option value="morning">Morning Peak (07:00 - 09:30)</option>
          <option value="midday">Mid-Day (10:00 - 15:30)</option>
          <option value="evening">Evening Peak (16:00 - 19:30)</option>
          <option value="night">Night Run (20:00 - 06:00)</option>
        </select>
      </div>

      {/* External Event Trigger */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Calendar size={15} color="var(--clr-yellow)" />
          <label htmlFor="event" style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>
            Urban Event Trigger
          </label>
        </div>
        <select 
          id="event"
          name="event"
          value={filters.event} 
          onChange={handleChange}
          style={{ width: '100%' }}
        >
          <option value="none">Standard Patterns (None)</option>
          <option value="stadium_concert">Rock Concert (Sold Out, Cap: 50K)</option>
          <option value="derby_match">Local Derby (High Tension, Cap: 70K)</option>
          <option value="rain_storm">Severe Downpour (Flooding Warning)</option>
          <option value="highway_maintenance">Highway 101 Expansion (Lane Closure)</option>
        </select>
      </div>

      {/* Severity Filter */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ShieldAlert size={15} color="var(--clr-red)" />
          <label htmlFor="severity" style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>
            Congestion Level Focus
          </label>
        </div>
        <select 
          id="severity"
          name="severity"
          value={filters.severity} 
          onChange={handleChange}
          style={{ width: '100%' }}
        >
          <option value="all">Display All Sectors</option>
          <option value="low">Low Congestion Only</option>
          <option value="moderate">Moderate Congestion Only</option>
          <option value="heavy">Critical/Heavy Only</option>
        </select>
      </div>

      {/* Simulation Meta Stats */}
      <div style={{ marginTop: 'auto', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px', padding: '14px', border: '1px solid rgba(255, 255, 255, 0.04)' }}>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
          Network Load Metrics
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '12px' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Sensors reporting:</span>
          <span style={{ fontWeight: '600' }}>142 / 142</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '12px' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Update rate:</span>
          <span style={{ color: 'var(--clr-green)', fontWeight: '600' }}>1.2s (Realtime)</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Data Latency:</span>
          <span style={{ fontWeight: '600' }}>18ms</span>
        </div>
      </div>
    </div>
  );
}
