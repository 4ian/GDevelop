// This filter doesn't seem useful and need property list.
/*!
 * @pixi/filter-multi-color-replace - v5.1.1
 * Compiled Thu, 31 Aug 2023 09:18:38 UTC
 *
 * @pixi/filter-multi-color-replace is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 */var __filters=function(u,l){"use strict";var m=`attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat3 projectionMatrix;

varying vec2 vTextureCoord;

void main(void)
{
    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    vTextureCoord = aTextureCoord;
}`,c=`varying vec2 vTextureCoord;
uniform sampler2D uSampler;

uniform float epsilon;

const int MAX_COLORS = %maxColors%;

uniform vec3 originalColors[MAX_COLORS];
uniform vec3 targetColors[MAX_COLORS];

void main(void)
{
    gl_FragColor = texture2D(uSampler, vTextureCoord);

    float alpha = gl_FragColor.a;
    if (alpha < 0.0001)
    {
      return;
    }

    vec3 color = gl_FragColor.rgb / alpha;

    for(int i = 0; i < MAX_COLORS; i++)
    {
      vec3 origColor = originalColors[i];
      if (origColor.r < 0.0)
      {
        break;
      }
      vec3 colorDiff = origColor - color;
      if (length(colorDiff) < epsilon)
      {
        vec3 targetColor = targetColors[i];
        gl_FragColor = vec4((targetColor + colorDiff) * alpha, alpha);
        return;
      }
    }
}
`;class g extends l.Filter{constructor(e,i=.05,o=e.length){super(m,c.replace(/%maxColors%/g,o.toFixed(0))),this._replacements=[],this._maxColors=0,this.epsilon=i,this._maxColors=o,this.uniforms.originalColors=new Float32Array(o*3),this.uniforms.targetColors=new Float32Array(o*3),this.replacements=e}set replacements(e){const i=this.uniforms.originalColors,o=this.uniforms.targetColors,s=e.length;if(s>this._maxColors)throw new Error(`Length of replacements (${s}) exceeds the maximum colors length (${this._maxColors})`);i[s*3]=-1;for(let r=0;r<s;r++){const a=e[r];let n=a[0];typeof n=="number"?n=l.utils.hex2rgb(n):a[0]=l.utils.rgb2hex(n),i[r*3]=n[0],i[r*3+1]=n[1],i[r*3+2]=n[2];let t=a[1];typeof t=="number"?t=l.utils.hex2rgb(t):a[1]=l.utils.rgb2hex(t),o[r*3]=t[0],o[r*3+1]=t[1],o[r*3+2]=t[2]}this._replacements=e}get replacements(){return this._replacements}refresh(){this.replacements=this._replacements}get maxColors(){return this._maxColors}set epsilon(e){this.uniforms.epsilon=e}get epsilon(){return this.uniforms.epsilon}}return u.MultiColorReplaceFilter=g,Object.defineProperty(u,"__esModule",{value:!0}),u}({},PIXI);Object.assign(PIXI.filters,__filters);
