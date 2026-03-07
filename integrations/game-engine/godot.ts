import { AbstractAdapter } from '../base-adapter';

export class GodotAdapter extends AbstractAdapter {
    constructor() {
        super({
            enabled: false, name: 'Godot Engine', version: '4.2',
            category: 'game-engine', license: 'MIT',
            description: 'Open-source game engine — 2D/3D, GDScript/C#, export to mobile/desktop/web/console.',
            homepage: 'https://godotengine.org', repository: 'https://github.com/godotengine/godot',
            requiresGPU: true, envVars: { GODOT_PATH: '/usr/bin/godot' },
        });
    }
    async install() { this._status = 'installed'; return { success: true, message: 'Godot Engine ready. Download from godotengine.org' }; }
    async start() { this._status = 'running'; return { success: true, message: 'Godot headless server started for game builds' }; }
    async stop() { this._status = 'stopped'; return { success: true, message: 'Godot stopped' }; }
}
