import React, { useState } from 'react';
import { Calendar, Search, ArrowDownRight, ArrowUpRight, BarChart2 } from 'lucide-react';

export default function History() {
  const [searchTerm, setSearchTerm] = useState('');

  const historicalReports = [
    { id: 1, date: '2026-06-15', eventName: 'Stadium Concert (Coldplay)', sector: 'Westside', avgCongestion: '68%', PeakCongestion: '89%', delay: '42 mins', diversionUsed: 'Route 10A & 12B', efficiency: '+18%' },
    { id: 2, date: '2026-06-12', eventName: 'Derby Soccer Match', sector: 'Westside', avgCongestion: '74%', PeakCongestion: '92%', delay: '54 mins', diversionUsed: 'Route 12B & Signal Priority', efficiency: '+24%' },
    { id: 3, date: '2026-06-10', eventName: 'Heavy Thunderstorm', sector: 'All Sectors', avgCongestion: '62%', PeakCongestion: '81%', delay: '38 mins', diversionUsed: 'Hwy 101 Arterial Split', efficiency: '+12%' },
    { id: 4, date: '2026-06-08', eventName: 'Highway Lane Resurfacing', sector: 'Highway 101', avgCongestion: '58%', PeakCongestion: '78%', delay: '29 mins', diversionUsed: 'Broadway St Alternate', efficiency: '+15%' },
    { id: 5, date: '2026-06-05', eventName: 'Morning Peak Outflow', sector: 'Uptown', avgCongestion: '44%', PeakCongestion: '59%', delay: '15 mins', diversionUsed: 'None (Standard Signals)', efficiency: '0%' }
  ];

  const filteredReports = historicalReports.filter(report => 
    report.eventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.sector.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.diversionUsed.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="glass animate-fade-in" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Calendar size={22} color="var(--clr-indigo)" />
          <h2 style={{ fontSize: '22px', margin: 0 }}>Historical Congestion Logs</h2>
        </div>

        {/* Live Search input */}
        <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.25)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '6px 12px' }}>
          <Search size={16} color="var(--text-muted)" style={{ marginRight: '8px' }} />
          <input 
            type="text" 
            placeholder="Search by event or sector..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ background: 'transparent', border: 'none', padding: 0, fontSize: '13px', width: '200px', outline: 'none', color: 'var(--text-primary)' }}
          />
        </div>
      </div>

      {/* Offline Disclaimer Banner */}
      <div style={{ padding: '14px 20px', background: 'rgba(245, 158, 11, 0.08)', borderLeft: '4px solid var(--clr-yellow)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--clr-yellow)' }}></span>
        <span style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '140%' }}>
          <strong>Offline Cache Archive:</strong> Showing sample historical logs. Connect a live MongoDB instance to retrieve dynamic databases and logs.
        </span>
      </div>

      {/* Highlights metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
        <div style={{ background: 'rgba(0,0,0,0.15)', borderRadius: '12px', padding: '16px', border: '1px solid rgba(255,255,255,0.03)' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Historical Incidents Cataloged</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', margin: '6px 0 2px' }}>1,248</div>
          <div style={{ fontSize: '11px', color: 'var(--clr-green)' }}>+8.2% sensor coverage increase</div>
        </div>
        <div style={{ background: 'rgba(0,0,0,0.15)', borderRadius: '12px', padding: '16px', border: '1px solid rgba(255,255,255,0.03)' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Average Peak Congestion</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', margin: '6px 0 2px' }}>56.4%</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Typical high during 17:00-18:30</div>
        </div>
        <div style={{ background: 'rgba(0,0,0,0.15)', borderRadius: '12px', padding: '16px', border: '1px solid rgba(255,255,255,0.03)' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Total Signal Adjustments</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', margin: '6px 0 2px' }}>4,890 times</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px', color: 'var(--clr-green)' }}>
            <ArrowUpRight size={12} />
            <span>94.8% success in diversion routing</span>
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: 'var(--text-secondary)' }}>
              <th style={{ padding: '12px 8px', fontWeight: '600' }}>Date</th>
              <th style={{ padding: '12px 8px', fontWeight: '600' }}>Urban Event Trigger</th>
              <th style={{ padding: '12px 8px', fontWeight: '600' }}>Sectors Impacted</th>
              <th style={{ padding: '12px 8px', fontWeight: '600' }}>Avg / Peak</th>
              <th style={{ padding: '12px 8px', fontWeight: '600' }}>Avg delay</th>
              <th style={{ padding: '12px 8px', fontWeight: '600' }}>Diversion Scheme</th>
              <th style={{ padding: '12px 8px', fontWeight: '600', textAlign: 'right' }}>Delay Reduc. (AI)</th>
            </tr>
          </thead>
          <tbody>
            {filteredReports.map((report) => (
              <tr 
                key={report.id} 
                style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)', transition: 'background 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <td style={{ padding: '14px 8px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>{report.date}</td>
                <td style={{ padding: '14px 8px', fontWeight: '500' }}>{report.eventName}</td>
                <td style={{ padding: '14px 8px', color: 'var(--text-secondary)' }}>{report.sector}</td>
                <td style={{ padding: '14px 8px' }}>
                  <span style={{ color: 'var(--text-primary)' }}>{report.avgCongestion}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}> / {report.PeakCongestion}</span>
                </td>
                <td style={{ padding: '14px 8px', color: 'var(--clr-yellow)' }}>{report.delay}</td>
                <td style={{ padding: '14px 8px', fontSize: '13px', color: 'var(--clr-indigo)' }}>{report.diversionUsed}</td>
                <td style={{ padding: '14px 8px', textAlign: 'right', fontWeight: 'bold', color: report.efficiency !== '0%' ? 'var(--clr-green)' : 'var(--text-muted)' }}>
                  {report.efficiency}
                </td>
              </tr>
            ))}
            {filteredReports.length === 0 && (
              <tr>
                <td colSpan="7" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No matching logs found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
