/**
 * Services — Central Bootstrap
 * Exports all service subsystems with unified status aggregation.
 */

export function getServicesStatus() {
  const { videoGenPipeline } = require('./video-gen/pipeline');
  const { gameFactory } = require('./game-factory/factory');
  const { threeDPipeline } = require('./3d-pipeline/pipeline');
  const { audioPipeline } = require('./audio/pipeline');
  const { vfxNodeEditor } = require('./vfx/node-editor');
  const { selfHealSystem } = require('./self-heal/system');
  const { scalabilityController } = require('./scalability/controller');
  const { marketplaceSystem } = require('./marketplace/system');
  const { observabilitySystem } = require('./observability/system');
  const { legalModerationSystem } = require('./legal/moderation');
  const { researchDepartment } = require('./research/department');
  const { documentationSystem } = require('./docs/documentation');
  const { testFramework } = require('./testing/framework');

  return {
    subsystem: 'services',
    components: {
      videoGen: videoGenPipeline.getStatus(),
      gameFactory: gameFactory.getStatus(),
      threeDPipeline: threeDPipeline.getStatus(),
      audio: audioPipeline.getStatus(),
      vfx: vfxNodeEditor.getStatus(),
      selfHeal: selfHealSystem.getStatus(),
      scalability: scalabilityController.getStatus(),
      marketplace: marketplaceSystem.getStatus(),
      observability: observabilitySystem.getStatus(),
      legal: legalModerationSystem.getStatus(),
      research: researchDepartment.getStatus(),
      documentation: documentationSystem.getStatus(),
      testing: testFramework.getStatus(),
    },
    totalSubsystems: 13,
    timestamp: new Date().toISOString(),
  };
}
