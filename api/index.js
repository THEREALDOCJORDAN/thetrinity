const express = require('express');
const serverless = require('serverless-http');

const app = express();

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());

// Demo data
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', service: 'Trinity Platform', version: '3.0.0' });
});

app.post('/api/design/generate', (req, res) => {
  res.json({
    success: true,
    brand: req.body.brand,
    item_type: req.body.item_type,
    image_url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400',
    prompt_used: 'Demo prompt',
    generated_at: new Date().toISOString()
  });
});

app.get('/api/stores', (req, res) => {
  res.json({ stores: [], count: 0 });
});

app.get('/api/dashboard/:shopDomain', (req, res) => {
  res.json({
    shop_domain: req.params.shopDomain,
    stats: { total_products: 0, total_orders: 0, revenue_today: 0, revenue_month: 0 },
    recent_orders: []
  });
});

app.get('/api/activities', (req, res) => {
  res.json([]);
});

module.exports = app;
module.exports.handler = serverless(app);
