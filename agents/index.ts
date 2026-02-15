/**
 * Agents — Complete Central Bootstrap
 * Exports ALL 11 agent departments with unified status aggregation.
 *
 * Phase 0: governance, health, security (Phase 0 files), exploration, family, memory, support, specialized
 * Phase 8: framework (task-queue, capability-registry, agent-factory)
 * Phase 9: training (trainer-lab, evolution-engine)
 * Phase 10: security (hacker-department, police-station, head-officer)
 * Phase 11: expansion (expansion-network, purpose-guardian)
 */

export function getAgentsStatus() {
  const { getGovernanceStatus } = require('./governance');
  const { getHealthStatus } = require('./health');
  const { getExplorationStatus } = require('./exploration');
  const { getFamilyStatus } = require('./family');
  const { getMemoryStatus } = require('./memory');
  const { getSupportStatus } = require('./support');
  const { getAgentFrameworkStatus } = require('./framework');
  const { getTrainingStatus } = require('./training');
  const { getSecurityStatus } = require('./security');
  const { getExpansionStatus } = require('./expansion');

  return {
    subsystem: 'agents',
    departments: {
      // Phase 0 — Sovereign Foundation
      governance: getGovernanceStatus(),
      health: getHealthStatus(),
      exploration: getExplorationStatus(),
      family: getFamilyStatus(),
      memory: getMemoryStatus(),
      support: getSupportStatus(),
      // Phase 8-11 — Enhanced Framework
      framework: getAgentFrameworkStatus(),
      training: getTrainingStatus(),
      security: getSecurityStatus(),
      expansion: getExpansionStatus(),
    },
    totalDepartments: 10,
    timestamp: new Date().toISOString(),
  };
}
