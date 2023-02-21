!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?t(exports):"function"==typeof define&&define.amd?define(["exports"],t):t((e="undefined"!=typeof globalThis?globalThis:e||self).TileMapHelper={})}(this,(function(e){"use strict";var t=function(e,i){return t=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var i in t)Object.prototype.hasOwnProperty.call(t,i)&&(e[i]=t[i])},t(e,i)};function i(e,i){if("function"!=typeof i&&null!==i)throw new TypeError("Class extends value "+String(i)+" is not a constructor or null");function r(){this.constructor=e}t(e,i),e.prototype=null===i?Object.create(i):(r.prototype=i.prototype,new r)}function r(e){var t="function"==typeof Symbol&&Symbol.iterator,i=t&&e[t],r=0;if(i)return i.call(e);if(e&&"number"==typeof e.length)return{next:function(){return e&&r>=e.length&&(e=void 0),{value:e&&e[r++],done:!e}}};throw new TypeError(t?"Object is not iterable.":"Symbol.iterator is not defined.")}function n(e,t){var i="function"==typeof Symbol&&e[Symbol.iterator];if(!i)return e;var r,n,o=i.call(e),l=[];try{for(;(void 0===t||t-- >0)&&!(r=o.next()).done;)l.push(r.value)}catch(e){n={error:e}}finally{try{r&&!r.done&&(i=o.return)&&i.call(o)}finally{if(n)throw n.error}}return l}function o(e,t,i){if(i||2===arguments.length)for(var r,n=0,o=t.length;n<o;n++)!r&&n in t||(r||(r=Array.prototype.slice.call(t,0,n)),r[n]=t[n]);return e.concat(r||Array.prototype.slice.call(t))}var l,a=2147483648,s=1073741824,c=536870912;function d(e){var t=l.isFlippedDiagonally(e),i=l.isFlippedHorizontally(e),r=l.isFlippedVertically(e),n=0;return t?(n=10,!i&&r?n=2:i&&!r?n=6:i&&r&&(n=14)):(n=0,!i&&r?n=8:i&&!r?n=12:i&&r&&(n=4)),n}function u(e,t,i,r){var n=e;return t&&(n|=a),i&&(n|=s),r&&(n|=c),n}!function(e){e.tileIdMask=536870911,e.getTileId=function(t){return t&e.tileIdMask},e.setFlippedHorizontally=function(e,t){return e&=2147483647,t&&(e|=a),e},e.setFlippedVertically=function(e,t){return e&=-1073741825,t&&(e|=s),e},e.setFlippedDiagonally=function(e,t){return e&=-536870913,t&&(e|=c),e},e.isFlippedHorizontally=function(e){return 0!=(e&a)},e.isFlippedVertically=function(e){return 0!=(e&s)},e.isFlippedDiagonally=function(e){return 0!=(e&c)}}(l||(l={}));var p=function(){function e(e,t,i,r,n){this.tileWidth=e,this.tileHeight=t,this.dimX=i,this.dimY=r,this._tileSet=n,this._layers=[]}return e.prototype.getWidth=function(){return this.tileWidth*this.dimX},e.prototype.getHeight=function(){return this.tileHeight*this.dimY},e.prototype.getTileHeight=function(){return this.tileHeight},e.prototype.getTileWidth=function(){return this.tileWidth},e.prototype.getDimensionX=function(){return this.dimX},e.prototype.getDimensionY=function(){return this.dimY},e.prototype.getTileDefinition=function(e){return this._tileSet.get(e)},e.prototype.getTileDefinitions=function(){return this._tileSet.values()},e.prototype.addTileLayer=function(e){var t=new g(this,e);return this._layers.push(t),t},e.prototype.addObjectLayer=function(e){var t=new h(this,e);return this._layers.push(t),t},e.prototype.getBackgroundResourceName=function(){return this._backgroundResourceName},e.prototype.getLayers=function(){return this._layers},e.prototype.pointIsInsideTile=function(e,t,i){var n,o,l=Math.floor(e/this.tileWidth),a=Math.floor(t/this.tileHeight);try{for(var s=r(this._layers),c=s.next();!c.done;c=s.next()){var d=c.value;if(d){var u=d.getTileId(l,a);if(void 0===u)return!1;if(this._tileSet.get(u).hasTaggedHitBox(i))return!0}}}catch(e){n={error:e}}finally{try{c&&!c.done&&(o=s.return)&&o.call(s)}finally{if(n)throw n.error}}return!1},e.prototype.setBackgroundResourceName=function(e){this._backgroundResourceName=e},e}(),f=function(){function e(e,t){this.visible=!0,this.tileMap=e,this.id=t}return e.prototype.setVisible=function(e){this.visible=e},e.prototype.isVisible=function(){return this.visible},e}(),h=function(e){function t(t,i){var r=e.call(this,t,i)||this;return r.objects=[],r}return i(t,e),t.prototype.add=function(e){this.objects.push(e)},t}(f),y=function(){function e(e,t,i){this.tileId=i,this.x=e,this.y=t}return e.prototype.getTileId=function(){return l.getTileId(this.tileId)},e.prototype.setFlippedHorizontally=function(e){this.tileId=l.setFlippedHorizontally(this.tileId,e)},e.prototype.setFlippedVertically=function(e){this.tileId=l.setFlippedVertically(this.tileId,e)},e.prototype.setFlippedDiagonally=function(e){this.tileId=l.setFlippedDiagonally(this.tileId,e)},e.prototype.isFlippedHorizontally=function(){return l.isFlippedHorizontally(this.tileId)},e.prototype.isFlippedVertically=function(){return l.isFlippedVertically(this.tileId)},e.prototype.isFlippedDiagonally=function(){return l.isFlippedDiagonally(this.tileId)},e}(),g=function(e){function t(t,i){var r=e.call(this,t,i)||this;r._tiles=[],r._tiles.length=r.tileMap.getDimensionY();for(var n=0;n<r._tiles.length;n++)r._tiles[n]=new Int32Array(r.tileMap.getDimensionX());return r._alpha=1,r}return i(t,e),t.prototype.getAlpha=function(){return this._alpha},t.prototype.setAlpha=function(e){this._alpha=e},t.prototype.setTile=function(e,t,i){if(this.tileMap.getTileDefinition(i)){var r=this._tiles[t];!r||e>=r.length||(r[e]=i+1)}else console.error("Invalid tile definition index: ".concat(i))},t.prototype.removeTile=function(e,t){var i=this._tiles[t];!i||e>=i.length||(i[e]=0)},t.prototype.setFlippedHorizontally=function(e,t,i){var r=this._tiles[t];if(r&&!(e>=r.length)){var n=r[e];0!==n&&(r[e]=l.setFlippedHorizontally(n,i))}},t.prototype.setFlippedVertically=function(e,t,i){var r=this._tiles[t];if(r&&!(e>=r.length)){var n=r[e];0!==n&&(r[e]=l.setFlippedVertically(n,i))}},t.prototype.setFlippedDiagonally=function(e,t,i){var r=this._tiles[t];if(r&&!(e>=r.length)){var n=r[e];0!==n&&(r[e]=l.setFlippedDiagonally(n,i))}},t.prototype.isFlippedHorizontally=function(e,t){var i=this._tiles[t];return!(!i||e>=i.length)&&l.isFlippedHorizontally(i[e])},t.prototype.isFlippedVertically=function(e,t){var i=this._tiles[t];return!(!i||e>=i.length)&&l.isFlippedVertically(i[e])},t.prototype.isFlippedDiagonally=function(e,t){var i=this._tiles[t];return!(!i||e>=i.length)&&l.isFlippedDiagonally(i[e])},t.prototype.getTileGID=function(e,t){var i=this._tiles[t];if(i&&!(e>=i.length)&&0!==i[e])return i[e]-1},t.prototype.getTileId=function(e,t){var i=this._tiles[t];if(i&&!(e>=i.length)&&0!==i[e])return l.getTileId(i[e]-1)},t.prototype.getDimensionX=function(){return 0===this._tiles.length?0:this._tiles[0].length},t.prototype.getDimensionY=function(){return this._tiles.length},t.prototype.getWidth=function(){return this.tileMap.getWidth()},t.prototype.getHeight=function(){return this.tileMap.getHeight()},t}(f),v=function(){function e(e){this.taggedHitBoxes=[],this.animationLength=null!=e?e:0,this.stackedTiles=[]}return e.prototype.addHitBox=function(e,t){var i=this.taggedHitBoxes.find((function(t){return t.tag===e}));i||(i={tag:e,polygons:[]},this.taggedHitBoxes.push(i)),i.polygons.push(t)},e.prototype.hasTaggedHitBox=function(e){return this.taggedHitBoxes.some((function(t){return t.tag===e}))},e.prototype.getHitBoxes=function(e){var t=this.taggedHitBoxes.find((function(t){return t.tag===e}));return t&&t.polygons},e.prototype.getAnimationLength=function(){return this.animationLength},e.prototype.getStackTileId=function(){return this.stackTileId},e.prototype.getStackedTiles=function(){return this.stackedTiles},e.prototype.hasStackedTiles=function(){return this.stackedTiles.length>0},e.prototype.setStackedTiles=function(e){for(var t=[],i=1;i<arguments.length;i++)t[i-1]=arguments[i];this.stackedTiles=t,this.stackTileId=e},e}(),T=function(){function e(){this._cachedValues=new Map,this._callbacks=new Map}return e.prototype.getOrLoad=function(e,t,i){var n=this,o=this._cachedValues.get(e);if(o)i(o);else{var l=this._callbacks.get(e);l?l.push(i):(this._callbacks.set(e,[i]),t((function(t){var i,o;t&&n._cachedValues.set(e,t);var l=n._callbacks.get(e);n._callbacks.delete(e);try{for(var a=r(l),s=a.next();!s.done;s=a.next()){(0,s.value)(t)}}catch(e){i={error:e}}finally{try{s&&!s.done&&(o=a.return)&&o.call(a)}finally{if(i)throw i.error}}})))}},e}(),x=function(){function e(){this._levelBackgroundTextures=new Map,this._textures=new Map}return e.prototype.setTexture=function(e,t){this._textures.set(e,t)},e.prototype.getTexture=function(e){return this._textures.get(e)},e.prototype.getLevelBackgroundTexture=function(e){return this._levelBackgroundTextures.get(e)},e.prototype.setLevelBackgroundTexture=function(e,t){this._levelBackgroundTextures.set(e,t)},e}(),_=function(e,t){var i=t.data,r=t.compression;if(!i)return i;var n=4,o=[],l=atob(i).split("").map((function(e){return e.charCodeAt(0)}));try{var a=function(e,t){return e[t]+(e[t+1]<<8)+(e[t+2]<<16)+(e[t+3]<<24)>>>0};if("zlib"===r)for(var s=new Uint8Array(l),c=e.inflate(s);n<=c.length;)o.push(a(c,n-4)),n+=4;else{if("zstd"===r)return console.error("Zstandard compression is not supported for layers in a Tilemap. Use instead zlib compression or no compression."),null;for(;n<=l.length;)o.push(a(l,n-4)),n+=4}return o}catch(e){return console.error("Failed to decompress and unzip base64 layer.data string",e),null}},w=function(e){var t=e&a,i=e&s,r=e&c;return{id:b(536870911&e),flippedHorizontally:!!t,flippedVertically:!!i,flippedDiagonally:!!r}};function b(e){return 0===e?void 0:e-1}var m,k=GlobalPIXIModule.PIXI;function I(e,t){var i=e<<16;return i+=t}!function(e){e.parseAtlas=function(e,t,i,r){if(!e.tiledversion)return console.warn("The loaded Tiled map does not contain a 'tiledversion' key. Are you sure this file has been exported from Tiled (mapeditor.org)?"),null;if(!e.tilesets.length||"source"in e.tilesets[0])return console.warn("The loaded Tiled map seems not to contain any tileset data (nothing in 'tilesets' key)."),null;var n=e.tilesets[0],o=n.tilewidth,l=n.tileheight,a=n.tilecount,s=n.image,c=n.columns,d=n.spacing,u=n.margin,p=void 0===n.firstgid?1:n.firstgid;i||(i=r(s));var f=a/c,h=o*c+d*(c-1)+2*u,y=l*f+d*(f-1)+2*u;if(1!==i.width&&i.width<h||i.width>=h+d+o||1!==i.height&&i.height<y||i.height>=y+d+l)return console.error("It seems the atlas file was resized, which is not supported. "+"It should be ".concat(h,"x").concat(y," px, ")+"but it's ".concat(i.width,"x").concat(i.height," px.")),null;if(1!==i.width&&i.width!==h||1!==i.height&&i.height!==y)return console.warn("It seems the atlas file has unused pixels. "+"It should be ".concat(h,"x").concat(y," px, ")+"but it's ".concat(i.width,"x").concat(i.height," px.")),null;for(var g=new x,v=0;v<a;v++){var T=u+Math.floor(v%c)*(o+d),_=u+Math.floor(v/c)*(l+d),w=b(p+v);try{var m=new k.Rectangle(T,_,o,l),I=new k.Texture(i,m);g.setTexture(w,I)}catch(e){console.error("An error occurred while creating a PIXI.Texture to be used in a TileMap:",e)}}return g}}(m||(m={}));var M,H,F,D,L,z=GlobalPIXIModule.PIXI;function A(e,t,i,r){var n;if(e[r])return e[r];var o=null,l=t[r];return(null==l?void 0:l.relPath)?"res/error48.png"===(null===(n=(o=i(l.relPath)).baseTexture)||void 0===n?void 0:n.cacheId)&&(console.error('The atlas texture "'.concat(l.relPath,"\" can't be loaded")),o=null):console.error('The tileset "'.concat(l.identifier,"\" doesn't seems to contain an atlas texture")),e[r]=o,o}!function(e){e.parseAtlas=function(e,t,i,l){var a,s,c,d,u=e.levels[t>-1?t:0];if(!u||!u.layerInstances)return null;var p={};try{for(var f=r(e.defs.tilesets),h=f.next();!h.done;h=f.next()){p[(b=h.value).uid]=b}}catch(e){a={error:e}}finally{try{h&&!h.done&&(s=f.return)&&s.call(f)}finally{if(a)throw a.error}}for(var y=new x,g={},v={},T=u.layerInstances.length-1;T>=0;--T){var _=u.layerInstances[T];if("Entities"!==_.__type){var w=_.__tilesetDefUid;if("number"==typeof w){var b=p[w],m=A(v,p,l,w);if(m){var k={},M=b.tileGridSize;try{for(var H=(c=void 0,r(o(o([],n(_.autoLayerTiles),!1),n(_.gridTiles),!1))),F=H.next();!F.done;F=H.next()){var D=F.value;if(!k[D.t]){var L=I(w,D.t);if(g[L])k[D.t]=!0;else{try{var S=n(D.src,2),V=S[0],P=S[1],B=new z.Rectangle(V,P,M,M),j=new z.Texture(m,B);y.setTexture(L,j)}catch(e){console.error("An error occurred while creating a PIXI.Texture to be used in a TileMap:",e)}k[D.t]=!0,g[L]=!0}}}}catch(e){c={error:e}}finally{try{F&&!F.done&&(d=H.return)&&d.call(H)}finally{if(c)throw c.error}}}}}}if(u.bgRelPath){var O=l(u.bgRelPath);B=new z.Rectangle(0,0,u.pxWid,u.pxHei),j=new z.Texture(O,B);y.setLevelBackgroundTexture(u.bgRelPath,j)}return y}}(M||(M={})),e.PixiTileMapHelper=void 0,(H=e.PixiTileMapHelper||(e.PixiTileMapHelper={})).parseAtlas=function(e,t,i,r){return"ldtk"===e.kind?M.parseAtlas(e.data,t,i,r):"tiled"===e.kind?m.parseAtlas(e.data,t,i,r):(console.warn("The loaded Tiled map data does not contain a 'tiledversion' or '__header__' key. Are you sure this file has been exported from Tiled (mapeditor.org) or LDtk (ldtk.io)?"),null)},H.updatePixiTileMap=function(e,t,i,n,o){var a,s,c,u,p,f,y=e;if(y){y.clear();var v=t.getBackgroundResourceName();if(v){var T=i.getLevelBackgroundTexture(v);y.tile(T,0,0)}try{for(var x=r(t.getLayers()),_=x.next();!_.done;_=x.next()){var w=_.value;if(!("index"===n&&o!==w.id||"visible"===n&&!w.isVisible()))if(w instanceof h){var b=w;try{for(var m=(c=void 0,r(b.objects)),k=m.next();!k.done;k=m.next()){var I=k.value,M=I.getTileId();if(T=i.getTexture(M)){var H=d(M);y.tile(T,I.x,I.y-b.tileMap.getTileHeight(),{rotate:H})}}}catch(e){c={error:e}}finally{try{k&&!k.done&&(u=m.return)&&u.call(m)}finally{if(c)throw c.error}}}else if(w instanceof g)for(var F=w,D=F.tileMap.getTileWidth(),L=F.tileMap.getTileHeight(),z=F.tileMap.getDimensionX(),A=F.tileMap.getDimensionY(),S=F.getAlpha(),V=0;V<A;V++)for(var P=0;P<z;P++){var B=D*P,j=L*V;if(void 0!==(M=F.getTileGID(P,V))){var O=l.getTileId(M),R=F.tileMap.getTileDefinition(O);if(R.hasStackedTiles())try{for(var X=(p=void 0,r(R.getStackedTiles())),C=X.next();!C.done;C=X.next()){var W=C.value,G=l.getTileId(W);(Y=i.getTexture(G))&&(H=d(W),y.tile(Y,B,j,{alpha:S,rotate:H}))}}catch(e){p={error:e}}finally{try{C&&!C.done&&(f=X.return)&&f.call(X)}finally{if(p)throw p.error}}else{var Y;if(!(Y=i.getTexture(O))){console.warn("Unknown tile id: ".concat(O," at (").concat(P,", ").concat(V,")"));continue}H=d(M);var N=y.tile(Y,B,j,{alpha:S,rotate:H});R.getAnimationLength()>0&&N.tileAnimX(D,R.getAnimationLength())}}}}}catch(e){a={error:e}}finally{try{_&&!_.done&&(s=x.return)&&s.call(x)}finally{if(a)throw a.error}}}},H.updatePixiCollisionMask=function(e,t,i,n,o,l,a,s){var c,d,u,p;if(e){e.clear(),e.lineStyle(n,o,l),e.drawRect(0,0,t.getWidth(),t.getHeight());try{for(var f=r(t.getLayers()),h=f.next();!h.done;h=f.next()){var y=h.value,v=t.getTileWidth(),T=t.getTileHeight();if(y instanceof g)for(var x=y,_=0;_<x.tileMap.getDimensionY();_++)for(var w=0;w<x.tileMap.getDimensionX();w++){var b=v*w,m=T*_,k=x.getTileId(w,_),I=x.isFlippedHorizontally(w,_),M=x.isFlippedVertically(w,_),H=x.isFlippedDiagonally(w,_),F=x.tileMap.getTileDefinition(k);if(F){var D=F.getHitBoxes(i);if(D)try{for(var L=(u=void 0,r(D)),z=L.next();!z.done;z=L.next()){var A=z.value;if(0!==A.length){e.beginFill(a,s);for(var S=0;S<A.length;S++){var V=A[S][0],P=A[S][1];if(H){var B=V;V=P,P=B}I&&(V=v-V),M&&(P=T-P),0===S?e.moveTo(b+V,m+P):e.lineTo(b+V,m+P)}e.closePath(),e.endFill()}}}catch(e){u={error:e}}finally{try{z&&!z.done&&(p=L.return)&&p.call(L)}finally{if(u)throw u.error}}}}}}catch(e){c={error:e}}finally{try{h&&!h.done&&(d=f.return)&&d.call(f)}finally{if(c)throw c.error}}}},function(e){e.load=function(e,t){var i,l,a,s,c=e.levels[t>-1?t:0];if(!c||!c.layerInstances)return null;for(var d=new Map,f=0,h=0,y=0,g=c.layerInstances.length-1;g>=0;--g){var T=(F=c.layerInstances[g]).__tilesetDefUid,x={};try{for(var _=(i=void 0,r(o(o([],n(F.autoLayerTiles),!1),n(F.gridTiles),!1))),w=_.next();!w.done;w=_.next()){if(!x[(S=w.value).t]){var b=I(T,S.t);if(d.has(b))x[S.t]=!0;else{var m=new v(0);x[S.t]=!0,d.set(b,m)}}}}catch(e){i={error:e}}finally{try{w&&!w.done&&(l=_.return)&&l.call(_)}finally{if(i)throw i.error}}"IntGrid"!==F.__type&&"AutoLayer"!==F.__type&&"Tiles"!==F.__type||(0===f?(f=F.__gridSize,h=F.__cWid,y=F.__cHei):F.__gridSize!==f&&console.warn("Grid size is different across layers. Only the first layer grid size will be followed."))}var k=new p(f,f,h,y,d),M=new Map,H=268435455;for(g=c.layerInstances.length-1;g>=0;--g){var F,D=(F=c.layerInstances[g]).__gridSize,L=(T=F.__tilesetDefUid,k.addTileLayer(g));L.setAlpha(F.__opacity),L.setVisible(F.visible);try{for(var z=(a=void 0,r(o(o([],n(F.autoLayerTiles),!1),n(F.gridTiles),!1))),A=z.next();!A.done;A=z.next()){var S=A.value,V=Math.floor(S.px[0]/D),P=Math.floor(S.px[1]/D),B=(b=I(T,S.t),L.getTileId(V,P));if(void 0===B)L.setTile(V,P,b),L.setFlippedHorizontally(V,P,1===S.f||3===S.f),L.setFlippedVertically(V,P,2===S.f||3===S.f);else{var j=u(b,1===S.f||3===S.f,2===S.f||3===S.f,!1),O=d.get(B);if(null==O?void 0:O.hasStackedTiles()){var R="".concat(O.getStackedTiles().map((function(e){return"".concat(e)})).join(";"),";").concat(j);if(m=M.get(R))L.setTile(V,P,m.getStackTileId());else{var X=new v(0);X.setStackedTiles.apply(X,o(o([H],n(O.getStackedTiles()),!1),[j],!1)),d.set(H,X),H-=1,M.set(R,X),L.setTile(V,P,X.getStackTileId())}}else{var C=L.getTileGID(V,P);R="".concat(C,";").concat(j);(m=new v(0)).setStackedTiles(H,C,j),d.set(H,m),H-=1,M.set(R,m),L.setTile(V,P,m.getStackTileId())}}}}catch(e){a={error:e}}finally{try{A&&!A.done&&(s=z.return)&&s.call(z)}finally{if(a)throw a.error}}}return c.bgRelPath&&k.setBackgroundResourceName(c.bgRelPath),k}}(F||(F={})),function(e){e.load=function(e,t){var i,n,o,l,a,s,c,d,u,f;if(!e.tiledversion)return console.warn("The loaded Tiled map does not contain a 'tiledversion' key. Are you sure this file has been exported from Tiled (mapeditor.org)?"),null;var h=new Map;try{for(var g=r(e.tilesets),T=g.next();!T.done;T=g.next()){var x=T.value,m=void 0===x.firstgid?1:x.firstgid;if(x.tiles)try{for(var k=(o=void 0,r(x.tiles)),I=k.next();!I.done;I=k.next()){var M=I.value,H=new v(M.animation?M.animation.length:0);if(M.objectgroup){var F=function(e){var t=e.class||M.class;if(!t||0===t.length)return"continue";var i=null;if(e.polygon){var r=e.rotation*Math.PI/180,n=Math.cos(r),o=Math.sin(r);-1!==n&&1!==n||(o=0),-1!==o&&1!==o||(n=0),i=e.polygon.map((function(t){return[e.x+t.x*n-t.y*o,e.y+t.x*o+t.y*n]}))}else void 0!==e.x&&void 0!==e.y&&void 0!==e.width&&void 0!==e.height&&(i=[[e.x,e.y],[e.x,e.y+e.height],[e.x+e.width,e.y+e.height],[e.x+e.width,e.y]]);i&&H.addHitBox(t,i)};try{for(var D=(a=void 0,r(M.objectgroup.objects)),L=D.next();!L.done;L=D.next()){F(G=L.value)}}catch(e){a={error:e}}finally{try{L&&!L.done&&(s=D.return)&&s.call(D)}finally{if(a)throw a.error}}}else if(M.class&&M.class.length>0){var z=[[0,0],[0,e.tileheight],[e.tilewidth,e.tileheight],[e.tilewidth,0]];H.addHitBox(M.class,z)}h.set(b(m+M.id),H)}}catch(e){o={error:e}}finally{try{I&&!I.done&&(l=k.return)&&l.call(k)}finally{if(o)throw o.error}}for(var A=0;A<x.tilecount;A++){var S=b(m+A);h.has(S)||h.set(S,new v(0))}}}catch(e){i={error:e}}finally{try{T&&!T.done&&(n=g.return)&&n.call(g)}finally{if(i)throw i.error}}var V=new p(e.tilewidth,e.tileheight,e.width,e.height,h);try{for(var P=r(e.layers),B=P.next();!B.done;B=P.next()){var j=B.value;if("objectgroup"===j.type){var O=V.addObjectLayer(j.id);O.setVisible(j.visible);try{for(var R=(u=void 0,r(j.objects)),X=R.next();!X.done;X=R.next()){var C=X.value;if(C.visible&&C.gid){var W=w(C.gid),G=new y(C.x,C.y,W.id);O.add(G),G.setFlippedHorizontally(W.flippedHorizontally),G.setFlippedVertically(W.flippedVertically),G.setFlippedDiagonally(W.flippedDiagonally)}}}catch(e){u={error:e}}finally{try{X&&!X.done&&(f=R.return)&&f.call(R)}finally{if(u)throw u.error}}}else if("tilelayer"===j.type){var Y=0,N=null;if("base64"===j.encoding?(N=_(t,j))||console.warn("Failed to uncompress layer.data"):N=j.data,N){var U=V.addTileLayer(j.id);U.setAlpha(j.opacity),U.setVisible(j.visible);for(var E=0;E<j.height;E++)for(var Z=0;Z<j.width;Z++){var q=N[Y],J=w(q);void 0!==J.id&&(U.setTile(Z,E,J.id),U.setFlippedHorizontally(Z,E,J.flippedHorizontally),U.setFlippedVertically(Z,E,J.flippedVertically),U.setFlippedDiagonally(Z,E,J.flippedDiagonally)),Y+=1}}}}}catch(e){c={error:e}}finally{try{B&&!B.done&&(d=P.return)&&d.call(P)}finally{if(c)throw c.error}}return V}}(D||(D={})),function(e){e.load=function(e,t,i){return"ldtk"===e.kind?F.load(e.data,t):"tiled"===e.kind?D.load(e.data,i):(console.warn("The loaded Tile Map data does not contain a 'tiledversion' or '__header__' key. Are you sure this file has been exported from Tiled (mapeditor.org) or LDtk (ldtk.io)?"),null)}}(L||(L={}));var S=function(){function t(){this._tileMapCache=new T,this._textureCacheCaches=new T}return t.getManager=function(e){return e.tileMapCollisionMaskManager||(e.tileMapCollisionMaskManager=new t),e.tileMapCollisionMaskManager},t.identify=function(e){return e.tiledversion?(console.info("Detected the json file was created in Tiled"),{kind:"tiled",data:e}):e.__header__&&"LDtk"===e.__header__.app?(console.info("Detected the json/ldtk file was created in LDtk"),{kind:"ldtk",data:e}):(console.warn("The loaded Tile Map data does not contain a 'tiledversion' or '__header__' key. Are you sure this file has been exported from Tiled (mapeditor.org) or LDtk (ldtk.io)?"),null)},t.prototype.getOrLoadTileMap=function(e,t,i,r,n,o){var l=t+"|"+i+"|"+r;this._tileMapCache.getOrLoad(l,(function(o){e(t,i,(function(e){if(e){var t=L.load(e,r,n);o(t)}else o(null)}))}),o)},t.prototype.getOrLoadTextureCache=function(t,i,r,n,o,l,a){var s=n+"|"+o+"|"+r+"|"+l;this._textureCacheCaches.getOrLoad(s,(function(a){t(n,o,(function(t){if(t){var n=r?i(r):null,o=e.PixiTileMapHelper.parseAtlas(t,l,n,i);a(o)}else a(null)}))}),a)},t}();e.EditableTileMap=p,e.EditableTileMapLayer=g,e.TileDefinition=v,e.TileMapManager=S,e.TileTextureCache=x,Object.defineProperty(e,"__esModule",{value:!0})}));
//# sourceMappingURL=TileMapHelper.js.map
