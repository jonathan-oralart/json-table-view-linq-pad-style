import { render } from 'preact-render-to-string';
import { html } from 'htm/preact';
import type { VNode } from 'preact';
import { isValid, parseISO } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { styles } from './styles';
import { clientScript } from './clientScript';

const showUndefined = true;
const showEmptyStrings = true;

const isISODate = (value: unknown): boolean => {
  return typeof value === 'string' && value.length >= 20 && value.length <= 29 &&
    value[4] === '-' && value[7] === '-' && value[10] === 'T';
};

const formatDate = (value: Date | string, timezone: string = 'Pacific/Auckland'): string => {
  const date = value instanceof Date ? value : parseISO(value);

  if (!isValid(date)) {
    return 'Invalid Date';
  }

  // Check if time is midnight (00:00)
  const utcHours = date.getUTCHours();
  const utcMinutes = date.getUTCMinutes();

  if (utcHours === 0 && utcMinutes === 0) {
    return formatInTimeZone(date, timezone, 'EEE, MMM d, yyyy');
  }

  return formatInTimeZone(date, timezone, 'EEE, MMM d, yyyy h:mm a');
};

const formatPrimitive = (value: unknown, timezone: string = 'Pacific/Auckland'): string | VNode | unknown => {
  if (value === undefined) return showUndefined ? 'undefined' : '';
  if (Number.isNaN(value)) return 'NaN';
  if (value instanceof Date) {
    const formatted = formatDate(value, timezone);
    return html`<span class="date-value" data-date=${value.toISOString()}>${formatted}</span>`;
  }
  if (isISODate(value)) {
    const formatted = formatDate(value as string, timezone);
    return html`<span class="date-value" data-date=${value}>${formatted}</span>`;
  }
  if (value === '') return showEmptyStrings ? html`<span className="empty-string">""</span>` : '';
  if (typeof value === 'string') return makeUrlsClickable(value);
  return value;
};

const makeUrlsClickable = (text: string): (string | VNode)[] => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);
  return parts.map((part, index) => {
    if (part.match(urlRegex)) {
      return html`<a key=${index} href=${part} target="_blank" rel="noopener noreferrer">
            ${part}
          </a>`;
    }
    return part;
  });
};

const getCellType = (content: unknown): string => {
  if (content === undefined) return 'undefined';
  if (content === null) return 'null';
  if (Number.isNaN(content)) return 'nan';
  if (content instanceof Date) return 'date';
  const type = typeof content;
  if (type === 'number') return 'number';
  if (type === 'boolean') return 'boolean';
  if (type === 'string') {
    if (isISODate(content)) return 'date';
    if (/^-?\d+(\.\d+)?$/.test(content as string)) return 'number-string';
    return 'string';
  }
  if (type === 'object') return 'complex';
  return 'other';
};

const isObject = (value: unknown): boolean => typeof value === 'object' && value !== null && !Array.isArray(value);
const isComplexType = (value: unknown): boolean => typeof value === 'object' && value !== null;
const isPrimitive = (value: unknown): boolean => !isComplexType(value);

const TableCell = ({ content, depth, defaultOpenLevels, timezone = 'Pacific/Auckland' }: {
  content: unknown;
  depth: number;
  defaultOpenLevels: number;
  timezone?: string;
}) => {
  const cellType = getCellType(content);
  let cellContent;

  switch (cellType) {
    case 'complex':
      cellContent = renderContent(content, depth + 1, defaultOpenLevels, timezone);
      break;
    case 'date':
    case 'number':
    case 'number-string':
    case 'string':
    case 'undefined':
    case 'nan':
      cellContent = formatPrimitive(content, timezone);
      break;
    case 'boolean':
      cellContent = content ? '✓' : '•';
      break;
    default:
      cellContent = content === null ? 'null' : content;
  }

  return html`<td class="${cellType}-cell">${cellContent}</td>`;
};

const TableHeader = ({ content }: { content: string }) => html`<th>${content}</th>`;

const PrimitiveArrayTable = ({ arr, timezone = 'Pacific/Auckland' }: { arr: unknown[]; timezone?: string }) => (
  html`<table class="array-table">
        <tbody>
          <tr>
            ${arr.map((item, index) => {
    const cellType = getCellType(item);
    return html`<td key=${index} class="${cellType}-cell">${formatPrimitive(item, timezone)}</td>`;
  })}
          </tr>
        </tbody>
      </table>`
);

const BlueHeader = ({ isArray, itemCount, isCollapsed = false }: {
  isArray: boolean;
  itemCount: number;
  isCollapsed?: boolean;
}) => (
  html`<div class="blue-header" data-toggleable="true">
        <span class="toggle-indicator">${isCollapsed ? '▶' : '▼'}</span>
        ${isArray ? 'Array ' : 'Object '}
        <span class="item-count">${itemCount} items</span>
        <span class="fullscreen-button" title="Toggle fullscreen">⛶</span>
      </div>`
);

const CollapsibleWrapper = ({ children, depth, isArray, itemCount, defaultOpenLevels }: {
  children: VNode | VNode[];
  depth: number;
  isArray: boolean;
  itemCount: number;
  defaultOpenLevels: number;
}) => {
  const isCollapsed = depth >= defaultOpenLevels;
  const wrapperClass = `blue-wrapper${isCollapsed ? ' collapsed' : ''}`;

  return html`<div class="${wrapperClass}" data-depth=${depth}>
        <${BlueHeader} isArray=${isArray} itemCount=${itemCount} isCollapsed=${isCollapsed} />
        <div class="content">${children}</div>
      </div>`;
};

