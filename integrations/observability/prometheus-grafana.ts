import { AbstractAdapter } from '../base-adapter';

export class PrometheusGrafanaAdapter extends AbstractAdapter {
    constructor() {
        super({
            enabled: false, name: 'Prometheus + Grafana', version: '2.49 / 10.x',
            category: 'observability', license: 'Apache-2.0',
            description: 'Monitoring stack — Prometheus for metrics collection and alerting, Grafana for dashboards.',
            homepage: 'https://prometheus.io', repository: 'https://github.com/prometheus/prometheus',
            dockerImage: 'prom/prometheus:latest', requiresGPU: false, ports: [9090, 3000],
        });
    }
    async install() { this._status = 'installed'; return { success: true, message: 'Prometheus + Grafana ready. Run: docker compose up prometheus grafana' }; }
    async start() { this._status = 'running'; return { success: true, message: 'Prometheus (9090) + Grafana (3000) started' }; }
    async stop() { this._status = 'stopped'; return { success: true, message: 'Observability stack stopped' }; }
}
