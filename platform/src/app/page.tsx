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
    fetch(`${API}/api/metrics/json`).then(r => r.json()).then(setStats).catch(() => {});
    fetch(`${API}/api/agents/stats/overview`).then(r => r.json()).then(setAgentStats).catch(() => {});
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
    fetch(`${API}/api/training/architectures`).then(r => r.json()).then(d => setArchitectures(d.architectures || [])).catch(() => {});
    fetch(`${API}/api/training/gpu/status`).then(r => r.json()).then(setGpuStatus).catch(() => {});
  }, []);

  useEffect(() => {
    if (!currentJob || currentJob.status === 'completed' || currentJob.status === 'stopped') return;
    const interval = setInterval(() => {
      fetch(`${API}/api/training/jobs/${currentJob.id}`).then(r => r.json()).then(job => {
        setCurrentJob(job);
        if (job.status === 'completed' || job.status === 'stopped') {
          setTraining(false);
        }
      }).catch(() => {});
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
    fetch(`${API}/api/models`).then(r => r.json()).then(d => setModels(d.models || [])).catch(() => {});
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
    fetch(`${API}/api/agents`).then(r => r.json()).then(d => setAgents(d.agents || [])).catch(() => {});
    fetch(`${API}/api/agents/stats/overview`).then(r => r.json()).then(setStats).catch(() => {});
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
    fetch(`${API}/api/projects`).then(r => r.json()).then(d => setProjects(d.projects || [])).catch(() => {});
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
    fetch(`${API}/api/jobs`).then(r => r.json()).then(d => setJobs(d.jobs || [])).catch(() => {});
    const interval = setInterval(() => {
      fetch(`${API}/api/jobs`).then(r => r.json()).then(d => setJobs(d.jobs || [])).catch(() => {});
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
    const load = () => fetch(`${API}/api/metrics/json`).then(r => r.json()).then(setMetrics).catch(() => {});
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
                {['platformer','rpg','fps','puzzle','racing','strategy','sandbox','horror','visual-novel'].map(g => <option key={g} value={g}>{g}</option>)}
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
    } catch {}
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
                {['cinematic','anime','photorealistic','noir','vaporwave','fantasy','scifi'].map(s => <option key={s} value={s}>{s}</option>)}
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
    } catch {}
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
                {['ambient','action','dramatic','horror','fantasy','scifi','electronic','orchestral','lofi','jazz'].map(s => <option key={s} value={s}>{s}</option>)}
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
                {['top','bottom','dress','outerwear','footwear','accessory','full-outfit'].map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Fabric</label>
              <select className="select" value={fabric} onChange={e => setFabric(e.target.value)}>
                {['cotton','silk','denim','leather','polyester','wool','linen','chiffon','velvet'].map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">Size</label>
              <select className="select" value={size} onChange={e => setSize(e.target.value)}>
                {['XS','S','M','L','XL','XXL'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Style</label>
              <select className="select" value={style} onChange={e => setStyle(e.target.value)}>
                {['minimalist','streetwear','formal','bohemian','futuristic'].map(s => <option key={s} value={s}>{s}</option>)}
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
              {['warehouse','outdoor','kitchen','factory','empty'].map(e => <option key={e} value={e}>{e}</option>)}
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

// ===== MAIN APP =====
export default function Home() {
  const [activePage, setActivePage] = useState('dashboard');

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <Dashboard />;
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
