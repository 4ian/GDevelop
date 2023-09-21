/*!
 * @pixi/filter-zoom-blur - v5.1.1
 * Compiled Thu, 31 Aug 2023 09:18:38 UTC
 *
 * @pixi/filter-zoom-blur is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 */var __filters=function(i,u){"use strict";var l=`attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat3 projectionMatrix;

varying vec2 vTextureCoord;

void main(void)
{
    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    vTextureCoord = aTextureCoord;
}`,d=`varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform vec4 filterArea;

uniform vec2 uCenter;
uniform float uStrength;
uniform float uInnerRadius;
uniform float uRadius;

const float MAX_KERNEL_SIZE = \${maxKernelSize};

// author: http://byteblacksmith.com/improvements-to-the-canonical-one-liner-glsl-rand-for-opengl-es-2-0/
highp float rand(vec2 co, float seed) {
    const highp float a = 12.9898, b = 78.233, c = 43758.5453;
    highp float dt = dot(co + seed, vec2(a, b)), sn = mod(dt, 3.14159);
    return fract(sin(sn) * c + seed);
}

void main() {

    float minGradient = uInnerRadius * 0.3;
    float innerRadius = (uInnerRadius + minGradient * 0.5) / filterArea.x;

    float gradient = uRadius * 0.3;
    float radius = (uRadius - gradient * 0.5) / filterArea.x;

    float countLimit = MAX_KERNEL_SIZE;

    vec2 dir = vec2(uCenter.xy / filterArea.xy - vTextureCoord);
    float dist = length(vec2(dir.x, dir.y * filterArea.y / filterArea.x));

    float strength = uStrength;

    float delta = 0.0;
    float gap;
    if (dist < innerRadius) {
        delta = innerRadius - dist;
        gap = minGradient;
    } else if (radius >= 0.0 && dist > radius) { // radius < 0 means it's infinity
        delta = dist - radius;
        gap = gradient;
    }

    if (delta > 0.0) {
        float normalCount = gap / filterArea.x;
        delta = (normalCount - delta) / normalCount;
        countLimit *= delta;
        strength *= delta;
        if (countLimit < 1.0)
        {
            gl_FragColor = texture2D(uSampler, vTextureCoord);
            return;
        }
    }

    // randomize the lookup values to hide the fixed number of samples
    float offset = rand(vTextureCoord, 0.0);

    float total = 0.0;
    vec4 color = vec4(0.0);

    dir *= strength;

    for (float t = 0.0; t < MAX_KERNEL_SIZE; t++) {
        float percent = (t + offset) / MAX_KERNEL_SIZE;
        float weight = 4.0 * (percent - percent * percent);
        vec2 p = vTextureCoord + dir * percent;
        vec4 sample = texture2D(uSampler, p);

        // switch to pre-multiplied alpha to correctly blur transparent images
        // sample.rgb *= sample.a;

        color += sample * weight;
        total += weight;

        if (t > countLimit){
            break;
        }
    }

    color /= total;
    // switch back from pre-multiplied alpha
    // color.rgb /= color.a + 0.00001;

    gl_FragColor = color;
}
`,a=Object.getOwnPropertySymbols,f=Object.prototype.hasOwnProperty,c=Object.prototype.propertyIsEnumerable,m=(n,t)=>{var r={};for(var e in n)f.call(n,e)&&t.indexOf(e)<0&&(r[e]=n[e]);if(n!=null&&a)for(var e of a(n))t.indexOf(e)<0&&c.call(n,e)&&(r[e]=n[e]);return r};const o=class extends u.Filter{constructor(n){const t=Object.assign(o.defaults,n),{maxKernelSize:r}=t,e=m(t,["maxKernelSize"]);super(l,d.replace("${maxKernelSize}",r.toFixed(1))),Object.assign(this,e)}get center(){return this.uniforms.uCenter}set center(n){this.uniforms.uCenter=n}get strength(){return this.uniforms.uStrength}set strength(n){this.uniforms.uStrength=n}get innerRadius(){return this.uniforms.uInnerRadius}set innerRadius(n){this.uniforms.uInnerRadius=n}get radius(){return this.uniforms.uRadius}set radius(n){(n<0||n===1/0)&&(n=-1),this.uniforms.uRadius=n}};let s=o;return s.defaults={strength:.1,center:[0,0],innerRadius:0,radius:-1,maxKernelSize:32},i.ZoomBlurFilter=s,Object.defineProperty(i,"__esModule",{value:!0}),i}({},PIXI);Object.assign(PIXI.filters,__filters);
