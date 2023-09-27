/*!
 * @pixi/filter-advanced-bloom - v5.1.1
 * Compiled Thu, 31 Aug 2023 09:18:38 UTC
 *
 * @pixi/filter-advanced-bloom is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 */var __filters=function(s,o,a){"use strict";var h=`attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat3 projectionMatrix;

varying vec2 vTextureCoord;

void main(void)
{
    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    vTextureCoord = aTextureCoord;
}`,m=`
uniform sampler2D uSampler;
varying vec2 vTextureCoord;

uniform float threshold;

void main() {
    vec4 color = texture2D(uSampler, vTextureCoord);

    // A simple & fast algorithm for getting brightness.
    // It's inaccuracy , but good enought for this feature.
    float _max = max(max(color.r, color.g), color.b);
    float _min = min(min(color.r, color.g), color.b);
    float brightness = (_max + _min) * 0.5;

    if(brightness > threshold) {
        gl_FragColor = color;
    } else {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
    }
}
`;class g extends o.Filter{constructor(e=.5){super(h,m),this.threshold=e}get threshold(){return this.uniforms.threshold}set threshold(e){this.uniforms.threshold=e}}var x=`uniform sampler2D uSampler;
varying vec2 vTextureCoord;

uniform sampler2D bloomTexture;
uniform float bloomScale;
uniform float brightness;

void main() {
    vec4 color = texture2D(uSampler, vTextureCoord);
    color.rgb *= brightness;
    vec4 bloomColor = vec4(texture2D(bloomTexture, vTextureCoord).rgb, 0.0);
    bloomColor.rgb *= bloomScale;
    gl_FragColor = color + bloomColor;
}
`;const c=class extends o.Filter{constructor(t){super(h,x),this.bloomScale=1,this.brightness=1,this._resolution=o.settings.FILTER_RESOLUTION,typeof t=="number"&&(t={threshold:t});const e=Object.assign(c.defaults,t);this.bloomScale=e.bloomScale,this.brightness=e.brightness;const{kernels:i,blur:n,quality:u,pixelSize:l,resolution:r}=e;this._extractFilter=new g(e.threshold),this._extractFilter.resolution=r,this._blurFilter=i?new a.KawaseBlurFilter(i):new a.KawaseBlurFilter(n,u),this.pixelSize=l,this.resolution=r}apply(t,e,i,n,u){const l=t.getFilterTexture();this._extractFilter.apply(t,e,l,1,u);const r=t.getFilterTexture();this._blurFilter.apply(t,l,r,1),this.uniforms.bloomScale=this.bloomScale,this.uniforms.brightness=this.brightness,this.uniforms.bloomTexture=r,t.applyFilter(this,e,i,n),t.returnFilterTexture(r),t.returnFilterTexture(l)}get resolution(){return this._resolution}set resolution(t){this._resolution=t,this._extractFilter&&(this._extractFilter.resolution=t),this._blurFilter&&(this._blurFilter.resolution=t)}get threshold(){return this._extractFilter.threshold}set threshold(t){this._extractFilter.threshold=t}get kernels(){return this._blurFilter.kernels}set kernels(t){this._blurFilter.kernels=t}get blur(){return this._blurFilter.blur}set blur(t){this._blurFilter.blur=t}get quality(){return this._blurFilter.quality}set quality(t){this._blurFilter.quality=t}get pixelSize(){return this._blurFilter.pixelSize}set pixelSize(t){this._blurFilter.pixelSize=t}};let b=c;return b.defaults={threshold:.5,bloomScale:1,brightness:1,kernels:null,blur:8,quality:4,pixelSize:1,resolution:o.settings.FILTER_RESOLUTION},s.AdvancedBloomFilter=b,Object.defineProperty(s,"__esModule",{value:!0}),s}({},PIXI,PIXI.filters);Object.assign(PIXI.filters,__filters);
