/**
 * Training Department — Central Bootstrap
 */
export { TrainerLab, trainerLab } from './trainer-lab';
export { EvolutionEngine, evolutionEngine } from './evolution-engine';

export function getTrainingStatus() {
  const { trainerLab: tl } = require('./trainer-lab');
  const { evolutionEngine: ee } = require('./evolution-engine');
  return {
    subsystem: 'training-department',
    components: { trainerLab: tl.getStatus(), evolutionEngine: ee.getStatus() },
    timestamp: new Date().toISOString(),
  };
}
