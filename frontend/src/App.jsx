import React, { useState } from 'react';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import ModelAnalytics from './pages/ModelAnalytics';
import { Eye, ShieldAlert, Cpu, BarChart2, Radio } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'history', 'analytics'

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'history':
        return <History />;
      case 'analytics':
        return <ModelAnalytics />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%', maxWidth: '1440px', margin: '0 auto', padding: '0 24px 24px 24px' }}>
      
      {/* Header Panel */}
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        height: 'var(--header-height)', 
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        marginBottom: '24px',
        padding: '10px 0'
      }}>
        {/* Brand / Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            borderRadius: '10px', 
            background: 'linear-gradient(135deg, var(--clr-indigo), var(--clr-blue))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)'
          }}>
            <Radio size={20} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: '800', fontFamily: 'var(--font-heading)', margin: 0, letterSpacing: '-0.02em', background: 'linear-gradient(to right, #fff, #9ca3af)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              GRIDLOCK
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--clr-green)' }}>
              <span className="pulse-dot"></span>
              <span>Predictive Congestion Forecaster</span>
            </div>
          </div>
        </div>

        {/* Tab Selection Navigation */}
        <nav style={{ display: 'flex', gap: '8px', background: 'rgba(0, 0, 0, 0.25)', padding: '5px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.04)' }}>
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            style={{
              padding: '8px 18px',
              border: 'none',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: activeTab === 'dashboard' ? 'var(--clr-indigo)' : 'transparent',
              color: activeTab === 'dashboard' ? '#fff' : 'var(--text-secondary)',
              boxShadow: activeTab === 'dashboard' ? '0 4px 12px rgba(99, 102, 241, 0.3)' : 'none',
              transition: 'all 0.2s'
            }}
          >
            <Eye size={15} />
            Dashboard
          </button>
          
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            style={{
              padding: '8px 18px',
              border: 'none',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: activeTab === 'history' ? 'var(--clr-indigo)' : 'transparent',
              color: activeTab === 'history' ? '#fff' : 'var(--text-secondary)',
              boxShadow: activeTab === 'history' ? '0 4px 12px rgba(99, 102, 241, 0.3)' : 'none',
              transition: 'all 0.2s'
            }}
          >
            <BarChart2 size={15} />
            Historical Logs
          </button>
          
          <button
            type="button"
            onClick={() => setActiveTab('analytics')}
            style={{
              padding: '8px 18px',
              border: 'none',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: activeTab === 'analytics' ? 'var(--clr-indigo)' : 'transparent',
              color: activeTab === 'analytics' ? '#fff' : 'var(--text-secondary)',
              boxShadow: activeTab === 'analytics' ? '0 4px 12px rgba(99, 102, 241, 0.3)' : 'none',
              transition: 'all 0.2s'
            }}
          >
            <Cpu size={15} />
            Model Registry
          </button>
        </nav>
      </header>

      {/* Main Tab Render Body */}
      <main style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        {renderActiveTab()}
      </main>

      {/* Footer */}
      <footer style={{ 
        marginTop: '40px', 
        paddingTop: '20px', 
        borderTop: '1px solid rgba(255, 255, 255, 0.05)', 
        textAlign: 'center', 
        fontSize: '12px', 
        color: 'var(--text-muted)'
      }}>
        Gridlock Operations Control System &copy; {new Date().getFullYear()} &bull; AI Service Gateway active
      </footer>

    </div>
  );
}
