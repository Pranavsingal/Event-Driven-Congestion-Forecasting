import React, { useState, useEffect, useRef } from 'react';
import SidebarFilters from '../components/SidebarFilters';
import MetricCards from '../components/MetricCards';
import MapView from '../components/MapView';
import IncidentList from '../components/IncidentList';
import PredictionDisplayCards from '../components/PredictionDisplayCards';
import DeploymentPlanCards from '../components/DeploymentPlanCards';
import DiversionRouteDisplay from '../components/DiversionRouteDisplay';
import HistoricalInsights from '../components/HistoricalInsights';
import LoadingOverlay from '../components/LoadingOverlay';
import { aiService, backendService } from '../services/api';
import { planner } from '../services/planner';

// Helper to get initial filters matching the current system time
const getInitialFilters = () => {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentDay = now.getDay() === 0 ? 7 : now.getDay();
  let currentTimeOfDay = 'midday';
  if (currentHour >= 5 && currentHour < 12) currentTimeOfDay = 'morning';
  else if (currentHour >= 12 && currentHour < 17) currentTimeOfDay = 'midday';
  else if (currentHour >= 17 && currentHour < 21) currentTimeOfDay = 'evening';
  else currentTimeOfDay = 'night';

  return {
    mode: 'predictive',
    timeOfDay: currentTimeOfDay,
    event: 'derby_match',
    severity: 'all',
    cause: 'accident',
    corridor: 'Hosur Road',
    zone: 'Downtown Core',
    junction: 'SilkBoardJunc',
    veh_type: 'private_car',
    hour: currentHour,
    minute: currentMinute,
    day: currentDay
  };
};

export default function Dashboard() {
  const [filters, setFilters] = useState(getInitialFilters);

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

  // Loading state tracking
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [loadingSectors, setLoadingSectors] = useState(false);
  const [loadingIncidents, setLoadingIncidents] = useState(false);
  const [loadingPredictions, setLoadingPredictions] = useState(false);
  const isFirstMount = useRef(true);

  const isFullLoading = isInitialLoad && (loadingSectors || loadingIncidents || loadingPredictions);

  // Run the traffic congestion simulation engine by coordinating with the Express backend
  useEffect(() => {
    // Track loading for overlay
    setLoadingSectors(true);
    setLoadingIncidents(true);
    setLoadingPredictions(true);

    // Clear downstream data on filter change for skeleton states
    if (!isFirstMount.current) {
      setPredictionData(null);
      setDiversionsData([]);
      setHistoricalInsightsData(null);
      setMapData(null);
    }
    isFirstMount.current = false;

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
      })
      .finally(() => setLoadingSectors(false));

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
      })
      .finally(() => setLoadingIncidents(false));

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
      })
      .finally(() => setLoadingPredictions(false));
  }, [filters]);

  // Dismiss initial overlay once all 3 sources finish loading
  useEffect(() => {
    if (isInitialLoad && !loadingSectors && !loadingIncidents && !loadingPredictions) {
      // Brief delay to let the last step render and progress bar fill
      const timeout = setTimeout(() => setIsInitialLoad(false), 800);
      return () => clearTimeout(timeout);
    }
  }, [isInitialLoad, loadingSectors, loadingIncidents, loadingPredictions]);

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
      {/* Full-screen loading overlay on initial boot */}
      <LoadingOverlay isVisible={isFullLoading} />

      {/* Metric Cards Banner */}
      <MetricCards stats={stats} />

      {/* Main Grid: Map + Sidebar + Incidents */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px', flex: 1, alignItems: 'stretch' }}>
        {/* Left Side: Sidebar Filters */}
        <SidebarFilters filters={filters} setFilters={setFilters} />

        {/* Right Side: Map & Incident list in a flex column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <PredictionDisplayCards predictionData={predictionData} isLoading={loadingPredictions} />
          <DeploymentPlanCards planData={planData} filters={filters} />
          <DiversionRouteDisplay diversions={diversionsData} isLoading={loadingPredictions} />
          <HistoricalInsights insights={historicalInsightsData} isLoading={loadingPredictions} />
          
          <div style={{ flex: 1 }}>
            <MapView 
              sectors={sectors} 
              incidents={incidents.filter(i => i.status !== 'resolved')} 
              filters={filters} 
              mapData={mapData} 
              diversions={diversionsData}
              onLocationUpdate={(newLocFilters) => {
                setFilters(prev => ({
                  ...prev,
                  ...newLocFilters
                }));
              }}
            />
          </div>
          <div>
            <IncidentList incidents={incidents} onDispatch={handleDispatch} />
          </div>
        </div>
      </div>
    </div>
  );
}
