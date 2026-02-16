/**
 * Engine Alto — Load Generator
 * Issues N requests with configurable concurrency to stress-test the backend.
 *
 * Usage:
 *   node tools/load-gen.js --url http://localhost:3001/api/jobs --concurrency 5 --requests 100
 */

const http = require('http');
const url = require('url');

const args = process.argv.slice(2);
function getArg(name, def) {
  const i = args.indexOf('--' + name);
  return i >= 0 && args[i + 1] ? args[i + 1] : def;
}

const TARGET_URL = getArg('url', 'http://localhost:3001/api/jobs');
const CONCURRENCY = parseInt(getArg('concurrency', '5'), 10);
const TOTAL_REQUESTS = parseInt(getArg('requests', '100'), 10);
const METHOD = getArg('method', 'POST');

const results = {
  total: TOTAL_REQUESTS,
  concurrency: CONCURRENCY,
  url: TARGET_URL,
  startedAt: new Date().toISOString(),
  completedAt: null,
  latencies: [],
  statusCodes: {},
  errors: 0,
  successes: 0,
  p50: 0, p95: 0, p99: 0, avg: 0,
  failureRate: 0,
};

let completed = 0;
let inflight = 0;
let nextId = 0;

function makeRequest() {
  if (nextId >= TOTAL_REQUESTS) return;
  const reqId = nextId++;
  inflight++;
  const start = Date.now();
  const parsed = new URL(TARGET_URL);

  const body = JSON.stringify({ type: 'smoke', data: { loadTest: true, reqId } });
  const options = {
    hostname: parsed.hostname,
    port: parsed.port || 80,
    path: parsed.pathname,
    method: METHOD,
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
    },
    timeout: 10000,
  };

  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      const latency = Date.now() - start;
      results.latencies.push(latency);
      const code = res.statusCode;
      results.statusCodes[code] = (results.statusCodes[code] || 0) + 1;
      if (code >= 200 && code < 400) results.successes++;
      else results.errors++;
      done();
    });
  });

  req.on('error', (err) => {
    results.latencies.push(Date.now() - start);
    results.errors++;
    results.statusCodes['ERR'] = (results.statusCodes['ERR'] || 0) + 1;
    done();
  });

  req.on('timeout', () => {
    req.destroy();
    results.errors++;
    results.statusCodes['TIMEOUT'] = (results.statusCodes['TIMEOUT'] || 0) + 1;
    done();
  });

  if (METHOD === 'POST') req.write(body);
  req.end();
}

function done() {
  completed++;
  inflight--;
  process.stdout.write(`\r  Progress: ${completed}/${TOTAL_REQUESTS} (${results.errors} errors)`);

  if (completed >= TOTAL_REQUESTS) {
    finish();
    return;
  }
  if (inflight < CONCURRENCY && nextId < TOTAL_REQUESTS) {
    makeRequest();
  }
}

function finish() {
  results.completedAt = new Date().toISOString();
  const sorted = results.latencies.slice().sort((a, b) => a - b);
  const len = sorted.length;
  results.p50 = sorted[Math.floor(len * 0.5)] || 0;
  results.p95 = sorted[Math.floor(len * 0.95)] || 0;
  results.p99 = sorted[Math.floor(len * 0.99)] || 0;
  results.avg = len > 0 ? Math.round(sorted.reduce((a, b) => a + b, 0) / len) : 0;
  results.failureRate = ((results.errors / results.total) * 100).toFixed(2) + '%';
  results.pass = results.errors / results.total < 0.01;

  // Remove raw latencies for cleaner output
  const output = { ...results };
  delete output.latencies;
  output.latencyDistribution = {
    min: sorted[0] || 0,
    p50: results.p50,
    p95: results.p95,
    p99: results.p99,
    max: sorted[len - 1] || 0,
    avg: results.avg,
  };

  const json = JSON.stringify(output, null, 2);
  console.log('\n' + json);

  // Write to report
  const fs = require('fs');
  const path = require('path');
  const reportDir = path.join(__dirname, '..', 'report');
  if (!fs.existsSync(reportDir)) fs.mkdirSync(reportDir, { recursive: true });
  fs.writeFileSync(path.join(reportDir, 'load-test.json'), json);
  console.log(`\n  Report saved to report/load-test.json`);
  console.log(`  Result: ${output.pass ? 'PASS' : 'FAIL'} (${output.failureRate} failure rate)`);
  process.exit(output.pass ? 0 : 1);
}

// Start
console.log(`\n  Load Test: ${TOTAL_REQUESTS} requests @ concurrency ${CONCURRENCY}`);
console.log(`  Target: ${TARGET_URL}\n`);
for (let i = 0; i < Math.min(CONCURRENCY, TOTAL_REQUESTS); i++) {
  makeRequest();
}
