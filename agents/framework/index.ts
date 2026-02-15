/**
 * Agent Framework — Central Bootstrap
 * Exports task queue, capability registry, agent factory.
 */

export { AgentTaskQueue, agentTaskQueue } from './task-queue';
export { CapabilityRegistry, capabilityRegistry } from './capability-registry';
export { AgentFactory, agentFactory } from './agent-factory';

export function getAgentFrameworkStatus() {
  const { agentTaskQueue: tq } = require('./task-queue');
  const { capabilityRegistry: cr } = require('./capability-registry');
  const { agentFactory: af } = require('./agent-factory');
  return {
    subsystem: 'agent-framework',
    components: {
      taskQueue: tq.getStatus(),
      capabilityRegistry: cr.getStatus(),
      agentFactory: af.getStatus(),
    },
    timestamp: new Date().toISOString(),
  };
}
