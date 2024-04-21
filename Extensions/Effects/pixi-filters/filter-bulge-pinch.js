/*!
 * @pixi/filter-bulge-pinch - v5.1.1
 * Compiled Thu, 31 Aug 2023 09:18:38 UTC
 *
 * @pixi/filter-bulge-pinch is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 */var __filters=function(r,o){"use strict";var s=`attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat3 projectionMatrix;

varying vec2 vTextureCoord;

void main(void)
{
    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    vTextureCoord = aTextureCoord;
}`,a=`uniform float radius;
uniform float strength;
uniform vec2 center;
uniform sampler2D uSampler;
varying vec2 vTextureCoord;

uniform vec4 filterArea;
uniform vec4 filterClamp;
uniform vec2 dimensions;

void main()
{
    vec2 coord = vTextureCoord * filterArea.xy;
    coord -= center * dimensions.xy;
    float distance = length(coord);
    if (distance < radius) {
        float percent = distance / radius;
        if (strength > 0.0) {
            coord *= mix(1.0, smoothstep(0.0, radius / distance, percent), strength * 0.75);
        } else {
            coord *= mix(1.0, pow(percent, 1.0 + strength * 0.75) * radius / distance, 1.0 - percent);
        }
    }
    coord += center * dimensions.xy;
    coord /= filterArea.xy;
    vec2 clampedCoord = clamp(coord, filterClamp.xy, filterClamp.zw);
    vec4 color = texture2D(uSampler, clampedCoord);
    if (coord != clampedCoord) {
        color *= max(0.0, 1.0 - length(coord - clampedCoord));
    }

    gl_FragColor = color;
}
`;const n=class extends o.Filter{constructor(e){super(s,a),this.uniforms.dimensions=new Float32Array(2),Object.assign(this,n.defaults,e)}apply(e,i,c,d){const{width:u,height:l}=i.filterFrame;this.uniforms.dimensions[0]=u,this.uniforms.dimensions[1]=l,e.applyFilter(this,i,c,d)}get radius(){return this.uniforms.radius}set radius(e){this.uniforms.radius=e}get strength(){return this.uniforms.strength}set strength(e){this.uniforms.strength=e}get center(){return this.uniforms.center}set center(e){this.uniforms.center=e}};let t=n;return t.defaults={center:[.5,.5],radius:100,strength:1},r.BulgePinchFilter=t,Object.defineProperty(r,"__esModule",{value:!0}),r}({},PIXI);Object.assign(PIXI.filters,__filters);
