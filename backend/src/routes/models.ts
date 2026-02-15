import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';

export const modelsRouter = Router();

// In-memory models store
const modelStore = new Map<string, any>();

// Seed some default models
const defaultModels = [
  { name: 'Alto-Vision-v1', architecture: 'resnet', description: 'Image classification model', status: 'ready', metrics: { accuracy: 0.924, params: '25M' } },
  { name: 'Alto-Text-v1', architecture: 'transformer', description: 'Text generation model', status: 'ready', metrics: { perplexity: 4.2, params: '125M' } },
  { name: 'Alto-Diffusion-LoRA', architecture: 'diffusion', description: 'Image generation LoRA adapter', status: 'draft', metrics: { fid: 12.5, params: '4M' } },
];

defaultModels.forEach(m => {
  const id = uuidv4();
  modelStore.set(id, { id, ...m, version: '1.0.0', filePath: null, fileSize: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
});

// List models
modelsRouter.get('/', async (_req: Request, res: Response) => {
  const models = Array.from(modelStore.values());
  res.json({ models, total: models.length });
});

// Get model
modelsRouter.get('/:id', async (req: Request, res: Response) => {
  const model = modelStore.get(req.params.id);
  if (!model) return res.status(404).json({ error: 'Model not found' });
  res.json(model);
});

// Create model
modelsRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { name, architecture, description, config = {} } = req.body;
    if (!name || !architecture) return res.status(400).json({ error: 'name and architecture are required' });

    const model = {
      id: uuidv4(),
      name,
      architecture,
      description: description || '',
      version: '1.0.0',
      status: 'draft',
      config,
      metrics: {},
      filePath: null,
      fileSize: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    modelStore.set(model.id, model);
    logger.info(`Model created: ${name} (${model.id})`);
    res.status(201).json(model);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create model' });
  }
});

// Update model
modelsRouter.put('/:id', async (req: Request, res: Response) => {
  const model = modelStore.get(req.params.id);
  if (!model) return res.status(404).json({ error: 'Model not found' });

  const updated = { ...model, ...req.body, id: model.id, createdAt: model.createdAt, updatedAt: new Date().toISOString() };
  modelStore.set(model.id, updated);
  res.json(updated);
});

// Delete model
modelsRouter.delete('/:id', async (req: Request, res: Response) => {
  if (!modelStore.has(req.params.id)) return res.status(404).json({ error: 'Model not found' });
  modelStore.delete(req.params.id);
  res.json({ deleted: true });
});

// Deploy model for inference
modelsRouter.post('/:id/deploy', async (req: Request, res: Response) => {
  const model = modelStore.get(req.params.id);
  if (!model) return res.status(404).json({ error: 'Model not found' });

  model.status = 'deployed';
  model.updatedAt = new Date().toISOString();

  res.json({
    model,
    endpoint: `/api/models/${model.id}/predict`,
    status: 'deployed',
    message: 'Model deployed for inference'
  });
});

// Run inference
modelsRouter.post('/:id/predict', async (req: Request, res: Response) => {
  const model = modelStore.get(req.params.id);
  if (!model) return res.status(404).json({ error: 'Model not found' });

  const { input } = req.body;

  // Mock prediction
  const prediction = {
    modelId: model.id,
    modelName: model.name,
    input: typeof input === 'string' ? input.substring(0, 100) : '[binary data]',
    output: {
      label: 'predicted_class',
      confidence: 0.95,
      probabilities: { class_a: 0.95, class_b: 0.03, class_c: 0.02 }
    },
    latency: `${Math.round(5 + Math.random() * 20)}ms`,
    timestamp: new Date().toISOString()
  };

  res.json(prediction);
});

// Export model
modelsRouter.post('/:id/export', async (req: Request, res: Response) => {
  const model = modelStore.get(req.params.id);
  if (!model) return res.status(404).json({ error: 'Model not found' });

  const { format = 'onnx' } = req.body;

  res.json({
    modelId: model.id,
    format,
    status: 'exported',
    filePath: `./data/exports/${model.name}_v${model.version}.${format}`,
    message: `Model exported as ${format.toUpperCase()}`
  });
});
