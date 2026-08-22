// @flow

/**
 * Resolve the folder containing the editor Draco decoder files
 * (`draco_wasm_wrapper.js` and `draco_decoder.wasm`).
 *
 * On the web-app these files are served from `/external/draco/gltf/` at the
 * origin, so a path relative to a client-side route would 404. On Electron
 * they live next to `index.html`, so we resolve from the page URL.
 */
export const getEditorDracoDecoderPath = (): string => {
  if (typeof window === 'undefined') {
    return './external/draco/gltf/';
  }
  const protocol = window.location.protocol;
  if (protocol === 'http:' || protocol === 'https:') {
    return `${window.location.origin}/external/draco/gltf/`;
  }
  try {
    return new URL('./external/draco/gltf/', window.location.href).href;
  } catch (e) {
    return './external/draco/gltf/';
  }
};
