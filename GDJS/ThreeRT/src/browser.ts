// The browser APIs GDJS (and the libraries it embeds: PixiJS, Jolt, events-based extensions) reach for, inside
// ThreeRT's embedded JavaScript runtime (QuickJS), which has no DOM, no timers and no I/O.
//
// - Timers and `requestAnimationFrame` are queued and run by `runTimers` / `runAnimationFrames`, which the ThreeRT
//   frame script calls every frame (`index.ts`).
// - Files are never read: what the game needs to know about its files (images sizes and average colours, models
//   bounds and animations, the text of JSON files) is computed by the export script and embedded in the bundle as
//   the manifest (`manifest.ts`). `fetch` and `XMLHttpRequest` answer from it.
// - The canvas is a stub: a 2D context that measures text roughly and reads back images as their average colour.
import { getManifest, normalizeFilePath } from './manifest';

const g = globalThis as any;

type Timer = { id: number; at: number; fn: Function; args: any[]; every: number | null };
let nextTimerId = 1;
let timers: Timer[] = [];
let currentTimeMs = 0;
/** While true, timers are run as soon as possible (as microtasks), so that loading is not throttled by frames. */
let flushTimersImmediately = true;

export const setFlushTimersImmediately = (value: boolean) => {
  flushTimersImmediately = value;
};

const addTimer = (fn: Function, delay: number, args: any[], every: boolean) => {
  const id = nextTimerId++;
  const timer: Timer = { id, at: currentTimeMs + (delay || 0), fn, args, every: every ? Math.max(1, delay || 0) : null };
  if (typeof fn !== 'function') return id;
  if (flushTimersImmediately && !every) {
    Promise.resolve().then(() => {
      if (!timers.includes(timer)) return;
      timers = timers.filter((t) => t !== timer);
      timer.fn(...timer.args);
    });
  }
  timers.push(timer);
  return id;
};

/** Runs the timers that are due at `nowMs` (the game clock, in ms). */
export const runTimers = (nowMs: number) => {
  currentTimeMs = nowMs;
  const due = timers.filter((t) => t.at <= nowMs);
  if (!due.length) return;
  for (const timer of due) {
    if (timer.every !== null) {
      timer.at = nowMs + timer.every;
    } else {
      timers = timers.filter((t) => t !== timer);
    }
    try {
      timer.fn(...timer.args);
    } catch (error) {
      console.error('Error in a timer: ' + error + (error && (error as Error).stack ? '\n' + (error as Error).stack : ''));
    }
  }
};

let animationFrameCallbacks: Array<{ id: number; fn: (time: number) => void }> = [];
export const runAnimationFrames = (nowMs: number) => {
  const callbacks = animationFrameCallbacks;
  animationFrameCallbacks = [];
  for (const callback of callbacks) callback.fn(nowMs);
};

class EventTargetStub {
  private _listeners: Record<string, Function[]> = {};
  addEventListener(type: string, fn: Function) {
    (this._listeners[type] = this._listeners[type] || []).push(fn);
  }
  removeEventListener(type: string, fn: Function) {
    const list = this._listeners[type];
    if (list) this._listeners[type] = list.filter((f) => f !== fn);
  }
  dispatchEvent(event: any) {
    const list = this._listeners[event && event.type];
    if (list) for (const fn of list.slice()) fn.call(this, event);
    const handler = (this as any)['on' + (event && event.type)];
    if (typeof handler === 'function') handler.call(this, event);
    return true;
  }
}

const styleStub = () =>
  new Proxy({} as Record<string, any>, {
    get: (target, key) => (key in target ? target[key as string] : key === 'setProperty' || key === 'removeProperty' ? () => {} : ''),
    set: (target, key, value) => {
      target[key as string] = value;
      return true;
    },
  });

