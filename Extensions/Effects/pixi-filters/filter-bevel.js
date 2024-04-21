/*!
 * @pixi/filter-bevel - v5.1.1
 * Compiled Thu, 31 Aug 2023 09:18:38 UTC
 *
 * @pixi/filter-bevel is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 */var __filters=function(t,r){"use strict";var i=`attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat3 projectionMatrix;

varying vec2 vTextureCoord;

void main(void)
{
    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    vTextureCoord = aTextureCoord;
}`,s=`precision mediump float;

varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform vec4 filterArea;

uniform float transformX;
uniform float transformY;
uniform vec3 lightColor;
uniform float lightAlpha;
uniform vec3 shadowColor;
uniform float shadowAlpha;

void main(void) {
    vec2 transform = vec2(1.0 / filterArea) * vec2(transformX, transformY);
    vec4 color = texture2D(uSampler, vTextureCoord);
    float light = texture2D(uSampler, vTextureCoord - transform).a;
    float shadow = texture2D(uSampler, vTextureCoord + transform).a;

    color.rgb = mix(color.rgb, lightColor, clamp((color.a - light) * lightAlpha, 0.0, 1.0));
    color.rgb = mix(color.rgb, shadowColor, clamp((color.a - shadow) * shadowAlpha, 0.0, 1.0));
    gl_FragColor = vec4(color.rgb * color.a, color.a);
}
`;class n extends r.Filter{constructor(o){super(i,s),this._thickness=2,this._angle=0,this.uniforms.lightColor=new Float32Array(3),this.uniforms.shadowColor=new Float32Array(3),Object.assign(this,{rotation:45,thickness:2,lightColor:16777215,lightAlpha:.7,shadowColor:0,shadowAlpha:.7},o),this.padding=1}_updateTransform(){this.uniforms.transformX=this._thickness*Math.cos(this._angle),this.uniforms.transformY=this._thickness*Math.sin(this._angle)}get rotation(){return this._angle/r.DEG_TO_RAD}set rotation(o){this._angle=o*r.DEG_TO_RAD,this._updateTransform()}get thickness(){return this._thickness}set thickness(o){this._thickness=o,this._updateTransform()}get lightColor(){return r.utils.rgb2hex(this.uniforms.lightColor)}set lightColor(o){r.utils.hex2rgb(o,this.uniforms.lightColor)}get lightAlpha(){return this.uniforms.lightAlpha}set lightAlpha(o){this.uniforms.lightAlpha=o}get shadowColor(){return r.utils.rgb2hex(this.uniforms.shadowColor)}set shadowColor(o){r.utils.hex2rgb(o,this.uniforms.shadowColor)}get shadowAlpha(){return this.uniforms.shadowAlpha}set shadowAlpha(o){this.uniforms.shadowAlpha=o}}return t.BevelFilter=n,Object.defineProperty(t,"__esModule",{value:!0}),t}({},PIXI);Object.assign(PIXI.filters,__filters);
