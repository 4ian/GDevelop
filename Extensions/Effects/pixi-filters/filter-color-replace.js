/*!
 * @pixi/filter-color-replace - v5.1.1
 * Compiled Thu, 31 Aug 2023 09:18:38 UTC
 *
 * @pixi/filter-color-replace is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 */var __filters=function(n,e){"use strict";var i=`attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat3 projectionMatrix;

varying vec2 vTextureCoord;

void main(void)
{
    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    vTextureCoord = aTextureCoord;
}`,t=`varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform vec3 originalColor;
uniform vec3 newColor;
uniform float epsilon;
void main(void) {
    vec4 currentColor = texture2D(uSampler, vTextureCoord);
    vec3 colorDiff = originalColor - (currentColor.rgb / max(currentColor.a, 0.0000000001));
    float colorDistance = length(colorDiff);
    float doReplace = step(colorDistance, epsilon);
    gl_FragColor = vec4(mix(currentColor.rgb, (newColor + colorDiff) * currentColor.a, doReplace), currentColor.a);
}
`;class l extends e.Filter{constructor(r=16711680,o=0,s=.4){super(i,t),this._originalColor=16711680,this._newColor=0,this.uniforms.originalColor=new Float32Array(3),this.uniforms.newColor=new Float32Array(3),this.originalColor=r,this.newColor=o,this.epsilon=s}set originalColor(r){const o=this.uniforms.originalColor;typeof r=="number"?(e.utils.hex2rgb(r,o),this._originalColor=r):(o[0]=r[0],o[1]=r[1],o[2]=r[2],this._originalColor=e.utils.rgb2hex(o))}get originalColor(){return this._originalColor}set newColor(r){const o=this.uniforms.newColor;typeof r=="number"?(e.utils.hex2rgb(r,o),this._newColor=r):(o[0]=r[0],o[1]=r[1],o[2]=r[2],this._newColor=e.utils.rgb2hex(o))}get newColor(){return this._newColor}set epsilon(r){this.uniforms.epsilon=r}get epsilon(){return this.uniforms.epsilon}}return n.ColorReplaceFilter=l,Object.defineProperty(n,"__esModule",{value:!0}),n}({},PIXI);Object.assign(PIXI.filters,__filters);
