/**
 * Engine Alto — AAA Game Auto-Factory
 * Generates full game projects for Unity, Godot, and Unreal.
 */
import * as fs from 'fs';
import * as path from 'path';

export type GameEngine = 'unity' | 'godot' | 'unreal' | 'web';
export type GameGenre = 'platformer' | 'rpg' | 'fps' | 'puzzle' | 'racing' | 'strategy' | 'sandbox' | 'horror' | 'visual-novel';

export interface GameProject {
  id: string;
  name: string;
  engine: GameEngine;
  genre: GameGenre;
  description: string;
  features: string[];
  outputPath: string;
  files: string[];
}

export interface GameRequest {
  name: string;
  engine: GameEngine;
  genre: GameGenre;
  description?: string;
  features?: string[];
  multiplayer?: boolean;
  aiNPCs?: boolean;
  proceduralGeneration?: boolean;
}

export class GameFactory {
  private outputDir: string;
  private counter = 0;

  constructor(outputDir = 'data/games') {
    this.outputDir = outputDir;
    fs.mkdirSync(outputDir, { recursive: true });
  }

  async createProject(req: GameRequest): Promise<GameProject> {
    const id = `game_${++this.counter}_${Date.now()}`;
    const dir = path.join(this.outputDir, id);
    const files: string[] = [];

    switch (req.engine) {
      case 'unity': files.push(...this.generateUnity(dir, req)); break;
      case 'godot': files.push(...this.generateGodot(dir, req)); break;
      case 'unreal': files.push(...this.generateUnreal(dir, req)); break;
      case 'web': files.push(...this.generateWeb(dir, req)); break;
    }

    return {
      id, name: req.name, engine: req.engine, genre: req.genre,
      description: req.description || `${req.genre} game built with ${req.engine}`,
      features: req.features || this.defaultFeatures(req.genre),
      outputPath: dir, files,
    };
  }

  private generateUnity(dir: string, req: GameRequest): string[] {
    const files: string[] = [];
    const assetsDir = path.join(dir, 'Assets', 'Scripts');
    fs.mkdirSync(assetsDir, { recursive: true });

    // Game Manager
    this.write(path.join(assetsDir, 'GameManager.cs'), `using UnityEngine;\n\npublic class GameManager : MonoBehaviour {\n    public static GameManager Instance;\n    public string gameName = "${req.name}";\n    public int score = 0;\n    \n    void Awake() {\n        if (Instance == null) { Instance = this; DontDestroyOnLoad(gameObject); }\n        else Destroy(gameObject);\n    }\n    \n    void Start() { Debug.Log($"[Alto] {gameName} initialized — genre: ${req.genre}"); }\n    \n    public void AddScore(int points) { score += points; }\n}\n`);
    files.push('Assets/Scripts/GameManager.cs');

    // Player Controller
    this.write(path.join(assetsDir, 'PlayerController.cs'), `using UnityEngine;\n\npublic class PlayerController : MonoBehaviour {\n    public float moveSpeed = 5f;\n    public float jumpForce = 8f;\n    private Rigidbody rb;\n    \n    void Start() { rb = GetComponent<Rigidbody>(); }\n    \n    void Update() {\n        float h = Input.GetAxis("Horizontal");\n        float v = Input.GetAxis("Vertical");\n        transform.Translate(new Vector3(h, 0, v) * moveSpeed * Time.deltaTime);\n        if (Input.GetKeyDown(KeyCode.Space)) rb?.AddForce(Vector3.up * jumpForce, ForceMode.Impulse);\n    }\n}\n`);
    files.push('Assets/Scripts/PlayerController.cs');

    if (req.aiNPCs) {
      this.write(path.join(assetsDir, 'AIAgent.cs'), `using UnityEngine;\nusing UnityEngine.AI;\n\npublic class AIAgent : MonoBehaviour {\n    public Transform target;\n    public float detectionRange = 15f;\n    private NavMeshAgent agent;\n    \n    void Start() { agent = GetComponent<NavMeshAgent>(); }\n    \n    void Update() {\n        if (target && Vector3.Distance(transform.position, target.position) < detectionRange)\n            agent?.SetDestination(target.position);\n    }\n}\n`);
      files.push('Assets/Scripts/AIAgent.cs');
    }

    if (req.proceduralGeneration) {
      this.write(path.join(assetsDir, 'ProceduralGenerator.cs'), `using UnityEngine;\n\npublic class ProceduralGenerator : MonoBehaviour {\n    public int width = 100, height = 100;\n    public float scale = 20f;\n    \n    void Start() { GenerateTerrain(); }\n    \n    void GenerateTerrain() {\n        var mesh = new Mesh();\n        var verts = new Vector3[width * height];\n        for (int x = 0; x < width; x++)\n            for (int z = 0; z < height; z++)\n                verts[x * height + z] = new Vector3(x, Mathf.PerlinNoise(x / scale, z / scale) * 5, z);\n        mesh.vertices = verts;\n        GetComponent<MeshFilter>().mesh = mesh;\n    }\n}\n`);
      files.push('Assets/Scripts/ProceduralGenerator.cs');
    }

    // Project settings
    this.write(path.join(dir, 'ProjectSettings', 'ProjectSettings.asset'), `%YAML 1.1\nPlayerSettings:\n  productName: ${req.name}\n  companyName: EngineAlto\n`);
    files.push('ProjectSettings/ProjectSettings.asset');

    return files;
  }

