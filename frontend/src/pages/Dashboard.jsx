import React, { useState, useEffect } from 'react';
import SidebarFilters from '../components/SidebarFilters';
import MetricCards from '../components/MetricCards';
import MapView from '../components/MapView';
import IncidentList from '../components/IncidentList';
import PredictionDisplayCards from '../components/PredictionDisplayCards';
import DeploymentPlanCards from '../components/DeploymentPlanCards';
import DiversionRouteDisplay from '../components/DiversionRouteDisplay';
import HistoricalInsights from '../components/HistoricalInsights';
import { aiService, backendService } from '../services/api';
import { planner } from '../services/planner';

export default function Dashboard() {
  const [filters, setFilters] = useState({
    mode: 'predictive', // 'reactive' or 'predictive'
    timeOfDay: 'evening', // 'morning', 'midday', 'evening', 'night'
    event: 'derby_match', // 'none', 'stadium_concert', 'derby_match', 'rain_storm', 'highway_maintenance'
    severity: 'all', // 'all', 'low', 'moderate', 'heavy'
    cause: 'accident',
    corridor: 'Hwy 101 Corridor',
    zone: 'Downtown Core',
    junction: 'SilkBoardJunc',
    veh_type: 'private_car',
    hour: 17,
    day: 3
  });

  const [sectors, setSectors] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [predictionData, setPredictionData] = useState(null);
  const [planData, setPlanData] = useState(null);
  const [diversionsData, setDiversionsData] = useState([]);
  const [historicalInsightsData, setHistoricalInsightsData] = useState(null);
  const [mapData, setMapData] = useState(null);
  const [stats, setStats] = useState({
    congestionIndex: 0,
    activeIncidents: 0,
    avgSpeed: 0,
    predictionAccuracy: 94
  });

  // Run the traffic congestion simulation engine by coordinating with the Express backend
  useEffect(() => {
    // 1. Fetch live sectors data calculated from the query parameters & active dispatches
    backendService.getSectors(filters)
      .then(secData => {
        setSectors(secData);
        const avgSpeedVal = Math.round(secData.reduce((acc, curr) => acc + curr.speed, 0) / secData.length);
        const avgCongestionVal = Math.round(secData.reduce((acc, curr) => acc + curr.congestion, 0) / secData.length);
        
        setStats(prev => ({
          ...prev,
          congestionIndex: avgCongestionVal,
          avgSpeed: avgSpeedVal
        }));
      })
      .catch(err => {
        console.error("Failed to load sectors from backend", err);
      });

    // 2. Fetch live active incidents list from the backend
    backendService.getIncidents(filters)
      .then(incData => {
        setIncidents(incData);
        setStats(prev => ({
          ...prev,
          activeIncidents: incData.filter(i => i.status !== 'resolved').length
        }));
      })
      .catch(err => {
        console.error("Failed to load incidents from backend", err);
      });

    // 3. Call local rule-based planner to generate dynamic response plan layout
    const plan = planner.generate_plan(filters);
    setPlanData(plan);

    // 4. Fetch live predictions from the FastAPI AI service
    aiService.getCongestionPrediction(filters)
      .then(res => {
        if (res && res.success) {
          setPredictionData(res.prediction);
          setDiversionsData(res.diversions || []);
          setHistoricalInsightsData(res.historicalInsights || null);
          setMapData(res.mapData || null);
          const confidenceNum = parseFloat(res.prediction.severityConfidence);
          setStats(prev => ({
            ...prev,
            predictionAccuracy: isNaN(confidenceNum) ? res.prediction.severityConfidence : confidenceNum
          }));
        }
      })
      .catch(err => {
        console.warn("FastAPI prediction call failed", err);
      });
  }, [filters]);

  const handleDispatch = (id) => {
    // Post dispatch update to Express backend and refresh data
    backendService.dispatchUnit(id)
      .then(() => {
        return Promise.all([
          backendService.getSectors(filters),
          backendService.getIncidents(filters)
        ]);
      })
      .then(([secData, incData]) => {
        setSectors(secData);
        setIncidents(incData);
        
        const avgSpeedVal = Math.round(secData.reduce((acc, curr) => acc + curr.speed, 0) / secData.length);
        const avgCongestionVal = Math.round(secData.reduce((acc, curr) => acc + curr.congestion, 0) / secData.length);
        const activeCount = incData.filter(i => i.status !== 'resolved').length;
        
        setStats(prev => ({
          ...prev,
          congestionIndex: avgCongestionVal,
          avgSpeed: avgSpeedVal,
          activeIncidents: activeCount
        }));
      })
      .catch(err => {
        console.error("Dispatch order transmission failed", err);
      });
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
          <DeploymentPlanCards planData={planData} filters={filters} />
          <DiversionRouteDisplay diversions={diversionsData} />
          <HistoricalInsights insights={historicalInsightsData} />
          
          <div style={{ flex: 1 }}>
            <MapView sectors={sectors} incidents={incidents.filter(i => i.status !== 'resolved')} filters={filters} mapData={mapData} diversions={diversionsData} />
          </div>
          <div>
            <IncidentList incidents={incidents} onDispatch={handleDispatch} />
          </div>
        </div>
      </div>
    </div>
  );
}
