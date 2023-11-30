// This filter is probably not very useful.
/*!
 * @pixi/filter-simple-lightmap - v5.1.1
 * Compiled Thu, 31 Aug 2023 09:18:38 UTC
 *
 * @pixi/filter-simple-lightmap is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 */var __filters=function(t,r){"use strict";var l=`attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat3 projectionMatrix;

varying vec2 vTextureCoord;

void main(void)
{
    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    vTextureCoord = aTextureCoord;
}`,a=`varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform sampler2D uLightmap;
uniform vec4 filterArea;
uniform vec2 dimensions;
uniform vec4 ambientColor;
void main() {
    vec4 diffuseColor = texture2D(uSampler, vTextureCoord);
    vec2 lightCoord = (vTextureCoord * filterArea.xy) / dimensions;
    vec4 light = texture2D(uLightmap, lightCoord);
    vec3 ambient = ambientColor.rgb * ambientColor.a;
    vec3 intensity = ambient + light.rgb;
    vec3 finalColor = diffuseColor.rgb * intensity;
    gl_FragColor = vec4(finalColor, diffuseColor.a);
}
`;class u extends r.Filter{constructor(e,i=0,o=1){super(l,a),this._color=0,this.uniforms.dimensions=new Float32Array(2),this.uniforms.ambientColor=new Float32Array([0,0,0,o]),this.texture=e,this.color=i}apply(e,i,o,m){var n,s;this.uniforms.dimensions[0]=(n=i.filterFrame)==null?void 0:n.width,this.uniforms.dimensions[1]=(s=i.filterFrame)==null?void 0:s.height,e.applyFilter(this,i,o,m)}get texture(){return this.uniforms.uLightmap}set texture(e){this.uniforms.uLightmap=e}set color(e){const i=this.uniforms.ambientColor;typeof e=="number"?(r.utils.hex2rgb(e,i),this._color=e):(i[0]=e[0],i[1]=e[1],i[2]=e[2],i[3]=e[3],this._color=r.utils.rgb2hex(i))}get color(){return this._color}get alpha(){return this.uniforms.ambientColor[3]}set alpha(e){this.uniforms.ambientColor[3]=e}}return t.SimpleLightmapFilter=u,Object.defineProperty(t,"__esModule",{value:!0}),t}({},PIXI);Object.assign(PIXI.filters,__filters);
