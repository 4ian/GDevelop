/*!
 * @pixi/filter-glitch - v5.1.1
 * Compiled Thu, 31 Aug 2023 09:18:38 UTC
 *
 * @pixi/filter-glitch is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 */var __filters=function(d,a){"use strict";var m=`attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat3 projectionMatrix;

varying vec2 vTextureCoord;

void main(void)
{
    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    vTextureCoord = aTextureCoord;
}`,u=`// precision highp float;

varying vec2 vTextureCoord;
uniform sampler2D uSampler;

uniform vec4 filterArea;
uniform vec4 filterClamp;
uniform vec2 dimensions;
uniform float aspect;

uniform sampler2D displacementMap;
uniform float offset;
uniform float sinDir;
uniform float cosDir;
uniform int fillMode;

uniform float seed;
uniform vec2 red;
uniform vec2 green;
uniform vec2 blue;

const int TRANSPARENT = 0;
const int ORIGINAL = 1;
const int LOOP = 2;
const int CLAMP = 3;
const int MIRROR = 4;

void main(void)
{
    vec2 coord = (vTextureCoord * filterArea.xy) / dimensions;

    if (coord.x > 1.0 || coord.y > 1.0) {
        return;
    }

    float cx = coord.x - 0.5;
    float cy = (coord.y - 0.5) * aspect;
    float ny = (-sinDir * cx + cosDir * cy) / aspect + 0.5;

    // displacementMap: repeat
    // ny = ny > 1.0 ? ny - 1.0 : (ny < 0.0 ? 1.0 + ny : ny);

    // displacementMap: mirror
    ny = ny > 1.0 ? 2.0 - ny : (ny < 0.0 ? -ny : ny);

    vec4 dc = texture2D(displacementMap, vec2(0.5, ny));

    float displacement = (dc.r - dc.g) * (offset / filterArea.x);

    coord = vTextureCoord + vec2(cosDir * displacement, sinDir * displacement * aspect);

    if (fillMode == CLAMP) {
        coord = clamp(coord, filterClamp.xy, filterClamp.zw);
    } else {
        if( coord.x > filterClamp.z ) {
            if (fillMode == TRANSPARENT) {
                discard;
            } else if (fillMode == LOOP) {
                coord.x -= filterClamp.z;
            } else if (fillMode == MIRROR) {
                coord.x = filterClamp.z * 2.0 - coord.x;
            }
        } else if( coord.x < filterClamp.x ) {
            if (fillMode == TRANSPARENT) {
                discard;
            } else if (fillMode == LOOP) {
                coord.x += filterClamp.z;
            } else if (fillMode == MIRROR) {
                coord.x *= -filterClamp.z;
            }
        }

        if( coord.y > filterClamp.w ) {
            if (fillMode == TRANSPARENT) {
                discard;
            } else if (fillMode == LOOP) {
                coord.y -= filterClamp.w;
            } else if (fillMode == MIRROR) {
                coord.y = filterClamp.w * 2.0 - coord.y;
            }
        } else if( coord.y < filterClamp.y ) {
            if (fillMode == TRANSPARENT) {
                discard;
            } else if (fillMode == LOOP) {
                coord.y += filterClamp.w;
            } else if (fillMode == MIRROR) {
                coord.y *= -filterClamp.w;
            }
        }
    }

    gl_FragColor.r = texture2D(uSampler, coord + red * (1.0 - seed * 0.4) / filterArea.xy).r;
    gl_FragColor.g = texture2D(uSampler, coord + green * (1.0 - seed * 0.3) / filterArea.xy).g;
    gl_FragColor.b = texture2D(uSampler, coord + blue * (1.0 - seed * 0.2) / filterArea.xy).b;
    gl_FragColor.a = texture2D(uSampler, coord).a;
}
`;const h=class extends a.Filter{constructor(e){super(m,u),this.offset=100,this.fillMode=h.TRANSPARENT,this.average=!1,this.seed=0,this.minSize=8,this.sampleSize=512,this._slices=0,this._offsets=new Float32Array(1),this._sizes=new Float32Array(1),this._direction=-1,this.uniforms.dimensions=new Float32Array(2),this._canvas=document.createElement("canvas"),this._canvas.width=4,this._canvas.height=this.sampleSize,this.texture=a.Texture.from(this._canvas,{scaleMode:a.SCALE_MODES.NEAREST}),Object.assign(this,h.defaults,e)}apply(e,s,i,t){const{width:n,height:r}=s.filterFrame;this.uniforms.dimensions[0]=n,this.uniforms.dimensions[1]=r,this.uniforms.aspect=r/n,this.uniforms.seed=this.seed,this.uniforms.offset=this.offset,this.uniforms.fillMode=this.fillMode,e.applyFilter(this,s,i,t)}_randomizeSizes(){const e=this._sizes,s=this._slices-1,i=this.sampleSize,t=Math.min(this.minSize/i,.9/this._slices);if(this.average){const n=this._slices;let r=1;for(let o=0;o<s;o++){const f=r/(n-o),c=Math.max(f*(1-Math.random()*.6),t);e[o]=c,r-=c}e[s]=r}else{let n=1;const r=Math.sqrt(1/this._slices);for(let o=0;o<s;o++){const f=Math.max(r*n*Math.random(),t);e[o]=f,n-=f}e[s]=n}this.shuffle()}shuffle(){const e=this._sizes,s=this._slices-1;for(let i=s;i>0;i--){const t=Math.random()*i>>0,n=e[i];e[i]=e[t],e[t]=n}}_randomizeOffsets(){for(let e=0;e<this._slices;e++)this._offsets[e]=Math.random()*(Math.random()<.5?-1:1)}refresh(){this._randomizeSizes(),this._randomizeOffsets(),this.redraw()}redraw(){const e=this.sampleSize,s=this.texture,i=this._canvas.getContext("2d");i.clearRect(0,0,8,e);let t,n=0;for(let r=0;r<this._slices;r++){t=Math.floor(this._offsets[r]*256);const o=this._sizes[r]*e,f=t>0?t:0,c=t<0?-t:0;i.fillStyle=`rgba(${f}, ${c}, 0, 1)`,i.fillRect(0,n>>0,e,o+1>>0),n+=o}s.baseTexture.update(),this.uniforms.displacementMap=s}set sizes(e){const s=Math.min(this._slices,e.length);for(let i=0;i<s;i++)this._sizes[i]=e[i]}get sizes(){return this._sizes}set offsets(e){const s=Math.min(this._slices,e.length);for(let i=0;i<s;i++)this._offsets[i]=e[i]}get offsets(){return this._offsets}get slices(){return this._slices}set slices(e){this._slices!==e&&(this._slices=e,this.uniforms.slices=e,this._sizes=this.uniforms.slicesWidth=new Float32Array(e),this._offsets=this.uniforms.slicesOffset=new Float32Array(e),this.refresh())}get direction(){return this._direction}set direction(e){if(this._direction===e)return;this._direction=e;const s=e*a.DEG_TO_RAD;this.uniforms.sinDir=Math.sin(s),this.uniforms.cosDir=Math.cos(s)}get red(){return this.uniforms.red}set red(e){this.uniforms.red=e}get green(){return this.uniforms.green}set green(e){this.uniforms.green=e}get blue(){return this.uniforms.blue}set blue(e){this.uniforms.blue=e}destroy(){var e;(e=this.texture)==null||e.destroy(!0),this.texture=this._canvas=this.red=this.green=this.blue=this._sizes=this._offsets=null}};let l=h;return l.defaults={slices:5,offset:100,direction:0,fillMode:0,average:!1,seed:0,red:[0,0],green:[0,0],blue:[0,0],minSize:8,sampleSize:512},l.TRANSPARENT=0,l.ORIGINAL=1,l.LOOP=2,l.CLAMP=3,l.MIRROR=4,d.GlitchFilter=l,Object.defineProperty(d,"__esModule",{value:!0}),d}({},PIXI);Object.assign(PIXI.filters,__filters);
