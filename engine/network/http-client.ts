/**
 * Engine Alto — HTTP Client
 * High-performance HTTP with connection pooling, retries, caching.
 */

export interface HTTPRequest {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
  url: string;
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  retries?: number;
}

export interface HTTPResponse {
  status: number;
  headers: Record<string, string>;
  body: any;
  durationMs: number;
  cached: boolean;
  retryCount: number;
}

export interface ConnectionPool {
  maxConnections: number;
  activeConnections: number;
  idleConnections: number;
  totalRequests: number;
}

export class HTTPClient {
  private cache: Map<string, { response: HTTPResponse; expires: Date }> = new Map();
  private pool: ConnectionPool = { maxConnections: 64, activeConnections: 0, idleConnections: 16, totalRequests: 0 };
  private interceptors: Array<(req: HTTPRequest) => HTTPRequest> = [];
  private metrics = { totalRequests: 0, totalErrors: 0, avgDurationMs: 0, cacheHits: 0 };
  private defaultTimeout = 30000;
  private defaultRetries = 3;

  addInterceptor(fn: (req: HTTPRequest) => HTTPRequest): void {
    this.interceptors.push(fn);
  }

  async request(req: HTTPRequest): Promise<HTTPResponse> {
    // Apply interceptors
    let processed = req;
    for (const interceptor of this.interceptors) {
      processed = interceptor(processed);
    }

    // Check cache for GET
    if (processed.method === 'GET') {
      const cacheKey = processed.url;
      const cached = this.cache.get(cacheKey);
      if (cached && cached.expires > new Date()) {
        this.metrics.cacheHits++;
        return { ...cached.response, cached: true };
      }
    }

    const timeout = processed.timeout || this.defaultTimeout;
    const maxRetries = processed.retries ?? this.defaultRetries;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      this.pool.activeConnections++;
      this.pool.totalRequests++;
      this.metrics.totalRequests++;
      const start = Date.now();

      try {
        // Use Node's built-in fetch or http
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeout);

        const fetchOptions: RequestInit = {
          method: processed.method,
          headers: processed.headers,
          body: processed.body ? JSON.stringify(processed.body) : undefined,
          signal: controller.signal,
        };

        const res = await fetch(processed.url, fetchOptions);
        clearTimeout(timer);

        const body = await res.text();
        let parsedBody: any;
        try { parsedBody = JSON.parse(body); } catch { parsedBody = body; }

        const response: HTTPResponse = {
          status: res.status, headers: Object.fromEntries(res.headers.entries()),
          body: parsedBody, durationMs: Date.now() - start, cached: false, retryCount: attempt,
        };

        // Cache successful GETs
        if (processed.method === 'GET' && res.status === 200) {
          const cacheControl = res.headers.get('cache-control');
          const maxAge = cacheControl?.match(/max-age=(\d+)/)?.[1];
          if (maxAge) {
            this.cache.set(processed.url, {
              response, expires: new Date(Date.now() + parseInt(maxAge) * 1000),
            });
          }
        }

        this.updateAvgDuration(response.durationMs);
        return response;
      } catch (err: any) {
        lastError = err;
        this.metrics.totalErrors++;
        // Exponential backoff
        if (attempt < maxRetries) {
          await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 100));
        }
      } finally {
        this.pool.activeConnections--;
      }
    }

    throw lastError || new Error('Request failed');
  }

  async get(url: string, headers?: Record<string, string>): Promise<HTTPResponse> {
    return this.request({ method: 'GET', url, headers });
  }

  async post(url: string, body: any, headers?: Record<string, string>): Promise<HTTPResponse> {
    return this.request({ method: 'POST', url, body, headers });
  }

  private updateAvgDuration(ms: number): void {
    const total = this.metrics.totalRequests;
    this.metrics.avgDurationMs = (this.metrics.avgDurationMs * (total - 1) + ms) / total;
  }

  clearCache(): void { this.cache.clear(); }

  getStatus() {
    return {
      pool: { ...this.pool },
      metrics: { ...this.metrics },
      cacheSize: this.cache.size,
      interceptors: this.interceptors.length,
    };
  }
}

export const httpClient = new HTTPClient();
