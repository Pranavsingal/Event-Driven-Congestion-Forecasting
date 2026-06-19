const express = require('express');
const router = express.Router();

// Stateful in-memory stores for incidents
// Keys are incident IDs, values are status ('pending', 'dispatched', 'resolved')
const incidentStatuses = {};

// Helper to get or initialize incident status
function getIncidentStatus(id, defaultStatus = 'pending') {
  if (!incidentStatuses[id]) {
    incidentStatuses[id] = defaultStatus;
  }
  return incidentStatuses[id];
}

// 1. GET /api/sectors - Fetch calculated sectors
router.get('/sectors', (req, res) => {
  const { timeOfDay = 'evening', event = 'none', mode = 'reactive', severity = 'all' } = req.query;

  // Base sectors setup
  let sectors = [
    { id: 'uptown', name: 'Uptown Residential', congestion: 20, speed: 48, flowRate: 1100, diversionActive: false },
    { id: 'downtown', name: 'Downtown Core', congestion: 40, speed: 30, flowRate: 2300, diversionActive: false },
    { id: 'westside', name: 'Westside Entertainment', congestion: 25, speed: 42, flowRate: 1400, diversionActive: false },
    { id: 'highway', name: 'Highway 101 Corridor', congestion: 15, speed: 55, flowRate: 3100, diversionActive: false }
  ];

  // Apply timeOfDay baseline
  switch (timeOfDay) {
    case 'morning':
      sectors[0].congestion = 55; sectors[0].speed = 34; sectors[0].flowRate = 2200;
      sectors[1].congestion = 65; sectors[1].speed = 22; sectors[1].flowRate = 3400;
      sectors[3].congestion = 70; sectors[3].speed = 28; sectors[3].flowRate = 4800;
      break;
    case 'midday':
      sectors[0].congestion = 25; sectors[0].speed = 46; sectors[0].flowRate = 1200;
      sectors[1].congestion = 45; sectors[1].speed = 28; sectors[1].flowRate = 2600;
      sectors[3].congestion = 35; sectors[3].speed = 48; sectors[3].flowRate = 3400;
      break;
    case 'evening':
      sectors[0].congestion = 45; sectors[0].speed = 38; sectors[0].flowRate = 1800;
      sectors[1].congestion = 75; sectors[1].speed = 14; sectors[1].flowRate = 3800;
      sectors[3].congestion = 80; sectors[3].speed = 18; sectors[3].flowRate = 5200;
      break;
    case 'night':
      sectors[0].congestion = 12; sectors[0].speed = 52; sectors[0].flowRate = 600;
      sectors[1].congestion = 18; sectors[1].speed = 42; sectors[1].flowRate = 900;
      sectors[3].congestion = 15; sectors[3].speed = 62; sectors[3].flowRate = 1500;
      break;
  }

  // Apply event impact
  const activeIncidents = getIncidentsList(event);
  
  if (event === 'stadium_concert') {
    sectors[2].congestion += 38; 
    sectors[2].speed = Math.max(8, sectors[2].speed - 24);
    sectors[1].congestion += 10;
  } else if (event === 'derby_match') {
    sectors[2].congestion += 55; 
    sectors[2].speed = Math.max(5, sectors[2].speed - 32);
    sectors[3].congestion += 15; 
    sectors[3].speed = Math.max(12, sectors[3].speed - 10);
  } else if (event === 'rain_storm') {
    sectors.forEach(s => {
      s.congestion = Math.min(95, s.congestion + 22);
      s.speed = Math.max(10, s.speed - 15);
    });
  } else if (event === 'highway_maintenance') {
    sectors[3].congestion = Math.min(98, sectors[3].congestion + 40);
    sectors[3].speed = Math.max(10, sectors[3].speed - 28);
  }

  // Apply active dispatches/resolutions mitigation effect
  activeIncidents.forEach(inc => {
    const status = getIncidentStatus(inc.id, inc.status);
    if (status === 'dispatched') {
      sectors.forEach(s => {
        if (s.id === inc.sector) {
          s.congestion = Math.max(10, s.congestion - 12);
          s.speed = Math.min(65, s.speed + 5);
        }
      });
    }
  });

  // Apply AI Predictive mitigation effect
  if (mode === 'predictive') {
    sectors.forEach(s => {
      if (s.congestion > 50) {
        s.diversionActive = true;
        s.congestion = Math.max(30, s.congestion - 18);
        s.speed = Math.min(55, s.speed + 8);
        s.flowRate = Math.round(s.flowRate * 0.88);
      }
    });
  }

  // Filter by severity if requested
  if (severity !== 'all') {
    sectors = sectors.filter(s => {
      if (severity === 'heavy') return s.congestion >= 60;
      if (severity === 'moderate') return s.congestion >= 30 && s.congestion < 60;
      if (severity === 'low') return s.congestion < 30;
      return true;
    });
  }

  res.json(sectors);
});

// 2. GET /api/incidents - Fetch list of active incidents
router.get('/incidents', (req, res) => {
  const { event = 'none' } = req.query;
  const list = getIncidentsList(event);
  
  // Map internal database status
  const mappedList = list.map(inc => ({
    ...inc,
    status: getIncidentStatus(inc.id, inc.status)
  }));

  res.json(mappedList);
});

// 3. POST /api/dispatch - Dispatch or Resolve an incident unit
router.post('/dispatch', (req, res) => {
  const { incidentId } = req.body;
  if (!incidentId) {
    return res.status(400).json({ error: 'Missing incidentId in request body.' });
  }

  const currentStatus = getIncidentStatus(incidentId, 'pending');
  let nextStatus = 'pending';

  if (currentStatus === 'pending') {
    nextStatus = 'dispatched';
  } else if (currentStatus === 'dispatched') {
    nextStatus = 'resolved';
  } else {
    nextStatus = 'resolved';
  }

  incidentStatuses[incidentId] = nextStatus;
  console.log(`Incident ${incidentId} dispatch status transitioned to: ${nextStatus}`);
  
  res.json({ success: true, incidentId, status: nextStatus });
});

// 4. POST /api/feedback - Forward feedback to AI service
router.post('/feedback', async (req, res) => {
  try {
    const aiServiceUrl = process.env.VITE_AI_SERVICE_URL || 'http://127.0.0.1:8000';
    
    // Dynamic import for fetch (node 18+)
    const response = await fetch(`${aiServiceUrl}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    
    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({ error: text });
    }
    
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Failed to forward feedback to AI Service:", err);
    res.status(500).json({ error: "Failed to connect to AI service" });
  }
});

// Helper incidents resolver based on event type
function getIncidentsList(event) {
  let list = [];
  switch (event) {
    case 'stadium_concert':
      list.push({
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
      list.push({
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
      list.push({
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
      list.push({
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
  }
  return list;
}

module.exports = router;
