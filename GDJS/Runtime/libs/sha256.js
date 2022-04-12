/**
 * A JavaScript implementation of the SHA family of hashes - defined in FIPS PUB 180-4, FIPS PUB 202,
 * and SP 800-185 - as well as the corresponding HMAC implementation as defined in FIPS PUB 198-1.
 *
 * Copyright 2008-2021 Brian Turek, 1998-2009 Paul Johnston & Contributors
 * Distributed under the BSD License
 * See http://caligatio.github.com/jsSHA/ for more information
 *
 * Two ECMAScript polyfill functions carry the following license:
 *
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, EITHER EXPRESS OR IMPLIED,
 * INCLUDING WITHOUT LIMITATION ANY IMPLIED WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
 * MERCHANTABLITY OR NON-INFRINGEMENT.
 *
 * See the Apache Version 2.0 License for specific language governing permissions and limitations under the License.
 */
!(function (r, t) {
  'object' == typeof exports && 'undefined' != typeof module
    ? (module.exports = t())
    : 'function' == typeof define && define.amd
    ? define(t)
    : ((r =
        'undefined' != typeof globalThis ? globalThis : r || self).jsSHA = t());
})(this, function () {
  'use strict';
  var r = function (t, n) {
    return (r =
      Object.setPrototypeOf ||
      ({ __proto__: [] } instanceof Array &&
        function (r, t) {
          r.__proto__ = t;
        }) ||
      function (r, t) {
        for (var n in t)
          Object.prototype.hasOwnProperty.call(t, n) && (r[n] = t[n]);
      })(t, n);
  };
  var t = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',
    n = 'ARRAYBUFFER not supported by this environment',
    i = 'UINT8ARRAY not supported by this environment';
  function e(r, t, n, i) {
    var e,
      o,
      u,
      s = t || [0],
      f = (n = n || 0) >>> 3,
      h = -1 === i ? 3 : 0;
    for (e = 0; e < r.length; e += 1)
      (o = (u = e + f) >>> 2),
        s.length <= o && s.push(0),
        (s[o] |= r[e] << (8 * (h + i * (u % 4))));
    return { value: s, binLen: 8 * r.length + n };
  }
  function o(r, o, u) {
    switch (o) {
      case 'UTF8':
      case 'UTF16BE':
      case 'UTF16LE':
        break;
      default:
        throw new Error('encoding must be UTF8, UTF16BE, or UTF16LE');
    }
    switch (r) {
      case 'HEX':
        return function (r, t, n) {
          return (function (r, t, n, i) {
            var e, o, u, s;
            if (0 != r.length % 2)
              throw new Error('String of HEX type must be in byte increments');
            var f = t || [0],
              h = (n = n || 0) >>> 3,
              a = -1 === i ? 3 : 0;
            for (e = 0; e < r.length; e += 2) {
              if (((o = parseInt(r.substr(e, 2), 16)), isNaN(o)))
                throw new Error(
                  'String of HEX type contains invalid characters'
                );
              for (u = (s = (e >>> 1) + h) >>> 2; f.length <= u; ) f.push(0);
              f[u] |= o << (8 * (a + i * (s % 4)));
            }
            return { value: f, binLen: 4 * r.length + n };
          })(r, t, n, u);
        };
      case 'TEXT':
        return function (r, t, n) {
          return (function (r, t, n, i, e) {
            var o,
              u,
              s,
              f,
              h,
              a,
              c,
              w,
              v = 0,
              E = n || [0],
              l = (i = i || 0) >>> 3;
            if ('UTF8' === t)
              for (c = -1 === e ? 3 : 0, s = 0; s < r.length; s += 1)
                for (
                  u = [],
                    128 > (o = r.charCodeAt(s))
                      ? u.push(o)
                      : 2048 > o
                      ? (u.push(192 | (o >>> 6)), u.push(128 | (63 & o)))
                      : 55296 > o || 57344 <= o
                      ? u.push(
                          224 | (o >>> 12),
                          128 | ((o >>> 6) & 63),
                          128 | (63 & o)
                        )
                      : ((s += 1),
                        (o =
                          65536 +
                          (((1023 & o) << 10) | (1023 & r.charCodeAt(s)))),
                        u.push(
                          240 | (o >>> 18),
                          128 | ((o >>> 12) & 63),
                          128 | ((o >>> 6) & 63),
                          128 | (63 & o)
                        )),
                    f = 0;
                  f < u.length;
                  f += 1
                ) {
                  for (h = (a = v + l) >>> 2; E.length <= h; ) E.push(0);
                  (E[h] |= u[f] << (8 * (c + e * (a % 4)))), (v += 1);
                }
            else
              for (
                c = -1 === e ? 2 : 0,
                  w =
                    ('UTF16LE' === t && 1 !== e) ||
                    ('UTF16LE' !== t && 1 === e),
                  s = 0;
                s < r.length;
                s += 1
              ) {
                for (
                  o = r.charCodeAt(s),
                    !0 === w && (o = ((f = 255 & o) << 8) | (o >>> 8)),
                    h = (a = v + l) >>> 2;
                  E.length <= h;

                )
                  E.push(0);
                (E[h] |= o << (8 * (c + e * (a % 4)))), (v += 2);
              }
            return { value: E, binLen: 8 * v + i };
          })(r, o, t, n, u);
        };
      case 'B64':
        return function (r, n, i) {
          return (function (r, n, i, e) {
            var o,
              u,
              s,
              f,
              h,
              a,
              c = 0,
              w = n || [0],
              v = (i = i || 0) >>> 3,
              E = -1 === e ? 3 : 0,
              l = r.indexOf('=');
            if (-1 === r.search(/^[a-zA-Z0-9=+/]+$/))
              throw new Error('Invalid character in base-64 string');
            if (((r = r.replace(/=/g, '')), -1 !== l && l < r.length))
              throw new Error("Invalid '=' found in base-64 string");
            for (o = 0; o < r.length; o += 4) {
              for (f = r.substr(o, 4), s = 0, u = 0; u < f.length; u += 1)
                s |= t.indexOf(f.charAt(u)) << (18 - 6 * u);
              for (u = 0; u < f.length - 1; u += 1) {
                for (h = (a = c + v) >>> 2; w.length <= h; ) w.push(0);
                (w[h] |=
                  ((s >>> (16 - 8 * u)) & 255) << (8 * (E + e * (a % 4)))),
                  (c += 1);
              }
            }
            return { value: w, binLen: 8 * c + i };
          })(r, n, i, u);
        };
      case 'BYTES':
        return function (r, t, n) {
          return (function (r, t, n, i) {
            var e,
              o,
              u,
              s,
              f = t || [0],
              h = (n = n || 0) >>> 3,
              a = -1 === i ? 3 : 0;
            for (o = 0; o < r.length; o += 1)
              (e = r.charCodeAt(o)),
                (u = (s = o + h) >>> 2),
                f.length <= u && f.push(0),
                (f[u] |= e << (8 * (a + i * (s % 4))));
            return { value: f, binLen: 8 * r.length + n };
          })(r, t, n, u);
        };
      case 'ARRAYBUFFER':
        try {
          new ArrayBuffer(0);
        } catch (r) {
          throw new Error(n);
        }
        return function (r, t, n) {
          return (function (r, t, n, i) {
            return e(new Uint8Array(r), t, n, i);
          })(r, t, n, u);
        };
      case 'UINT8ARRAY':
        try {
          new Uint8Array(0);
        } catch (r) {
          throw new Error(i);
        }
        return function (r, t, n) {
          return e(r, t, n, u);
        };
      default:
        throw new Error(
          'format must be HEX, TEXT, B64, BYTES, ARRAYBUFFER, or UINT8ARRAY'
        );
    }
  }
  function u(r, e, o, u) {
    switch (r) {
      case 'HEX':
        return function (r) {
          return (function (r, t, n, i) {
            var e,
              o,
              u = '0123456789abcdef',
              s = '',
              f = t / 8,
              h = -1 === n ? 3 : 0;
            for (e = 0; e < f; e += 1)
              (o = r[e >>> 2] >>> (8 * (h + n * (e % 4)))),
                (s += u.charAt((o >>> 4) & 15) + u.charAt(15 & o));
            return i.outputUpper ? s.toUpperCase() : s;
          })(r, e, o, u);
        };
      case 'B64':
        return function (r) {
          return (function (r, n, i, e) {
            var o,
              u,
              s,
              f,
              h,
              a = '',
              c = n / 8,
              w = -1 === i ? 3 : 0;
            for (o = 0; o < c; o += 3)
              for (
                f = o + 1 < c ? r[(o + 1) >>> 2] : 0,
                  h = o + 2 < c ? r[(o + 2) >>> 2] : 0,
                  s =
                    (((r[o >>> 2] >>> (8 * (w + i * (o % 4)))) & 255) << 16) |
                    (((f >>> (8 * (w + i * ((o + 1) % 4)))) & 255) << 8) |
                    ((h >>> (8 * (w + i * ((o + 2) % 4)))) & 255),
                  u = 0;
                u < 4;
                u += 1
              )
                a +=
                  8 * o + 6 * u <= n
                    ? t.charAt((s >>> (6 * (3 - u))) & 63)
                    : e.b64Pad;
            return a;
          })(r, e, o, u);
        };
      case 'BYTES':
        return function (r) {
          return (function (r, t, n) {
            var i,
              e,
              o = '',
              u = t / 8,
              s = -1 === n ? 3 : 0;
            for (i = 0; i < u; i += 1)
              (e = (r[i >>> 2] >>> (8 * (s + n * (i % 4)))) & 255),
                (o += String.fromCharCode(e));
            return o;
          })(r, e, o);
        };
      case 'ARRAYBUFFER':
        try {
          new ArrayBuffer(0);
        } catch (r) {
          throw new Error(n);
        }
        return function (r) {
          return (function (r, t, n) {
            var i,
              e = t / 8,
              o = new ArrayBuffer(e),
              u = new Uint8Array(o),
              s = -1 === n ? 3 : 0;
            for (i = 0; i < e; i += 1)
              u[i] = (r[i >>> 2] >>> (8 * (s + n * (i % 4)))) & 255;
            return o;
          })(r, e, o);
        };
      case 'UINT8ARRAY':
        try {
          new Uint8Array(0);
        } catch (r) {
          throw new Error(i);
        }
        return function (r) {
          return (function (r, t, n) {
            var i,
              e = t / 8,
              o = -1 === n ? 3 : 0,
              u = new Uint8Array(e);
            for (i = 0; i < e; i += 1)
              u[i] = (r[i >>> 2] >>> (8 * (o + n * (i % 4)))) & 255;
            return u;
          })(r, e, o);
        };
      default:
        throw new Error(
          'format must be HEX, B64, BYTES, ARRAYBUFFER, or UINT8ARRAY'
        );
    }
  }
  var s = [
      1116352408,
      1899447441,
      3049323471,
      3921009573,
      961987163,
      1508970993,
      2453635748,
      2870763221,
      3624381080,
      310598401,
      607225278,
      1426881987,
      1925078388,
      2162078206,
      2614888103,
      3248222580,
      3835390401,
      4022224774,
      264347078,
      604807628,
      770255983,
      1249150122,
      1555081692,
      1996064986,
      2554220882,
      2821834349,
      2952996808,
      3210313671,
      3336571891,
      3584528711,
      113926993,
      338241895,
      666307205,
      773529912,
      1294757372,
      1396182291,
      1695183700,
      1986661051,
      2177026350,
      2456956037,
      2730485921,
      2820302411,
      3259730800,
      3345764771,
      3516065817,
      3600352804,
      4094571909,
      275423344,
      430227734,
      506948616,
      659060556,
      883997877,
      958139571,
      1322822218,
      1537002063,
      1747873779,
      1955562222,
      2024104815,
      2227730452,
      2361852424,
      2428436474,
      2756734187,
      3204031479,
      3329325298,
    ],
    f = [
      3238371032,
      914150663,
      812702999,
      4144912697,
      4290775857,
      1750603025,
      1694076839,
      3204075428,
    ],
    h = [
      1779033703,
      3144134277,
      1013904242,
      2773480762,
      1359893119,
      2600822924,
      528734635,
      1541459225,
    ];
  function a(r) {
    var t = { outputUpper: !1, b64Pad: '=', outputLen: -1 },
      n = r || {},
      i = 'Output length must be a multiple of 8';
    if (
      ((t.outputUpper = n.outputUpper || !1),
      n.b64Pad && (t.b64Pad = n.b64Pad),
      n.outputLen)
    ) {
      if (n.outputLen % 8 != 0) throw new Error(i);
      t.outputLen = n.outputLen;
    } else if (n.shakeLen) {
      if (n.shakeLen % 8 != 0) throw new Error(i);
      t.outputLen = n.shakeLen;
    }
    if ('boolean' != typeof t.outputUpper)
      throw new Error('Invalid outputUpper formatting option');
    if ('string' != typeof t.b64Pad)
      throw new Error('Invalid b64Pad formatting option');
    return t;
  }
  function c(r, t) {
    return (r >>> t) | (r << (32 - t));
  }
  function w(r, t) {
    return r >>> t;
  }
  function v(r, t, n) {
    return (r & t) ^ (~r & n);
  }
  function E(r, t, n) {
    return (r & t) ^ (r & n) ^ (t & n);
  }
  function l(r) {
    return c(r, 2) ^ c(r, 13) ^ c(r, 22);
  }
  function A(r, t) {
    var n = (65535 & r) + (65535 & t);
    return (
      ((65535 & ((r >>> 16) + (t >>> 16) + (n >>> 16))) << 16) | (65535 & n)
    );
  }
  function p(r, t, n, i) {
    var e = (65535 & r) + (65535 & t) + (65535 & n) + (65535 & i);
    return (
      ((65535 &
        ((r >>> 16) + (t >>> 16) + (n >>> 16) + (i >>> 16) + (e >>> 16))) <<
        16) |
      (65535 & e)
    );
  }
  function d(r, t, n, i, e) {
    var o = (65535 & r) + (65535 & t) + (65535 & n) + (65535 & i) + (65535 & e);
    return (
      ((65535 &
        ((r >>> 16) +
          (t >>> 16) +
          (n >>> 16) +
          (i >>> 16) +
          (e >>> 16) +
          (o >>> 16))) <<
        16) |
      (65535 & o)
    );
  }
  function y(r) {
    return c(r, 7) ^ c(r, 18) ^ w(r, 3);
  }
  function U(r) {
    return c(r, 6) ^ c(r, 11) ^ c(r, 25);
  }
  function T(r) {
    return 'SHA-224' == r ? f.slice() : h.slice();
  }
  function b(r, t) {
    var n,
      i,
      e,
      o,
      u,
      f,
      h,
      a,
      T,
      b,
      R,
      m,
      F = [];
    for (
      n = t[0],
        i = t[1],
        e = t[2],
        o = t[3],
        u = t[4],
        f = t[5],
        h = t[6],
        a = t[7],
        R = 0;
      R < 64;
      R += 1
    )
      (F[R] =
        R < 16
          ? r[R]
          : p(
              c((m = F[R - 2]), 17) ^ c(m, 19) ^ w(m, 10),
              F[R - 7],
              y(F[R - 15]),
              F[R - 16]
            )),
        (T = d(a, U(u), v(u, f, h), s[R], F[R])),
        (b = A(l(n), E(n, i, e))),
        (a = h),
        (h = f),
        (f = u),
        (u = A(o, T)),
        (o = e),
        (e = i),
        (i = n),
        (n = A(T, b));
    return (
      (t[0] = A(n, t[0])),
      (t[1] = A(i, t[1])),
      (t[2] = A(e, t[2])),
      (t[3] = A(o, t[3])),
      (t[4] = A(u, t[4])),
      (t[5] = A(f, t[5])),
      (t[6] = A(h, t[6])),
      (t[7] = A(a, t[7])),
      t
    );
  }
  return (function (t) {
    function n(r, n, i) {
      var e = this;
      if ('SHA-224' !== r && 'SHA-256' !== r)
        throw new Error('Chosen SHA variant is not supported');
      var u = i || {};
      return (
        ((e = t.call(this, r, n, i) || this).t = e.i),
        (e.o = !0),
        (e.u = -1),
        (e.h = o(e.v, e.l, e.u)),
        (e.A = b),
        (e.p = function (r) {
          return r.slice();
        }),
        (e.U = T),
        (e.T = function (t, n, i, e) {
          return (function (r, t, n, i, e) {
            for (
              var o, u = 15 + (((t + 65) >>> 9) << 4), s = t + n;
              r.length <= u;

            )
              r.push(0);
            for (
              r[t >>> 5] |= 128 << (24 - (t % 32)),
                r[u] = 4294967295 & s,
                r[u - 1] = (s / 4294967296) | 0,
                o = 0;
              o < r.length;
              o += 16
            )
              i = b(r.slice(o, o + 16), i);
            return 'SHA-224' === e
              ? [i[0], i[1], i[2], i[3], i[4], i[5], i[6]]
              : i;
          })(t, n, i, e, r);
        }),
        (e.R = T(r)),
        (e.m = 512),
        (e.F = 'SHA-224' === r ? 224 : 256),
        (e.g = !1),
        u.hmacKey &&
          e.B(
            (function (r, t, n, i) {
              var e = r + ' must include a value and format';
              if (!t) {
                if (!i) throw new Error(e);
                return i;
              }
              if (void 0 === t.value || !t.format) throw new Error(e);
              return o(t.format, t.encoding || 'UTF8', n)(t.value);
            })('hmacKey', u.hmacKey, e.u)
          ),
        e
      );
    }
    return (
      (function (t, n) {
        if ('function' != typeof n && null !== n)
          throw new TypeError(
            'Class extends value ' + String(n) + ' is not a constructor or null'
          );
        function i() {
          this.constructor = t;
        }
        r(t, n),
          (t.prototype =
            null === n
              ? Object.create(n)
              : ((i.prototype = n.prototype), new i()));
      })(n, t),
      n
    );
  })(
    (function () {
      function r(r, t, n) {
        var i = n || {};
        if (
          ((this.v = t),
          (this.l = i.encoding || 'UTF8'),
          (this.numRounds = i.numRounds || 1),
          isNaN(this.numRounds) ||
            this.numRounds !== parseInt(this.numRounds, 10) ||
            1 > this.numRounds)
        )
          throw new Error('numRounds must a integer >= 1');
        (this.H = r),
          (this.S = []),
          (this.Y = 0),
          (this.C = !1),
          (this.I = 0),
          (this.L = !1),
          (this.N = []),
          (this.X = []);
      }
      return (
        (r.prototype.update = function (r) {
          var t,
            n = 0,
            i = this.m >>> 5,
            e = this.h(r, this.S, this.Y),
            o = e.binLen,
            u = e.value,
            s = o >>> 5;
          for (t = 0; t < s; t += i)
            n + this.m <= o &&
              ((this.R = this.A(u.slice(t, t + i), this.R)), (n += this.m));
          (this.I += n),
            (this.S = u.slice(n >>> 5)),
            (this.Y = o % this.m),
            (this.C = !0);
        }),
        (r.prototype.getHash = function (r, t) {
          var n,
            i,
            e = this.F,
            o = a(t);
          if (this.g) {
            if (-1 === o.outputLen)
              throw new Error('Output length must be specified in options');
            e = o.outputLen;
          }
          var s = u(r, e, this.u, o);
          if (this.L && this.t) return s(this.t(o));
          for (
            i = this.T(this.S.slice(), this.Y, this.I, this.p(this.R), e),
              n = 1;
            n < this.numRounds;
            n += 1
          )
            this.g &&
              e % 32 != 0 &&
              (i[i.length - 1] &= 16777215 >>> (24 - (e % 32))),
              (i = this.T(i, e, 0, this.U(this.H), e));
          return s(i);
        }),
        (r.prototype.setHMACKey = function (r, t, n) {
          if (!this.o) throw new Error('Variant does not support HMAC');
          if (this.C)
            throw new Error('Cannot set MAC key after calling update');
          var i = o(t, (n || {}).encoding || 'UTF8', this.u);
          this.B(i(r));
        }),
        (r.prototype.B = function (r) {
          var t,
            n = this.m >>> 3,
            i = n / 4 - 1;
          if (1 !== this.numRounds)
            throw new Error('Cannot set numRounds with MAC');
          if (this.L) throw new Error('MAC key already set');
          for (
            n < r.binLen / 8 &&
            (r.value = this.T(r.value, r.binLen, 0, this.U(this.H), this.F));
            r.value.length <= i;

          )
            r.value.push(0);
          for (t = 0; t <= i; t += 1)
            (this.N[t] = 909522486 ^ r.value[t]),
              (this.X[t] = 1549556828 ^ r.value[t]);
          (this.R = this.A(this.N, this.R)), (this.I = this.m), (this.L = !0);
        }),
        (r.prototype.getHMAC = function (r, t) {
          var n = a(t);
          return u(r, this.F, this.u, n)(this.i());
        }),
        (r.prototype.i = function () {
          var r;
          if (!this.L)
            throw new Error(
              'Cannot call getHMAC without first setting MAC key'
            );
          var t = this.T(
            this.S.slice(),
            this.Y,
            this.I,
            this.p(this.R),
            this.F
          );
          return (
            (r = this.A(this.X, this.U(this.H))),
            (r = this.T(t, this.F, this.m, r, this.F))
          );
        }),
        r
      );
    })()
  );
});
