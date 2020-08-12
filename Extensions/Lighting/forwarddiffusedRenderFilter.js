/**
 * A pixi filter for diffused rendering. 
 * @param {gdjs.RuntimeSceneRenderer} runtimeSceneRenderer 
 */
gdjs.ForwardDiffusedRenderFilter = function (runtimeSceneRenderer) {
    this._filter = new PIXI.Filter(null, gdjs.ForwardDiffusedRenderFilter.fragmentShader);
    this._renderer = runtimeSceneRenderer;
}

gdjs.ForwardDiffusedRenderFilter.fragmentShader = `
    varying vec2 vTextureCoord;
    uniform sampler2D uSampler;
    void main(void)
    {
        gl_FragColor = texture2D(uSampler, vTextureCoord);
    }
`;

gdjs.ForwardDiffusedRenderFilter.prototype.apply = function () {

}
