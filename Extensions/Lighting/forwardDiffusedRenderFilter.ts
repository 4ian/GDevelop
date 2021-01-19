namespace gdjs {
  
  export class ForwardDiffusedRenderFilter {
    _filter: PIXI.Filter;
    _renderer: gdjs.RuntimeScenePixiRenderer

    constructor(runtimeSceneRenderer) {
      this._filter = new PIXI.Filter(
        undefined,
        gdjs.ForwardDiffusedRenderFilter.fragmentShader
      );
      this._renderer = runtimeSceneRenderer;
    }

    static fragmentShader = `
      varying vec2 vTextureCoord;
      uniform sampler2D uSampler;
      void main(void)
      {
          gl_FragColor = texture2D(uSampler, vTextureCoord);
      }
    `;

    apply() {}
  }
}
