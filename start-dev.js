const { spawn } = require('child_process');

const nextProcess = spawn('node', ['./node_modules/.bin/next', 'dev', '--port', '3000', '--hostname', '0.0.0.0'], {
  stdio: 'inherit',
  cwd: process.cwd()
});

nextProcess.on('error', (err) => {
  console.error('Failed to start Next.js:', err);
});

nextProcess.on('close', (code) => {
  console.log(`Next.js process exited with code ${code}`);
});
