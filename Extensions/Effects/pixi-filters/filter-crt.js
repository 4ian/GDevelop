/*!
 * @pixi/filter-crt - v5.1.1
 * Compiled Thu, 31 Aug 2023 09:18:38 UTC
 *
 * @pixi/filter-crt is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 */var __filters=function(i,o){"use strict";var s=`attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat3 projectionMatrix;

varying vec2 vTextureCoord;

void main(void)
{
    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    vTextureCoord = aTextureCoord;
}`,u=`varying vec2 vTextureCoord;
uniform sampler2D uSampler;

uniform vec4 filterArea;
uniform vec2 dimensions;

const float SQRT_2 = 1.414213;

const float light = 1.0;

uniform float curvature;
uniform float lineWidth;
uniform float lineContrast;
uniform bool verticalLine;
uniform float noise;
uniform float noiseSize;

uniform float vignetting;
uniform float vignettingAlpha;
uniform float vignettingBlur;

uniform float seed;
uniform float time;

float rand(vec2 co) {
    return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

void main(void)
{
    vec2 pixelCoord = vTextureCoord.xy * filterArea.xy;
    vec2 dir = vec2(vTextureCoord.xy * filterArea.xy / dimensions - vec2(0.5, 0.5));
    
    gl_FragColor = texture2D(uSampler, vTextureCoord);
    vec3 rgb = gl_FragColor.rgb;

    if (noise > 0.0 && noiseSize > 0.0)
    {
        pixelCoord.x = floor(pixelCoord.x / noiseSize);
        pixelCoord.y = floor(pixelCoord.y / noiseSize);
        float _noise = rand(pixelCoord * noiseSize * seed) - 0.5;
        rgb += _noise * noise;
    }

    if (lineWidth > 0.0)
    {
        float _c = curvature > 0. ? curvature : 1.;
        float k = curvature > 0. ?(length(dir * dir) * 0.25 * _c * _c + 0.935 * _c) : 1.;
        vec2 uv = dir * k;

        float v = (verticalLine ? uv.x * dimensions.x : uv.y * dimensions.y) * min(1.0, 2.0 / lineWidth ) / _c;
        float j = 1. + cos(v * 1.2 - time) * 0.5 * lineContrast;
        rgb *= j;
        float segment = verticalLine ? mod((dir.x + .5) * dimensions.x, 4.) : mod((dir.y + .5) * dimensions.y, 4.);
        rgb *= 0.99 + ceil(segment) * 0.015;
    }

    if (vignetting > 0.0)
    {
        float outter = SQRT_2 - vignetting * SQRT_2;
        float darker = clamp((outter - length(dir) * SQRT_2) / ( 0.00001 + vignettingBlur * SQRT_2), 0.0, 1.0);
        rgb *= darker + (1.0 - darker) * (1.0 - vignettingAlpha);
    }

    gl_FragColor.rgb = rgb;
}
`;const e=class extends o.Filter{constructor(n){super(s,u),this.time=0,this.seed=0,this.uniforms.dimensions=new Float32Array(2),Object.assign(this,e.defaults,n)}apply(n,r,l,a){const{width:g,height:v}=r.filterFrame;this.uniforms.dimensions[0]=g,this.uniforms.dimensions[1]=v,this.uniforms.seed=this.seed,this.uniforms.time=this.time,n.applyFilter(this,r,l,a)}set curvature(n){this.uniforms.curvature=n}get curvature(){return this.uniforms.curvature}set lineWidth(n){this.uniforms.lineWidth=n}get lineWidth(){return this.uniforms.lineWidth}set lineContrast(n){this.uniforms.lineContrast=n}get lineContrast(){return this.uniforms.lineContrast}set verticalLine(n){this.uniforms.verticalLine=n}get verticalLine(){return this.uniforms.verticalLine}set noise(n){this.uniforms.noise=n}get noise(){return this.uniforms.noise}set noiseSize(n){this.uniforms.noiseSize=n}get noiseSize(){return this.uniforms.noiseSize}set vignetting(n){this.uniforms.vignetting=n}get vignetting(){return this.uniforms.vignetting}set vignettingAlpha(n){this.uniforms.vignettingAlpha=n}get vignettingAlpha(){return this.uniforms.vignettingAlpha}set vignettingBlur(n){this.uniforms.vignettingBlur=n}get vignettingBlur(){return this.uniforms.vignettingBlur}};let t=e;return t.defaults={curvature:1,lineWidth:1,lineContrast:.25,verticalLine:!1,noise:0,noiseSize:1,seed:0,vignetting:.3,vignettingAlpha:1,vignettingBlur:.3,time:0},i.CRTFilter=t,Object.defineProperty(i,"__esModule",{value:!0}),i}({},PIXI);Object.assign(PIXI.filters,__filters);
