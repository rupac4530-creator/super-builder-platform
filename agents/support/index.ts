/**
 * Support Department — Central Bootstrap
 * Tracker, Decorator, Reporter, Workbook Agent, Motor Reminder, Modernizer, Consistency Auditor.
 */

export { tracker, PerformanceTracker } from './tracker';
export { decorator, DecoratorAgent } from './decorator';
export { reporter, ReporterAgent } from './reporter';
export { workbookAgent, WorkbookAgent } from './workbook-agent';
export { motorReminder, MotorReminder } from './motor-reminder';
export { modernizer, ModernizerAgent } from './modernizer';
export { consistencyAuditor, ConsistencyAuditor } from './consistency-auditor';

export function getSupportStatus() {
  const { tracker } = require('./tracker');
  const { decorator } = require('./decorator');
  const { reporter } = require('./reporter');
  const { workbookAgent } = require('./workbook-agent');
  const { motorReminder } = require('./motor-reminder');
  const { modernizer } = require('./modernizer');
  const { consistencyAuditor } = require('./consistency-auditor');
  return {
    department: 'support',
    components: {
      tracker: tracker.getStatus(),
      decorator: decorator.getStatus(),
      reporter: reporter.getStatus(),
      workbookAgent: workbookAgent.getStatus(),
      motorReminder: motorReminder.getStatus(),
      modernizer: modernizer.getStatus(),
      consistencyAuditor: consistencyAuditor.getStatus(),
    },
    totalAgents: 7,
    timestamp: new Date().toISOString(),
  };
}
