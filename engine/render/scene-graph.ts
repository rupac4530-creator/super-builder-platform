/**
 * Engine Alto — Scene Graph
 * Hierarchical scene tree: entities, transforms, components, parent-child.
 */

export interface Transform {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
}

export interface Component {
  type: string;
  data: Record<string, any>;
}

export interface SceneNode {
  id: string;
  name: string;
  transform: Transform;
  components: Component[];
  children: string[];
  parent: string | null;
  visible: boolean;
  tags: string[];
}

export class SceneGraph {
  private nodes: Map<string, SceneNode> = new Map();
  private rootId: string;

  constructor() {
    this.rootId = this.createNode('Root');
  }

  createNode(name: string, parentId?: string): string {
    const id = `node-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const node: SceneNode = {
      id, name,
      transform: { position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
      components: [], children: [],
      parent: parentId || null, visible: true, tags: [],
    };
    this.nodes.set(id, node);

    if (parentId) {
      const parent = this.nodes.get(parentId);
      if (parent) parent.children.push(id);
    }
    return id;
  }

  removeNode(id: string): boolean {
    const node = this.nodes.get(id);
    if (!node || id === this.rootId) return false;

    // Reparent children to deleted node's parent
    for (const childId of node.children) {
      const child = this.nodes.get(childId);
      if (child) child.parent = node.parent;
      if (node.parent) {
        const parent = this.nodes.get(node.parent);
        if (parent) parent.children.push(childId);
      }
    }

    // Remove from parent's children
    if (node.parent) {
      const parent = this.nodes.get(node.parent);
      if (parent) parent.children = parent.children.filter(c => c !== id);
    }

    this.nodes.delete(id);
    return true;
  }

  setTransform(id: string, transform: Partial<Transform>): boolean {
    const node = this.nodes.get(id);
    if (!node) return false;
    if (transform.position) node.transform.position = transform.position;
    if (transform.rotation) node.transform.rotation = transform.rotation;
    if (transform.scale) node.transform.scale = transform.scale;
    return true;
  }

  addComponent(nodeId: string, type: string, data: Record<string, any> = {}): boolean {
    const node = this.nodes.get(nodeId);
    if (!node) return false;
    node.components.push({ type, data });
    return true;
  }

  removeComponent(nodeId: string, type: string): boolean {
    const node = this.nodes.get(nodeId);
    if (!node) return false;
    node.components = node.components.filter(c => c.type !== type);
    return true;
  }

  findByTag(tag: string): SceneNode[] {
    return Array.from(this.nodes.values()).filter(n => n.tags.includes(tag));
  }

  findByName(name: string): SceneNode | undefined {
    return Array.from(this.nodes.values()).find(n => n.name === name);
  }

  getNode(id: string): SceneNode | undefined { return this.nodes.get(id); }
  getRoot(): string { return this.rootId; }

  traverse(nodeId: string, callback: (node: SceneNode, depth: number) => void, depth: number = 0): void {
    const node = this.nodes.get(nodeId);
    if (!node) return;
    callback(node, depth);
    for (const childId of node.children) {
      this.traverse(childId, callback, depth + 1);
    }
  }

  getWorldTransform(nodeId: string): Transform {
    const chain: Transform[] = [];
    let current = nodeId;
    while (current) {
      const node = this.nodes.get(current);
      if (!node) break;
      chain.unshift(node.transform);
      current = node.parent || '';
    }
    // Simple accumulation (real: matrix multiplication)
    const result: Transform = { position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] };
    for (const t of chain) {
      result.position[0] += t.position[0];
      result.position[1] += t.position[1];
      result.position[2] += t.position[2];
      result.rotation[0] += t.rotation[0];
      result.rotation[1] += t.rotation[1];
      result.rotation[2] += t.rotation[2];
      result.scale[0] *= t.scale[0];
      result.scale[1] *= t.scale[1];
      result.scale[2] *= t.scale[2];
    }
    return result;
  }

  getStatus() {
    return {
      totalNodes: this.nodes.size,
      visible: Array.from(this.nodes.values()).filter(n => n.visible).length,
      components: Array.from(this.nodes.values()).reduce((s, n) => s + n.components.length, 0),
      rootId: this.rootId,
    };
  }
}

export const sceneGraph = new SceneGraph();
