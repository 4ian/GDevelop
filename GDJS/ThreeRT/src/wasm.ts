// WebAssembly in ThreeRT's JavaScript engine (QuickJS has none): the libraries of GDJS compiled to WebAssembly
// (Recast for NavMesh pathfinding...) are converted to JavaScript by the build script (binaryen's wasm2js) and
// registered here by the name of their .wasm file. `WebAssembly.instantiate` / `instantiateStreaming` run them.
//
// The JavaScript of a module is `(imports) => exports`, the `asmFunc` of wasm2js: its memory and its table are
// JavaScript objects (`buffer` / `grow`, an array with `get` / `set` / `grow`).
import { normalizeFilePath } from './manifest';

type CompiledModule = (imports: any) => Record<string, any>;
const g = globalThis as any;
const compiledModules: Record<string, CompiledModule> = (g.__GDJS_THREERT_WASM__ = g.__GDJS_THREERT_WASM__ || {});
/** ES modules imported with `import()` by GDJS (the glue code of the WebAssembly libraries). */
const importedModules: Record<string, any> = (g.__GDJS_THREERT_MODULES__ = g.__GDJS_THREERT_MODULES__ || {});

const baseName = (path: string) => normalizeFilePath(path).split('/').pop() || '';

class CompileError extends Error {}
class LinkError extends Error {}
class RuntimeError extends Error {}

class Module {
  readonly __threertName: string | null;
  readonly __threertBytes: any;
  constructor(bytes: any) {
    this.__threertBytes = bytes;
    this.__threertName = bytes && bytes.__threertFile ? baseName(bytes.__threertFile) : null;
  }
  static exports() {
    return [];
  }
  static imports() {
    return [];
  }
  static customSections() {
    return [];
  }
}

class Instance {
  readonly exports: Record<string, any>;
  constructor(module: Module, imports: any) {
    const compiled = module.__threertName ? compiledModules[module.__threertName] : null;
    if (compiled) {
      this.exports = compiled(imports);
    } else if (imports && imports.e && typeof imports.e.f === 'function') {
      // Emscripten's `convertJsFunctionToWasm`: a module made of one function importing it; wasm2js tables hold
      // JavaScript functions, the function is its own export.
      this.exports = { f: imports.e.f };
    } else {
      const names = Object.keys(compiledModules);
      if (names.length === 1) this.exports = compiledModules[names[0]](imports);
      else throw new LinkError('Unknown WebAssembly module (it was not converted to JavaScript by the build).');
    }
  }
}

class Memory {
  buffer: ArrayBuffer;
  constructor(descriptor: { initial: number; maximum?: number }) {
    this.buffer = new ArrayBuffer((descriptor.initial || 0) * 65536);
  }
  grow(pages: number) {
    const old = this.buffer.byteLength / 65536;
    const buffer = new ArrayBuffer(this.buffer.byteLength + pages * 65536);
    new Uint8Array(buffer).set(new Uint8Array(this.buffer));
    this.buffer = buffer;
    return old;
  }
}

class Table extends Array<any> {
  constructor(descriptor?: { initial?: number }) {
    super();
    this.length = (descriptor && descriptor.initial) || 0;
  }
  get(index: number) {
    return this[index];
  }
  set(index: number, value: any) {
    this[index] = value;
  }
  grow(count: number) {
    const old = this.length;
    this.length += count;
    return old;
  }
  static get [Symbol.species]() {
    return Array;
  }
}

const instantiate = (source: any, imports: any): Promise<any> => {
  try {
    if (source instanceof Module) return Promise.resolve(new Instance(source, imports));
    const module = new Module(source);
    return Promise.resolve({ module, instance: new Instance(module, imports) });
  } catch (error) {
    return Promise.reject(error);
  }
};

export const installWebAssembly = () => {
  if (typeof g.WebAssembly !== 'undefined') return;
  g.WebAssembly = {
    Module,
    Instance,
    Memory,
    Table,
    CompileError,
    LinkError,
    RuntimeError,
    Global: class {
      value: any;
      constructor(_descriptor: any, value: any) {
        this.value = value;
      }
    },
    validate: () => true,
    compile: (bytes: any) => Promise.resolve(new Module(bytes)),
    instantiate,
    instantiateStreaming: (response: any, imports: any) =>
      Promise.resolve(response).then((r: any) => {
        const bytes: any = new ArrayBuffer(0);
        bytes.__threertFile = r && r.url ? r.url : '';
        return instantiate(bytes, imports);
      }),
    compileStreaming: (response: any) =>
      Promise.resolve(response).then((r: any) => {
        const bytes: any = new ArrayBuffer(0);
        bytes.__threertFile = r && r.url ? r.url : '';
        return new Module(bytes);
      }),
  };
};

/** `import(path)` of GDJS scripts, for the modules embedded in the bundle. */
export const importModule = (path: string) =>
  // (Looked up once the bundle is evaluated: modules come after the scripts importing them.)
  Promise.resolve().then(() => {
    const module = importedModules[path];
    if (!module) throw new Error('Module not in the bundle: ' + path);
    return module;
  });
