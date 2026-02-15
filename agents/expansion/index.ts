/**
 * Expansion Department — Central Bootstrap
 */
export { ExpansionNetwork, expansionNetwork } from './expansion-network';
export { PurposeGuardian, purposeGuardian } from './purpose-guardian';

export function getExpansionStatus() {
  const { expansionNetwork: en } = require('./expansion-network');
  const { purposeGuardian: pg } = require('./purpose-guardian');
  return {
    subsystem: 'expansion-department',
    components: { expansionNetwork: en.getStatus(), purposeGuardian: pg.getStatus() },
    timestamp: new Date().toISOString(),
  };
}
