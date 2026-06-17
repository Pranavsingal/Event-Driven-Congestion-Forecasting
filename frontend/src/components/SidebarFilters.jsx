import React from 'react';
import { Sliders, Sparkles, Calendar, ShieldAlert } from 'lucide-react';

export default function SidebarFilters({ filters, setFilters }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="glass sidebar-container" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px', height: '100%', background: 'var(--card-bg)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
        <Sliders size={20} color="var(--primary)" />
        <h2 style={{ fontSize: '18px', margin: 0, color: 'var(--text-primary)' }}>Control Center</h2>
      </div>

      {/* AI Mode Toggles */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Forecasting Engine
        </label>
        <div style={{ display: 'flex', background: 'var(--bg-secondary)', borderRadius: '8px', padding: '4px', border: '1px solid var(--border-color)' }}>
          <button 
            type="button"
            onClick={() => setFilters(prev => ({ ...prev, mode: 'reactive' }))}
            style={{
              flex: 1,
              padding: '8px',
              border: 'none',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              background: filters.mode === 'reactive' ? '#fff' : 'transparent',
              color: filters.mode === 'reactive' ? 'var(--primary)' : 'var(--text-secondary)',
              boxShadow: filters.mode === 'reactive' ? 'var(--shadow-sm)' : 'none',
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
              fontWeight: '600',
              cursor: 'pointer',
              background: filters.mode === 'predictive' ? 'var(--primary)' : 'transparent',
              color: filters.mode === 'predictive' ? '#fff' : 'var(--text-secondary)',
              boxShadow: filters.mode === 'predictive' ? 'var(--shadow-sm)' : 'none',
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

      {/* Time & Day Sliders */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px' }}>
        {/* Hour Slider */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>
            <label htmlFor="hour">Start Hour</label>
            <span style={{ color: 'var(--primary)', fontWeight: '700', fontFamily: 'var(--font-mono)' }}>
              {filters.hour ? filters.hour.toString().padStart(2, '0') : '12'}:00 {filters.hour >= 12 ? 'PM' : 'AM'}
            </span>
          </div>
          <input 
            type="range" 
            id="hour" 
            name="hour" 
            min="0" 
            max="23" 
            value={filters.hour || 12} 
            onChange={handleChange}
            style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--primary)' }}
          />
        </div>

        {/* Day of Week Slider */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>
            <label htmlFor="day">Day of Week</label>
            <span style={{ color: 'var(--primary)', fontWeight: '700' }}>
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][(filters.day || 3) - 1]}
            </span>
          </div>
          <input 
            type="range" 
            id="day" 
            name="day" 
            min="1" 
            max="7" 
            value={filters.day || 3} 
            onChange={handleChange}
            style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--primary)' }}
          />
        </div>
      </div>

      {/* Categorical Dropdowns */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        {/* Cause Dropdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label htmlFor="cause" style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>
            Event Cause
          </label>
          <select 
            id="cause"
            name="cause"
            value={filters.cause || 'accident'} 
            onChange={handleChange}
            style={{ width: '100%', borderColor: 'var(--border-color)', color: 'var(--text-primary)', background: 'var(--card-bg)' }}
          >
            <option value="accident">Accident</option>
            <option value="congestion">Regular Congestion</option>
            <option value="construction">Road Construction</option>
            <option value="vip_movement">VIP Movement</option>
            <option value="water_logging">Water Logging</option>
            <option value="vehicle_breakdown">Vehicle Breakdown</option>
            <option value="pot_holes">Potholes</option>
            <option value="public_event">Public Event</option>
          </select>
        </div>

        {/* Corridor Dropdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label htmlFor="corridor" style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>
            Corridor Route
          </label>
          <select 
            id="corridor"
            name="corridor"
            value={filters.corridor || 'Hwy 101 Corridor'} 
            onChange={handleChange}
            style={{ width: '100%', borderColor: 'var(--border-color)', color: 'var(--text-primary)', background: 'var(--card-bg)' }}
          >
            <option value="Hwy 101 Corridor">Hwy 101 Corridor</option>
            <option value="ORR East 1">ORR East 1</option>
            <option value="Hosur Road">Hosur Road</option>
            <option value="Bannerghata Road">Bannerghata Road</option>
            <option value="Bellary Road 1">Bellary Road 1</option>
            <option value="Old Airport Road">Old Airport Road</option>
            <option value="Tumkur Road">Tumkur Road</option>
            <option value="Mysore Road">Mysore Road</option>
          </select>
        </div>

        {/* Zone Dropdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label htmlFor="zone" style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>
            Zone / Sector
          </label>
          <select 
            id="zone"
            name="zone"
            value={filters.zone || 'Downtown Core'} 
            onChange={handleChange}
            style={{ width: '100%', borderColor: 'var(--border-color)', color: 'var(--text-primary)', background: 'var(--card-bg)' }}
          >
            <option value="Downtown Core">Downtown Core</option>
            <option value="Central Zone 1">Central Zone 1</option>
            <option value="East Zone 1">East Zone 1</option>
            <option value="North Zone 1">North Zone 1</option>
            <option value="South Zone 1">South Zone 1</option>
            <option value="West Zone 1">West Zone 1</option>
          </select>
        </div>

        {/* Junction Dropdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label htmlFor="junction" style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>
            Target Junction
          </label>
          <select 
            id="junction"
            name="junction"
            value={filters.junction || 'SilkBoardJunc'} 
            onChange={handleChange}
            style={{ width: '100%', borderColor: 'var(--border-color)', color: 'var(--text-primary)', background: 'var(--card-bg)' }}
          >
            <option value="SilkBoardJunc">Silk Board Junction</option>
            <option value="HebbalFlyoverJunc">Hebbal Flyover Junction</option>
            <option value="TrinityCircle">Trinity Circle Junction</option>
            <option value="DairyCircle">Dairy Circle Junction</option>
            <option value="YeshwanthpuraCircle">Yeshwanthpura Circle</option>
            <option value="AgaraJunction">Agara Junction</option>
          </select>
        </div>

        {/* Vehicle Type Dropdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label htmlFor="veh_type" style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>
            Vehicle Classification
          </label>
          <select 
            id="veh_type"
            name="veh_type"
            value={filters.veh_type || 'private_car'} 
            onChange={handleChange}
            style={{ width: '100%', borderColor: 'var(--border-color)', color: 'var(--text-primary)', background: 'var(--card-bg)' }}
          >
            <option value="private_car">Private Car</option>
            <option value="bmtc_bus">BMTC Bus</option>
            <option value="heavy_vehicle">Heavy Vehicle</option>
            <option value="truck">Truck</option>
            <option value="taxi">Taxi / Ride-Share</option>
            <option value="auto">Auto-Rickshaw</option>
          </select>
        </div>

      </div>

      {/* Simulation Meta Stats */}
      <div style={{ marginTop: 'auto', background: 'var(--bg-secondary)', borderRadius: '8px', padding: '14px', border: '1px solid var(--border-color)' }}>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '8px' }}>
          Network Load Metrics
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '12px' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Sensors reporting:</span>
          <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>142 / 142</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '12px' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Update rate:</span>
          <span style={{ color: 'var(--success)', fontWeight: '600' }}>1.2s (Realtime)</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Data Latency:</span>
          <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>18ms</span>
        </div>
      </div>
    </div>
  );
}
