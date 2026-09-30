// @flow

/**
 * The folder containing the Draco decoder files (used to read compressed 3D
 * models), relative to the editor index.html.
 */
export const dracoDecoderPath = './external/draco/gltf/';

export type DracoDecoderFiles = {|
  dracoWasmWrapperJs: ArrayBuffer,
  dracoDecoderWasm: ArrayBuffer,
|};

/**
 * Read the content of the Draco decoder files.
 *
 * Useful to pass them to a worker: a worker can't read them by itself in the
 * desktop app, because `file://` URLs can't be fetched by workers (`webSecurity:
 * false` only applies to the renderer process).
 */
export const loadDracoDecoderFiles = async (): Promise<DracoDecoderFiles> => {
  const [dracoWasmWrapperJs, dracoDecoderWasm] = await Promise.all(
    ['draco_wasm_wrapper.js', 'draco_decoder.wasm'].map(async fileName => {
      const response = await fetch(dracoDecoderPath + fileName);
      if (!response.ok) {
        throw new Error(
          `Can't read the Draco decoder file "${fileName}" (HTTP error ${
            response.status
          }).`
        );
      }
      return response.arrayBuffer();
    })
  );

  return { dracoWasmWrapperJs, dracoDecoderWasm };
};