  private generateGodot(dir: string, req: GameRequest): string[] {
    const files: string[] = [];
    fs.mkdirSync(path.join(dir, 'scenes'), { recursive: true });
    fs.mkdirSync(path.join(dir, 'scripts'), { recursive: true });

    this.write(path.join(dir, 'project.godot'), `[gd_resource type="ProjectSettings"]\n\n[application]\nconfig/name="${req.name}"\nrun/main_scene="res://scenes/main.tscn"\n`);
    files.push('project.godot');

    this.write(path.join(dir, 'scripts', 'player.gd'), `extends CharacterBody3D\n\nvar speed = 5.0\nvar jump_velocity = 6.0\n\nfunc _physics_process(delta):\n    var direction = Vector3.ZERO\n    if Input.is_action_pressed("move_forward"): direction.z -= 1\n    if Input.is_action_pressed("move_back"): direction.z += 1\n    if Input.is_action_pressed("move_left"): direction.x -= 1\n    if Input.is_action_pressed("move_right"): direction.x += 1\n    velocity = direction.normalized() * speed\n    if is_on_floor() and Input.is_action_just_pressed("jump"):\n        velocity.y = jump_velocity\n    move_and_slide()\n`);
    files.push('scripts/player.gd');

    this.write(path.join(dir, 'scenes', 'main.tscn'), `[gd_scene format=3]\n\n[node name="Main" type="Node3D"]\n\n[node name="Player" type="CharacterBody3D" parent="."]\nscript = ExtResource("res://scripts/player.gd")\n\n[node name="WorldEnvironment" type="WorldEnvironment" parent="."]\n`);
    files.push('scenes/main.tscn');

    return files;
  }

