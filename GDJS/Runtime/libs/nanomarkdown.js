/**
 * nano-markdown - a minimal markdown to html converter
 * Copyright (c) 2015, Vladimir Antonov. (MIT Licensed)
 * https://github.com/Holixus/nano-markdown
 * Adapted from Extracted from https://github.com/Holixus/nano-markdown/blob/b8f726b37c3e142cbedf6aed03c750664337b597/index.js.
 */
(function (f) {
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    module.exports = f();
  } else if (typeof define === 'function' && define.amd) {
    define([], f);
  } else {
    var g;
    if (typeof window !== 'undefined') {
      g = window;
    } else if (typeof global !== 'undefined') {
      g = global;
    } else if (typeof self !== 'undefined') {
      g = self;
    } else {
      g = this;
    }
    g.nmd = f();
  }
})(function () {
  var define, module, exports;
  return (function e(t, n, r) {
    function s(o, u) {
      if (!n[o]) {
        if (!t[o]) {
          var a = typeof require == 'function' && require;
          if (!u && a) return a(o, !0);
          if (i) return i(o, !0);
          var f = new Error("Cannot find module '" + o + "'");
          throw ((f.code = 'MODULE_NOT_FOUND'), f);
        }
        var l = (n[o] = { exports: {} });
        t[o][0].call(
          l.exports,
          function (e) {
            var n = t[o][1][e];
            return s(n ? n : e);
          },
          l,
          l.exports,
          e,
          t,
          n,
          r
        );
      }
      return n[o].exports;
    }
    var i = typeof require == 'function' && require;
    for (var o = 0; o < r.length; o++) s(r[o]);
    return s;
  })(
    {
      1: [
        function (require, module, exports) {
          'use strict';

          var escapes = '\\[!]#{()}*+-._',
            esc_ofs = 16;

          function lex(a) {
            return a
              .replace(/\\([(){}[\]#*+\-.!_\\])/g, function (m, ch) {
                return String.fromCharCode(1, escapes.indexOf(ch) + esc_ofs);
              })
              .replace(/(\*\*|__|~~)(.*?)\1/g, function (m, delim, text) {
                return delim === '~~'
                  ? '<del>' + text + '</del>'
                  : '<b>' + text + '</b>';
              })
              .replace(/(\n|^|\W)([_\*])(.*?)\2(\W|$|\n)/g, function (
                m,
                l,
                di,
                ital,
                r
              ) {
                return l + '<i>' + ital + '</i>' + r;
              })
              .replace(
                /(!?)\[([^\]<>]+)\]\((\+?)([^ \)<>]+)(?: "([^\(\)\"]+)")?\)/g,
                function (match, is_img, text, new_tab, ref, title) {
                  var attrs = title ? ' title="' + title + '"' : '';
                  if (is_img)
                    return (
                      '<img src="' +
                      nmd.href(ref) +
                      '" alt="' +
                      text +
                      '"' +
                      attrs +
                      '/>'
                    );
                  if (new_tab) attrs += ' target="_blank" rel="noopener"';
                  return (
                    '<a href="' +
                    nmd.href(ref) +
                    '"' +
                    attrs +
                    '>' +
                    text +
                    '</a>'
                  );
                }
              );
          }

          function unesc(a) {
            return a.replace(/\x01([\x0f-\x1c])/g, function (m, c) {
              return escapes.charAt(c.charCodeAt(0) - esc_ofs);
            });
          }

          var nmd = function (md) {
            return md.replace(/.+(?:\n.+)*/g, function (m) {
              var code = /^\s{4}([^]*)$/.exec(m);
              if (code)
                return (
                  '<pre><code>' +
                  code[1].replace(/\n    /g, '\n') +
                  '</code></pre>'
                );
              var ps = [],
                cur,
                rows = lex(m).split('\n');
              for (var i = 0, l = rows.length; i < l; ++i) {
                var row = rows[i],
                  head = /^\s{0,3}(\#{1,6})\s+(.*?)\s*#*\s*$/.exec(row);
                if (head) {
                  // heading
                  ps.push((cur = [head[2], 'h', head[1].length])); // cur = [ text, type, level ]
                  continue;
                }
                var list = /^(\s*)(?:[-*]|(\d[.)])) (.+)$/.exec(row);
                if (list)
                  ps.push(
                    (cur = [list[3], list[2] ? 'ol' : 'ul', list[1].length])
                  );
                // cur = [ text, type, level ]
                else if (/^\s{0,3}([-])(\s*\1){2,}\s*$/.test(row))
                  ps.push((cur = ['', 'hr']));
                else if (cur && cur[1] !== 'hr' && cur[1] !== 'h')
                  cur[0] += '\n' + row;
                else ps.push((cur = [row, 'p', '']));
              }
              var out = '',
                lists = [];
              for (i = 0, l = ps.length; i < l; ++i) {
                cur = ps[i];
                var text = cur[0],
                  tag = cur[1],
                  lvl = cur[2];
                if (tag === 'ul' || tag === 'ol') {
                  if (!lists.length || lvl > lists[0][1]) {
                    lists.unshift([tag, lvl]);
                    out += '<' + lists[0][0] + '><li>' + text;
                  } else if (lists.length > 1 && lvl <= lists[1][1]) {
                    out += '</li></' + lists.shift()[0] + '>';
                    --i;
                  } else out += '</li><li>' + text;
                } else {
                  while (lists.length)
                    out += '</li></' + lists.shift()[0] + '>';
                  out +=
                    tag === 'hr'
                      ? '<hr/>'
                      : '<' +
                        tag +
                        lvl +
                        nmd.headAttrs(lvl, text) +
                        '>' +
                        text +
                        '</' +
                        tag +
                        lvl +
                        '>';
                }
              }
              while (lists.length) out += '</li></' + lists.shift()[0] + '>';
              return unesc(out);
            });
          };
          nmd.href = function (ref) {
            return ref;
          };

          nmd.headAttrs = function (level, text) {
            return ''; // return ' id=\''+text.replace(/[^a-z0-9]/g, '_').replace(/_{2,}/g, '_').replace(/^_*(.*?)_*$/, '$1').toLowerCase()+'\'';
          };
          module.exports = nmd;
        },
        {},
      ],
    },
    {},
    [1]
  )(1);
});
