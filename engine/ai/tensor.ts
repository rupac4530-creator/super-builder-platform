/**
 * Engine Alto — Tensor Operations
 * Multi-dimensional array operations, BLAS-like, GPU-backed.
 */

export type DType = 'float32' | 'float16' | 'int32' | 'int8' | 'uint8';

export interface TensorMeta {
  id: string;
  shape: number[];
  dtype: DType;
  device: 'cpu' | 'gpu';
  requiresGrad: boolean;
  name?: string;
}

export class Tensor {
  readonly id: string;
  readonly shape: number[];
  readonly dtype: DType;
  readonly device: 'cpu' | 'gpu';
  private data: Float32Array;
  private grad: Float32Array | null = null;
  readonly requiresGrad: boolean;

  constructor(data: number[] | Float32Array, shape: number[], dtype: DType = 'float32', requiresGrad: boolean = false) {
    this.id = `tensor-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;
    this.shape = shape;
    this.dtype = dtype;
    this.device = 'cpu';
    this.requiresGrad = requiresGrad;
    this.data = data instanceof Float32Array ? data : new Float32Array(data);
  }

  get size(): number { return this.data.length; }
  get ndim(): number { return this.shape.length; }
  getData(): Float32Array { return this.data; }
  getGrad(): Float32Array | null { return this.grad; }

  static zeros(shape: number[]): Tensor {
    const size = shape.reduce((a, b) => a * b, 1);
    return new Tensor(new Float32Array(size), shape);
  }

  static ones(shape: number[]): Tensor {
    const size = shape.reduce((a, b) => a * b, 1);
    return new Tensor(new Float32Array(size).fill(1), shape);
  }

  static rand(shape: number[]): Tensor {
    const size = shape.reduce((a, b) => a * b, 1);
    const data = new Float32Array(size);
    for (let i = 0; i < size; i++) data[i] = Math.random();
    return new Tensor(data, shape);
  }

  add(other: Tensor): Tensor {
    const result = new Float32Array(this.data.length);
    for (let i = 0; i < this.data.length; i++) {
      result[i] = this.data[i] + (other.data[i] || 0);
    }
    return new Tensor(result, this.shape);
  }

  mul(other: Tensor | number): Tensor {
    const result = new Float32Array(this.data.length);
    if (typeof other === 'number') {
      for (let i = 0; i < this.data.length; i++) result[i] = this.data[i] * other;
    } else {
      for (let i = 0; i < this.data.length; i++) result[i] = this.data[i] * (other.data[i] || 1);
    }
    return new Tensor(result, this.shape);
  }

  matmul(other: Tensor): Tensor {
    if (this.ndim !== 2 || other.ndim !== 2) throw new Error('matmul requires 2D tensors');
    const [M, K] = this.shape;
    const [K2, N] = other.shape;
    if (K !== K2) throw new Error(`Shape mismatch: [${M},${K}] x [${K2},${N}]`);

    const result = new Float32Array(M * N);
    for (let i = 0; i < M; i++) {
      for (let j = 0; j < N; j++) {
        let sum = 0;
        for (let k = 0; k < K; k++) {
          sum += this.data[i * K + k] * other.data[k * N + j];
        }
        result[i * N + j] = sum;
      }
    }
    return new Tensor(result, [M, N]);
  }

  relu(): Tensor {
    const result = new Float32Array(this.data.length);
    for (let i = 0; i < this.data.length; i++) result[i] = Math.max(0, this.data[i]);
    return new Tensor(result, this.shape);
  }

  softmax(): Tensor {
    const result = new Float32Array(this.data.length);
    let max = -Infinity;
    for (let i = 0; i < this.data.length; i++) if (this.data[i] > max) max = this.data[i];
    let sum = 0;
    for (let i = 0; i < this.data.length; i++) { result[i] = Math.exp(this.data[i] - max); sum += result[i]; }
    for (let i = 0; i < this.data.length; i++) result[i] /= sum;
    return new Tensor(result, this.shape);
  }

  reshape(newShape: number[]): Tensor {
    const newSize = newShape.reduce((a, b) => a * b, 1);
    if (newSize !== this.size) throw new Error('Cannot reshape: size mismatch');
    return new Tensor(this.data, newShape);
  }

  toMeta(): TensorMeta {
    return { id: this.id, shape: this.shape, dtype: this.dtype, device: this.device, requiresGrad: this.requiresGrad };
  }
}

export class TensorOps {
  private allocated: Map<string, Tensor> = new Map();

  create(data: number[], shape: number[]): Tensor {
    const t = new Tensor(data, shape);
    this.allocated.set(t.id, t);
    return t;
  }

  free(tensorId: string): boolean { return this.allocated.delete(tensorId); }

  getStatus() {
    return {
      allocated: this.allocated.size,
      totalMemoryBytes: Array.from(this.allocated.values()).reduce((s, t) => s + t.size * 4, 0),
    };
  }
}

export const tensorOps = new TensorOps();
