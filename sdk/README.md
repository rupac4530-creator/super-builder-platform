# SuperBuilder Plugin SDK

Build custom plugins that extend SuperBuilder with new capabilities.

## What Can Plugins Do?

- Add new AI model providers
- Create custom tools for agents
- Build automation pipelines
- Add new creator studio features
- Integrate external services

## Plugin Structure

Every plugin follows this structure:

```
my-plugin/
├── index.ts        # Main entry point
├── manifest.json   # Plugin metadata
└── README.md       # Documentation
```

## Quick Start

1. Copy an example from `examples/`
2. Edit `manifest.json` with your plugin info
3. Implement your logic in `index.ts`
4. Test locally with `npm run dev`
5. Share via the marketplace

## Plugin Interface

```typescript
interface SuperBuilderPlugin {
  name: string;
  version: string;
  description: string;

  // Called when plugin is loaded
  onLoad(context: PluginContext): Promise<void>;

  // Called when plugin is unloaded
  onUnload(): Promise<void>;

  // Plugin capabilities
  getTools?(): Tool[];
  getRoutes?(): Route[];
  getComponents?(): Component[];
}
```

## Examples

- [OpenAI Provider](examples/openai-provider/) — Add OpenAI as an AI provider
- [Web Scraper](examples/web-scraper/) — Web scraping tool for agents
- [Auto Deploy](examples/auto-deploy/) — Automatic deployment pipeline

## Publishing

Plugins can be shared through:
1. SuperBuilder Marketplace (in-app)
2. npm packages
3. GitHub repositories

See [CONTRIBUTING.md](../CONTRIBUTING.md) for contribution guidelines.
