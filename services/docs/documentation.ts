/**
 * Phase 23 — Documentation & Tutorials
 * Auto-generated API reference, tutorial system, sample projects.
 */

export interface Tutorial {
  id: string;
  title: string;
  category: 'game' | 'video' | '3d' | 'audio' | 'plugin' | 'app' | 'agent';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  steps: TutorialStep[];
  estimatedMinutes: number;
  prerequisites: string[];
  sampleProjectPath?: string;
}

export interface TutorialStep {
  order: number;
  title: string;
  instruction: string;
  codeSnippet?: string;
  expectedResult: string;
  tips?: string[];
}

export interface APIEndpoint {
  path: string;
  method: string;
  description: string;
  parameters: { name: string; type: string; required: boolean; description: string }[];
  responseExample: any;
  category: string;
}

export class DocumentationSystem {
  private tutorials: Map<string, Tutorial> = new Map();
  private apiDocs: APIEndpoint[] = [];

  constructor() {
    // Register 6 end-to-end tutorials
    this.registerTutorial('Create a Daily Journal App', 'app', 'beginner', 15, [], [
      { order: 1, title: 'Create Project', instruction: 'Open the platform and click "New Project" → "Web App"', expectedResult: 'Empty project workspace opened' },
      { order: 2, title: 'Add Components', instruction: 'Drag Journal Entry component from the sidebar', expectedResult: 'Journal entry form appears' },
      { order: 3, title: 'Connect Storage', instruction: 'Link to local storage for persistence', expectedResult: 'Data saves between sessions' },
      { order: 4, title: 'Style & Theme', instruction: 'Apply dark mode theme from presets', expectedResult: 'Beautiful dark-themed journal' },
      { order: 5, title: 'Deploy', instruction: 'Click Deploy → GitHub Pages', expectedResult: 'Live URL generated' },
    ]);

    this.registerTutorial('Build a Platformer Game', 'game', 'intermediate', 30, ['basic-editor'], [
      { order: 1, title: 'Choose Template', instruction: 'Select "Platformer" from Game Factory templates', expectedResult: 'Platformer scaffold loaded' },
      { order: 2, title: 'Design Level', instruction: 'Use level editor to place platforms and enemies', expectedResult: 'Playable level with obstacles' },
      { order: 3, title: 'Add AI Behaviors', instruction: 'Attach patrol behavior tree to enemies', expectedResult: 'Enemies patrol waypoints' },
      { order: 4, title: 'Add Scoring', instruction: 'Create coin collectibles with score counter', expectedResult: 'Score increases on coin collection' },
      { order: 5, title: 'Export HTML5', instruction: 'Build and export as playable HTML5 game', expectedResult: 'Playable game in browser' },
    ]);

    this.registerTutorial('Generate a 10s Video', 'video', 'beginner', 10, [], [
      { order: 1, title: 'Enter Prompt', instruction: 'Type your video description in the Video Studio', expectedResult: 'Prompt accepted' },
      { order: 2, title: 'Set Keyframes', instruction: 'Add keyframes for camera angle changes', expectedResult: 'Keyframes visible on timeline' },
      { order: 3, title: 'Generate', instruction: 'Click Generate and watch streaming preview', expectedResult: 'Frames appear progressively' },
      { order: 4, title: 'Download', instruction: 'Export as MP4 1080p', expectedResult: 'MP4 file downloaded' },
    ]);

    this.registerTutorial('Image to 3D Model', '3d', 'intermediate', 20, [], [
      { order: 1, title: 'Upload Images', instruction: 'Upload 8+ photos of an object from different angles', expectedResult: 'Images queued for processing' },
      { order: 2, title: 'Reconstruct', instruction: 'Select NeRF/Instant-NGP method and start', expectedResult: 'Point cloud generated' },
      { order: 3, title: 'View & Edit', instruction: 'Preview in 3D viewer with environment lighting', expectedResult: 'Textured 3D model visible' },
      { order: 4, title: 'Export GLB', instruction: 'Export with LOD levels for web/game use', expectedResult: 'GLB files with LOD 0-3' },
    ]);

    this.registerTutorial('AI Music Composition', 'audio', 'beginner', 10, [], [
      { order: 1, title: 'Choose Style', instruction: 'Select genre, tempo, and key', expectedResult: 'Composition settings configured' },
      { order: 2, title: 'Compose', instruction: 'Generate 60-second track with stems', expectedResult: '5 stem tracks generated' },
      { order: 3, title: 'Mix', instruction: 'Adjust stem volumes and add variants', expectedResult: 'Mixed track ready' },
      { order: 4, title: 'Export', instruction: 'Download stems and mixdown as WAV/MP3', expectedResult: 'Audio files downloaded' },
    ]);

    this.registerTutorial('Create a Plugin', 'plugin', 'advanced', 25, ['developer-mode'], [
      { order: 1, title: 'Initialize', instruction: 'Use Plugin SDK CLI to scaffold a new plugin', expectedResult: 'Plugin project structure created' },
      { order: 2, title: 'Implement', instruction: 'Write plugin logic with sandboxed API access', expectedResult: 'Plugin code compiles' },
      { order: 3, title: 'Test Locally', instruction: 'Load plugin in dev mode and test features', expectedResult: 'Plugin works in sandbox' },
      { order: 4, title: 'Submit', instruction: 'Submit to marketplace for review', expectedResult: 'Plugin passes security review' },
      { order: 5, title: 'Publish', instruction: 'Publish to marketplace after approval', expectedResult: 'Plugin available to all users' },
    ]);

    // Register API docs
    this.registerAPIDocs();
  }

