/**
 * Engine Alto — Artifacts API Route
 * Lists, searches, and serves artifact metadata from the vault.
 */

import { Router, Request, Response } from 'express';
import { logger } from '../utils/logger';
import * as fs from 'fs';
import * as path from 'path';

const router = Router();

const ARTIFACT_ROOT = process.env.ARTIFACT_ROOT || path.join(process.cwd(), '..', 'data');

interface ArtifactEntry {
  name: string;
  path: string;
  type: string;
  sizeMB: number;
  modified: string;
}

// Recursively scan a directory
function scanDirectory(dir: string, basePath: string, maxDepth = 3, depth = 0): ArtifactEntry[] {
  const entries: ArtifactEntry[] = [];
  if (depth >= maxDepth || !fs.existsSync(dir)) return entries;

  try {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    for (const item of items) {
      const fullPath = path.join(dir, item.name);
      const relPath = path.relative(basePath, fullPath).replace(/\\/g, '/');

      if (item.isDirectory() && item.name !== '.git' && item.name !== 'node_modules') {
        entries.push(...scanDirectory(fullPath, basePath, maxDepth, depth + 1));
      } else if (item.isFile() && item.name !== '.gitkeep') {
        const stats = fs.statSync(fullPath);
        const ext = path.extname(item.name).toLowerCase();
        const typeMap: Record<string, string> = {
          '.pt': 'model', '.onnx': 'model', '.safetensors': 'model',
          '.ckpt': 'model', '.h5': 'model', '.pth': 'model',
          '.glb': '3d', '.fbx': '3d', '.obj': '3d', '.blend': '3d',
          '.mp4': 'video', '.mov': 'video', '.mkv': 'video', '.webm': 'video',
          '.wav': 'audio', '.mp3': 'audio', '.flac': 'audio',
          '.csv': 'dataset', '.jsonl': 'dataset', '.parquet': 'dataset',
          '.zip': 'archive', '.tar': 'archive',
          '.exr': 'render', '.hdr': 'render',
          '.png': 'image', '.jpg': 'image', '.jpeg': 'image',
        };

        entries.push({
          name: item.name,
          path: relPath,
          type: typeMap[ext] || 'other',
          sizeMB: Math.round((stats.size / (1024 * 1024)) * 100) / 100,
          modified: stats.mtime.toISOString(),
        });
      }
    }
  } catch (err) {
    logger.warn(`[Artifacts] Error scanning ${dir}: ${err}`);
  }
  return entries;
}

// GET /api/artifacts/list — list all artifacts
router.get('/list', (_req: Request, res: Response) => {
  const entries = scanDirectory(ARTIFACT_ROOT, ARTIFACT_ROOT, 4);
  const totalSizeMB = entries.reduce((sum, e) => sum + e.sizeMB, 0);
  const byType = entries.reduce((acc, e) => {
    if (!acc[e.type]) acc[e.type] = { count: 0, sizeMB: 0 };
    acc[e.type].count++;
    acc[e.type].sizeMB += e.sizeMB;
    return acc;
  }, {} as Record<string, { count: number; sizeMB: number }>);

  res.json({
    artifactRoot: ARTIFACT_ROOT,
    totalFiles: entries.length,
    totalSizeMB: Math.round(totalSizeMB * 100) / 100,
    totalSizeGB: Math.round((totalSizeMB / 1024) * 100) / 100,
    byType,
    files: entries.slice(0, 500),  // cap response
  });
});

// GET /api/artifacts/stats — storage health stats
router.get('/stats', (_req: Request, res: Response) => {
  const targetGB = parseInt(process.env.ARTIFACT_TARGET_GB || '500', 10);
  const entries = scanDirectory(ARTIFACT_ROOT, ARTIFACT_ROOT, 4);
  const totalSizeMB = entries.reduce((sum, e) => sum + e.sizeMB, 0);
  const totalSizeGB = totalSizeMB / 1024;

  const dirs = ['models', 'datasets', 'assets', 'renders', 'previews', 'checkpoints', 'exports', 'backups', 'logs'];
  const dirStats: Record<string, { files: number; sizeMB: number }> = {};
  for (const dir of dirs) {
    const dirPath = path.join(ARTIFACT_ROOT, dir);
    const dirEntries = scanDirectory(dirPath, dirPath, 3);
    dirStats[dir] = {
      files: dirEntries.length,
      sizeMB: Math.round(dirEntries.reduce((sum, e) => sum + e.sizeMB, 0) * 100) / 100,
    };
  }

  res.json({
    artifactRoot: ARTIFACT_ROOT,
    targetGB,
    currentGB: Math.round(totalSizeGB * 100) / 100,
    progressPercent: Math.round((totalSizeGB / targetGB) * 10000) / 100,
    targetReached: totalSizeGB >= targetGB,
    totalFiles: entries.length,
    directories: dirStats,
    timestamp: new Date().toISOString(),
  });
});

// GET /api/artifacts/search — search by type or name
router.get('/search', (req: Request, res: Response) => {
  const { type, name, minSizeMB } = req.query as Record<string, string>;
  let entries = scanDirectory(ARTIFACT_ROOT, ARTIFACT_ROOT, 4);

  if (type) entries = entries.filter(e => e.type === type);
  if (name) entries = entries.filter(e => e.name.toLowerCase().includes(name.toLowerCase()));
  if (minSizeMB) entries = entries.filter(e => e.sizeMB >= parseFloat(minSizeMB));

  res.json({ results: entries.slice(0, 200), total: entries.length });
});

export default router;
