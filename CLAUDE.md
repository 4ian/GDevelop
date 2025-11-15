# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

GDevelop is a full-featured, no-code, open-source game development software for building 2D, 3D and multiplayer games. The codebase is organized into several key components:

- **Core** (C++): Core library describing game structure and IDE tools
- **GDJS** (TypeScript): The game engine using PixiJS and Three.js for rendering
- **GDevelop.js** (C++ → WebAssembly): Bindings allowing C++ code to run in the browser
- **newIDE** (React/Flow): The game editor (web and Electron app)
- **Extensions**: Built-in and extensible game features (objects, behaviors, effects)

## Key Architectural Concepts

### IDE vs Runtime Separation

GDevelop makes a critical distinction between "IDE" (editor) and "Runtime" (game engine):

- **IDE classes** describe the structure of games and provide editing tools (e.g., `gd::Variable` in C++)
- **Runtime classes** execute during gameplay (e.g., `gdjs.Variable` in TypeScript)
- These are completely separate - IDE classes know nothing about Runtime classes

### Events Are Transpiled, Not Interpreted

Events in GDevelop are NOT executed as events during runtime. Instead:
- Events are defined as `gd::Instruction` objects in the IDE
- The code generator (`GDJS/GDJS/Events/CodeGeneration`) transpiles events to TypeScript/JavaScript
- Games run the generated code directly - no "RuntimeEvent" classes exist

### Extension Architecture

Extensions have two parts:
1. **Declaration** (`JsExtension.js`): Describes the extension to the IDE (actions, conditions, objects, behaviors)
2. **Implementation** (`*runtimeobject.ts`, `*runtimebehavior.ts`, `*tools.ts`): TypeScript code that runs in the game engine

When developing extensions, the auto-reload watcher (`import-GDJS-Runtime.js`) copies changes into the IDE automatically.

## Development Commands

### IDE Development (newIDE/app)

```bash
cd newIDE/app
npm install              # Install dependencies
npm start               # Start web app (http://localhost:3000)
npm test                # Run unit tests
npm run flow            # Run Flow type checking
npm run format          # Auto-format code with Prettier
npm run storybook       # Launch Storybook UI component playground
```

For the Electron (desktop) app:
```bash
# Terminal 1: Keep the web app running
cd newIDE/app && npm start

# Terminal 2: Start Electron app
cd newIDE/electron-app
npm install
npm start
```

### Game Engine Development (GDJS)

```bash
cd GDJS
npm install
npm run build           # Build production (minified)
npm run build -- --debug  # Build for debugging (no minification)
npm run check-types     # Run TypeScript type checking
```

Running game engine tests:
```bash
cd GDJS/tests
npm install
npm run test:watch           # Run tests with Chrome Headless
npm run test-benchmark:watch # Include benchmarks
npm run test:firefox:watch   # Run tests with Firefox
```

### Extension Development

Extensions auto-reload when GDevelop IDE is running. To manually import changes:
```bash
cd scripts
node import-GDJS-Runtime.js  # Copy extension declarations and runtime to IDE
```

After modifying extensions:
- **Declaration changes** (`JsExtension.js`): Reload GDevelop (Ctrl+R / Cmd+R in dev console)
- **Runtime changes** (`.ts` files): Relaunch preview in GDevelop

### C++ Development (Core/GDevelop.js)

Only needed when modifying C++ core classes or C++ extensions.

Prerequisites:
- CMake 3.17+
- Node.js
- Emscripten 3.1.21

```bash
# Build GDevelop.js (C++ to WebAssembly)
cd GDevelop.js
npm install
npm run build                    # Production build
npm run build -- --variant=dev   # Faster development build
npm run build -- --variant=debug # Debug build with symbols
npm test                         # Run tests
```

Key file for exposing C++ to JavaScript: `GDevelop.js/Bindings/Bindings.idl`

## Project Structure

