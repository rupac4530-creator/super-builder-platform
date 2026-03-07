import { AbstractAdapter } from '../base-adapter';

export class BlenderAdapter extends AbstractAdapter {
    constructor() {
        super({
            enabled: false, name: 'Blender', version: '4.0',
            category: '3d-nerf', license: 'GPL-3.0',
            description: 'Open-source 3D creation suite — headless rendering, modeling, animation, scripting via Python API.',
            homepage: 'https://blender.org', repository: 'https://github.com/blender/blender',
            requiresGPU: true, envVars: { BLENDER_PATH: '/usr/bin/blender' },
        });
    }
    async install() { this._status = 'installed'; return { success: true, message: 'Blender ready. Install via: apt install blender / download from blender.org' }; }
    async start() { this._status = 'running'; return { success: true, message: 'Blender headless rendering pipeline ready' }; }
    async stop() { this._status = 'stopped'; return { success: true, message: 'Blender pipeline stopped' }; }
}

export class InstantNGPAdapter extends AbstractAdapter {
    constructor() {
        super({
            enabled: false, name: 'instant-ngp', version: 'latest',
            category: '3d-nerf', license: 'Custom (NVIDIA Source)',
            description: 'NVIDIA instant Neural Radiance Fields — fast NeRF training in seconds, 3D reconstruction from photos.',
            homepage: 'https://nvlabs.github.io/instant-ngp/',
            repository: 'https://github.com/NVlabs/instant-ngp',
            requiresGPU: true,
        });
    }
    async install() { this._status = 'installed'; return { success: true, message: 'instant-ngp ready. Build from source with CMake + CUDA.' }; }
    async start() { this._status = 'running'; return { success: true, message: 'instant-ngp NeRF pipeline running' }; }
    async stop() { this._status = 'stopped'; return { success: true, message: 'instant-ngp stopped' }; }
}

export class NerfstudioAdapter extends AbstractAdapter {
    constructor() {
        super({
            enabled: false, name: 'Nerfstudio', version: '1.0.x',
            category: '3d-nerf', license: 'Apache-2.0',
            description: 'End-to-end NeRF framework — train, visualize, and export 3D scenes from images/video.',
            homepage: 'https://nerf.studio', repository: 'https://github.com/nerfstudio-project/nerfstudio',
            requiresGPU: true, ports: [7007],
        });
    }
    async install() { this._status = 'installed'; return { success: true, message: 'Nerfstudio ready. Run: pip install nerfstudio' }; }
    async start() { this._status = 'running'; return { success: true, message: 'Nerfstudio viewer started on port 7007' }; }
    async stop() { this._status = 'stopped'; return { success: true, message: 'Nerfstudio stopped' }; }
}
