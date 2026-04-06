const app = require('../app');

const checks = [
  {
    name: 'Health endpoint',
    method: 'GET',
    path: '/api/health',
    expectedStatus: 200,
  },
  {
    name: 'Unknown route returns 404',
    method: 'GET',
    path: '/api/unknown-route',
    expectedStatus: 404,
  },
  {
    name: 'Auth validation rejects invalid payload',
    method: 'POST',
    path: '/api/auth/login',
    body: { email: 'bad', password: '123' },
    expectedStatus: 400,
  },
  {
    name: 'Analyze route requires auth token',
    method: 'POST',
    path: '/api/analyze',
    body: { codeSnippet: 'const a = 1;', language: 'javascript' },
    expectedStatus: 401,
  },
];

async function run() {
  const server = app.listen(0);

  await new Promise((resolve) => server.once('listening', resolve));
  const { port } = server.address();
  const baseUrl = `http://127.0.0.1:${port}`;

  let passed = 0;

  try {
    for (const check of checks) {
      const url = `${baseUrl}${check.path}`;
      const options = {
        method: check.method,
        headers: { 'content-type': 'application/json' },
      };

      if (check.body) {
        options.body = JSON.stringify(check.body);
      }

      const response = await fetch(url, options);
      const isPass = response.status === check.expectedStatus;

      if (isPass) {
        passed += 1;
        console.log(`PASS - ${check.name} (${response.status})`);
      } else {
        const bodyText = await response.text();
        console.error(
          `FAIL - ${check.name}: expected ${check.expectedStatus}, got ${response.status}`
        );
        console.error(`Response body: ${bodyText}`);
      }
    }
  } finally {
    await new Promise((resolve, reject) => {
      server.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  if (passed !== checks.length) {
    console.error(`\nSmoke test failed: ${passed}/${checks.length} checks passed.`);
    process.exit(1);
  }

  console.log(`\nSmoke test passed: ${passed}/${checks.length} checks passed.`);
}

run().catch((error) => {
  console.error('Smoke test runner crashed:', error);
  process.exit(1);
});
