// It probably needs to be blend to be useful.
/*!
 * @pixi/filter-emboss - v5.1.1
 * Compiled Thu, 31 Aug 2023 09:18:38 UTC
 *
 * @pixi/filter-emboss is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 */var __filters=function(e,t){"use strict";var n=`attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat3 projectionMatrix;

varying vec2 vTextureCoord;

void main(void)
{
    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    vTextureCoord = aTextureCoord;
}`,o=`precision mediump float;

varying vec2 vTextureCoord;

uniform sampler2D uSampler;
uniform float strength;
uniform vec4 filterArea;


void main(void)
{
	vec2 onePixel = vec2(1.0 / filterArea);

	vec4 color;

	color.rgb = vec3(0.5);

	color -= texture2D(uSampler, vTextureCoord - onePixel) * strength;
	color += texture2D(uSampler, vTextureCoord + onePixel) * strength;

	color.rgb = vec3((color.r + color.g + color.b) / 3.0);

	float alpha = texture2D(uSampler, vTextureCoord).a;

	gl_FragColor = vec4(color.rgb * alpha, alpha);
}
`;class i extends t.Filter{constructor(r=5){super(n,o),this.strength=r}get strength(){return this.uniforms.strength}set strength(r){this.uniforms.strength=r}}return e.EmbossFilter=i,Object.defineProperty(e,"__esModule",{value:!0}),e}({},PIXI);Object.assign(PIXI.filters,__filters);
