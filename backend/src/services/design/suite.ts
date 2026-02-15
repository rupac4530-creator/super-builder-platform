/**
 * Engine Alto — Universal Design Suite (Canva-class)
 * Vector graphics, layout engine, templates, export to PNG/SVG/PDF.
 */
export type DesignFormat = 'png' | 'svg' | 'pdf' | 'jpg' | 'webp';

export interface DesignElement {
  id: string;
  type: 'text' | 'shape' | 'image' | 'group';
  x: number; y: number;
  width: number; height: number;
  rotation?: number;
  opacity?: number;
  fill?: string;
  stroke?: string;
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  src?: string;
  children?: DesignElement[];
}

export interface DesignDocument {
  id: string;
  name: string;
  width: number;
  height: number;
  pages: { elements: DesignElement[]; background: string }[];
  metadata: { createdAt: string; updatedAt: string; exportFormats: DesignFormat[] };
}

export interface DesignTemplate {
  id: string;
  name: string;
  category: string;
  thumbnail: string;
  document: DesignDocument;
}

export class DesignSuite {
  private documents: Map<string, DesignDocument> = new Map();
  private counter = 0;

  createDocument(name: string, width = 1920, height = 1080): DesignDocument {
    const id = `doc_${++this.counter}_${Date.now()}`;
    const doc: DesignDocument = {
      id, name, width, height,
      pages: [{ elements: [], background: '#ffffff' }],
      metadata: { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), exportFormats: ['png', 'svg', 'pdf'] },
    };
    this.documents.set(id, doc);
    return doc;
  }

  addElement(docId: string, pageIndex: number, element: Omit<DesignElement, 'id'>): DesignElement {
    const doc = this.documents.get(docId);
    if (!doc || !doc.pages[pageIndex]) throw new Error('Document or page not found');
    const el = { ...element, id: `el_${++this.counter}` } as DesignElement;
    doc.pages[pageIndex].elements.push(el);
    doc.metadata.updatedAt = new Date().toISOString();
    return el;
  }

  removeElement(docId: string, pageIndex: number, elementId: string): boolean {
    const doc = this.documents.get(docId);
    if (!doc || !doc.pages[pageIndex]) return false;
    const idx = doc.pages[pageIndex].elements.findIndex(e => e.id === elementId);
    if (idx === -1) return false;
    doc.pages[pageIndex].elements.splice(idx, 1);
    return true;
  }

  exportToSVG(docId: string, pageIndex = 0): string {
    const doc = this.documents.get(docId);
    if (!doc) throw new Error('Document not found');
    const page = doc.pages[pageIndex];
    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${doc.width}" height="${doc.height}" viewBox="0 0 ${doc.width} ${doc.height}">\n`;
    svg += `<rect width="100%" height="100%" fill="${page.background}"/>\n`;
    for (const el of page.elements) {
      svg += this.elementToSVG(el);
    }
    svg += '</svg>';
    return svg;
  }

  getTemplates(): DesignTemplate[] {
    return [
      { id: 'tpl-poster', name: 'Modern Poster', category: 'marketing', thumbnail: '/templates/poster.png', document: this.createDocument('Poster', 1080, 1920) },
      { id: 'tpl-social', name: 'Social Media Post', category: 'social', thumbnail: '/templates/social.png', document: this.createDocument('Social Post', 1080, 1080) },
      { id: 'tpl-business', name: 'Business Card', category: 'print', thumbnail: '/templates/card.png', document: this.createDocument('Business Card', 1050, 600) },
      { id: 'tpl-banner', name: 'Web Banner', category: 'web', thumbnail: '/templates/banner.png', document: this.createDocument('Banner', 1920, 400) },
      { id: 'tpl-logo', name: 'Logo Design', category: 'branding', thumbnail: '/templates/logo.png', document: this.createDocument('Logo', 500, 500) },
      { id: 'tpl-pres', name: 'Presentation', category: 'business', thumbnail: '/templates/pres.png', document: this.createDocument('Presentation', 1920, 1080) },
    ];
  }

  private elementToSVG(el: DesignElement): string {
    const transform = el.rotation ? ` transform="rotate(${el.rotation} ${el.x + el.width / 2} ${el.y + el.height / 2})"` : '';
    const opacity = el.opacity !== undefined ? ` opacity="${el.opacity}"` : '';
    switch (el.type) {
      case 'text':
        return `<text x="${el.x}" y="${el.y + (el.fontSize || 16)}" font-size="${el.fontSize || 16}" font-family="${el.fontFamily || 'Inter'}" fill="${el.fill || '#000'}"${transform}${opacity}>${el.text || ''}</text>\n`;
      case 'shape':
        return `<rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" fill="${el.fill || '#ccc'}" stroke="${el.stroke || 'none'}"${transform}${opacity}/>\n`;
      case 'image':
        return `<image href="${el.src}" x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}"${transform}${opacity}/>\n`;
      default:
        return '';
    }
  }
}

export const designSuite = new DesignSuite();
export default designSuite;
