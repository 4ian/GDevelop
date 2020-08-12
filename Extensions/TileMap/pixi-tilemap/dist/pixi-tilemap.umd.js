(function (factory) {
    typeof define === 'function' && define.amd ? define(factory) :
    factory();
}((function () { 'use strict';

    var pixi_tilemap;
    (function (pixi_tilemap) {
        var CanvasTileRenderer = (function () {
            function CanvasTileRenderer(renderer) {
                this.tileAnim = [0, 0];
                this.dontUseTransform = false;
                this.renderer = renderer;
                this.tileAnim = [0, 0];
            }
            return CanvasTileRenderer;
        }());
        pixi_tilemap.CanvasTileRenderer = CanvasTileRenderer;
        var cr = PIXI.CanvasRenderer;
        if (cr) {
            cr.registerPlugin('tilemap', CanvasTileRenderer);
        }
    })(pixi_tilemap || (pixi_tilemap = {}));
    var __extends = (undefined && undefined.__extends) || (function () {
        var extendStatics = function (d, b) {
            extendStatics = Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
                function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
            return extendStatics(d, b);
        };
        return function (d, b) {
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
    var pixi_tilemap;
    (function (pixi_tilemap) {
        var CompositeRectTileLayer = (function (_super) {
            __extends(CompositeRectTileLayer, _super);
            function CompositeRectTileLayer(zIndex, bitmaps, texPerChild) {
                var _this = _super.call(this) || this;
                _this.modificationMarker = 0;
                _this.shadowColor = new Float32Array([0.0, 0.0, 0.0, 0.5]);
                _this._globalMat = null;
                _this._lastLayer = null;
                _this.initialize.apply(_this, arguments);
                return _this;
            }
            CompositeRectTileLayer.prototype.updateTransform = function () {
                this.displayObjectUpdateTransform();
            };
            CompositeRectTileLayer.prototype.initialize = function (zIndex, bitmaps, texPerChild) {
                if (texPerChild === true) {
                    texPerChild = 0;
                }
                this.z = this.zIndex = zIndex;
                this.texPerChild = texPerChild || pixi_tilemap.Constant.boundCountPerBuffer * pixi_tilemap.Constant.maxTextures;
                if (bitmaps) {
                    this.setBitmaps(bitmaps);
                }
            };
            CompositeRectTileLayer.prototype.setBitmaps = function (bitmaps) {
                for (var i_1 = 0; i_1 < bitmaps.length; i_1++) {
                    if (bitmaps[i_1] && !bitmaps[i_1].baseTexture) {
                        throw new Error("pixi-tilemap cannot use destroyed textures. " +
                            "Probably, you passed resources['myAtlas'].texture in pixi > 5.2.1, it does not exist there.");
                    }
                }
                var texPerChild = this.texPerChild;
                var len1 = this.children.length;
                var len2 = Math.ceil(bitmaps.length / texPerChild);
                var i;
                for (i = 0; i < len1; i++) {
                    this.children[i].textures = bitmaps.slice(i * texPerChild, (i + 1) * texPerChild);
                }
                for (i = len1; i < len2; i++) {
                    var layer = new pixi_tilemap.RectTileLayer(this.zIndex, bitmaps.slice(i * texPerChild, (i + 1) * texPerChild));
                    layer.compositeParent = true;
                    layer.offsetX = pixi_tilemap.Constant.boundSize;
                    layer.offsetY = pixi_tilemap.Constant.boundSize;
                    this.addChild(layer);
                }
            };
            CompositeRectTileLayer.prototype.clear = function () {
                for (var i = 0; i < this.children.length; i++) {
                    this.children[i].clear();
                }
                this.modificationMarker = 0;
            };
            CompositeRectTileLayer.prototype.addRect = function (textureIndex, u, v, x, y, tileWidth, tileHeight, animX, animY, rotate, animWidth, animHeight) {
                var childIndex = textureIndex / this.texPerChild >> 0;
                var textureId = textureIndex % this.texPerChild;
                if (this.children[childIndex] && this.children[childIndex].textures) {
                    this._lastLayer = this.children[childIndex];
                    this._lastLayer.addRect(textureId, u, v, x, y, tileWidth, tileHeight, animX, animY, rotate, animWidth, animHeight);
                }
                else {
                    this._lastLayer = null;
                }
                return this;
            };
            CompositeRectTileLayer.prototype.tileRotate = function (rotate) {
                if (this._lastLayer) {
                    this._lastLayer.tileRotate(rotate);
                }
                return this;
            };
            CompositeRectTileLayer.prototype.tileAnimX = function (offset, count) {
                if (this._lastLayer) {
                    this._lastLayer.tileAnimX(offset, count);
                }
                return this;
            };
            CompositeRectTileLayer.prototype.tileAnimY = function (offset, count) {
                if (this._lastLayer) {
                    this._lastLayer.tileAnimY(offset, count);
                }
                return this;
            };
            CompositeRectTileLayer.prototype.addFrame = function (texture_, x, y, animX, animY, animWidth, animHeight) {
                var texture;
                var layer = null;
                var ind = 0;
                var children = this.children;
                this._lastLayer = null;
                if (typeof texture_ === "number") {
                    var childIndex = texture_ / this.texPerChild >> 0;
                    layer = children[childIndex];
                    if (!layer) {
                        layer = children[0];
                        if (!layer) {
                            return this;
                        }
                        ind = 0;
                    }
                    else {
                        ind = texture_ % this.texPerChild;
                    }
                    texture = layer.textures[ind];
                }
                else {
                    if (typeof texture_ === "string") {
                        texture = PIXI.Texture.from(texture_);
                    }
                    else {
                        texture = texture_;
                    }
                    for (var i = 0; i < children.length; i++) {
                        var child = children[i];
                        var tex = child.textures;
                        for (var j = 0; j < tex.length; j++) {
                            if (tex[j].baseTexture === texture.baseTexture) {
                                layer = child;
                                ind = j;
                                break;
                            }
                        }
                        if (layer) {
                            break;
                        }
                    }
                    if (!layer) {
                        for (var i = 0; i < children.length; i++) {
                            var child = children[i];
                            if (child.textures.length < this.texPerChild) {
                                layer = child;
                                ind = child.textures.length;
                                child.textures.push(texture);
                                break;
                            }
                        }
                        if (!layer) {
                            layer = new pixi_tilemap.RectTileLayer(this.zIndex, texture);
                            layer.compositeParent = true;
                            layer.offsetX = pixi_tilemap.Constant.boundSize;
                            layer.offsetY = pixi_tilemap.Constant.boundSize;
                            children.push(layer);
                            ind = 0;
                        }
                    }
                }
                this._lastLayer = layer;
                layer.addRect(ind, texture.frame.x, texture.frame.y, x, y, texture.orig.width, texture.orig.height, animX, animY, texture.rotate, animWidth, animHeight);
                return this;
            };
            CompositeRectTileLayer.prototype.renderCanvas = function (renderer) {
                if (!this.visible || this.worldAlpha <= 0 || !this.renderable) {
                    return;
                }
                var plugin = renderer.plugins.tilemap;
                if (!plugin.dontUseTransform) {
                    var wt = this.worldTransform;
                    renderer.context.setTransform(wt.a, wt.b, wt.c, wt.d, wt.tx * renderer.resolution, wt.ty * renderer.resolution);
                }
                var layers = this.children;
                for (var i = 0; i < layers.length; i++) {
                    layers[i].renderCanvasCore(renderer);
                }
            };
            CompositeRectTileLayer.prototype.render = function (renderer) {
                if (!this.visible || this.worldAlpha <= 0 || !this.renderable) {
                    return;
                }
                var plugin = renderer.plugins['tilemap'];
                var shader = plugin.getShader();
                renderer.batch.setObjectRenderer(plugin);
                this._globalMat = shader.uniforms.projTransMatrix;
                renderer.globalUniforms.uniforms.projectionMatrix.copyTo(this._globalMat).append(this.worldTransform);
                shader.uniforms.shadowColor = this.shadowColor;
                shader.uniforms.animationFrame = plugin.tileAnim;
                renderer.shader.bind(shader, false);
                var layers = this.children;
                for (var i = 0; i < layers.length; i++) {
                    layers[i].renderWebGLCore(renderer, plugin);
                }
            };
            CompositeRectTileLayer.prototype.isModified = function (anim) {
                var layers = this.children;
                if (this.modificationMarker !== layers.length) {
                    return true;
                }
                for (var i = 0; i < layers.length; i++) {
                    if (layers[i].isModified(anim)) {
                        return true;
                    }
                }
                return false;
            };
            CompositeRectTileLayer.prototype.clearModify = function () {
                var layers = this.children;
                this.modificationMarker = layers.length;
                for (var i = 0; i < layers.length; i++) {
                    layers[i].clearModify();
                }
            };
            return CompositeRectTileLayer;
        }(PIXI.Container));
        pixi_tilemap.CompositeRectTileLayer = CompositeRectTileLayer;
    })(pixi_tilemap || (pixi_tilemap = {}));
    var pixi_tilemap;
    (function (pixi_tilemap) {
        pixi_tilemap.Constant = {
            maxTextures: 16,
            bufferSize: 2048,
            boundSize: 1024,
            boundCountPerBuffer: 1,
            use32bitIndex: false,
            SCALE_MODE: PIXI.SCALE_MODES.LINEAR,
            DO_CLEAR: true
        };
    })(pixi_tilemap || (pixi_tilemap = {}));
    var pixi_tilemap;
    (function (pixi_tilemap) {
        var GraphicsLayer = (function (_super) {
            __extends(GraphicsLayer, _super);
            function GraphicsLayer(zIndex) {
                var _this = _super.call(this) || this;
                _this.zIndex = zIndex;
                return _this;
            }
            GraphicsLayer.prototype.renderCanvas = function (renderer) {
                var wt = null;
                if (renderer.plugins.tilemap.dontUseTransform) {
                    wt = this.transform.worldTransform;
                    this.transform.worldTransform = PIXI.Matrix.IDENTITY;
                }
                renderer.plugins.graphics.render(this);
                if (renderer.plugins.tilemap.dontUseTransform) {
                    this.transform.worldTransform = wt;
                }
                renderer.context.globalAlpha = 1.0;
            };
            GraphicsLayer.prototype.isModified = function (anim) {
                return false;
            };
            GraphicsLayer.prototype.clearModify = function () {
            };
            return GraphicsLayer;
        }(PIXI.Graphics));
    })(pixi_tilemap || (pixi_tilemap = {}));
    var pixi_tilemap;
    (function (pixi_tilemap) {
        var MultiTextureResource = (function (_super) {
            __extends(MultiTextureResource, _super);
            function MultiTextureResource(options) {
                var _this = _super.call(this, options.bufferSize, options.bufferSize) || this;
                _this.DO_CLEAR = false;
                _this.boundSize = 0;
                _this._clearBuffer = null;
                _this.baseTex = null;
                _this.boundSprites = [];
                _this.dirties = [];
                var bounds = _this.boundSprites;
                var dirties = _this.dirties;
                _this.boundSize = options.boundSize;
                for (var j = 0; j < options.boundCountPerBuffer; j++) {
                    var spr = new PIXI.Sprite();
                    spr.position.x = options.boundSize * (j & 1);
                    spr.position.y = options.boundSize * (j >> 1);
                    bounds.push(spr);
                    dirties.push(0);
                }
                _this.DO_CLEAR = !!options.DO_CLEAR;
                return _this;
            }
            MultiTextureResource.prototype.bind = function (baseTexture) {
                if (this.baseTex) {
                    throw new Error('Only one baseTexture is allowed for this resource!');
                }
                this.baseTex = baseTexture;
                _super.prototype.bind.call(this, baseTexture);
            };
            MultiTextureResource.prototype.setTexture = function (ind, texture) {
                var spr = this.boundSprites[ind];
                if (spr.texture.baseTexture === texture.baseTexture) {
                    return;
                }
                spr.texture = texture;
                this.baseTex.update();
                this.dirties[ind] = this.baseTex.dirtyId;
            };
            MultiTextureResource.prototype.upload = function (renderer, texture, glTexture) {
                var gl = renderer.gl;
                var _a = this, width = _a.width, height = _a.height;
                gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, texture.alphaMode === undefined ||
                    texture.alphaMode === PIXI.ALPHA_MODES.UNPACK);
                if (glTexture.dirtyId < 0) {
                    glTexture.width = width;
                    glTexture.height = height;
                    gl.texImage2D(texture.target, 0, texture.format, width, height, 0, texture.format, texture.type, null);
                }
                var doClear = this.DO_CLEAR;
                if (doClear && !this._clearBuffer) {
                    this._clearBuffer = new Uint8Array(pixi_tilemap.Constant.boundSize * pixi_tilemap.Constant.boundSize * 4);
                }
                var bounds = this.boundSprites;
                for (var i = 0; i < bounds.length; i++) {
                    var spr = bounds[i];
                    var tex = spr.texture.baseTexture;
                    if (glTexture.dirtyId >= this.dirties[i]) {
                        continue;
                    }
                    var res = tex.resource;
                    if (!tex.valid || !res || !res.source) {
                        continue;
                    }
                    if (doClear && (tex.width < this.boundSize || tex.height < this.boundSize)) {
                        gl.texSubImage2D(texture.target, 0, spr.position.x, spr.position.y, this.boundSize, this.boundSize, texture.format, texture.type, this._clearBuffer);
                    }
                    gl.texSubImage2D(texture.target, 0, spr.position.x, spr.position.y, texture.format, texture.type, res.source);
                }
                return true;
            };
            return MultiTextureResource;
        }(PIXI.resources.Resource));
        pixi_tilemap.MultiTextureResource = MultiTextureResource;
    })(pixi_tilemap || (pixi_tilemap = {}));
    var pixi_tilemap;
    (function (pixi_tilemap) {
        var groupD8 = PIXI.groupD8;
        pixi_tilemap.POINT_STRUCT_SIZE = 12;
        var RectTileLayer = (function (_super) {
            __extends(RectTileLayer, _super);
            function RectTileLayer(zIndex, texture) {
                var _this = _super.call(this) || this;
                _this.zIndex = 0;
                _this.modificationMarker = 0;
                _this.shadowColor = new Float32Array([0.0, 0.0, 0.0, 0.5]);
                _this._globalMat = null;
                _this.pointsBuf = [];
                _this.hasAnim = false;
                _this.offsetX = 0;
                _this.offsetY = 0;
                _this.compositeParent = false;
                _this.vbId = 0;
                _this.vb = null;
                _this.vbBuffer = null;
                _this.vbArray = null;
                _this.vbInts = null;
                _this.initialize(zIndex, texture);
                return _this;
            }
            RectTileLayer.prototype.initialize = function (zIndex, textures) {
                if (!textures) {
                    textures = [];
                }
                else if (!(textures instanceof Array) && textures.baseTexture) {
                    textures = [textures];
                }
                this.textures = textures;
                this.zIndex = zIndex;
            };
            RectTileLayer.prototype.clear = function () {
                this.pointsBuf.length = 0;
                this.modificationMarker = 0;
                this.hasAnim = false;
            };
            RectTileLayer.prototype.addFrame = function (texture_, x, y, animX, animY) {
                var texture;
                var textureIndex = 0;
                if (typeof texture_ === "number") {
                    textureIndex = texture_;
                    texture = this.textures[textureIndex];
                }
                else {
                    if (typeof texture_ === "string") {
                        texture = PIXI.Texture.from(texture_);
                    }
                    else {
                        texture = texture_;
                    }
                    var found = false;
                    var textureList = this.textures;
                    for (var i = 0; i < textureList.length; i++) {
                        if (textureList[i].baseTexture === texture.baseTexture) {
                            textureIndex = i;
                            found = true;
                            break;
                        }
                    }
                    if (!found) {
                        return false;
                    }
                }
                this.addRect(textureIndex, texture.frame.x, texture.frame.y, x, y, texture.orig.width, texture.orig.height, animX, animY, texture.rotate);
                return true;
            };
            RectTileLayer.prototype.addRect = function (textureIndex, u, v, x, y, tileWidth, tileHeight, animX, animY, rotate, animCountX, animCountY) {
                if (animX === void 0) { animX = 0; }
                if (animY === void 0) { animY = 0; }
                if (rotate === void 0) { rotate = 0; }
                if (animCountX === void 0) { animCountX = 1024; }
                if (animCountY === void 0) { animCountY = 1024; }
                var pb = this.pointsBuf;
                this.hasAnim = this.hasAnim || animX > 0 || animY > 0;
                pb.push(u);
                pb.push(v);
                pb.push(x);
                pb.push(y);
                pb.push(tileWidth);
                pb.push(tileHeight);
                pb.push(rotate);
                pb.push(animX | 0);
                pb.push(animY | 0);
                pb.push(textureIndex);
                pb.push(animCountX);
                pb.push(animCountY);
                return this;
            };
            RectTileLayer.prototype.tileRotate = function (rotate) {
                var pb = this.pointsBuf;
                pb[pb.length - 3] = rotate;
            };
            RectTileLayer.prototype.tileAnimX = function (offset, count) {
                var pb = this.pointsBuf;
                pb[pb.length - 5] = offset;
                pb[pb.length - 2] = count;
            };
            RectTileLayer.prototype.tileAnimY = function (offset, count) {
                var pb = this.pointsBuf;
                pb[pb.length - 4] = offset;
                pb[pb.length - 1] = count;
            };
            RectTileLayer.prototype.renderCanvas = function (renderer) {
                var plugin = renderer.plugins.tilemap;
                if (!plugin.dontUseTransform) {
                    var wt = this.worldTransform;
                    renderer.context.setTransform(wt.a, wt.b, wt.c, wt.d, wt.tx * renderer.resolution, wt.ty * renderer.resolution);
                }
                this.renderCanvasCore(renderer);
            };
            RectTileLayer.prototype.renderCanvasCore = function (renderer) {
                if (this.textures.length === 0)
                    return;
                var points = this.pointsBuf;
                renderer.context.fillStyle = '#000000';
                for (var i = 0, n = points.length; i < n; i += pixi_tilemap.POINT_STRUCT_SIZE) {
                    var x1 = points[i], y1 = points[i + 1];
                    var x2 = points[i + 2], y2 = points[i + 3];
                    var w = points[i + 4];
                    var h = points[i + 5];
                    var rotate = points[i + 6];
                    x1 += points[i + 7] * renderer.plugins.tilemap.tileAnim[0];
                    y1 += points[i + 8] * renderer.plugins.tilemap.tileAnim[1];
                    var textureIndex = points[i + 9];
                    if (textureIndex >= 0) {
                        renderer.context.drawImage(this.textures[textureIndex].baseTexture.getDrawableSource(), x1, y1, w, h, x2, y2, w, h);
                    }
                    else {
                        renderer.context.globalAlpha = 0.5;
                        renderer.context.fillRect(x2, y2, w, h);
                        renderer.context.globalAlpha = 1;
                    }
                }
            };
            RectTileLayer.prototype.destroyVb = function () {
                if (this.vb) {
                    this.vb.destroy();
                    this.vb = null;
                }
            };
            RectTileLayer.prototype.render = function (renderer) {
                var plugin = renderer.plugins['tilemap'];
                var shader = plugin.getShader();
                renderer.batch.setObjectRenderer(plugin);
                this._globalMat = shader.uniforms.projTransMatrix;
                renderer.globalUniforms.uniforms.projectionMatrix.copyTo(this._globalMat).append(this.worldTransform);
                shader.uniforms.shadowColor = this.shadowColor;
                shader.uniforms.animationFrame = plugin.tileAnim;
                this.renderWebGLCore(renderer, plugin);
            };
            RectTileLayer.prototype.renderWebGLCore = function (renderer, plugin) {
                var points = this.pointsBuf;
                if (points.length === 0)
                    return;
                var rectsCount = points.length / pixi_tilemap.POINT_STRUCT_SIZE;
                var shader = plugin.getShader();
                var textures = this.textures;
                if (textures.length === 0)
                    return;
                plugin.bindTextures(renderer, shader, textures);
                renderer.shader.bind(shader, false);
                var vb = this.vb;
                if (!vb) {
                    vb = plugin.createVb();
                    this.vb = vb;
                    this.vbId = vb.id;
                    this.vbBuffer = null;
                    this.modificationMarker = 0;
                }
                plugin.checkIndexBuffer(rectsCount, vb);
                var boundCountPerBuffer = pixi_tilemap.Constant.boundCountPerBuffer;
                var vertexBuf = vb.getBuffer('aVertexPosition');
                var vertices = rectsCount * vb.vertPerQuad;
                if (vertices === 0)
                    return;
                if (this.modificationMarker !== vertices) {
                    this.modificationMarker = vertices;
                    var vs = vb.stride * vertices;
                    if (!this.vbBuffer || this.vbBuffer.byteLength < vs) {
                        var bk = vb.stride;
                        while (bk < vs) {
                            bk *= 2;
                        }
                        this.vbBuffer = new ArrayBuffer(bk);
                        this.vbArray = new Float32Array(this.vbBuffer);
                        this.vbInts = new Uint32Array(this.vbBuffer);
                        vertexBuf.update(this.vbBuffer);
                    }
                    var arr = this.vbArray, ints = this.vbInts;
                    var sz = 0;
                    var textureId = 0;
                    var shiftU = this.offsetX;
                    var shiftV = this.offsetY;
                    for (var i = 0; i < points.length; i += pixi_tilemap.POINT_STRUCT_SIZE) {
                        var eps = 0.5;
                        if (this.compositeParent) {
                            if (boundCountPerBuffer > 1) {
                                textureId = (points[i + 9] >> 2);
                                shiftU = this.offsetX * (points[i + 9] & 1);
                                shiftV = this.offsetY * ((points[i + 9] >> 1) & 1);
                            }
                            else {
                                textureId = points[i + 9];
                                shiftU = 0;
                                shiftV = 0;
                            }
                        }
                        var x = points[i + 2], y = points[i + 3];
                        var w = points[i + 4], h = points[i + 5];
                        var u = points[i] + shiftU, v = points[i + 1] + shiftV;
                        var rotate = points[i + 6];
                        var animX = points[i + 7], animY = points[i + 8];
                        var animWidth = points[i + 10] || 1024, animHeight = points[i + 11] || 1024;
                        var animXEncoded = animX + (animWidth * 2048);
                        var animYEncoded = animY + (animHeight * 2048);
                        var u0 = void 0, v0 = void 0, u1 = void 0, v1 = void 0, u2 = void 0, v2 = void 0, u3 = void 0, v3 = void 0;
                        if (rotate === 0) {
                            u0 = u;
                            v0 = v;
                            u1 = u + w;
                            v1 = v;
                            u2 = u + w;
                            v2 = v + h;
                            u3 = u;
                            v3 = v + h;
                        }
                        else {
                            var w2 = w / 2;
                            var h2 = h / 2;
                            if (rotate % 4 !== 0) {
                                w2 = h / 2;
                                h2 = w / 2;
                            }
                            var cX = u + w2;
                            var cY = v + h2;
                            rotate = groupD8.add(rotate, groupD8.NW);
                            u0 = cX + (w2 * groupD8.uX(rotate));
                            v0 = cY + (h2 * groupD8.uY(rotate));
                            rotate = groupD8.add(rotate, 2);
                            u1 = cX + (w2 * groupD8.uX(rotate));
                            v1 = cY + (h2 * groupD8.uY(rotate));
                            rotate = groupD8.add(rotate, 2);
                            u2 = cX + (w2 * groupD8.uX(rotate));
                            v2 = cY + (h2 * groupD8.uY(rotate));
                            rotate = groupD8.add(rotate, 2);
                            u3 = cX + (w2 * groupD8.uX(rotate));
                            v3 = cY + (h2 * groupD8.uY(rotate));
                        }
                        arr[sz++] = x;
                        arr[sz++] = y;
                        arr[sz++] = u0;
                        arr[sz++] = v0;
                        arr[sz++] = u + eps;
                        arr[sz++] = v + eps;
                        arr[sz++] = u + w - eps;
                        arr[sz++] = v + h - eps;
                        arr[sz++] = animXEncoded;
                        arr[sz++] = animYEncoded;
                        arr[sz++] = textureId;
                        arr[sz++] = x + w;
                        arr[sz++] = y;
                        arr[sz++] = u1;
                        arr[sz++] = v1;
                        arr[sz++] = u + eps;
                        arr[sz++] = v + eps;
                        arr[sz++] = u + w - eps;
                        arr[sz++] = v + h - eps;
                        arr[sz++] = animXEncoded;
                        arr[sz++] = animYEncoded;
                        arr[sz++] = textureId;
                        arr[sz++] = x + w;
                        arr[sz++] = y + h;
                        arr[sz++] = u2;
                        arr[sz++] = v2;
                        arr[sz++] = u + eps;
                        arr[sz++] = v + eps;
                        arr[sz++] = u + w - eps;
                        arr[sz++] = v + h - eps;
                        arr[sz++] = animXEncoded;
                        arr[sz++] = animYEncoded;
                        arr[sz++] = textureId;
                        arr[sz++] = x;
                        arr[sz++] = y + h;
                        arr[sz++] = u3;
                        arr[sz++] = v3;
                        arr[sz++] = u + eps;
                        arr[sz++] = v + eps;
                        arr[sz++] = u + w - eps;
                        arr[sz++] = v + h - eps;
                        arr[sz++] = animXEncoded;
                        arr[sz++] = animYEncoded;
                        arr[sz++] = textureId;
                    }
                    vertexBuf.update(arr);
                }
                renderer.geometry.bind(vb, shader);
                renderer.geometry.draw(PIXI.DRAW_MODES.TRIANGLES, rectsCount * 6, 0);
            };
            RectTileLayer.prototype.isModified = function (anim) {
                if (this.modificationMarker !== this.pointsBuf.length ||
                    anim && this.hasAnim) {
                    return true;
                }
                return false;
            };
            RectTileLayer.prototype.clearModify = function () {
                this.modificationMarker = this.pointsBuf.length;
            };
            RectTileLayer.prototype.destroy = function (options) {
                _super.prototype.destroy.call(this, options);
                this.destroyVb();
            };
            return RectTileLayer;
        }(PIXI.Container));
        pixi_tilemap.RectTileLayer = RectTileLayer;
    })(pixi_tilemap || (pixi_tilemap = {}));
    var pixi_tilemap;
    (function (pixi_tilemap) {
        var rectShaderFrag = "\nvarying vec2 vTextureCoord;\nvarying vec4 vFrame;\nvarying float vTextureId;\nuniform vec4 shadowColor;\nuniform sampler2D uSamplers[%count%];\nuniform vec2 uSamplerSize[%count%];\n\nvoid main(void){\n   vec2 textureCoord = clamp(vTextureCoord, vFrame.xy, vFrame.zw);\n   float textureId = floor(vTextureId + 0.5);\n\n   vec4 color;\n   %forloop%\n   gl_FragColor = color;\n}\n";
        var rectShaderVert = "\nattribute vec2 aVertexPosition;\nattribute vec2 aTextureCoord;\nattribute vec4 aFrame;\nattribute vec2 aAnim;\nattribute float aTextureId;\n\nuniform mat3 projTransMatrix;\nuniform vec2 animationFrame;\n\nvarying vec2 vTextureCoord;\nvarying float vTextureId;\nvarying vec4 vFrame;\n\nvoid main(void){\n   gl_Position = vec4((projTransMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);\n   vec2 animCount = floor((aAnim + 0.5) / 2048.0);\n   vec2 animFrameOffset = aAnim - animCount * 2048.0;\n   vec2 animOffset = animFrameOffset * floor(mod(animationFrame + 0.5, animCount));\n\n   vTextureCoord = aTextureCoord + animOffset;\n   vFrame = aFrame + vec4(animOffset, animOffset);\n   vTextureId = aTextureId;\n}\n";
        var TilemapShader = (function (_super) {
            __extends(TilemapShader, _super);
            function TilemapShader(maxTextures, shaderVert, shaderFrag) {
                var _this = _super.call(this, new PIXI.Program(shaderVert, shaderFrag), {
                    animationFrame: new Float32Array(2),
                    uSamplers: [],
                    uSamplerSize: [],
                    projTransMatrix: new PIXI.Matrix()
                }) || this;
                _this.maxTextures = 0;
                _this.maxTextures = maxTextures;
                pixi_tilemap.shaderGenerator.fillSamplers(_this, _this.maxTextures);
                return _this;
            }
            return TilemapShader;
        }(PIXI.Shader));
        pixi_tilemap.TilemapShader = TilemapShader;
        var RectTileShader = (function (_super) {
            __extends(RectTileShader, _super);
            function RectTileShader(maxTextures) {
                var _this = _super.call(this, maxTextures, rectShaderVert, pixi_tilemap.shaderGenerator.generateFragmentSrc(maxTextures, rectShaderFrag)) || this;
                pixi_tilemap.shaderGenerator.fillSamplers(_this, _this.maxTextures);
                return _this;
            }
            return RectTileShader;
        }(TilemapShader));
        pixi_tilemap.RectTileShader = RectTileShader;
        var RectTileGeom = (function (_super) {
            __extends(RectTileGeom, _super);
            function RectTileGeom() {
                var _this = _super.call(this) || this;
                _this.vertSize = 11;
                _this.vertPerQuad = 4;
                _this.stride = _this.vertSize * 4;
                _this.lastTimeAccess = 0;
                var buf = _this.buf = new PIXI.Buffer(new Float32Array(2), true, false);
                _this.addAttribute('aVertexPosition', buf, 0, false, 0, _this.stride, 0)
                    .addAttribute('aTextureCoord', buf, 0, false, 0, _this.stride, 2 * 4)
                    .addAttribute('aFrame', buf, 0, false, 0, _this.stride, 4 * 4)
                    .addAttribute('aAnim', buf, 0, false, 0, _this.stride, 8 * 4)
                    .addAttribute('aTextureId', buf, 0, false, 0, _this.stride, 10 * 4);
                return _this;
            }
            return RectTileGeom;
        }(PIXI.Geometry));
        pixi_tilemap.RectTileGeom = RectTileGeom;
    })(pixi_tilemap || (pixi_tilemap = {}));
    var pixi_tilemap;
    (function (pixi_tilemap) {
        var TileRenderer = (function (_super) {
            __extends(TileRenderer, _super);
            function TileRenderer(renderer) {
                var _this = _super.call(this, renderer) || this;
                _this.sn = -1;
                _this.indexBuffer = null;
                _this.ibLen = 0;
                _this.tileAnim = [0, 0];
                _this.texLoc = [];
                _this.texResources = [];
                _this.rectShader = new pixi_tilemap.RectTileShader(pixi_tilemap.Constant.maxTextures);
                _this.indexBuffer = new PIXI.Buffer(undefined, true, true);
                _this.checkIndexBuffer(2000);
                _this.initBounds();
                return _this;
            }
            TileRenderer.prototype.initBounds = function () {
                if (pixi_tilemap.Constant.boundCountPerBuffer <= 1) {
                    return;
                }
                var maxTextures = pixi_tilemap.Constant.maxTextures;
                for (var i = 0; i < maxTextures; i++) {
                    var resource = new pixi_tilemap.MultiTextureResource(pixi_tilemap.Constant);
                    var baseTex = new PIXI.BaseTexture(resource);
                    baseTex.scaleMode = pixi_tilemap.Constant.SCALE_MODE;
                    baseTex.wrapMode = PIXI.WRAP_MODES.CLAMP;
                    this.texResources.push(resource);
                }
            };
            TileRenderer.prototype.bindTexturesWithoutRT = function (renderer, shader, textures) {
                var samplerSize = shader.uniforms.uSamplerSize;
                this.texLoc.length = 0;
                for (var i = 0; i < textures.length; i++) {
                    var texture = textures[i];
                    if (!texture || !texture.valid) {
                        return;
                    }
                    renderer.texture.bind(textures[i], i);
                    samplerSize[i * 2] = 1.0 / textures[i].baseTexture.width;
                    samplerSize[i * 2 + 1] = 1.0 / textures[i].baseTexture.height;
                }
                shader.uniforms.uSamplerSize = samplerSize;
            };
            TileRenderer.prototype.bindTextures = function (renderer, shader, textures) {
                var len = textures.length;
                var maxTextures = pixi_tilemap.Constant.maxTextures;
                if (len > pixi_tilemap.Constant.boundCountPerBuffer * maxTextures) {
                    return;
                }
                if (pixi_tilemap.Constant.boundCountPerBuffer <= 1) {
                    this.bindTexturesWithoutRT(renderer, shader, textures);
                    return;
                }
                var i = 0;
                for (; i < len; i++) {
                    var texture = textures[i];
                    if (!texture || !texture.valid)
                        continue;
                    var multi = this.texResources[i >> 2];
                    multi.setTexture(i & 3, texture);
                }
                var gltsUsed = (i + 3) >> 2;
                for (i = 0; i < gltsUsed; i++) {
                    renderer.texture.bind(this.texResources[i].baseTex, i);
                }
            };
            TileRenderer.prototype.start = function () {
            };
            TileRenderer.prototype.createVb = function () {
                var geom = new pixi_tilemap.RectTileGeom();
                geom.addIndex(this.indexBuffer);
                geom.lastTimeAccess = Date.now();
                return geom;
            };
            TileRenderer.prototype.checkIndexBuffer = function (size, vb) {
                var totalIndices = size * 6;
                if (totalIndices <= this.ibLen) {
                    return;
                }
                this.ibLen = totalIndices;
                this.indexBuffer.update(PIXI.utils.createIndicesForQuads(size, pixi_tilemap.Constant.use32bitIndex ? new Uint32Array(size * 6) : undefined));
            };
            TileRenderer.prototype.getShader = function () {
                return this.rectShader;
            };
            TileRenderer.prototype.destroy = function () {
                _super.prototype.destroy.call(this);
                this.rectShader = null;
            };
            return TileRenderer;
        }(PIXI.ObjectRenderer));
        pixi_tilemap.TileRenderer = TileRenderer;
        PIXI.Renderer.registerPlugin('tilemap', TileRenderer);
    })(pixi_tilemap || (pixi_tilemap = {}));
    var pixi_tilemap;
    (function (pixi_tilemap) {
        var ZLayer = (function (_super) {
            __extends(ZLayer, _super);
            function ZLayer(tilemap, zIndex) {
                var _this = _super.call(this) || this;
                _this._lastAnimationFrame = -1;
                _this.tilemap = tilemap;
                _this.z = zIndex;
                return _this;
            }
            ZLayer.prototype.clear = function () {
                var layers = this.children;
                for (var i = 0; i < layers.length; i++)
                    layers[i].clear();
                this._previousLayers = 0;
            };
            ZLayer.prototype.cacheIfDirty = function () {
                var tilemap = this.tilemap;
                var layers = this.children;
                var modified = this._previousLayers !== layers.length;
                this._previousLayers = layers.length;
                var buf = this.canvasBuffer;
                var tempRender = this._tempRender;
                if (!buf) {
                    buf = this.canvasBuffer = document.createElement('canvas');
                    tempRender = this._tempRender = new PIXI.CanvasRenderer(100, 100, { view: buf });
                    tempRender.context = tempRender.rootContext;
                    tempRender.plugins.tilemap.dontUseTransform = true;
                }
                if (buf.width !== tilemap._layerWidth ||
                    buf.height !== tilemap._layerHeight) {
                    buf.width = tilemap._layerWidth;
                    buf.height = tilemap._layerHeight;
                    modified = true;
                }
                var i;
                if (!modified) {
                    for (i = 0; i < layers.length; i++) {
                        if (layers[i].isModified(this._lastAnimationFrame !== tilemap.animationFrame)) {
                            modified = true;
                            break;
                        }
                    }
                }
                this._lastAnimationFrame = tilemap.animationFrame;
                if (modified) {
                    if (tilemap._hackRenderer) {
                        tilemap._hackRenderer(tempRender);
                    }
                    tempRender.context.clearRect(0, 0, buf.width, buf.height);
                    for (i = 0; i < layers.length; i++) {
                        layers[i].clearModify();
                        layers[i].renderCanvas(tempRender);
                    }
                }
                this.layerTransform = this.worldTransform;
                for (i = 0; i < layers.length; i++) {
                    this.layerTransform = layers[i].worldTransform;
                    break;
                }
            };
            ZLayer.prototype.renderCanvas = function (renderer) {
                this.cacheIfDirty();
                var wt = this.layerTransform;
                renderer.context.setTransform(wt.a, wt.b, wt.c, wt.d, wt.tx * renderer.resolution, wt.ty * renderer.resolution);
                var tilemap = this.tilemap;
                renderer.context.drawImage(this.canvasBuffer, 0, 0);
            };
            return ZLayer;
        }(PIXI.Container));
        pixi_tilemap.ZLayer = ZLayer;
    })(pixi_tilemap || (pixi_tilemap = {}));
    var pixi_tilemap;
    (function (pixi_tilemap) {
        PIXI.tilemap = pixi_tilemap;
    })(pixi_tilemap || (pixi_tilemap = {}));
    var pixi_tilemap;
    (function (pixi_tilemap) {
        var shaderGenerator;
        (function (shaderGenerator) {
            function fillSamplers(shader, maxTextures) {
                var sampleValues = [];
                for (var i = 0; i < maxTextures; i++) {
                    sampleValues[i] = i;
                }
                shader.uniforms.uSamplers = sampleValues;
                var samplerSize = [];
                for (var i = 0; i < maxTextures; i++) {
                    samplerSize.push(1.0 / pixi_tilemap.Constant.bufferSize);
                    samplerSize.push(1.0 / pixi_tilemap.Constant.bufferSize);
                }
                shader.uniforms.uSamplerSize = samplerSize;
            }
            shaderGenerator.fillSamplers = fillSamplers;
            function generateFragmentSrc(maxTextures, fragmentSrc) {
                return fragmentSrc.replace(/%count%/gi, maxTextures + "")
                    .replace(/%forloop%/gi, this.generateSampleSrc(maxTextures));
            }
            shaderGenerator.generateFragmentSrc = generateFragmentSrc;
            function generateSampleSrc(maxTextures) {
                var src = '';
                src += '\n';
                src += '\n';
                src += 'if(vTextureId <= -1.0) {';
                src += '\n\tcolor = shadowColor;';
                src += '\n}';
                for (var i = 0; i < maxTextures; i++) {
                    src += '\nelse ';
                    if (i < maxTextures - 1) {
                        src += 'if(textureId == ' + i + '.0)';
                    }
                    src += '\n{';
                    src += '\n\tcolor = texture2D(uSamplers[' + i + '], textureCoord * uSamplerSize[' + i + ']);';
                    src += '\n}';
                }
                src += '\n';
                src += '\n';
                return src;
            }
            shaderGenerator.generateSampleSrc = generateSampleSrc;
        })(shaderGenerator = pixi_tilemap.shaderGenerator || (pixi_tilemap.shaderGenerator = {}));
    })(pixi_tilemap || (pixi_tilemap = {}));

})));
