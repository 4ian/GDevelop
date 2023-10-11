// This filter is probably made useless by advanced-bloom.
/*!
 * @pixi/filter-bloom - v5.1.1
 * Compiled Thu, 31 Aug 2023 09:18:38 UTC
 *
 * @pixi/filter-bloom is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 */var __filters=function(b,i,n,F){"use strict";class a extends i.Filter{constructor(t=2,l=4,r=i.settings.FILTER_RESOLUTION,u=5){super();let e,s;typeof t=="number"?(e=t,s=t):t instanceof i.Point?(e=t.x,s=t.y):Array.isArray(t)&&(e=t[0],s=t[1]),this.blurXFilter=new F.BlurFilterPass(!0,e,l,r,u),this.blurYFilter=new F.BlurFilterPass(!1,s,l,r,u),this.blurYFilter.blendMode=i.BLEND_MODES.SCREEN,this.defaultFilter=new n.AlphaFilter}apply(t,l,r,u){const e=t.getFilterTexture();this.defaultFilter.apply(t,l,r,u),this.blurXFilter.apply(t,l,e,1),this.blurYFilter.apply(t,e,r,0),t.returnFilterTexture(e)}get blur(){return this.blurXFilter.blur}set blur(t){this.blurXFilter.blur=this.blurYFilter.blur=t}get blurX(){return this.blurXFilter.blur}set blurX(t){this.blurXFilter.blur=t}get blurY(){return this.blurYFilter.blur}set blurY(t){this.blurYFilter.blur=t}}return b.BloomFilter=a,Object.defineProperty(b,"__esModule",{value:!0}),b}({},PIXI,PIXI.filters,PIXI.filters);Object.assign(PIXI.filters,__filters);
