/**
 * Start script that runs both the React app and the CORS proxy server
 * This is a CommonJS script, while the package.json is set to ES modules
 */

// Force CommonJS for this script
// @ts-ignore
const { spawn } = require('child_process');
// @ts-ignore
const path = require('path');

// Function to start a process and pipe its output
function startProcess(command, args, name) {
  console.log(`Starting ${name}...`);
  
  const process = spawn(command, args, {
    stdio: 'pipe',
    shell: true
  });
  
  process.stdout.on('data', (data) => {
    console.log(`[${name}] ${data.toString().trim()}`);
  });
  
  process.stderr.on('data', (data) => {
    console.error(`[${name} ERROR] ${data.toString().trim()}`);
  });
  
  process.on('close', (code) => {
    console.log(`[${name}] Process exited with code ${code}`);
  });
  
  return process;
}

// Start the CORS proxy server
const proxyProcess = startProcess('node', ['cors-proxy.js'], 'CORS Proxy');

// Start the React app
const reactProcess = startProcess('npm', ['start'], 'React App');

// Handle script termination
process.on('SIGINT', () => {
  console.log('\nShutting down all processes...');
  proxyProcess.kill();
  reactProcess.kill();
  process.exit(0);
});

console.log('\n=== Services Started ===');
console.log('React App: http://localhost:3000');
console.log('CORS Proxy: http://localhost:8080');
console.log('Press Ctrl+C to stop all services');