import React, { useState } from 'react';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import ModelAnalytics from './pages/ModelAnalytics';
import EdaInsights from './pages/EdaInsights';
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
      case 'eda':
        return <EdaInsights />;
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
        borderBottom: '1px solid var(--border-color)',
        marginBottom: '24px',
        padding: '10px 0'
      }}>
        {/* Brand / Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            borderRadius: '8px', 
            background: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <Radio size={20} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: '800', fontFamily: 'var(--font-primary)', margin: 0, letterSpacing: '-0.02em', color: 'var(--primary)' }}>
              GRIDLOCK
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--success)' }}>
              <span className="pulse-dot"></span>
              <span style={{ fontWeight: '600' }}>Agency Control Centre</span>
            </div>
          </div>
        </div>

        {/* Tab Selection Navigation */}
        <nav style={{ display: 'flex', gap: '6px', background: 'var(--bg-secondary)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            style={{
              padding: '8px 16px',
              border: 'none',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: activeTab === 'dashboard' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'dashboard' ? '#fff' : 'var(--text-secondary)',
              boxShadow: activeTab === 'dashboard' ? 'var(--shadow-sm)' : 'none',
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
              padding: '8px 16px',
              border: 'none',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: activeTab === 'history' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'history' ? '#fff' : 'var(--text-secondary)',
              boxShadow: activeTab === 'history' ? 'var(--shadow-sm)' : 'none',
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
              padding: '8px 16px',
              border: 'none',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: activeTab === 'analytics' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'analytics' ? '#fff' : 'var(--text-secondary)',
              boxShadow: activeTab === 'analytics' ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.2s'
            }}
          >
            <Cpu size={15} />
            About AI
          </button>
          
          <button
            type="button"
            onClick={() => setActiveTab('eda')}
            style={{
              padding: '8px 16px',
              border: 'none',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: activeTab === 'eda' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'eda' ? '#fff' : 'var(--text-secondary)',
              boxShadow: activeTab === 'eda' ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.2s'
            }}
          >
            <BarChart2 size={15} />
            EDA Insights
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
        borderTop: '1px solid var(--border-color)', 
        textAlign: 'center', 
        fontSize: '12px', 
        color: 'var(--text-muted)'
      }}>
        Gridlock Operations Control System &copy; {new Date().getFullYear()} &bull; Urban Infrastructure Gateway
      </footer>

    </div>
  );
}