class ElementStub extends EventTargetStub {
  tagName: string;
  style = styleStub();
  children: ElementStub[] = [];
  childNodes: ElementStub[] = this.children;
  parentNode: ElementStub | null = null;
  parentElement: ElementStub | null = null;
  attributes: Record<string, string> = {};
  dataset: Record<string, string> = {};
  classList = { add() {}, remove() {}, contains: () => false, toggle() {} };
  innerHTML = '';
  textContent = '';
  innerText = '';
  id = '';
  className = '';
  offsetLeft = 0;
  offsetTop = 0;
  scrollLeft = 0;
  scrollTop = 0;
  clientWidth = 0;
  clientHeight = 0;
  constructor(tagName: string) {
    super();
    this.tagName = tagName.toUpperCase();
  }
  get nodeName() {
    return this.tagName;
  }
  appendChild(child: ElementStub) {
    this.children.push(child);
    child.parentNode = this;
    child.parentElement = this;
    return child;
  }
  insertBefore(child: ElementStub) {
    return this.appendChild(child);
  }
  removeChild(child: ElementStub) {
    this.children = this.childNodes = this.children.filter((c) => c !== child);
    child.parentNode = null;
    child.parentElement = null;
    return child;
  }
  remove() {
    if (this.parentNode) this.parentNode.removeChild(this);
  }
  append(...children: ElementStub[]) {
    for (const child of children) if (child && typeof child === 'object') this.appendChild(child);
  }
  prepend(...children: ElementStub[]) {
    this.append(...children);
  }
  setAttribute(name: string, value: string) {
    this.attributes[name] = String(value);
  }
  getAttribute(name: string) {
    return name in this.attributes ? this.attributes[name] : null;
  }
  removeAttribute(name: string) {
    delete this.attributes[name];
  }
  hasAttribute(name: string) {
    return name in this.attributes;
  }
  getBoundingClientRect() {
    return { left: 0, top: 0, right: g.innerWidth, bottom: g.innerHeight, x: 0, y: 0, width: g.innerWidth, height: g.innerHeight };
  }
  querySelector() {
    return null;
  }
  querySelectorAll() {
    return [];
  }
  getElementsByTagName() {
    return [];
  }
  focus() {}
  blur() {}
  click() {}
  requestPointerLock() {}
  requestFullscreen() {
    return Promise.resolve();
  }
  cloneNode() {
    return new ElementStub(this.tagName);
  }
  contains() {
    return false;
  }
}

/** The average colour of an image, as known from the manifest (white when unknown). */
const getAverageColorOf = (image: any): number[] => {
  const file = image && image.__threertFile;
  const info = file ? getManifest().files[file] : null;
  return info && info.averageColor ? info.averageColor : [255, 255, 255, 255];
};

/**
 * A 2D context that draws nothing. Text is measured with an approximation of the width of the glyphs, and images
 * drawn in it read back as filled with their average colour (used by extensions computing average colours).
 */
