/**
 * Example: Hello World Plugin for Super Builder Platform
 *
 * Demonstrates basic plugin structure, panel registration,
 * and filter creation.
 */
import { definePlugin, PluginContext, FrameData } from 'superbuilder-plugin-sdk';

export default definePlugin({
  name: 'hello-world',
  version: '1.0.0',
  description: 'A simple example plugin that adds a vintage filter and info panel',
  author: 'Super Builder Team',
  type: 'filter',
  permissions: ['read:canvas', 'write:canvas', 'ui:panel'],

  async activate(ctx: PluginContext) {
    ctx.log('Hello World plugin activated!');

    // Register a vintage sepia filter
    ctx.registerFilter('vintage-sepia', async (frame: FrameData, params) => {
      const intensity = (params?.intensity as number) ?? 0.6;
      const result: FrameData = {
        ...frame,
        data: new Uint8ClampedArray(frame.data.length),
      };

      for (let i = 0; i < frame.data.length; i += 4) {
        const r = frame.data[i];
        const g = frame.data[i + 1];
        const b = frame.data[i + 2];
        const a = frame.data[i + 3];

        // Sepia transform
        const sepiaR = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189);
        const sepiaG = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168);
        const sepiaB = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131);

        // Blend with original
        result.data[i] = r + (sepiaR - r) * intensity;
        result.data[i + 1] = g + (sepiaG - g) * intensity;
        result.data[i + 2] = b + (sepiaB - b) * intensity;
        result.data[i + 3] = a;
      }

      return result;
    });

    // Register a UI panel
    ctx.registerPanel({
      id: 'hello-world-panel',
      title: 'Hello World',
      position: 'right',
      render: () => `
        <div style="padding: 16px; font-family: system-ui;">
          <h3>🎨 Hello World Plugin</h3>
          <p>This plugin adds:</p>
          <ul>
            <li>Vintage Sepia filter</li>
          </ul>
          <p style="opacity: 0.7; font-size: 12px;">
            Built with Super Builder Plugin SDK v1.0
          </p>
        </div>
      `,
    });
  },

  async deactivate(ctx: PluginContext) {
    ctx.log('Hello World plugin deactivated');
  },
});
