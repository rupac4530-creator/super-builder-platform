/**
 * Governance Department — Central Bootstrap
 * Constitution, 5 Governors (Council), Master Prompt Override.
 */

export { constitution, ConstitutionEngine, CONSTITUTION } from './constitution';
export { council, GovernanceCouncil } from './governor';
export { masterPrompt, MasterPromptController } from './master-prompt';

export function getGovernanceStatus() {
  const { constitution } = require('./constitution');
  const { council } = require('./governor');
  const { masterPrompt } = require('./master-prompt');
  return {
    department: 'governance',
    components: {
      constitution: constitution.getStatus(),
      council: council.getStatus(),
      masterPrompt: masterPrompt.getStatus(),
    },
    timestamp: new Date().toISOString(),
  };
}
