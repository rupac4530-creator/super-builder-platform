/**
 * Engine Alto — Platformer Game Template
 * Demonstrates ECS pattern, physics, input, and rendering
 */

// ===== ECS Core =====
interface Component { type: string; }

interface Entity {
  id: number;
  components: Map<string, Component>;
}

class World {
  private entities: Map<number, Entity> = new Map();
  private systems: System[] = [];
  private nextId = 1;

  createEntity(): Entity {
    const entity: Entity = { id: this.nextId++, components: new Map() };
    this.entities.set(entity.id, entity);
    return entity;
  }

  addComponent(entityId: number, component: Component): void {
    this.entities.get(entityId)?.components.set(component.type, component);
  }

  getComponent<T extends Component>(entityId: number, type: string): T | undefined {
    return this.entities.get(entityId)?.components.get(type) as T | undefined;
  }

  query(componentTypes: string[]): Entity[] {
    return Array.from(this.entities.values())
      .filter(e => componentTypes.every(type => e.components.has(type)));
  }

  addSystem(system: System): void { this.systems.push(system); }

  update(dt: number): void {
    for (const system of this.systems) {
      system.update(this, dt);
    }
  }
}

interface System {
  update(world: World, dt: number): void;
}

// ===== Components =====
interface Position extends Component { type: 'position'; x: number; y: number; }
interface Velocity extends Component { type: 'velocity'; vx: number; vy: number; }
interface Sprite extends Component { type: 'sprite'; color: string; width: number; height: number; }
interface Player extends Component { type: 'player'; speed: number; jumpForce: number; grounded: boolean; }
interface Collider extends Component { type: 'collider'; width: number; height: number; solid: boolean; }

// ===== Systems =====
class PhysicsSystem implements System {
  private gravity = 980;
  
  update(world: World, dt: number): void {
    const entities = world.query(['position', 'velocity']);
    for (const entity of entities) {
      const pos = world.getComponent<Position>(entity.id, 'position')!;
      const vel = world.getComponent<Velocity>(entity.id, 'velocity')!;
      
      // Apply gravity
      vel.vy += this.gravity * dt;
      
      // Integrate
      pos.x += vel.vx * dt;
      pos.y += vel.vy * dt;

      // Floor collision
      if (pos.y > 500) {
        pos.y = 500;
        vel.vy = 0;
        const player = world.getComponent<Player>(entity.id, 'player');
        if (player) player.grounded = true;
      }
    }
  }
}

class InputSystem implements System {
  private keys = new Set<string>();

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', e => this.keys.add(e.key));
      window.addEventListener('keyup', e => this.keys.delete(e.key));
    }
  }

  update(world: World, dt: number): void {
    const players = world.query(['player', 'velocity']);
    for (const entity of players) {
      const player = world.getComponent<Player>(entity.id, 'player')!;
      const vel = world.getComponent<Velocity>(entity.id, 'velocity')!;

      vel.vx = 0;
      if (this.keys.has('ArrowLeft') || this.keys.has('a')) vel.vx = -player.speed;
      if (this.keys.has('ArrowRight') || this.keys.has('d')) vel.vx = player.speed;
      if ((this.keys.has('ArrowUp') || this.keys.has('w') || this.keys.has(' ')) && player.grounded) {
        vel.vy = -player.jumpForce;
        player.grounded = false;
      }
    }
  }
}

class RenderSystem implements System {
  private ctx: CanvasRenderingContext2D | null = null;

  constructor(canvas?: HTMLCanvasElement) {
    if (canvas) this.ctx = canvas.getContext('2d');
  }

  update(world: World, dt: number): void {
    if (!this.ctx) return;
    const { width, height } = this.ctx.canvas;
    
    // Clear
    this.ctx.fillStyle = '#0a0a1a';
    this.ctx.fillRect(0, 0, width, height);
    
    // Draw entities
    const sprites = world.query(['position', 'sprite']);
    for (const entity of sprites) {
      const pos = world.getComponent<Position>(entity.id, 'position')!;
      const sprite = world.getComponent<Sprite>(entity.id, 'sprite')!;
      
      this.ctx.fillStyle = sprite.color;
      this.ctx.fillRect(pos.x, pos.y, sprite.width, sprite.height);
    }

    // Draw ground
    this.ctx.fillStyle = '#2a2a45';
    this.ctx.fillRect(0, 540, width, 60);
  }
}

// ===== Game Setup =====
function createGame(canvas?: HTMLCanvasElement) {
  const world = new World();

  // Add systems
  world.addSystem(new InputSystem());
  world.addSystem(new PhysicsSystem());
  world.addSystem(new RenderSystem(canvas));

  // Create player
  const player = world.createEntity();
  world.addComponent(player.id, { type: 'position', x: 100, y: 400 } as Position);
  world.addComponent(player.id, { type: 'velocity', vx: 0, vy: 0 } as Velocity);
  world.addComponent(player.id, { type: 'sprite', color: '#6366f1', width: 40, height: 50 } as Sprite);
  world.addComponent(player.id, { type: 'player', speed: 300, jumpForce: 600, grounded: false } as Player);
  world.addComponent(player.id, { type: 'collider', width: 40, height: 50, solid: true } as Collider);

  // Create platforms
  for (let i = 0; i < 5; i++) {
    const platform = world.createEntity();
    world.addComponent(platform.id, { type: 'position', x: 100 + i * 200, y: 400 - i * 60 } as Position);
    world.addComponent(platform.id, { type: 'velocity', vx: 0, vy: 0 } as Velocity);
    world.addComponent(platform.id, { type: 'sprite', color: '#8b5cf6', width: 120, height: 16 } as Sprite);
  }

  // Create collectibles
  for (let i = 0; i < 3; i++) {
    const coin = world.createEntity();
    world.addComponent(coin.id, { type: 'position', x: 200 + i * 250, y: 350 - i * 60 } as Position);
    world.addComponent(coin.id, { type: 'velocity', vx: 0, vy: 0 } as Velocity);
    world.addComponent(coin.id, { type: 'sprite', color: '#f59e0b', width: 20, height: 20 } as Sprite);
  }

  // Game loop
  let lastTime = Date.now();
  function loop() {
    const now = Date.now();
    const dt = Math.min((now - lastTime) / 1000, 0.05);
    lastTime = now;

    world.update(dt);
    requestAnimationFrame(loop);
  }

  if (typeof window !== 'undefined') {
    loop();
  }

  return world;
}

export { createGame, World };
