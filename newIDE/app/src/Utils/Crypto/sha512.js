/* eslint-disable */
// @ts-nocheck
/**
 * A JavaScript implementation of the SHA family of hashes - defined in FIPS PUB 180-4, FIPS PUB 202,
 * and SP 800-185 - as well as the corresponding HMAC implementation as defined in FIPS PUB 198-1.
 *
 * Copyright 2008-2022 Brian Turek, 1998-2009 Paul Johnston & Contributors
 * Distributed under the BSD License
 * See http://caligatio.github.com/jsSHA/ for more information
 */
const n = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
function t(n, t, e, r) {
  let i, s, o;
  const w = t || [0],
    h = (e = e || 0) >>> 3,
    u = -1 === r ? 3 : 0;
  for (i = 0; i < n.length; i += 1)
    (o = i + h),
      (s = o >>> 2),
      w.length <= s && w.push(0),
      (w[s] |= n[i] << (8 * (u + r * (o % 4))));
  return { value: w, binLen: 8 * n.length + e };
}
function e(e, r, i) {
  switch (r) {
    case 'UTF8':
    case 'UTF16BE':
    case 'UTF16LE':
      break;
    default:
      throw new Error('encoding must be UTF8, UTF16BE, or UTF16LE');
  }
  switch (e) {
    case 'HEX':
      return function(n, t, e) {
        return (function(n, t, e, r) {
          let i, s, o, w;
          if (0 != n.length % 2)
            throw new Error('String of HEX type must be in byte increments');
          const h = t || [0],
            u = (e = e || 0) >>> 3,
            c = -1 === r ? 3 : 0;
          for (i = 0; i < n.length; i += 2) {
            if (((s = parseInt(n.substr(i, 2), 16)), isNaN(s)))
              throw new Error('String of HEX type contains invalid characters');
            for (w = (i >>> 1) + u, o = w >>> 2; h.length <= o; ) h.push(0);
            h[o] |= s << (8 * (c + r * (w % 4)));
          }
          return { value: h, binLen: 4 * n.length + e };
        })(n, t, e, i);
      };
    case 'TEXT':
      return function(n, t, e) {
        return (function(n, t, e, r, i) {
          let s,
            o,
            w,
            h,
            u,
            c,
            f,
            a,
            l = 0;
          const A = e || [0],
            E = (r = r || 0) >>> 3;
          if ('UTF8' === t)
            for (f = -1 === i ? 3 : 0, w = 0; w < n.length; w += 1)
              for (
                s = n.charCodeAt(w),
                  o = [],
                  128 > s
                    ? o.push(s)
                    : 2048 > s
                    ? (o.push(192 | (s >>> 6)), o.push(128 | (63 & s)))
                    : 55296 > s || 57344 <= s
                    ? o.push(
                        224 | (s >>> 12),
                        128 | ((s >>> 6) & 63),
                        128 | (63 & s)
                      )
                    : ((w += 1),
                      (s =
                        65536 +
                        (((1023 & s) << 10) | (1023 & n.charCodeAt(w)))),
                      o.push(
                        240 | (s >>> 18),
                        128 | ((s >>> 12) & 63),
                        128 | ((s >>> 6) & 63),
                        128 | (63 & s)
                      )),
                  h = 0;
                h < o.length;
                h += 1
              ) {
                for (c = l + E, u = c >>> 2; A.length <= u; ) A.push(0);
                (A[u] |= o[h] << (8 * (f + i * (c % 4)))), (l += 1);
              }
          else
            for (
              f = -1 === i ? 2 : 0,
                a =
                  ('UTF16LE' === t && 1 !== i) || ('UTF16LE' !== t && 1 === i),
                w = 0;
              w < n.length;
              w += 1
            ) {
              for (
                s = n.charCodeAt(w),
                  !0 === a && ((h = 255 & s), (s = (h << 8) | (s >>> 8))),
                  c = l + E,
                  u = c >>> 2;
                A.length <= u;

              )
                A.push(0);
              (A[u] |= s << (8 * (f + i * (c % 4)))), (l += 2);
            }
          return { value: A, binLen: 8 * l + r };
        })(n, r, t, e, i);
      };
    case 'B64':
      return function(t, e, r) {
        return (function(t, e, r, i) {
          let s,
            o,
            w,
            h,
            u,
            c,
            f,
            a = 0;
          const l = e || [0],
            A = (r = r || 0) >>> 3,
            E = -1 === i ? 3 : 0,
            p = t.indexOf('=');
          if (-1 === t.search(/^[a-zA-Z0-9=+/]+$/))
            throw new Error('Invalid character in base-64 string');
          if (((t = t.replace(/=/g, '')), -1 !== p && p < t.length))
            throw new Error("Invalid '=' found in base-64 string");
          for (o = 0; o < t.length; o += 4) {
            for (u = t.substr(o, 4), h = 0, w = 0; w < u.length; w += 1)
              (s = n.indexOf(u.charAt(w))), (h |= s << (18 - 6 * w));
            for (w = 0; w < u.length - 1; w += 1) {
              for (f = a + A, c = f >>> 2; l.length <= c; ) l.push(0);
              (l[c] |= ((h >>> (16 - 8 * w)) & 255) << (8 * (E + i * (f % 4)))),
                (a += 1);
            }
          }
          return { value: l, binLen: 8 * a + r };
        })(t, e, r, i);
      };
    case 'BYTES':
      return function(n, t, e) {
        return (function(n, t, e, r) {
          let i, s, o, w;
          const h = t || [0],
            u = (e = e || 0) >>> 3,
            c = -1 === r ? 3 : 0;
          for (s = 0; s < n.length; s += 1)
            (i = n.charCodeAt(s)),
              (w = s + u),
              (o = w >>> 2),
              h.length <= o && h.push(0),
              (h[o] |= i << (8 * (c + r * (w % 4))));
          return { value: h, binLen: 8 * n.length + e };
        })(n, t, e, i);
      };
    case 'ARRAYBUFFER':
      try {
        new ArrayBuffer(0);
      } catch (n) {
        throw new Error('ARRAYBUFFER not supported by this environment');
      }
      return function(n, e, r) {
        return (function(n, e, r, i) {
          return t(new Uint8Array(n), e, r, i);
        })(n, e, r, i);
      };
    case 'UINT8ARRAY':
      try {
        new Uint8Array(0);
      } catch (n) {
        throw new Error('UINT8ARRAY not supported by this environment');
      }
      return function(n, e, r) {
        return t(n, e, r, i);
      };
    default:
      throw new Error(
        'format must be HEX, TEXT, B64, BYTES, ARRAYBUFFER, or UINT8ARRAY'
      );
  }
}
function r(t, e, r, i) {
  switch (t) {
    case 'HEX':
      return function(n) {
        return (function(n, t, e, r) {
          const i = '0123456789abcdef';
          let s,
            o,
            w = '';
          const h = t / 8,
            u = -1 === e ? 3 : 0;
          for (s = 0; s < h; s += 1)
            (o = n[s >>> 2] >>> (8 * (u + e * (s % 4)))),
              (w += i.charAt((o >>> 4) & 15) + i.charAt(15 & o));
          return r.outputUpper ? w.toUpperCase() : w;
        })(n, e, r, i);
      };
    case 'B64':
      return function(t) {
        return (function(t, e, r, i) {
          let s,
            o,
            w,
            h,
            u,
            c = '';
          const f = e / 8,
            a = -1 === r ? 3 : 0;
          for (s = 0; s < f; s += 3)
            for (
              h = s + 1 < f ? t[(s + 1) >>> 2] : 0,
                u = s + 2 < f ? t[(s + 2) >>> 2] : 0,
                w =
                  (((t[s >>> 2] >>> (8 * (a + r * (s % 4)))) & 255) << 16) |
                  (((h >>> (8 * (a + r * ((s + 1) % 4)))) & 255) << 8) |
                  ((u >>> (8 * (a + r * ((s + 2) % 4)))) & 255),
                o = 0;
              o < 4;
              o += 1
            )
              c +=
                8 * s + 6 * o <= e
                  ? n.charAt((w >>> (6 * (3 - o))) & 63)
                  : i.b64Pad;
          return c;
        })(t, e, r, i);
      };
    case 'BYTES':
      return function(n) {
        return (function(n, t, e) {
          let r,
            i,
            s = '';
          const o = t / 8,
            w = -1 === e ? 3 : 0;
          for (r = 0; r < o; r += 1)
            (i = (n[r >>> 2] >>> (8 * (w + e * (r % 4)))) & 255),
              (s += String.fromCharCode(i));
          return s;
        })(n, e, r);
      };
    case 'ARRAYBUFFER':
      try {
        new ArrayBuffer(0);
      } catch (n) {
        throw new Error('ARRAYBUFFER not supported by this environment');
      }
      return function(n) {
        return (function(n, t, e) {
          let r;
          const i = t / 8,
            s = new ArrayBuffer(i),
            o = new Uint8Array(s),
            w = -1 === e ? 3 : 0;
          for (r = 0; r < i; r += 1)
            o[r] = (n[r >>> 2] >>> (8 * (w + e * (r % 4)))) & 255;
          return s;
        })(n, e, r);
      };
    case 'UINT8ARRAY':
      try {
        new Uint8Array(0);
      } catch (n) {
        throw new Error('UINT8ARRAY not supported by this environment');
      }
      return function(n) {
        return (function(n, t, e) {
          let r;
          const i = t / 8,
            s = -1 === e ? 3 : 0,
            o = new Uint8Array(i);
          for (r = 0; r < i; r += 1)
            o[r] = (n[r >>> 2] >>> (8 * (s + e * (r % 4)))) & 255;
          return o;
        })(n, e, r);
      };
    default:
      throw new Error(
        'format must be HEX, B64, BYTES, ARRAYBUFFER, or UINT8ARRAY'
      );
  }
}
const i = [
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
  s = [
    3238371032,
    914150663,
    812702999,
    4144912697,
    4290775857,
    1750603025,
    1694076839,
    3204075428,
  ],
  o = [
    1779033703,
    3144134277,
    1013904242,
    2773480762,
    1359893119,
    2600822924,
    528734635,
    1541459225,
  ];
function w(n) {
  const t = { outputUpper: !1, b64Pad: '=', outputLen: -1 },
    e = n || {},
    r = 'Output length must be a multiple of 8';
  if (
    ((t.outputUpper = e.outputUpper || !1),
    e.b64Pad && (t.b64Pad = e.b64Pad),
    e.outputLen)
  ) {
    if (e.outputLen % 8 != 0) throw new Error(r);
    t.outputLen = e.outputLen;
  } else if (e.shakeLen) {
    if (e.shakeLen % 8 != 0) throw new Error(r);
    t.outputLen = e.shakeLen;
  }
  if ('boolean' != typeof t.outputUpper)
    throw new Error('Invalid outputUpper formatting option');
  if ('string' != typeof t.b64Pad)
    throw new Error('Invalid b64Pad formatting option');
  return t;
}
class h {
  constructor(n, t) {
    (this.t = n), (this.i = t);
  }
}
function u(n, t) {
  let e;
  return t < 32
    ? ((e = 32 - t), new h((n.t >>> t) | (n.i << e), (n.i >>> t) | (n.t << e)))
    : ((e = 64 - t), new h((n.i >>> t) | (n.t << e), (n.t >>> t) | (n.i << e)));
}
function c(n, t) {
  return new h(n.t >>> t, (n.i >>> t) | (n.t << (32 - t)));
}
function f(n, t, e) {
  return new h(
    (n.t & t.t) ^ (n.t & e.t) ^ (t.t & e.t),
    (n.i & t.i) ^ (n.i & e.i) ^ (t.i & e.i)
  );
}
function a(n) {
  const t = u(n, 28),
    e = u(n, 34),
    r = u(n, 39);
  return new h(t.t ^ e.t ^ r.t, t.i ^ e.i ^ r.i);
}
function l(n, t) {
  let e, r;
  (e = (65535 & n.i) + (65535 & t.i)),
    (r = (n.i >>> 16) + (t.i >>> 16) + (e >>> 16));
  const i = ((65535 & r) << 16) | (65535 & e);
  (e = (65535 & n.t) + (65535 & t.t) + (r >>> 16)),
    (r = (n.t >>> 16) + (t.t >>> 16) + (e >>> 16));
  return new h(((65535 & r) << 16) | (65535 & e), i);
}
function A(n, t, e, r) {
  let i, s;
  (i = (65535 & n.i) + (65535 & t.i) + (65535 & e.i) + (65535 & r.i)),
    (s =
      (n.i >>> 16) + (t.i >>> 16) + (e.i >>> 16) + (r.i >>> 16) + (i >>> 16));
  const o = ((65535 & s) << 16) | (65535 & i);
  (i =
    (65535 & n.t) + (65535 & t.t) + (65535 & e.t) + (65535 & r.t) + (s >>> 16)),
    (s =
      (n.t >>> 16) + (t.t >>> 16) + (e.t >>> 16) + (r.t >>> 16) + (i >>> 16));
  return new h(((65535 & s) << 16) | (65535 & i), o);
}
function E(n, t, e, r, i) {
  let s, o;
  (s =
    (65535 & n.i) +
    (65535 & t.i) +
    (65535 & e.i) +
    (65535 & r.i) +
    (65535 & i.i)),
    (o =
      (n.i >>> 16) +
      (t.i >>> 16) +
      (e.i >>> 16) +
      (r.i >>> 16) +
      (i.i >>> 16) +
      (s >>> 16));
  const w = ((65535 & o) << 16) | (65535 & s);
  (s =
    (65535 & n.t) +
    (65535 & t.t) +
    (65535 & e.t) +
    (65535 & r.t) +
    (65535 & i.t) +
    (o >>> 16)),
    (o =
      (n.t >>> 16) +
      (t.t >>> 16) +
      (e.t >>> 16) +
      (r.t >>> 16) +
      (i.t >>> 16) +
      (s >>> 16));
  return new h(((65535 & o) << 16) | (65535 & s), w);
}
function p(n) {
  const t = u(n, 19),
    e = u(n, 61),
    r = c(n, 6);
  return new h(t.t ^ e.t ^ r.t, t.i ^ e.i ^ r.i);
}
function R(n) {
  const t = u(n, 1),
    e = u(n, 8),
    r = c(n, 7);
  return new h(t.t ^ e.t ^ r.t, t.i ^ e.i ^ r.i);
}
function U(n) {
  const t = u(n, 14),
    e = u(n, 18),
    r = u(n, 41);
  return new h(t.t ^ e.t ^ r.t, t.i ^ e.i ^ r.i);
}
const d = [
  new h(i[0], 3609767458),
  new h(i[1], 602891725),
  new h(i[2], 3964484399),
  new h(i[3], 2173295548),
  new h(i[4], 4081628472),
  new h(i[5], 3053834265),
  new h(i[6], 2937671579),
  new h(i[7], 3664609560),
  new h(i[8], 2734883394),
  new h(i[9], 1164996542),
  new h(i[10], 1323610764),
  new h(i[11], 3590304994),
  new h(i[12], 4068182383),
  new h(i[13], 991336113),
  new h(i[14], 633803317),
  new h(i[15], 3479774868),
  new h(i[16], 2666613458),
  new h(i[17], 944711139),
  new h(i[18], 2341262773),
  new h(i[19], 2007800933),
  new h(i[20], 1495990901),
  new h(i[21], 1856431235),
  new h(i[22], 3175218132),
  new h(i[23], 2198950837),
  new h(i[24], 3999719339),
  new h(i[25], 766784016),
  new h(i[26], 2566594879),
  new h(i[27], 3203337956),
  new h(i[28], 1034457026),
  new h(i[29], 2466948901),
  new h(i[30], 3758326383),
  new h(i[31], 168717936),
  new h(i[32], 1188179964),
  new h(i[33], 1546045734),
  new h(i[34], 1522805485),
  new h(i[35], 2643833823),
  new h(i[36], 2343527390),
  new h(i[37], 1014477480),
  new h(i[38], 1206759142),
  new h(i[39], 344077627),
  new h(i[40], 1290863460),
  new h(i[41], 3158454273),
  new h(i[42], 3505952657),
  new h(i[43], 106217008),
  new h(i[44], 3606008344),
  new h(i[45], 1432725776),
  new h(i[46], 1467031594),
  new h(i[47], 851169720),
  new h(i[48], 3100823752),
  new h(i[49], 1363258195),
  new h(i[50], 3750685593),
  new h(i[51], 3785050280),
  new h(i[52], 3318307427),
  new h(i[53], 3812723403),
  new h(i[54], 2003034995),
  new h(i[55], 3602036899),
  new h(i[56], 1575990012),
  new h(i[57], 1125592928),
  new h(i[58], 2716904306),
  new h(i[59], 442776044),
  new h(i[60], 593698344),
  new h(i[61], 3733110249),
  new h(i[62], 2999351573),
  new h(i[63], 3815920427),
  new h(3391569614, 3928383900),
  new h(3515267271, 566280711),
  new h(3940187606, 3454069534),
  new h(4118630271, 4000239992),
  new h(116418474, 1914138554),
  new h(174292421, 2731055270),
  new h(289380356, 3203993006),
  new h(460393269, 320620315),
  new h(685471733, 587496836),
  new h(852142971, 1086792851),
  new h(1017036298, 365543100),
  new h(1126000580, 2618297676),
  new h(1288033470, 3409855158),
  new h(1501505948, 4234509866),
  new h(1607167915, 987167468),
  new h(1816402316, 1246189591),
];
function y(n) {
  return 'SHA-384' === n
    ? [
        new h(3418070365, s[0]),
        new h(1654270250, s[1]),
        new h(2438529370, s[2]),
        new h(355462360, s[3]),
        new h(1731405415, s[4]),
        new h(41048885895, s[5]),
        new h(3675008525, s[6]),
        new h(1203062813, s[7]),
      ]
    : [
        new h(o[0], 4089235720),
        new h(o[1], 2227873595),
        new h(o[2], 4271175723),
        new h(o[3], 1595750129),
        new h(o[4], 2917565137),
        new h(o[5], 725511199),
        new h(o[6], 4215389547),
        new h(o[7], 327033209),
      ];
}
function T(n, t) {
  let e, r, i, s, o, w, u, c, y, T, F, b;
  const m = [];
  for (
    e = t[0],
      r = t[1],
      i = t[2],
      s = t[3],
      o = t[4],
      w = t[5],
      u = t[6],
      c = t[7],
      F = 0;
    F < 80;
    F += 1
  )
    F < 16
      ? ((b = 2 * F), (m[F] = new h(n[b], n[b + 1])))
      : (m[F] = A(p(m[F - 2]), m[F - 7], R(m[F - 15]), m[F - 16])),
      (y = E(
        c,
        U(o),
        ((B = w),
        (H = u),
        new h(((g = o).t & B.t) ^ (~g.t & H.t), (g.i & B.i) ^ (~g.i & H.i))),
        d[F],
        m[F]
      )),
      (T = l(a(e), f(e, r, i))),
      (c = u),
      (u = w),
      (w = o),
      (o = l(s, y)),
      (s = i),
      (i = r),
      (r = e),
      (e = l(y, T));
  var g, B, H;
  return (
    (t[0] = l(e, t[0])),
    (t[1] = l(r, t[1])),
    (t[2] = l(i, t[2])),
    (t[3] = l(s, t[3])),
    (t[4] = l(o, t[4])),
    (t[5] = l(w, t[5])),
    (t[6] = l(u, t[6])),
    (t[7] = l(c, t[7])),
    t
  );
}
class F extends class {
  constructor(n, t, e) {
    const r = e || {};
    if (
      ((this.o = t),
      (this.h = r.encoding || 'UTF8'),
      (this.numRounds = r.numRounds || 1),
      isNaN(this.numRounds) ||
        this.numRounds !== parseInt(this.numRounds, 10) ||
        1 > this.numRounds)
    )
      throw new Error('numRounds must a integer >= 1');
    (this.u = n),
      (this.l = []),
      (this.A = 0),
      (this.p = !1),
      (this.R = 0),
      (this.U = !1),
      (this.T = []),
      (this.F = []);
  }
  update(n) {
    let t,
      e = 0;
    const r = this.m >>> 5,
      i = this.g(n, this.l, this.A),
      s = i.binLen,
      o = i.value,
      w = s >>> 5;
    for (t = 0; t < w; t += r)
      e + this.m <= s &&
        ((this.B = this.H(o.slice(t, t + r), this.B)), (e += this.m));
    return (
      (this.R += e),
      (this.l = o.slice(e >>> 5)),
      (this.A = s % this.m),
      (this.p = !0),
      this
    );
  }
  getHash(n, t) {
    let e,
      i,
      s = this.v;
    const o = w(t);
    if (this.Y) {
      if (-1 === o.outputLen)
        throw new Error('Output length must be specified in options');
      s = o.outputLen;
    }
    const h = r(n, s, this.C, o);
    if (this.U && this.S) return h(this.S(o));
    for (
      i = this.I(this.l.slice(), this.A, this.R, this.L(this.B), s), e = 1;
      e < this.numRounds;
      e += 1
    )
      this.Y &&
        s % 32 != 0 &&
        (i[i.length - 1] &= 16777215 >>> (24 - (s % 32))),
        (i = this.I(i, s, 0, this.M(this.u), s));
    return h(i);
  }
  setHMACKey(n, t, r) {
    if (!this.N) throw new Error('Variant does not support HMAC');
    if (this.p) throw new Error('Cannot set MAC key after calling update');
    const i = e(t, (r || {}).encoding || 'UTF8', this.C);
    this.X(i(n));
  }
  X(n) {
    const t = this.m >>> 3,
      e = t / 4 - 1;
    let r;
    if (1 !== this.numRounds) throw new Error('Cannot set numRounds with MAC');
    if (this.U) throw new Error('MAC key already set');
    for (
      t < n.binLen / 8 &&
      (n.value = this.I(n.value, n.binLen, 0, this.M(this.u), this.v));
      n.value.length <= e;

    )
      n.value.push(0);
    for (r = 0; r <= e; r += 1)
      (this.T[r] = 909522486 ^ n.value[r]),
        (this.F[r] = 1549556828 ^ n.value[r]);
    (this.B = this.H(this.T, this.B)), (this.R = this.m), (this.U = !0);
  }
  getHMAC(n, t) {
    const e = w(t);
    return r(n, this.v, this.C, e)(this.k());
  }
  k() {
    let n;
    if (!this.U)
      throw new Error('Cannot call getHMAC without first setting MAC key');
    const t = this.I(this.l.slice(), this.A, this.R, this.L(this.B), this.v);
    return (
      (n = this.H(this.F, this.M(this.u))),
      (n = this.I(t, this.v, this.m, n, this.v)),
      n
    );
  }
} {
  constructor(n, t, r) {
    if ('SHA-384' !== n && 'SHA-512' !== n)
      throw new Error('Chosen SHA variant is not supported');
    super(n, t, r);
    const i = r || {};
    (this.S = this.k),
      (this.N = !0),
      (this.C = -1),
      (this.g = e(this.o, this.h, this.C)),
      (this.H = T),
      (this.L = function(n) {
        return n.slice();
      }),
      (this.M = y),
      (this.I = function(t, e, r, i) {
        return (function(n, t, e, r, i) {
          let s, o;
          const w = 31 + (((t + 129) >>> 10) << 5),
            h = t + e;
          for (; n.length <= w; ) n.push(0);
          for (
            n[t >>> 5] |= 128 << (24 - (t % 32)),
              n[w] = 4294967295 & h,
              n[w - 1] = (h / 4294967296) | 0,
              s = 0;
            s < n.length;
            s += 32
          )
            r = T(n.slice(s, s + 32), r);
          return (
            (o =
              'SHA-384' === i
                ? [
                    r[0].t,
                    r[0].i,
                    r[1].t,
                    r[1].i,
                    r[2].t,
                    r[2].i,
                    r[3].t,
                    r[3].i,
                    r[4].t,
                    r[4].i,
                    r[5].t,
                    r[5].i,
                  ]
                : [
                    r[0].t,
                    r[0].i,
                    r[1].t,
                    r[1].i,
                    r[2].t,
                    r[2].i,
                    r[3].t,
                    r[3].i,
                    r[4].t,
                    r[4].i,
                    r[5].t,
                    r[5].i,
                    r[6].t,
                    r[6].i,
                    r[7].t,
                    r[7].i,
                  ]),
            o
          );
        })(t, e, r, i, n);
      }),
      (this.B = y(n)),
      (this.m = 1024),
      (this.v = 'SHA-384' === n ? 384 : 512),
      (this.Y = !1),
      i.hmacKey &&
        this.X(
          (function(n, t, r, i) {
            const s = n + ' must include a value and format';
            if (!t) {
              if (!i) throw new Error(s);
              return i;
            }
            if (void 0 === t.value || !t.format) throw new Error(s);
            return e(t.format, t.encoding || 'UTF8', r)(t.value);
          })('hmacKey', i.hmacKey, this.C)
        );
  }
}
export { F as default };
