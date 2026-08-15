const express = require('express');
const path = require('path');
const cors = require('cors');
const apiRoutes = require('../server/routes/api');

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Mount API routes
app.use('/api', apiRoutes);

// Export for Vercel Serverless
module.exports = app;
