/**
 * Simple CORS Proxy Server
 * 
 * This is a lightweight proxy server to bypass CORS restrictions when accessing ngrok endpoints.
 * Run this server alongside your React application to handle API requests that would otherwise
 * be blocked by CORS policies.
 * 
 * Note: This is a CommonJS script, while the package.json is set to ES modules
 */

// Force CommonJS for this script
// @ts-ignore
const express = require('express');
// @ts-ignore
const cors = require('cors');
// @ts-ignore
const axios = require('axios');
// @ts-ignore
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 8080;

// Enable CORS for all routes
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning', 'X-Requested-With']
}));

// Parse JSON request bodies
app.use(bodyParser.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'CORS proxy server is running' });
});

// Proxy endpoint for GET requests
app.get('/proxy', async (req, res) => {
  const targetUrl = req.query.url;
  
  if (!targetUrl) {
    return res.status(400).json({ error: 'Missing target URL parameter' });
  }
  
  try {
    console.log(`Proxying GET request to: ${targetUrl}`);
    
    const response = await axios.get(targetUrl, {
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
        'Accept': 'application/json',
        'Origin': req.headers.origin || 'http://localhost:3000'
      }
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('Proxy error:', error.message);
    res.status(500).json({ 
      error: 'Proxy request failed',
      message: error.message,
      status: error.response?.status || 500
    });
  }
});

// Proxy endpoint for POST requests
app.post('/proxy', async (req, res) => {
  const targetUrl = req.query.url;
  const data = req.body;
  
  if (!targetUrl) {
    return res.status(400).json({ error: 'Missing target URL parameter' });
  }
  
  try {
    console.log(`Proxying POST request to: ${targetUrl}`);
    
    const response = await axios.post(targetUrl, data, {
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
        'Accept': 'application/json',
        'Origin': req.headers.origin || 'http://localhost:3000'
      }
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('Proxy error:', error.message);
    res.status(500).json({ 
      error: 'Proxy request failed',
      message: error.message,
      status: error.response?.status || 500
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`CORS proxy server running on port ${PORT}`);
  console.log(`Use it by accessing: http://localhost:${PORT}/proxy?url=YOUR_TARGET_URL`);
});