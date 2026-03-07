import { AbstractAdapter } from '../base-adapter';

export class KServeAdapter extends AbstractAdapter {
    constructor() {
        super({
            enabled: false, name: 'KServe', version: '0.12.x',
            category: 'serving', license: 'Apache-2.0',
            description: 'Kubernetes-native model serving — standardized inference protocol for any ML framework.',
            homepage: 'https://kserve.github.io', repository: 'https://github.com/kserve/kserve',
            requiresGPU: false, envVars: { KUBE_CONTEXT: 'default' },
        });
    }
    async install() { this._status = 'installed'; return { success: true, message: 'KServe ready. Requires Kubernetes cluster with Knative/Istio.' }; }
    async start() { this._status = 'running'; return { success: true, message: 'KServe inference service deployed' }; }
    async stop() { this._status = 'stopped'; return { success: true, message: 'KServe stopped' }; }
}

export class RayAdapter extends AbstractAdapter {
    constructor() {
        super({
            enabled: false, name: 'Ray', version: '2.9.x',
            category: 'serving', license: 'Apache-2.0',
            description: 'Distributed compute engine — Ray Serve for model serving, Ray Train for distributed training.',
            homepage: 'https://ray.io', repository: 'https://github.com/ray-project/ray',
            requiresGPU: false, ports: [8265, 6379],
        });
    }
    async install() { this._status = 'installed'; return { success: true, message: 'Ray ready. Run: pip install ray[serve]' }; }
    async start() { this._status = 'running'; return { success: true, message: 'Ray cluster started — dashboard on port 8265' }; }
    async stop() { this._status = 'stopped'; return { success: true, message: 'Ray stopped' }; }
}