class Canvas2DContextStub {
  canvas: CanvasStub;
  font = '10px sans-serif';
  fillStyle: any = '#000';
  strokeStyle: any = '#000';
  lineWidth = 1;
  globalAlpha = 1;
  globalCompositeOperation = 'source-over';
  textAlign = 'start';
  textBaseline = 'alphabetic';
  imageSmoothingEnabled = true;
  imageSmoothingQuality = 'low';
  lineJoin = 'miter';
  lineCap = 'butt';
  miterLimit = 10;
  shadowColor = 'rgba(0,0,0,0)';
  shadowBlur = 0;
  shadowOffsetX = 0;
  shadowOffsetY = 0;
  letterSpacing = '0px';
  private _fillColor: number[] | null = null;
  constructor(canvas: CanvasStub) {
    this.canvas = canvas;
  }
  measureText(text: string) {
    const match = /(\d+(\.\d+)?)px/.exec(this.font);
    const fontSize = match ? parseFloat(match[1]) : 10;
    const width = String(text).length * fontSize * 0.55;
    return {
      width,
      actualBoundingBoxLeft: 0,
      actualBoundingBoxRight: width,
      actualBoundingBoxAscent: fontSize * 0.8,
      actualBoundingBoxDescent: fontSize * 0.2,
      fontBoundingBoxAscent: fontSize * 0.8,
      fontBoundingBoxDescent: fontSize * 0.2,
    };
  }
  drawImage(image: any) {
    this._fillColor = getAverageColorOf(image);
  }
  getImageData(x: number, y: number, width: number, height: number) {
    const data = new Uint8ClampedArray(Math.max(0, width * height * 4));
    const color = this._fillColor;
    if (color) {
      for (let i = 0; i < data.length; i += 4) {
        data[i] = color[0];
        data[i + 1] = color[1];
        data[i + 2] = color[2];
        data[i + 3] = color[3];
      }
    }
    return { data, width, height };
  }
  createImageData(width: number, height: number) {
    return { data: new Uint8ClampedArray(width * height * 4), width, height };
  }
  putImageData() {}
  createLinearGradient() {
    return { addColorStop() {} };
  }
  createRadialGradient() {
    return { addColorStop() {} };
  }
  createPattern() {
    return {};
  }
  getTransform() {
    return { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 };
  }
  getLineDash() {
    return [];
  }
  isPointInPath() {
    return false;
  }
}
const noop = () => {};
for (const name of [
  'fillRect', 'clearRect', 'strokeRect', 'fillText', 'strokeText', 'beginPath', 'closePath', 'moveTo', 'lineTo',
  'arc', 'arcTo', 'rect', 'ellipse', 'quadraticCurveTo', 'bezierCurveTo', 'fill', 'stroke', 'clip', 'save',
  'restore', 'translate', 'rotate', 'scale', 'setTransform', 'transform', 'resetTransform', 'setLineDash', 'roundRect',
]) {
  (Canvas2DContextStub.prototype as any)[name] = noop;
}

class CanvasStub extends ElementStub {
  width = 300;
  height = 150;
  private _context2D: Canvas2DContextStub | null = null;
  constructor() {
    super('canvas');
  }
  getContext(type: string) {
    if (type === '2d') return (this._context2D = this._context2D || new Canvas2DContextStub(this));
    return null;
  }
  toDataURL() {
    return 'data:image/png;base64,';
  }
  toBlob(callback: Function) {
    callback(null);
  }
  captureStream() {
    return null;
  }
}

/** An image of the game: its size comes from the manifest; it "loads" asynchronously as a browser image does. */
class ImageStub extends ElementStub {
  private _src = '';
  __threertFile = '';
  width = 0;
  height = 0;
  naturalWidth = 0;
  naturalHeight = 0;
  complete = false;
  crossOrigin: string | null = null;
  decoding = 'auto';
  onload: Function | null = null;
  onerror: Function | null = null;
  constructor(width?: number, height?: number) {
    super('img');
    if (width) this.width = width;
    if (height) this.height = height;
  }
  get src() {
    return this._src;
  }
  set src(value: string) {
    this._src = value;
    this.complete = false;
    const file = normalizeFilePath(value);
    const info = getManifest().files[file];
    this.__threertFile = file;
    Promise.resolve().then(() => {
      if (info && info.width) {
        this.width = this.naturalWidth = info.width;
        this.height = this.naturalHeight = info.height;
        this.complete = true;
        this.dispatchEvent({ type: 'load', target: this });
      } else {
        this.dispatchEvent({ type: 'error', target: this, message: 'Unknown image: ' + value });
      }
    });
  }
  decode() {
    return Promise.resolve();
  }
}

class MediaStub extends ElementStub {
  src = '';
  paused = true;
  currentTime = 0;
  duration = 0;
  volume = 1;
  muted = false;
  loop = false;
  readyState = 0;
  play() {
    return Promise.resolve();
  }
  pause() {}
  load() {}
  canPlayType() {
    return '';
  }
}

