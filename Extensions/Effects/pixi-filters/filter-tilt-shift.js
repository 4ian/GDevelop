/*!
 * @pixi/filter-tilt-shift - v5.2.0
 * Compiled Thu, 31 Aug 2023 09:18:38 UTC
 *
 * @pixi/filter-tilt-shift is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 */var __filters=function(s,n){"use strict";var h=`attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat3 projectionMatrix;

varying vec2 vTextureCoord;

void main(void)
{
    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    vTextureCoord = aTextureCoord;
}`,m=`varying vec2 vTextureCoord;

uniform sampler2D uSampler;
uniform float blur;
uniform float gradientBlur;
uniform vec2 start;
uniform vec2 end;
uniform vec2 delta;
uniform vec2 texSize;

float random(vec3 scale, float seed)
{
    return fract(sin(dot(gl_FragCoord.xyz + seed, scale)) * 43758.5453 + seed);
}

void main(void)
{
    vec4 color = vec4(0.0);
    float total = 0.0;

    float offset = random(vec3(12.9898, 78.233, 151.7182), 0.0);
    vec2 normal = normalize(vec2(start.y - end.y, end.x - start.x));
    float radius = smoothstep(0.0, 1.0, abs(dot(vTextureCoord * texSize - start, normal)) / gradientBlur) * blur;

    for (float t = -30.0; t <= 30.0; t++)
    {
        float percent = (t + offset - 0.5) / 30.0;
        float weight = 1.0 - abs(percent);
        vec4 sample = texture2D(uSampler, vTextureCoord + delta / texSize * percent * radius);
        sample.rgb *= sample.a;
        color += sample * weight;
        total += weight;
    }

    color /= total;
    color.rgb /= color.a + 0.00001;

    gl_FragColor = color;
}
`;class l extends n.Filter{constructor(t){var e,r;super(h,m),this.uniforms.blur=t.blur,this.uniforms.gradientBlur=t.gradientBlur,this.uniforms.start=(e=t.start)!=null?e:new n.Point(0,window.innerHeight/2),this.uniforms.end=(r=t.end)!=null?r:new n.Point(600,window.innerHeight/2),this.uniforms.delta=new n.Point(30,30),this.uniforms.texSize=new n.Point(window.innerWidth,window.innerHeight),this.updateDelta()}updateDelta(){this.uniforms.delta.x=0,this.uniforms.delta.y=0}get blur(){return this.uniforms.blur}set blur(t){this.uniforms.blur=t}get gradientBlur(){return this.uniforms.gradientBlur}set gradientBlur(t){this.uniforms.gradientBlur=t}get start(){return this.uniforms.start}set start(t){this.uniforms.start=t,this.updateDelta()}get end(){return this.uniforms.end}set end(t){this.uniforms.end=t,this.updateDelta()}}class o extends l{updateDelta(){const t=this.uniforms.end.x-this.uniforms.start.x,e=this.uniforms.end.y-this.uniforms.start.y,r=Math.sqrt(t*t+e*e);this.uniforms.delta.x=t/r,this.uniforms.delta.y=e/r}}class u extends l{updateDelta(){const t=this.uniforms.end.x-this.uniforms.start.x,e=this.uniforms.end.y-this.uniforms.start.y,r=Math.sqrt(t*t+e*e);this.uniforms.delta.x=-e/r,this.uniforms.delta.y=t/r}}const d=class extends n.Filter{constructor(i,t,e,r){super(),typeof i=="number"&&(n.utils.deprecation("5.3.0","TiltShiftFilter constructor arguments is deprecated, use options."),i={blur:i,gradientBlur:t,start:e,end:r}),i=Object.assign({},d.defaults,i),this.tiltShiftXFilter=new o(i),this.tiltShiftYFilter=new u(i)}apply(i,t,e,r){const a=i.getFilterTexture();this.tiltShiftXFilter.apply(i,t,a,1),this.tiltShiftYFilter.apply(i,a,e,r),i.returnFilterTexture(a)}get blur(){return this.tiltShiftXFilter.blur}set blur(i){this.tiltShiftXFilter.blur=this.tiltShiftYFilter.blur=i}get gradientBlur(){return this.tiltShiftXFilter.gradientBlur}set gradientBlur(i){this.tiltShiftXFilter.gradientBlur=this.tiltShiftYFilter.gradientBlur=i}get start(){return this.tiltShiftXFilter.start}set start(i){this.tiltShiftXFilter.start=this.tiltShiftYFilter.start=i}get end(){return this.tiltShiftXFilter.end}set end(i){this.tiltShiftXFilter.end=this.tiltShiftYFilter.end=i}};let f=d;return f.defaults={blur:100,gradientBlur:600,start:void 0,end:void 0},s.TiltShiftAxisFilter=l,s.TiltShiftFilter=f,s.TiltShiftXFilter=o,s.TiltShiftYFilter=u,Object.defineProperty(s,"__esModule",{value:!0}),s}({},PIXI);Object.assign(PIXI.filters,__filters);
