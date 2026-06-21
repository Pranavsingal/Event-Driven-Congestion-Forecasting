import React from 'react';
import { 
  Shield, 
  Construction, 
  Truck, 
  Wrench, 
  Megaphone, 
  Clock, 
  AlertTriangle, 
  MapPin,
  Activity,
  AlertOctagon
} from 'lucide-react';

export default function DeploymentPlanCards({ planData, filters }) {
  if (!planData) {
    return (
      <div className="glass" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        Generating response and deployment plan...
      </div>
    );
  }

  const {
    severity,
    durationMins,
    closureProbability,
    officersNeeded,
    barricadesCount,
    equipment,
    dayName,
    recommendedDiversion,
    etaResponders
  } = planData;

  const handleDownloadPDF = () => {
    const queryParams = new URLSearchParams({
      cause: filters?.cause || 'Unknown',
      corridor: filters?.corridor || 'Unknown',
      zone: filters?.zone || 'Unknown',
      junction: filters?.junction || 'Unknown',
      veh_type: filters?.veh_type || 'Unknown',
      hour: filters?.hour || 12,
      day: filters?.day || 3,
      event: filters?.event || 'none'
    }).toString();
    const AI_SERVICE_URL = import.meta.env.VITE_AI_SERVICE_URL || 
      (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
        ? 'http://localhost:8000'
        : '/api/ai');
    window.open(`${AI_SERVICE_URL}/pdf?${queryParams}`, '_blank');
  };

  // Colors matching the dashboard severity
  const getSeverityStyles = () => {
    if (severity === 'Critical') return { bg: '#ffebee', border: 'var(--danger)', text: 'var(--danger)' };
    if (severity === 'High') return { bg: '#fff3e0', border: 'var(--warning)', text: 'var(--warning)' };
    if (severity === 'Moderate') return { bg: '#e3f2fd', border: 'var(--info)', text: 'var(--info)' };
    return { bg: '#e8f5e9', border: 'var(--success)', text: 'var(--success)' };
  };

  const styles = getSeverityStyles();

  // Helper to get matching icon for equipment
  const getEquipmentIcon = (name) => {
    const lowercaseName = name.toLowerCase();
    if (lowercaseName.includes('truck') || lowercaseName.includes('recovery')) {
      return <Truck size={16} color="var(--primary)" />;
    }
    if (lowercaseName.includes('pump') || lowercaseName.includes('winch') || lowercaseName.includes('asphalt')) {
      return <Wrench size={16} color="var(--primary-light)" />;
    }
    if (lowercaseName.includes('megaphone') || lowercaseName.includes('vest') || lowercaseName.includes('sign')) {
      return <Megaphone size={16} color="var(--warning)" />;
    }
    return <Construction size={16} color="var(--neutral)" />;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      
      {/* Header and Severity/Duration/Closure Badges */}
      <div className="glass" style={{ padding: '24px', background: 'var(--card-bg)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={16} color="var(--primary)" />
            <span style={{ fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-primary)' }}>
              Junction Tactical Dispatch Plan
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600' }}>
              Simulation Day: <span style={{ color: 'var(--primary)', fontWeight: '700' }}>{dayName}</span>
            </div>
            <button
              onClick={handleDownloadPDF}
              style={{
                background: 'var(--primary)',
                color: '#ffffff',
                border: 'none',
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                boxShadow: 'var(--shadow-sm)',
                transition: 'all 0.2s',
                fontFamily: 'inherit'
              }}
            >
              Download PDF Action Sheet
            </button>
          </div>
        </div>

        {/* Dynamic Badge Indicators */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          
          {/* Severity Badge Card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px 16px', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Threat Level</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertOctagon size={18} color={styles.border} />
              <span style={{ 
                padding: '4px 10px', 
                borderRadius: '20px', 
                fontSize: '13px', 
                fontWeight: '800', 
                background: styles.bg, 
                color: styles.text, 
                border: `1px solid ${styles.border}`,
                display: 'inline-block'
              }}>
                {severity} Severity
              </span>
            </div>
          </div>

          {/* Expected Duration Progress Bar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px 16px', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 'bold', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              <span>Expected Delay</span>
              <span style={{ color: 'var(--text-primary)' }}>{durationMins} mins</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={16} color="var(--primary)" />
              <div style={{ flex: 1, height: '8px', background: 'rgba(0,0,0,0.06)', borderRadius: '4px', overflow: 'hidden', position: 'relative' }}>
                <div style={{ 
                  width: `${Math.min(100, (durationMins / 150) * 100)}%`, 
                  height: '100%', 
                  background: 'var(--primary)', 
                  borderRadius: '4px' 
                }} />
              </div>
            </div>
          </div>

          {/* Closure Probability */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px 16px', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 'bold', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              <span>Closure Probability</span>
              <span style={{ color: 'var(--text-primary)' }}>{closureProbability}%</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={16} color={closureProbability > 50 ? 'var(--danger)' : 'var(--success)'} />
              <div style={{ flex: 1, height: '8px', background: 'rgba(0,0,0,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ 
                  width: `${closureProbability}%`, 
                  height: '100%', 
                  background: closureProbability > 50 ? 'var(--danger)' : 'var(--success)', 
                  borderRadius: '4px' 
                }} />
              </div>
            </div>
          </div>

        </div>

        {/* Tactical Recommendation Info Alert */}
        <div style={{ 
          background: 'var(--bg-primary)', 
          borderLeft: '4px solid var(--primary)', 
          padding: '12px 16px', 
          borderRadius: '4px', 
          fontSize: '13px', 
          lineHeight: '1.4', 
          color: 'var(--text-secondary)',
          display: 'flex',
          gap: '8px',
          alignItems: 'center'
        }}>
          <MapPin size={18} color="var(--primary)" style={{ flexShrink: 0 }} />
          <div>
            <strong>Tactical Route Action: </strong>
            {recommendedDiversion} &bull; Expected responder ETA: <strong style={{ color: 'var(--text-primary)' }}>{etaResponders}</strong>
          </div>
        </div>
      </div>

      {/* Deployment Plan Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        
        {/* Officers Needed Card */}
        <div className="glass" style={{ padding: '20px', background: 'var(--card-bg)', borderLeft: '4px solid var(--primary)', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'var(--bg-secondary)', padding: '12px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={24} color="var(--primary)" />
          </div>
          <div>
            <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Officers Needed</span>
            <h4 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)', margin: '4px 0' }}>
              {officersNeeded} <span style={{ fontSize: '13px', fontWeight: 'normal', color: 'var(--text-secondary)' }}>Personnel</span>
            </h4>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Assigned to traffic gates</span>
          </div>
        </div>

        {/* Barricade Points Card */}
        <div className="glass" style={{ padding: '20px', background: 'var(--card-bg)', borderLeft: '4px solid var(--warning)', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'var(--bg-secondary)', padding: '12px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Construction size={24} color="var(--warning)" />
          </div>
          <div>
            <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Barricade Points</span>
            <h4 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)', margin: '4px 0' }}>
              {barricadesCount} <span style={{ fontSize: '13px', fontWeight: 'normal', color: 'var(--text-secondary)' }}>Placements</span>
            </h4>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Closure & diversion blockades</span>
          </div>
        </div>

        {/* Equipment List Card */}
        <div className="glass" style={{ padding: '20px', background: 'var(--card-bg)', borderLeft: '4px solid var(--success)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '4px' }}>
            <Wrench size={16} color="var(--success)" />
            <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Tactical Equipment Kit</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {equipment.map((eq, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
                  {getEquipmentIcon(eq.name)}
                  {eq.name}
                </span>
                <span style={{ fontWeight: '700', color: 'var(--text-primary)', background: 'var(--bg-secondary)', padding: '2px 6px', borderRadius: '4px', fontSize: '10px' }}>
                  x{eq.count}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
