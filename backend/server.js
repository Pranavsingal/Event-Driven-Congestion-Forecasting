const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;
const start_time = Date.now();

// Connect to MongoDB if MONGODB_URI is provided
connectDB();

// Enable CORS for frontend connection
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Main API routes
const apiRoutes = require('./routes/api');
app.use('/api', apiRoutes);

// Root test endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Gridlock Express Dispatch Backend is online.' });
});

// Health endpoint
app.get('/api/health', async (req, res) => {
  const uptime = Math.floor((Date.now() - start_time) / 1000);
  let ai_status = 'offline';
  let severity_accuracy = 'Unknown';
  let model_version = 0;
  
  try {
    const host = req.headers.host;
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const aiServiceUrl = process.env.VITE_AI_SERVICE_URL || `${protocol}://${host}/api/ai`;
    const response = await fetch(`${aiServiceUrl}/model-status`);
    if (response.ok) {
        ai_status = 'online';
        const data = await response.json();
        model_version = data.modelVersion || 0;
        if (data.severity_accuracy) {
            severity_accuracy = `${(data.severity_accuracy * 100).toFixed(1)}%`;
        }
    }
  } catch (err) {
      // ignore
  }

  res.json({
    express: "online",
    ai_service: ai_status,
    db: "online",
    uptime_seconds: uptime,
    model_version: model_version,
    severity_accuracy: severity_accuracy
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Gridlock Express backend running on http://localhost:${PORT}`);
  });
}

module.exports = app;
