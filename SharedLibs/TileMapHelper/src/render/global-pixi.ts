import * as PixiModule from "pixi.js";

declare global {
  /**
   * This namespace contains the `PIXI` module, and should always be used to access to PixiJS apis.
   *
   * Rationale:
   * PixiJS typings are sadly not available anymore as an "ambient namespace" in TypeScript.
   * To expose the typings as a global object, we need to use the "export import" syntax.
   * This only works in a namespace, that we call GlobalPIXIModule.
   *
   * This at least allows to easily find in the codebase all the dependencies on PixiJS in the GDJS
   * runtime and extensions.
   *
   * Note that we also modified the bundled `pixi.js` file to create a global variable called
   * `GlobalPIXIModule`, containing the `PIXI` object.
   * Note that we could use `export as namespace`, but this crash the TypeScript compiler.
   */
  namespace GlobalPIXIModule {
    export import PIXI = PixiModule;
  }
}
