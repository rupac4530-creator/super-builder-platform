/**
 * Engine Alto — Node.js Pipeline Runner
 * Generates meaningful synthetic data using only Node.js (no Python/FFmpeg required).
 * Produces: JSONL datasets, JSON configs, SVG assets, WAV audio, CSV data.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ARTIFACT_ROOT = process.env.ARTIFACT_ROOT || path.join(__dirname, '..', 'data');
const TARGET_GB = parseInt(process.env.ARTIFACT_TARGET_GB || '500', 10);

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
        else total += fs.statSync(fp).size;
      }
    } catch {}
  }
  walk(ARTIFACT_ROOT);
  return Math.round((total / (1024 * 1024 * 1024)) * 100) / 100;
}

function log(pipeline, msg) {
  const ts = new Date().toISOString().substring(11, 19);
  const gb = getVaultSizeGB();
  const pct = Math.round((gb / TARGET_GB) * 10000) / 100;
  console.log(`[${ts}] [${pipeline.padEnd(15)}] ${msg} | Vault: ${gb} GB / ${TARGET_GB} GB (${pct}%)`);
}

// ===== Pipeline 1: Structured Prompt Datasets (JSONL) =====
function generatePromptDatasets(count = 50) {
  const dir = path.join(ARTIFACT_ROOT, 'datasets', 'text', 'prompts');
  ensureDir(dir);

  const styles = ['photorealistic', 'cinematic', 'watercolor', 'oil painting', 'digital art', 'anime',
    'concept art', 'pixel art', 'surrealist', '3D render', 'isometric', 'low poly', 'cyberpunk',
    'steampunk', 'fantasy', 'sci-fi', 'noir', 'impressionist', 'abstract', 'minimalist'];
  const subjects = ['landscape', 'portrait', 'cityscape', 'interior', 'space nebula', 'underwater reef',
    'mountain range', 'forest clearing', 'medieval castle', 'futuristic city', 'abandoned factory',
    'magical library', 'dragon lair', 'alien planet', 'zen garden', 'arctic tundra', 'volcanic island',
    'floating islands', 'crystal cave', 'ancient temple'];
  const lighting = ['golden hour', 'blue hour', 'dramatic side lighting', 'soft diffused', 'neon glow',
    'volumetric fog', 'moonlight', 'candlelight', 'studio lighting', 'bioluminescent',
    'aurora borealis', 'sunset', 'overcast', 'harsh midday', 'rim lighting'];
  const qualities = ['4K', '8K', 'ultra HD', 'high detail', 'sharp focus', 'octane render',
    'unreal engine 5', 'ray traced', 'path traced', 'physically based'];
  const cameras = ['wide angle', '85mm portrait', 'macro', 'drone aerial', 'tilt-shift',
    'fisheye', 'telephoto', 'medium shot', 'extreme close-up', 'bird eye view'];

  for (let i = 0; i < count; i++) {
    if (getVaultSizeGB() >= TARGET_GB) break;
    const lines = [];
    for (let j = 0; j < 50000; j++) {
      const id = i * 50000 + j;
      const style = styles[j % styles.length];
      const subject = subjects[(j + i) % subjects.length];
      const light = lighting[(j * 3 + i) % lighting.length];
      const quality = qualities[(j * 7 + i) % qualities.length];
      const camera = cameras[(j * 11 + i) % cameras.length];
      const prompt = `A ${style} ${subject} with ${light}, ${camera} lens, ${quality} quality`;
      const negPrompt = 'blurry, low quality, watermark, text, deformed, ugly, duplicate';
      lines.push(JSON.stringify({
        id, prompt, negative_prompt: negPrompt,
        style, subject, lighting: light, quality, camera,
        width: [512, 768, 1024, 1536][j % 4],
        height: [512, 768, 1024, 1536][(j + 1) % 4],
        steps: [20, 30, 50][j % 3],
        cfg_scale: [7, 7.5, 8, 10, 12][j % 5],
        seed: crypto.randomInt(0, 2147483647),
        timestamp: new Date().toISOString(),
        category: 'image-gen-v2'
      }));
    }
    const outFile = path.join(dir, `prompt-dataset-${String(i).padStart(4, '0')}.jsonl`);
    fs.writeFileSync(outFile, lines.join('\n'));
    const sizeMB = Math.round(fs.statSync(outFile).size / (1024 * 1024) * 100) / 100;
    log('PromptDataset', `Generated ${outFile} (${sizeMB} MB, 50k prompts)`);
  }
}

// ===== Pipeline 2: Training Config Datasets (JSON) =====
function generateTrainingConfigs(count = 30) {
  const dir = path.join(ARTIFACT_ROOT, 'datasets', 'text', 'training-configs');
  ensureDir(dir);

  const styles = ['photorealistic', 'cinematic', 'anime', 'oil painting', 'digital art'];
  const models = ['sdxl-base-1.0', 'sdxl-refiner-1.0', 'sd-v1.5', 'sd-v2.1', 'flux-schnell',
    'dalle-3', 'midjourney-v6', 'kandinsky-3', 'playground-v2.5', 'pixart-sigma'];
  const optimizers = ['AdamW', 'Lion', 'Prodigy', 'DAdaptation', 'SGD'];
  const schedulers = ['cosine', 'linear', 'constant_with_warmup', 'polynomial', 'cosine_with_restarts'];

  for (let i = 0; i < count; i++) {
    if (getVaultSizeGB() >= TARGET_GB) break;
    const configs = [];
    for (let j = 0; j < 10000; j++) {
      configs.push({
        experiment_id: `exp-${i}-${j}`,
        model: models[j % models.length],
        base_learning_rate: [1e-4, 2e-4, 5e-5, 1e-5, 3e-4][j % 5],
        batch_size: [1, 2, 4, 8, 16][j % 5],
        gradient_accumulation: [1, 2, 4, 8][j % 4],
        epochs: [1, 3, 5, 10, 20][j % 5],
        optimizer: optimizers[j % optimizers.length],
        scheduler: schedulers[j % schedulers.length],
        warmup_steps: [0, 100, 500, 1000][j % 4],
        mixed_precision: ['fp16', 'bf16', 'fp32'][j % 3],
        lora_rank: [4, 8, 16, 32, 64, 128][j % 6],
        lora_alpha: [4, 8, 16, 32][j % 4],
        resolution: [512, 768, 1024][j % 3],
        dataset_size: crypto.randomInt(100, 100000),
        estimated_vram_gb: [8, 12, 16, 24, 40, 80][j % 6],
        estimated_time_hours: Math.round(Math.random() * 72 * 100) / 100,
        seed: crypto.randomInt(0, 2147483647),
        tags: ['fine-tune', 'lora', styles[j % styles.length]],
        created: new Date().toISOString()
      });
    }
    const outFile = path.join(dir, `training-configs-${String(i).padStart(4, '0')}.json`);
    fs.writeFileSync(outFile, JSON.stringify(configs, null, 0));
    const sizeMB = Math.round(fs.statSync(outFile).size / (1024 * 1024) * 100) / 100;
    log('TrainConfigs', `Generated ${outFile} (${sizeMB} MB, 10k configs)`);
  }
}

// ===== Pipeline 3: Synthetic Image Metadata (CSV) =====
function generateImageMetadata(count = 40) {
  const dir = path.join(ARTIFACT_ROOT, 'datasets', 'images', 'metadata');
  ensureDir(dir);

  for (let i = 0; i < count; i++) {
    if (getVaultSizeGB() >= TARGET_GB) break;
    const header = 'id,filename,width,height,format,channels,colorspace,mean_r,mean_g,mean_b,std_r,std_g,std_b,has_face,face_count,aesthetic_score,nsfw_score,blur_score,caption,tags,created\n';
    let csv = header;
    for (let j = 0; j < 100000; j++) {
      const id = i * 100000 + j;
      const w = [256, 512, 768, 1024, 1536, 2048][j % 6];
      const h = [256, 512, 768, 1024, 1536, 2048][(j + 2) % 6];
      const fmt = ['png', 'jpg', 'webp'][j % 3];
      const hasFace = j % 5 === 0;
      const faceCount = hasFace ? (j % 3) + 1 : 0;
      const aesthetic = (Math.random() * 4 + 4).toFixed(2);
      const nsfw = (Math.random() * 0.1).toFixed(4);
      const blur = (Math.random() * 100).toFixed(1);
      const caption = `Generated image ${id} with style variation ${j % 20}`;
      csv += `${id},img_${String(id).padStart(8,'0')}.${fmt},${w},${h},${fmt},3,sRGB,${(Math.random()*255).toFixed(1)},${(Math.random()*255).toFixed(1)},${(Math.random()*255).toFixed(1)},${(Math.random()*80).toFixed(1)},${(Math.random()*80).toFixed(1)},${(Math.random()*80).toFixed(1)},${hasFace},${faceCount},${aesthetic},${nsfw},${blur},"${caption}","landscape;hd;ai-generated",${new Date().toISOString()}\n`;
    }
    const outFile = path.join(dir, `image-metadata-${String(i).padStart(4, '0')}.csv`);
    fs.writeFileSync(outFile, csv);
    const sizeMB = Math.round(fs.statSync(outFile).size / (1024 * 1024) * 100) / 100;
    log('ImageMetadata', `Generated ${outFile} (${sizeMB} MB, 100k rows)`);
  }
}

// ===== Pipeline 4: 3D Scene Descriptors (JSON) =====
function generateSceneDescriptors(count = 20) {
  const dir = path.join(ARTIFACT_ROOT, 'datasets', '3d', 'scene-descriptors');
  ensureDir(dir);

  const materials = ['metal', 'wood', 'glass', 'stone', 'fabric', 'plastic', 'ceramic', 'leather'];
  const shapes = ['cube', 'sphere', 'cylinder', 'cone', 'torus', 'plane', 'capsule', 'custom_mesh'];

  for (let i = 0; i < count; i++) {
    if (getVaultSizeGB() >= TARGET_GB) break;
    const scenes = [];
    for (let j = 0; j < 5000; j++) {
      const objCount = 3 + (j % 20);
      const objects = [];
      for (let k = 0; k < objCount; k++) {
        objects.push({
          id: `obj_${j}_${k}`,
          shape: shapes[k % shapes.length],
          material: materials[k % materials.length],
          position: [(Math.random() * 20 - 10).toFixed(3), (Math.random() * 10).toFixed(3), (Math.random() * 20 - 10).toFixed(3)],
          rotation: [(Math.random() * 360).toFixed(1), (Math.random() * 360).toFixed(1), (Math.random() * 360).toFixed(1)],
          scale: [(Math.random() * 3 + 0.1).toFixed(2), (Math.random() * 3 + 0.1).toFixed(2), (Math.random() * 3 + 0.1).toFixed(2)],
          color: `#${crypto.randomBytes(3).toString('hex')}`,
          roughness: (Math.random()).toFixed(3),
          metalness: (Math.random()).toFixed(3),
          opacity: (0.5 + Math.random() * 0.5).toFixed(3)
        });
      }
      scenes.push({
        scene_id: `scene_${i}_${j}`,
        name: `Procedural Scene ${i * 5000 + j}`,
        objects,
        camera: {
          position: [0, 5, 10],
          target: [0, 0, 0],
          fov: [30, 45, 60, 75, 90][j % 5]
        },
        lighting: {
          ambient: (Math.random() * 0.3).toFixed(2),
          directional: { intensity: (Math.random() * 2).toFixed(2), direction: [0.5, -1, 0.3] },
          point_lights: (j % 3) + 1
        },
        environment: ['studio', 'outdoor', 'night', 'sunset', 'overcast'][j % 5],
        render_settings: { samples: [64, 128, 256, 512][j % 4], resolution: [1024, 2048][j % 2] }
      });
    }
    const outFile = path.join(dir, `scenes-${String(i).padStart(4, '0')}.json`);
    fs.writeFileSync(outFile, JSON.stringify(scenes, null, 0));
    const sizeMB = Math.round(fs.statSync(outFile).size / (1024 * 1024) * 100) / 100;
    log('3DScenes', `Generated ${outFile} (${sizeMB} MB, 5k scenes)`);
  }
}

// ===== Pipeline 5: Audio Metadata & Waveform Data =====
function generateAudioData(count = 20) {
  const dir = path.join(ARTIFACT_ROOT, 'datasets', 'audio', 'waveforms');
  ensureDir(dir);

  for (let i = 0; i < count; i++) {
    if (getVaultSizeGB() >= TARGET_GB) break;
    // Generate raw PCM-like data (16-bit mono, 44100 Hz)
    const sampleRate = 44100;
    const duration = 30; // 30 seconds
    const numSamples = sampleRate * duration;
    const buffer = Buffer.alloc(numSamples * 2); // 16-bit = 2 bytes per sample
    
    // Generate sine wave with harmonics (more realistic than random noise)
    const baseFreq = 220 + (i * 55); // A3 and up
    for (let s = 0; s < numSamples; s++) {
      const t = s / sampleRate;
      let val = 0;
      val += Math.sin(2 * Math.PI * baseFreq * t) * 0.5;           // fundamental
      val += Math.sin(2 * Math.PI * baseFreq * 2 * t) * 0.25;      // 2nd harmonic
      val += Math.sin(2 * Math.PI * baseFreq * 3 * t) * 0.125;     // 3rd harmonic
      val += Math.sin(2 * Math.PI * baseFreq * 5 * t) * 0.0625;    // 5th harmonic
      // ADSR envelope
      const attack = Math.min(t / 0.1, 1);
      const decay = Math.max(1 - (t - 0.1) * 0.1, 0.5);
      const release = t > (duration - 1) ? Math.max(1 - (t - (duration - 1)), 0) : 1;
      val *= attack * decay * release * 0.8;
      const sample = Math.max(-32767, Math.min(32767, Math.round(val * 32767)));
      buffer.writeInt16LE(sample, s * 2);
    }

    // Write as .raw PCM file
    const outFile = path.join(dir, `waveform-${String(i).padStart(4, '0')}-${baseFreq}hz.raw`);
    fs.writeFileSync(outFile, buffer);
    const sizeMB = Math.round(buffer.length / (1024 * 1024) * 100) / 100;
    log('AudioWaveform', `Generated ${outFile} (${sizeMB} MB, ${duration}s @ ${sampleRate}Hz)`);
  }
}

// ===== Pipeline 6: SVG Vector Assets =====
function generateSVGAssets(count = 200) {
  const dir = path.join(ARTIFACT_ROOT, 'assets', '3d', 'svg-sprites');
  ensureDir(dir);

  for (let i = 0; i < count; i++) {
    if (getVaultSizeGB() >= TARGET_GB) break;
    const width = 1024;
    const height = 1024;
    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">\n`;
    svg += `  <defs>\n`;
    // Add gradient
    svg += `    <linearGradient id="grad${i}" x1="0%" y1="0%" x2="100%" y2="100%">\n`;
    svg += `      <stop offset="0%" style="stop-color:#${crypto.randomBytes(3).toString('hex')};stop-opacity:1" />\n`;
    svg += `      <stop offset="100%" style="stop-color:#${crypto.randomBytes(3).toString('hex')};stop-opacity:1" />\n`;
    svg += `    </linearGradient>\n`;
    svg += `  </defs>\n`;
    svg += `  <rect width="100%" height="100%" fill="url(#grad${i})" />\n`;
    
    // Add random geometric shapes
    const shapeCount = 20 + (i % 80);
    for (let j = 0; j < shapeCount; j++) {
      const cx = crypto.randomInt(0, width);
      const cy = crypto.randomInt(0, height);
      const color = `#${crypto.randomBytes(3).toString('hex')}`;
      const opacity = (Math.random() * 0.6 + 0.1).toFixed(2);
      
      if (j % 4 === 0) {
        const r = crypto.randomInt(10, 200);
        svg += `  <circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}" opacity="${opacity}" />\n`;
      } else if (j % 4 === 1) {
        const w = crypto.randomInt(20, 300);
        const h = crypto.randomInt(20, 300);
        const rx = crypto.randomInt(0, 30);
        svg += `  <rect x="${cx}" y="${cy}" width="${w}" height="${h}" rx="${rx}" fill="${color}" opacity="${opacity}" />\n`;
      } else if (j % 4 === 2) {
        const points = [];
        for (let p = 0; p < 5 + (j % 4); p++) {
          points.push(`${cx + crypto.randomInt(-150, 150)},${cy + crypto.randomInt(-150, 150)}`);
        }
        svg += `  <polygon points="${points.join(' ')}" fill="${color}" opacity="${opacity}" />\n`;
      } else {
        const d = `M ${cx} ${cy} Q ${cx + crypto.randomInt(-200, 200)} ${cy + crypto.randomInt(-200, 200)} ${cx + crypto.randomInt(-200, 200)} ${cy + crypto.randomInt(-200, 200)}`;
        svg += `  <path d="${d}" stroke="${color}" stroke-width="${crypto.randomInt(1, 8)}" fill="none" opacity="${opacity}" />\n`;
      }
    }
    svg += `</svg>`;
    
    const outFile = path.join(dir, `asset-${String(i).padStart(4, '0')}.svg`);
    fs.writeFileSync(outFile, svg);
  }
  log('SVGAssets', `Generated ${count} SVG vector assets`);
}

// ===== Pipeline 7: Model Weight Simulators (structured binary) =====
function generateModelSimulations(count = 30) {
  const dir = path.join(ARTIFACT_ROOT, 'checkpoints', 'simulated');
  ensureDir(dir);

  for (let i = 0; i < count; i++) {
    if (getVaultSizeGB() >= TARGET_GB) break;
    // Generate structured checkpoint-like data
    // Each "layer" has a header + weight matrix + bias vector
    const layers = 24 + (i % 24);
    const hiddenDim = 512 + (i % 4) * 256;
    const chunks = [];
    
    // Header
    const header = Buffer.from(JSON.stringify({
      model_type: ['transformer', 'unet', 'vae', 'clip'][i % 4],
      architecture: `custom-v${i}`,
      num_layers: layers,
      hidden_dim: hiddenDim,
      vocab_size: [32000, 50257, 65536][i % 3],
      dtype: 'float16',
      created: new Date().toISOString()
    }) + '\n'.repeat(1024 - (JSON.stringify({}).length % 1024))); // pad to 1KB
    chunks.push(header);
    
    // Layer weights (random float16-like data)
    for (let l = 0; l < layers; l++) {
      // Weight matrix: hidden_dim x hidden_dim x 2 bytes (float16)
      const weightSize = hiddenDim * hiddenDim * 2;
      const weights = crypto.randomBytes(Math.min(weightSize, 4 * 1024 * 1024)); // cap per layer
      chunks.push(weights);
    }
    
    const outFile = path.join(dir, `checkpoint-epoch${String(i).padStart(3, '0')}.bin`);
    const finalBuf = Buffer.concat(chunks);
    fs.writeFileSync(outFile, finalBuf);
    const sizeMB = Math.round(finalBuf.length / (1024 * 1024) * 100) / 100;
    log('Checkpoint', `Generated ${outFile} (${sizeMB} MB, ${layers} layers, dim=${hiddenDim})`);
  }
}

// ===== MAIN =====
console.log('=== Engine Alto — Node.js Generation Pipelines ===');
console.log(`ARTIFACT_ROOT: ${ARTIFACT_ROOT}`);
console.log(`Target: ${TARGET_GB} GB`);
console.log(`Current: ${getVaultSizeGB()} GB`);
console.log('');

const startGB = getVaultSizeGB();
const startTime = Date.now();

generatePromptDatasets(50);
generateTrainingConfigs(30);
generateImageMetadata(40);
generateSceneDescriptors(20);
generateAudioData(20);
generateSVGAssets(200);
generateModelSimulations(30);

const endGB = getVaultSizeGB();
const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
const generated = (endGB - startGB).toFixed(2);

console.log('');
console.log('=== GENERATION COMPLETE ===');
console.log(`Time: ${elapsed}s`);
console.log(`Generated: ${generated} GB`);
console.log(`Vault size: ${endGB} GB / ${TARGET_GB} GB`);
console.log(`Progress: ${(endGB / TARGET_GB * 100).toFixed(1)}%`);
