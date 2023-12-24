/*!
 * @pixi/filter-twist - v5.1.1
 * Compiled Thu, 31 Aug 2023 09:18:38 UTC
 *
 * @pixi/filter-twist is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 */var __filters=function(n,r){"use strict";var i=`attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat3 projectionMatrix;

varying vec2 vTextureCoord;

void main(void)
{
    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    vTextureCoord = aTextureCoord;
}`,s=`varying vec2 vTextureCoord;

uniform sampler2D uSampler;
uniform float radius;
uniform float angle;
uniform vec2 offset;
uniform vec4 filterArea;

vec2 mapCoord( vec2 coord )
{
    coord *= filterArea.xy;
    coord += filterArea.zw;

    return coord;
}

vec2 unmapCoord( vec2 coord )
{
    coord -= filterArea.zw;
    coord /= filterArea.xy;

    return coord;
}

vec2 twist(vec2 coord)
{
    coord -= offset;

    float dist = length(coord);

    if (dist < radius)
    {
        float ratioDist = (radius - dist) / radius;
        float angleMod = ratioDist * ratioDist * angle;
        float s = sin(angleMod);
        float c = cos(angleMod);
        coord = vec2(coord.x * c - coord.y * s, coord.x * s + coord.y * c);
    }

    coord += offset;

    return coord;
}

void main(void)
{

    vec2 coord = mapCoord(vTextureCoord);

    coord = twist(coord);

    coord = unmapCoord(coord);

    gl_FragColor = texture2D(uSampler, coord );

}
`;const e=class extends r.Filter{constructor(o){super(i,s),Object.assign(this,e.defaults,o)}get offset(){return this.uniforms.offset}set offset(o){this.uniforms.offset=o}get radius(){return this.uniforms.radius}set radius(o){this.uniforms.radius=o}get angle(){return this.uniforms.angle}set angle(o){this.uniforms.angle=o}};let t=e;return t.defaults={radius:200,angle:4,padding:20,offset:new r.Point},n.TwistFilter=t,Object.defineProperty(n,"__esModule",{value:!0}),n}({},PIXI);Object.assign(PIXI.filters,__filters);
