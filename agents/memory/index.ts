/**
 * Memory & Updates Department — Central Bootstrap
 * Memory Fabric (per-agent memory stores) + Update Pipeline (4-7 day cycle).
 */

export { memoryFabric, MemoryFabric } from './memory-fabric';
export { updatePipeline, UpdatePipeline } from './update-pipeline';

export function getMemoryStatus() {
  const { memoryFabric } = require('./memory-fabric');
  const { updatePipeline } = require('./update-pipeline');
  return {
    department: 'memory',
    components: {
      memoryFabric: memoryFabric.getStatus(),
      updatePipeline: updatePipeline.getStatus(),
    },
    timestamp: new Date().toISOString(),
  };
}
