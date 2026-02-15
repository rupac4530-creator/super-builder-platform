import { Pool } from 'pg';
import { logger } from '../utils/logger';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://alto:alto_secret@localhost:5432/alto_db',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  logger.error('Unexpected database pool error:', err);
});

export async function query(text: string, params?: unknown[]) {
  const start = Date.now();
  const result = await pool.query(text, params);
  const duration = Date.now() - start;
  logger.debug(`DB Query (${duration}ms): ${text.substring(0, 100)}`);
  return result;
}

export async function initDatabase() {
  try {
    // Try connecting; if it fails, use in-memory fallback
    await pool.query('SELECT NOW()');
    logger.info('✅ PostgreSQL connected');

    // Create tables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        type TEXT NOT NULL DEFAULT 'app',
        config JSONB DEFAULT '{}',
        files JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS models (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        architecture TEXT NOT NULL,
        description TEXT,
        version TEXT DEFAULT '1.0.0',
        status TEXT DEFAULT 'draft',
        config JSONB DEFAULT '{}',
        metrics JSONB DEFAULT '{}',
        file_path TEXT,
        file_size BIGINT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS training_jobs (
        id TEXT PRIMARY KEY,
        model_id TEXT REFERENCES models(id),
        status TEXT DEFAULT 'pending',
        config JSONB DEFAULT '{}',
        metrics JSONB DEFAULT '{}',
        logs TEXT[] DEFAULT '{}',
        started_at TIMESTAMP,
        completed_at TIMESTAMP,
        error TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS agents (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        status TEXT DEFAULT 'idle',
        config JSONB DEFAULT '{}',
        memory JSONB DEFAULT '{}',
        last_active TIMESTAMP DEFAULT NOW(),
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS agent_tasks (
        id TEXT PRIMARY KEY,
        agent_id TEXT REFERENCES agents(id),
        type TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        input JSONB DEFAULT '{}',
        output JSONB DEFAULT '{}',
        started_at TIMESTAMP,
        completed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS audit_log (
        id SERIAL PRIMARY KEY,
        action TEXT NOT NULL,
        actor TEXT NOT NULL,
        target TEXT,
        details JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    logger.info('✅ Database tables initialized');
  } catch (error) {
    logger.warn('⚠️ PostgreSQL unavailable — using in-memory store');
    logger.warn('  (Install PostgreSQL or run docker compose up for persistent storage)');
  }
}

export { pool };