class ResponseStub {
  ok: boolean;
  status: number;
  url: string;
  private _text: string | null;
  constructor(url: string, text: string | null) {
    this.url = url;
    this._text = text;
    this.ok = text !== null;
    this.status = text !== null ? 200 : 404;
  }
  text() {
    return this._text !== null ? Promise.resolve(this._text) : Promise.reject(new Error('Not found: ' + this.url));
  }
  json() {
    return this.text().then((text) => JSON.parse(text));
  }
  arrayBuffer() {
    return this.text().then((text) => {
      const buffer: any = new TextEncoder().encode(text).buffer;
      // (WebAssembly modules are found by the name of their file: see wasm.ts.)
      buffer.__threertFile = this.url;
      return buffer;
    });
  }
  blob() {
    return this.text();
  }
}

/** The text of a file of the game: from the manifest for text files, empty for the others (fonts...), else null. */
const getTextOfFile = (url: string): string | null => {
  // WebAssembly modules are in the bundle, converted to JavaScript (wasm.ts): their files are empty.
  if (/\.wasm$/.test(normalizeFilePath(url))) return '';
  const info = getManifest().files[normalizeFilePath(url)];
  if (!info) return null;
  return typeof info.text === 'string' ? info.text : '';
};

class XMLHttpRequestStub extends EventTargetStub {
  readyState = 0;
  status = 0;
  responseText = '';
  response: any = null;
  responseType = '';
  withCredentials = false;
  onload: Function | null = null;
  onerror: Function | null = null;
  onreadystatechange: Function | null = null;
  private _url = '';
  open(method: string, url: string) {
    this._url = url;
    this.readyState = 1;
  }
  setRequestHeader() {}
  overrideMimeType() {}
  abort() {}
  getResponseHeader() {
    return null;
  }
  getAllResponseHeaders() {
    return '';
  }
  send() {
    const text = getTextOfFile(this._url);
    Promise.resolve().then(() => {
      this.readyState = 4;
      if (text === null) {
        this.status = 404;
        this.dispatchEvent({ type: 'error', target: this });
      } else {
        this.status = 200;
        this.responseText = text;
        this.response = this.responseType === 'json' ? JSON.parse(text) : text;
        this.dispatchEvent({ type: 'readystatechange', target: this });
        this.dispatchEvent({ type: 'load', target: this });
      }
    });
  }
}

class TextDecoderStub {
  get encoding() {
    return 'utf-8';
  }
  decode(input?: ArrayBuffer | ArrayBufferView) {
    if (!input) return '';
    const bytes =
      input instanceof ArrayBuffer ? new Uint8Array(input) : new Uint8Array(input.buffer, input.byteOffset, input.byteLength);
    let out = '';
    for (let i = 0; i < bytes.length; ) {
      const c = bytes[i++];
      let code = c;
      if (c >= 0xf0) {
        code = ((c & 7) << 18) | ((bytes[i++] & 63) << 12) | ((bytes[i++] & 63) << 6) | (bytes[i++] & 63);
      } else if (c >= 0xe0) {
        code = ((c & 15) << 12) | ((bytes[i++] & 63) << 6) | (bytes[i++] & 63);
      } else if (c >= 0xc0) {
        code = ((c & 31) << 6) | (bytes[i++] & 63);
      }
      out += String.fromCodePoint(code);
    }
    return out;
  }
}

class URLStub {
  href: string;
  protocol = 'threert:';
  host = 'game';
  hostname = 'game';
  port = '';
  pathname: string;
  search = '';
  hash = '';
  origin = 'threert://game';
  searchParams = { get: () => null, has: () => false, set() {}, append() {}, toString: () => '' };
  constructor(url: string, base?: string) {
    const isAbsolute = /^[a-z][a-z0-9+.-]*:/i.test(url);
    this.href = isAbsolute || !base ? url : base.replace(/[^/]*$/, '') + url;
    this.pathname = this.href.replace(/^[a-z][a-z0-9+.-]*:\/\/[^/]*/i, '');
  }
  toString() {
    return this.href;
  }
  static createObjectURL() {
    return 'blob:threert';
  }
  static revokeObjectURL() {}
}

const createStorage = () => {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => (values.has(key) ? values.get(key)! : null),
    setItem: (key: string, value: string) => void values.set(key, String(value)),
    removeItem: (key: string) => void values.delete(key),
    clear: () => values.clear(),
    key: (index: number) => Array.from(values.keys())[index] ?? null,
    get length() {
      return values.size;
    },
  };
};

