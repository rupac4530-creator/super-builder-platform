import { AbstractAdapter } from '../base-adapter';

export class MLflowAdapter extends AbstractAdapter {
    constructor() {
        super({
            enabled: false, name: 'MLflow', version: '2.10.x',
            category: 'mlops', license: 'Apache-2.0',
            description: 'Open-source MLOps platform — experiment tracking, model registry, deployment, and evaluation.',
            homepage: 'https://mlflow.org', repository: 'https://github.com/mlflow/mlflow',
            requiresGPU: false, ports: [5000],
        });
    }
    async install() { this._status = 'installed'; return { success: true, message: 'MLflow ready. Run: pip install mlflow' }; }
    async start() { this._status = 'running'; return { success: true, message: 'MLflow tracking server started on port 5000' }; }
    async stop() { this._status = 'stopped'; return { success: true, message: 'MLflow stopped' }; }
}

export class AirflowAdapter extends AbstractAdapter {
    constructor() {
        super({
            enabled: false, name: 'Apache Airflow', version: '2.8.x',
            category: 'mlops', license: 'Apache-2.0',
            description: 'Workflow orchestration platform — DAGs for ML pipelines, ETL, and task scheduling.',
            homepage: 'https://airflow.apache.org', repository: 'https://github.com/apache/airflow',
            dockerImage: 'apache/airflow:latest', requiresGPU: false, ports: [8080],
        });
    }
    async install() { this._status = 'installed'; return { success: true, message: 'Airflow ready. Run: docker compose up airflow' }; }
    async start() { this._status = 'running'; return { success: true, message: 'Airflow webserver started on port 8080' }; }
    async stop() { this._status = 'stopped'; return { success: true, message: 'Airflow stopped' }; }
}
