/**
 * @packageDocumentation
 * @module Three
 *
 * Re-export the whole Three.js library, so it can be bundled as a single
 * classic script exposing the global `THREE` namespace - as expected by the
 * game engine ("Runtime") scripts, ThreeAddons.js and extensions.
 * (Three.js stopped providing a UMD/global build after r160.)
 */

export * from "three";