const renderContent = (value: unknown, depth: number, defaultOpenLevels: number, timezone: string = 'Pacific/Auckland') => {
  if (Array.isArray(value)) return html`<${ArrayTable} arr=${value} depth=${depth} defaultOpenLevels=${defaultOpenLevels} timezone=${timezone} />`;
  if (isObject(value)) return html`<${ObjectTable} json=${value} depth=${depth} defaultOpenLevels=${defaultOpenLevels} timezone=${timezone} />`;
  return formatPrimitive(value, timezone);
};

const ArrayTable = ({ arr, depth = 0, defaultOpenLevels, timezone = 'Pacific/Auckland' }: {
  arr: unknown[];
  depth?: number;
  defaultOpenLevels: number;
  timezone?: string;
}) => {
  if (arr.length === 0) return html`<div class="empty-array">[]</div>`;
  if (arr.every(isPrimitive)) return html`<${PrimitiveArrayTable} arr=${arr} timezone=${timezone} />`;

  const headers = Array.from(new Set(arr.flatMap(item =>
    isObject(item) ? Object.keys(item as object) : ['Value']
  )));

  return html`<${CollapsibleWrapper} 
    depth=${depth} 
    isArray=${true} 
    itemCount=${arr.length}
    defaultOpenLevels=${defaultOpenLevels}>
    <table class="data-table">
      <thead>
        <tr>
          ${headers.map((header, index) => html`<${TableHeader} key=${`header-${index}`} content=${header} />`)}
        </tr>
      </thead>
      <tbody>
        ${arr.map((item, rowIndex) => html`<tr key=${`row-${rowIndex}`}>
          ${headers.map((header, colIndex) => html`<${TableCell} 
            key=${`cell-${rowIndex}-${colIndex}`} 
            content=${isObject(item) ? (item as Record<string, unknown>)[header] : header === 'Value' ? item : ''} 
            depth=${depth} 
            defaultOpenLevels=${defaultOpenLevels}
            timezone=${timezone}
          />`)}
        </tr>`)}
      </tbody>
    </table>
  </${CollapsibleWrapper}>`;
};

const ObjectTable = ({ json, depth = 0, defaultOpenLevels, timezone = 'Pacific/Auckland' }: {
  json: Record<string, unknown> | null | undefined;
  depth?: number;
  defaultOpenLevels: number;
  timezone?: string;
}) => {
  if (json === undefined) return html`<div>Error: Invalid JSON data</div>`;
  if (json === null) return html`<div>null</div>`;
  if (Array.isArray(json)) return html`<${ArrayTable} arr=${json} depth=${depth} defaultOpenLevels=${defaultOpenLevels} timezone=${timezone} />`;

  const entries = Object.entries(json);

  return html`<${CollapsibleWrapper} 
    depth=${depth} 
    isArray=${false} 
    itemCount=${entries.length}
    defaultOpenLevels=${defaultOpenLevels}>
    <table class="data-table">
      <tbody>
        ${entries.map(([key, value], index) => html`<tr key=${`row-${index}`}>
          <${TableHeader} content=${key} />
          <${TableCell} content=${value} depth=${depth} defaultOpenLevels=${defaultOpenLevels} timezone=${timezone} />
        </tr>`)}
      </tbody>
    </table>
  </${CollapsibleWrapper}>`;
};

const GenerateJsObjectHtml = ({ jsonData, defaultOpenLevels = 3, depth = 0, timezone = 'Pacific/Auckland' }: {
  jsonData: unknown;
  defaultOpenLevels?: number;
  depth?: number;
  timezone?: string;
}) => {
  if (jsonData === undefined) return html`<div>Error: Invalid JSON data</div>`;
  if (jsonData === null) return html`<div>null</div>`;
  if (typeof jsonData === 'string') return html`<div class="plain-string">${jsonData}</div>`;
  if (jsonData instanceof Date) {
    const formatted = formatDate(jsonData, timezone);
    return html`<div class="plain-date"><span class="date-value" data-date=${jsonData.toISOString()}>${formatted}</span></div>`;
  }

  if (typeof jsonData === 'object') {
    if (Array.isArray(jsonData)) {
      return html`<${ArrayTable} arr=${jsonData} depth=${depth} defaultOpenLevels=${defaultOpenLevels} timezone=${timezone} />`;
    }
    return html`<${ObjectTable} json=${jsonData} depth=${depth} defaultOpenLevels=${defaultOpenLevels} timezone=${timezone} />`;
  }

  return formatPrimitive(jsonData, timezone);
};

/** Converts a JavaScript object into an interactive HTML table view with collapsible sections */
// deno-lint-ignore no-explicit-any
export function getHtmlOfObjectTable(object: any, defaultOpenLevels = 3): string {
  const content = render(html`<div class="json-viewer-table">
    <div class="fold-level-indicator">
      <div class="fold-message">Press 1-10 to adjust fold level (current: ${defaultOpenLevels}) | Folding Mode: normal (hold Shift for recursive)</div>
      <div class="timezone-selector">
        <label>Timezone: 
          <select id="timezone-select">
            <option value="Pacific/Auckland" selected>NZ</option>
            <option value="UTC">UTC</option>
          </select>
        </label>
      </div>
    </div>
    ${GenerateJsObjectHtml({ jsonData: object, defaultOpenLevels, timezone: 'Pacific/Auckland' })}
  </div>`);


  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>${styles}</style>
        <script>${clientScript}</script>
      </head>
      <body>
        ${content}
      </body>
    </html>`;
}
