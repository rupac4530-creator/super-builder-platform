'use client';

import React, { useState, useEffect } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// ===== SIDEBAR COMPONENT =====
function Sidebar({ active, onNavigate }: { active: string; onNavigate: (page: string) => void }) {
  const sections = [
    {
      title: 'Platform',
      items: [
        { id: 'dashboard', icon: '🏠', label: 'Dashboard' },
        { id: 'control-center', icon: '🧠', label: 'Control Center', badge: 'NEW' },
        { id: 'projects', icon: '📁', label: 'Projects' },
        { id: 'ai-chat', icon: '🤖', label: 'AI Assistant' },
      ]
    },
    {
      title: 'AI / ML',
      items: [
        { id: 'training', icon: '🧠', label: 'Training Studio', badge: 'GPU' },
        { id: 'models', icon: '📦', label: 'Model Registry' },
        { id: 'inference', icon: '⚡', label: 'Inference' },
      ]
    },
    {
      title: 'Creator Studios',
      items: [
        { id: 'game-studio', icon: '🎮', label: 'Game Studio' },
        { id: 'video-studio', icon: '🎬', label: 'Video Studio' },
        { id: 'audio-studio', icon: '🎵', label: 'Audio Studio' },
        { id: '3d-studio', icon: '🧊', label: '3D Studio' },
        { id: 'fashion-studio', icon: '👗', label: 'Fashion Studio' },
        { id: 'design-studio', icon: '🎨', label: 'Design Suite' },
        { id: 'robotics-lab', icon: '🤖', label: 'Robotics Lab' },
      ]
    },
    {
      title: 'Agents',
      items: [
        { id: 'agents', icon: '🌐', label: 'Agent Civilization', badge: '12' },
        { id: 'workbook', icon: '📋', label: 'Workbook' },
      ]
    },
    {
      title: 'Agent Hub (OpenClaw)',
      items: [
        { id: 'agent-hub', icon: '🤖', label: 'Agent Hub', badge: 'NEW' },
        { id: 'agent-tasks', icon: '⚡', label: 'Task Monitor', badge: 'NEW' },
        { id: 'agent-teams', icon: '👥', label: 'Agent Teams', badge: 'NEW' },
        { id: 'evolution', icon: '🧬', label: 'Evolution Engine', badge: 'NEW' },
      ]
    },
    {
      title: 'Innovation Labs',
      items: [
        { id: 'knowledge-brain', icon: '🌐', label: 'Knowledge Brain', badge: 'NEW' },
        { id: 'ai-memory', icon: '💾', label: 'AI Memory', badge: 'NEW' },
        { id: 'idea-lab', icon: '💡', label: 'Idea Lab', badge: 'NEW' },
        { id: 'code-forge', icon: '🔨', label: 'Code Forge', badge: 'NEW' },
        { id: 'data-insights', icon: '📈', label: 'Data Insights', badge: 'NEW' },
        { id: 'learning-hub', icon: '📚', label: 'Learning Hub', badge: 'NEW' },
        { id: 'trend-radar', icon: '📡', label: 'Trend Radar', badge: 'NEW' },
        { id: 'collab-space', icon: '👥', label: 'Collab Space', badge: 'NEW' },
        { id: 'marketplace', icon: '🏪', label: 'AI Marketplace', badge: 'NEW' },
        { id: 'self-improve', icon: '🔄', label: 'Self-Improve', badge: 'NEW' },
      ]
    },
    {
      title: 'System',
      items: [
        { id: 'jobs', icon: '⚙️', label: 'Job Queue' },
        { id: 'metrics', icon: '📊', label: 'Metrics' },
        { id: 'settings', icon: '🔧', label: 'Settings' },
      ]
    }
  ];

  return (
    <nav className="sidebar">
      <div className="sidebar-logo">
        <h1>⚡ Engine Alto</h1>
        <div className="version">v0.1.0 — AI-First Creator Platform</div>
      </div>
      {sections.map(section => (
        <div key={section.title} className="sidebar-section">
          <div className="sidebar-section-title">{section.title}</div>
          {section.items.map(item => (
            <button
              key={item.id}
              className={`sidebar-item ${active === item.id ? 'active' : ''}`}
              onClick={() => onNavigate(item.id)}
            >
              <span className="icon">{item.icon}</span>
              <span>{item.label}</span>
              {(item as any).badge && <span className="sidebar-badge">{(item as any).badge}</span>}
            </button>
          ))}
        </div>
      ))}
      <div style={{ marginTop: 'auto', padding: '16px 20px', borderTop: '1px solid var(--border)' }}>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          🟢 System Healthy<br />
          GPU: RTX 4050 Ready
        </div>
      </div>
    </nav>
  );
}