export const gameViewport = { width: 1280, height: 720 };

/** Installs the browser globals on `globalThis` (only those missing: QuickJS has `console`, `performance`...). */
export const installBrowserShims = () => {
  const define = (name: string, value: any) => {
    if (typeof g[name] === 'undefined') g[name] = value;
  };
  define('window', g);
  define('self', g);
  define('top', g);
  define('parent', g);
  define('setTimeout', (fn: Function, delay?: number, ...args: any[]) => addTimer(fn, delay || 0, args, false));
  define('setInterval', (fn: Function, delay?: number, ...args: any[]) => addTimer(fn, delay || 0, args, true));
  define('clearTimeout', (id: number) => void (timers = timers.filter((t) => t.id !== id)));
  define('clearInterval', (id: number) => void (timers = timers.filter((t) => t.id !== id)));
  define('setImmediate', (fn: Function, ...args: any[]) => addTimer(fn, 0, args, false));
  define('queueMicrotask', (fn: () => void) => void Promise.resolve().then(fn));
  define('requestAnimationFrame', (fn: (time: number) => void) => {
    const id = nextTimerId++;
    animationFrameCallbacks.push({ id, fn });
    return id;
  });
  define('cancelAnimationFrame', (id: number) => {
    animationFrameCallbacks = animationFrameCallbacks.filter((c) => c.id !== id);
  });
  define('TextDecoder', TextDecoderStub);
  define('Intl', {
    NumberFormat: class {
      format(n: number) {
        return String(n);
      }
      resolvedOptions() {
        return { locale: 'en-US' };
      }
    },
    DateTimeFormat: class {
      format(d: Date) {
        return String(d);
      }
      resolvedOptions() {
        return { locale: 'en-US', timeZone: 'UTC' };
      }
    },
  });
  define('URL', URLStub);
  define('btoa', (s: string) => {
    const A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    let out = '';
    for (let i = 0; i < s.length; i += 3) {
      const a = s.charCodeAt(i), b = s.charCodeAt(i + 1), c = s.charCodeAt(i + 2);
      out += A[a >> 2] + A[((a & 3) << 4) | (b >> 4 || 0)];
      out += i + 1 < s.length ? A[((b & 15) << 2) | (c >> 6 || 0)] : '=';
      out += i + 2 < s.length ? A[c & 63] : '=';
    }
    return out;
  });
  define('crypto', {
    getRandomValues: (array: any) => {
      for (let i = 0; i < array.length; i++) array[i] = Math.floor(Math.random() * 256);
      return array;
    },
    randomUUID: () =>
      'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        return (c === 'x' ? r : (r & 3) | 8).toString(16);
      }),
  });
  define('localStorage', createStorage());
  define('sessionStorage', createStorage());
  define('devicePixelRatio', 1);
  Object.defineProperty(g, 'innerWidth', { get: () => gameViewport.width, configurable: true });
  Object.defineProperty(g, 'innerHeight', { get: () => gameViewport.height, configurable: true });
  define('outerWidth', 1280);
  define('outerHeight', 720);
  define('screen', {
    get width() {
      return gameViewport.width;
    },
    get height() {
      return gameViewport.height;
    },
    availWidth: 1280,
    availHeight: 720,
    orientation: { type: 'landscape-primary', angle: 0, lock: () => Promise.resolve(), unlock() {}, addEventListener() {} },
  });
  define('navigator', {
    userAgent: 'Mozilla/5.0 (ThreeRT) GDevelop',
    platform: 'ThreeRT',
    vendor: '',
    language: 'en-US',
    languages: ['en-US', 'en'],
    onLine: false,
    maxTouchPoints: 0,
    hardwareConcurrency: 1,
    getGamepads: () => [],
    vibrate: () => false,
  });
  define('location', {
    href: 'threert://game/index.html',
    protocol: 'threert:',
    host: 'game',
    hostname: 'game',
    origin: 'threert://game',
    pathname: '/index.html',
    search: '',
    hash: '',
    reload() {},
    replace() {},
    assign() {},
  });
  define('history', { pushState() {}, replaceState() {}, back() {} });
  const windowEvents = new EventTargetStub();
  define('addEventListener', windowEvents.addEventListener.bind(windowEvents));
  define('removeEventListener', windowEvents.removeEventListener.bind(windowEvents));
  define('dispatchEvent', windowEvents.dispatchEvent.bind(windowEvents));
  define('focus', () => {});
  define('open', () => null);
  define('alert', (message: any) => console.warn('alert: ' + message));
  define('confirm', () => false);
  define('prompt', () => null);
  define('matchMedia', () => ({ matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} }));
  define('getComputedStyle', () => styleStub());

  const documentElement = new ElementStub('html');
  const head = new ElementStub('head');
  const body = new ElementStub('body');
  documentElement.appendChild(head);
  documentElement.appendChild(body);
  const documentEvents = new EventTargetStub();
  define('document', {
    documentElement,
    head,
    body,
    title: '',
    hidden: false,
    visibilityState: 'visible',
    readyState: 'complete',
    activeElement: body,
    pointerLockElement: null,
    fullscreenElement: null,
    cookie: '',
    referrer: '',
    fonts: { add() {}, load: () => Promise.resolve([]), check: () => true, ready: Promise.resolve(), addEventListener() {} },
    addEventListener: documentEvents.addEventListener.bind(documentEvents),
    removeEventListener: documentEvents.removeEventListener.bind(documentEvents),
    dispatchEvent: documentEvents.dispatchEvent.bind(documentEvents),
    createElement: (tagName: string) => {
      const tag = String(tagName).toLowerCase();
      if (tag === 'canvas') return new CanvasStub();
      if (tag === 'img') return new ImageStub();
      if (tag === 'video' || tag === 'audio') return new MediaStub(tag);
      return new ElementStub(tag);
    },
    createElementNS: (_ns: string, tagName: string) => g.document.createElement(tagName),
    createTextNode: (text: string) => Object.assign(new ElementStub('#text'), { textContent: text }),
    createDocumentFragment: () => new ElementStub('#fragment'),
    getElementById: () => null,
    getElementsByTagName: (tag: string) => (tag === 'body' ? [body] : tag === 'head' ? [head] : []),
    getElementsByClassName: () => [],
    querySelector: () => null,
    querySelectorAll: () => [],
    exitPointerLock() {},
    exitFullscreen: () => Promise.resolve(),
    hasFocus: () => true,
  });
  define('HTMLElement', ElementStub);
  define('Element', ElementStub);
  define('Node', ElementStub);
  define('EventTarget', EventTargetStub);
  define('HTMLCanvasElement', CanvasStub);
  define('HTMLImageElement', ImageStub);
  define('Image', ImageStub);
  define('HTMLVideoElement', MediaStub);
  define('HTMLAudioElement', MediaStub);
  define('Audio', MediaStub);
  define('XMLHttpRequest', XMLHttpRequestStub);
  define('fetch', (url: any) => {
    const href = typeof url === 'string' ? url : url && url.url ? url.url : String(url);
    return Promise.resolve(new ResponseStub(href, getTextOfFile(href)));
  });
  define('Event', class {
    type: string;
    constructor(type: string) {
      this.type = type;
    }
  });
  define('CustomEvent', class {
    type: string;
    detail: any;
    constructor(type: string, options?: any) {
      this.type = type;
      this.detail = options && options.detail;
    }
  });
  define('Blob', class {
    parts: any[];
    constructor(parts: any[]) {
      this.parts = parts;
    }
  });
  define('FontFace', class {
    family: string;
    constructor(family: string) {
      this.family = family;
    }
    load() {
      return Promise.resolve(this);
    }
  });
  define('ResizeObserver', class {
    observe() {}
    unobserve() {}
    disconnect() {}
  });
  define('MutationObserver', class {
    observe() {}
    disconnect() {}
  });
};
