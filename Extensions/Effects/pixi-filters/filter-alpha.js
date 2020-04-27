/*!
 * @pixi/filter-alpha - v5.2.1
 * Compiled Tue, 28 Jan 2020 23:33:11 UTC
 *
 * @pixi/filter-alpha is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 */
this.PIXI=this.PIXI||{},this.PIXI.filters=this.PIXI.filters||{};var _pixi_filter_alpha=function(t,r){"use strict";var e="varying vec2 vTextureCoord;\n\nuniform sampler2D uSampler;\nuniform float uAlpha;\n\nvoid main(void)\n{\n   gl_FragColor = texture2D(uSampler, vTextureCoord) * uAlpha;\n}\n",i=function(t){function i(i){void 0===i&&(i=1),t.call(this,r.defaultVertex,e,{uAlpha:1}),this.alpha=i}t&&(i.__proto__=t),i.prototype=Object.create(t&&t.prototype),i.prototype.constructor=i;var a={alpha:{configurable:!0}};return a.alpha.get=function(){return this.uniforms.uAlpha},a.alpha.set=function(t){this.uniforms.uAlpha=t},Object.defineProperties(i.prototype,a),i}(r.Filter);return t.AlphaFilter=i,t}({},PIXI);Object.assign(this.PIXI.filters,_pixi_filter_alpha);
