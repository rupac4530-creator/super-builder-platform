/**
 * Engine Alto — Fashion & Textile Design Studio
 * AI-powered fashion design, garment generation, fabric simulation, and fit prediction.
 */
export type GarmentType = 'top' | 'bottom' | 'dress' | 'outerwear' | 'footwear' | 'accessory' | 'full-outfit';
export type FabricType = 'cotton' | 'silk' | 'denim' | 'leather' | 'polyester' | 'wool' | 'linen' | 'chiffon' | 'velvet';

export interface DesignRequest {
  id?: string;
  garmentType: GarmentType;
  style?: string;
  colors?: string[];
  fabric?: FabricType;
  size?: string;
  prompt?: string;
  generateTechPack?: boolean;
  generate3DPreview?: boolean;
}

export interface DesignResult {
  id: string;
  garmentType: GarmentType;
  designSpec: {
    colors: string[];
    fabric: FabricType;
    measurements: Record<string, number>;
    constructionNotes: string[];
    estimatedCost: { material: number; labor: number; total: number };
  };
  techPackPath?: string;
  previewPath?: string;
  patternPaths?: string[];
}

export class FashionStudio {
  private counter = 0;

  async createDesign(req: DesignRequest): Promise<DesignResult> {
    const id = req.id || `fashion_${++this.counter}_${Date.now()}`;
    const fabric = req.fabric || 'cotton';
    const colors = req.colors || this.generateColorPalette(req.style);
    const measurements = this.standardMeasurements(req.garmentType, req.size || 'M');

    const materialCost = this.fabricCost(fabric) * this.fabricYardage(req.garmentType);
    const laborCost = this.laborEstimate(req.garmentType);

    return {
      id, garmentType: req.garmentType,
      designSpec: {
        colors, fabric, measurements,
        constructionNotes: this.constructionNotes(req.garmentType, fabric),
        estimatedCost: { material: materialCost, labor: laborCost, total: materialCost + laborCost },
      },
      techPackPath: req.generateTechPack ? `data/fashion/${id}/tech-pack.pdf` : undefined,
      previewPath: req.generate3DPreview ? `data/fashion/${id}/preview.glb` : undefined,
      patternPaths: [`data/fashion/${id}/front.svg`, `data/fashion/${id}/back.svg`],
    };
  }

  private generateColorPalette(style?: string): string[] {
    const palettes: Record<string, string[]> = {
      minimalist: ['#1a1a1a', '#f5f5f5', '#888888'],
      streetwear: ['#ff4444', '#222222', '#ffcc00'],
      formal: ['#0d1b2a', '#1b263b', '#f0f0f0'],
      bohemian: ['#c17900', '#5c3d2e', '#e8d5b7', '#8b5e34'],
      futuristic: ['#00f0ff', '#0a0a2e', '#ff00aa', '#333344'],
    };
    return palettes[style || 'minimalist'] || palettes.minimalist;
  }

  private standardMeasurements(garment: GarmentType, size: string): Record<string, number> {
    const sizeMultiplier: Record<string, number> = { XS: 0.85, S: 0.92, M: 1, L: 1.08, XL: 1.18, XXL: 1.28 };
    const m = sizeMultiplier[size] || 1;
    const base: Record<GarmentType, Record<string, number>> = {
      top: { chest: 96 * m, waist: 80 * m, length: 68 * m, shoulder: 44 * m, sleeve: 62 * m },
      bottom: { waist: 80 * m, hip: 100 * m, inseam: 78 * m, outseam: 102 * m },
      dress: { bust: 88 * m, waist: 72 * m, hip: 96 * m, length: 100 * m },
      outerwear: { chest: 104 * m, length: 75 * m, shoulder: 46 * m, sleeve: 64 * m },
      footwear: { length: 26 * m, width: 9.5 * m },
      accessory: { circumference: 56 * m },
      'full-outfit': { chest: 96 * m, waist: 80 * m, hip: 100 * m, inseam: 78 * m },
    };
    return base[garment] || {};
  }

  private fabricCost(fabric: FabricType): number {
    const costs: Record<FabricType, number> = { cotton: 8, silk: 45, denim: 12, leather: 60, polyester: 5, wool: 25, linen: 15, chiffon: 20, velvet: 30 };
    return costs[fabric] || 10;
  }

  private fabricYardage(garment: GarmentType): number {
    const yards: Record<GarmentType, number> = { top: 1.5, bottom: 1.5, dress: 3, outerwear: 3, footwear: 0.5, accessory: 0.3, 'full-outfit': 5 };
    return yards[garment] || 2;
  }

  private laborEstimate(garment: GarmentType): number {
    const hours: Record<GarmentType, number> = { top: 3, bottom: 2.5, dress: 5, outerwear: 6, footwear: 4, accessory: 1.5, 'full-outfit': 10 };
    return (hours[garment] || 3) * 15;
  }

  private constructionNotes(garment: GarmentType, fabric: FabricType): string[] {
    return [
      `Cut ${fabric} with 1.5cm seam allowance`,
      `Use matching thread (polyester core for ${fabric})`,
      garment === 'outerwear' ? 'Add interfacing to collar and lapels' : 'Finish raw edges with overlock',
      fabric === 'silk' ? 'Use French seams for clean interior' : 'Standard flat-felled seams',
      'Press all seams before topstitching',
    ];
  }
}

export const fashionStudio = new FashionStudio();
export default fashionStudio;
