import { logger } from '../utils/logger';
import { jobQueue } from './queue';

/**
 * Engine Alto Worker — Background job processing
 * Handles: training, inference, export, video render, build
 */

async function startWorker() {
  logger.info('🔄 Engine Alto Worker starting...');
  logger.info(`📊 Queue stats: ${JSON.stringify(jobQueue.getStats())}`);
  logger.info('✅ Worker ready — listening for jobs');

  // Keep worker alive
  setInterval(() => {
    const stats = jobQueue.getStats();
    if (stats.active > 0 || stats.waiting > 0) {
      logger.info(`📊 Worker stats: ${JSON.stringify(stats)}`);
    }
  }, 30000);
}

startWorker().catch(err => {
  logger.error('Worker failed to start:', err);
  process.exit(1);
});

export { startWorker };
