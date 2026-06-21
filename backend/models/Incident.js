const mongoose = require('mongoose');

const incidentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: String,
  type: String,
  severity: String,
  sector: String,
  reportedAt: String,
  impact: String,
  status: { type: String, default: 'pending' },
  event: { type: String, required: true }
});

const Incident = mongoose.models.Incident || mongoose.model('Incident', incidentSchema);

module.exports = Incident;
