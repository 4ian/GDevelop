import * as THREE from 'three';

// declare global {
//   /**
//    * This namespace contains the `THREE` module, and should always be used to access to three.js apis.
//    *
//    * Rationale:
//    * three.js typings are sadly not available anymore as an "ambient namespace" in TypeScript.
//    * To expose the typings as a global object, we need to use the "export import" syntax.
//    * This only works in a namespace, that we call GlobalTHREEModule.
//    *
//    * This at least allows to easily find in the codebase all the dependencies on three.js in the GDJS
//    * runtime and extensions.
//    *
//    * Note that we also modified the bundled `three.js` file to create a global variable called
//    * `GlobalTHREEModule`, containing the `THREE` object.
//    * Note that we could use `export as namespace`, but this crash the TypeScript compiler.
//    */
//   namespace GlobalTHREEModule {
//     export import THREE = THREEModule;
//   }
// }


export as namespace THREE

