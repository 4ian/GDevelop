/*!
 * @pixi/filter-rgb-split - v5.1.1
 * Compiled Thu, 31 Aug 2023 09:18:38 UTC
 *
 * @pixi/filter-rgb-split is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 */var __filters=function(r,t){"use strict";var n=`attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat3 projectionMatrix;

varying vec2 vTextureCoord;

void main(void)
{
    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    vTextureCoord = aTextureCoord;
}`,i=`precision mediump float;

varying vec2 vTextureCoord;

uniform sampler2D uSampler;
uniform vec4 filterArea;
uniform vec2 red;
uniform vec2 green;
uniform vec2 blue;

void main(void)
{
   gl_FragColor.r = texture2D(uSampler, vTextureCoord + red/filterArea.xy).r;
   gl_FragColor.g = texture2D(uSampler, vTextureCoord + green/filterArea.xy).g;
   gl_FragColor.b = texture2D(uSampler, vTextureCoord + blue/filterArea.xy).b;
   gl_FragColor.a = texture2D(uSampler, vTextureCoord).a;
}
`;class o extends t.Filter{constructor(e=[-10,0],u=[0,10],a=[0,0]){super(n,i),this.red=e,this.green=u,this.blue=a}get red(){return this.uniforms.red}set red(e){this.uniforms.red=e}get green(){return this.uniforms.green}set green(e){this.uniforms.green=e}get blue(){return this.uniforms.blue}set blue(e){this.uniforms.blue=e}}return r.RGBSplitFilter=o,Object.defineProperty(r,"__esModule",{value:!0}),r}({},PIXI);Object.assign(PIXI.filters,__filters);
