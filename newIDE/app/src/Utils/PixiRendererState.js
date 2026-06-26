// @flow

export const clearPixiCachedShader = (pixiRenderer: any) => {
  if (pixiRenderer.shader) {
    pixiRenderer.shader.reset();
  }
};

export const resetPixiRendererState = (pixiRenderer: any) => {
  // Pixi's renderer reset binds the render texture before resetting the shader
  // system. When Three.js shares the WebGL context, the current GL program can
  // belong to Three while Pixi still has a cached shader. Clear it first so
  // projection updates don't upload uniforms to a stale program.
  clearPixiCachedShader(pixiRenderer);
  pixiRenderer.reset();
};
