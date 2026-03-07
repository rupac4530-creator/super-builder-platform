import { AbstractAdapter } from '../base-adapter';

export class FAISSAdapter extends AbstractAdapter {
    constructor() {
        super({
            enabled: false, name: 'FAISS', version: '1.7.x',
            category: 'vector-db', license: 'MIT',
            description: 'Facebook AI Similarity Search — fast nearest-neighbor search for embeddings.',
            homepage: 'https://faiss.ai', repository: 'https://github.com/facebookresearch/faiss',
            requiresGPU: false,
        });
    }
    async install() { this._status = 'installed'; return { success: true, message: 'FAISS ready. Run: pip install faiss-cpu (or faiss-gpu)' }; }
    async start() { this._status = 'running'; return { success: true, message: 'FAISS vector index loaded' }; }
    async stop() { this._status = 'stopped'; return { success: true, message: 'FAISS index unloaded' }; }
}

export class MilvusAdapter extends AbstractAdapter {
    constructor() {
        super({
            enabled: false, name: 'Milvus', version: '2.3.x',
            category: 'vector-db', license: 'Apache-2.0',
            description: 'Scalable open-source vector database for production-grade RAG & similarity search.',
            homepage: 'https://milvus.io', repository: 'https://github.com/milvus-io/milvus',
            dockerImage: 'milvusdb/milvus:latest', requiresGPU: false, ports: [19530, 9091],
        });
    }
    async install() { this._status = 'installed'; return { success: true, message: 'Milvus ready. Run: docker compose up milvus' }; }
    async start() { this._status = 'running'; return { success: true, message: 'Milvus vector DB started on port 19530' }; }
    async stop() { this._status = 'stopped'; return { success: true, message: 'Milvus stopped' }; }
}

export class WeaviateAdapter extends AbstractAdapter {
    constructor() {
        super({
            enabled: false, name: 'Weaviate', version: '1.23.x',
            category: 'vector-db', license: 'BSD-3-Clause',
            description: 'AI-native vector database with built-in vectorization modules & semantic search.',
            homepage: 'https://weaviate.io', repository: 'https://github.com/weaviate/weaviate',
            dockerImage: 'cr.weaviate.io/semitechnologies/weaviate:latest', requiresGPU: false, ports: [8080, 50051],
        });
    }
    async install() { this._status = 'installed'; return { success: true, message: 'Weaviate ready. Run: docker compose up weaviate' }; }
    async start() { this._status = 'running'; return { success: true, message: 'Weaviate started on port 8080' }; }
    async stop() { this._status = 'stopped'; return { success: true, message: 'Weaviate stopped' }; }
}

export class ChromaAdapter extends AbstractAdapter {
    constructor() {
        super({
            enabled: false, name: 'Chroma', version: '0.4.x',
            category: 'vector-db', license: 'Apache-2.0',
            description: 'Developer-friendly open-source embedding database for AI applications.',
            homepage: 'https://trychroma.com', repository: 'https://github.com/chroma-core/chroma',
            dockerImage: 'chromadb/chroma:latest', requiresGPU: false, ports: [8000],
        });
    }
    async install() { this._status = 'installed'; return { success: true, message: 'Chroma ready. Run: pip install chromadb' }; }
    async start() { this._status = 'running'; return { success: true, message: 'Chroma DB started on port 8000' }; }
    async stop() { this._status = 'stopped'; return { success: true, message: 'Chroma stopped' }; }
}
