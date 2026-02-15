/**
 * Engine Alto — Memory Fabric
 * Every agent has its own memory store.
 * Memory passes between agents as needed.
 * Consolidated at update time into central system.
 */

export interface MemoryEntry {
  key: string;
  value: any;
  source: string;
  createdAt: Date;
  updatedAt: Date;
  accessCount: number;
  tags: string[];
}

export class MemoryFabric {
  private stores: Map<string, Map<string, MemoryEntry>> = new Map();
  private centralMemory: Map<string, MemoryEntry> = new Map();

  /**
   * Get or create a memory store for an agent
   */
  getStore(agentId: string): Map<string, MemoryEntry> {
    if (!this.stores.has(agentId)) {
      this.stores.set(agentId, new Map());
    }
    return this.stores.get(agentId)!;
  }

  /**
   * Store a memory for an agent
   */
  store(agentId: string, key: string, value: any, tags: string[] = []): void {
    const agentStore = this.getStore(agentId);
    const existing = agentStore.get(key);

    if (existing) {
      existing.value = value;
      existing.updatedAt = new Date();
      existing.accessCount++;
    } else {
      agentStore.set(key, {
        key, value, source: agentId,
        createdAt: new Date(), updatedAt: new Date(),
        accessCount: 0, tags,
      });
    }
  }

  /**
   * Recall a memory
   */
  recall(agentId: string, key: string): any {
    const agentStore = this.stores.get(agentId);
    if (!agentStore) return undefined;

    const entry = agentStore.get(key);
    if (entry) {
      entry.accessCount++;
      return entry.value;
    }
    return undefined;
  }

  /**
   * Share memory between agents
   */
  share(fromAgentId: string, toAgentId: string, key: string): boolean {
    const fromStore = this.stores.get(fromAgentId);
    if (!fromStore) return false;

    const entry = fromStore.get(key);
    if (!entry) return false;

    const toStore = this.getStore(toAgentId);
    toStore.set(key, { ...entry, source: `${fromAgentId}→${toAgentId}`, updatedAt: new Date() });
    return true;
  }

  /**
   * Consolidate all agent memories into central memory (for updates)
   */
  consolidate(): Record<string, any> {
    let totalEntries = 0;

    this.stores.forEach((agentStore, agentId) => {
      agentStore.forEach((entry, key) => {
        const centralKey = `${agentId}:${key}`;
        this.centralMemory.set(centralKey, { ...entry });
        totalEntries++;
      });
    });

    return {
      consolidated: true,
      agentStores: this.stores.size,
      totalEntries,
      centralMemorySize: this.centralMemory.size,
      timestamp: new Date(),
    };
  }

  /**
   * Search memories by tag
   */
  searchByTag(tag: string): MemoryEntry[] {
    const results: MemoryEntry[] = [];
    this.stores.forEach(store => {
      store.forEach(entry => {
        if (entry.tags.includes(tag)) results.push(entry);
      });
    });
    return results;
  }

  /**
   * Get full status
   */
  getStatus() {
    const agentMemories: Record<string, number> = {};
    this.stores.forEach((store, agentId) => {
      agentMemories[agentId] = store.size;
    });

    return {
      totalAgents: this.stores.size,
      totalEntries: Array.from(this.stores.values()).reduce((s, store) => s + store.size, 0),
      centralMemorySize: this.centralMemory.size,
      agentMemories,
    };
  }
}

export const memoryFabric = new MemoryFabric();