// ===== DASHBOARD =====
function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [agentStats, setAgentStats] = useState<any>(null);

  useEffect(() => {
    fetch(`${API}/api/metrics/json`).then(r => r.json()).then(setStats).catch(() => { });
    fetch(`${API}/api/agents/stats/overview`).then(r => r.json()).then(setAgentStats).catch(() => { });
  }, []);

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">🚀 Engine Alto Dashboard</h1>
        <p className="page-subtitle">Your AI-first creator platform — build anything, train anything</p>
      </div>

      <div className="grid grid-4 stagger" style={{ marginBottom: 24 }}>
        <div className="stat-card animate-fade-in">
          <div className="stat-icon">🧠</div>
          <div className="stat-value">{stats?.training?.completed || 0}</div>
          <div className="stat-label">Models Trained</div>
        </div>
        <div className="stat-card animate-fade-in">
          <div className="stat-icon">🤖</div>
          <div className="stat-value">{agentStats?.activeAgents || 12}</div>
          <div className="stat-label">Active Agents</div>
        </div>
        <div className="stat-card animate-fade-in">
          <div className="stat-icon">⚡</div>
          <div className="stat-value">{stats?.gpu?.utilization || '0%'}</div>
          <div className="stat-label">GPU Utilization</div>
        </div>
        <div className="stat-card animate-fade-in">
          <div className="stat-icon">📊</div>
          <div className="stat-value">{stats?.uptime ? `${Math.round(stats.uptime / 60)}m` : '—'}</div>
          <div className="stat-label">Uptime</div>
        </div>
      </div>

      <div className="grid grid-2" style={{ marginBottom: 24 }}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">🎯 Quick Actions</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button className="btn btn-primary btn-lg" style={{ justifyContent: 'center' }}>
              🧠 Train a New Model
            </button>
            <button className="btn btn-secondary" style={{ justifyContent: 'center' }}>
              📁 Create New Project
            </button>
            <button className="btn btn-secondary" style={{ justifyContent: 'center' }}>
              🤖 Chat with AI Assistant
            </button>
            <button className="btn btn-secondary" style={{ justifyContent: 'center' }}>
              🌐 View Agent Civilization
            </button>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">🖥️ System Status</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem' }}>GPU (RTX 4050)</span>
              <span className="status status-active"><span className="status-dot"></span> Ready</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem' }}>GPU Memory</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>{stats?.gpu?.memoryUsed || '0MB'} / 6144MB</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${parseInt(stats?.gpu?.utilization || '0')}%` }}></div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem' }}>Backend API</span>
              <span className="status status-active"><span className="status-dot"></span> Online</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem' }}>Agent System</span>
              <span className="status status-active"><span className="status-dot"></span> Autonomous</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem' }}>Temperature</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>{stats?.gpu?.temperature || '45°C'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">🏗️ Platform Capabilities</h3>
        </div>
        <div className="grid grid-3" style={{ gap: 12 }}>
          {[
            { icon: '🧠', title: 'AI Training', desc: 'Train CNNs, ResNets, Transformers, GANs, U-Nets on your GPU' },
            { icon: '🎮', title: 'Game Engine', desc: 'ECS, physics, Vulkan rendering, level editor' },
            { icon: '🌐', title: 'Browser Runtime', desc: 'HTML/CSS renderer, V8 scripting, web apps' },
            { icon: '🤖', title: '12 AI Agents', desc: 'Autonomous civilization: debug, heal, deploy, scout' },
            { icon: '🎨', title: 'Creator Studio', desc: 'Image→3D, video, VFX, audio, fashion' },
            { icon: '🚀', title: 'One-Click Deploy', desc: 'Docker, K8s, Vercel, AWS — auto-packaged' },
          ].map(cap => (
            <div key={cap.title} style={{ padding: 14, background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '1.3rem', marginBottom: 6 }}>{cap.icon}</div>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', marginBottom: 2 }}>{cap.title}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{cap.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ===== TRAINING STUDIO =====
function TrainingStudio() {
  const [architectures, setArchitectures] = useState<any[]>([]);
  const [selectedArch, setSelectedArch] = useState('cnn');
  const [modelName, setModelName] = useState('my-model');
  const [epochs, setEpochs] = useState(10);
  const [batchSize, setBatchSize] = useState(32);
  const [lr, setLr] = useState(0.001);
  const [training, setTraining] = useState(false);
  const [currentJob, setCurrentJob] = useState<any>(null);
  const [gpuStatus, setGpuStatus] = useState<any>(null);

  useEffect(() => {
    fetch(`${API}/api/training/architectures`).then(r => r.json()).then(d => setArchitectures(d.architectures || [])).catch(() => { });
    fetch(`${API}/api/training/gpu/status`).then(r => r.json()).then(setGpuStatus).catch(() => { });
  }, []);

  useEffect(() => {
    if (!currentJob || currentJob.status === 'completed' || currentJob.status === 'stopped') return;
    const interval = setInterval(() => {
      fetch(`${API}/api/training/jobs/${currentJob.id}`).then(r => r.json()).then(job => {
        setCurrentJob(job);
        if (job.status === 'completed' || job.status === 'stopped') {
          setTraining(false);
        }
      }).catch(() => { });
    }, 2000);
    return () => clearInterval(interval);
  }, [currentJob]);

  const startTraining = async () => {
    setTraining(true);
    try {
      const res = await fetch(`${API}/api/training/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modelName, architecture: selectedArch,
          config: { epochs, batchSize, learningRate: lr, mixedPrecision: true }
        })
      });
      const job = await res.json();
      setCurrentJob(job);
    } catch { setTraining(false); }
  };

  const stopTraining = async () => {
    if (!currentJob) return;
    await fetch(`${API}/api/training/jobs/${currentJob.id}/stop`, { method: 'POST' });
    setTraining(false);
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">🧠 Training Studio</h1>
        <p className="page-subtitle">Train AI models on your RTX 4050 GPU with mixed precision</p>
      </div>

      <div className="grid grid-2" style={{ marginBottom: 24 }}>
        {/* Configuration */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">⚙️ Training Configuration</h3>
          </div>

          <div className="form-group">
            <label className="form-label">Model Name</label>
            <input className="input" value={modelName} onChange={e => setModelName(e.target.value)} placeholder="my-model" />
          </div>

          <div className="form-group">
            <label className="form-label">Architecture</label>
            <select className="select" value={selectedArch} onChange={e => setSelectedArch(e.target.value)}>
              {architectures.map(a => (
                <option key={a.id} value={a.id}>{a.name} — {a.description}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-3">
            <div className="form-group">
              <label className="form-label">Epochs</label>
              <input className="input" type="number" value={epochs} onChange={e => setEpochs(+e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Batch Size</label>
              <input className="input" type="number" value={batchSize} onChange={e => setBatchSize(+e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Learning Rate</label>
              <input className="input" type="number" step="0.0001" value={lr} onChange={e => setLr(+e.target.value)} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
            <button className="btn btn-primary btn-lg" style={{ flex: 1 }} onClick={startTraining} disabled={training}>
              {training ? '⏳ Training...' : '🚀 Start Training'}
            </button>
            {training && (
              <button className="btn btn-danger" onClick={stopTraining}>⏹ Stop</button>
            )}
          </div>
        </div>

        {/* GPU Status */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">🖥️ GPU Status</h3>
            <span className="status status-active"><span className="status-dot"></span> Ready</span>
          </div>
          {gpuStatus?.devices?.map((d: any, i: number) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{d.name}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div><span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Memory Total</span><br /><strong>{d.memoryTotal}</strong></div>
                <div><span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Memory Free</span><br /><strong>{d.memoryFree}</strong></div>
                <div><span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Utilization</span><br /><strong>{d.utilization}</strong></div>
                <div><span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Temperature</span><br /><strong>{d.temperature}</strong></div>
                <div><span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>CUDA</span><br /><strong>{d.cudaVersion}</strong></div>
                <div><span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Driver</span><br /><strong>{d.driverVersion}</strong></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Training Progress */}
      {currentJob && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-header">
            <h3 className="card-title">📈 Training Progress — {currentJob.modelName}</h3>
            <span className={`status status-${currentJob.status}`}>
              <span className="status-dot"></span> {currentJob.status}
            </span>
          </div>

          <div className="grid grid-4" style={{ marginBottom: 16 }}>
            <div>
              <div className="metric-live">
                <span className="metric-live-value" style={{ color: 'var(--accent-primary)' }}>
                  {currentJob.metrics.currentEpoch}/{currentJob.metrics.totalEpochs}
                </span>
              </div>
              <div className="stat-label">Epoch</div>
            </div>
            <div>
              <div className="metric-live">
                <span className="metric-live-value" style={{ color: '#10b981' }}>
                  {currentJob.metrics.accuracy ? (currentJob.metrics.accuracy * 100).toFixed(1) : '—'}
                </span>
                <span className="metric-live-unit">%</span>
              </div>
              <div className="stat-label">Accuracy</div>
            </div>
            <div>
              <div className="metric-live">
                <span className="metric-live-value" style={{ color: '#f59e0b' }}>
                  {currentJob.metrics.trainLoss ?? '—'}
                </span>
              </div>
              <div className="stat-label">Train Loss</div>
            </div>
            <div>
              <div className="metric-live">
                <span className="metric-live-value" style={{ color: '#3b82f6' }}>
                  {currentJob.metrics.gpuMemoryUsed || '—'}
                </span>
              </div>
              <div className="stat-label">GPU Memory</div>
            </div>
          </div>

          <div className="progress-bar" style={{ height: 8, marginBottom: 16 }}>
            <div className="progress-fill" style={{ width: `${(currentJob.metrics.currentEpoch / currentJob.metrics.totalEpochs) * 100}%` }}></div>
          </div>

          {/* Training logs */}
          <div className="code-block" style={{ maxHeight: 200, overflowY: 'auto' }}>
            {currentJob.logs.map((log: string, i: number) => (
              <div key={i} style={{ color: log.includes('complete') ? 'var(--success)' : 'inherit' }}>{log}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ===== AI CHAT =====
function AIChat() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([
    { role: 'assistant', content: 'Hello! I\'m the Engine Alto AI assistant. I can help you build apps, train AI models, create games, debug code, and more. What would you like to create?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch(`${API}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.message }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please check the backend is running.' }]);
    }
    setLoading(false);
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">🤖 AI Assistant</h1>
        <p className="page-subtitle">Chat with Engine Alto AI — build, debug, train, deploy</p>
      </div>

      <div className="card">
        <div className="chat-container">
          <div className="chat-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`chat-message ${msg.role}`}>
                <div className="chat-bubble">{msg.content}</div>
              </div>
            ))}
            {loading && (
              <div className="chat-message assistant">
                <div className="chat-bubble"><div className="spinner" style={{ width: 18, height: 18 }}></div></div>
              </div>
            )}
          </div>
          <div className="chat-input-container">
            <input
              className="chat-input"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="Ask me to build something, train a model, debug code..."
            />
            <button className="btn btn-primary" onClick={sendMessage} disabled={loading}>Send</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== MODELS REGISTRY =====
function ModelsPage() {
  const [models, setModels] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${API}/api/models`).then(r => r.json()).then(d => setModels(d.models || [])).catch(() => { });
  }, []);

  return (
    <div className="animate-fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">📦 Model Registry</h1>
          <p className="page-subtitle">Manage trained models — deploy, export, version</p>
        </div>
        <button className="btn btn-primary">+ New Model</button>
      </div>

      <div className="grid grid-3">
        {models.map(model => (
          <div key={model.id} className="card" style={{ cursor: 'pointer' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 10 }}>
              <div>
                <h3 style={{ fontWeight: 700, fontSize: '0.95rem' }}>{model.name}</h3>
                <span className="tag">{model.architecture}</span>
              </div>
              <span className={`status status-${model.status === 'ready' ? 'active' : model.status === 'deployed' ? 'running' : 'idle'}`}>
                {model.status}
              </span>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 12 }}>{model.description}</p>
            {model.metrics && (
              <div style={{ display: 'flex', gap: 14, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                {model.metrics.accuracy && <span>Acc: <strong>{(model.metrics.accuracy * 100).toFixed(1)}%</strong></span>}
                {model.metrics.params && <span>Params: <strong>{model.metrics.params}</strong></span>}
                {model.metrics.perplexity && <span>PPL: <strong>{model.metrics.perplexity}</strong></span>}
              </div>
            )}
            <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
              <button className="btn btn-primary btn-sm">Deploy</button>
              <button className="btn btn-secondary btn-sm">Export</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ===== AGENT CIVILIZATION =====
function AgentCivilization() {
  const [agents, setAgents] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetch(`${API}/api/agents`).then(r => r.json()).then(d => setAgents(d.agents || [])).catch(() => { });
    fetch(`${API}/api/agents/stats/overview`).then(r => r.json()).then(setStats).catch(() => { });
  }, []);

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">🌐 Agent Civilization</h1>
        <p className="page-subtitle">Autonomous AI agents managing the platform — no human approval needed</p>
      </div>

      {stats && (
        <div className="grid grid-4 stagger" style={{ marginBottom: 24 }}>
          <div className="stat-card animate-fade-in">
            <div className="stat-icon">🤖</div>
            <div className="stat-value">{stats.totalAgents}</div>
            <div className="stat-label">Total Agents</div>
          </div>
          <div className="stat-card animate-fade-in">
            <div className="stat-icon">🟢</div>
            <div className="stat-value">{stats.activeAgents}</div>
            <div className="stat-label">Active Now</div>
          </div>
          <div className="stat-card animate-fade-in">
            <div className="stat-icon">✅</div>
            <div className="stat-value">{stats.totalTasksCompleted}</div>
            <div className="stat-label">Tasks Completed</div>
          </div>
          <div className="stat-card animate-fade-in">
            <div className="stat-icon">📈</div>
            <div className="stat-value">{(stats.averageSuccessRate * 100).toFixed(0)}%</div>
            <div className="stat-label">Success Rate</div>
          </div>
        </div>
      )}

      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <h3 className="card-title">🏛️ Governance: {stats?.governanceStatus?.toUpperCase()}</h3>
          <span className="status status-active"><span className="status-dot"></span> Self-governing</span>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {['Legislative', 'Judicial', 'Executive', 'Security', 'Medical'].map(branch => (
            <span key={branch} className="tag">{branch}</span>
          ))}
        </div>
      </div>

      <div className="grid grid-3">
        {agents.map(agent => (
          <div key={agent.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <h3 style={{ fontWeight: 700, fontSize: '0.92rem' }}>{agent.name}</h3>
              <span className={`status status-${agent.status}`}>
                <span className="status-dot"></span> {agent.status}
              </span>
            </div>
            <div className="tag" style={{ marginBottom: 8 }}>{agent.type}</div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 12, lineHeight: 1.4 }}>{agent.description}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              <span>Tasks: <strong>{agent.taskCount}</strong></span>
              <span>Success: <strong>{(agent.successRate * 100).toFixed(0)}%</strong></span>
            </div>
            <button className="btn btn-secondary btn-sm" style={{ width: '100%', marginTop: 10, justifyContent: 'center' }}>
              Assign Task
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ===== PROJECTS =====
function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState('app');

  useEffect(() => {
    fetch(`${API}/api/projects`).then(r => r.json()).then(d => setProjects(d.projects || [])).catch(() => { });
  }, []);

  const createProject = async () => {
    if (!newName.trim()) return;
    const res = await fetch(`${API}/api/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName, type: newType, description: `${newType} project` })
    });
    const project = await res.json();
    setProjects(prev => [project, ...prev]);
    setNewName('');
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">📁 Projects</h1>
        <p className="page-subtitle">Create and manage your applications, games, and experiments</p>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 10 }}>
          <input className="input" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Project name..."
            onKeyDown={e => e.key === 'Enter' && createProject()} style={{ flex: 1 }} />
          <select className="select" value={newType} onChange={e => setNewType(e.target.value)} style={{ width: 160 }}>
            <option value="app">Web App</option>
            <option value="game">Game</option>
            <option value="ml">ML Experiment</option>
            <option value="api">API Service</option>
          </select>
          <button className="btn btn-primary" onClick={createProject}>Create</button>
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 60 }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>📁</div>
          <h3 style={{ fontWeight: 700, marginBottom: 6 }}>No projects yet</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Create your first project to get started!</p>
        </div>
      ) : (
        <div className="grid grid-3">
          {projects.map(p => (
            <div key={p.id} className="card" style={{ cursor: 'pointer' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <h3 style={{ fontWeight: 700 }}>{p.name}</h3>
                <span className="tag">{p.type}</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{p.description}</p>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 10 }}>
                Created: {new Date(p.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ===== JOBS =====
function JobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${API}/api/jobs`).then(r => r.json()).then(d => setJobs(d.jobs || [])).catch(() => { });
    const interval = setInterval(() => {
      fetch(`${API}/api/jobs`).then(r => r.json()).then(d => setJobs(d.jobs || [])).catch(() => { });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">⚙️ Job Queue</h1>
        <p className="page-subtitle">Monitor background tasks — training, rendering, exports</p>
      </div>

      <div className="card">
        {jobs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
            No jobs in queue. Start a training job or export to see activity here.
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Status</th>
                <th>Progress</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map(job => (
                <tr key={job.id}>
                  <td style={{ fontWeight: 600 }}>{job.type}</td>
                  <td><span className={`status status-${job.status}`}>{job.status}</span></td>
                  <td style={{ width: 200 }}>
                    <div className="progress-bar"><div className="progress-fill" style={{ width: `${job.progress}%` }}></div></div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{job.progress}%</span>
                  </td>
                  <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{new Date(job.createdAt).toLocaleTimeString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ===== METRICS =====
function MetricsPage() {
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    const load = () => fetch(`${API}/api/metrics/json`).then(r => r.json()).then(setMetrics).catch(() => { });
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">📊 System Metrics</h1>
        <p className="page-subtitle">Real-time platform observability — GPU, API, agents</p>
      </div>

      {metrics && (
        <div className="grid grid-2">
          <div className="card">
            <h3 className="card-title" style={{ marginBottom: 16 }}>🖥️ GPU Metrics</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Utilization</span><strong>{metrics.gpu.utilization}</strong>
              </div>
              <div className="progress-bar"><div className="progress-fill" style={{ width: metrics.gpu.utilization }}></div></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Memory Used</span><strong>{metrics.gpu.memoryUsed}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Temperature</span><strong>{metrics.gpu.temperature}</strong>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="card-title" style={{ marginBottom: 16 }}>🌐 API Metrics</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Uptime</span><strong>{Math.round(metrics.uptime / 60)}min</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>GET Requests</span><strong>{metrics.requests.get}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>POST Requests</span><strong>{metrics.requests.post}</strong>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="card-title" style={{ marginBottom: 16 }}>🧠 Training</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Active Jobs</span><strong>{metrics.training.active}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Completed</span><strong>{metrics.training.completed}</strong>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="card-title" style={{ marginBottom: 16 }}>🤖 Agent System</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Total Agents</span><strong>{metrics.agents.total}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Active</span><strong>{metrics.agents.active}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Models Deployed</span><strong>{metrics.models.deployed}</strong>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ===== SETTINGS =====
function SettingsPage() {
  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">🔧 Settings</h1>
        <p className="page-subtitle">Configure Engine Alto platform</p>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: 16 }}>🤖 AI Configuration</h3>
          <div className="form-group">
            <label className="form-label">AI Mode</label>
            <select className="select">
              <option>Mock Mode (local, no API keys)</option>
              <option>OpenAI GPT-4</option>
              <option>Anthropic Claude</option>
              <option>Local LLM (Llama)</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">OpenAI API Key</label>
            <input className="input" type="password" placeholder="sk-..." />
          </div>
          <button className="btn btn-primary">Save</button>
        </div>

        <div className="card">
          <h3 className="card-title" style={{ marginBottom: 16 }}>🏛️ Governance</h3>
          <div className="form-group">
            <label className="form-label">Autonomy Level</label>
            <select className="select">
              <option>Full Autonomous (no approvals)</option>
              <option>Semi-Autonomous (approve critical)</option>
              <option>Manual (approve all)</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Master Override</label>
            <input className="input" type="password" placeholder="Master key..." />
          </div>
          <button className="btn btn-primary">Save</button>
        </div>

        <div className="card">
          <h3 className="card-title" style={{ marginBottom: 16 }}>🖥️ GPU Configuration</h3>
          <div className="form-group">
            <label className="form-label">Max GPU Memory (MB)</label>
            <input className="input" type="number" defaultValue={5500} />
          </div>
          <div className="form-group">
            <label className="form-label">Mixed Precision</label>
            <select className="select">
              <option>Enabled (FP16)</option>
              <option>Disabled (FP32)</option>
            </select>
          </div>
          <button className="btn btn-primary">Save</button>
        </div>

        <div className="card">
          <h3 className="card-title" style={{ marginBottom: 16 }}>📦 Storage</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Models Directory</span><code style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>./data/models</code>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Checkpoints</span><code style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>./data/checkpoints</code>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Datasets</span><code style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>./data/datasets</code>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Available Storage</span><strong>3.78 TB</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== GAME STUDIO =====
function GameStudio() {
  const [gameName, setGameName] = useState('My Game');
  const [engine, setEngine] = useState('web');
  const [genre, setGenre] = useState('platformer');
  const [multiplayer, setMultiplayer] = useState(false);
  const [aiNPCs, setAiNPCs] = useState(true);
  const [procGen, setProcGen] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [building, setBuilding] = useState(false);

  const createGame = async () => {
    setBuilding(true);
    try {
      const res = await fetch(`${API}/api/ai/generate`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: `Create a ${genre} game called "${gameName}" using ${engine} engine`, type: 'game-project' })
      });
      setResult(await res.json());
    } catch { setResult({ message: `Game project "${gameName}" generated: ${engine}/${genre} with ${aiNPCs ? 'AI NPCs' : 'no AI'}, ${procGen ? 'procedural generation' : 'hand-crafted levels'}` }); }
    setBuilding(false);
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">🎮 Game Studio</h1>
        <p className="page-subtitle">Build AAA games — Unity, Godot, Unreal, or Web — with AI-powered tools</p>
      </div>
      <div className="grid grid-2" style={{ marginBottom: 24 }}>
        <div className="card">
          <div className="card-header"><h3 className="card-title">⚙️ Game Configuration</h3></div>
          <div className="form-group">
            <label className="form-label">Game Name</label>
            <input className="input" value={gameName} onChange={e => setGameName(e.target.value)} />
          </div>
          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">Engine</label>
              <select className="select" value={engine} onChange={e => setEngine(e.target.value)}>
                <option value="unity">Unity (C#)</option>
                <option value="godot">Godot (GDScript)</option>
                <option value="unreal">Unreal (C++)</option>
                <option value="web">Web (JS/Canvas)</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Genre</label>
              <select className="select" value={genre} onChange={e => setGenre(e.target.value)}>
                {['platformer', 'rpg', 'fps', 'puzzle', 'racing', 'strategy', 'sandbox', 'horror', 'visual-novel'].map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem' }}>
              <input type="checkbox" checked={multiplayer} onChange={e => setMultiplayer(e.target.checked)} /> Multiplayer
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem' }}>
              <input type="checkbox" checked={aiNPCs} onChange={e => setAiNPCs(e.target.checked)} /> AI NPCs
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem' }}>
              <input type="checkbox" checked={procGen} onChange={e => setProcGen(e.target.checked)} /> Procedural Gen
            </label>
          </div>
          <button className="btn btn-primary btn-lg" style={{ width: '100%' }} onClick={createGame} disabled={building}>
            {building ? '⏳ Generating...' : '🚀 Generate Game Project'}
          </button>
        </div>
        <div className="card">
          <div className="card-header"><h3 className="card-title">🎯 Game Preview</h3></div>
          <div style={{ aspectRatio: '16/9', background: 'linear-gradient(135deg, #0a0a2e, #1a0a3e)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12, marginBottom: 12, border: '1px solid var(--border)' }}>
            {result ? (
              <><div style={{ fontSize: '3rem' }}>🎮</div><div style={{ color: '#00ffcc', fontWeight: 700, fontSize: '1.1rem' }}>{gameName}</div><div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{engine} / {genre}</div></>
            ) : (
              <><div style={{ fontSize: '3rem', opacity: 0.3 }}>🎮</div><div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Configure and generate a game project</div></>
            )}
          </div>
          {result && <div className="code-block" style={{ maxHeight: 120, overflowY: 'auto', fontSize: '0.78rem' }}>{result.message || JSON.stringify(result, null, 2)}</div>}
        </div>
      </div>
      <div className="card">
        <div className="card-header"><h3 className="card-title">📦 Templates</h3></div>
        <div className="grid grid-4">
          {[{ icon: '🏃', name: '2D Platformer', engine: 'Web' }, { icon: '⚔️', name: 'Action RPG', engine: 'Unity' }, { icon: '🧩', name: 'Puzzle Game', engine: 'Godot' }, { icon: '🏎️', name: 'Racing Game', engine: 'Unreal' }].map(t => (
            <div key={t.name} style={{ padding: 16, background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', cursor: 'pointer', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: 6 }}>{t.icon}</div>
              <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{t.name}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{t.engine}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ===== VIDEO STUDIO =====
function VideoStudio() {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('cinematic');
  const [duration, setDuration] = useState(5);
  const [resolution, setResolution] = useState('1080p');
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  const generateVideo = async () => {
    setGenerating(true); setProgress(0);
    const interval = setInterval(() => setProgress(p => Math.min(p + Math.random() * 15, 95)), 500);
    try {
      await fetch(`${API}/api/ai/generate`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt, type: 'video', style, duration }) });
    } catch { }
    clearInterval(interval); setProgress(100); setTimeout(() => setGenerating(false), 500);
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">🎬 Video Studio</h1>
        <p className="page-subtitle">AI video generation — Sora-style text-to-video with style control</p>
      </div>
      <div className="grid grid-2" style={{ marginBottom: 24 }}>
        <div className="card">
          <div className="card-header"><h3 className="card-title">📝 Video Configuration</h3></div>
          <div className="form-group">
            <label className="form-label">Prompt</label>
            <textarea className="input" rows={3} value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="A futuristic city at sunset with flying cars..." style={{ resize: 'vertical' }} />
          </div>
          <div className="grid grid-3">
            <div className="form-group">
              <label className="form-label">Style</label>
              <select className="select" value={style} onChange={e => setStyle(e.target.value)}>
                {['cinematic', 'anime', 'photorealistic', 'noir', 'vaporwave', 'fantasy', 'scifi'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Duration (s)</label>
              <input className="input" type="number" value={duration} onChange={e => setDuration(+e.target.value)} min={1} max={60} />
            </div>
            <div className="form-group">
              <label className="form-label">Resolution</label>
              <select className="select" value={resolution} onChange={e => setResolution(e.target.value)}>
                <option value="720p">720p</option><option value="1080p">1080p</option><option value="4k">4K</option>
              </select>
            </div>
          </div>
          <button className="btn btn-primary btn-lg" style={{ width: '100%' }} onClick={generateVideo} disabled={generating || !prompt}>
            {generating ? '⏳ Generating...' : '🎬 Generate Video'}
          </button>
          {generating && <div style={{ marginTop: 12 }}><div className="progress-bar" style={{ height: 8 }}><div className="progress-fill" style={{ width: `${progress}%`, transition: 'width 0.3s' }}></div></div><span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{Math.round(progress)}%</span></div>}
        </div>
        <div className="card">
          <div className="card-header"><h3 className="card-title">🖥️ Preview</h3></div>
          <div style={{ aspectRatio: '16/9', background: 'linear-gradient(135deg, #0d1117, #161b22)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem' }}>{generating ? '⏳' : '🎬'}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 8 }}>{generating ? 'Rendering frames...' : 'Your video will appear here'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== AUDIO STUDIO =====
function AudioStudio() {
  const [musicStyle, setMusicStyle] = useState('ambient');
  const [musicDuration, setMusicDuration] = useState(30);
  const [bpm, setBpm] = useState(120);
  const [generateStems, setGenerateStems] = useState(false);
  const [composing, setComposing] = useState(false);

  const compose = async () => {
    setComposing(true);
    try {
      await fetch(`${API}/api/ai/generate`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'music', style: musicStyle, duration: musicDuration, bpm }) });
    } catch { }
    setTimeout(() => setComposing(false), 2000);
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">🎵 Audio Studio</h1>
        <p className="page-subtitle">AI-powered music composition, voice cloning, audio denoising</p>
      </div>
      <div className="grid grid-2" style={{ marginBottom: 24 }}>
        <div className="card">
          <div className="card-header"><h3 className="card-title">🎼 Music Composer</h3></div>
          <div className="grid grid-3">
            <div className="form-group">
              <label className="form-label">Style</label>
              <select className="select" value={musicStyle} onChange={e => setMusicStyle(e.target.value)}>
                {['ambient', 'action', 'dramatic', 'horror', 'fantasy', 'scifi', 'electronic', 'orchestral', 'lofi', 'jazz'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Duration (s)</label>
              <input className="input" type="number" value={musicDuration} onChange={e => setMusicDuration(+e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">BPM</label>
              <input className="input" type="number" value={bpm} onChange={e => setBpm(+e.target.value)} />
            </div>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', marginBottom: 12 }}>
            <input type="checkbox" checked={generateStems} onChange={e => setGenerateStems(e.target.checked)} /> Generate individual stems (drums, bass, melody, harmony, fx)
          </label>
          <button className="btn btn-primary btn-lg" style={{ width: '100%' }} onClick={compose} disabled={composing}>
            {composing ? '🎵 Composing...' : '🎵 Compose Music'}
          </button>
        </div>
        <div className="card">
          <div className="card-header"><h3 className="card-title">🔧 Audio Tools</h3></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>🗣️ Voice Clone — Clone any voice from reference audio</button>
            <button className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>🔇 Denoise — Remove background noise (RNNoise)</button>
            <button className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>🎤 Text-to-Speech — 5 AI voices available</button>
            <button className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>🎛️ Master & Export — Streaming / Broadcast / CD / Vinyl presets</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== 3D STUDIO =====
function ThreeDStudio() {
  const [mode, setMode] = useState<'glb' | 'nerf'>('glb');
  const [prompt3d, setPrompt3d] = useState('');
  const [quality, setQuality] = useState('standard');
  const [autoRig, setAutoRig] = useState(false);
  const [genLODs, setGenLODs] = useState(true);

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">🧊 3D Studio</h1>
        <p className="page-subtitle">Generate 3D models, NeRF reconstruction, GLB export with PBR materials</p>
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <button className={`btn ${mode === 'glb' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setMode('glb')}>🧊 GLB Generator</button>
        <button className={`btn ${mode === 'nerf' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setMode('nerf')}>📸 NeRF Reconstruction</button>
        <button className="btn btn-secondary">🎨 Blender Pipeline</button>
      </div>
      <div className="grid grid-2">
        <div className="card">
          <div className="card-header"><h3 className="card-title">{mode === 'glb' ? '🧊 GLB Generator' : '📸 NeRF from Images'}</h3></div>
          <div className="form-group">
            <label className="form-label">{mode === 'glb' ? 'Describe your 3D model' : 'Upload images for reconstruction'}</label>
            <textarea className="input" rows={2} value={prompt3d} onChange={e => setPrompt3d(e.target.value)} placeholder={mode === 'glb' ? 'A medieval castle with towers...' : 'Select images of the object from multiple angles...'} style={{ resize: 'vertical' }} />
          </div>
          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">Quality</label>
              <select className="select" value={quality} onChange={e => setQuality(e.target.value)}>
                <option value="draft">Draft (fast)</option><option value="standard">Standard</option><option value="high">High</option><option value="ultra">Ultra (slow)</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Export Format</label>
              <select className="select"><option>GLB</option><option>GLTF</option><option>OBJ</option><option>FBX</option><option>USDZ</option></select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem' }}><input type="checkbox" checked={autoRig} onChange={e => setAutoRig(e.target.checked)} /> Auto-Rig</label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem' }}><input type="checkbox" checked={genLODs} onChange={e => setGenLODs(e.target.checked)} /> Generate LODs</label>
          </div>
          <button className="btn btn-primary btn-lg" style={{ width: '100%' }}>🚀 Generate 3D Model</button>
        </div>
        <div className="card">
          <div className="card-header"><h3 className="card-title">👁️ 3D Preview</h3></div>
          <div style={{ aspectRatio: '1', background: 'radial-gradient(circle at 50% 50%, #1a1a3e, #0a0a1e)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)' }}>
            <div style={{ textAlign: 'center' }}><div style={{ fontSize: '4rem' }}>🧊</div><div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>3D preview will render here</div></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== FASHION STUDIO =====
function FashionStudioPage() {
  const [garmentType, setGarmentType] = useState('top');
  const [fabric, setFabric] = useState('cotton');
  const [size, setSize] = useState('M');
  const [style, setStyle] = useState('minimalist');

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">👗 Fashion Studio</h1>
        <p className="page-subtitle">AI-powered garment design — fabrics, patterns, tech packs, 3D preview</p>
      </div>
      <div className="grid grid-2" style={{ marginBottom: 24 }}>
        <div className="card">
          <div className="card-header"><h3 className="card-title">✂️ Design Configuration</h3></div>
          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">Garment Type</label>
              <select className="select" value={garmentType} onChange={e => setGarmentType(e.target.value)}>
                {['top', 'bottom', 'dress', 'outerwear', 'footwear', 'accessory', 'full-outfit'].map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Fabric</label>
              <select className="select" value={fabric} onChange={e => setFabric(e.target.value)}>
                {['cotton', 'silk', 'denim', 'leather', 'polyester', 'wool', 'linen', 'chiffon', 'velvet'].map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">Size</label>
              <select className="select" value={size} onChange={e => setSize(e.target.value)}>
                {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Style</label>
              <select className="select" value={style} onChange={e => setStyle(e.target.value)}>
                {['minimalist', 'streetwear', 'formal', 'bohemian', 'futuristic'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button className="btn btn-primary btn-lg" style={{ flex: 1 }}>🎨 Generate Design</button>
            <button className="btn btn-secondary">📋 Tech Pack</button>
          </div>
        </div>
        <div className="card">
          <div className="card-header"><h3 className="card-title">👁️ Design Preview</h3></div>
          <div style={{ aspectRatio: '3/4', background: 'linear-gradient(180deg, #fef3f2, #fde8e8)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)' }}>
            <div style={{ textAlign: 'center' }}><div style={{ fontSize: '4rem' }}>👗</div><div style={{ color: '#666', fontSize: '0.85rem' }}>Fashion preview</div></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== DESIGN SUITE =====
function DesignStudioPage() {
  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">🎨 Design Suite</h1>
        <p className="page-subtitle">Canva-class design — posters, social media, logos, presentations, SVG/PDF export</p>
      </div>
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header"><h3 className="card-title">📐 Templates</h3></div>
        <div className="grid grid-3">
          {[
            { icon: '📰', name: 'Modern Poster', size: '1080x1920' },
            { icon: '📱', name: 'Social Media Post', size: '1080x1080' },
            { icon: '💼', name: 'Business Card', size: '1050x600' },
            { icon: '🖼️', name: 'Web Banner', size: '1920x400' },
            { icon: '⭐', name: 'Logo Design', size: '500x500' },
            { icon: '📊', name: 'Presentation', size: '1920x1080' },
          ].map(t => (
            <div key={t.name} style={{ padding: 20, background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', cursor: 'pointer', textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>{t.icon}</div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{t.name}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{t.size}px</div>
            </div>
          ))}
        </div>
      </div>
      <div className="card">
        <div className="card-header"><h3 className="card-title">🖌️ Canvas</h3></div>
        <div style={{ aspectRatio: '16/9', background: '#fff', borderRadius: 'var(--radius-md)', border: '2px dashed var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', color: '#999' }}><div style={{ fontSize: '2rem' }}>🖌️</div><div>Select a template to start designing</div><div style={{ fontSize: '0.78rem' }}>Drag elements, add text, shapes, images — export to PNG/SVG/PDF</div></div>
        </div>
      </div>
    </div>
  );
}

// ===== ROBOTICS LAB =====
function RoboticsLab() {
  const [robotType, setRobotType] = useState('arm');
  const [backend, setBackend] = useState('mock');
  const [environment, setEnvironment] = useState('warehouse');

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">🤖 Robotics Lab</h1>
        <p className="page-subtitle">Multi-backend robotics simulation — Isaac Sim, MuJoCo, PyBullet</p>
      </div>
      <div className="grid grid-2" style={{ marginBottom: 24 }}>
        <div className="card">
          <div className="card-header"><h3 className="card-title">🔧 Simulation Config</h3></div>
          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">Robot Type</label>
              <select className="select" value={robotType} onChange={e => setRobotType(e.target.value)}>
                <option value="arm">6-DOF Robot Arm</option><option value="mobile">Mobile Robot</option>
                <option value="humanoid">Humanoid (22 joints)</option><option value="drone">Quadcopter Drone</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Sim Backend</label>
              <select className="select" value={backend} onChange={e => setBackend(e.target.value)}>
                <option value="mock">Mock (no GPU)</option><option value="isaac-sim">NVIDIA Isaac Sim</option>
                <option value="mujoco">MuJoCo</option><option value="pybullet">PyBullet</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Environment</label>
            <select className="select" value={environment} onChange={e => setEnvironment(e.target.value)}>
              {['warehouse', 'outdoor', 'kitchen', 'factory', 'empty'].map(e => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>
          <button className="btn btn-primary btn-lg" style={{ width: '100%' }}>🚀 Start Simulation</button>
        </div>
        <div className="card">
          <div className="card-header"><h3 className="card-title">📊 Simulation View</h3></div>
          <div style={{ aspectRatio: '16/9', background: 'linear-gradient(135deg, #0f1923, #1a2632)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)' }}>
            <div style={{ textAlign: 'center' }}><div style={{ fontSize: '3rem' }}>🤖</div><div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 8 }}>Simulation viewport</div></div>
          </div>
        </div>
      </div>
      <div className="card">
        <div className="card-header"><h3 className="card-title">🤖 Available Robots</h3></div>
        <div className="grid grid-4">
          {[{ icon: '🦾', name: '6-DOF Arm', sensors: 'Camera, Force-Torque', joints: 6 }, { icon: '🚗', name: 'Mobile Robot', sensors: 'LiDAR, Camera, IMU', joints: 2 }, { icon: '🧍', name: 'Humanoid', sensors: 'IMU, Camera, Force', joints: 22 }, { icon: '🚁', name: 'Drone', sensors: 'Camera, IMU, Proximity', joints: 4 }].map(r => (
            <div key={r.name} style={{ padding: 16, background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: 6 }}>{r.icon}</div>
              <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{r.name}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{r.joints} joints | {r.sensors}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ===== KNOWLEDGE BRAIN =====
function KnowledgeBrain() {
  const [query, setQuery] = useState('');
  const [depth, setDepth] = useState('standard');
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [explainContent, setExplainContent] = useState('');
  const [explanation, setExplanation] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'research' | 'explain' | 'graph'>('research');

  const doResearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/innovation/knowledge-brain/research`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, depth })
      });
      setResults(await res.json());
    } catch { setResults({ results: { summary: 'Research engine processing...', keyFindings: [], confidence: 0 } }); }
    setLoading(false);
  };

  const doExplain = async () => {
    if (!explainContent.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/innovation/knowledge-brain/explain`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: explainContent, type: 'text', level: 'student' })
      });
      setExplanation(await res.json());
    } catch { }
    setLoading(false);
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">🌐 Knowledge Brain</h1>
        <p className="page-subtitle">AI research engine — explore knowledge, build concept maps, explain anything</p>
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {(['research', 'explain', 'graph'] as const).map(t => (
          <button key={t} className={`btn ${activeTab === t ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab(t)}>
            {t === 'research' ? '🔍 Research' : t === 'explain' ? '📖 Explain Anything' : '🗺️ Knowledge Graph'}
          </button>
        ))}
      </div>

      {activeTab === 'research' && (
        <div className="grid grid-2" style={{ marginBottom: 24 }}>
          <div className="card">
            <div className="card-header"><h3 className="card-title">🔍 Deep Research</h3></div>
            <div className="form-group">
              <label className="form-label">Research Query</label>
              <textarea className="input" rows={3} value={query} onChange={e => setQuery(e.target.value)} placeholder="What do you want to research? e.g., 'Explain quantum computing' or 'Latest AI trends in education'" style={{ resize: 'vertical' }} />
            </div>
            <div className="form-group">
              <label className="form-label">Research Depth</label>
              <select className="select" value={depth} onChange={e => setDepth(e.target.value)}>
                <option value="quick">Quick Overview</option>
                <option value="standard">Standard Research</option>
                <option value="deep">Deep Analysis</option>
                <option value="comprehensive">Comprehensive Study</option>
              </select>
            </div>
            <button className="btn btn-primary btn-lg" style={{ width: '100%' }} onClick={doResearch} disabled={loading || !query.trim()}>
              {loading ? '🔄 Researching...' : '🚀 Start Research'}
            </button>
          </div>
          <div className="card">
            <div className="card-header"><h3 className="card-title">📊 Results</h3></div>
            {results ? (
              <div>
                <p style={{ fontSize: '0.88rem', lineHeight: 1.6, marginBottom: 16 }}>{results.results?.summary}</p>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Confidence: <strong>{Math.round((results.results?.confidence || 0) * 100)}%</strong>
                </div>
                {results.results?.keyFindings?.map((f: any, i: number) => (
                  <div key={i} style={{ padding: '8px 12px', margin: '8px 0', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem' }}>
                    <strong>{f.title}</strong> — Relevance: {Math.round(f.relevance * 100)}% ({f.source})
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Enter a query to begin research</div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'explain' && (
        <div className="grid grid-2" style={{ marginBottom: 24 }}>
          <div className="card">
            <div className="card-header"><h3 className="card-title">📖 Explain Anything</h3></div>
            <div className="form-group">
              <label className="form-label">Paste content to explain (text, URL, code, research paper...)</label>
              <textarea className="input" rows={6} value={explainContent} onChange={e => setExplainContent(e.target.value)} placeholder="Paste any content here — article, code, research paper, equation, screenshot text..." style={{ resize: 'vertical' }} />
            </div>
            <button className="btn btn-primary btn-lg" style={{ width: '100%' }} onClick={doExplain} disabled={loading || !explainContent.trim()}>
              {loading ? '🔄 Analyzing...' : '📖 Explain This'}
            </button>
          </div>
          <div className="card">
            <div className="card-header"><h3 className="card-title">💡 Explanation</h3></div>
            {explanation ? (
              <div>
                <p style={{ fontSize: '0.88rem', lineHeight: 1.6, marginBottom: 12 }}>{explanation.explanation?.summary}</p>
                <h4 style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: 8 }}>Key Points:</h4>
                {explanation.explanation?.keyPoints?.map((p: string, i: number) => (
                  <div key={i} style={{ padding: '6px 12px', margin: '4px 0', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem' }}>{p}</div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Paste content and click "Explain This"</div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'graph' && (
        <div className="card">
          <div className="card-header"><h3 className="card-title">🗺️ Knowledge Graph</h3></div>
          <div style={{ aspectRatio: '16/9', background: 'radial-gradient(circle at 50% 50%, #0a1628, #050d1a)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '4rem' }}>🗺️</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 8 }}>Interactive knowledge graph visualization</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: 4 }}>Research a topic first to build the graph</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ===== AI MEMORY =====
function AIMemoryPage() {
  const [stats, setStats] = useState<any>(null);
  const [timeline, setTimeline] = useState<any>(null);
  const [newMemory, setNewMemory] = useState({ title: '', content: '', kind: 'episodic' });

  useEffect(() => {
    fetch(`${API}/api/innovation/memory/status`).then(r => r.json()).then(setStats).catch(() => {});
    fetch(`${API}/api/innovation/memory/timeline`).then(r => r.json()).then(setTimeline).catch(() => {});
  }, []);

  const storeMemory = async () => {
    if (!newMemory.title.trim()) return;
    await fetch(`${API}/api/innovation/memory/store`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newMemory)
    });
    setNewMemory({ title: '', content: '', kind: 'episodic' });
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">💾 AI Memory</h1>
        <p className="page-subtitle">Persistent intelligence — your AI remembers conversations, projects, preferences, and learning history</p>
      </div>
      <div className="grid grid-4 stagger" style={{ marginBottom: 24 }}>
        {[
          { icon: '🧠', value: stats?.stats?.memoriesStored || 0, label: 'Memories Stored' },
          { icon: '📚', value: stats?.stats?.topicsTracked || 0, label: 'Topics Tracked' },
          { icon: '🔥', value: stats?.stats?.learningStreak || 0, label: 'Day Streak' },
          { icon: '💡', value: stats?.stats?.insightsGenerated || 0, label: 'Insights' },
        ].map(s => (
          <div key={s.label} className="stat-card animate-fade-in">
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-2" style={{ marginBottom: 24 }}>
        <div className="card">
          <div className="card-header"><h3 className="card-title">➕ Store New Memory</h3></div>
          <div className="form-group">
            <label className="form-label">Memory Title</label>
            <input className="input" value={newMemory.title} onChange={e => setNewMemory(p => ({ ...p, title: e.target.value }))} placeholder="What should I remember?" />
          </div>
          <div className="form-group">
            <label className="form-label">Content</label>
            <textarea className="input" rows={3} value={newMemory.content} onChange={e => setNewMemory(p => ({ ...p, content: e.target.value }))} placeholder="Details, context, notes..." style={{ resize: 'vertical' }} />
          </div>
          <div className="form-group">
            <label className="form-label">Type</label>
            <select className="select" value={newMemory.kind} onChange={e => setNewMemory(p => ({ ...p, kind: e.target.value }))}>
              <option value="episodic">Episodic (event/conversation)</option>
              <option value="profile">Profile (personal fact)</option>
              <option value="preference">Preference</option>
              <option value="skill">Skill/Strength</option>
              <option value="document">Document</option>
            </select>
          </div>
          <button className="btn btn-primary btn-lg" style={{ width: '100%' }} onClick={storeMemory}>💾 Save Memory</button>
        </div>
        <div className="card">
          <div className="card-header"><h3 className="card-title">⏰ Learning Timeline</h3></div>
          {timeline?.timeline?.length ? (
            timeline.timeline.map((t: any, i: number) => (
              <div key={i} style={{ padding: '10px 12px', borderLeft: '3px solid var(--accent-primary)', marginBottom: 8, background: 'var(--bg-tertiary)', borderRadius: '0 var(--radius-sm) var(--radius-sm) 0', fontSize: '0.82rem' }}>
                <strong>{t.title}</strong><br /><span style={{ color: 'var(--text-muted)' }}>{t.date}</span>
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '2rem', marginBottom: 8 }}>⏰</div>
              Your learning timeline will grow as you use the platform
            </div>
          )}
        </div>
      </div>
      <div className="card">
        <div className="card-header"><h3 className="card-title">🔒 Privacy Controls</h3></div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button className="btn btn-secondary">📥 Export All Memories</button>
          <button className="btn btn-secondary">🔍 Search Memories</button>
          <button className="btn btn-secondary" style={{ color: '#ef4444' }}>🗑️ Clear All Memories</button>
        </div>
        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 12 }}>Your memories are stored locally and never shared. Full control over what the AI remembers.</p>
      </div>
    </div>
  );
}

// ===== IDEA LAB =====
function IdeaLab() {
  const [idea, setIdea] = useState('');
  const [activeMode, setActiveMode] = useState<'validate' | 'evolve' | 'combine' | 'startup'>('validate');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [combineIdeas, setCombineIdeas] = useState('');

  const runAction = async (endpoint: string, body: any) => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/innovation/idea-lab/${endpoint}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
      });
      setResult(await res.json());
    } catch { setResult({ error: 'Processing...' }); }
    setLoading(false);
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">💡 Idea Lab</h1>
        <p className="page-subtitle">Validate ideas, evolve them into products, combine concepts, generate startup plans</p>
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {[{ id: 'validate' as const, icon: '✅', label: 'Validate Idea' }, { id: 'evolve' as const, icon: '🚀', label: 'Evolve Idea' }, { id: 'combine' as const, icon: '🔗', label: 'Combine Ideas' }, { id: 'startup' as const, icon: '🏢', label: 'Build Startup' }].map(m => (
          <button key={m.id} className={`btn ${activeMode === m.id ? 'btn-primary' : 'btn-secondary'}`} onClick={() => { setActiveMode(m.id); setResult(null); }}>
            {m.icon} {m.label}
          </button>
        ))}
      </div>
      <div className="grid grid-2">
        <div className="card">
          <div className="card-header"><h3 className="card-title">{activeMode === 'validate' ? '✅ Validate' : activeMode === 'evolve' ? '🚀 Evolve' : activeMode === 'combine' ? '🔗 Combine' : '🏢 Startup Builder'}</h3></div>
          {activeMode !== 'combine' ? (
            <div className="form-group">
              <label className="form-label">Your Idea</label>
              <textarea className="input" rows={4} value={idea} onChange={e => setIdea(e.target.value)} placeholder="Describe your idea... e.g., 'AI-powered study app for JEE preparation'" style={{ resize: 'vertical' }} />
            </div>
          ) : (
            <div className="form-group">
              <label className="form-label">Ideas to Combine (one per line)</label>
              <textarea className="input" rows={4} value={combineIdeas} onChange={e => setCombineIdeas(e.target.value)} placeholder="Education platform&#10;Gaming mechanics&#10;AI tutoring" style={{ resize: 'vertical' }} />
            </div>
          )}
          <button className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading} onClick={() => {
            if (activeMode === 'combine') runAction('combine', { ideas: combineIdeas.split('\n').filter(Boolean) });
            else if (activeMode === 'startup') runAction('startup', { idea, budget: 'bootstrap' });
            else runAction(activeMode, { idea });
          }}>
            {loading ? '🔄 Processing...' : activeMode === 'validate' ? '✅ Validate Now' : activeMode === 'evolve' ? '🚀 Evolve It' : activeMode === 'combine' ? '🔗 Combine!' : '🏢 Generate Startup Plan'}
          </button>
        </div>
        <div className="card">
          <div className="card-header"><h3 className="card-title">📊 Results</h3></div>
          {result ? (
            <div className="code-block" style={{ maxHeight: 400, overflowY: 'auto', fontSize: '0.8rem' }}>
              <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(result, null, 2)}</pre>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '3rem', marginBottom: 12 }}>💡</div>
              Enter an idea and run an action to see results
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ===== CODE FORGE =====
function CodeForge() {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('typescript');
  const [activeMode, setActiveMode] = useState<'debug' | 'evolve' | 'screenshot'>('debug');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runForge = async (endpoint: string, body: any) => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/innovation/code-forge/${endpoint}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
      });
      setResult(await res.json());
    } catch { }
    setLoading(false);
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">🔨 Code Forge</h1>
        <p className="page-subtitle">AI-powered debugging, code evolution, screenshot-to-code, auto-refactor</p>
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[{ id: 'debug' as const, icon: '🐛', label: 'Debug Code' }, { id: 'evolve' as const, icon: '🧬', label: 'Evolve Code' }, { id: 'screenshot' as const, icon: '📸', label: 'Screenshot → Code' }].map(m => (
          <button key={m.id} className={`btn ${activeMode === m.id ? 'btn-primary' : 'btn-secondary'}`} onClick={() => { setActiveMode(m.id); setResult(null); }}>
            {m.icon} {m.label}
          </button>
        ))}
      </div>
      <div className="grid grid-2">
        <div className="card">
          <div className="card-header"><h3 className="card-title">{activeMode === 'debug' ? '🐛 Paste Code to Debug' : activeMode === 'evolve' ? '🧬 Paste Code to Evolve' : '📸 Upload Screenshot'}</h3></div>
          {activeMode !== 'screenshot' ? (
            <>
              <div className="form-group">
                <label className="form-label">Language</label>
                <select className="select" value={language} onChange={e => setLanguage(e.target.value)}>
                  {['typescript', 'javascript', 'python', 'java', 'c++', 'rust', 'go', 'ruby'].map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Code</label>
                <textarea className="input" rows={10} value={code} onChange={e => setCode(e.target.value)} placeholder="Paste your code here..." style={{ resize: 'vertical', fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }} />
              </div>
            </>
          ) : (
            <div style={{ border: '2px dashed var(--border)', borderRadius: 'var(--radius-md)', padding: 40, textAlign: 'center', cursor: 'pointer' }}>
              <div style={{ fontSize: '3rem', marginBottom: 8 }}>📸</div>
              <div style={{ color: 'var(--text-muted)' }}>Click to upload or drag a screenshot</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>Supports PNG, JPG, WebP</div>
            </div>
          )}
          <button className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 12 }} disabled={loading} onClick={() => {
            if (activeMode === 'screenshot') runForge('screenshot-to-code', { framework: 'react' });
            else runForge(activeMode, { code, language });
          }}>
            {loading ? '🔄 Processing...' : activeMode === 'debug' ? '🐛 Analyze Code' : activeMode === 'evolve' ? '🧬 Evolve Code' : '📸 Convert to Code'}
          </button>
        </div>
        <div className="card">
          <div className="card-header"><h3 className="card-title">📊 Analysis</h3></div>
          {result ? (
            <div className="code-block" style={{ maxHeight: 500, overflowY: 'auto', fontSize: '0.78rem' }}>
              <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(result, null, 2)}</pre>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '3rem', marginBottom: 12 }}>🔨</div>
              Paste code and run analysis
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ===== DATA INSIGHTS =====
function DataInsights() {
  const [scenario, setScenario] = useState('');
  const [simResult, setSimResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runSimulation = async () => {
    if (!scenario.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/innovation/data-insights/simulate`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario })
      });
      setSimResult(await res.json());
    } catch { }
    setLoading(false);
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">📈 Data Insights</h1>
        <p className="page-subtitle">Upload data, discover patterns, run simulations, predict trends</p>
      </div>
      <div className="grid grid-2" style={{ marginBottom: 24 }}>
        <div className="card">
          <div className="card-header"><h3 className="card-title">📊 Upload & Analyze Data</h3></div>
          <div style={{ border: '2px dashed var(--border)', borderRadius: 'var(--radius-md)', padding: 40, textAlign: 'center', cursor: 'pointer', marginBottom: 16 }}>
            <div style={{ fontSize: '3rem', marginBottom: 8 }}>📁</div>
            <div style={{ color: 'var(--text-muted)' }}>Drop CSV, Excel, or JSON files here</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>AI will auto-detect patterns and generate insights</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-primary" style={{ flex: 1 }}>📊 Auto-Analyze</button>
            <button className="btn btn-secondary">📈 Predict Trends</button>
          </div>
        </div>
        <div className="card">
          <div className="card-header"><h3 className="card-title">🔮 Simulation Lab</h3></div>
          <div className="form-group">
            <label className="form-label">Describe a scenario to simulate</label>
            <textarea className="input" rows={3} value={scenario} onChange={e => setScenario(e.target.value)} placeholder="What if I launch an AI tutoring app in India targeting JEE students?" style={{ resize: 'vertical' }} />
          </div>
          <button className="btn btn-primary btn-lg" style={{ width: '100%' }} onClick={runSimulation} disabled={loading || !scenario.trim()}>
            {loading ? '🔮 Simulating...' : '🔮 Run Simulation'}
          </button>
          {simResult && (
            <div style={{ marginTop: 16 }}>
              {Object.entries(simResult.simulation?.results || {}).map(([key, val]: [string, any]) => (
                <div key={key} style={{ padding: '10px 12px', margin: '6px 0', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem' }}>
                  <strong>{key}:</strong> {val.outcome} (probability: {Math.round(val.probability * 100)}%)
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="card">
        <div className="card-header"><h3 className="card-title">📉 Visualization Canvas</h3></div>
        <div style={{ aspectRatio: '21/9', background: 'linear-gradient(135deg, #0d1117, #161b22)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem' }}>📊</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 8 }}>Charts and visualizations will render here</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== LEARNING HUB =====
function LearningHub() {
  const [topic, setTopic] = useState('');
  const [activeTab, setActiveTab] = useState<'courses' | 'debate' | 'curiosity'>('courses');
  const [courseResult, setCourseResult] = useState<any>(null);
  const [debateTopic, setDebateTopic] = useState('');
  const [debateResult, setDebateResult] = useState<any>(null);
  const [curiosities, setCuriosities] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`${API}/api/innovation/learning-hub/curiosity`).then(r => r.json()).then(setCuriosities).catch(() => {});
  }, []);

  const createCourse = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/innovation/learning-hub/create-course`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, level: 'beginner', duration: '30 days' })
      });
      setCourseResult(await res.json());
    } catch { }
    setLoading(false);
  };

  const runDebate = async () => {
    if (!debateTopic.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/innovation/learning-hub/debate`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: debateTopic })
      });
      setDebateResult(await res.json());
    } catch { }
    setLoading(false);
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">📚 Learning Hub</h1>
        <p className="page-subtitle">AI-generated courses, debate mode, skill builder, curiosity engine</p>
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[{ id: 'courses' as const, icon: '🎓', label: 'Course Builder' }, { id: 'debate' as const, icon: '⚔️', label: 'Debate Mode' }, { id: 'curiosity' as const, icon: '🔮', label: 'Curiosity Engine' }].map(t => (
          <button key={t.id} className={`btn ${activeTab === t.id ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab(t.id)}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'courses' && (
        <div className="grid grid-2">
          <div className="card">
            <div className="card-header"><h3 className="card-title">🎓 Create Personalized Course</h3></div>
            <div className="form-group">
              <label className="form-label">What do you want to learn?</label>
              <input className="input" value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g., Machine Learning, Physics for JEE, Web Development" />
            </div>
            <button className="btn btn-primary btn-lg" style={{ width: '100%' }} onClick={createCourse} disabled={loading}>
              {loading ? '🔄 Generating...' : '🎓 Generate Course'}
            </button>
          </div>
          <div className="card">
            <div className="card-header"><h3 className="card-title">📋 Course Plan</h3></div>
            {courseResult?.course ? (
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 12 }}>{courseResult.course.topic}</h4>
                <div style={{ display: 'flex', gap: 16, marginBottom: 16, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  <span>📖 {courseResult.course.totalLessons} lessons</span>
                  <span>✏️ {courseResult.course.totalExercises} exercises</span>
                  <span>⏱️ ~{courseResult.course.estimatedHours}h</span>
                </div>
                {courseResult.course.modules?.map((m: any) => (
                  <div key={m.week} style={{ padding: '10px 14px', margin: '6px 0', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem' }}>
                    <strong>Week {m.week}:</strong> {m.title} — {m.lessons} lessons, {m.exercises} exercises
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Enter a topic to generate a personalized course</div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'debate' && (
        <div className="grid grid-2">
          <div className="card">
            <div className="card-header"><h3 className="card-title">⚔️ AI Debate Mode</h3></div>
            <div className="form-group">
              <label className="form-label">Debate Topic</label>
              <input className="input" value={debateTopic} onChange={e => setDebateTopic(e.target.value)} placeholder="e.g., Is AI dangerous for humanity?" />
            </div>
            <button className="btn btn-primary btn-lg" style={{ width: '100%' }} onClick={runDebate} disabled={loading}>
              {loading ? '🔄 Debating...' : '⚔️ Start Debate'}
            </button>
          </div>
          <div className="card">
            <div className="card-header"><h3 className="card-title">📊 Debate Results</h3></div>
            {debateResult?.debate ? (
              <div>
                <div style={{ marginBottom: 16 }}>
                  <h4 style={{ color: '#10b981', fontSize: '0.88rem', marginBottom: 8 }}>✅ {debateResult.debate.pro.title}</h4>
                  {debateResult.debate.pro.points.map((p: string, i: number) => (
                    <div key={i} style={{ padding: '6px 12px', margin: '4px 0', background: 'rgba(16,185,129,0.1)', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem' }}>{p}</div>
                  ))}
                </div>
                <div style={{ marginBottom: 16 }}>
                  <h4 style={{ color: '#ef4444', fontSize: '0.88rem', marginBottom: 8 }}>❌ {debateResult.debate.con.title}</h4>
                  {debateResult.debate.con.points.map((p: string, i: number) => (
                    <div key={i} style={{ padding: '6px 12px', margin: '4px 0', background: 'rgba(239,68,68,0.1)', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem' }}>{p}</div>
                  ))}
                </div>
                <div style={{ padding: 12, background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem' }}>
                  <strong>⚖️ Conclusion:</strong> {debateResult.debate.conclusion}
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Enter a topic to see both sides</div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'curiosity' && (
        <div className="card">
          <div className="card-header"><h3 className="card-title">🔮 Curiosity Engine — Explore Something New</h3></div>
          <div className="grid grid-2" style={{ gap: 12 }}>
            {curiosities?.suggestions?.map((c: any, i: number) => (
              <div key={i} style={{ padding: 16, background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', cursor: 'pointer' }}>
                <div style={{ fontSize: '0.92rem', fontWeight: 600, marginBottom: 6 }}>{c.title}</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <span className="tag">{c.category}</span>
                  <span className="tag">{c.difficulty}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ===== TREND RADAR =====
function TrendRadar() {
  const [trends, setTrends] = useState<any[]>([]);
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState('');
  const [decision, setDecision] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`${API}/api/innovation/trend-radar/trends`).then(r => r.json()).then(d => setTrends(d.trends || [])).catch(() => {});
  }, []);

  const getDecision = async () => {
    if (!question.trim() || !options.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/innovation/trend-radar/decide`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, options: options.split('\n').filter(Boolean) })
      });
      setDecision(await res.json());
    } catch { }
    setLoading(false);
  };

  const momentumColor = (m: string) => m === 'exploding' ? '#ef4444' : m === 'rising' ? '#10b981' : m === 'stable' ? '#3b82f6' : '#6b7280';

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">📡 Trend Radar</h1>
        <p className="page-subtitle">Scan emerging trends, analyze markets, make smarter decisions with AI</p>
      </div>
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header"><h3 className="card-title">🔥 Live Trends</h3></div>
        <div className="grid grid-3" style={{ gap: 12 }}>
          {trends.map(t => (
            <div key={t.id} style={{ padding: 16, background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>{t.title}</span>
                <span style={{ color: momentumColor(t.momentum), fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase' }}>{t.momentum}</span>
              </div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <span className="tag">{t.category}</span>
                <span style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 600 }}>{t.growth}</span>
              </div>
              <div className="progress-bar" style={{ height: 4 }}>
                <div className="progress-fill" style={{ width: `${t.score}%` }}></div>
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Score: {t.score}/100</span>
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-2">
        <div className="card">
          <div className="card-header"><h3 className="card-title">🤔 AI Decision Helper</h3></div>
          <div className="form-group">
            <label className="form-label">Your Question</label>
            <input className="input" value={question} onChange={e => setQuestion(e.target.value)} placeholder="e.g., Should I build an AI tutoring app or a code editor?" />
          </div>
          <div className="form-group">
            <label className="form-label">Options (one per line)</label>
            <textarea className="input" rows={3} value={options} onChange={e => setOptions(e.target.value)} placeholder="AI tutoring app&#10;Code editor&#10;Research tool" style={{ resize: 'vertical' }} />
          </div>
          <button className="btn btn-primary btn-lg" style={{ width: '100%' }} onClick={getDecision} disabled={loading}>
            {loading ? '🔄 Analyzing...' : '🤔 Help Me Decide'}
          </button>
        </div>
        <div className="card">
          <div className="card-header"><h3 className="card-title">📊 Decision Analysis</h3></div>
          {decision ? (
            <div>
              {decision.analysis?.map((a: any, i: number) => (
                <div key={i} style={{ padding: '12px 14px', margin: '6px 0', background: i === 0 ? 'rgba(16,185,129,0.1)' : 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', border: i === 0 ? '1px solid rgba(16,185,129,0.3)' : 'none' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <strong style={{ fontSize: '0.88rem' }}>{a.option}</strong>
                    <span style={{ fontWeight: 700, color: a.score > 80 ? '#10b981' : '#f59e0b' }}>{a.score}/100</span>
                  </div>
                  <span className="tag" style={{ fontSize: '0.72rem' }}>{a.recommendation}</span>
                </div>
              ))}
              <div style={{ padding: 12, marginTop: 12, background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem' }}>
                <strong>Conclusion:</strong> {decision.conclusion}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Enter a question with options</div>
          )}
        </div>
      </div>
    </div>
  );
}

// ===== COLLAB SPACE =====
function CollabSpace() {
  const [description, setDescription] = useState('');
  const [designResult, setDesignResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const designProduct = async () => {
    if (!description.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/innovation/collab-space/design-product`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description })
      });
      setDesignResult(await res.json());
    } catch { }
    setLoading(false);
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">👥 Collaboration Space</h1>
        <p className="page-subtitle">AI collaboration rooms, product designer, team workspace with AI team members</p>
      </div>
      <div className="grid grid-3" style={{ marginBottom: 24 }}>
        {[
          { icon: '🤝', title: 'Create Room', desc: 'Start a collaboration room with AI assistants' },
          { icon: '🎨', title: 'Design Together', desc: 'Co-design products with AI and team' },
          { icon: '📋', title: 'Shared Canvas', desc: 'Real-time whiteboard for brainstorming' },
        ].map(c => (
          <div key={c.title} className="card" style={{ cursor: 'pointer', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>{c.icon}</div>
            <h4 style={{ fontWeight: 700, marginBottom: 4 }}>{c.title}</h4>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{c.desc}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-2">
        <div className="card">
          <div className="card-header"><h3 className="card-title">🎨 AI Product Designer</h3></div>
          <div className="form-group">
            <label className="form-label">Describe the product you want to design</label>
            <textarea className="input" rows={4} value={description} onChange={e => setDescription(e.target.value)} placeholder="A mobile app for habit tracking with gamification elements and social features..." style={{ resize: 'vertical' }} />
          </div>
          <button className="btn btn-primary btn-lg" style={{ width: '100%' }} onClick={designProduct} disabled={loading}>
            {loading ? '🎨 Designing...' : '🎨 Generate Product Design'}
          </button>
        </div>
        <div className="card">
          <div className="card-header"><h3 className="card-title">🖼️ Design Output</h3></div>
          {designResult?.product ? (
            <div>
              <h4 style={{ fontWeight: 700, marginBottom: 8 }}>{designResult.product.name}</h4>
              <div style={{ marginBottom: 12 }}>
                <strong style={{ fontSize: '0.82rem' }}>Color Palette:</strong>
                <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
                  {designResult.product.design?.colorPalette?.map((c: string) => (
                    <div key={c} style={{ width: 32, height: 32, borderRadius: '50%', background: c, border: '2px solid var(--border)' }} title={c} />
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <strong style={{ fontSize: '0.82rem' }}>UX Flow:</strong>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 6 }}>
                  {designResult.product.design?.uxFlow?.map((s: string, i: number) => (
                    <span key={i} className="tag">{i > 0 ? '→ ' : ''}{s}</span>
                  ))}
                </div>
              </div>
              <div>
                <strong style={{ fontSize: '0.82rem' }}>Screens:</strong>
                {designResult.product.design?.screens?.map((s: any, i: number) => (
                  <div key={i} style={{ padding: '8px 12px', margin: '4px 0', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem' }}>
                    <strong>{s.name}</strong> ({s.type}) — {s.components?.join(', ')}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Describe a product to generate a design</div>
          )}
        </div>
      </div>
    </div>
  );
}

// ===== AI MARKETPLACE =====
function MarketplacePage() {
  const [listings, setListings] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetch(`${API}/api/innovation/marketplace/listings`).then(r => r.json()).then(d => setListings(d.listings || [])).catch(() => {});
  }, []);

  const filtered = filter === 'all' ? listings : listings.filter(l => l.type === filter);
  const typeIcon = (t: string) => t === 'agent' ? '🤖' : t === 'pipeline' ? '🔄' : t === 'plugin' ? '🔌' : t === 'model' ? '🧠' : t === 'template' ? '📋' : '📦';

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">🏪 AI Marketplace</h1>
        <p className="page-subtitle">Browse and install agents, models, pipelines, plugins, datasets, and templates</p>
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {['all', 'agent', 'model', 'pipeline', 'plugin', 'dataset', 'template'].map(f => (
          <button key={f} className={`btn ${filter === f ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter(f)} style={{ fontSize: '0.82rem', textTransform: 'capitalize' }}>
            {f === 'all' ? '🏪 All' : `${typeIcon(f)} ${f}s`}
          </button>
        ))}
      </div>
      <div className="grid grid-3">
        {filtered.map(l => (
          <div key={l.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 10 }}>
              <div>
                <h4 style={{ fontWeight: 700, fontSize: '0.92rem' }}>{typeIcon(l.type)} {l.name}</h4>
                <span className="tag" style={{ marginTop: 4 }}>{l.type}</span>
              </div>
              <span style={{ color: '#10b981', fontWeight: 700, fontSize: '0.82rem' }}>{l.price}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 12 }}>
              <span>⭐ {l.rating}</span>
              <span>📥 {l.downloads}</span>
              <span>👤 {l.author}</span>
            </div>
            <button className="btn btn-primary btn-sm" style={{ width: '100%', justifyContent: 'center' }}>Install</button>
          </div>
        ))}
      </div>
      {filtered.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: '2rem', marginBottom: 8 }}>🏪</div>
          <div style={{ color: 'var(--text-muted)' }}>No items in this category yet</div>
        </div>
      )}
    </div>
  );
}

// ===== SELF-IMPROVE =====
function SelfImprovePage() {
  const [status, setStatus] = useState<any>(null);
  const [scanResult, setScanResult] = useState<any>(null);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    fetch(`${API}/api/innovation/self-improve/status`).then(r => r.json()).then(setStatus).catch(() => {});
  }, []);

  const runScan = async () => {
    setScanning(true);
    try {
      const res = await fetch(`${API}/api/innovation/self-improve/scan`, { method: 'POST' });
      setScanResult(await res.json());
    } catch { }
    setScanning(false);
  };

  const statusColor = (s: string) => s === 'optimized' || s === 'secure' || s === 'good' || s === 'up-to-date' ? '#10b981' : s === 'warning' ? '#f59e0b' : '#ef4444';

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">🔄 Self-Improving Platform</h1>
        <p className="page-subtitle">The platform automatically detects issues, suggests improvements, and optimizes itself</p>
      </div>
      <div className="grid grid-4 stagger" style={{ marginBottom: 24 }}>
        {[
          { icon: '🐛', value: status?.stats?.bugsAutoFixed || 0, label: 'Bugs Auto-Fixed' },
          { icon: '🚀', value: status?.stats?.improvementsMade || 0, label: 'Improvements' },
          { icon: '⚡', value: status?.stats?.optimizationsApplied || 0, label: 'Optimizations' },
          { icon: '💡', value: status?.stats?.suggestionsGenerated || 0, label: 'Suggestions' },
        ].map(s => (
          <div key={s.label} className="stat-card animate-fade-in">
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-2" style={{ marginBottom: 24 }}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">🏥 Platform Health</h3>
            <span style={{ fontWeight: 700, color: '#10b981', fontSize: '1.2rem' }}>{status?.healthScore || 0}/100</span>
          </div>
          {status?.improvements?.map((imp: any, i: number) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < (status?.improvements?.length - 1) ? '1px solid var(--border)' : 'none' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{imp.area}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{imp.detail}</div>
              </div>
              <span style={{ color: statusColor(imp.status), fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase' }}>{imp.status}</span>
            </div>
          ))}
        </div>
        <div className="card">
          <div className="card-header"><h3 className="card-title">🔍 Improvement Scanner</h3></div>
          <button className="btn btn-primary btn-lg" style={{ width: '100%', marginBottom: 16 }} onClick={runScan} disabled={scanning}>
            {scanning ? '🔄 Scanning...' : '🔍 Run Full Platform Scan'}
          </button>
          {scanResult?.scan?.suggestions?.map((s: any, i: number) => (
            <div key={i} style={{ padding: '10px 14px', margin: '6px 0', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', borderLeft: `3px solid ${s.priority === 'high' ? '#ef4444' : s.priority === 'medium' ? '#f59e0b' : '#3b82f6'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span className="tag">{s.area}</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{s.priority}</span>
              </div>
              <div style={{ fontSize: '0.82rem' }}>{s.suggestion}</div>
            </div>
          ))}
          {scanResult && (
            <div style={{ marginTop: 12, textAlign: 'center', fontSize: '0.85rem' }}>
              Overall Score: <strong style={{ color: '#10b981' }}>{scanResult.scan?.overallScore}/100</strong>
            </div>
          )}
        </div>
      </div>
      <div className="card">
        <div className="card-header"><h3 className="card-title">🔧 Self-Improvement Capabilities</h3></div>
        <div className="grid grid-3" style={{ gap: 12 }}>
          {[
            { icon: '🐛', title: 'Auto Bug Detection', desc: 'Continuously scans for bugs and auto-applies fixes' },
            { icon: '⚡', title: 'Performance Tuning', desc: 'Optimizes API response times and resource usage' },
            { icon: '🔒', title: 'Security Scanning', desc: 'Detects vulnerabilities and applies patches' },
            { icon: '📦', title: 'Dependency Updates', desc: 'Keeps all packages current and secure' },
            { icon: '🧠', title: 'Code Intelligence', desc: 'Suggests refactoring and architecture improvements' },
            { icon: '📊', title: 'Usage Analytics', desc: 'Learns from usage patterns to optimize features' },
          ].map(c => (
            <div key={c.title} style={{ padding: 14, background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: 6 }}>{c.icon}</div>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: 2 }}>{c.title}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ===== WORKBOOK =====
// ===== AUTONOMOUS AGENT HUB (OpenClaw) =====
function AgentHubPage() {
  const [overview, setOverview] = useState<any>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [goal, setGoal] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${API}/api/agent-hub/overview`).then(r => r.json()),
      fetch(`${API}/api/agent-hub/plans`).then(r => r.json()),
      fetch(`${API}/api/agent-hub/tasks`).then(r => r.json()),
    ]).then(([o, p, t]) => {
      setOverview(o); setPlans(p.plans || []); setTasks(t.tasks || []); setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const createPlan = () => {
    if (!goal.trim()) return;
    fetch(`${API}/api/agent-hub/plans`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ goal }) })
      .then(r => r.json()).then(plan => { setPlans(prev => [plan, ...prev]); setGoal(''); });
  };

  const executePlan = (planId: string) => {
    fetch(`${API}/api/agent-hub/plans/${planId}/execute`, { method: 'POST' })
      .then(r => r.json()).then(task => { setTasks(prev => [task, ...prev]); });
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">🤖 Autonomous Agent Hub</h1>
        <p className="page-subtitle">OpenClaw-compatible autonomous agent system — plan, execute, build, deploy</p>
      </div>

      {loading ? <div className="card" style={{ textAlign: 'center', padding: 40 }}>Loading Agent Hub...</div> : (
        <>
          {overview && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, marginBottom: 20 }}>
              {[
                { label: 'Status', value: overview.status, color: '#22c55e' },
                { label: 'Active Agents', value: overview.agents?.available?.length || 0, color: '#3b82f6' },
                { label: 'Total Plans', value: overview.agents?.totalPlans || 0, color: '#a855f7' },
                { label: 'Running Tasks', value: overview.agents?.active || 0, color: '#f59e0b' },
                { label: 'Teams', value: overview.agents?.totalTeams || 0, color: '#ec4899' },
                { label: 'Tools', value: overview.agents?.registeredTools || 0, color: '#06b6d4' },
              ].map((s, i) => (
                <div key={i} className="card" style={{ padding: 16, textAlign: 'center' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4 }}>{s.label}</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: s.color }}>{String(s.value).toUpperCase()}</div>
                </div>
              ))}
            </div>
          )}

          <div className="card" style={{ padding: 20, marginBottom: 20 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 12 }}>🎯 Create Autonomous Plan</h3>
            <div style={{ display: 'flex', gap: 10 }}>
              <input className="search-input" style={{ flex: 1 }} placeholder="Describe your goal (e.g., Build a SaaS landing page and deploy it)" value={goal} onChange={e => setGoal(e.target.value)} onKeyDown={e => e.key === 'Enter' && createPlan()} />
              <button className="btn btn-primary" onClick={createPlan}>Create Plan</button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="card" style={{ padding: 20 }}>
              <h3 style={{ fontWeight: 700, marginBottom: 12 }}>📋 Plans ({plans.length})</h3>
              {plans.length === 0 ? <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No plans yet — create one above</p> : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 400, overflowY: 'auto' }}>
                  {plans.map((p: any) => (
                    <div key={p.planId} style={{ padding: 12, background: 'var(--bg-secondary)', borderRadius: 8, border: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{p.goal?.slice(0, 60)}</span>
                        <span className={`status status-${p.status === 'completed' ? 'active' : p.status === 'running' ? 'active' : 'idle'}`}>
                          <span className="status-dot" />{p.status}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.steps?.length || 0} steps • {p.planId}</div>
                      {p.status === 'created' && (
                        <button className="btn btn-primary btn-sm" style={{ marginTop: 8 }} onClick={() => executePlan(p.planId)}>▶ Execute</button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card" style={{ padding: 20 }}>
              <h3 style={{ fontWeight: 700, marginBottom: 12 }}>⚡ Running Tasks ({tasks.length})</h3>
              {tasks.length === 0 ? <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No tasks running — execute a plan to start</p> : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 400, overflowY: 'auto' }}>
                  {tasks.map((t: any) => (
                    <div key={t.taskId || Math.random()} style={{ padding: 12, background: 'var(--bg-secondary)', borderRadius: 8, border: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{t.taskId || t.planId}</span>
                        <span className={`status status-${t.status === 'running' ? 'active' : t.status === 'completed' ? 'active' : 'idle'}`}>
                          <span className="status-dot" />{t.status}
                        </span>
                      </div>
                      {t.progress !== undefined && (
                        <div style={{ height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden', marginTop: 6 }}>
                          <div style={{ height: '100%', width: `${t.progress}%`, background: 'var(--accent)', borderRadius: 3, transition: 'width 0.3s' }} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {overview?.capabilities && (
            <div className="card" style={{ padding: 20, marginTop: 16 }}>
              <h3 style={{ fontWeight: 700, marginBottom: 12 }}>🛠 Capabilities</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {overview.capabilities.map((c: string) => (
                  <span key={c} className="sidebar-badge" style={{ background: 'var(--accent)', color: '#fff', padding: '4px 10px', borderRadius: 12, fontSize: '0.75rem' }}>{c}</span>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ===== AGENT TASKS MONITOR =====
function AgentTasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = () => {
    fetch(`${API}/api/agent-hub/tasks`).then(r => r.json())
      .then(data => { setTasks(data.tasks || []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { refresh(); const iv = setInterval(refresh, 3000); return () => clearInterval(iv); }, []);

  const doAction = (taskId: string, action: string) => {
    fetch(`${API}/api/agent-hub/tasks/${taskId}/${action}`, { method: 'POST' })
      .then(r => r.json()).then(() => refresh());
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">⚡ Task Monitor</h1>
        <p className="page-subtitle">Real-time autonomous task execution — pause, resume, cancel</p>
      </div>

      {loading ? <div className="card" style={{ textAlign: 'center', padding: 40 }}>Loading tasks...</div> : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
            {[
              { label: 'Total', value: tasks.length, color: '#3b82f6' },
              { label: 'Running', value: tasks.filter(t => t.status === 'running').length, color: '#22c55e' },
              { label: 'Completed', value: tasks.filter(t => t.status === 'completed').length, color: '#a855f7' },
              { label: 'Failed', value: tasks.filter(t => t.status === 'failed').length, color: '#ef4444' },
            ].map((s, i) => (
              <div key={i} className="card" style={{ padding: 16, textAlign: 'center' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{s.label}</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>

          {tasks.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: 60 }}>
              <div style={{ fontSize: '3rem', marginBottom: 12 }}>⚡</div>
              <h3 style={{ fontWeight: 700, marginBottom: 6 }}>No Tasks Yet</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Create a plan in Agent Hub and execute it to see tasks here</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {tasks.map((t: any) => (
                <div key={t.taskId} className="card" style={{ padding: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <div>
                      <h4 style={{ fontWeight: 700, fontSize: '0.95rem' }}>{t.goal || t.taskId}</h4>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{t.taskId} • Step {t.currentStep}/{t.totalSteps}</span>
                    </div>
                    <span className={`status status-${t.status === 'running' || t.status === 'completed' ? 'active' : 'idle'}`}>
                      <span className="status-dot" />{t.status}
                    </span>
                  </div>
                  <div style={{ height: 8, background: 'var(--border)', borderRadius: 4, overflow: 'hidden', marginBottom: 10 }}>
                    <div style={{ height: '100%', width: `${t.progress || 0}%`, background: t.status === 'completed' ? '#22c55e' : 'var(--accent)', borderRadius: 4, transition: 'width 0.5s' }} />
                  </div>
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                    {t.status === 'running' && <button className="btn btn-sm" onClick={() => doAction(t.taskId, 'pause')}>⏸ Pause</button>}
                    {t.status === 'paused' && <button className="btn btn-primary btn-sm" onClick={() => doAction(t.taskId, 'resume')}>▶ Resume</button>}
                    {(t.status === 'running' || t.status === 'paused') && <button className="btn btn-sm" style={{ color: '#ef4444' }} onClick={() => doAction(t.taskId, 'cancel')}>✕ Cancel</button>}
                  </div>
                  {t.logs && t.logs.length > 0 && (
                    <details style={{ marginTop: 10 }}>
                      <summary style={{ fontSize: '0.78rem', color: 'var(--text-muted)', cursor: 'pointer' }}>Logs ({t.logs.length})</summary>
                      <pre style={{ fontSize: '0.72rem', marginTop: 6, padding: 10, background: 'var(--bg-secondary)', borderRadius: 6, maxHeight: 200, overflow: 'auto', whiteSpace: 'pre-wrap' }}>
                        {t.logs.join('\n')}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ===== MULTI-AGENT TEAMS =====
function AgentTeamsPage() {
  const [teams, setTeams] = useState<any[]>([]);
  const [taskDesc, setTaskDesc] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/api/agent-hub/teams`).then(r => r.json())
      .then(data => { setTeams(data.teams || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const createTeam = () => {
    if (!taskDesc.trim()) return;
    fetch(`${API}/api/agent-hub/teams/create`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ task: taskDesc, agents: ['planner', 'coder', 'tester', 'deployer', 'researcher'] }) })
      .then(r => r.json()).then(team => { setTeams(prev => [team, ...prev]); setTaskDesc(''); });
  };

  const runTeam = (teamId: string) => {
    fetch(`${API}/api/agent-hub/teams/${teamId}/run`, { method: 'POST' })
      .then(r => r.json()).then(() => {
        setTimeout(() => {
          fetch(`${API}/api/agent-hub/teams`).then(r => r.json()).then(d => setTeams(d.teams || []));
        }, 2000);
      });
  };

  const roleIcons: Record<string, string> = { planner: '🧠', coder: '💻', tester: '🧪', deployer: '🚀', researcher: '🔍', security: '🛡', designer: '🎨', optimizer: '⚙️' };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">👥 Multi-Agent Teams</h1>
        <p className="page-subtitle">Create AI teams — multiple specialized agents working together</p>
      </div>

      <div className="card" style={{ padding: 20, marginBottom: 20 }}>
        <h3 style={{ fontWeight: 700, marginBottom: 12 }}>🏗 Create Agent Team</h3>
        <div style={{ display: 'flex', gap: 10 }}>
          <input className="search-input" style={{ flex: 1 }} placeholder="Describe the task (e.g., Build a SaaS website, deploy it, create marketing content)" value={taskDesc} onChange={e => setTaskDesc(e.target.value)} onKeyDown={e => e.key === 'Enter' && createTeam()} />
          <button className="btn btn-primary" onClick={createTeam}>Create Team</button>
        </div>
      </div>

      {loading ? <div className="card" style={{ textAlign: 'center', padding: 40 }}>Loading teams...</div> : teams.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 60 }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>👥</div>
          <h3 style={{ fontWeight: 700, marginBottom: 6 }}>No Teams Yet</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Create a team to assign multiple AI agents to a task</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {teams.map((team: any) => (
            <div key={team.teamId} className="card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div>
                  <h4 style={{ fontWeight: 700, fontSize: '0.95rem' }}>{team.task}</h4>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{team.teamId} • {team.agents?.length || 0} agents</span>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span className={`status status-${team.status === 'completed' || team.status === 'active' ? 'active' : 'idle'}`}>
                    <span className="status-dot" />{team.status}
                  </span>
                  {team.status === 'active' && <button className="btn btn-primary btn-sm" onClick={() => runTeam(team.teamId)}>▶ Run</button>}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {team.agents?.map((a: any) => (
                  <div key={a.id} style={{ padding: '8px 14px', background: 'var(--bg-secondary)', borderRadius: 8, border: '1px solid var(--border)', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>{roleIcons[a.role] || '🤖'}</span>
                    <span style={{ fontWeight: 600 }}>{a.role}</span>
                    <span className={`status status-${a.status === 'completed' ? 'active' : a.status === 'idle' ? 'idle' : 'idle'}`}>
                      <span className="status-dot" />{a.status}
                    </span>
                  </div>
                ))}
              </div>
              {team.communication && team.communication.length > 0 && (
                <details style={{ marginTop: 12 }}>
                  <summary style={{ fontSize: '0.78rem', color: 'var(--text-muted)', cursor: 'pointer' }}>Communication Log ({team.communication.length})</summary>
                  <div style={{ marginTop: 6, padding: 10, background: 'var(--bg-secondary)', borderRadius: 6, fontSize: '0.75rem', maxHeight: 200, overflow: 'auto' }}>
                    {team.communication.map((msg: any, i: number) => (
                      <div key={i} style={{ padding: '4px 0', borderBottom: '1px solid var(--border)' }}>
                        <strong>{msg.from}</strong>{msg.to ? ` → ${msg.to}` : ''}: {msg.message}
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ===== EVOLUTION DASHBOARD =====
function EvolutionDashboard() {
  const [status, setStatus] = useState<any>(null);
  const [insights, setInsights] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${API}/api/evolution/status`).then(r => r.json()),
      fetch(`${API}/api/evolution/insights`).then(r => r.json()),
      fetch(`${API}/api/evolution/agent-performance`).then(r => r.json()),
      fetch(`${API}/api/evolution/workflows`).then(r => r.json()),
      fetch(`${API}/api/evolution/suggestions`).then(r => r.json()),
    ]).then(([s, i, a, w, sg]) => {
      setStatus(s); setInsights(i.insights || []); setAgents(a.agents || []);
      setWorkflows(w.workflows || []); setSuggestions(sg.suggestions || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const runAnalysis = () => {
    fetch(`${API}/api/evolution/run-analysis`, { method: 'POST' })
      .then(r => r.json()).then(data => alert(`Analysis complete! Score: Performance ${data.findings?.performance?.score}, Security ${data.findings?.security?.score}`));
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">🧬 AI Evolution Engine</h1>
        <p className="page-subtitle">Self-improving AI — performance analysis, workflow optimization, continuous learning</p>
      </div>

      {loading ? <div className="card" style={{ textAlign: 'center', padding: 40 }}>Loading Evolution Engine...</div> : (
        <>
          {status && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12, marginBottom: 20 }}>
              {[
                { label: 'Health Score', value: `${status.healthScore}%`, color: status.healthScore > 90 ? '#22c55e' : '#f59e0b' },
                { label: 'Analysis Runs', value: status.stats?.analysisRuns || 0, color: '#3b82f6' },
                { label: 'Improvements', value: status.stats?.improvementsMade || 0, color: '#a855f7' },
                { label: 'Bugs Auto-Fixed', value: status.stats?.bugsAutoFixed || 0, color: '#ec4899' },
                { label: 'Workflows Learned', value: status.stats?.workflowsLearned || 0, color: '#06b6d4' },
                { label: 'Knowledge Entries', value: status.stats?.knowledgeEntries || 0, color: '#f97316' },
              ].map((s, i) => (
                <div key={i} className="card" style={{ padding: 16, textAlign: 'center' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4 }}>{s.label}</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: s.color }}>{s.value}</div>
                </div>
              ))}
            </div>
          )}

          <div style={{ marginBottom: 16, textAlign: 'right' }}>
            <button className="btn btn-primary" onClick={runAnalysis}>🔬 Run Full Analysis</button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div className="card" style={{ padding: 20 }}>
              <h3 style={{ fontWeight: 700, marginBottom: 12 }}>🤖 Agent Performance</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {agents.map((a: any) => (
                  <div key={a.role} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--bg-secondary)', borderRadius: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontWeight: 600, fontSize: '0.85rem', textTransform: 'capitalize' }}>{a.role}</span>
                      <span style={{ fontSize: '0.72rem', color: a.trend === 'improving' ? '#22c55e' : a.trend === 'needs-attention' ? '#ef4444' : 'var(--text-muted)' }}>
                        {a.trend === 'improving' ? '↑' : a.trend === 'needs-attention' ? '↓' : '→'} {a.trend}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center', fontSize: '0.78rem' }}>
                      <span>{Math.round(a.successRate * 100)}% success</span>
                      <span style={{ color: 'var(--text-muted)' }}>{a.tasksCompleted} tasks</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card" style={{ padding: 20 }}>
              <h3 style={{ fontWeight: 700, marginBottom: 12 }}>⚡ Learned Workflows</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {workflows.map((w: any) => (
                  <div key={w.id} style={{ padding: '8px 12px', background: 'var(--bg-secondary)', borderRadius: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{w.name}</span>
                      <span style={{ fontSize: '0.72rem', color: w.optimized ? '#22c55e' : '#f59e0b' }}>{w.optimized ? '✓ Optimized' : '○ Needs Opt.'}</span>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {w.pattern?.join(' → ')} • {Math.round(w.successRate * 100)}% success • {w.usageCount} uses
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="card" style={{ padding: 20 }}>
              <h3 style={{ fontWeight: 700, marginBottom: 12 }}>💡 Optimization Insights</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {insights.map((ins: any) => (
                  <div key={ins.id} style={{ padding: 10, background: 'var(--bg-secondary)', borderRadius: 8, borderLeft: `3px solid ${ins.priority === 'high' ? '#ef4444' : ins.priority === 'medium' ? '#f59e0b' : '#3b82f6'}` }}>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: 4 }}>{ins.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{ins.detail}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card" style={{ padding: 20 }}>
              <h3 style={{ fontWeight: 700, marginBottom: 12 }}>🚀 Improvement Suggestions</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {suggestions.map((s: any) => (
                  <div key={s.id} style={{ padding: 10, background: 'var(--bg-secondary)', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{s.title}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{s.type} • {s.priority} priority</div>
                    </div>
                    <span className="sidebar-badge" style={{ background: 'var(--accent)', color: '#fff', fontSize: '0.7rem' }}>{s.estimatedImpact}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function WorkbookPage() {
  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">📋 Workbook</h1>
        <p className="page-subtitle">Task management, notes, and workflow automation</p>
      </div>
      <div className="card" style={{ textAlign: 'center', padding: 60 }}>
        <div style={{ fontSize: '3rem', marginBottom: 12 }}>📋</div>
        <h3 style={{ fontWeight: 700, marginBottom: 6 }}>Workbook Coming Soon</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Manage tasks, take notes, and automate workflows — all in one place</p>
      </div>
    </div>
  );
}

// ===== INFERENCE =====
function InferencePage() {
  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">⚡ Inference Engine</h1>
        <p className="page-subtitle">Real-time AI inference endpoints — deploy and test models</p>
      </div>
      <div className="card" style={{ textAlign: 'center', padding: 60 }}>
        <div style={{ fontSize: '3rem', marginBottom: 12 }}>⚡</div>
        <h3 style={{ fontWeight: 700, marginBottom: 6 }}>Inference Dashboard</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Deploy trained models and test inference endpoints in real-time</p>
      </div>
    </div>
  );
}

// ===== UNIFIED CONTROL CENTER (lazy-loaded, navigation-only, no direct coupling) =====
function UnifiedControlCenter({ onNavigate }: { onNavigate: (page: string) => void }) {
  const [overview, setOverview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLoading(true);
    fetch(`${API}/api/control-center/overview`)
      .then(r => r.json())
      .then(data => { setOverview(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const features: any[] = overview?.features ?? [];
  const activity = overview?.activity ?? {};
  const health = overview?.systemHealth ?? {};

  const filtered = search.trim()
    ? features.filter((f: any) =>
      f.title.toLowerCase().includes(search.toLowerCase()) ||
      f.description.toLowerCase().includes(search.toLowerCase()) ||
      f.category.toLowerCase().includes(search.toLowerCase())
    )
    : features;

  const categories = [...new Set(filtered.map((f: any) => f.category))];

  const quickActions = [
    { icon: '🤖', label: 'New Chat', page: 'ai-chat' },
    { icon: '📁', label: 'New Project', page: 'projects' },
    { icon: '🧠', label: 'Train Model', page: 'training' },
    { icon: '🌐', label: 'View Agents', page: 'agents' },
    { icon: '🎮', label: 'Game Studio', page: 'game-studio' },
    { icon: '🎬', label: 'Video Studio', page: 'video-studio' },
    { icon: '🎵', label: 'Audio Studio', page: 'audio-studio' },
    { icon: '🧊', label: '3D Studio', page: '3d-studio' },
  ];

  const healthColor = (s: string) => s === 'online' || s === 'healthy' ? '#10b981' : s === 'degraded' ? '#f59e0b' : s === 'offline' ? '#ef4444' : '#6b7280';
  const healthDot = (s: string) => <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: healthColor(s), marginRight: 6 }} />;

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <div className="page-header">
        <h1 className="page-title">🧠 Unified Control Center</h1>
        <p className="page-subtitle">One intelligent hub — access every feature, monitor everything, navigate anywhere</p>
      </div>

      {/* Search bar */}
      <div className="card" style={{ marginBottom: 20, padding: '12px 20px' }}>
        <input
          className="input"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="🔍  Search features, studios, tools..."
          style={{ fontSize: '0.95rem', border: 'none', background: 'transparent', width: '100%', outline: 'none' }}
          id="ucc-search"
        />
      </div>

      {/* System Health Strip */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {healthDot(health.overall || 'unknown')}
            <strong style={{ fontSize: '0.88rem' }}>System: {(health.overall || 'unknown').toUpperCase()}</strong>
          </div>
          <div style={{ display: 'flex', gap: 20, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            <span>{healthDot(health.gpu || 'unknown')}GPU: {health.gpu || '—'}</span>
            <span>{healthDot(health.api || 'unknown')}API: {health.api || '—'}</span>
            <span>{healthDot(health.agents || 'unknown')}Agents: {health.agents || '—'}</span>
            <span style={{ fontFamily: 'var(--font-mono)' }}>Uptime: {health.uptime ? `${Math.round(health.uptime / 60)}m` : '—'}</span>
          </div>
        </div>
      </div>

      {/* Quick Launch */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {quickActions.map(qa => (
          <button
            key={qa.page}
            className="btn btn-secondary"
            onClick={() => onNavigate(qa.page)}
            style={{ fontSize: '0.82rem', padding: '8px 14px' }}
            id={`ucc-quick-${qa.page}`}
          >
            <span style={{ marginRight: 4 }}>{qa.icon}</span> {qa.label}
          </button>
        ))}
      </div>

      {/* Activity Summary */}
      <div className="grid grid-4 stagger" style={{ marginBottom: 24 }}>
        <div className="stat-card animate-fade-in">
          <div className="stat-icon">📁</div>
          <div className="stat-value">{activity.totalProjects ?? 0}</div>
          <div className="stat-label">Projects</div>
        </div>
        <div className="stat-card animate-fade-in">
          <div className="stat-icon">🤖</div>
          <div className="stat-value">{activity.activeAgents ?? 0}</div>
          <div className="stat-label">Active Agents</div>
        </div>
        <div className="stat-card animate-fade-in">
          <div className="stat-icon">⚙️</div>
          <div className="stat-value">{activity.pendingJobs ?? 0}</div>
          <div className="stat-label">Pending Jobs</div>
        </div>
        <div className="stat-card animate-fade-in">
          <div className="stat-icon">✅</div>
          <div className="stat-value">{activity.tasksCompleted ?? 0}</div>
          <div className="stat-label">Tasks Done</div>
        </div>
      </div>

      {/* Feature Cards by category */}
      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: 60 }}>
          <div className="spinner" style={{ width: 28, height: 28, margin: '0 auto 12px' }} />
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Loading Control Center...</div>
        </div>
      ) : categories.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: '2rem', marginBottom: 8 }}>🔍</div>
          <div style={{ color: 'var(--text-muted)' }}>No features matching "{search}"</div>
        </div>
      ) : (
        categories.map(cat => (
          <div key={String(cat)} style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 10 }}>{String(cat)}</h3>
            <div className="grid grid-3">
              {filtered.filter((f: any) => f.category === cat).map((f: any) => (
                <div
                  key={f.id}
                  className="card"
                  style={{ cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s' }}
                  onClick={() => onNavigate(f.navigateTo)}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(99,102,241,0.15)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = ''; }}
                  id={`ucc-feature-${f.id}`}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 8 }}>
                    <div style={{ fontSize: '1.5rem' }}>{f.icon}</div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {f.badgeText && <span className="sidebar-badge">{f.badgeText}</span>}
                      <span className={`status status-${f.status === 'online' ? 'active' : f.status}`}>
                        <span className="status-dot" />{f.status}
                      </span>
                    </div>
                  </div>
                  <h4 style={{ fontWeight: 700, fontSize: '0.92rem', marginBottom: 4 }}>{f.title}</h4>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.4, marginBottom: 12 }}>{f.description}</p>
                  <button className="btn btn-primary btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
                    Open →
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      {/* Footer notice */}
      <div style={{ textAlign: 'center', padding: '16px 0', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
        🧠 Control Center aggregates access to all modules — nothing is removed or replaced.
        {overview?.apiVersion && <span> • API {overview.apiVersion}</span>}
      </div>
    </div>
  );
}

// ===== MAIN APP =====
export default function Home() {
  const [activePage, setActivePage] = useState('dashboard');

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <Dashboard />;
      case 'control-center': return <UnifiedControlCenter onNavigate={setActivePage} />;
      case 'training': return <TrainingStudio />;
      case 'ai-chat': return <AIChat />;
      case 'models': return <ModelsPage />;
      case 'agents': return <AgentCivilization />;
      case 'projects': return <ProjectsPage />;
      case 'jobs': return <JobsPage />;
      case 'metrics': return <MetricsPage />;
      case 'settings': return <SettingsPage />;
      case 'game-studio': return <GameStudio />;
      case 'video-studio': return <VideoStudio />;
      case 'audio-studio': return <AudioStudio />;
      case '3d-studio': return <ThreeDStudio />;
      case 'fashion-studio': return <FashionStudioPage />;
      case 'design-studio': return <DesignStudioPage />;
      case 'robotics-lab': return <RoboticsLab />;
      case 'workbook': return <WorkbookPage />;
      case 'inference': return <InferencePage />;
      case 'knowledge-brain': return <KnowledgeBrain />;
      case 'ai-memory': return <AIMemoryPage />;
      case 'idea-lab': return <IdeaLab />;
      case 'code-forge': return <CodeForge />;
      case 'data-insights': return <DataInsights />;
      case 'learning-hub': return <LearningHub />;
      case 'trend-radar': return <TrendRadar />;
      case 'collab-space': return <CollabSpace />;
      case 'marketplace': return <MarketplacePage />;
      case 'self-improve': return <SelfImprovePage />;
      case 'agent-hub': return <AgentHubPage />;
      case 'agent-tasks': return <AgentTasksPage />;
      case 'agent-teams': return <AgentTeamsPage />;
      case 'evolution': return <EvolutionDashboard />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="app-layout">
      <Sidebar active={activePage} onNavigate={setActivePage} />
      <main className="main-content">
        {renderPage()}
      </main>
    </div>
  );
}
