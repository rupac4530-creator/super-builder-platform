'use client';

import React, { useState, useEffect } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/* ── Inline SVG Icon Components (replace emoji with clean SVGs) ── */
const SvgIcon = ({ d, size = 18, color = 'currentColor' }: { d: string; size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
);
const Icons = {
  home: (p?: any) => <SvgIcon d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" {...p} />,
  brain: (p?: any) => <SvgIcon d="M12 2a7 7 0 017 7c0 2.38-1.19 4.47-3 5.74V17a2 2 0 01-2 2h-4a2 2 0 01-2-2v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 017-7zM9 22h6" {...p} />,
  folder: (p?: any) => <SvgIcon d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2v11z" {...p} />,
  bot: (p?: any) => <SvgIcon d="M12 2a2 2 0 012 2v1h4a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2h4V4a2 2 0 012-2zM9 13h0M15 13h0" {...p} />,
  zap: (p?: any) => <SvgIcon d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" {...p} />,
  box: (p?: any) => <SvgIcon d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" {...p} />,
  gamepad: (p?: any) => <SvgIcon d="M6 12h4m-2-2v4m6-1h.01M18 11h.01M17.32 5H6.68a4 4 0 00-3.978 3.59C2.2 12.18 2 16 2 16a3 3 0 006 0l1-2h6l1 2a3 3 0 006 0s-.2-3.82-.7-7.41A4 4 0 0017.32 5z" {...p} />,
  film: (p?: any) => <SvgIcon d="M19.82 2H4.18A2.18 2.18 0 002 4.18v15.64A2.18 2.18 0 004.18 22h15.64A2.18 2.18 0 0022 19.82V4.18A2.18 2.18 0 0019.82 2zM7 2v20M17 2v20M2 12h20M2 7h5M2 17h5M17 17h5M17 7h5" {...p} />,
  music: (p?: any) => <SvgIcon d="M9 18V5l12-2v13M9 18a3 3 0 11-6 0 3 3 0 016 0zM21 16a3 3 0 11-6 0 3 3 0 016 0z" {...p} />,
  cube: (p?: any) => <SvgIcon d="M21 16.5V8l-9-5-9 5v8.5l9 5 9-5zM3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" {...p} />,
  palette: (p?: any) => <SvgIcon d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.93 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.04-.23-.29-.38-.63-.38-1.02 0-.83.67-1.5 1.5-1.5H16c3.04 0 5.5-2.46 5.5-5.5C21.5 5.81 17.21 2 12 2z" {...p} />,
  globe: (p?: any) => <SvgIcon d="M12 2a10 10 0 100 20 10 10 0 000-20zM2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" {...p} />,
  clipboard: (p?: any) => <SvgIcon d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2M9 2h6a1 1 0 011 1v1a1 1 0 01-1 1H9a1 1 0 01-1-1V3a1 1 0 011-1z" {...p} />,
  users: (p?: any) => <SvgIcon d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" {...p} />,
  dna: (p?: any) => <SvgIcon d="M2 15s2-2 6-2 6 4 10 4 6-2 6-2M2 9s2 2 6 2 6-4 10-4 6 2 6 2" {...p} />,
  lightbulb: (p?: any) => <SvgIcon d="M9 18h6M10 22h4M12 2a7 7 0 014.5 12.36V17a1 1 0 01-1 1h-7a1 1 0 01-1-1v-2.64A7 7 0 0112 2z" {...p} />,
  search: (p?: any) => <SvgIcon d="M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.35-4.35" {...p} />,
  link: (p?: any) => <SvgIcon d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" {...p} />,
  cloud: (p?: any) => <SvgIcon d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z" {...p} />,
  flask: (p?: any) => <SvgIcon d="M9 3h6M10 9V3h4v6l5 9.4a1 1 0 01-.9 1.6H5.9a1 1 0 01-.9-1.6L10 9z" {...p} />,
  store: (p?: any) => <SvgIcon d="M3 9l1-4h16l1 4M3 9v11a1 1 0 001 1h16a1 1 0 001-1V9M3 9h18M9 21V13h6v8" {...p} />,
  cart: (p?: any) => <SvgIcon d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6M9 22a1 1 0 100-2 1 1 0 000 2zM20 22a1 1 0 100-2 1 1 0 000 2z" {...p} />,
  barChart: (p?: any) => <SvgIcon d="M12 20V10M18 20V4M6 20v-4" {...p} />,
  bookOpen: (p?: any) => <SvgIcon d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2V3zM22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7V3z" {...p} />,
  plug: (p?: any) => <SvgIcon d="M12 22v-5M7 7V2M17 7V2M5 7h14a2 2 0 012 2v2a7 7 0 01-7 7h-4a7 7 0 01-7-7V9a2 2 0 012-2z" {...p} />,
  settings: (p?: any) => <SvgIcon d="M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06A1.65 1.65 0 0019.4 9c.28.46.73.77 1.24.88H21a2 2 0 010 4h-.09c-.51.11-.96.42-1.24.88z" {...p} />,
  activity: (p?: any) => <SvgIcon d="M22 12h-4l-3 9L9 3l-3 9H2" {...p} />,
  refresh: (p?: any) => <SvgIcon d="M23 4v6h-6M1 20v-6h6M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15" {...p} />,
  monitor: (p?: any) => <SvgIcon d="M2 3h20v14H2V3zM8 21h8M12 17v4" {...p} />,
  satellite: (p?: any) => <SvgIcon d="M13 17l5-5M6 6l5-5M2 22l10-10" {...p} />,
  hammer: (p?: any) => <SvgIcon d="M15 12l-8.5 8.5a2.12 2.12 0 01-3-3L12 9M17.64 4.64a2.12 2.12 0 013 3L15 13" {...p} />,
  save: (p?: any) => <SvgIcon d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2zM17 21v-8H7v8M7 3v5h8" {...p} />,
  shirt: (p?: any) => <SvgIcon d="M20.38 3.46L16 2 12 5 8 2 3.62 3.46a2 2 0 00-.77 2.73L5 10h3v10h8V10h3l2.15-3.81a2 2 0 00-.77-2.73z" {...p} />,
};

// ===== SIDEBAR COMPONENT =====
function Sidebar({ active, onNavigate }: { active: string; onNavigate: (page: string) => void }) {
  const sections = [
    {
      title: 'Platform',
      items: [
        { id: 'dashboard', icon: Icons.home, label: 'Dashboard' },
        { id: 'control-center', icon: Icons.brain, label: 'Control Center', badge: 'NEW' },
        { id: 'projects', icon: Icons.folder, label: 'Projects' },
        { id: 'ai-chat', icon: Icons.bot, label: 'AI Assistant' },
      ]
    },
    {
      title: 'AI / ML',
      items: [
        { id: 'training', icon: Icons.brain, label: 'Training Studio', badge: 'GPU' },
        { id: 'models', icon: Icons.box, label: 'Model Registry' },
        { id: 'inference', icon: Icons.zap, label: 'Inference' },
      ]
    },
    {
      title: 'Creator Studios',
      items: [
        { id: 'game-studio', icon: Icons.gamepad, label: 'Game Studio' },
        { id: 'video-studio', icon: Icons.film, label: 'Video Studio' },
        { id: 'audio-studio', icon: Icons.music, label: 'Audio Studio' },
        { id: '3d-studio', icon: Icons.cube, label: '3D Studio' },
        { id: 'fashion-studio', icon: Icons.shirt, label: 'Fashion Studio' },
        { id: 'design-studio', icon: Icons.palette, label: 'Design Suite' },
        { id: 'robotics-lab', icon: Icons.bot, label: 'Robotics Lab' },
      ]
    },
    {
      title: 'Agents',
      items: [
        { id: 'agents', icon: Icons.globe, label: 'Agent Civilization', badge: '12' },
        { id: 'workbook', icon: Icons.clipboard, label: 'Workbook' },
      ]
    },
    {
      title: 'Agent Hub',
      items: [
        { id: 'agent-hub', icon: Icons.bot, label: 'Agent Hub', badge: 'NEW' },
        { id: 'agent-tasks', icon: Icons.zap, label: 'Task Monitor', badge: 'NEW' },
        { id: 'agent-teams', icon: Icons.users, label: 'Agent Teams', badge: 'NEW' },
        { id: 'evolution', icon: Icons.dna, label: 'Evolution Engine', badge: 'NEW' },
      ]
    },
    {
      title: 'Innovation Labs',
      items: [
        { id: 'knowledge-brain', icon: Icons.globe, label: 'Knowledge Brain', badge: 'NEW' },
        { id: 'ai-memory', icon: Icons.save, label: 'AI Memory', badge: 'NEW' },
        { id: 'idea-lab', icon: Icons.lightbulb, label: 'Idea Lab', badge: 'NEW' },
        { id: 'code-forge', icon: Icons.hammer, label: 'Code Forge', badge: 'NEW' },
        { id: 'data-insights', icon: Icons.barChart, label: 'Data Insights', badge: 'NEW' },
        { id: 'learning-hub', icon: Icons.bookOpen, label: 'Learning Hub', badge: 'NEW' },
        { id: 'trend-radar', icon: Icons.satellite, label: 'Trend Radar', badge: 'NEW' },
        { id: 'collab-space', icon: Icons.users, label: 'Collab Space', badge: 'NEW' },
        { id: 'marketplace', icon: Icons.store, label: 'AI Marketplace', badge: 'NEW' },
        { id: 'self-improve', icon: Icons.refresh, label: 'Self-Improve', badge: 'NEW' },
      ]
    },
    {
      title: 'Next-Level',
      items: [
        { id: 'ai-discovery', icon: Icons.search, label: 'AI Discovery', badge: 'NEW' },
        { id: 'smart-agents', icon: Icons.dna, label: 'Smart Agents', badge: 'NEW' },
        { id: 'workflow-builder', icon: Icons.link, label: 'Workflow Builder', badge: 'NEW' },
        { id: 'deploy-center', icon: Icons.cloud, label: 'Deploy Center', badge: 'NEW' },
        { id: 'cross-intelligence', icon: Icons.flask, label: 'Cross Intelligence', badge: 'NEW' },
        { id: 'ai-testing', icon: Icons.flask, label: 'AI Testing', badge: 'NEW' },
        { id: 'community-hub', icon: Icons.globe, label: 'Community Hub', badge: 'NEW' },
        { id: 'ai-marketplace', icon: Icons.cart, label: 'AI Marketplace', badge: 'NEW' },
        { id: 'live-analytics', icon: Icons.barChart, label: 'Live Analytics', badge: 'NEW' },
        { id: 'ai-docs', icon: Icons.bookOpen, label: 'AI Docs', badge: 'NEW' },
      ]
    },
    {
      title: 'System',
      items: [
        { id: 'integrations', icon: Icons.plug, label: 'Integrations', badge: '32' },
        { id: 'jobs', icon: Icons.settings, label: 'Job Queue' },
        { id: 'metrics', icon: Icons.barChart, label: 'Metrics' },
        { id: 'settings', icon: Icons.settings, label: 'Settings' },
      ]
    }
  ];

  return (
    <nav className="sidebar">
      <div className="sidebar-logo">
        <h1>{Icons.zap()} Engine Alto</h1>
        <div className="version">v0.3.1 — AI-First Creator Platform</div>
      </div>
      {sections.map(section => (
        <div key={section.title} className="sidebar-section">
          <div className="sidebar-section-title">{section.title}</div>
          {section.items.map(item => (
            <button
              key={item.id}
              className={`sidebar-item ${active === item.id ? 'active' : ''}`}
              onClick={() => onNavigate(item.id)}
              aria-label={item.label}
            >
              <span className="icon">{typeof item.icon === 'function' ? item.icon() : item.icon}</span>
              <span>{item.label}</span>
              {(item as any).badge && <span className="sidebar-badge">{(item as any).badge}</span>}
            </button>
          ))}
        </div>
      ))}
      <div style={{ marginTop: 'auto', padding: '12px 20px', borderTop: '1px solid var(--border)' }}>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }}></span>
          System Healthy · GPU Ready
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
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>{Icons.zap({ color: 'var(--accent-primary)' })} Engine Alto Dashboard</h1>
          <p className="page-subtitle">Your AI-first creator platform — build anything, train anything</p>
        </div>
        {/* ── Compact Quick Actions Toolbar ── */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }} aria-label="Train a New Model">
            {Icons.brain({ size: 14 })} Train
          </button>
          <button className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }} aria-label="Create New Project">
            {Icons.folder({ size: 14 })} Project
          </button>
          <button className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }} aria-label="Chat with AI">
            {Icons.bot({ size: 14 })} Chat
          </button>
          <button className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }} aria-label="View Agents">
            {Icons.globe({ size: 14 })} Agents
          </button>
        </div>
      </div>

      {/* ── Consolidated System Summary Card ── */}
      <div className="card animate-fade-in" style={{ marginBottom: 16, padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3 style={{ fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: 6 }}>
            {Icons.activity({ size: 16, color: 'var(--accent-primary)' })} System Summary
          </h3>
          <span className="status status-active"><span className="status-dot"></span> All Systems Online</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          <div style={{ padding: 12, background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6, color: 'var(--accent-primary)' }}>{Icons.brain({ size: 20 })}</div>
            <div style={{ fontWeight: 800, fontSize: '1.4rem', lineHeight: 1 }}>{stats?.training?.completed || 0}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>Models Trained</div>
          </div>
          <div style={{ padding: 12, background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6, color: '#22c55e' }}>{Icons.bot({ size: 20 })}</div>
            <div style={{ fontWeight: 800, fontSize: '1.4rem', lineHeight: 1 }}>{agentStats?.activeAgents || 12}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>Active Agents</div>
          </div>
          <div style={{ padding: 12, background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6, color: '#f59e0b' }}>{Icons.zap({ size: 20 })}</div>
            <div style={{ fontWeight: 800, fontSize: '1.4rem', lineHeight: 1 }}>{stats?.gpu?.utilization || '0%'}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>GPU Utilization</div>
          </div>
          <div style={{ padding: 12, background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6, color: '#3b82f6' }}>{Icons.monitor({ size: 20 })}</div>
            <div style={{ fontWeight: 800, fontSize: '1.4rem', lineHeight: 1 }}>{stats?.uptime ? `${Math.round(stats.uptime / 60)}m` : '—'}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>Uptime</div>
          </div>
        </div>
      </div>

      {/* ── System Status + Capabilities (side by side) ── */}
      <div className="grid grid-2" style={{ marginBottom: 16, gap: 12 }}>
        <div className="card" style={{ padding: 16 }}>
          <div className="card-header" style={{ marginBottom: 10 }}>
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {Icons.monitor({ size: 16 })} System Status
            </h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.82rem' }}>GPU (RTX 4050)</span>
              <span className="status status-active"><span className="status-dot"></span> Ready</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.82rem' }}>GPU Memory</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>{stats?.gpu?.memoryUsed || '0MB'} / 6144MB</span>
            </div>
            <div className="progress-bar" style={{ height: 6 }}>
              <div className="progress-fill" style={{ width: `${parseInt(stats?.gpu?.utilization || '0')}%` }}></div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.82rem' }}>Backend API</span>
              <span className="status status-active"><span className="status-dot"></span> Online</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.82rem' }}>Agent System</span>
              <span className="status status-active"><span className="status-dot"></span> Autonomous</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.82rem' }}>Temperature</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>{stats?.gpu?.temperature || '45°C'}</span>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: 16 }}>
          <div className="card-header" style={{ marginBottom: 10 }}>
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {Icons.box({ size: 16 })} Platform Capabilities
            </h3>
          </div>
          <div className="grid grid-2" style={{ gap: 8 }}>
            {[
              { icon: Icons.brain, title: 'AI Training', desc: 'Train on your GPU' },
              { icon: Icons.gamepad, title: 'Game Engine', desc: 'ECS, physics, rendering' },
              { icon: Icons.globe, title: 'Browser Runtime', desc: 'Web apps + V8' },
              { icon: Icons.bot, title: '12 AI Agents', desc: 'Autonomous agents' },
              { icon: Icons.palette, title: 'Creator Studio', desc: 'Image, video, 3D' },
              { icon: Icons.cloud, title: 'One-Click Deploy', desc: 'Docker, K8s, cloud' },
            ].map(cap => (
              <div key={cap.title} style={{ padding: 10, background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <div style={{ marginBottom: 4, color: 'var(--accent-primary)' }}>{cap.icon({ size: 16 })}</div>
                <div style={{ fontWeight: 700, fontSize: '0.8rem', marginBottom: 1 }}>{cap.title}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{cap.desc}</div>
              </div>
            ))}
          </div>
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
    fetch(`${API}/api/innovation/memory/status`).then(r => r.json()).then(setStats).catch(() => { });
    fetch(`${API}/api/innovation/memory/timeline`).then(r => r.json()).then(setTimeline).catch(() => { });
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
    fetch(`${API}/api/innovation/learning-hub/curiosity`).then(r => r.json()).then(setCuriosities).catch(() => { });
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
    fetch(`${API}/api/innovation/trend-radar/trends`).then(r => r.json()).then(d => setTrends(d.trends || [])).catch(() => { });
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
    fetch(`${API}/api/innovation/marketplace/listings`).then(r => r.json()).then(d => setListings(d.listings || [])).catch(() => { });
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
    fetch(`${API}/api/innovation/self-improve/status`).then(r => r.json()).then(setStatus).catch(() => { });
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
// ===== AI DISCOVERY PAGE =====
function AIDiscoveryPage() {
  const [tools, setTools] = useState<any[]>([]);
  const [sources, setSources] = useState<any[]>([]);
  useEffect(() => {
    fetch(`${API}/api/discovery`).then(r => r.json()).then(d => { setTools(d.tools || []); setSources(d.sources || []); })
      .catch(() => {
        setTools([
          { id: 'd1', name: 'OpenHands', source: 'GitHub', stars: 42000, category: 'AI Agent', description: 'AI software development agent — autonomous coding.', status: 'new', license: 'MIT' },
          { id: 'd2', name: 'Devika', source: 'GitHub', stars: 18000, category: 'AI Agent', description: 'Agentic AI software engineer.', status: 'new', license: 'MIT' },
          { id: 'd3', name: 'Qwen2.5', source: 'HuggingFace', stars: 15000, category: 'LLM', description: 'Alibaba 72B parameter model.', status: 'new', license: 'Apache-2.0' },
          { id: 'd4', name: 'Flux.1', source: 'HuggingFace', stars: 12000, category: 'Image Generation', description: 'Next-gen 12B diffusion transformer.', status: 'new', license: 'Apache-2.0' },
          { id: 'd5', name: 'Suno Bark', source: 'GitHub', stars: 35000, category: 'Audio/TTS', description: 'Text-to-audio — speech, music, effects.', status: 'new', license: 'MIT' },
          { id: 'd6', name: 'Dify', source: 'GitHub', stars: 55000, category: 'LLM Platform', description: 'Open-source LLM app platform.', status: 'new', license: 'Apache-2.0' },
          { id: 'd7', name: 'LobeChat', source: 'GitHub', stars: 50000, category: 'Chat UI', description: 'Open-source ChatGPT UI.', status: 'new', license: 'MIT' },
        ]);
      });
  }, []);
  const handleAutoAdd = (id: string) => { setTools(prev => prev.map(t => t.id === id ? { ...t, status: 'added' } : t)); };
  return (
    <div style={{ padding: 32 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>🔎 AI Discovery Engine</h1>
      <p style={{ color: '#999', fontSize: 14, marginBottom: 24 }}>Auto-scan GitHub, HuggingFace, PapersWithCode for new tools. One-click integrate.</p>
      <button onClick={() => alert('Scan triggered!')} style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: 'rgba(130,130,255,0.2)', color: '#8282ff', fontWeight: 600, cursor: 'pointer', marginBottom: 24 }}>🔄 Scan All Sources</button>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 16 }}>
        {tools.map(t => (
          <div key={t.id} style={{ background: '#16162a', border: '1px solid #2a2a4a', borderRadius: 16, padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div style={{ fontWeight: 600, fontSize: 15, color: '#fff' }}>{t.name}</div>
              <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 10, background: t.status === 'added' ? 'rgba(0,230,118,0.15)' : 'rgba(255,215,64,0.15)', color: t.status === 'added' ? '#00e676' : '#ffd740' }}>{t.status}</span>
            </div>
            <div style={{ fontSize: 11, color: '#666', marginBottom: 8 }}>{t.source} • ⭐ {(t.stars / 1000).toFixed(0)}k • {t.license}</div>
            <p style={{ fontSize: 12, color: '#999', marginBottom: 12 }}>{t.description}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 10, background: 'rgba(130,130,255,0.15)', color: '#8282ff' }}>{t.category}</span>
              {t.status !== 'added' && <button onClick={() => handleAutoAdd(t.id)} style={{ padding: '4px 12px', borderRadius: 6, border: 'none', background: 'rgba(0,230,118,0.2)', color: '#00e676', fontSize: 11, cursor: 'pointer' }}>⬇ Auto-Add</button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ===== SMART AGENTS PAGE =====
function SmartAgentsPage() {
  const [agents, setAgents] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  useEffect(() => {
    fetch(`${API}/api/smart-agents`).then(r => r.json()).then(d => setAgents(d.agents || []))
      .catch(() => setAgents([
        { id: 'sa1', name: 'Content Creator', type: 'generative', status: 'active', learningScore: 87, tasksCompleted: 234, pipelinesCreated: 12, suggestedPipelines: ['Whisper→GPT→Diffusers'] },
        { id: 'sa2', name: 'Code Architect', type: 'development', status: 'active', learningScore: 92, tasksCompleted: 567, pipelinesCreated: 28, suggestedPipelines: ['LangChain→CodeGen→Docker'] },
        { id: 'sa3', name: 'Data Pipeline', type: 'analytics', status: 'learning', learningScore: 74, tasksCompleted: 145, pipelinesCreated: 8, suggestedPipelines: ['Airflow→MLflow→BentoML'] },
        { id: 'sa4', name: 'Research Scout', type: 'discovery', status: 'active', learningScore: 95, tasksCompleted: 890, pipelinesCreated: 45, suggestedPipelines: ['GitHub Scan→License→Adapter'] },
      ]));
    fetch(`${API}/api/smart-agents/suggestions`).then(r => r.json()).then(d => setSuggestions(d.suggestions || []))
      .catch(() => setSuggestions([
        { id: 's1', title: 'AI Content Generator', description: 'Whisper→LLM→Diffusers→TTS', confidence: 94 },
        { id: 's2', title: 'Auto-Deploy ML Model', description: 'Train→MLflow→BentoML→KServe→Monitor', confidence: 91 },
        { id: 's3', title: 'RAG Knowledge Assistant', description: 'LlamaIndex→Milvus→LangChain→Gradio', confidence: 96 },
      ]));
  }, []);
  const statusColor = (s: string) => s === 'active' ? '#00e676' : s === 'learning' ? '#ffd740' : '#666';
  return (
    <div style={{ padding: 32 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>🧬 Self-Optimizing Agents</h1>
      <p style={{ color: '#999', fontSize: 14, marginBottom: 24 }}>AI agents that learn from usage and auto-create optimized pipelines.</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 16, marginBottom: 32 }}>
        {agents.map(a => (
          <div key={a.id} style={{ background: '#16162a', border: '1px solid #2a2a4a', borderRadius: 16, padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontWeight: 600, color: '#fff' }}>{a.name}</span>
              <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 10, background: `${statusColor(a.status)}22`, color: statusColor(a.status) }}>{a.status}</span>
            </div>
            <div style={{ fontSize: 12, color: '#999', marginBottom: 8 }}>Score: <span style={{ color: '#8282ff', fontWeight: 700 }}>{a.learningScore}%</span> • {a.tasksCompleted} tasks • {a.pipelinesCreated} pipelines</div>
            <div style={{ background: '#1a1a2e', borderRadius: 8, height: 6, marginBottom: 8 }}><div style={{ width: `${a.learningScore}%`, height: '100%', borderRadius: 8, background: 'linear-gradient(90deg,#8282ff,#00e676)' }} /></div>
            {a.suggestedPipelines?.map((p: string, i: number) => <div key={i} style={{ fontSize: 10, color: '#666', marginTop: 4 }}>💡 {p}</div>)}
          </div>
        ))}
      </div>
      <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: '#fff' }}>🎯 AI-Suggested Pipelines</h2>
      {suggestions.map(s => (
        <div key={s.id} style={{ background: '#16162a', border: '1px solid #2a2a4a', borderRadius: 12, padding: 16, marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div><div style={{ fontWeight: 600, color: '#fff' }}>{s.title}</div><div style={{ fontSize: 12, color: '#999' }}>{s.description}</div></div>
          <div style={{ textAlign: 'center' as const }}><div style={{ fontSize: 20, fontWeight: 700, color: '#00e676' }}>{s.confidence}%</div><div style={{ fontSize: 10, color: '#666' }}>confidence</div></div>
        </div>
      ))}
    </div>
  );
}

// ===== WORKFLOW BUILDER PAGE =====
function WorkflowBuilderPage() {
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  useEffect(() => {
    fetch(`${API}/api/workflows`).then(r => r.json()).then(d => setWorkflows(d.workflows || [])).catch(() => setWorkflows([{ id: 'wf1', name: 'AI Content Pipeline', description: 'Audio→Transcribe→Summarize→Image→Narrate', status: 'completed', runCount: 15, nodes: [{}, {}, {}, {}, {}] }]));
    fetch(`${API}/api/workflows/templates`).then(r => r.json()).then(d => setTemplates(d.templates || [])).catch(() => setTemplates([
      { id: 't1', name: 'RAG Knowledge Assistant', description: 'Index→Vector DB→Query→Response', nodes: 4, category: 'AI Agent' },
      { id: 't2', name: 'Image Generation Studio', description: 'Prompt→SDXL→ControlNet→Upscale', nodes: 5, category: 'Creative' },
      { id: 't3', name: 'Model Training Pipeline', description: 'Data→Preprocess→Train→Evaluate→Deploy', nodes: 5, category: 'MLOps' },
      { id: 't4', name: 'Multi-Agent Debate', description: 'Topic→AgentA→AgentB→Judge→Summary', nodes: 5, category: 'AI Agent' },
      { id: 't5', name: 'Photo to 3D Game Asset', description: 'Photos→NeRF→Mesh→Texture→Godot', nodes: 5, category: '3D' },
    ]));
  }, []);
  const statusColor = (s: string) => s === 'completed' ? '#00e676' : s === 'running' ? '#ffd740' : '#666';
  return (
    <div style={{ padding: 32 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>🔗 Visual Workflow Builder</h1>
      <p style={{ color: '#999', fontSize: 14, marginBottom: 24 }}>Drag-and-drop no-code AI pipeline builder. Connect tools to create powerful workflows.</p>
      <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: '#fff' }}>📋 Your Workflows</h2>
      {workflows.map(wf => (
        <div key={wf.id} style={{ background: '#16162a', border: '1px solid #2a2a4a', borderRadius: 12, padding: 16, marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div><div style={{ fontWeight: 600, color: '#fff' }}>{wf.name}</div><div style={{ fontSize: 12, color: '#999' }}>{wf.description} • {wf.nodes?.length || 0} nodes</div></div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 10, background: `${statusColor(wf.status)}22`, color: statusColor(wf.status) }}>{wf.status}</span>
            <span style={{ fontSize: 11, color: '#666' }}>Runs: {wf.runCount}</span>
          </div>
        </div>
      ))}
      <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, marginTop: 32, color: '#fff' }}>📦 Templates</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(250px,1fr))', gap: 12 }}>
        {templates.map(t => (
          <div key={t.id} style={{ background: '#16162a', border: '1px solid #2a2a4a', borderRadius: 12, padding: 16, cursor: 'pointer' }}>
            <div style={{ fontWeight: 600, color: '#fff', marginBottom: 4 }}>{t.name}</div>
            <div style={{ fontSize: 12, color: '#999', marginBottom: 8 }}>{t.description}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 10, background: 'rgba(130,130,255,0.15)', color: '#8282ff' }}>{t.category}</span><span style={{ fontSize: 11, color: '#666' }}>{t.nodes} nodes</span></div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ===== DEPLOY CENTER PAGE =====
function DeployCenterPage() {
  const [deployments, setDeployments] = useState<any[]>([]);
  const [targets, setTargets] = useState<any[]>([]);
  useEffect(() => {
    fetch(`${API}/api/deployments`).then(r => r.json()).then(d => setDeployments(d.deployments || [])).catch(() => setDeployments([
      { id: 'd1', name: 'RAG Agent (Prod)', target: 'cloud', provider: 'AWS', status: 'running', region: 'us-east-1', replicas: 3, gpu: false, cost: '$45/mo', url: 'https://rag.superbuilder.app', pipeline: 'LlamaIndex+Milvus' },
      { id: 'd2', name: 'Image Gen API', target: 'cloud', provider: 'GCP', status: 'running', region: 'us-central1', replicas: 2, gpu: true, cost: '$120/mo', url: 'https://img.superbuilder.app', pipeline: 'Diffusers+SDXL' },
      { id: 'd3', name: 'Edge LLM (Local)', target: 'edge', provider: 'RTX 4050', status: 'running', region: 'local', replicas: 1, gpu: true, cost: '$0', url: 'http://localhost:8080', pipeline: 'llama.cpp+Phi-3' },
    ]));
    fetch(`${API}/api/deployments/targets`).then(r => r.json()).then(d => setTargets(d.targets || [])).catch(() => setTargets([
      { id: 'aws', name: 'AWS', icon: '☁️' }, { id: 'gcp', name: 'GCP', icon: '🌐' }, { id: 'azure', name: 'Azure', icon: '🔷' }, { id: 'local', name: 'Local', icon: '💻' }, { id: 'edge', name: 'Edge', icon: '📱' }, { id: 'docker', name: 'Docker', icon: '🐳' }, { id: 'k8s', name: 'Kubernetes', icon: '☸️' },
    ]));
  }, []);
  const statusColor = (s: string) => s === 'running' ? '#00e676' : s === 'deploying' ? '#ffd740' : '#ff5252';
  return (
    <div style={{ padding: 32 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>☁️ Deploy Center</h1>
      <p style={{ color: '#999', fontSize: 14, marginBottom: 16 }}>Deploy to any cloud, edge device, or local machine with one click.</p>
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' as const }}>
        {targets.map(t => <div key={t.id} style={{ padding: '8px 16px', borderRadius: 12, background: '#16162a', border: '1px solid #2a2a4a', fontSize: 13 }}>{t.icon} {t.name}</div>)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: 16 }}>
        {deployments.map(d => (
          <div key={d.id} style={{ background: '#16162a', border: '1px solid #2a2a4a', borderRadius: 16, padding: 20, position: 'relative' as const }}>
            <div style={{ position: 'absolute' as const, top: 16, right: 16, width: 10, height: 10, borderRadius: '50%', background: statusColor(d.status), boxShadow: `0 0 8px ${statusColor(d.status)}` }} />
            <div style={{ fontWeight: 600, fontSize: 15, color: '#fff', marginBottom: 4 }}>{d.name}</div>
            <div style={{ fontSize: 11, color: '#666', marginBottom: 8 }}>{d.provider} • {d.region} • {d.replicas} replica(s)</div>
            <div style={{ fontSize: 12, color: '#999', marginBottom: 8 }}>{d.pipeline}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: d.cost === '$0' ? '#00e676' : '#ffd740', fontWeight: 600 }}>{d.cost}</span>
              {d.url && <a href={d.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: '#8282ff', textDecoration: 'none' }}>Open ↗</a>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ===== CROSS INTELLIGENCE PAGE =====
function CrossIntelligencePage() {
  const [fusions, setFusions] = useState<any[]>([]);
  useEffect(() => {
    fetch(`${API}/api/cross-intelligence/fusions`).then(r => r.json()).then(d => setFusions(d.fusions || [])).catch(() => setFusions([
      { id: 'f1', name: 'AI Game Generator', toolA: 'LangChain', toolB: 'Godot', description: 'LLM generates game scripts → Godot compiles & runs.', noveltyScore: 95, status: 'prototype', category: 'Gaming × AI' },
      { id: 'f2', name: 'Voice-to-3D Scene', toolA: 'Whisper', toolB: 'Nerfstudio', description: 'Describe a scene → see it in 3D.', noveltyScore: 92, status: 'concept', category: 'Voice × 3D' },
      { id: 'f3', name: 'Self-Healing Code', toolA: 'AutoGen', toolB: 'Prometheus', description: 'Detect bug → agents fix → auto-deploy.', noveltyScore: 98, status: 'prototype', category: 'DevOps × AI' },
      { id: 'f4', name: 'Photo Story Gen', toolA: 'Diffusers', toolB: 'Coqui TTS', description: 'Photos narrated as audio stories.', noveltyScore: 87, status: 'production', category: 'Media × AI' },
      { id: 'f5', name: 'Robot Training Sim', toolA: 'ROS 2', toolB: 'Ray', description: 'Parallel robot RL training at scale.', noveltyScore: 93, status: 'concept', category: 'Robotics × ML' },
      { id: 'f6', name: 'Knowledge-Powered Art', toolA: 'Milvus', toolB: 'ComfyUI', description: 'Art from knowledge base context.', noveltyScore: 89, status: 'concept', category: 'Knowledge × Creative' },
    ]));
  }, []);
  const statusColor = (s: string) => s === 'production' ? '#00e676' : s === 'prototype' ? '#ffd740' : '#8282ff';
  return (
    <div style={{ padding: 32 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>🧪 Cross-Integration Intelligence</h1>
      <p style={{ color: '#999', fontSize: 14, marginBottom: 24 }}>Cross-pollinate tools to discover novel AI fusions — like mixing fruits to create something new.</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: 16 }}>
        {fusions.map(f => (
          <div key={f.id} style={{ background: '#16162a', border: '1px solid #2a2a4a', borderRadius: 16, padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontWeight: 600, color: '#fff' }}>{f.name}</span>
              <span style={{ fontSize: 20, fontWeight: 700, color: '#00e676' }}>{f.noveltyScore}%</span>
            </div>
            <div style={{ fontSize: 12, color: '#8282ff', marginBottom: 8 }}>🔀 {f.toolA} + {f.toolB}</div>
            <p style={{ fontSize: 12, color: '#999', marginBottom: 12 }}>{f.description}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 10, background: 'rgba(130,130,255,0.15)', color: '#8282ff' }}>{f.category}</span>
              <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 10, background: `${statusColor(f.status)}22`, color: statusColor(f.status) }}>{f.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ===== AI TESTING PAGE =====
function AITestingPage() {
  const [data, setData] = useState<any>({ suites: [], healthChecks: [] });
  useEffect(() => {
    fetch(`${API}/api/testing`).then(r => r.json()).then(d => setData(d)).catch(() => setData({
      totalSuites: 8, totalTests: 189, totalPassed: 180, avgCoverage: 93,
      suites: [
        { id: 'ts1', name: 'Integration Adapters', tests: 31, passed: 29, failed: 1, duration: '4.2s', status: 'passing', coverage: 94 },
        { id: 'ts2', name: 'API Endpoints', tests: 48, passed: 48, failed: 0, duration: '2.8s', status: 'passing', coverage: 100 },
        { id: 'ts3', name: 'Workflow Engine', tests: 22, passed: 20, failed: 2, duration: '6.1s', status: 'failing', coverage: 88 },
        { id: 'ts4', name: 'Model Serving', tests: 15, passed: 14, failed: 0, duration: '12.3s', status: 'passing', coverage: 93 },
        { id: 'ts5', name: 'Security & Auth', tests: 12, passed: 12, failed: 0, duration: '1.5s', status: 'passing', coverage: 100 },
        { id: 'ts6', name: 'UI Components', tests: 35, passed: 34, failed: 0, duration: '3.4s', status: 'passing', coverage: 97 },
      ],
      healthChecks: [
        { service: 'Backend API', status: 'healthy', latency: '12ms', uptime: '99.99%' },
        { service: 'Database', status: 'healthy', latency: '3ms', uptime: '99.98%' },
        { service: 'Redis Cache', status: 'healthy', latency: '1ms', uptime: '100%' },
        { service: 'AI Inference', status: 'healthy', latency: '145ms', uptime: '99.95%' },
      ]
    }));
  }, []);
  const sColor = (s: string) => s === 'passing' ? '#00e676' : s === 'healthy' ? '#00e676' : '#ff5252';
  return (
    <div style={{ padding: 32 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>🧪 AI Testing & Reliability</h1>
      <p style={{ color: '#999', fontSize: 14, marginBottom: 16 }}>Automated testing, health monitoring, and reliability for all pipelines.</p>
      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        <div style={{ background: 'rgba(0,230,118,0.1)', border: '1px solid rgba(0,230,118,0.3)', borderRadius: 12, padding: '12px 20px', textAlign: 'center' as const }}><div style={{ fontSize: 24, fontWeight: 700, color: '#00e676' }}>{data.totalPassed || 0}</div><div style={{ fontSize: 11, color: '#999' }}>Passed</div></div>
        <div style={{ background: 'rgba(130,130,255,0.1)', border: '1px solid rgba(130,130,255,0.3)', borderRadius: 12, padding: '12px 20px', textAlign: 'center' as const }}><div style={{ fontSize: 24, fontWeight: 700, color: '#8282ff' }}>{data.totalTests || 0}</div><div style={{ fontSize: 11, color: '#999' }}>Total Tests</div></div>
        <div style={{ background: 'rgba(255,215,64,0.1)', border: '1px solid rgba(255,215,64,0.3)', borderRadius: 12, padding: '12px 20px', textAlign: 'center' as const }}><div style={{ fontSize: 24, fontWeight: 700, color: '#ffd740' }}>{data.avgCoverage || 0}%</div><div style={{ fontSize: 11, color: '#999' }}>Coverage</div></div>
      </div>
      <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, color: '#fff' }}>Test Suites</h2>
      {(data.suites || []).map((s: any) => (
        <div key={s.id} style={{ background: '#16162a', border: '1px solid #2a2a4a', borderRadius: 12, padding: 14, marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div><span style={{ fontWeight: 600, color: '#fff' }}>{s.name}</span><span style={{ fontSize: 11, color: '#666', marginLeft: 8 }}>{s.tests} tests • {s.duration}</span></div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{ background: '#1a1a2e', borderRadius: 8, height: 6, width: 80 }}><div style={{ width: `${s.coverage}%`, height: '100%', borderRadius: 8, background: sColor(s.status) }} /></div>
            <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 10, background: `${sColor(s.status)}22`, color: sColor(s.status) }}>{s.status}</span>
          </div>
        </div>
      ))}
      <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, marginTop: 24, color: '#fff' }}>Health Checks</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 8 }}>
        {(data.healthChecks || []).map((h: any, i: number) => (
          <div key={i} style={{ background: '#16162a', border: '1px solid #2a2a4a', borderRadius: 12, padding: 14 }}>
            <div style={{ fontWeight: 600, color: '#fff', fontSize: 13, marginBottom: 4 }}>{h.service}</div>
            <div style={{ fontSize: 11, color: sColor(h.status) }}>{h.status} • {h.latency} • {h.uptime}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ===== COMMUNITY HUB PAGE =====
function CommunityHubPage() {
  const [contributors, setContributors] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  useEffect(() => {
    fetch(`${API}/api/community/contributors`).then(r => r.json()).then(d => setContributors(d.contributors || [])).catch(() => setContributors([
      { id: 'c1', name: 'AlexDev', avatar: '👨‍💻', contributions: 47, rank: 1, badges: ['🏆 Top', '🔧 Core'] },
      { id: 'c2', name: 'SarahAI', avatar: '👩‍🔬', contributions: 38, rank: 2, badges: ['🤖 Pioneer'] },
      { id: 'c3', name: 'RoboKid', avatar: '🤖', contributions: 29, rank: 3, badges: ['🦾 Robotics'] },
    ]));
    fetch(`${API}/api/community/submissions`).then(r => r.json()).then(d => setSubmissions(d.submissions || [])).catch(() => setSubmissions([
      { id: 's1', title: 'Gemini Pro Adapter', type: 'adapter', author: 'AlexDev', votes: 234, status: 'featured', downloadCount: 1560 },
      { id: 's2', title: 'Claude Agent Template', type: 'template', author: 'SarahAI', votes: 189, status: 'approved', downloadCount: 890 },
      { id: 's3', title: 'Drone Sim Plugin', type: 'plugin', author: 'RoboKid', votes: 145, status: 'approved', downloadCount: 340 },
    ]));
  }, []);
  return (
    <div style={{ padding: 32 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>🌍 Community Hub</h1>
      <p style={{ color: '#999', fontSize: 14, marginBottom: 24 }}>Contributors submit adapters, agents, templates — ranked and auto-integrated.</p>
      <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12, color: '#fff' }}>🏆 Top Contributors</h2>
      <div style={{ display: 'flex', gap: 16, marginBottom: 32, flexWrap: 'wrap' as const }}>
        {contributors.map(c => (
          <div key={c.id} style={{ background: '#16162a', border: '1px solid #2a2a4a', borderRadius: 16, padding: 20, minWidth: 180, textAlign: 'center' as const }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>{c.avatar}</div>
            <div style={{ fontWeight: 600, color: '#fff' }}>{c.name}</div>
            <div style={{ fontSize: 12, color: '#8282ff' }}>{c.contributions} contributions</div>
            <div style={{ marginTop: 4 }}>{c.badges?.map((b: string, i: number) => <span key={i} style={{ fontSize: 10, marginRight: 4 }}>{b}</span>)}</div>
          </div>
        ))}
      </div>
      <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12, color: '#fff' }}>📦 Community Submissions</h2>
      {submissions.map(s => (
        <div key={s.id} style={{ background: '#16162a', border: '1px solid #2a2a4a', borderRadius: 12, padding: 14, marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div><span style={{ fontWeight: 600, color: '#fff' }}>{s.title}</span><span style={{ fontSize: 11, color: '#666', marginLeft: 8 }}>by {s.author} • {s.type}</span></div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}><span style={{ color: '#ffd740' }}>👍 {s.votes}</span><span style={{ color: '#999' }}>⬇ {s.downloadCount}</span>
            <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 10, background: s.status === 'featured' ? 'rgba(0,230,118,0.15)' : 'rgba(130,130,255,0.15)', color: s.status === 'featured' ? '#00e676' : '#8282ff' }}>{s.status}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ===== AI MARKETPLACE PAGE =====
function AIMarketplacePage() {
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => {
    fetch(`${API}/api/marketplace`).then(r => r.json()).then(d => setItems(d.items || [])).catch(() => setItems([
      { id: 'm1', name: 'Ultimate RAG Pipeline', type: 'pipeline', author: 'SuperBuilder Team', price: 'Free', rating: 4.9, downloads: 5600, category: 'AI', featured: true },
      { id: 'm2', name: 'SDXL Art Studio Pro', type: 'pipeline', author: 'PixelArtist', price: 'Free', rating: 4.8, downloads: 3400, category: 'Creative', featured: true },
      { id: 'm3', name: 'Multi-Agent Dev Team', type: 'agent-template', author: 'AlexDev', price: '$9.99', rating: 4.7, downloads: 2100, category: 'Development', featured: true },
      { id: 'm4', name: 'Voice Assistant Kit', type: 'pipeline', author: 'SarahAI', price: 'Free', rating: 4.6, downloads: 1800, category: 'Audio', featured: false },
      { id: 'm5', name: 'Cyberpunk Dark Theme', type: 'theme', author: 'PixelArtist', price: 'Free', rating: 4.9, downloads: 8900, category: 'UI', featured: true },
      { id: 'm6', name: 'LLM Fine-Tuning Template', type: 'model', author: 'SuperBuilder Team', price: 'Free', rating: 4.8, downloads: 3200, category: 'ML', featured: true },
    ]));
  }, []);
  return (
    <div style={{ padding: 32 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>🛒 AI Marketplace</h1>
      <p style={{ color: '#999', fontSize: 14, marginBottom: 24 }}>Discover, install, and publish pipelines, models, datasets, themes, and agent templates.</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 16 }}>
        {items.map(item => (
          <div key={item.id} style={{ background: '#16162a', border: item.featured ? '1px solid rgba(130,130,255,0.4)' : '1px solid #2a2a4a', borderRadius: 16, padding: 20, position: 'relative' as const }}>
            {item.featured && <div style={{ position: 'absolute' as const, top: 12, right: 12, fontSize: 10, padding: '2px 8px', borderRadius: 10, background: 'rgba(255,215,64,0.15)', color: '#ffd740' }}>⭐ Featured</div>}
            <div style={{ fontWeight: 600, fontSize: 15, color: '#fff', marginBottom: 4 }}>{item.name}</div>
            <div style={{ fontSize: 11, color: '#666', marginBottom: 8 }}>by {item.author} • {item.type}</div>
            <div style={{ display: 'flex', gap: 12, marginBottom: 12, alignItems: 'center' }}>
              <span style={{ color: '#ffd740' }}>★ {item.rating}</span>
              <span style={{ color: '#999', fontSize: 12 }}>⬇ {(item.downloads / 1000).toFixed(1)}k</span>
              <span style={{ color: item.price === 'Free' ? '#00e676' : '#8282ff', fontWeight: 600 }}>{item.price}</span>
            </div>
            <button style={{ width: '100%', padding: '8px 0', borderRadius: 8, border: 'none', background: 'rgba(130,130,255,0.2)', color: '#8282ff', fontWeight: 600, cursor: 'pointer' }}>Install</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ===== LIVE ANALYTICS PAGE =====
function LiveAnalyticsPage() {
  const [data, setData] = useState<any>(null);
  useEffect(() => {
    const load = () => fetch(`${API}/api/analytics/realtime`).then(r => r.json()).then(d => setData(d)).catch(() => setData({
      cpu: { usage: 45, cores: 8, temp: 62 }, memory: { used: 10, total: 16, percentage: 62 }, gpu: { usage: 68, vram: { used: 4.2, total: 6 }, temp: 72, power: 110 },
      network: { inbound: 350, outbound: 180, activeConnections: 35 }, pipelines: { active: 5, queued: 3, completed: 245, failed: 2 }
    }));
    load(); const iv = setInterval(load, 5000); return () => clearInterval(iv);
  }, []);
  if (!data) return <div style={{ padding: 32, color: '#666' }}>Loading analytics...</div>;
  return (
    <div style={{ padding: 32 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>📈 Live Analytics</h1>
      <p style={{ color: '#999', fontSize: 14, marginBottom: 24 }}>Real-time platform metrics — CPU, GPU, memory, network, and pipeline health.</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'CPU Usage', value: `${data.cpu.usage}%`, sub: `${data.cpu.cores} cores • ${data.cpu.temp}°C`, color: '#8282ff' },
          { label: 'Memory', value: `${data.memory.used}/${data.memory.total} GB`, sub: `${data.memory.percentage}% used`, color: '#ffd740' },
          { label: 'GPU Usage', value: `${data.gpu.usage}%`, sub: `${data.gpu.vram.used}/${data.gpu.vram.total} GB VRAM • ${data.gpu.temp}°C`, color: '#00e676' },
          { label: 'Network In', value: `${data.network.inbound} MB/s`, sub: `${data.network.activeConnections} connections`, color: '#ff9800' },
          { label: 'Active Pipelines', value: data.pipelines.active, sub: `${data.pipelines.queued} queued • ${data.pipelines.completed} done`, color: '#e040fb' },
          { label: 'GPU Power', value: `${data.gpu.power}W`, sub: `RTX 4050`, color: '#00bcd4' },
        ].map((m, i) => (
          <div key={i} style={{ background: '#16162a', border: '1px solid #2a2a4a', borderRadius: 16, padding: 20 }}>
            <div style={{ fontSize: 11, color: '#666', marginBottom: 4 }}>{m.label}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: m.color }}>{m.value}</div>
            <div style={{ fontSize: 11, color: '#999' }}>{m.sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ===== AI DOCS PAGE =====
function AIDocsPage() {
  const [docs, setDocs] = useState<any[]>([]);
  useEffect(() => {
    fetch(`${API}/api/docs-ai`).then(r => r.json()).then(d => setDocs(d.docs || [])).catch(() => setDocs([
      { id: 'd1', title: 'Getting Started with SuperBuilder', type: 'guide', category: 'Platform', readTime: '5 min', difficulty: 'beginner' },
      { id: 'd2', title: 'Building Your First AI Agent', type: 'tutorial', category: 'AI Agents', readTime: '12 min', difficulty: 'intermediate' },
      { id: 'd3', title: 'Integration Adapter Development', type: 'reference', category: 'Development', readTime: '8 min', difficulty: 'advanced' },
      { id: 'd4', title: 'Visual Workflow Builder Tutorial', type: 'tutorial', category: 'Workflows', readTime: '7 min', difficulty: 'beginner' },
      { id: 'd5', title: 'Multi-Cloud Deployment Guide', type: 'guide', category: 'Deployment', readTime: '10 min', difficulty: 'intermediate' },
      { id: 'd6', title: 'Cross-Integration Fusion Examples', type: 'example', category: 'Innovation', readTime: '6 min', difficulty: 'intermediate' },
    ]));
  }, []);
  const typeIcon = (t: string) => t === 'guide' ? '📘' : t === 'tutorial' ? '🎓' : t === 'reference' ? '📋' : '💡';
  const diffColor = (d: string) => d === 'beginner' ? '#00e676' : d === 'intermediate' ? '#ffd740' : '#ff5252';
  return (
    <div style={{ padding: 32 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>📖 AI Documentation</h1>
      <p style={{ color: '#999', fontSize: 14, marginBottom: 24 }}>Auto-generated docs, tutorials, and guides — powered by AI from your code and usage.</p>
      <button onClick={() => alert('Generating new docs...')} style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: 'rgba(130,130,255,0.2)', color: '#8282ff', fontWeight: 600, cursor: 'pointer', marginBottom: 24 }}>✨ Generate New Doc</button>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 16 }}>
        {docs.map(d => (
          <div key={d.id} style={{ background: '#16162a', border: '1px solid #2a2a4a', borderRadius: 16, padding: 20, cursor: 'pointer' }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>{typeIcon(d.type)}</div>
            <div style={{ fontWeight: 600, color: '#fff', marginBottom: 4 }}>{d.title}</div>
            <div style={{ fontSize: 11, color: '#666', marginBottom: 8 }}>{d.category} • {d.readTime}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 10, background: 'rgba(130,130,255,0.15)', color: '#8282ff' }}>{d.type}</span>
              <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 10, background: `${diffColor(d.difficulty)}22`, color: diffColor(d.difficulty) }}>{d.difficulty}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ===== INTEGRATIONS PAGE =====
function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/api/integrations`)
      .then(r => r.json())
      .then(data => { setIntegrations(data.integrations || []); setCategories(['All', ...(data.categories || [])]); setLoading(false); })
      .catch(() => {
        // Fallback data if backend isn't running
        const fallbackIntegrations = [
          { name: 'LangChain', category: 'Agent Orchestration', license: 'MIT', description: 'LLM orchestration — chains, agents, tools, and memory for AI workflows.', homepage: 'https://langchain.com', repository: 'https://github.com/langchain-ai/langchain', requiresGPU: false, status: 'not-installed', enabled: false, version: '0.1.x' },
          { name: 'LlamaIndex', category: 'Agent Orchestration', license: 'MIT', description: 'RAG framework — data connectors, indexing, query layers for long-term memory.', homepage: 'https://llamaindex.ai', repository: 'https://github.com/run-llama/llama_index', requiresGPU: false, status: 'not-installed', enabled: false, version: '0.10.x' },
          { name: 'AutoGen', category: 'Agent Orchestration', license: 'MIT', description: 'Microsoft multi-agent conversation framework for complex LLM workflows.', homepage: 'https://microsoft.github.io/autogen/', requiresGPU: false, status: 'not-installed', enabled: false, version: '0.2.x' },
          { name: 'MetaGPT', category: 'Agent Orchestration', license: 'MIT', description: 'Multi-agent framework — assign roles (PM, architect, engineer) for collaboration.', requiresGPU: false, status: 'not-installed', enabled: false, version: '0.8.x' },
          { name: 'BabyAGI', category: 'Agent Orchestration', license: 'MIT', description: 'Minimal autonomous agent — task creation, prioritization, and execution loop.', requiresGPU: false, status: 'not-installed', enabled: false, version: '1.0.0' },
          { name: 'SuperAGI', category: 'Agent Orchestration', license: 'MIT', description: 'Dev-first autonomous agent framework with tools, memory, and concurrent agents.', requiresGPU: false, status: 'not-installed', enabled: false, version: '0.1.x' },
          { name: 'FAISS', category: 'Vector DB', license: 'MIT', description: 'Facebook AI Similarity Search — fast nearest-neighbor for embeddings.', requiresGPU: false, status: 'not-installed', enabled: false, version: '1.7.x' },
          { name: 'Milvus', category: 'Vector DB', license: 'Apache-2.0', description: 'Scalable vector database for production RAG & similarity search.', requiresGPU: false, status: 'not-installed', enabled: false, version: '2.3.x' },
          { name: 'Weaviate', category: 'Vector DB', license: 'BSD-3', description: 'AI-native vector database with vectorization modules & semantic search.', requiresGPU: false, status: 'not-installed', enabled: false, version: '1.23.x' },
          { name: 'Chroma', category: 'Vector DB', license: 'Apache-2.0', description: 'Developer-friendly open-source embedding database for AI apps.', requiresGPU: false, status: 'not-installed', enabled: false, version: '0.4.x' },
          { name: 'ONNX Runtime', category: 'Model Runtime', license: 'MIT', description: 'Cross-platform inference engine for ONNX models.', requiresGPU: false, status: 'not-installed', enabled: false, version: '1.17.x' },
          { name: 'vLLM', category: 'Model Runtime', license: 'Apache-2.0', description: 'High-throughput LLM serving with PagedAttention — fast GPU inference.', requiresGPU: true, status: 'not-installed', enabled: false, version: '0.3.x' },
          { name: 'NVIDIA Triton', category: 'Model Runtime', license: 'BSD-3', description: 'High-performance inference serving for TensorRT, PyTorch, ONNX.', requiresGPU: true, status: 'not-installed', enabled: false, version: '24.01' },
          { name: 'BentoML', category: 'Model Runtime', license: 'Apache-2.0', description: 'Unified model serving — package ML models as production API endpoints.', requiresGPU: false, status: 'not-installed', enabled: false, version: '1.2.x' },
          { name: 'llama.cpp', category: 'Model Runtime', license: 'MIT', description: 'Lightweight C/C++ LLM inference — run models on CPU with GGUF format.', requiresGPU: false, status: 'not-installed', enabled: false, version: 'latest' },
          { name: 'Diffusers (Stable Diffusion)', category: 'Generative Media', license: 'Apache-2.0', description: 'Hugging Face diffusion models — SDXL, ControlNet, image generation.', requiresGPU: true, status: 'not-installed', enabled: false, version: '0.27.x' },
          { name: 'ComfyUI', category: 'Generative Media', license: 'GPL-3.0', description: 'Node-based visual workflow for Stable Diffusion pipelines.', requiresGPU: true, status: 'not-installed', enabled: false, version: 'latest' },
          { name: 'Whisper', category: 'Generative Media', license: 'MIT', description: 'OpenAI speech-to-text — transcription and translation in 99 languages.', requiresGPU: false, status: 'not-installed', enabled: false, version: 'v3' },
          { name: 'Coqui TTS', category: 'Generative Media', license: 'MPL-2.0', description: 'Open-source text-to-speech — multi-speaker, voice cloning.', requiresGPU: false, status: 'not-installed', enabled: false, version: '0.22.x' },
          { name: 'Blender', category: '3D / NeRF', license: 'GPL-3.0', description: '3D creation suite — headless rendering, modeling, automation via Python.', requiresGPU: true, status: 'not-installed', enabled: false, version: '4.0' },
          { name: 'instant-ngp', category: '3D / NeRF', license: 'NVIDIA', description: 'Instant Neural Radiance Fields — fast 3D reconstruction from photos.', requiresGPU: true, status: 'not-installed', enabled: false, version: 'latest' },
          { name: 'Nerfstudio', category: '3D / NeRF', license: 'Apache-2.0', description: 'End-to-end NeRF framework — train, visualize, and export 3D scenes.', requiresGPU: true, status: 'not-installed', enabled: false, version: '1.0.x' },
          { name: 'Godot Engine', category: 'Game Engine', license: 'MIT', description: 'Open game engine — 2D/3D, GDScript/C#, export to all platforms.', requiresGPU: true, status: 'not-installed', enabled: false, version: '4.2' },
          { name: 'MLflow', category: 'MLOps', license: 'Apache-2.0', description: 'MLOps platform — experiment tracking, model registry, deployment.', requiresGPU: false, status: 'not-installed', enabled: false, version: '2.10.x' },
          { name: 'Apache Airflow', category: 'MLOps', license: 'Apache-2.0', description: 'Workflow orchestration — DAGs for ML pipelines and scheduling.', requiresGPU: false, status: 'not-installed', enabled: false, version: '2.8.x' },
          { name: 'KServe', category: 'Serving', license: 'Apache-2.0', description: 'Kubernetes-native model serving — standardized inference protocol.', requiresGPU: false, status: 'not-installed', enabled: false, version: '0.12.x' },
          { name: 'Ray', category: 'Serving', license: 'Apache-2.0', description: 'Distributed compute engine — Ray Serve, Ray Train, cluster computing.', requiresGPU: false, status: 'not-installed', enabled: false, version: '2.9.x' },
          { name: 'Prometheus + Grafana', category: 'Observability', license: 'Apache-2.0', description: 'Monitoring stack — metrics collection, alerting, and dashboards.', requiresGPU: false, status: 'not-installed', enabled: false, version: '2.49 / 10.x' },
          { name: 'ROS 2', category: 'Robotics', license: 'Apache-2.0', description: 'Robot Operating System — middleware and libraries for robotic apps.', requiresGPU: false, status: 'not-installed', enabled: false, version: 'Humble' },
          { name: 'CARLA Simulator', category: 'Robotics', license: 'MIT', description: 'Autonomous driving simulator — high-fidelity urban environments.', requiresGPU: true, status: 'not-installed', enabled: false, version: '0.9.15' },
          { name: 'Gazebo', category: 'Robotics', license: 'Apache-2.0', description: '3D robot simulation — physics, sensors, and environments.', requiresGPU: true, status: 'not-installed', enabled: false, version: 'Harmonic' },
        ];
        const cats = ['All', ...Array.from(new Set(fallbackIntegrations.map(i => i.category)))];
        setIntegrations(fallbackIntegrations);
        setCategories(cats);
        setLoading(false);
      });
  }, []);

  const handleToggle = async (name: string, currentStatus: string) => {
    const action = currentStatus === 'running' ? 'stop' : currentStatus === 'installed' ? 'start' : 'install';
    try {
      await fetch(`${API}/api/integrations/${encodeURIComponent(name)}/${action}`, { method: 'POST' });
      setIntegrations(prev => prev.map(i =>
        i.name === name ? { ...i, status: action === 'install' ? 'installed' : action === 'start' ? 'running' : 'stopped', enabled: action === 'start' } : i
      ));
    } catch { /* toggle locally */
      setIntegrations(prev => prev.map(i =>
        i.name === name ? { ...i, status: i.status === 'running' ? 'stopped' : i.status === 'installed' ? 'running' : 'installed', enabled: !i.enabled } : i
      ));
    }
  };

  const filtered = integrations.filter(i => {
    const matchCategory = activeCategory === 'All' || i.category === activeCategory;
    const matchSearch = !searchTerm || i.name.toLowerCase().includes(searchTerm.toLowerCase()) || i.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCategory && matchSearch;
  });

  const statusColor = (s: string) => s === 'running' ? '#00e676' : s === 'installed' ? '#ffd740' : s === 'stopped' ? '#ff5252' : '#666';
  const categoryIcon = (c: string) => {
    const map: Record<string, string> = { 'Agent Orchestration': '🤖', 'Vector DB': '🔍', 'Model Runtime': '⚡', 'Generative Media': '🎨', '3D / NeRF': '🧊', 'Game Engine': '🎮', 'MLOps': '📊', 'Serving': '🚀', 'Observability': '📡', 'Robotics': '🦾', 'All': '🔌' };
    return map[c] || '📦';
  };

  const totalRunning = integrations.filter(i => i.status === 'running').length;
  const totalInstalled = integrations.filter(i => i.status === 'installed' || i.status === 'running').length;

  return (
    <div style={{ padding: '32px' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>🔌 Integrations Hub</h1>
        <p style={{ color: '#999', fontSize: 14 }}>31 open-source tools — agents, vector DBs, model runtimes, generative media, 3D, robotics, and more.</p>
        <div style={{ display: 'flex', gap: 16, marginTop: 16 }}>
          <div style={{ background: 'rgba(0,230,118,0.1)', border: '1px solid rgba(0,230,118,0.3)', borderRadius: 12, padding: '12px 20px', textAlign: 'center' as const }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#00e676' }}>{totalRunning}</div>
            <div style={{ fontSize: 11, color: '#999' }}>Running</div>
          </div>
          <div style={{ background: 'rgba(255,215,64,0.1)', border: '1px solid rgba(255,215,64,0.3)', borderRadius: 12, padding: '12px 20px', textAlign: 'center' as const }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#ffd740' }}>{totalInstalled}</div>
            <div style={{ fontSize: 11, color: '#999' }}>Installed</div>
          </div>
          <div style={{ background: 'rgba(130,130,255,0.1)', border: '1px solid rgba(130,130,255,0.3)', borderRadius: 12, padding: '12px 20px', textAlign: 'center' as const }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#8282ff' }}>{integrations.length}</div>
            <div style={{ fontSize: 11, color: '#999' }}>Total</div>
          </div>
        </div>
      </div>

      {/* Search */}
      <input
        type="text" placeholder="Search integrations..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
        style={{ width: '100%', padding: '10px 16px', borderRadius: 8, border: '1px solid #333', background: '#1a1a2e', color: '#fff', fontSize: 14, marginBottom: 20, outline: 'none' }}
      />

      {/* Category Tabs */}
      <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 8, marginBottom: 24 }}>
        {categories.map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat)}
            style={{ padding: '6px 14px', borderRadius: 20, border: activeCategory === cat ? '1px solid #8282ff' : '1px solid #333', background: activeCategory === cat ? 'rgba(130,130,255,0.2)' : '#1a1a2e', color: activeCategory === cat ? '#fff' : '#999', fontSize: 12, cursor: 'pointer', transition: 'all 0.2s' }}>
            {categoryIcon(cat)} {cat}
          </button>
        ))}
      </div>

      {/* Integration Cards */}
      {loading ? <p style={{ color: '#666' }}>Loading integrations...</p> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {filtered.map(item => (
            <div key={item.name} style={{ background: '#16162a', border: '1px solid #2a2a4a', borderRadius: 16, padding: 20, transition: 'all 0.3s', position: 'relative' as const }}>
              {/* Status dot */}
              <div style={{ position: 'absolute' as const, top: 16, right: 16, width: 10, height: 10, borderRadius: '50%', background: statusColor(item.status), boxShadow: `0 0 8px ${statusColor(item.status)}` }} />

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <span style={{ fontSize: 22 }}>{categoryIcon(item.category)}</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15, color: '#fff' }}>{item.name}</div>
                  <div style={{ fontSize: 11, color: '#666' }}>v{item.version} • {item.license}</div>
                </div>
              </div>

              <p style={{ fontSize: 12, color: '#999', lineHeight: 1.5, marginBottom: 12, minHeight: 36 }}>{item.description}</p>

              <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' as const }}>
                <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 10, background: 'rgba(130,130,255,0.15)', color: '#8282ff' }}>{item.category}</span>
                {item.requiresGPU && <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 10, background: 'rgba(255,152,0,0.15)', color: '#ff9800' }}>🔥 GPU</span>}
                <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 10, background: `rgba(${statusColor(item.status) === '#00e676' ? '0,230,118' : statusColor(item.status) === '#ffd740' ? '255,215,64' : '102,102,102'},0.15)`, color: statusColor(item.status) }}>{item.status}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {item.homepage && (
                  <a href={item.homepage} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: '#8282ff', textDecoration: 'none' }}>
                    Docs ↗
                  </a>
                )}
                <button onClick={() => handleToggle(item.name, item.status)}
                  style={{ padding: '6px 16px', borderRadius: 8, border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer', background: item.status === 'running' ? 'rgba(255,82,82,0.2)' : item.status === 'installed' ? 'rgba(0,230,118,0.2)' : 'rgba(130,130,255,0.2)', color: item.status === 'running' ? '#ff5252' : item.status === 'installed' ? '#00e676' : '#8282ff', transition: 'all 0.2s' }}>
                  {item.status === 'running' ? '■ Stop' : item.status === 'installed' ? '▶ Start' : '⬇ Install'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

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
      case 'integrations': return <IntegrationsPage />;
      case 'ai-discovery': return <AIDiscoveryPage />;
      case 'smart-agents': return <SmartAgentsPage />;
      case 'workflow-builder': return <WorkflowBuilderPage />;
      case 'deploy-center': return <DeployCenterPage />;
      case 'cross-intelligence': return <CrossIntelligencePage />;
      case 'ai-testing': return <AITestingPage />;
      case 'community-hub': return <CommunityHubPage />;
      case 'ai-marketplace': return <AIMarketplacePage />;
      case 'live-analytics': return <LiveAnalyticsPage />;
      case 'ai-docs': return <AIDocsPage />;
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
