
const express = require('express');
const cors = require('cors');

const findingsRoutes = require('./routes/findingsRoutes');
const systemRoutes = require('./routes/systemRoutes');
const assessmentsRoutes = require('./routes/assessmentsRoutes');

const app = express();

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

app.use('/api/findings', findingsRoutes);
app.use('/api/assessments', assessmentsRoutes);
app.use('/api', systemRoutes);

module.exports = app;
