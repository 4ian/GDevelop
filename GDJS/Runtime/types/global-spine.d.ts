import * as spineModule from '@esotericsoftware/spine-pixi-v7';

// `export as namespace spine` does not expose the namespace in TypeScript 7
// for this ES module package, so it's declared as a global alias instead.
declare global {
  export import spine = spineModule;
}
