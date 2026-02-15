/**
 * Engine Alto — Demo Script
 * Quick demonstration of platform capabilities
 */

const API = 'http://localhost:3001';

async function demo() {
  console.log('⚡ Engine Alto Demo — Starting...\n');

  // 1. Health check
  console.log('1️⃣  Health Check');
  try {
    const health = await fetch(`${API}/api/health`).then(r => r.json());
    console.log(`   Status: ${health.status}`);
    console.log(`   Platform: ${health.platform} v${health.version}`);
    console.log(`   Uptime: ${health.uptime}s\n`);
  } catch {
    console.log('   ❌ Backend not running. Start with: cd backend && npm run dev\n');
    return;
  }

  // 2. Create a project
  console.log('2️⃣  Creating Project');
  const project = await fetch(`${API}/api/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Demo App', type: 'app', description: 'Demo project' })
  }).then(r => r.json());
  console.log(`   Created: ${project.name} (${project.id})\n`);

  // 3. AI Chat
  console.log('3️⃣  AI Chat');
  const chat = await fetch(`${API}/api/ai/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: 'How do I train a CNN?' })
  }).then(r => r.json());
  console.log(`   AI: ${chat.message.substring(0, 100)}...\n`);

  // 4. List architectures
  console.log('4️⃣  Training Architectures');
  const archs = await fetch(`${API}/api/training/architectures`).then(r => r.json());
  archs.architectures.forEach((a: any) => {
    console.log(`   • ${a.name} — ${a.description}`);
  });
  console.log();

  // 5. Start training
  console.log('5️⃣  Starting Training Job');
  const job = await fetch(`${API}/api/training/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      modelName: 'demo-classifier',
      architecture: 'cnn',
      config: { epochs: 5, batchSize: 32, learningRate: 0.001 }
    })
  }).then(r => r.json());
  console.log(`   Job: ${job.id} — Status: ${job.status}\n`);

  // 6. Agent civilization
  console.log('6️⃣  Agent Civilization');
  const stats = await fetch(`${API}/api/agents/stats/overview`).then(r => r.json());
  console.log(`   Total Agents: ${stats.totalAgents}`);
  console.log(`   Active: ${stats.activeAgents}`);
  console.log(`   Tasks Completed: ${stats.totalTasksCompleted}`);
  console.log(`   Success Rate: ${(stats.averageSuccessRate * 100).toFixed(0)}%\n`);

  // 7. GPU Status
  console.log('7️⃣  GPU Status');
  const gpu = await fetch(`${API}/api/training/gpu/status`).then(r => r.json());
  gpu.devices?.forEach((d: any) => {
    console.log(`   ${d.name} — ${d.memoryTotal} — ${d.utilization}`);
  });
  console.log();

  // 8. Models
  console.log('8️⃣  Model Registry');
  const models = await fetch(`${API}/api/models`).then(r => r.json());
  models.models.forEach((m: any) => {
    console.log(`   • ${m.name} [${m.architecture}] — ${m.status}`);
  });
  console.log();

  // 9. Metrics
  console.log('9️⃣  System Metrics');
  const metrics = await fetch(`${API}/api/metrics/json`).then(r => r.json());
  console.log(`   GPU: ${metrics.gpu.utilization} | Memory: ${metrics.gpu.memoryUsed}`);
  console.log(`   Agents: ${metrics.agents.active}/${metrics.agents.total} active`);
  console.log(`   Models: ${metrics.models.total} (${metrics.models.deployed} deployed)\n`);

  console.log('✅ Engine Alto Demo Complete!\n');
  console.log('🌐 Open http://localhost:3000 for the full UI');
}

demo().catch(console.error);
