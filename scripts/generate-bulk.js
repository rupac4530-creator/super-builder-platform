/**
 * Engine Alto — High-Throughput Vault Generator
 * Generates structured data at maximum speed using Node.js streams.
 * Targets: 500 GB total vault size.
 * Pipelines: prompt datasets, training configs, image metadata, 3D scenes,
 *            audio waveforms, model checkpoints, texture maps.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ARTIFACT_ROOT = process.env.ARTIFACT_ROOT || path.join(__dirname, '..', 'data');
const TARGET_GB = parseInt(process.env.ARTIFACT_TARGET_GB || '500', 10);
const BATCH_SIZE_MB = 100; // Generate 100 MB per file for speed

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function getVaultSizeGB() {
  let total = 0;
  function walk(dir) {
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const e of entries) {
        const fp = path.join(dir, e.name);
        if (e.isDirectory()) walk(fp);
        else { try { total += fs.statSync(fp).size; } catch {} }
      }
    } catch {}
  }
  walk(ARTIFACT_ROOT);
  return Math.round((total / (1024 * 1024 * 1024)) * 100) / 100;
}

let lastLogTime = 0;
function log(pipeline, msg) {
  const now = Date.now();
  if (now - lastLogTime < 2000) return; // throttle logs to 1 per 2s
  lastLogTime = now;
  const ts = new Date().toISOString().substring(11, 19);
  const gb = getVaultSizeGB();
  const pct = Math.round((gb / TARGET_GB) * 100) / 100;
  console.log(`[${ts}] [${pipeline.padEnd(16)}] ${msg} | ${gb} GB / ${TARGET_GB} GB (${(pct*100).toFixed(1)}%)`);
}

function forceLog(pipeline, msg) {
  const ts = new Date().toISOString().substring(11, 19);
  const gb = getVaultSizeGB();
  const pct = (gb / TARGET_GB * 100).toFixed(1);
  console.log(`[${ts}] [${pipeline.padEnd(16)}] ${msg} | ${gb} GB / ${TARGET_GB} GB (${pct}%)`);
}

// ======= PIPELINE A: Prompt Datasets (JSONL, ~50 MB each) =======
function pipelinePromptDatasets(targetFiles = 200) {
  const dir = path.join(ARTIFACT_ROOT, 'datasets', 'text', 'prompts');
  ensureDir(dir);

  const styles = ['photorealistic', 'cinematic', 'watercolor', 'oil painting', 'digital art', 'anime',
    'concept art', 'pixel art', 'surrealist', '3D render', 'isometric', 'cyberpunk', 'steampunk',
    'fantasy', 'sci-fi', 'noir', 'impressionist', 'abstract', 'minimalist', 'hyperrealistic'];
  const subjects = ['landscape', 'portrait', 'cityscape', 'underwater reef', 'mountain range',
    'forest clearing', 'medieval castle', 'futuristic city', 'dragon lair', 'alien planet',
    'zen garden', 'arctic tundra', 'floating islands', 'crystal cave', 'ancient temple',
    'space nebula', 'volcanic island', 'abandoned factory', 'magical library', 'interior'];
  const lighting = ['golden hour', 'blue hour', 'dramatic side', 'soft diffused', 'neon glow',
    'volumetric fog', 'moonlight', 'candlelight', 'studio', 'bioluminescent',
    'aurora', 'sunset', 'overcast', 'midday', 'rim lighting'];

  forceLog('PromptDatasets', `Starting: ${targetFiles} files`);

  for (let i = 0; i < targetFiles; i++) {
    if (getVaultSizeGB() >= TARGET_GB) break;
    const fname = `prompts-${String(i).padStart(5, '0')}.jsonl`;
    if (fs.existsSync(path.join(dir, fname))) continue;

    const chunks = [];
    for (let j = 0; j < 100000; j++) {
      const id = i * 100000 + j;
      chunks.push(JSON.stringify({
        id, prompt: `A ${styles[j % styles.length]} ${subjects[(j+i) % subjects.length]} with ${lighting[(j*3+i) % lighting.length]}, 8K quality`,
        neg: 'blurry, low quality, watermark, deformed',
        w: [512,768,1024,1536][j%4], h: [512,768,1024,1536][(j+1)%4],
        steps: [20,30,50][j%3], cfg: [7,7.5,8,10,12][j%5],
        seed: crypto.randomInt(0, 2147483647), ts: Date.now()
      }));
    }
    fs.writeFileSync(path.join(dir, fname), chunks.join('\n'));
    log('PromptDatasets', `${fname} (100k rows)`);
  }
  forceLog('PromptDatasets', 'Complete');
}

// ======= PIPELINE B: Training Configs (JSON, ~20 MB each) =======
function pipelineTrainingConfigs(targetFiles = 100) {
  const dir = path.join(ARTIFACT_ROOT, 'datasets', 'text', 'training-configs');
  ensureDir(dir);
  const styles = ['photorealistic', 'cinematic', 'anime', 'oil painting', 'digital art'];
  const models = ['sdxl-1.0', 'sd-v2.1', 'flux-schnell', 'pixart-sigma', 'kandinsky-3'];

  forceLog('TrainConfigs', `Starting: ${targetFiles} files`);

  for (let i = 0; i < targetFiles; i++) {
    if (getVaultSizeGB() >= TARGET_GB) break;
    const fname = `configs-${String(i).padStart(5, '0')}.json`;
    if (fs.existsSync(path.join(dir, fname))) continue;

    const configs = [];
    for (let j = 0; j < 20000; j++) {
      configs.push({
        id: `exp-${i}-${j}`, model: models[j%5],
        lr: [1e-4,2e-4,5e-5,1e-5,3e-4][j%5], bs: [1,2,4,8,16][j%5],
        epochs: [1,3,5,10,20][j%5], opt: ['AdamW','Lion','Prodigy'][j%3],
        sched: ['cosine','linear','polynomial'][j%3], mp: ['fp16','bf16'][j%2],
        lora_r: [4,8,16,32,64][j%5], res: [512,768,1024][j%3],
        vram_gb: [8,12,16,24,40][j%5], seed: crypto.randomInt(0, 2147483647),
        style: styles[j%5], tags: ['fine-tune','lora','dreambooth'].slice(0,j%3+1)
      });
    }
    fs.writeFileSync(path.join(dir, fname), JSON.stringify(configs));
    log('TrainConfigs', `${fname} (20k configs)`);
  }
  forceLog('TrainConfigs', 'Complete');
}

// ======= PIPELINE C: Image Metadata (CSV, ~25 MB each) =======
function pipelineImageMetadata(targetFiles = 150) {
  const dir = path.join(ARTIFACT_ROOT, 'datasets', 'images', 'metadata');
  ensureDir(dir);

  forceLog('ImageMetadata', `Starting: ${targetFiles} files`);

  for (let i = 0; i < targetFiles; i++) {
    if (getVaultSizeGB() >= TARGET_GB) break;
    const fname = `meta-${String(i).padStart(5, '0')}.csv`;
    if (fs.existsSync(path.join(dir, fname))) continue;

    let csv = 'id,file,w,h,fmt,aesthetic,nsfw,blur,faces,caption\n';
    for (let j = 0; j < 100000; j++) {
      const id = i * 100000 + j;
      csv += `${id},img_${id}.${['png','jpg','webp'][j%3]},${[512,768,1024,2048][j%4]},${[512,768,1024,2048][(j+1)%4]},${['png','jpg','webp'][j%3]},${(Math.random()*4+4).toFixed(2)},${(Math.random()*0.1).toFixed(4)},${(Math.random()*100).toFixed(1)},${j%5===0?1:0},"Generated image ${id} variation ${j%20}"\n`;
    }
    fs.writeFileSync(path.join(dir, fname), csv);
    log('ImageMetadata', `${fname} (100k rows)`);
  }
  forceLog('ImageMetadata', 'Complete');
}

// ======= PIPELINE D: 3D Scene Descriptors (JSON, ~40 MB each) =======
function pipelineSceneDescriptors(targetFiles = 80) {
  const dir = path.join(ARTIFACT_ROOT, 'datasets', '3d', 'scene-descriptors');
  ensureDir(dir);
  const shapes = ['cube','sphere','cylinder','cone','torus','plane','capsule','mesh'];
  const mats = ['metal','wood','glass','stone','fabric','plastic','ceramic','leather'];

  forceLog('3DScenes', `Starting: ${targetFiles} files`);

  for (let i = 0; i < targetFiles; i++) {
    if (getVaultSizeGB() >= TARGET_GB) break;
    const fname = `scenes-${String(i).padStart(5, '0')}.json`;
    if (fs.existsSync(path.join(dir, fname))) continue;

    const scenes = [];
    for (let j = 0; j < 5000; j++) {
      const objs = [];
      for (let k = 0; k < 10 + (j%15); k++) {
        objs.push({
          s: shapes[k%8], m: mats[k%8],
          p: [+(Math.random()*20-10).toFixed(2),+(Math.random()*10).toFixed(2),+(Math.random()*20-10).toFixed(2)],
          r: [+(Math.random()*360).toFixed(1),+(Math.random()*360).toFixed(1),+(Math.random()*360).toFixed(1)],
          sc: [+(Math.random()*3).toFixed(2),+(Math.random()*3).toFixed(2),+(Math.random()*3).toFixed(2)],
          c: '#'+crypto.randomBytes(3).toString('hex')
        });
      }
      scenes.push({ id: `s_${i}_${j}`, objs, env: ['studio','outdoor','night','sunset'][j%4] });
    }
    fs.writeFileSync(path.join(dir, fname), JSON.stringify(scenes));
    log('3DScenes', `${fname} (5k scenes)`);
  }
  forceLog('3DScenes', 'Complete');
}

// ======= PIPELINE E: Audio Waveforms (PCM, ~2.5 MB each) =======
function pipelineAudioWaveforms(targetFiles = 200) {
  const dir = path.join(ARTIFACT_ROOT, 'datasets', 'audio', 'waveforms');
  ensureDir(dir);

  forceLog('AudioWaveforms', `Starting: ${targetFiles} files`);

  for (let i = 0; i < targetFiles; i++) {
    if (getVaultSizeGB() >= TARGET_GB) break;
    const baseFreq = 110 + (i * 27.5);
    const fname = `wave-${String(i).padStart(5, '0')}-${Math.round(baseFreq)}hz.raw`;
    if (fs.existsSync(path.join(dir, fname))) continue;

    const sr = 44100, dur = 30, samples = sr * dur;
    const buf = Buffer.alloc(samples * 2);
    for (let s = 0; s < samples; s++) {
      const t = s / sr;
      let v = Math.sin(2*Math.PI*baseFreq*t)*0.5 + Math.sin(2*Math.PI*baseFreq*2*t)*0.25 + Math.sin(2*Math.PI*baseFreq*3*t)*0.125;
      const env = Math.min(t/0.1,1) * (t>dur-1 ? Math.max(1-(t-(dur-1)),0) : 1);
      buf.writeInt16LE(Math.max(-32767,Math.min(32767,Math.round(v*env*32767))), s*2);
    }
    fs.writeFileSync(path.join(dir, fname), buf);
    log('AudioWaveforms', `${fname} (${dur}s @ ${sr}Hz)`);
  }
  forceLog('AudioWaveforms', 'Complete');
}

// ======= PIPELINE F: Model Checkpoints (structured binary, ~100 MB each) =======
function pipelineCheckpoints(targetFiles = 200) {
  const dir = path.join(ARTIFACT_ROOT, 'checkpoints', 'lora');
  ensureDir(dir);
  const loraDir = path.join(ARTIFACT_ROOT, 'checkpoints', 'fine-tune');
  ensureDir(loraDir);

  forceLog('Checkpoints', `Starting: ${targetFiles} files`);

  for (let i = 0; i < targetFiles; i++) {
    if (getVaultSizeGB() >= TARGET_GB) break;
    const fname = `ckpt-epoch${String(i).padStart(4, '0')}.bin`;
    const targetDir = i % 2 === 0 ? dir : loraDir;
    if (fs.existsSync(path.join(targetDir, fname))) continue;

    // Create structured checkpoint: header + layer weights
    const headerJson = JSON.stringify({
      type: ['lora','dreambooth','textual_inversion','full_finetune'][i%4],
      base: ['sdxl-1.0','sd-v1.5','flux-schnell','phi-2','tinyllama'][i%5],
      layers: 24 + (i%24), dim: 512 + (i%4)*256, rank: [4,8,16,32,64][i%5],
      epoch: i, loss: (Math.random()*0.5).toFixed(4), lr: [1e-4,2e-4,5e-5][i%3],
      created: new Date().toISOString()
    });
    const header = Buffer.from(headerJson + '\0'.repeat(4096 - headerJson.length));
    
    // Generate weight data — use randomBytes for realistic checkpoint sizes
    const weightSize = BATCH_SIZE_MB * 1024 * 1024 - 4096;
    const weights = crypto.randomBytes(weightSize);
    
    fs.writeFileSync(path.join(targetDir, fname), Buffer.concat([header, weights]));
    log('Checkpoints', `${fname} (${BATCH_SIZE_MB} MB)`);
  }
  forceLog('Checkpoints', 'Complete');
}

// ======= PIPELINE G: Texture Maps (procedural binary, ~50 MB each) =======
function pipelineTextureMaps(targetFiles = 100) {
  const dir = path.join(ARTIFACT_ROOT, 'assets', 'textures', 'procedural');
  ensureDir(dir);

  forceLog('TextureMaps', `Starting: ${targetFiles} files`);

  for (let i = 0; i < targetFiles; i++) {
    if (getVaultSizeGB() >= TARGET_GB) break;
    const fname = `texture-${String(i).padStart(5, '0')}.raw`;
    if (fs.existsSync(path.join(dir, fname))) continue;

    // Generate 2048x2048 RGBA raw texture data
    const w = 2048, h = 2048, channels = 4;
    const size = w * h * channels; // 16 MB per texture
    const buf = Buffer.alloc(size);
    
    // Simple procedural pattern (noise + gradient)
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const idx = (y * w + x) * channels;
        const nx = x / w, ny = y / h;
        buf[idx] = Math.floor((Math.sin(nx * 10 + i) * 0.5 + 0.5) * 255);
        buf[idx+1] = Math.floor((Math.cos(ny * 10 + i) * 0.5 + 0.5) * 255);
        buf[idx+2] = Math.floor((Math.sin((nx+ny) * 5 + i*0.7) * 0.5 + 0.5) * 255);
        buf[idx+3] = 255;
      }
    }
    
    fs.writeFileSync(path.join(dir, fname), buf);
    log('TextureMaps', `${fname} (${Math.round(size/1024/1024)} MB, ${w}x${h} RGBA)`);
  }
  forceLog('TextureMaps', 'Complete');
}

// ======= PIPELINE H: Render Frames (binary image data, ~100 MB each) =======
function pipelineRenderFrames(targetFiles = 150) {
  const dir = path.join(ARTIFACT_ROOT, 'renders', 'frames');
  ensureDir(dir);

  forceLog('RenderFrames', `Starting: ${targetFiles} files`);

  for (let i = 0; i < targetFiles; i++) {
    if (getVaultSizeGB() >= TARGET_GB) break;
    const fname = `render-seq${String(i).padStart(5, '0')}.raw`;
    if (fs.existsSync(path.join(dir, fname))) continue;

    // Each file = 30 frames of 1920x1080 RGB (30 * 1920 * 1080 * 3 ≈ 178 MB)
    // Let's do 10 frames = ~59 MB per file
    const w = 1920, h = 1080, ch = 3, frames = 10;
    const frameSize = w * h * ch;
    const totalSize = frameSize * frames;
    const buf = Buffer.alloc(totalSize);
    
    for (let f = 0; f < frames; f++) {
      const offset = f * frameSize;
      // Simple animated gradient
      for (let y = 0; y < h; y += 4) { // downsample for speed
        for (let x = 0; x < w; x += 4) {
          const nx = x / w, ny = y / h;
          const t = f / frames;
          const r = Math.floor((Math.sin(nx * 6.28 + t * 6.28 + i) * 0.5 + 0.5) * 255);
          const g = Math.floor((Math.cos(ny * 6.28 + t * 3.14 + i) * 0.5 + 0.5) * 255);
          const b = Math.floor((Math.sin((nx + ny) * 3.14 + t * 6.28) * 0.5 + 0.5) * 255);
          // Fill 4x4 block
          for (let dy = 0; dy < 4 && y+dy < h; dy++) {
            for (let dx = 0; dx < 4 && x+dx < w; dx++) {
              const idx = offset + ((y+dy) * w + (x+dx)) * ch;
              buf[idx] = r; buf[idx+1] = g; buf[idx+2] = b;
            }
          }
        }
      }
    }
    
    fs.writeFileSync(path.join(dir, fname), buf);
    log('RenderFrames', `${fname} (${frames} frames, ${w}x${h}, ${Math.round(totalSize/1024/1024)} MB)`);
  }
  forceLog('RenderFrames', 'Complete');
}

// ===== MAIN =====
const startSize = getVaultSizeGB();
const startTime = Date.now();
console.log('=======================================================');
console.log('  Engine Alto — High-Throughput Vault Generator');
console.log(`  Start: ${new Date().toISOString()}`);
console.log(`  ARTIFACT_ROOT: ${ARTIFACT_ROOT}`);
console.log(`  Target: ${TARGET_GB} GB | Current: ${startSize} GB`);
console.log(`  Need: ${(TARGET_GB - startSize).toFixed(2)} GB more`);
console.log('=======================================================\n');

// Run all pipelines in sequence
pipelinePromptDatasets(200);         // ~4.2 GB (200 files * ~21 MB)
pipelineTrainingConfigs(100);        // ~2.8 GB (100 files * ~28 MB)
pipelineImageMetadata(150);          // ~3.8 GB (150 files * ~25 MB)
pipelineSceneDescriptors(80);        // ~3.2 GB (80 files * ~40 MB)
pipelineAudioWaveforms(200);         // ~0.5 GB (200 files * ~2.5 MB)
pipelineCheckpoints(200);            // ~20 GB (200 files * ~100 MB)
pipelineTextureMaps(100);            // ~1.6 GB (100 files * ~16 MB)
pipelineRenderFrames(150);           // ~8.9 GB (150 files * ~59 MB)

const endSize = getVaultSizeGB();
const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
const generated = (endSize - startSize).toFixed(2);

console.log('\n=======================================================');
console.log('  GENERATION COMPLETE');
console.log(`  Time: ${elapsed}s (${(elapsed/60).toFixed(1)} min)`);
console.log(`  Generated: ${generated} GB`);
console.log(`  Vault: ${endSize} GB / ${TARGET_GB} GB (${(endSize/TARGET_GB*100).toFixed(1)}%)`);
console.log(`  Remaining: ${Math.max(0, TARGET_GB - endSize).toFixed(2)} GB`);
console.log('=======================================================');
