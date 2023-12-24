// There is already a black-and-white effect that has more features.
/*!
 * @pixi/filter-grayscale - v5.1.1
 * Compiled Thu, 31 Aug 2023 09:18:38 UTC
 *
 * @pixi/filter-grayscale is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 */var __filters=function(e,r){"use strict";var n=`attribute vec2 aVertexPosition;
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

// https://en.wikipedia.org/wiki/Luma_(video)
const vec3 weight = vec3(0.299, 0.587, 0.114);

void main()
{
    vec4 color = texture2D(uSampler, vTextureCoord);
    gl_FragColor = vec4(
        vec3(color.r * weight.r + color.g * weight.g  + color.b * weight.b),
        color.a
    );
}
`;class t extends r.Filter{constructor(){super(n,o)}}return e.GrayscaleFilter=t,Object.defineProperty(e,"__esModule",{value:!0}),e}({},PIXI);Object.assign(PIXI.filters,__filters);
