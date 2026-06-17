import React, { useState, useEffect } from 'react';
import SidebarFilters from '../components/SidebarFilters';
import MetricCards from '../components/MetricCards';
import MapView from '../components/MapView';
import IncidentList from '../components/IncidentList';
import PredictionDisplayCards from '../components/PredictionDisplayCards';
import { aiService } from '../services/api';

export default function Dashboard() {
  const [filters, setFilters] = useState({
    mode: 'predictive', // 'reactive' or 'predictive'
    timeOfDay: 'evening', // 'morning', 'midday', 'evening', 'night'
    event: 'derby_match', // 'none', 'stadium_concert', 'derby_match', 'rain_storm', 'highway_maintenance'
    severity: 'all' // 'all', 'low', 'moderate', 'heavy'
  });

  const [sectors, setSectors] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [predictionData, setPredictionData] = useState(null);
  const [stats, setStats] = useState({
    congestionIndex: 0,
    activeIncidents: 0,
    avgSpeed: 0,
    predictionAccuracy: 94
  });

  // Run the traffic congestion simulation engine based on active filters
  useEffect(() => {
    // 1. Establish base sector parameters by time of day
    let baseSectors = [
      { id: 'uptown', name: 'Uptown Residential', congestion: 20, speed: 48, flowRate: 1100, diversionActive: false },
      { id: 'downtown', name: 'Downtown Core', congestion: 40, speed: 30, flowRate: 2300, diversionActive: false },
      { id: 'westside', name: 'Westside Entertainment', congestion: 25, speed: 42, flowRate: 1400, diversionActive: false },
      { id: 'highway', name: 'Highway 101 Corridor', congestion: 15, speed: 55, flowRate: 3100, diversionActive: false }
    ];

    switch (filters.timeOfDay) {
      case 'morning':
        baseSectors[0].congestion = 55; baseSectors[0].speed = 34; baseSectors[0].flowRate = 2200; // Uptown Outbound
        baseSectors[1].congestion = 65; baseSectors[1].speed = 22; baseSectors[1].flowRate = 3400; // Downtown Inbound
        baseSectors[3].congestion = 70; baseSectors[3].speed = 28; baseSectors[3].flowRate = 4800; // Highway Corridor
        break;
      case 'midday':
        baseSectors[0].congestion = 25; baseSectors[0].speed = 46; baseSectors[0].flowRate = 1200;
        baseSectors[1].congestion = 45; baseSectors[1].speed = 28; baseSectors[1].flowRate = 2600;
        baseSectors[3].congestion = 35; baseSectors[3].speed = 48; baseSectors[3].flowRate = 3400;
        break;
      case 'evening':
        baseSectors[0].congestion = 45; baseSectors[0].speed = 38; baseSectors[0].flowRate = 1800; // Uptown Inbound
        baseSectors[1].congestion = 75; baseSectors[1].speed = 14; baseSectors[1].flowRate = 3800; // Downtown Outbound
        baseSectors[3].congestion = 80; baseSectors[3].speed = 18; baseSectors[3].flowRate = 5200; // Highway Outbound
        break;
      case 'night':
        baseSectors[0].congestion = 12; baseSectors[0].speed = 52; baseSectors[0].flowRate = 600;
        baseSectors[1].congestion = 18; baseSectors[1].speed = 42; baseSectors[1].flowRate = 900;
        baseSectors[3].congestion = 15; baseSectors[3].speed = 62; baseSectors[3].flowRate = 1500;
        break;
      default:
        break;
    }

    // 2. Inject Events and Incidents
    let activeIncidentsList = [];

    switch (filters.event) {
      case 'stadium_concert':
        baseSectors[2].congestion += 38; baseSectors[2].speed = Math.max(8, baseSectors[2].speed - 24);
        baseSectors[1].congestion += 10;
        activeIncidentsList.push({
          id: 'inc-concert',
          title: 'Concert Crowd Outflow',
          type: 'Concert Event',
          severity: 'Moderate',
          sector: 'westside',
          reportedAt: '12 mins ago',
          impact: 'Stadium gates active. Delay on West 5th Ave.',
          status: 'pending'
        });
        break;
      case 'derby_match':
        baseSectors[2].congestion += 55; baseSectors[2].speed = Math.max(5, baseSectors[2].speed - 32);
        baseSectors[3].congestion += 15; baseSectors[3].speed = Math.max(12, baseSectors[3].speed - 10);
        activeIncidentsList.push({
          id: 'inc-derby',
          title: 'Stadium Road Blockade',
          type: 'Derby Outflow',
          severity: 'High',
          sector: 'westside',
          reportedAt: '4 mins ago',
          impact: 'Heavy pedestrian influx. Police diverting lanes.',
          status: 'pending'
        });
        break;
      case 'rain_storm':
        baseSectors.forEach(s => {
          s.congestion = Math.min(95, s.congestion + 22);
          s.speed = Math.max(10, s.speed - 15);
        });
        activeIncidentsList.push({
          id: 'inc-flood',
          title: 'Hydroplaning Incident',
          type: 'Crash Accident',
          severity: 'Critical',
          sector: 'highway',
          reportedAt: 'Just now',
          impact: 'Multi-vehicle slip. Left lanes blocked on Hwy 101.',
          status: 'pending'
        });
        break;
      case 'highway_maintenance':
        baseSectors[3].congestion = Math.min(98, baseSectors[3].congestion + 40);
        baseSectors[3].speed = Math.max(10, baseSectors[3].speed - 28);
        activeIncidentsList.push({
          id: 'inc-const',
          title: 'Hwy 101 Expansion Works',
          type: 'Construction',
          severity: 'Moderate',
          sector: 'highway',
          reportedAt: '1 hour ago',
          impact: 'Right 2 lanes blocked for resurfacing.',
          status: 'pending'
        });
        break;
      default:
        break;
    }

    // 3. AI Predictive Mitigation Effect
    if (filters.mode === 'predictive') {
      baseSectors.forEach(s => {
        // If congestion is high, predictive engine coordinates signal lights & signals diversion route
        if (s.congestion > 50) {
          s.diversionActive = true;
          s.congestion = Math.max(30, s.congestion - 18); // Reduce congestion by 18% via re-routing
          s.speed = Math.min(55, s.speed + 8); // Speeds improve by 8mph
          s.flowRate = Math.round(s.flowRate * 0.88); // Offload volume by 12%
        }
      });
    }

    // 4. Filtering by Severity focus
    let filteredSectors = [...baseSectors];
    if (filters.severity !== 'all') {
      filteredSectors = baseSectors.filter(s => {
        if (filters.severity === 'heavy') return s.congestion >= 60;
        if (filters.severity === 'moderate') return s.congestion >= 30 && s.congestion < 60;
        if (filters.severity === 'low') return s.congestion < 30;
        return true;
      });
    }

    setSectors(filteredSectors);
    setIncidents(activeIncidentsList);

    // 5. Compute global KPI stats
    const avgSpeedVal = Math.round(baseSectors.reduce((acc, curr) => acc + curr.speed, 0) / baseSectors.length);
    const avgCongestionVal = Math.round(baseSectors.reduce((acc, curr) => acc + curr.congestion, 0) / baseSectors.length);
    const precisionVal = 'N/A';

    setStats({
      congestionIndex: avgCongestionVal,
      activeIncidents: activeIncidentsList.filter(i => i.status !== 'resolved').length,
      avgSpeed: avgSpeedVal,
      predictionAccuracy: precisionVal
    });

    // Fetch live predictions from the AI microservice / simulated model registry
    aiService.getCongestionPrediction(filters)
      .then(res => {
        if (res && res.success) {
          setPredictionData(res.prediction);
          // Update the global forecast precision KPI with the active prediction confidence
          const confidenceNum = parseFloat(res.prediction.severityConfidence);
          setStats(prev => ({
            ...prev,
            predictionAccuracy: isNaN(confidenceNum) ? res.prediction.severityConfidence : confidenceNum
          }));
        }
      });

  }, [filters]);

  const handleDispatch = (id) => {
    setIncidents(prev => prev.map(inc => {
      if (inc.id === id) {
        if (inc.status === 'pending') {
          // Dispatched unit: congestion mitigates slightly
          setSectors(secList => secList.map(s => {
            if (s.id === inc.sector) {
              return {
                ...s,
                congestion: Math.max(10, s.congestion - 12),
                speed: Math.min(65, s.speed + 5)
              };
            }
            return s;
          }));
          return { ...inc, status: 'dispatched' };
        } else if (inc.status === 'dispatched') {
          return { ...inc, status: 'resolved' };
        }
      }
      return inc;
    }));
  };

  // Dynamically update stats when incidents are dispatched/resolved
  useEffect(() => {
    const activeCount = incidents.filter(i => i.status !== 'resolved').length;
    setStats(prev => ({
      ...prev,
      activeIncidents: activeCount
    }));
  }, [incidents]);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px', flex: 1 }}>
      {/* Metric Cards Banner */}
      <MetricCards stats={stats} />

      {/* Main Grid: Map + Sidebar + Incidents */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px', flex: 1, alignItems: 'stretch' }}>
        {/* Left Side: Sidebar Filters */}
        <SidebarFilters filters={filters} setFilters={setFilters} />

        {/* Right Side: Map & Incident list in a flex column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <PredictionDisplayCards predictionData={predictionData} />
          
          <div style={{ flex: 1 }}>
            <MapView sectors={sectors} incidents={incidents.filter(i => i.status !== 'resolved')} />
          </div>
          <div>
            <IncidentList incidents={incidents} onDispatch={handleDispatch} />
          </div>
        </div>
      </div>
    </div>
  );
}
