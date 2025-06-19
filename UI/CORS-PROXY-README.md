# CORS Proxy for Ngrok API Access

This document explains how to use the CORS proxy to resolve the CORS issues when accessing ngrok endpoints from your local development environment.

## The Problem

You're encountering a CORS (Cross-Origin Resource Sharing) error when your frontend application running at `http://localhost:3000` tries to access the ngrok API endpoints. The error looks like this:

```
Access to XMLHttpRequest at 'https://d15f-35-232-143-151.ngrok-free.app/api/finetune/tasks' from origin 'http://localhost:3000' has been blocked by CORS policy: Response to preflight request doesn't pass access control check: No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## Solution Options

### Option 1: Use the CORS Proxy Server (Recommended)

1. Install the required dependencies:
   ```bash
   npm install express cors axios body-parser
   ```

2. Start the CORS proxy server:
   ```bash
   node cors-proxy.js
   ```

3. The proxy server will run on port 8080 by default. You can change this in the `cors-proxy.js` file.

4. Update your API calls to use the proxy. For example:
   ```javascript
   // Instead of:
   const response = await axios.get(apiUrlManager.getFineTuningTasksUrl());

   // Use:
   const targetUrl = apiUrlManager.getFineTuningTasksUrl();
   const response = await axios.get(`http://localhost:8080/proxy?url=${encodeURIComponent(targetUrl)}`);
   ```

### Option 2: Use a Public CORS Proxy (Quick Solution)

You can use a public CORS proxy service like:

```javascript
const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;
const response = await axios.get(proxyUrl);
// The actual data will be in response.data.contents
```

Note: Public proxies have limitations and should not be used in production.

### Option 3: Configure the Backend Server (Best Long-term Solution)

The proper solution is to configure your backend server to include the correct CORS headers. This requires access to the server configuration.

Add these headers to your server responses:

```
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept, Authorization, ngrok-skip-browser-warning
Access-Control-Allow-Credentials: true
```

## Troubleshooting

If you're still experiencing CORS issues:

1. Check that the proxy server is running
2. Verify that the URL being proxied is correct
3. Try using a different proxy service
4. Check the browser console for specific error messages

## Security Considerations

- The CORS proxy should only be used in development environments
- For production, properly configure CORS on your server
- Be cautious with public CORS proxies as they can expose your API requests