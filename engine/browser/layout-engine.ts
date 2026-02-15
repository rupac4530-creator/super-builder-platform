/**
 * Engine Alto — Layout Engine
 * Flexbox + CSS-Grid + Block layout computation.
 */

export interface LayoutBox {
  nodeId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  display: 'block' | 'inline' | 'flex' | 'grid' | 'none';
  position: 'static' | 'relative' | 'absolute' | 'fixed';
  margin: [number, number, number, number];
  padding: [number, number, number, number];
  children: LayoutBox[];
}

export interface LayoutConstraints {
  maxWidth: number;
  maxHeight: number;
  parentWidth: number;
  parentHeight: number;
}

export class LayoutEngine {
  private viewport = { width: 1920, height: 1080 };
  private computedLayouts: Map<string, LayoutBox> = new Map();

  setViewport(width: number, height: number): void {
    this.viewport = { width, height };
  }

  compute(domNodeId: string, styles: Record<string, string>, children: Array<{ id: string; styles: Record<string, string>; children?: any[] }>): LayoutBox {
    const display = (styles.display as LayoutBox['display']) || 'block';
    const position = (styles.position as LayoutBox['position']) || 'static';
    const margin = this.parseBox(styles.margin || '0');
    const padding = this.parseBox(styles.padding || '0');
    const width = this.parseSize(styles.width, this.viewport.width);
    const height = this.parseSize(styles.height, 0);

    const box: LayoutBox = {
      nodeId: domNodeId, x: margin[3], y: margin[0],
      width: width || this.viewport.width - margin[1] - margin[3],
      height: height || 0,
      display, position, margin, padding, children: [],
    };

    if (display === 'flex') {
      this.layoutFlex(box, children);
    } else if (display === 'grid') {
      this.layoutGrid(box, children);
    } else {
      this.layoutBlock(box, children);
    }

    this.computedLayouts.set(domNodeId, box);
    return box;
  }

  private layoutBlock(parent: LayoutBox, children: Array<{ id: string; styles: Record<string, string> }>): void {
    let y = parent.padding[0];
    for (const child of children) {
      const childMargin = this.parseBox(child.styles.margin || '0');
      const childHeight = this.parseSize(child.styles.height, 40) || 40;
      const childWidth = parent.width - parent.padding[1] - parent.padding[3] - childMargin[1] - childMargin[3];
      const childBox: LayoutBox = {
        nodeId: child.id, x: parent.padding[3] + childMargin[3], y: y + childMargin[0],
        width: childWidth, height: childHeight,
        display: 'block', position: 'static',
        margin: childMargin, padding: [0, 0, 0, 0], children: [],
      };
      parent.children.push(childBox);
      y += childHeight + childMargin[0] + childMargin[2];
    }
    if (!parent.height) parent.height = y + parent.padding[2];
  }

  private layoutFlex(parent: LayoutBox, children: Array<{ id: string; styles: Record<string, string> }>): void {
    const direction = 'row'; // TODO: detect from styles
    const totalFlex = children.length || 1;
    const itemWidth = (parent.width - parent.padding[1] - parent.padding[3]) / totalFlex;
    let x = parent.padding[3];

    for (const child of children) {
      const childHeight = this.parseSize(child.styles.height, 0) || parent.height || 40;
      const childBox: LayoutBox = {
        nodeId: child.id, x, y: parent.padding[0],
        width: itemWidth, height: childHeight,
        display: 'block', position: 'static',
        margin: [0, 0, 0, 0], padding: [0, 0, 0, 0], children: [],
      };
      parent.children.push(childBox);
      x += itemWidth;
    }
  }

  private layoutGrid(parent: LayoutBox, children: Array<{ id: string; styles: Record<string, string> }>): void {
    const cols = 3; // TODO: parse grid-template-columns
    const gap = 10;
    const colWidth = (parent.width - parent.padding[1] - parent.padding[3] - gap * (cols - 1)) / cols;
    let row = 0, col = 0;

    for (const child of children) {
      const x = parent.padding[3] + col * (colWidth + gap);
      const y = parent.padding[0] + row * (40 + gap);
      const childBox: LayoutBox = {
        nodeId: child.id, x, y, width: colWidth, height: 40,
        display: 'block', position: 'static',
        margin: [0, 0, 0, 0], padding: [0, 0, 0, 0], children: [],
      };
      parent.children.push(childBox);
      col++;
      if (col >= cols) { col = 0; row++; }
    }
  }

  private parseBox(value: string): [number, number, number, number] {
    const parts = value.split(/\s+/).map(v => parseInt(v) || 0);
    if (parts.length === 1) return [parts[0], parts[0], parts[0], parts[0]];
    if (parts.length === 2) return [parts[0], parts[1], parts[0], parts[1]];
    if (parts.length === 4) return [parts[0], parts[1], parts[2], parts[3]];
    return [0, 0, 0, 0];
  }

  private parseSize(value: string | undefined, ref: number): number {
    if (!value) return 0;
    if (value.endsWith('%')) return (parseInt(value) / 100) * ref;
    return parseInt(value) || 0;
  }

  getLayout(nodeId: string): LayoutBox | undefined { return this.computedLayouts.get(nodeId); }

  getStatus() {
    return {
      viewport: this.viewport,
      computedElements: this.computedLayouts.size,
    };
  }
}

export const layoutEngine = new LayoutEngine();
