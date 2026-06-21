const express = require('express');
const router = express.Router();
<<<<<<< Updated upstream
const fs = require('fs');
const path = require('path');
const { body, query, validationResult } = require('express-validator');
const { db } = require('../config/database');

// --- SSE Setup ---
const clients = new Set();
function broadcast(event, data) {
  for (const client of clients) {
    client.write(`event: ${event}\n`);
    client.write(`data: ${JSON.stringify(data)}\n\n`);
  }
}

// Helper to get incident status from SQLite
function getIncidentStatus(id, defaultStatus = 'pending') {
  try {
      const row = db.prepare('SELECT status FROM dispatch_log WHERE incident_id = ? ORDER BY timestamp DESC LIMIT 1').get(id);
      return row ? row.status : defaultStatus;
  } catch (e) {
      return defaultStatus;
=======
const mongoose = require('mongoose');
const Incident = require('../models/Incident');

// Stateful in-memory stores for incidents (fallback)
// Keys are incident IDs, values are status ('pending', 'dispatched', 'resolved')
const incidentStatuses = {};

// Helper to get or initialize incident status
function getIncidentStatus(id, defaultStatus = 'pending') {
  if (!incidentStatuses[id]) {
    incidentStatuses[id] = defaultStatus;
>>>>>>> Stashed changes
  }
}

// 1. GET /api/sectors - Fetch calculated sectors
<<<<<<< Updated upstream
router.get('/sectors', [
  query('timeOfDay').optional().isIn(['morning', 'midday', 'evening', 'night']),
  query('mode').optional().isIn(['reactive', 'predictive']),
  query('severity').optional().isIn(['all', 'heavy', 'moderate', 'low']),
  query('event').optional()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

=======
router.get('/sectors', async (req, res) => {
>>>>>>> Stashed changes
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
  const list = getIncidentsList(event);
  let activeIncidents = [];
  
  try {
    const isConnected = mongoose.connection.readyState >= 1;
    if (isConnected) {
      activeIncidents = await Incident.find({ event });
      if (activeIncidents.length === 0 && list.length > 0) {
        // Seeding database
        const toInsert = list.map(inc => ({ ...inc, event }));
        activeIncidents = await Incident.insertMany(toInsert);
      }
    } else {
      activeIncidents = list.map(inc => ({
        ...inc,
        status: getIncidentStatus(inc.id, inc.status)
      }));
    }
  } catch (err) {
    console.error("DB query in sectors endpoint failed, falling back to memory:", err);
    activeIncidents = list.map(inc => ({
      ...inc,
      status: getIncidentStatus(inc.id, inc.status)
    }));
  }
  
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
    if (inc.status === 'dispatched') {
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
router.get('/incidents', async (req, res) => {
  const { event = 'none' } = req.query;
  const list = getIncidentsList(event);
  
  try {
    const isConnected = mongoose.connection.readyState >= 1;
    if (isConnected) {
      let dbIncidents = await Incident.find({ event });
      if (dbIncidents.length === 0 && list.length > 0) {
        // Populate default database values
        const toInsert = list.map(inc => ({ ...inc, event }));
        dbIncidents = await Incident.insertMany(toInsert);
      }
      return res.json(dbIncidents);
    }
  } catch (err) {
    console.error("DB incidents fetch error, falling back to memory:", err);
  }

  // Map internal database status
  const mappedList = list.map(inc => ({
    ...inc,
    status: getIncidentStatus(inc.id, inc.status)
  }));

  res.json(mappedList);
});

// 3. POST /api/dispatch - Dispatch or Resolve an incident unit
<<<<<<< Updated upstream
router.post('/dispatch', [
  body('incidentId').isString().notEmpty().withMessage('Missing incidentId in request body.')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
=======
router.post('/dispatch', async (req, res) => {
  const { incidentId } = req.body;
  if (!incidentId) {
    return res.status(400).json({ error: 'Missing incidentId in request body.' });
>>>>>>> Stashed changes
  }
  const { incidentId } = req.body;

  try {
    const isConnected = mongoose.connection.readyState >= 1;
    if (isConnected) {
      let incident = await Incident.findOne({ id: incidentId });
      if (!incident) {
        const allDefaults = [
          ...getIncidentsList('stadium_concert'),
          ...getIncidentsList('derby_match'),
          ...getIncidentsList('rain_storm'),
          ...getIncidentsList('highway_maintenance')
        ];
        const defInc = allDefaults.find(i => i.id === incidentId);
        if (defInc) {
          const eventType = incidentId.split('-')[1] || 'none';
          incident = new Incident({ ...defInc, event: eventType });
        }
      }
      
      if (incident) {
        const currentStatus = incident.status;
        let nextStatus = 'pending';

        if (currentStatus === 'pending') {
          nextStatus = 'dispatched';
        } else {
          nextStatus = 'resolved';
        }

        incident.status = nextStatus;
        await incident.save();
        console.log(`DB Incident ${incidentId} dispatch status transitioned to: ${nextStatus}`);
        return res.json({ success: true, incidentId, status: nextStatus });
      }
    }
  } catch (err) {
    console.error("DB dispatch failed, falling back to memory:", err);
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

<<<<<<< Updated upstream
  const logId = `log-${Date.now()}`;
  db.prepare('INSERT INTO dispatch_log (id, incident_id, status, timestamp, operator) VALUES (?, ?, ?, ?, ?)')
    .run(logId, incidentId, nextStatus, new Date().toISOString(), 'system');

  console.log(`Incident ${incidentId} dispatch status transitioned to: ${nextStatus}`);
=======
  incidentStatuses[incidentId] = nextStatus;
  console.log(`In-Memory Incident ${incidentId} dispatch status transitioned to: ${nextStatus}`);
>>>>>>> Stashed changes
  
  // SSE Push
  broadcast('dispatch', { incidentId, status: nextStatus });

  res.json({ success: true, incidentId, status: nextStatus });
});

// 4. POST /api/feedback - Forward feedback to AI service
router.post('/feedback', async (req, res) => {
<<<<<<< Updated upstream
  const aiServiceUrl = process.env.VITE_AI_SERVICE_URL || 'http://127.0.0.1:8000';
  
  async function attemptFetch(retries = 1) {
    try {
      const response = await fetch(`${aiServiceUrl}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body)
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text);
      }
      return await response.json();
    } catch (err) {
      if (retries > 0) {
        await new Promise(r => setTimeout(r, 500));
        return attemptFetch(retries - 1);
      }
      throw err;
=======
  try {
    const host = req.headers.host;
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const aiServiceUrl = process.env.VITE_AI_SERVICE_URL || `${protocol}://${host}/api/ai`;
    
    // Dynamic import for fetch (node 18+)
    const response = await fetch(`${aiServiceUrl}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    
    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({ error: text });
>>>>>>> Stashed changes
    }
  }

  try {
    const data = await attemptFetch(1);
    res.json(data);
  } catch (err) {
    console.error("Failed to forward feedback to AI Service:", err);
    // Queue locally
    const queuePath = path.join(__dirname, '..', 'feedback_queue.json');
    const queue = fs.existsSync(queuePath) ? JSON.parse(fs.readFileSync(queuePath)) : [];
    queue.push({ payload: req.body, timestamp: new Date().toISOString() });
    fs.writeFileSync(queuePath, JSON.stringify(queue, null, 2));
    
    res.status(200).json({ success: false, error: "AI service unavailable — feedback queued locally" });
  }
});

// 5. GET /api/history - Historical dispatch records
router.get('/history', [
  query('limit').optional().isInt({ min: 1, max: 200 }).toInt(),
  query('severity').optional().isIn(['all', 'High', 'Critical', 'Moderate', 'Low', ''])
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const limit = req.query.limit || 50;
  const severity = req.query.severity && req.query.severity !== 'all' ? req.query.severity : null;

  let queryStr = 'SELECT * FROM incident_history';
  const params = [];
  
  if (severity) {
    queryStr += ' WHERE severity = ?';
    params.push(severity);
  }
  queryStr += ' ORDER BY reported_at DESC LIMIT ?';
  params.push(limit);

  const rows = db.prepare(queryStr).all(...params);
  res.json(rows);
});

// 6. GET /api/stream - SSE Endpoint
router.get('/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  clients.add(res);

  req.on('close', () => {
    clients.delete(res);
  });
});

// Broadcast sectors every 5 seconds
setInterval(() => {
    if (clients.size > 0) {
        // Just broadcast a trigger, frontend can fetch or we can send the data
        broadcast('sectors', { updated: true });
    }
}, 5000);

// --- Simulation Background Task ---
let simulationInterval = null;

router.post('/simulation/start', (req, res) => {
    if (simulationInterval) {
        return res.json({ success: true, message: 'Simulation already running' });
    }
    simulationInterval = setInterval(() => {
        const fakeIncidentId = `sim-${Date.now()}`;
        console.log(`Generated synthetic incident: ${fakeIncidentId}`);
        broadcast('dispatch', { incidentId: fakeIncidentId, status: 'pending', synthetic: true });
    }, Math.floor(Math.random() * (120000 - 30000 + 1) + 30000));
    
    res.json({ success: true, message: 'Simulation started' });
});

router.post('/simulation/stop', (req, res) => {
    if (simulationInterval) {
        clearInterval(simulationInterval);
        simulationInterval = null;
    }
    res.json({ success: true, message: 'Simulation stopped' });
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
