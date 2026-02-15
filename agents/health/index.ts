/**
 * Health Department — Central Bootstrap
 * 3 Doctors, 10 Doctor-Healers, Home Healer Network, Caretaker ("Wife").
 */

export { allDoctors, codeDoctor, infraDoctor, securityDoctor, DoctorAgent } from './doctor';
export { doctorHealers, DoctorHealer } from './doctor-healer';
export { homeHealerNetwork, HomeHealerNetwork } from './home-healer';
export { caretakerAI, CaretakerAI } from './caretaker';

export function getHealthStatus() {
  const { allDoctors } = require('./doctor');
  const { doctorHealers } = require('./doctor-healer');
  const { homeHealerNetwork } = require('./home-healer');
  const { caretakerAI } = require('./caretaker');
  return {
    department: 'health',
    components: {
      doctors: allDoctors.map((d: any) => d.getStatus()),
      healers: doctorHealers.map((h: any) => h.getStatus()),
      homeHealer: homeHealerNetwork.getStatus(),
      caretaker: caretakerAI.getStatus(),
    },
    totalAgents: allDoctors.length + doctorHealers.length + 2,
    timestamp: new Date().toISOString(),
  };
}
