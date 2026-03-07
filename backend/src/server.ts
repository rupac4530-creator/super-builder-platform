import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import dotenv from 'dotenv';
import { logger } from './utils/logger';
import { healthRouter } from './routes/health';
import { projectsRouter } from './routes/projects';
import { aiRouter } from './routes/ai';
import { trainingRouter } from './routes/training';
import { modelsRouter } from './routes/models';
import { jobsRouter } from './routes/jobs';
import { agentsRouter } from './routes/agents';
import { metricsRouter } from './routes/metrics';
import aiStreamRouter from './routes/ai-stream';
import statusRouter from './routes/status';
import civilizationRouter from './routes/civilization';
import engineRouter from './routes/engine';
import servicesRouter from './routes/services';
import agentDepartmentsRouter from './routes/agent-departments';
import metricsPromRouter from './routes/metrics-prom';
import aiStreamV2Router from './routes/ai-stream-v2';
import artifactsRouter from './routes/artifacts';
import controlCenterRouter from './routes/control-center';
import innovationRouter from './routes/innovation';
import agentHubRouter from './routes/agent-hub';
import agentEvolutionRouter from './routes/agent-evolution';
import integrationsRouter from './routes/integrations';
import discoveryRouter from './routes/discovery';
import smartAgentsRouter from './routes/smart-agents';
import workflowsRouter from './routes/workflows';
import deploymentsRouter from './routes/deployments';
import crossIntelligenceRouter from './routes/cross-intelligence';
import testingRouter from './routes/testing';
import communityRouter from './routes/community';
import marketplaceRouter from './routes/marketplace';
import analyticsRouter from './routes/analytics';
import docsAiRouter from './routes/docs-ai';
import { initDatabase } from './database/init';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: { origin: process.env.FRONTEND_URL || 'http://localhost:3000', methods: ['GET', 'POST'] }
});

// Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000' }));
app.use(morgan('combined', { stream: { write: (msg: string) => logger.info(msg.trim()) } }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// Make io available to routes
app.set('io', io);

// Routes
app.use('/api/health', healthRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/ai', aiRouter);
app.use('/api/training', trainingRouter);
app.use('/api/models', modelsRouter);
app.use('/api/jobs', jobsRouter);
app.use('/api/agents', agentsRouter);
app.use('/api/metrics', metricsRouter);
app.use('/api/ai/stream', aiStreamRouter);
app.use('/api/status', statusRouter);
app.use('/api/civilization', civilizationRouter);
app.use('/api/engine', engineRouter);
app.use('/api/services', servicesRouter);
app.use('/api/departments', agentDepartmentsRouter);
app.use('/api/metrics/prom', metricsPromRouter);
app.use('/api/ai-stream/v2', aiStreamV2Router);
app.use('/api/artifacts', artifactsRouter);
app.use('/api/control-center', controlCenterRouter);
app.use('/api/innovation', innovationRouter);
app.use('/api/agent-hub', agentHubRouter);
app.use('/api/evolution', agentEvolutionRouter);
app.use('/api/integrations', integrationsRouter);
app.use('/api/discovery', discoveryRouter);
app.use('/api/smart-agents', smartAgentsRouter);
app.use('/api/workflows', workflowsRouter);
app.use('/api/deployments', deploymentsRouter);
app.use('/api/cross-intelligence', crossIntelligenceRouter);
app.use('/api/testing', testingRouter);
app.use('/api/community', communityRouter);
app.use('/api/marketplace', marketplaceRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/docs-ai', docsAiRouter);

// Root
app.get('/', (_req, res) => {
  res.json({
    name: 'Engine Alto API',
    version: '3.0.0-heaven',
    status: 'ALTO READY',
    endpoints: [
      '/api/health',
      '/api/projects',
      '/api/ai',
      '/api/ai/stream',
      '/api/training',
      '/api/models',
      '/api/jobs',
      '/api/agents',
      '/api/metrics',
      '/api/status',
      '/api/civilization',
      '/api/civilization/governance',
      '/api/civilization/health',
      '/api/civilization/security',
      '/api/civilization/exploration',
      '/api/civilization/family',
      '/api/civilization/updates',
      '/api/civilization/memory',
      '/api/engine',
      '/api/engine/core',
      '/api/engine/render',
      '/api/engine/script',
      '/api/engine/browser',
      '/api/engine/build',
      '/api/engine/network',
      '/api/engine/ai',
      '/api/services',
      '/api/services/video-gen',
      '/api/services/game-factory',
      '/api/services/3d-pipeline',
      '/api/services/audio',
      '/api/services/vfx',
      '/api/services/self-heal',
      '/api/services/scalability',
      '/api/services/marketplace',
      '/api/metrics/prom',
      '/api/metrics/prom/json',
      '/api/metrics/prom/traces',
      '/api/ai-stream/v2/chat',
      '/api/ai-stream/v2/models',
      '/api/ai-stream/v2/usage',
      '/api/services/observability',
      '/api/services/legal',
      '/api/services/research',
      '/api/services/docs',
      '/api/services/testing',
      '/api/departments',
      '/api/departments/governance',
      '/api/departments/health',
      '/api/departments/exploration',
      '/api/departments/family',
      '/api/departments/memory',
      '/api/departments/support',
      '/api/departments/framework',
      '/api/departments/training',
      '/api/departments/security',
      '/api/departments/expansion',
      '/api/control-center/overview',
      '/api/control-center/health',
      '/api/innovation/modules',
      '/api/innovation/knowledge-brain/status',
      '/api/innovation/knowledge-brain/research',
      '/api/innovation/knowledge-brain/explain',
      '/api/innovation/memory/status',
      '/api/innovation/memory/timeline',
      '/api/innovation/memory/store',
      '/api/innovation/memory/retrieve',
      '/api/innovation/idea-lab/status',
      '/api/innovation/idea-lab/validate',
      '/api/innovation/idea-lab/evolve',
      '/api/innovation/idea-lab/combine',
      '/api/innovation/idea-lab/startup',
      '/api/innovation/code-forge/status',
      '/api/innovation/code-forge/debug',
      '/api/innovation/code-forge/evolve',
      '/api/innovation/code-forge/screenshot-to-code',
      '/api/innovation/data-insights/status',
      '/api/innovation/data-insights/analyze',
      '/api/innovation/data-insights/simulate',
      '/api/innovation/learning-hub/status',
      '/api/innovation/learning-hub/create-course',
      '/api/innovation/learning-hub/debate',
      '/api/innovation/learning-hub/curiosity',
      '/api/innovation/trend-radar/status',
      '/api/innovation/trend-radar/trends',
      '/api/innovation/trend-radar/decide',
      '/api/innovation/collab-space/status',
      '/api/innovation/collab-space/rooms',
      '/api/innovation/collab-space/design-product',
      '/api/innovation/marketplace/status',
      '/api/innovation/marketplace/listings',
      '/api/innovation/self-improve/status',
      '/api/innovation/self-improve/scan',
      '/api/agent-hub/overview',
      '/api/agent-hub/plans',
      '/api/agent-hub/plans/:planId',
      '/api/agent-hub/plans/:planId/execute',
      '/api/agent-hub/tasks',
      '/api/agent-hub/tasks/:taskId',
      '/api/agent-hub/tasks/:taskId/pause',
      '/api/agent-hub/tasks/:taskId/resume',
      '/api/agent-hub/tasks/:taskId/cancel',
      '/api/agent-hub/tools',
      '/api/agent-hub/tools/register',
      '/api/agent-hub/tools/:toolId/run',
      '/api/agent-hub/teams/create',
      '/api/agent-hub/teams',
      '/api/agent-hub/teams/:teamId',
      '/api/agent-hub/teams/:teamId/run',
      '/api/agent-hub/memory/store',
      '/api/agent-hub/memory',
      '/api/agent-hub/memory/search',
      '/api/agent-hub/sandbox/status',
      '/api/evolution/status',
      '/api/evolution/insights',
      '/api/evolution/agent-performance',
      '/api/evolution/workflows',
      '/api/evolution/run-analysis',
      '/api/evolution/suggestions',
      '/api/evolution/history'
    ]
  });
});

// WebSocket
io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);

  socket.on('subscribe:training', (jobId: string) => {
    socket.join(`training:${jobId}`);
    logger.info(`Client ${socket.id} subscribed to training job ${jobId}`);
  });

  socket.on('subscribe:agent', (agentId: string) => {
    socket.join(`agent:${agentId}`);
  });

  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });
});

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

const PORT = parseInt(process.env.PORT || '3001', 10);

async function start() {
  try {
    await initDatabase();
    httpServer.listen(PORT, () => {
      logger.info(`🚀 Engine Alto API running on port ${PORT}`);
      logger.info(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`🤖 Real AI: ${process.env.ENABLE_REAL_AI === 'true' ? 'ENABLED' : 'DISABLED (mock mode)'}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();

export { app, io };
