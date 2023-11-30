// TODO This filter can be interesting to make a gradient shadow over sprites.
// It can work with only 2 colors but maybe it would be better to wait that property list are handled.
/*!
 * @pixi/filter-color-gradient - v5.2.0
 * Compiled Thu, 31 Aug 2023 09:18:38 UTC
 *
 * @pixi/filter-color-gradient is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 */var __filters=function(x,F){"use strict";var V=`const float PI = 3.1415926538;
const float PI_2 = PI*2.;

varying vec2 vTextureCoord;
varying vec2 vFilterCoord;
uniform sampler2D uSampler;

const int TYPE_LINEAR = 0;
const int TYPE_RADIAL = 1;
const int TYPE_CONIC = 2;
const int MAX_STOPS = 32;

uniform int uNumStops;
uniform float uAlphas[3*MAX_STOPS];
uniform vec3 uColors[MAX_STOPS];
uniform float uOffsets[MAX_STOPS];
uniform int uType;
uniform float uAngle;
uniform float uAlpha;
uniform int uMaxColors;

struct ColorStop {
    float offset;
    vec3 color;
    float alpha;
};

mat2 rotate2d(float angle){
    return mat2(cos(angle), -sin(angle),
    sin(angle), cos(angle));
}

float projectLinearPosition(vec2 pos, float angle){
    vec2 center = vec2(0.5);
    vec2 result = pos - center;
    result = rotate2d(angle) * result;
    result = result + center;
    return clamp(result.x, 0., 1.);
}

float projectRadialPosition(vec2 pos) {
    float r = distance(vFilterCoord, vec2(0.5));
    return clamp(2.*r, 0., 1.);
}

float projectAnglePosition(vec2 pos, float angle) {
    vec2 center = pos - vec2(0.5);
    float polarAngle=atan(-center.y, center.x);
    return mod(polarAngle + angle, PI_2) / PI_2;
}

float projectPosition(vec2 pos, int type, float angle) {
    if (type == TYPE_LINEAR) {
        return projectLinearPosition(pos, angle);
    } else if (type == TYPE_RADIAL) {
        return projectRadialPosition(pos);
    } else if (type == TYPE_CONIC) {
        return projectAnglePosition(pos, angle);
    }

    return pos.y;
}

void main(void) {
    // current/original color
    vec4 currentColor = texture2D(uSampler, vTextureCoord);

    // skip calculations if gradient alpha is 0
    if (0.0 == uAlpha) {
        gl_FragColor = currentColor;
        return;
    }

    // project position
    float y = projectPosition(vFilterCoord, uType, radians(uAngle));

    // check gradient bounds
    float offsetMin = uOffsets[0];
    float offsetMax = 0.0;

    for (int i = 0; i < MAX_STOPS; i++) {
        if (i == uNumStops-1){ // last index
            offsetMax = uOffsets[i];
        }
    }

    if (y  < offsetMin || y > offsetMax) {
        gl_FragColor = currentColor;
        return;
    }

    // limit colors
    if (uMaxColors > 0) {
        float stepSize = 1./float(uMaxColors);
        float stepNumber = float(floor(y/stepSize));
        y = stepSize * (stepNumber + 0.5);// offset by 0.5 to use color from middle of segment
    }

    // find color stops
    ColorStop from;
    ColorStop to;

    for (int i = 0; i < MAX_STOPS; i++) {
        if (y >= uOffsets[i]) {
            from = ColorStop(uOffsets[i], uColors[i], uAlphas[i]);
            to = ColorStop(uOffsets[i+1], uColors[i+1], uAlphas[i+1]);
        }

        if (i == uNumStops-1){ // last index
            break;
        }
    }

    // mix colors from stops
    vec4 colorFrom = vec4(from.color * from.alpha, from.alpha);
    vec4 colorTo = vec4(to.color * to.alpha, to.alpha);

    float segmentHeight = to.offset - from.offset;
    float relativePos = y - from.offset;// position from 0 to [segmentHeight]
    float relativePercent = relativePos / segmentHeight;// position in percent between [from.offset] and [to.offset].

    float gradientAlpha = uAlpha * currentColor.a;
    vec4 gradientColor = mix(colorFrom, colorTo, relativePercent) * gradientAlpha;

    // mix resulting color with current color
    gl_FragColor = gradientColor + currentColor*(1.-gradientColor.a);
}
`,X=`attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat3 projectionMatrix;
uniform vec4 inputSize;
uniform vec4 outputFrame;

varying vec2 vTextureCoord;
varying vec2 vFilterCoord;

void main(void)
{
    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    vTextureCoord = aTextureCoord;
    vFilterCoord = vTextureCoord * inputSize.xy / outputFrame.zw;
}
`,v=v||{};v.stringify=function(){var e={"visit_linear-gradient":function(t){return e.visit_gradient(t)},"visit_repeating-linear-gradient":function(t){return e.visit_gradient(t)},"visit_radial-gradient":function(t){return e.visit_gradient(t)},"visit_repeating-radial-gradient":function(t){return e.visit_gradient(t)},visit_gradient:function(t){var r=e.visit(t.orientation);return r&&(r+=", "),t.type+"("+r+e.visit(t.colorStops)+")"},visit_shape:function(t){var r=t.value,o=e.visit(t.at),n=e.visit(t.style);return n&&(r+=" "+n),o&&(r+=" at "+o),r},"visit_default-radial":function(t){var r="",o=e.visit(t.at);return o&&(r+=o),r},"visit_extent-keyword":function(t){var r=t.value,o=e.visit(t.at);return o&&(r+=" at "+o),r},"visit_position-keyword":function(t){return t.value},visit_position:function(t){return e.visit(t.value.x)+" "+e.visit(t.value.y)},"visit_%":function(t){return t.value+"%"},visit_em:function(t){return t.value+"em"},visit_px:function(t){return t.value+"px"},visit_literal:function(t){return e.visit_color(t.value,t)},visit_hex:function(t){return e.visit_color("#"+t.value,t)},visit_rgb:function(t){return e.visit_color("rgb("+t.value.join(", ")+")",t)},visit_rgba:function(t){return e.visit_color("rgba("+t.value.join(", ")+")",t)},visit_color:function(t,r){var o=t,n=e.visit(r.length);return n&&(o+=" "+n),o},visit_angular:function(t){return t.value+"deg"},visit_directional:function(t){return"to "+t.value},visit_array:function(t){var r="",o=t.length;return t.forEach(function(n,i){r+=e.visit(n),i<o-1&&(r+=", ")}),r},visit:function(t){if(!t)return"";var r="";if(t instanceof Array)return e.visit_array(t,r);if(t.type){var o=e["visit_"+t.type];if(o)return o(t);throw Error("Missing visitor visit_"+t.type)}else throw Error("Invalid node.")}};return function(t){return e.visit(t)}}();var v=v||{};v.parse=function(){var e={linearGradient:/^(\-(webkit|o|ms|moz)\-)?(linear\-gradient)/i,repeatingLinearGradient:/^(\-(webkit|o|ms|moz)\-)?(repeating\-linear\-gradient)/i,radialGradient:/^(\-(webkit|o|ms|moz)\-)?(radial\-gradient)/i,repeatingRadialGradient:/^(\-(webkit|o|ms|moz)\-)?(repeating\-radial\-gradient)/i,sideOrCorner:/^to (left (top|bottom)|right (top|bottom)|left|right|top|bottom)/i,extentKeywords:/^(closest\-side|closest\-corner|farthest\-side|farthest\-corner|contain|cover)/,positionKeywords:/^(left|center|right|top|bottom)/i,pixelValue:/^(-?(([0-9]*\.[0-9]+)|([0-9]+\.?)))px/,percentageValue:/^(-?(([0-9]*\.[0-9]+)|([0-9]+\.?)))\%/,emValue:/^(-?(([0-9]*\.[0-9]+)|([0-9]+\.?)))em/,angleValue:/^(-?(([0-9]*\.[0-9]+)|([0-9]+\.?)))deg/,startCall:/^\(/,endCall:/^\)/,comma:/^,/,hexColor:/^\#([0-9a-fA-F]+)/,literalColor:/^([a-zA-Z]+)/,rgbColor:/^rgb/i,rgbaColor:/^rgba/i,number:/^(([0-9]*\.[0-9]+)|([0-9]+\.?))/},t="";function r(a){var u=new Error(t+": "+a);throw u.source=t,u}function o(){var a=n();return t.length>0&&r("Invalid input not EOF"),a}function n(){return C(i)}function i(){return l("linear-gradient",e.linearGradient,s)||l("repeating-linear-gradient",e.repeatingLinearGradient,s)||l("radial-gradient",e.radialGradient,G)||l("repeating-radial-gradient",e.repeatingRadialGradient,G)}function l(a,u,c){return f(u,function(d){var q=c();return q&&(m(e.comma)||r("Missing comma before color stops")),{type:a,orientation:q,colorStops:C(he)}})}function f(a,u){var c=m(a);if(c){m(e.startCall)||r("Missing (");var d=u(c);return m(e.endCall)||r("Missing )"),d}}function s(){return p()||P()}function p(){return h("directional",e.sideOrCorner,1)}function P(){return h("angular",e.angleValue,1)}function G(){var a,u=g(),c;return u&&(a=[],a.push(u),c=t,m(e.comma)&&(u=g(),u?a.push(u):t=c)),a}function g(){var a=b()||pe();if(a)a.at=L();else{var u=O();if(u){a=u;var c=L();c&&(a.at=c)}else{var d=N();d&&(a={type:"default-radial",at:d})}}return a}function b(){var a=h("shape",/^(circle)/i,0);return a&&(a.style=D()||O()),a}function pe(){var a=h("shape",/^(ellipse)/i,0);return a&&(a.style=w()||O()),a}function O(){return h("extent-keyword",e.extentKeywords,1)}function L(){if(h("position",/^at/,0)){var a=N();return a||r("Missing positioning value"),a}}function N(){var a=ge();if(a.x||a.y)return{type:"position",value:a}}function ge(){return{x:w(),y:w()}}function C(a){var u=a(),c=[];if(u)for(c.push(u);m(e.comma);)u=a(),u?c.push(u):r("One extra comma");return c}function he(){var a=me();return a||r("Expected color definition"),a.length=w(),a}function me(){return ve()||be()||ye()||de()}function de(){return h("literal",e.literalColor,0)}function ve(){return h("hex",e.hexColor,1)}function ye(){return f(e.rgbColor,function(){return{type:"rgb",value:C(z)}})}function be(){return f(e.rgbaColor,function(){return{type:"rgba",value:C(z)}})}function z(){return m(e.number)[1]}function w(){return h("%",e.percentageValue,1)||Ce()||D()}function Ce(){return h("position-keyword",e.positionKeywords,1)}function D(){return h("px",e.pixelValue,1)||h("em",e.emValue,1)}function h(a,u,c){var d=m(u);if(d)return{type:a,value:d[c]}}function m(a){var u,c;return c=/^[\n\r\t\s]+/.exec(t),c&&$(c[0].length),u=a.exec(t),u&&$(u[0].length),u}function $(a){t=t.substr(a)}return function(a){return t=a.toString(),o()}}();var H=v.parse;v.stringify;var M={aliceblue:[240,248,255],antiquewhite:[250,235,215],aqua:[0,255,255],aquamarine:[127,255,212],azure:[240,255,255],beige:[245,245,220],bisque:[255,228,196],black:[0,0,0],blanchedalmond:[255,235,205],blue:[0,0,255],blueviolet:[138,43,226],brown:[165,42,42],burlywood:[222,184,135],cadetblue:[95,158,160],chartreuse:[127,255,0],chocolate:[210,105,30],coral:[255,127,80],cornflowerblue:[100,149,237],cornsilk:[255,248,220],crimson:[220,20,60],cyan:[0,255,255],darkblue:[0,0,139],darkcyan:[0,139,139],darkgoldenrod:[184,134,11],darkgray:[169,169,169],darkgreen:[0,100,0],darkgrey:[169,169,169],darkkhaki:[189,183,107],darkmagenta:[139,0,139],darkolivegreen:[85,107,47],darkorange:[255,140,0],darkorchid:[153,50,204],darkred:[139,0,0],darksalmon:[233,150,122],darkseagreen:[143,188,143],darkslateblue:[72,61,139],darkslategray:[47,79,79],darkslategrey:[47,79,79],darkturquoise:[0,206,209],darkviolet:[148,0,211],deeppink:[255,20,147],deepskyblue:[0,191,255],dimgray:[105,105,105],dimgrey:[105,105,105],dodgerblue:[30,144,255],firebrick:[178,34,34],floralwhite:[255,250,240],forestgreen:[34,139,34],fuchsia:[255,0,255],gainsboro:[220,220,220],ghostwhite:[248,248,255],gold:[255,215,0],goldenrod:[218,165,32],gray:[128,128,128],green:[0,128,0],greenyellow:[173,255,47],grey:[128,128,128],honeydew:[240,255,240],hotpink:[255,105,180],indianred:[205,92,92],indigo:[75,0,130],ivory:[255,255,240],khaki:[240,230,140],lavender:[230,230,250],lavenderblush:[255,240,245],lawngreen:[124,252,0],lemonchiffon:[255,250,205],lightblue:[173,216,230],lightcoral:[240,128,128],lightcyan:[224,255,255],lightgoldenrodyellow:[250,250,210],lightgray:[211,211,211],lightgreen:[144,238,144],lightgrey:[211,211,211],lightpink:[255,182,193],lightsalmon:[255,160,122],lightseagreen:[32,178,170],lightskyblue:[135,206,250],lightslategray:[119,136,153],lightslategrey:[119,136,153],lightsteelblue:[176,196,222],lightyellow:[255,255,224],lime:[0,255,0],limegreen:[50,205,50],linen:[250,240,230],magenta:[255,0,255],maroon:[128,0,0],mediumaquamarine:[102,205,170],mediumblue:[0,0,205],mediumorchid:[186,85,211],mediumpurple:[147,112,219],mediumseagreen:[60,179,113],mediumslateblue:[123,104,238],mediumspringgreen:[0,250,154],mediumturquoise:[72,209,204],mediumvioletred:[199,21,133],midnightblue:[25,25,112],mintcream:[245,255,250],mistyrose:[255,228,225],moccasin:[255,228,181],navajowhite:[255,222,173],navy:[0,0,128],oldlace:[253,245,230],olive:[128,128,0],olivedrab:[107,142,35],orange:[255,165,0],orangered:[255,69,0],orchid:[218,112,214],palegoldenrod:[238,232,170],palegreen:[152,251,152],paleturquoise:[175,238,238],palevioletred:[219,112,147],papayawhip:[255,239,213],peachpuff:[255,218,185],peru:[205,133,63],pink:[255,192,203],plum:[221,160,221],powderblue:[176,224,230],purple:[128,0,128],rebeccapurple:[102,51,153],red:[255,0,0],rosybrown:[188,143,143],royalblue:[65,105,225],saddlebrown:[139,69,19],salmon:[250,128,114],sandybrown:[244,164,96],seagreen:[46,139,87],seashell:[255,245,238],sienna:[160,82,45],silver:[192,192,192],skyblue:[135,206,235],slateblue:[106,90,205],slategray:[112,128,144],slategrey:[112,128,144],snow:[255,250,250],springgreen:[0,255,127],steelblue:[70,130,180],tan:[210,180,140],teal:[0,128,128],thistle:[216,191,216],tomato:[255,99,71],turquoise:[64,224,208],violet:[238,130,238],wheat:[245,222,179],white:[255,255,255],whitesmoke:[245,245,245],yellow:[255,255,0],yellowgreen:[154,205,50]},I={red:0,orange:60,yellow:120,green:180,blue:240,purple:300};function K(e){var t,r=[],o=1,n;if(typeof e=="string")if(M[e])r=M[e].slice(),n="rgb";else if(e==="transparent")o=0,n="rgb",r=[0,0,0];else if(/^#[A-Fa-f0-9]+$/.test(e)){var i=e.slice(1),l=i.length,f=l<=4;o=1,f?(r=[parseInt(i[0]+i[0],16),parseInt(i[1]+i[1],16),parseInt(i[2]+i[2],16)],l===4&&(o=parseInt(i[3]+i[3],16)/255)):(r=[parseInt(i[0]+i[1],16),parseInt(i[2]+i[3],16),parseInt(i[4]+i[5],16)],l===8&&(o=parseInt(i[6]+i[7],16)/255)),r[0]||(r[0]=0),r[1]||(r[1]=0),r[2]||(r[2]=0),n="rgb"}else if(t=/^((?:rgb|hs[lvb]|hwb|cmyk?|xy[zy]|gray|lab|lchu?v?|[ly]uv|lms)a?)\s*\(([^\)]*)\)/.exec(e)){var s=t[1],p=s==="rgb",i=s.replace(/a$/,"");n=i;var l=i==="cmyk"?4:i==="gray"?1:3;r=t[2].trim().split(/\s*[,\/]\s*|\s+/).map(function(g,b){if(/%$/.test(g))return b===l?parseFloat(g)/100:i==="rgb"?parseFloat(g)*255/100:parseFloat(g);if(i[b]==="h"){if(/deg$/.test(g))return parseFloat(g);if(I[g]!==void 0)return I[g]}return parseFloat(g)}),s===i&&r.push(1),o=p||r[l]===void 0?1:r[l],r=r.slice(0,l)}else e.length>10&&/[0-9](?:\s|\/)/.test(e)&&(r=e.match(/([0-9]+)/g).map(function(P){return parseFloat(P)}),n=e.match(/([a-z])/ig).join("").toLowerCase());else isNaN(e)?Array.isArray(e)||e.length?(r=[e[0],e[1],e[2]],n="rgb",o=e.length===4?e[3]:1):e instanceof Object&&(e.r!=null||e.red!=null||e.R!=null?(n="rgb",r=[e.r||e.red||e.R||0,e.g||e.green||e.G||0,e.b||e.blue||e.B||0]):(n="hsl",r=[e.h||e.hue||e.H||0,e.s||e.saturation||e.S||0,e.l||e.lightness||e.L||e.b||e.brightness]),o=e.a||e.alpha||e.opacity||1,e.opacity!=null&&(o/=100)):(n="rgb",r=[e>>>16,(e&65280)>>>8,e&255]);return{space:n,values:r,alpha:o}}var _={name:"rgb",min:[0,0,0],max:[255,255,255],channel:["red","green","blue"],alias:["RGB"]},A={name:"hsl",min:[0,0,0],max:[360,100,100],channel:["hue","saturation","lightness"],alias:["HSL"],rgb:function(e){var t=e[0]/360,r=e[1]/100,o=e[2]/100,n,i,l,f,s;if(r===0)return s=o*255,[s,s,s];o<.5?i=o*(1+r):i=o+r-o*r,n=2*o-i,f=[0,0,0];for(var p=0;p<3;p++)l=t+1/3*-(p-1),l<0?l++:l>1&&l--,6*l<1?s=n+(i-n)*6*l:2*l<1?s=i:3*l<2?s=n+(i-n)*(2/3-l)*6:s=n,f[p]=s*255;return f}};_.hsl=function(e){var t=e[0]/255,r=e[1]/255,o=e[2]/255,n=Math.min(t,r,o),i=Math.max(t,r,o),l=i-n,f,s,p;return i===n?f=0:t===i?f=(r-o)/l:r===i?f=2+(o-t)/l:o===i&&(f=4+(t-r)/l),f=Math.min(f*60,360),f<0&&(f+=360),p=(n+i)/2,i===n?s=0:p<=.5?s=l/(i+n):s=l/(2-i-n),[f,s*100,p*100]};function Y(e){Array.isArray(e)&&e.raw&&(e=String.raw(...arguments));var t,r=K(e);if(!r.space)return[];const o=r.space[0]==="h"?A.min:_.min,n=r.space[0]==="h"?A.max:_.max;return t=Array(3),t[0]=Math.min(Math.max(r.values[0],o[0]),n[0]),t[1]=Math.min(Math.max(r.values[1],o[1]),n[1]),t[2]=Math.min(Math.max(r.values[2],o[2]),n[2]),r.space[0]==="h"&&(t=A.rgb(t)),t.push(Math.min(Math.max(r.alpha,0),1)),t}function T(e){switch(typeof e){case"string":return B(e);case"number":return F.utils.hex2rgb(e);default:return e}}function B(e){const t=Y(e);if(!t)throw new Error(`Unable to parse color "${e}" as RGBA.`);return[t[0]/255,t[1]/255,t[2]/255,t[3]]}function U(e){const t=H(ie(e));if(t.length===0)throw new Error("Invalid CSS gradient.");if(t.length!==1)throw new Error("Unsupported CSS gradient (multiple gradients is not supported).");const r=t[0],o=Z(r.type),n=J(r.colorStops),i=re(r.orientation);return{type:o,stops:n,angle:i}}function Z(e){const t={"linear-gradient":0,"radial-gradient":1};if(!(e in t))throw new Error(`Unsupported gradient type "${e}"`);return t[e]}function J(e){const t=ee(e),r=[];for(let o=0;o<e.length;o++){const n=Q(e[o]);r.push({offset:t[o],color:n.slice(0,3),alpha:n[3]})}return r}function Q(e){return T(W(e))}function W(e){switch(e.type){case"hex":return`#${e.value}`;case"literal":return e.value;default:return`${e.type}(${e.value.join(",")})`}}function ee(e){const t=[];for(let n=0;n<e.length;n++){const i=e[n];let l=-1;i.type==="literal"&&i.length&&"type"in i.length&&i.length.type==="%"&&"value"in i.length&&(l=parseFloat(i.length.value)/100),t.push(l)}const r=n=>{for(let i=n;i<t.length;i++)if(t[i]!==-1)return{indexDelta:i-n,offset:t[i]};return{indexDelta:t.length-1-n,offset:1}};let o=0;for(let n=0;n<t.length;n++){const i=t[n];if(i!==-1)o=i;else if(n===0)t[n]=0;else if(n+1===t.length)t[n]=1;else{const l=r(n),f=(l.offset-o)/(1+l.indexDelta);for(let s=0;s<=l.indexDelta;s++)t[n+s]=o+(s+1)*f;n+=l.indexDelta,o=t[n]}}return t.map(te)}function te(e){return e.toString().length>6?parseFloat(e.toString().substring(0,6)):e}function re(e){if(typeof e=="undefined")return 0;if("type"in e&&"value"in e)switch(e.type){case"angular":return parseFloat(e.value);case"directional":return ne(e.value)}return 0}function ne(e){const t={left:270,top:0,bottom:180,right:90,"left top":315,"top left":315,"left bottom":225,"bottom left":225,"right top":45,"top right":45,"right bottom":135,"bottom right":135};if(!(e in t))throw new Error(`Unsupported directional value "${e}"`);return t[e]}function ie(e){let t=e.replace(/\s{2,}/gu," ");return t=t.replace(/;/g,""),t=t.replace(/ ,/g,","),t=t.replace(/\( /g,"("),t=t.replace(/ \)/g,")"),t.trim()}var oe=Object.defineProperty,ae=Object.defineProperties,le=Object.getOwnPropertyDescriptors,j=Object.getOwnPropertySymbols,se=Object.prototype.hasOwnProperty,ue=Object.prototype.propertyIsEnumerable,E=(e,t,r)=>t in e?oe(e,t,{enumerable:!0,configurable:!0,writable:!0,value:r}):e[t]=r,S=(e,t)=>{for(var r in t||(t={}))se.call(t,r)&&E(e,r,t[r]);if(j)for(var r of j(t))ue.call(t,r)&&E(e,r,t[r]);return e},fe=(e,t)=>ae(e,le(t));const R=90;function ce(e){return[...e].sort((t,r)=>t.offset-r.offset)}const k=class extends F.Filter{constructor(e){e&&"css"in e&&(e=fe(S({},U(e.css||"")),{alpha:e.alpha,maxColors:e.maxColors}));const t=S(S({},k.defaults),e);if(!t.stops||t.stops.length<2)throw new Error("ColorGradientFilter requires at least 2 color stops.");super(X,V),this._stops=[],this.autoFit=!1,Object.assign(this,t)}get stops(){return this._stops}set stops(e){const t=ce(e),r=new Float32Array(t.length*3),o=0,n=1,i=2;for(let l=0;l<t.length;l++){const f=T(t[l].color),s=l*3;r[s+o]=f[o],r[s+n]=f[n],r[s+i]=f[i]}this.uniforms.uColors=r,this.uniforms.uOffsets=t.map(l=>l.offset),this.uniforms.uAlphas=t.map(l=>l.alpha),this.uniforms.uNumStops=t.length,this._stops=t}set type(e){this.uniforms.uType=e}get type(){return this.uniforms.uType}set angle(e){this.uniforms.uAngle=e-R}get angle(){return this.uniforms.uAngle+R}set alpha(e){this.uniforms.uAlpha=e}get alpha(){return this.uniforms.uAlpha}set maxColors(e){this.uniforms.uMaxColors=e}get maxColors(){return this.uniforms.uMaxColors}};let y=k;return y.LINEAR=0,y.RADIAL=1,y.CONIC=2,y.defaults={type:k.LINEAR,stops:[{offset:0,color:16711680,alpha:1},{offset:1,color:255,alpha:1}],alpha:1,angle:90,maxColors:0},x.ColorGradientFilter=y,Object.defineProperty(x,"__esModule",{value:!0}),x}({},PIXI);Object.assign(PIXI.filters,__filters);