  private registerTutorial(title: string, category: Tutorial['category'], difficulty: Tutorial['difficulty'], minutes: number, prereqs: string[], steps: Omit<TutorialStep, 'tips'>[]): void {
    const id = `tut-${title.toLowerCase().replace(/\s+/g, '-')}`;
    this.tutorials.set(id, {
      id, title, category, difficulty, estimatedMinutes: minutes, prerequisites: prereqs,
      steps: steps.map(s => ({ ...s, tips: [] })),
    });
  }

  private registerAPIDocs(): void {
    const endpoints: APIEndpoint[] = [
      { path: '/api/status', method: 'GET', description: 'Platform health status', parameters: [], responseExample: { status: 'ok' }, category: 'core' },
      { path: '/api/engine', method: 'GET', description: 'Engine subsystem statuses', parameters: [], responseExample: { subsystems: 21 }, category: 'engine' },
      { path: '/api/civilization', method: 'GET', description: 'AI civilization status', parameters: [], responseExample: { agents: 27 }, category: 'civilization' },
      { path: '/api/engine/core', method: 'GET', description: 'Core engine status', parameters: [], responseExample: { jobSystem: 'active' }, category: 'engine' },
      { path: '/api/engine/render', method: 'GET', description: 'Render subsystem status', parameters: [], responseExample: { gpu: 'active' }, category: 'engine' },
      { path: '/api/engine/ai', method: 'GET', description: 'AI/ML subsystem status', parameters: [], responseExample: { inference: 'active' }, category: 'engine' },
    ];
    this.apiDocs = endpoints;
  }

  getTutorial(id: string): Tutorial | undefined { return this.tutorials.get(id); }
  getAllTutorials(): Tutorial[] { return Array.from(this.tutorials.values()); }
  getAPIDocs(): APIEndpoint[] { return this.apiDocs; }

  getStatus() {
    const tutorials = Array.from(this.tutorials.values());
    return {
      totalTutorials: tutorials.length,
      categories: [...new Set(tutorials.map(t => t.category))],
      apiEndpoints: this.apiDocs.length,
      beginnerTutorials: tutorials.filter(t => t.difficulty === 'beginner').length,
      intermediateTutorials: tutorials.filter(t => t.difficulty === 'intermediate').length,
      advancedTutorials: tutorials.filter(t => t.difficulty === 'advanced').length,
    };
  }
}

export const documentationSystem = new DocumentationSystem();
