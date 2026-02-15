/**
 * Family Department — Central Bootstrap
 * Father (memory collector & update manager), Mother (agent producer),
 * Sister (hidden emergency backup).
 */

export { fatherAI, FatherAI } from './father';
export { motherAI, MotherAI } from './mother';
export { sisterAI, SisterAI } from './sister';

export function getFamilyStatus() {
  const { fatherAI } = require('./father');
  const { motherAI } = require('./mother');
  const { sisterAI } = require('./sister');
  return {
    department: 'family',
    components: {
      father: fatherAI.getStatus(),
      mother: motherAI.getStatus(),
      sister: sisterAI.getStatus(),
    },
    totalAgents: 3,
    timestamp: new Date().toISOString(),
  };
}
