/**
 * Exploration Department — Central Bootstrap
 * Luffy (broad scanning), Zoro (deep research), Navigator (filtering & validation).
 */

export { luffy, LuffyAgent } from './luffy';
export { zoro, ZoroAgent } from './zoro';
export { navigator, NavigatorAgent } from './navigator';

export function getExplorationStatus() {
  const { luffy } = require('./luffy');
  const { zoro } = require('./zoro');
  const { navigator } = require('./navigator');
  return {
    department: 'exploration',
    components: {
      luffy: luffy.getStatus(),
      zoro: zoro.getStatus(),
      navigator: navigator.getStatus(),
    },
    totalAgents: 3,
    timestamp: new Date().toISOString(),
  };
}
