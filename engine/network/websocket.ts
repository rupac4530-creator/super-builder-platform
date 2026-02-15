/**
 * Engine Alto — WebSocket Manager
 * Real-time bidirectional communication: rooms, pub/sub, heartbeat, reconnect.
 */

export interface WSConnection {
  id: string;
  url: string;
  status: 'connecting' | 'open' | 'closing' | 'closed' | 'reconnecting';
  rooms: string[];
  lastPing: Date;
  messageCount: number;
  reconnectAttempts: number;
}

export interface WSMessage {
  type: string;
  channel?: string;
  data: any;
  timestamp: Date;
  from: string;
}

export class WebSocketManager {
  private connections: Map<string, WSConnection> = new Map();
  private rooms: Map<string, Set<string>> = new Map();
  private subscribers: Map<string, Array<(msg: WSMessage) => void>> = new Map();
  private heartbeatInterval: number = 30000;
  private maxReconnectAttempts: number = 10;
  private messageLog: WSMessage[] = [];
  private maxLogSize: number = 1000;

  connect(url: string): string {
    const id = `ws-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;
    this.connections.set(id, {
      id, url, status: 'connecting', rooms: [],
      lastPing: new Date(), messageCount: 0, reconnectAttempts: 0,
    });
    // Simulated connection (real: new WebSocket(url))
    setTimeout(() => {
      const conn = this.connections.get(id);
      if (conn) conn.status = 'open';
    }, 100);
    return id;
  }

  disconnect(connectionId: string): boolean {
    const conn = this.connections.get(connectionId);
    if (!conn) return false;
    conn.status = 'closed';
    // Leave all rooms
    for (const room of conn.rooms) {
      this.rooms.get(room)?.delete(connectionId);
    }
    this.connections.delete(connectionId);
    return true;
  }

  send(connectionId: string, type: string, data: any): boolean {
    const conn = this.connections.get(connectionId);
    if (!conn || conn.status !== 'open') return false;
    conn.messageCount++;
    const msg: WSMessage = { type, data, timestamp: new Date(), from: connectionId };
    this.logMessage(msg);
    return true;
  }

  joinRoom(connectionId: string, room: string): boolean {
    const conn = this.connections.get(connectionId);
    if (!conn) return false;
    if (!this.rooms.has(room)) this.rooms.set(room, new Set());
    this.rooms.get(room)!.add(connectionId);
    conn.rooms.push(room);
    return true;
  }

  leaveRoom(connectionId: string, room: string): boolean {
    this.rooms.get(room)?.delete(connectionId);
    const conn = this.connections.get(connectionId);
    if (conn) conn.rooms = conn.rooms.filter(r => r !== room);
    return true;
  }

  broadcast(room: string, type: string, data: any): number {
    const members = this.rooms.get(room);
    if (!members) return 0;
    let sent = 0;
    for (const connId of members) {
      if (this.send(connId, type, data)) sent++;
    }
    return sent;
  }

  subscribe(channel: string, handler: (msg: WSMessage) => void): void {
    if (!this.subscribers.has(channel)) this.subscribers.set(channel, []);
    this.subscribers.get(channel)!.push(handler);
  }

  publish(channel: string, data: any): void {
    const handlers = this.subscribers.get(channel) || [];
    const msg: WSMessage = { type: 'publish', channel, data, timestamp: new Date(), from: 'system' };
    for (const handler of handlers) {
      try { handler(msg); } catch { /* */ }
    }
  }

  private logMessage(msg: WSMessage): void {
    this.messageLog.push(msg);
    if (this.messageLog.length > this.maxLogSize) {
      this.messageLog = this.messageLog.slice(-Math.round(this.maxLogSize * 0.8));
    }
  }

  getStatus() {
    const conns = Array.from(this.connections.values());
    return {
      connections: conns.length,
      open: conns.filter(c => c.status === 'open').length,
      rooms: this.rooms.size,
      channels: this.subscribers.size,
      totalMessages: conns.reduce((s, c) => s + c.messageCount, 0),
      logSize: this.messageLog.length,
    };
  }
}

export const wsManager = new WebSocketManager();
