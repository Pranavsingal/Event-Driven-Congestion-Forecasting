const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

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

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

app.listen(PORT, () => {
  console.log(`Gridlock Express backend running on http://localhost:${PORT}`);
});
