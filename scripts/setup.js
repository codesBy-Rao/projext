const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const serverEnvPath = path.join(rootDir, 'codebugx', 'server', '.env');
const serverEnvExamplePath = path.join(rootDir, 'codebugx', 'server', '.env.example');

const run = (command, args, options = {}) => {
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    shell: process.platform === 'win32',
    cwd: rootDir,
    ...options,
  });

  return result.status || 0;
};

const runOrExit = (command, args) => {
  const code = run(command, args);
  if (code !== 0) {
    process.exit(code);
  }
};

const installWithFallback = (label, ciArgs, installArgs) => {
  console.log(`Installing ${label} dependencies...`);

  const ciCode = run('npm', ciArgs);
  if (ciCode === 0) {
    return;
  }

  console.warn(`npm ${ciArgs.join(' ')} failed for ${label}. Retrying with npm ${installArgs.join(' ')}...`);

  const installCode = run('npm', installArgs);
  if (installCode !== 0) {
    console.error(`\nFailed to install ${label} dependencies.`);
    console.error('If you are on Windows and see EPERM/unlink errors, close running dev servers and retry.');
    process.exit(installCode);
  }
};

const ensureServerEnv = () => {
  if (fs.existsSync(serverEnvPath)) {
    console.log('Server env found: codebugx/server/.env');
    return;
  }

  if (!fs.existsSync(serverEnvExamplePath)) {
    console.error('Missing codebugx/server/.env.example. Cannot bootstrap env file.');
    process.exit(1);
  }

  fs.copyFileSync(serverEnvExamplePath, serverEnvPath);
  console.log('Created codebugx/server/.env from .env.example');
};

installWithFallback('root', ['ci'], ['install']);
installWithFallback('client', ['--prefix', './codebugx/client', 'ci'], ['--prefix', './codebugx/client', 'install']);
installWithFallback('server', ['--prefix', './codebugx/server', 'ci'], ['--prefix', './codebugx/server', 'install']);

ensureServerEnv();

console.log('Running API smoke test...');
runOrExit('npm', ['run', 'smoke:api']);

console.log('\nSetup complete. Next step: npm run dev');
