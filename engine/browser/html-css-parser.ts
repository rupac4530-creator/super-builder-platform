/**
 * Engine Alto — HTML/CSS Parser
 * Tokenizes HTML → DOM tree, parses CSS → style rules.
 */

export interface DOMNode {
  id: string;
  type: 'element' | 'text' | 'comment';
  tagName?: string;
  attributes: Record<string, string>;
  textContent?: string;
  children: DOMNode[];
  parent: string | null;
  styles: Record<string, string>;
}

export interface CSSRule {
  selector: string;
  properties: Record<string, string>;
  specificity: number;
}

export interface ParsedDocument {
  dom: DOMNode;
  styles: CSSRule[];
  scripts: string[];
  title: string;
  meta: Record<string, string>;
}

let nodeCounter = 0;

export class HTMLParser {
  parse(html: string): ParsedDocument {
    nodeCounter = 0;
    const root: DOMNode = {
      id: `dom-${nodeCounter++}`, type: 'element', tagName: 'html',
      attributes: {}, children: [], parent: null, styles: {},
    };

    const scripts: string[] = [];
    const styles: CSSRule[] = [];
    let title = '';
    const meta: Record<string, string> = {};

    // Simplified tag extraction
    const tagRegex = /<(\/?)([\w-]+)([^>]*)>/g;
    const stack: DOMNode[] = [root];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = tagRegex.exec(html)) !== null) {
      const isClosing = match[1] === '/';
      const tagName = match[2].toLowerCase();
      const attrString = match[3];

      // Text between tags
      const text = html.slice(lastIndex, match.index).trim();
      if (text && stack.length > 0) {
        const textNode: DOMNode = {
          id: `dom-${nodeCounter++}`, type: 'text', textContent: text,
          attributes: {}, children: [], parent: stack[stack.length - 1].id, styles: {},
        };
        stack[stack.length - 1].children.push(textNode);
      }

      if (isClosing) {
        if (stack.length > 1) stack.pop();
      } else {
        const attrs = this.parseAttributes(attrString);
        const node: DOMNode = {
          id: `dom-${nodeCounter++}`, type: 'element', tagName,
          attributes: attrs, children: [], parent: stack[stack.length - 1].id, styles: {},
        };
        stack[stack.length - 1].children.push(node);

        const selfClosing = ['img', 'br', 'hr', 'input', 'meta', 'link'];
        if (!selfClosing.includes(tagName)) {
          stack.push(node);
        }

        if (tagName === 'title') title = this.extractContent(html, match.index);
        if (tagName === 'meta' && attrs.name) meta[attrs.name] = attrs.content || '';
        if (tagName === 'script') scripts.push(this.extractContent(html, match.index));
        if (tagName === 'style') {
          const cssText = this.extractContent(html, match.index);
          styles.push(...this.parseCSS(cssText));
        }
      }
      lastIndex = tagRegex.lastIndex;
    }

    return { dom: root, styles, scripts, title, meta };
  }

  private parseAttributes(str: string): Record<string, string> {
    const attrs: Record<string, string> = {};
    const re = /([\w-]+)(?:=(?:"([^"]*)"|'([^']*)'|(\S+)))?/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(str)) !== null) {
      attrs[m[1]] = m[2] || m[3] || m[4] || '';
    }
    return attrs;
  }

  private extractContent(html: string, fromIndex: number): string {
    const closeTag = html.indexOf('</', fromIndex + 1);
    const openTag = html.indexOf('>', fromIndex);
    if (closeTag === -1 || openTag === -1) return '';
    return html.slice(openTag + 1, closeTag).trim();
  }

  parseCSS(css: string): CSSRule[] {
    const rules: CSSRule[] = [];
    const re = /([^{]+)\{([^}]+)\}/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(css)) !== null) {
      const selector = m[1].trim();
      const props: Record<string, string> = {};
      m[2].split(';').forEach(decl => {
        const [prop, val] = decl.split(':').map(s => s.trim());
        if (prop && val) props[prop] = val;
      });
      rules.push({ selector, properties: props, specificity: this.calcSpecificity(selector) });
    }
    return rules;
  }

  private calcSpecificity(selector: string): number {
    const ids = (selector.match(/#/g) || []).length;
    const classes = (selector.match(/\./g) || []).length;
    const elements = (selector.match(/[\w-]+/g) || []).length;
    return ids * 100 + classes * 10 + elements;
  }
}

export const htmlParser = new HTMLParser();
