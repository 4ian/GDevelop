/*!
 * @pixi/filter-tilt-shift - v3.1.1
 * Compiled Wed, 08 Apr 2020 11:09:37 UTC
 *
 * @pixi/filter-tilt-shift is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 */
// This was patched to add the missing "clearMode" argument in some functions.
var __filters = (function (t, r, i) {
  'use strict';
  var e =
      'attribute vec2 aVertexPosition;\nattribute vec2 aTextureCoord;\n\nuniform mat3 projectionMatrix;\n\nvarying vec2 vTextureCoord;\n\nvoid main(void)\n{\n    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);\n    vTextureCoord = aTextureCoord;\n}',
    n =
      'varying vec2 vTextureCoord;\n\nuniform sampler2D uSampler;\nuniform float blur;\nuniform float gradientBlur;\nuniform vec2 start;\nuniform vec2 end;\nuniform vec2 delta;\nuniform vec2 texSize;\n\nfloat random(vec3 scale, float seed)\n{\n    return fract(sin(dot(gl_FragCoord.xyz + seed, scale)) * 43758.5453 + seed);\n}\n\nvoid main(void)\n{\n    vec4 color = vec4(0.0);\n    float total = 0.0;\n\n    float offset = random(vec3(12.9898, 78.233, 151.7182), 0.0);\n    vec2 normal = normalize(vec2(start.y - end.y, end.x - start.x));\n    float radius = smoothstep(0.0, 1.0, abs(dot(vTextureCoord * texSize - start, normal)) / gradientBlur) * blur;\n\n    for (float t = -30.0; t <= 30.0; t++)\n    {\n        float percent = (t + offset - 0.5) / 30.0;\n        float weight = 1.0 - abs(percent);\n        vec4 sample = texture2D(uSampler, vTextureCoord + delta / texSize * percent * radius);\n        sample.rgb *= sample.a;\n        color += sample * weight;\n        total += weight;\n    }\n\n    color /= total;\n    color.rgb /= color.a + 0.00001;\n\n    gl_FragColor = color;\n}\n',
    o = (function (t) {
      function r(r, o, l, u) {
        void 0 === r && (r = 100),
          void 0 === o && (o = 600),
          void 0 === l && (l = null),
          void 0 === u && (u = null),
          t.call(this, e, n),
          (this.uniforms.blur = r),
          (this.uniforms.gradientBlur = o),
          (this.uniforms.start = l || new i.Point(0, window.innerHeight / 2)),
          (this.uniforms.end = u || new i.Point(600, window.innerHeight / 2)),
          (this.uniforms.delta = new i.Point(30, 30)),
          (this.uniforms.texSize = new i.Point(
            window.innerWidth,
            window.innerHeight
          )),
          this.updateDelta();
      }
      t && (r.__proto__ = t),
        (r.prototype = Object.create(t && t.prototype)),
        (r.prototype.constructor = r);
      var o = {
        blur: { configurable: !0 },
        gradientBlur: { configurable: !0 },
        start: { configurable: !0 },
        end: { configurable: !0 },
      };
      return (
        (r.prototype.updateDelta = function () {
          (this.uniforms.delta.x = 0), (this.uniforms.delta.y = 0);
        }),
        (o.blur.get = function () {
          return this.uniforms.blur;
        }),
        (o.blur.set = function (t) {
          this.uniforms.blur = t;
        }),
        (o.gradientBlur.get = function () {
          return this.uniforms.gradientBlur;
        }),
        (o.gradientBlur.set = function (t) {
          this.uniforms.gradientBlur = t;
        }),
        (o.start.get = function () {
          return this.uniforms.start;
        }),
        (o.start.set = function (t) {
          (this.uniforms.start = t), this.updateDelta();
        }),
        (o.end.get = function () {
          return this.uniforms.end;
        }),
        (o.end.set = function (t) {
          (this.uniforms.end = t), this.updateDelta();
        }),
        Object.defineProperties(r.prototype, o),
        r
      );
    })(r.Filter),
    l = (function (t) {
      function r() {
        t.apply(this, arguments);
      }
      return (
        t && (r.__proto__ = t),
        (r.prototype = Object.create(t && t.prototype)),
        (r.prototype.constructor = r),
        (r.prototype.updateDelta = function () {
          var t = this.uniforms.end.x - this.uniforms.start.x,
            r = this.uniforms.end.y - this.uniforms.start.y,
            i = Math.sqrt(t * t + r * r);
          (this.uniforms.delta.x = t / i), (this.uniforms.delta.y = r / i);
        }),
        r
      );
    })(o),
    u = (function (t) {
      function r() {
        t.apply(this, arguments);
      }
      return (
        t && (r.__proto__ = t),
        (r.prototype = Object.create(t && t.prototype)),
        (r.prototype.constructor = r),
        (r.prototype.updateDelta = function () {
          var t = this.uniforms.end.x - this.uniforms.start.x,
            r = this.uniforms.end.y - this.uniforms.start.y,
            i = Math.sqrt(t * t + r * r);
          (this.uniforms.delta.x = -r / i), (this.uniforms.delta.y = t / i);
        }),
        r
      );
    })(o),
    s = (function (t) {
      function r(r, i, e, n) {
        void 0 === r && (r = 100),
          void 0 === i && (i = 600),
          void 0 === e && (e = null),
          void 0 === n && (n = null),
          t.call(this),
          (this.tiltShiftXFilter = new l(r, i, e, n)),
          (this.tiltShiftYFilter = new u(r, i, e, n));
      }
      t && (r.__proto__ = t),
        (r.prototype = Object.create(t && t.prototype)),
        (r.prototype.constructor = r);
      var i = {
        blur: { configurable: !0 },
        gradientBlur: { configurable: !0 },
        start: { configurable: !0 },
        end: { configurable: !0 },
      };
      return (
        (r.prototype.apply = function (t, r, i, clearMode) {
          var e = t.getFilterTexture();
          // Patch missing clearMode.
          this.tiltShiftXFilter.apply(t, r, e, clearMode),
            this.tiltShiftYFilter.apply(t, e, i, clearMode),
            t.returnFilterTexture(e);
        }),
        (i.blur.get = function () {
          return this.tiltShiftXFilter.blur;
        }),
        (i.blur.set = function (t) {
          this.tiltShiftXFilter.blur = this.tiltShiftYFilter.blur = t;
        }),
        (i.gradientBlur.get = function () {
          return this.tiltShiftXFilter.gradientBlur;
        }),
        (i.gradientBlur.set = function (t) {
          this.tiltShiftXFilter.gradientBlur = this.tiltShiftYFilter.gradientBlur = t;
        }),
        (i.start.get = function () {
          return this.tiltShiftXFilter.start;
        }),
        (i.start.set = function (t) {
          this.tiltShiftXFilter.start = this.tiltShiftYFilter.start = t;
        }),
        (i.end.get = function () {
          return this.tiltShiftXFilter.end;
        }),
        (i.end.set = function (t) {
          this.tiltShiftXFilter.end = this.tiltShiftYFilter.end = t;
        }),
        Object.defineProperties(r.prototype, i),
        r
      );
    })(r.Filter);
  return (
    (t.TiltShiftAxisFilter = o),
    (t.TiltShiftFilter = s),
    (t.TiltShiftXFilter = l),
    (t.TiltShiftYFilter = u),
    t
  );
})({}, PIXI, PIXI);
Object.assign(PIXI.filters, __filters);
