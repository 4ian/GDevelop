/*!
 * @pixi/filter-reflection - v5.1.1
 * Compiled Thu, 31 Aug 2023 09:18:38 UTC
 *
 * @pixi/filter-reflection is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 */var __filters=function(e,u){"use strict";var l=`attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat3 projectionMatrix;

varying vec2 vTextureCoord;

void main(void)
{
    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    vTextureCoord = aTextureCoord;
}`,s=`varying vec2 vTextureCoord;
uniform sampler2D uSampler;

uniform vec4 filterArea;
uniform vec4 filterClamp;
uniform vec2 dimensions;

uniform bool mirror;
uniform float boundary;
uniform vec2 amplitude;
uniform vec2 waveLength;
uniform vec2 alpha;
uniform float time;

float rand(vec2 co) {
    return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

void main(void)
{
    vec2 pixelCoord = vTextureCoord.xy * filterArea.xy;
    vec2 coord = pixelCoord / dimensions;

    if (coord.y < boundary) {
        gl_FragColor = texture2D(uSampler, vTextureCoord);
        return;
    }

    float k = (coord.y - boundary) / (1. - boundary + 0.0001);
    float areaY = boundary * dimensions.y / filterArea.y;
    float v = areaY + areaY - vTextureCoord.y;
    float y = mirror ? v : vTextureCoord.y;

    float _amplitude = ((amplitude.y - amplitude.x) * k + amplitude.x ) / filterArea.x;
    float _waveLength = ((waveLength.y - waveLength.x) * k + waveLength.x) / filterArea.y;
    float _alpha = (alpha.y - alpha.x) * k + alpha.x;

    float x = vTextureCoord.x + cos(v * 6.28 / _waveLength - time) * _amplitude;
    x = clamp(x, filterClamp.x, filterClamp.z);

    vec4 color = texture2D(uSampler, vec2(x, y));

    gl_FragColor = color * _alpha;
}
`;const t=class extends u.Filter{constructor(r){super(l,s),this.time=0,this.uniforms.amplitude=new Float32Array(2),this.uniforms.waveLength=new Float32Array(2),this.uniforms.alpha=new Float32Array(2),this.uniforms.dimensions=new Float32Array(2),Object.assign(this,t.defaults,r)}apply(r,n,m,f){var o,a;this.uniforms.dimensions[0]=(o=n.filterFrame)==null?void 0:o.width,this.uniforms.dimensions[1]=(a=n.filterFrame)==null?void 0:a.height,this.uniforms.time=this.time,r.applyFilter(this,n,m,f)}set mirror(r){this.uniforms.mirror=r}get mirror(){return this.uniforms.mirror}set boundary(r){this.uniforms.boundary=r}get boundary(){return this.uniforms.boundary}set amplitude(r){this.uniforms.amplitude[0]=r[0],this.uniforms.amplitude[1]=r[1]}get amplitude(){return this.uniforms.amplitude}set waveLength(r){this.uniforms.waveLength[0]=r[0],this.uniforms.waveLength[1]=r[1]}get waveLength(){return this.uniforms.waveLength}set alpha(r){this.uniforms.alpha[0]=r[0],this.uniforms.alpha[1]=r[1]}get alpha(){return this.uniforms.alpha}};let i=t;return i.defaults={mirror:!0,boundary:.5,amplitude:[0,20],waveLength:[30,100],alpha:[1,1],time:0},e.ReflectionFilter=i,Object.defineProperty(e,"__esModule",{value:!0}),e}({},PIXI);Object.assign(PIXI.filters,__filters);