  private generateUnreal(dir: string, req: GameRequest): string[] {
    const files: string[] = [];
    const srcDir = path.join(dir, 'Source', req.name.replace(/\s/g, ''));
    fs.mkdirSync(srcDir, { recursive: true });

    this.write(path.join(dir, `${req.name.replace(/\s/g, '')}.uproject`), JSON.stringify({
      FileVersion: 3, EngineAssociation: "5.4",
      Modules: [{ Name: req.name.replace(/\s/g, ''), Type: "Runtime", LoadingPhase: "Default" }],
      Plugins: [{ Name: "OnlineSubsystem", Enabled: req.multiplayer || false }],
    }, null, 2));
    files.push(`${req.name.replace(/\s/g, '')}.uproject`);

    this.write(path.join(srcDir, 'PlayerCharacter.h'), `#pragma once\n#include "CoreMinimal.h"\n#include "GameFramework/Character.h"\n#include "PlayerCharacter.generated.h"\n\nUCLASS()\nclass APlayerCharacter : public ACharacter {\n    GENERATED_BODY()\npublic:\n    APlayerCharacter();\n    UPROPERTY(EditAnywhere) float MoveSpeed = 600.f;\n    UPROPERTY(EditAnywhere) float JumpHeight = 400.f;\nprotected:\n    virtual void SetupPlayerInputComponent(UInputComponent* Input) override;\n    void MoveForward(float Value);\n    void MoveRight(float Value);\n};\n`);
    files.push(`Source/${req.name.replace(/\s/g, '')}/PlayerCharacter.h`);

    return files;
  }

  private generateWeb(dir: string, req: GameRequest): string[] {
    const files: string[] = [];
    fs.mkdirSync(path.join(dir, 'src'), { recursive: true });

    this.write(path.join(dir, 'index.html'), `<!DOCTYPE html>\n<html><head><title>${req.name}</title>\n<style>*{margin:0}canvas{display:block;background:#111}</style>\n</head><body>\n<canvas id="game"></canvas>\n<script src="src/main.js"></script>\n</body></html>`);
    files.push('index.html');

    this.write(path.join(dir, 'src', 'main.js'), `// ${req.name} — ${req.genre} (Engine Alto Web)\nconst canvas = document.getElementById('game');\nconst ctx = canvas.getContext('2d');\ncanvas.width = 1280; canvas.height = 720;\n\nconst player = { x: 640, y: 360, w: 32, h: 32, speed: 4, color: '#00ffcc' };\nconst keys = {};\n\ndocument.addEventListener('keydown', e => keys[e.key] = true);\ndocument.addEventListener('keyup', e => keys[e.key] = false);\n\nfunction update() {\n  if (keys['ArrowLeft'] || keys['a']) player.x -= player.speed;\n  if (keys['ArrowRight'] || keys['d']) player.x += player.speed;\n  if (keys['ArrowUp'] || keys['w']) player.y -= player.speed;\n  if (keys['ArrowDown'] || keys['s']) player.y += player.speed;\n}\n\nfunction draw() {\n  ctx.fillStyle = '#0a0a1a'; ctx.fillRect(0, 0, 1280, 720);\n  ctx.fillStyle = player.color; ctx.fillRect(player.x, player.y, player.w, player.h);\n  ctx.fillStyle = '#fff'; ctx.font = '14px monospace';\n  ctx.fillText('${req.name} | WASD to move', 10, 20);\n}\n\nfunction loop() { update(); draw(); requestAnimationFrame(loop); }\nloop();\n`);
    files.push('src/main.js');

    return files;
  }

  private defaultFeatures(genre: GameGenre): string[] {
    const map: Record<GameGenre, string[]> = {
      platformer: ['physics', 'collectibles', 'checkpoints', 'parallax-scrolling'],
      rpg: ['inventory', 'dialogue', 'quest-system', 'leveling', 'save-load'],
      fps: ['shooting', 'health', 'ammo', 'weapons', 'enemy-ai'],
      puzzle: ['drag-drop', 'scoring', 'levels', 'hints', 'undo'],
      racing: ['vehicles', 'tracks', 'boost', 'lap-timer', 'split-screen'],
      strategy: ['resource-management', 'fog-of-war', 'unit-ai', 'base-building'],
      sandbox: ['voxels', 'crafting', 'building', 'procedural-world'],
      horror: ['atmosphere', 'inventory', 'jump-scares', 'flashlight'],
      'visual-novel': ['branching-dialogue', 'choices', 'sprites', 'music-tracks'],
    };
    return map[genre] || ['core-gameplay'];
  }

  private write(filePath: string, content: string) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, content);
  }
}

export const gameFactory = new GameFactory();
export default gameFactory;