```
GDevelop/
├── Core/               # C++ core library (game structure, IDE tools)
│   └── GDCore/
│       ├── Project/    # Classes for Project, Scene, Object, Behavior, etc.
│       └── IDE/        # IDE-specific tools (refactoring, search, etc.)
├── GDJS/              # TypeScript game engine
│   ├── GDJS/          # C++ part (exporters, code generation, builtin extensions)
│   │   ├── Events/CodeGeneration/  # Events → TypeScript transpilation
│   │   └── Extensions/Builtin/     # Builtin extension declarations
│   ├── Runtime/       # TypeScript game engine runtime
│   └── tests/         # Game engine tests
├── GDevelop.js/       # C++ to WebAssembly bindings
│   └── Bindings/
│       └── Bindings.idl  # C++ classes exposed to JavaScript
├── newIDE/
│   ├── app/           # React IDE (web version)
│   │   └── src/       # IDE source code
│   ├── electron-app/  # Electron wrapper for desktop
│   └── web-app/       # Web app deployment scripts
└── Extensions/        # Built-in extensions (not part of Core)
    ├── ExampleJsExtension/  # Example extension (good reference)
    ├── Physics2Behavior/
    ├── PlatformBehavior/
    └── ...
```

## Coding Standards

### For Game Engine (GDJS) and Extensions

- **Language**: TypeScript (ES6 features: `const`/`let`, arrow functions, classes)
- **Performance**: Avoid garbage collection issues
  - Minimize object/array creation in hot paths
  - Reuse objects when possible
  - Declare all properties at object creation (avoid dynamic property addition)
  - Avoid creating functions at runtime
- **Compatibility**: Avoid spread operators, shorthand properties (older browser support)
- **Types**: Strongly type everything; avoid `any` for better documentation and safety
- **Formatting**: Use Prettier (`npm run format` in GDJS/)

### For IDE (newIDE/app)

- **Language**: Modern JavaScript/React with all latest ES features (transpiled by Babel)
- **Types**: Flow for type checking (not TypeScript)
- **Style**: Use arrow functions, classes, destructuring, modern syntax freely
- **Formatting**: Use Prettier (`npm run format` in newIDE/app/)

### Documentation Resources

- Architecture overview: `Core/GDevelop-Architecture-Overview.md`
- GDJS Runtime docs: https://docs.gdevelop.io/GDJS%20Runtime%20Documentation/
- GDCore C++ docs: https://docs.gdevelop.io/GDCore%20Documentation/
- Extension creation: `newIDE/README-extensions.md`

## Testing Workflow

1. **IDE changes**: Run `npm test` in `newIDE/app`
2. **Game engine changes**: Run `npm test` in `GDJS/tests` (requires GDevelop IDE running or manual build)
3. **Extension changes**: Test by previewing in GDevelop IDE after auto-reload
4. **C++ changes**: Rebuild GDevelop.js (`npm run build` in `GDevelop.js/`), then test in IDE

## Common Workflows

### Creating a New Extension

1. Create folder in `Extensions/` with unique name
2. Copy `JsExtension.js` from `Extensions/ExampleJsExtension/`
3. Update extension info with `extension.setExtensionInformation()`
4. Create TypeScript runtime files (`*tools.ts`, `*runtimeobject.ts`, `*runtimebehavior.ts`)
5. Declare actions/conditions/expressions in `JsExtension.js`
6. Use `setIncludeFile()` to reference `.ts` files (with `.ts` extension in path)
7. Run GDevelop IDE - changes auto-reload via watcher

### Modifying Events Code Generation

1. Navigate to `GDJS/GDJS/Events/CodeGeneration/`
2. Modify the appropriate code generator (C++)
3. Rebuild GDevelop.js: `cd GDevelop.js && npm run build`
4. Test in GDevelop IDE by creating/running events

### Working on a Runtime Object or Behavior

1. Edit the TypeScript file in extension folder or `GDJS/Runtime/`
2. Changes auto-reload when GDevelop IDE is running
3. Launch preview in IDE to test changes
4. Check browser console for runtime errors
