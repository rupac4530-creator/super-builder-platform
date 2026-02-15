/**
 * Security Department — Central Bootstrap
 * Phase 0: cops.ts, ethical-hackers.ts, hacker-trainer.ts, head-officer.ts
 * Phase 10: hacker-department.ts, police-station.ts
 */
export { HackerDepartment, hackerDepartment } from './hacker-department';
export { PoliceStation, policeStation } from './police-station';
export { HeadOfficer, headOfficer } from './head-officer';

export function getSecurityStatus() {
  const { hackerDepartment: hd } = require('./hacker-department');
  const { policeStation: ps } = require('./police-station');
  const { headOfficer: ho } = require('./head-officer');
  return {
    subsystem: 'security-department',
    components: {
      hackerDepartment: hd.getStatus(),
      policeStation: ps.getStatus(),
      headOfficer: ho.getStatus(),
    },
    timestamp: new Date().toISOString(),
  };
}
