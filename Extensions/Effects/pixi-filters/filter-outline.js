/*!
 * @pixi/filter-outline - v5.2.0
 * Compiled Thu, 31 Aug 2023 09:18:38 UTC
 *
 * @pixi/filter-outline is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 */var __filters=function(r,s){"use strict";var u=`attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat3 projectionMatrix;

varying vec2 vTextureCoord;

void main(void)
{
    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    vTextureCoord = aTextureCoord;
}`,c=`varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform vec4 filterClamp;

uniform float uAlpha;
uniform vec2 uThickness;
uniform vec4 uColor;
uniform bool uKnockout;

const float DOUBLE_PI = 2. * 3.14159265358979323846264;
const float ANGLE_STEP = \${angleStep};

float outlineMaxAlphaAtPos(vec2 pos) {
    if (uThickness.x == 0. || uThickness.y == 0.) {
        return 0.;
    }

    vec4 displacedColor;
    vec2 displacedPos;
    float maxAlpha = 0.;

    for (float angle = 0.; angle <= DOUBLE_PI; angle += ANGLE_STEP) {
        displacedPos.x = vTextureCoord.x + uThickness.x * cos(angle);
        displacedPos.y = vTextureCoord.y + uThickness.y * sin(angle);
        displacedColor = texture2D(uSampler, clamp(displacedPos, filterClamp.xy, filterClamp.zw));
        maxAlpha = max(maxAlpha, displacedColor.a);
    }

    return maxAlpha;
}

void main(void) {
    vec4 sourceColor = texture2D(uSampler, vTextureCoord);
    vec4 contentColor = sourceColor * float(!uKnockout);
    float outlineAlpha = uAlpha * outlineMaxAlphaAtPos(vTextureCoord.xy) * (1.-sourceColor.a);
    vec4 outlineColor = vec4(vec3(uColor) * outlineAlpha, outlineAlpha);
    gl_FragColor = contentColor + outlineColor;
}
`;const e=class extends s.Filter{constructor(t=1,o=0,n=.1,i=1,l=!1){super(u,c.replace(/\$\{angleStep\}/,e.getAngleStep(n))),this._thickness=1,this._alpha=1,this._knockout=!1,this.uniforms.uThickness=new Float32Array([0,0]),this.uniforms.uColor=new Float32Array([0,0,0,1]),this.uniforms.uAlpha=i,this.uniforms.uKnockout=l,Object.assign(this,{thickness:t,color:o,quality:n,alpha:i,knockout:l})}static getAngleStep(t){const o=Math.max(t*e.MAX_SAMPLES,e.MIN_SAMPLES);return(Math.PI*2/o).toFixed(7)}apply(t,o,n,i){this.uniforms.uThickness[0]=this._thickness/o._frame.width,this.uniforms.uThickness[1]=this._thickness/o._frame.height,this.uniforms.uAlpha=this._alpha,this.uniforms.uKnockout=this._knockout,t.applyFilter(this,o,n,i)}get alpha(){return this._alpha}set alpha(t){this._alpha=t}get color(){return s.utils.rgb2hex(this.uniforms.uColor)}set color(t){s.utils.hex2rgb(t,this.uniforms.uColor)}get knockout(){return this._knockout}set knockout(t){this._knockout=t}get thickness(){return this._thickness}set thickness(t){this._thickness=t,this.padding=t}};let a=e;return a.MIN_SAMPLES=1,a.MAX_SAMPLES=100,r.OutlineFilter=a,Object.defineProperty(r,"__esModule",{value:!0}),r}({},PIXI);Object.assign(PIXI.filters,__filters);
