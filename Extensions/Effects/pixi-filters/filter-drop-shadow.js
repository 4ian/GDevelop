/*!
 * @pixi/filter-drop-shadow - v5.2.0
 * Compiled Thu, 31 Aug 2023 09:18:38 UTC
 *
 * @pixi/filter-drop-shadow is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 */var __filters=function(l,o,r){"use strict";var b=`attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat3 projectionMatrix;

varying vec2 vTextureCoord;

void main(void)
{
    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    vTextureCoord = aTextureCoord;
}`,F=`varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform float alpha;
uniform vec3 color;

uniform vec2 shift;
uniform vec4 inputSize;

void main(void){
    vec4 sample = texture2D(uSampler, vTextureCoord - shift * inputSize.zw);

    // Premultiply alpha
    sample.rgb = color.rgb * sample.a;

    // alpha user alpha
    sample *= alpha;

    gl_FragColor = sample;
}`,g=Object.defineProperty,u=Object.getOwnPropertySymbols,v=Object.prototype.hasOwnProperty,y=Object.prototype.propertyIsEnumerable,h=(t,e,i)=>e in t?g(t,e,{enumerable:!0,configurable:!0,writable:!0,value:i}):t[e]=i,p=(t,e)=>{for(var i in e||(e={}))v.call(e,i)&&h(t,i,e[i]);if(u)for(var i of u(e))y.call(e,i)&&h(t,i,e[i]);return t};const n=class extends r.Filter{constructor(t){super(),this.angle=45,this._distance=5,this._resolution=r.settings.FILTER_RESOLUTION;const e=t?p(p({},n.defaults),t):n.defaults,{kernels:i,blur:a,quality:s,pixelSize:m,resolution:f}=e;this._offset=new r.ObservablePoint(this._updatePadding,this),this._tintFilter=new r.Filter(b,F),this._tintFilter.uniforms.color=new Float32Array(4),this._tintFilter.uniforms.shift=this._offset,this._tintFilter.resolution=f,this._blurFilter=i?new o.KawaseBlurFilter(i):new o.KawaseBlurFilter(a,s),this.pixelSize=m,this.resolution=f;const{shadowOnly:x,rotation:_,distance:c,offset:S,alpha:O,color:w}=e;this.shadowOnly=x,_!==void 0&&c!==void 0?(this.rotation=_,this.distance=c):this.offset=S,this.alpha=O,this.color=w}apply(t,e,i,a){const s=t.getFilterTexture();this._tintFilter.apply(t,e,s,1),this._blurFilter.apply(t,s,i,a),this.shadowOnly!==!0&&t.applyFilter(this,e,i,0),t.returnFilterTexture(s)}_updatePadding(){const t=Math.max(Math.abs(this._offset.x),Math.abs(this._offset.y));this.padding=t+this.blur*2}_updateShift(){this._tintFilter.uniforms.shift.set(this.distance*Math.cos(this.angle),this.distance*Math.sin(this.angle))}set offset(t){this._offset.copyFrom(t),this._updatePadding()}get offset(){return this._offset}get resolution(){return this._resolution}set resolution(t){this._resolution=t,this._tintFilter&&(this._tintFilter.resolution=t),this._blurFilter&&(this._blurFilter.resolution=t)}get distance(){return this._distance}set distance(t){r.utils.deprecation("5.3.0","DropShadowFilter distance is deprecated, use offset"),this._distance=t,this._updatePadding(),this._updateShift()}get rotation(){return this.angle/r.DEG_TO_RAD}set rotation(t){r.utils.deprecation("5.3.0","DropShadowFilter rotation is deprecated, use offset"),this.angle=t*r.DEG_TO_RAD,this._updateShift()}get alpha(){return this._tintFilter.uniforms.alpha}set alpha(t){this._tintFilter.uniforms.alpha=t}get color(){return r.utils.rgb2hex(this._tintFilter.uniforms.color)}set color(t){r.utils.hex2rgb(t,this._tintFilter.uniforms.color)}get kernels(){return this._blurFilter.kernels}set kernels(t){this._blurFilter.kernels=t}get blur(){return this._blurFilter.blur}set blur(t){this._blurFilter.blur=t,this._updatePadding()}get quality(){return this._blurFilter.quality}set quality(t){this._blurFilter.quality=t}get pixelSize(){return this._blurFilter.pixelSize}set pixelSize(t){this._blurFilter.pixelSize=t}};let d=n;return d.defaults={offset:{x:4,y:4},color:0,alpha:.5,shadowOnly:!1,kernels:null,blur:2,quality:3,pixelSize:1,resolution:r.settings.FILTER_RESOLUTION},l.DropShadowFilter=d,Object.defineProperty(l,"__esModule",{value:!0}),l}({},PIXI.filters,PIXI);Object.assign(PIXI.filters,__filters);
