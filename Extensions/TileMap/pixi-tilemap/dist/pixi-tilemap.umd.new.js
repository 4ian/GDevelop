/* eslint-disable */
 
/*!
 * @pixi/tilemap - v3.2.0
 * Compiled Sat, 24 Apr 2021 21:20:23 UTC
 *
 * @pixi/tilemap is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 * 
 * Copyright 2019-2020, Ivan Popelyshev, All Rights Reserved
 */
this.PIXI = this.PIXI || {};
this.PIXI.tilemap = this.PIXI.tilemap || {};
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@pixi/display'), require('@pixi/core'), require('@pixi/constants'), require('@pixi/math'), require('@pixi/utils')) :
    typeof define === 'function' && define.amd ? define(['exports', '@pixi/display', '@pixi/core', '@pixi/constants', '@pixi/math', '@pixi/utils'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global._pixi_tilemap = {}, global.PIXI, global.PIXI, global.PIXI, global.PIXI, global.PIXI.utils));
}(this, (function (exports, display, core, constants, math, utils) { 'use strict';

    /**
     * The renderer plugin for canvas. It isn't registered by default.
     *
     * ```
     * import { CanvasTileRenderer } from '@pixi/tilemap';
     * import { CanvasRenderer } from '@pixi/canvas-core';
     *
     * // You must register this yourself (optional). @pixi/tilemap doesn't do it to
     * // prevent a hard dependency on @pixi/canvas-core.
     * CanvasRenderer.registerPlugin('tilemap', CanvasTileRenderer);
     * ```
     */
    // TODO: Move to @pixi/tilemap-canvas
    class CanvasTileRenderer
    {
        /** The renderer */
        

        /** The global tile animation state */
        __init() {this.tileAnim = [0, 0];}

        /** @deprecated */
        __init2() {this.dontUseTransform = false;}

        /** @param renderer */
        constructor(renderer)
        {;CanvasTileRenderer.prototype.__init.call(this);CanvasTileRenderer.prototype.__init2.call(this);
            this.renderer = renderer;
            this.tileAnim = [0, 0];
        }
    }

    /**
     * These are additional @pixi/tilemap options.
     *
     * This settings should not be changed after the renderer has initialized; otherwise, the behavior
     * is undefined.
     */
    const settings = {
        /** The default number of textures per tilemap in a tilemap composite. */
        TEXTURES_PER_TILEMAP: 16,

        /**
         * The width/height of each texture tile in a {@link TEXTILE_DIMEN}. This is 1024px by default.
         *
         * This should fit all tile base-textures; otherwise, {@link TextileResource} may fail to correctly
         * upload the textures togther in a tiled fashion.
         */
        TEXTILE_DIMEN: 1024,

        /**
         * The number of texture tiles per {@link TextileResource}.
         *
         * Texture tiling is disabled by default, and so this is set to `1` by default. If it is set to a
         * higher value, textures will be uploaded together in a tiled fashion.
         *
         * Since {@link TextileResource} is a dual-column format, this should be even for packing
         * efficiency. The optimal value is usually 4.
         */
        TEXTILE_UNITS: 1,

        /** The scaling mode of the combined texture tiling. */
        TEXTILE_SCALE_MODE: constants.SCALE_MODES.LINEAR,

        /** This will enable 32-bit index buffers. It's useful when you have more than 16K tiles. */
        use32bitIndex: false,

        /** Flags whether textiles should be cleared when each tile is uploaded. */
        DO_CLEAR: true,

        // Backward compatibility
        get maxTextures() { return this.MAX_TEXTURES; },
        set maxTextures(value) { this.MAX_TEXTURES = value; },

        get boundSize() { return this.TEXTURE_TILE_DIMEN; },
        set boundSize(value) { this.TILE_TEXTURE_DIMEN = value; },

        get boundCountPerBuffer() { return this.TEXTILE_UNITS; },
        set boundCountPerBuffer(value) { this.TEXTILE_UNITS = value; },
    };

    // @deprecated
    const Constant = settings;

    function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } }





    var POINT_STRUCT; (function (POINT_STRUCT) {
        const U = 0; POINT_STRUCT[POINT_STRUCT["U"] = U] = "U";
        const V = U + 1; POINT_STRUCT[POINT_STRUCT["V"] = V] = "V";
        const X = V + 1; POINT_STRUCT[POINT_STRUCT["X"] = X] = "X";
        const Y = X + 1; POINT_STRUCT[POINT_STRUCT["Y"] = Y] = "Y";
        const TILE_WIDTH = Y + 1; POINT_STRUCT[POINT_STRUCT["TILE_WIDTH"] = TILE_WIDTH] = "TILE_WIDTH";
        const TILE_HEIGHT = TILE_WIDTH + 1; POINT_STRUCT[POINT_STRUCT["TILE_HEIGHT"] = TILE_HEIGHT] = "TILE_HEIGHT";
        const ROTATE = TILE_HEIGHT + 1; POINT_STRUCT[POINT_STRUCT["ROTATE"] = ROTATE] = "ROTATE";
        const ANIM_X = ROTATE + 1; POINT_STRUCT[POINT_STRUCT["ANIM_X"] = ANIM_X] = "ANIM_X";
        const ANIM_Y = ANIM_X + 1; POINT_STRUCT[POINT_STRUCT["ANIM_Y"] = ANIM_Y] = "ANIM_Y";
        const TEXTURE_INDEX = ANIM_Y + 1; POINT_STRUCT[POINT_STRUCT["TEXTURE_INDEX"] = TEXTURE_INDEX] = "TEXTURE_INDEX";
        const ANIM_COUNT_X = TEXTURE_INDEX + 1; POINT_STRUCT[POINT_STRUCT["ANIM_COUNT_X"] = ANIM_COUNT_X] = "ANIM_COUNT_X";
        const ANIM_COUNT_Y = ANIM_COUNT_X + 1; POINT_STRUCT[POINT_STRUCT["ANIM_COUNT_Y"] = ANIM_COUNT_Y] = "ANIM_COUNT_Y";
        const ANIM_DIVISOR = ANIM_COUNT_Y + 1; POINT_STRUCT[POINT_STRUCT["ANIM_DIVISOR"] = ANIM_DIVISOR] = "ANIM_DIVISOR";
        const ALPHA = ANIM_DIVISOR + 1; POINT_STRUCT[POINT_STRUCT["ALPHA"] = ALPHA] = "ALPHA";
    })(POINT_STRUCT || (POINT_STRUCT = {}));

    const POINT_STRUCT_SIZE = (Object.keys(POINT_STRUCT).length / 2);

    /**
     * A rectangular tilemap implementation that renders a predefined set of tile textures.
     *
     * The {@link Tilemap.tileset tileset} of a tilemap defines the list of base-textures that can be painted in the
     * tilemap. A texture is identified using its base-texture's index into the this list, i.e. changing the base-texture
     * at a given index in the tileset modifies the paint of all tiles pointing to that index.
     *
     * The size of the tileset is limited by the texture units supported by the client device. The minimum supported
     * value is 8, as defined by the WebGL 1 specification. `gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS`) can be used
     * to extract this limit. {@link CompositeTilemap} can be used to get around this limit by layering multiple tilemap
     * instances.
     *
     * @example
     * import { Tilemap } from '@pixi/tilemap';
     * import { Loader } from '@pixi/loaders';
     *
     * // Add the spritesheet into your loader!
     * Loader.shared.add('atlas', 'assets/atlas.json');
     *
     * // Make the tilemap once the tileset assets are available.
     * Loader.shared.load(function onTilesetLoaded()
     * {
     *      // The base-texture is shared between all the tile textures.
     *      const tilemap = new Tilemap([Texture.from('grass.png').baseTexture])
     *          .tile('grass.png', 0, 0)
     *          .tile('grass.png', 100, 100)
     *          .tile('brick_wall.png', 0, 100);
     * });
     */
    class Tilemap extends display.Container
    {
        __init() {this.shadowColor = new Float32Array([0.0, 0.0, 0.0, 0.5]);}
        __init2() {this._globalMat = null;}

        /**
         * The tile animation frame.
         *
         * @see CompositeTilemap.tileAnim
         */
         __init3() {this.tileAnim = null;}

        /**
         * This is the last uploaded size of the tilemap geometry.
         * @ignore
         */
        __init4() {this.modificationMarker = 0;}

        /** @ignore */
        __init5() {this.offsetX = 0;}

        /** @ignore */
        __init6() {this.offsetY = 0;}

        /** @ignore */
        __init7() {this.compositeParent = false;}

        /**
         * The list of base-textures being used in the tilemap.
         *
         * This should not be shuffled after tiles have been added into this tilemap. Usually, only tile textures
         * should be added after tiles have been added into the map.
         */
        

        /**
         * The local bounds of the tilemap itself. This does not include DisplayObject children.
         */
          __init8() {this.tilemapBounds = new display.Bounds();}

        /** Flags whether any animated tile was added. */
         __init9() {this.hasAnimatedTile = false;}

        /** The interleaved geometry of the tilemap. */
         __init10() {this.pointsBuf = [];}

        /**
         * @param tileset - The tileset to use for the tilemap. This can be reset later with {@link Tilemap.setTileset}. The
         *      base-textures in this array must not be duplicated.
         */
        constructor(tileset)
        {
            super();Tilemap.prototype.__init.call(this);Tilemap.prototype.__init2.call(this);Tilemap.prototype.__init3.call(this);Tilemap.prototype.__init4.call(this);Tilemap.prototype.__init5.call(this);Tilemap.prototype.__init6.call(this);Tilemap.prototype.__init7.call(this);Tilemap.prototype.__init8.call(this);Tilemap.prototype.__init9.call(this);Tilemap.prototype.__init10.call(this);Tilemap.prototype.__init11.call(this);Tilemap.prototype.__init12.call(this);Tilemap.prototype.__init13.call(this);Tilemap.prototype.__init14.call(this);Tilemap.prototype.__init15.call(this);Tilemap.prototype.__init16.call(this);;
            this.setTileset(tileset);
        }

        /**
         * @returns The tileset of this tilemap.
         */
        getTileset()
        {
            return this.tileset;
        }

        /**
         * Define the tileset used by the tilemap.
         *
         * @param tileset - The list of textures to use in the tilemap. If a base-texture (not array) is passed, it will
         *  be wrapped into an array. This should not contain any duplicates.
         */
        setTileset(tileset = [])
        {
            if (!Array.isArray(tileset))
            {
                tileset = [tileset];
            }
            for (let i = 0; i < tileset.length; i++)
            {
                if ((tileset[i] ).baseTexture)
                {
                    tileset[i] = (tileset[i] ).baseTexture;
                }
            }

            this.tileset = tileset;

            return this;
        }

        /**  Clears all the tiles added into this tilemap. */
        clear()
        {
            this.pointsBuf.length = 0;
            this.modificationMarker = 0;
            this.tilemapBounds.clear();
            this.hasAnimatedTile = false;

            return this;
        }

        /**
         * Adds a tile that paints the given texture at (x, y).
         *
         * @param tileTexture - The tiling texture to render.
         * @param x - The local x-coordinate of the tile's position.
         * @param y - The local y-coordinate of the tile's position.
         * @param options - Additional tile options.
         * @param [options.u=texture.frame.x] - The x-coordinate of the texture in its base-texture's space.
         * @param [options.v=texture.frame.y] - The y-coordinate of the texture in its base-texture's space.
         * @param [options.tileWidth=texture.orig.width] - The local width of the tile.
         * @param [options.tileHeight=texture.orig.height] - The local height of the tile.
         * @param [options.animX=0] - For animated tiles, this is the "offset" along the x-axis for adjacent
         *      animation frame textures in the base-texture.
         * @param [options.animY=0] - For animated tiles, this is the "offset" along the y-axis for adjacent
         *      animation frames textures in the base-texture.
         * @param [options.rotate=0]
         * @param [options.animCountX=1024] - For animated tiles, this is the number of animation frame textures
         *      per row.
         * @param [options.animCountY=1024] - For animated tiles, this is the number of animation frame textures
         *      per column.
         * @param [options.animDivisor=1] - For animated tiles, this is the animation duration of each frame
         * @param [options.alpha=1] - Tile alpha
         * @return This tilemap, good for chaining.
         */
        tile(
            tileTexture,
            x,
            y,
            options











     = {}
        )
        {
            let baseTexture;
            let textureIndex = -1;

            if (typeof tileTexture === 'number')
            {
                textureIndex = tileTexture;
                baseTexture = this.tileset[textureIndex];
            }
            else
            {
                let texture;

                if (typeof tileTexture === 'string')
                {
                    texture = core.Texture.from(tileTexture);
                }
                else
                {
                    texture = tileTexture;
                }

                const textureList = this.tileset;

                for (let i = 0; i < textureList.length; i++)
                {
                    if (textureList[i] === texture.castToBaseTexture())
                    {
                        textureIndex = i;
                        break;
                    }
                }

                if ('baseTexture' in texture)
                {
                    options.u = _nullishCoalesce(options.u, () => ( texture.frame.x));
                    options.v = _nullishCoalesce(options.v, () => ( texture.frame.y));
                    options.tileWidth = _nullishCoalesce(options.tileWidth, () => ( texture.orig.width));
                    options.tileHeight = _nullishCoalesce(options.tileHeight, () => ( texture.orig.height));
                }

                baseTexture = texture.castToBaseTexture();
            }

            if (!baseTexture || textureIndex < 0)
            {
                console.error('The tile texture was not found in the tilemap tileset.');

                return this;
            }

            const {
                u = 0,
                v = 0,
                tileWidth = baseTexture.realWidth,
                tileHeight = baseTexture.realHeight,
                animX = 0,
                animY = 0,
                rotate = 0,
                animCountX = 1024,
                animCountY = 1024,
                animDivisor = 1,
                alpha = 1,
            } = options;

            const pb = this.pointsBuf;

            this.hasAnimatedTile = this.hasAnimatedTile || animX > 0 || animY > 0;

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
            pb.push(animDivisor);
            pb.push(alpha);

            this.tilemapBounds.addFramePad(x, y, x + tileWidth, y + tileHeight, 0, 0);

            return this;
        }

        /** Changes the rotation of the last tile. */
        tileRotate(rotate)
        {
            const pb = this.pointsBuf;

            pb[pb.length - (POINT_STRUCT_SIZE - POINT_STRUCT.TEXTURE_INDEX)] = rotate;
        }

        /** Changes the `animX`, `animCountX` of the last tile. */
        tileAnimX(offset, count)
        {
            const pb = this.pointsBuf;

            pb[pb.length - (POINT_STRUCT_SIZE - POINT_STRUCT.ANIM_X)] = offset;
            pb[pb.length - (POINT_STRUCT_SIZE - POINT_STRUCT.ANIM_COUNT_X)] = count;
            // pb[pb.length - (POINT_STRUCT_SIZE - POINT_STRUCT.ANIM_DIVISOR)] = duration;
        }

        /** Changes the `animY`, `animCountY` of the last tile. */
        tileAnimY(offset, count)
        {
            const pb = this.pointsBuf;

            pb[pb.length - (POINT_STRUCT_SIZE - POINT_STRUCT.ANIM_Y)] = offset;
            pb[pb.length - (POINT_STRUCT_SIZE - POINT_STRUCT.ANIM_COUNT_Y)] = count;
        }

        /** Changes the `animDivisor` value of the last tile. */
        tileAnimDivisor(divisor)
        {
            const pb = this.pointsBuf;

            pb[pb.length - (POINT_STRUCT_SIZE - POINT_STRUCT.ANIM_DIVISOR)] = divisor;
        }

        tileAlpha(alpha)
        {
            const pb = this.pointsBuf;

            pb[pb.length - (POINT_STRUCT_SIZE - POINT_STRUCT.ALPHA)] = alpha;
        }

        __init11() {this.renderCanvas = (renderer) =>
        {
            const plugin = renderer.plugins.tilemap;

            if (plugin && !plugin.dontUseTransform)
            {
                const wt = this.worldTransform;

                renderer.context.setTransform(
                    wt.a,
                    wt.b,
                    wt.c,
                    wt.d,
                    wt.tx * renderer.resolution,
                    wt.ty * renderer.resolution
                );
            }

            this.renderCanvasCore(renderer);
        };}

        renderCanvasCore(renderer)
        {
            if (this.tileset.length === 0) return;
            const points = this.pointsBuf;
            const tileAnim = this.tileAnim || (renderer.plugins.tilemap && renderer.plugins.tilemap.tileAnim);

            renderer.context.fillStyle = '#000000';
            for (let i = 0, n = points.length; i < n; i += POINT_STRUCT_SIZE)
            {
                let x1 = points[i + POINT_STRUCT.U] * tileAnim[0];
                let y1 = points[i + POINT_STRUCT.V] * tileAnim[1];
                const x2 = points[i + POINT_STRUCT.X];
                const y2 = points[i + POINT_STRUCT.Y];
                const w = points[i + POINT_STRUCT.TILE_WIDTH];
                const h = points[i + POINT_STRUCT.TILE_HEIGHT];

                x1 += points[i + POINT_STRUCT.ANIM_X] * renderer.plugins.tilemap.tileAnim[0];
                y1 += points[i + POINT_STRUCT.ANIM_Y] * renderer.plugins.tilemap.tileAnim[1];

                const textureIndex = points[i + POINT_STRUCT.TEXTURE_INDEX];
                const alpha = points[i + POINT_STRUCT.ALPHA];

                // canvas does not work with rotate yet

                if (textureIndex >= 0 && this.tileset[textureIndex])
                {
                    renderer.context.globalAlpha = alpha;
                    renderer.context.drawImage(
                        (this.tileset[textureIndex] ).getDrawableSource(),
                        x1, y1, w, h, x2, y2, w, h
                    );
                }
                else
                {
                    renderer.context.globalAlpha = 0.5;
                    renderer.context.fillRect(x2, y2, w, h);
                }
                renderer.context.globalAlpha = 1;
            }
        }

         __init12() {this.vbId = 0;}
         __init13() {this.vb = null;}
         __init14() {this.vbBuffer = null;}
         __init15() {this.vbArray = null;}
         __init16() {this.vbInts = null;}

         destroyVb()
        {
            if (this.vb)
            {
                this.vb.destroy();
                this.vb = null;
            }
        }

        render(renderer)
        {
            const plugin = (renderer.plugins ).tilemap;
            const shader = plugin.getShader();

            renderer.batch.setObjectRenderer(plugin);
            this._globalMat = shader.uniforms.projTransMatrix;
            renderer
                .globalUniforms
                .uniforms
                .projectionMatrix
                .copyTo(this._globalMat)
                .append(this.worldTransform);

            shader.uniforms.shadowColor = this.shadowColor;
            shader.uniforms.animationFrame = this.tileAnim || plugin.tileAnim;

            this.renderWebGLCore(renderer, plugin);
        }

        renderWebGLCore(renderer, plugin)
        {
            const points = this.pointsBuf;

            if (points.length === 0) return;
            const rectsCount = points.length / POINT_STRUCT_SIZE;

            const shader = plugin.getShader();
            const textures = this.tileset;

            if (textures.length === 0) return;

            plugin.bindTileTextures(renderer, textures);
            renderer.shader.bind(shader, false);

            // lost context! recover!
            let vb = this.vb;

            if (!vb)
            {
                vb = plugin.createVb();
                this.vb = vb;
                this.vbId = (vb ).id;
                this.vbBuffer = null;
                this.modificationMarker = 0;
            }

            plugin.checkIndexBuffer(rectsCount, vb);
            const boundCountPerBuffer = settings.TEXTILE_UNITS;

            const vertexBuf = vb.getBuffer('aVertexPosition');
            // if layer was changed, re-upload vertices
            const vertices = rectsCount * vb.vertPerQuad;

            if (vertices === 0) return;
            if (this.modificationMarker !== vertices)
            {
                this.modificationMarker = vertices;
                const vs = vb.stride * vertices;

                if (!this.vbBuffer || this.vbBuffer.byteLength < vs)
                {
                    // !@#$ happens, need resize
                    let bk = vb.stride;

                    while (bk < vs)
                    {
                        bk *= 2;
                    }
                    this.vbBuffer = new ArrayBuffer(bk);
                    this.vbArray = new Float32Array(this.vbBuffer);
                    this.vbInts = new Uint32Array(this.vbBuffer);
                    vertexBuf.update(this.vbBuffer);
                }

                const arr = this.vbArray;
                // const ints = this.vbInts;
                // upload vertices!
                let sz = 0;
                // let tint = 0xffffffff;
                let textureId = 0;
                let shiftU = this.offsetX;
                let shiftV = this.offsetY;

                // let tint = 0xffffffff;
                // const tint = -1;

                for (let i = 0; i < points.length; i += POINT_STRUCT_SIZE)
                {
                    const eps = 0.5;

                    if (this.compositeParent)
                    {
                        const textureIndex = points[i + POINT_STRUCT.TEXTURE_INDEX];

                        if (boundCountPerBuffer > 1)
                        {
                            // TODO: what if its more than 4?
                            textureId = (textureIndex >> 2);
                            shiftU = this.offsetX * (textureIndex & 1);
                            shiftV = this.offsetY * ((textureIndex >> 1) & 1);
                        }
                        else
                        {
                            textureId = textureIndex;
                            shiftU = 0;
                            shiftV = 0;
                        }
                    }
                    const x = points[i + POINT_STRUCT.X];
                    const y = points[i + POINT_STRUCT.Y];
                    const w = points[i + POINT_STRUCT.TILE_WIDTH];
                    const h = points[i + POINT_STRUCT.TILE_HEIGHT];
                    const u = points[i + POINT_STRUCT.U] + shiftU;
                    const v = points[i + POINT_STRUCT.V] + shiftV;
                    let rotate = points[i + POINT_STRUCT.ROTATE];

                    const animX = points[i + POINT_STRUCT.ANIM_X];
                    const animY = points[i + POINT_STRUCT.ANIM_Y];
                    const animWidth = points[i + POINT_STRUCT.ANIM_COUNT_X] || 1024;
                    const animHeight = points[i + POINT_STRUCT.ANIM_COUNT_Y] || 1024;

                    const animXEncoded = animX + (animWidth * 2048);
                    const animYEncoded = animY + (animHeight * 2048);
                    const animDivisor = points[i + POINT_STRUCT.ANIM_DIVISOR];
                    const alpha = points[i + POINT_STRUCT.ALPHA];

                    let u0;
                    let v0; let u1;
                    let v1; let u2;
                    let v2; let u3;
                    let v3;

                    if (rotate === 0)
                    {
                        u0 = u;
                        v0 = v;
                        u1 = u + w;
                        v1 = v;
                        u2 = u + w;
                        v2 = v + h;
                        u3 = u;
                        v3 = v + h;
                    }
                    else
                    {
                        let w2 = w / 2;
                        let h2 = h / 2;

                        if (rotate % 4 !== 0)
                        {
                            w2 = h / 2;
                            h2 = w / 2;
                        }
                        const cX = u + w2;
                        const cY = v + h2;

                        rotate = math.groupD8.add(rotate, math.groupD8.NW);
                        u0 = cX + (w2 * math.groupD8.uX(rotate));
                        v0 = cY + (h2 * math.groupD8.uY(rotate));

                        rotate = math.groupD8.add(rotate, 2); // rotate 90 degrees clockwise
                        u1 = cX + (w2 * math.groupD8.uX(rotate));
                        v1 = cY + (h2 * math.groupD8.uY(rotate));

                        rotate = math.groupD8.add(rotate, 2);
                        u2 = cX + (w2 * math.groupD8.uX(rotate));
                        v2 = cY + (h2 * math.groupD8.uY(rotate));

                        rotate = math.groupD8.add(rotate, 2);
                        u3 = cX + (w2 * math.groupD8.uX(rotate));
                        v3 = cY + (h2 * math.groupD8.uY(rotate));
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
                    arr[sz++] = animDivisor;
                    arr[sz++] = alpha;

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
                    arr[sz++] = animDivisor;
                    arr[sz++] = alpha;

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
                    arr[sz++] = animDivisor;
                    arr[sz++] = alpha;

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
                    arr[sz++] = animDivisor;
                    arr[sz++] = alpha;
                }

                vertexBuf.update(arr);
            }

            (renderer.geometry ).bind(vb, shader);
            renderer.geometry.draw(constants.DRAW_MODES.TRIANGLES, rectsCount * 6, 0);
        }

        /**
         * @internal
         * @ignore
         */
        isModified(anim)
        {
            if (this.modificationMarker !== this.pointsBuf.length
                || (anim && this.hasAnimatedTile))
            {
                return true;
            }

            return false;
        }

        /**
         * This will pull forward the modification marker.
         *
         * @internal
         * @ignore
         */
        clearModify()
        {
            this.modificationMarker = this.pointsBuf.length;
        }

        /** @override */
         _calculateBounds()
        {
            const { minX, minY, maxX, maxY } = this.tilemapBounds;

            this._bounds.addFrame(this.transform, minX, minY, maxX, maxY);
        }

        /** @override */
         getLocalBounds(rect)
        {
            // we can do a fast local bounds if the sprite has no children!
            if (this.children.length === 0)
            {
                return this.tilemapBounds.getRectangle(rect);
            }

            return super.getLocalBounds.call(this, rect);
        }

        /** @override */
        destroy(options)
        {
            super.destroy(options);
            this.destroyVb();
        }

        /**
         * Deprecated signature for {@link Tilemap.tile tile}.
         *
         * @deprecated Since @pixi/tilemap 3.
         */
        addFrame(texture, x, y, animX, animY)
        {
            this.tile(
                texture,
                x,
                y,
                {
                    animX,
                    animY,
                }
            );

            return true;
        }

        /**
         * Deprecated signature for {@link Tilemap.tile tile}.
         *
         * @deprecated Since @pixi/tilemap 3.
         */
        // eslint-disable-next-line max-params
        addRect(
            textureIndex,
            u,
            v,
            x,
            y,
            tileWidth,
            tileHeight,
            animX = 0,
            animY = 0,
            rotate = 0,
            animCountX = 1024,
            animCountY = 1024,
            animDivisor = 1,
            alpha = 1,
        )
        {
            return this.tile(
                textureIndex,
                x, y,
                {
                    u, v, tileWidth, tileHeight, animX, animY, rotate, animCountX, animCountY, animDivisor, alpha
                }
            );
        }
    }

    /**
     * A tilemap composite that lazily builds tilesets layered into multiple tilemaps.
     *
     * The composite tileset is the concatenatation of the individual tilesets used in the tilemaps. You can
     * preinitialized it by passing a list of tile textures to the constructor. Otherwise, the composite tilemap
     * is lazily built as you add more tiles with newer tile textures. A new tilemap is created once the last
     * tilemap has reached its limit (as set by {@link CompositeTilemap.texturesPerTilemap texturesPerTilemap}).
     *
     * @example
     * import { Application } from '@pixi/app';
     * import { CompositeTilemap } from '@pixi/tilemap';
     * import { Loader } from '@pixi/loaders';
     *
     * // Setup view & stage.
     * const app = new Application();
     *
     * document.body.appendChild(app.renderer.view);
     * app.stage.interactive = true;
     *
     * // Global reference to the tilemap.
     * let globalTilemap: CompositeTilemap;
     *
     * // Load the tileset spritesheet!
     * Loader.shared.load('atlas.json');
     *
     * // Initialize the tilemap scene when the assets load.
     * Loader.shared.load(function onTilesetLoaded()
     * {
     *      const tilemap = new CompositeTilemap();
     *
     *      // Setup the game level with grass and dungeons!
     *      for (let x = 0; x < 10; x++)
     *      {
     *          for (let y = 0; y < 10; y++)
     *          {
     *              tilemap.tile(
     *                  x % 2 === 0 && (x === y || x + y === 10) ? 'dungeon.png' : 'grass.png',
     *                  x * 100,
     *                  y * 100,
     *              );
     *          }
     *      }
     *
     *      globalTilemap = app.stage.addChild(tilemap);
     * });
     *
     * // Show a bomb at a random location whenever the user clicks!
     * app.stage.on('click', function onClick()
     * {
     *      if (!globalTilemap) return;
     *
     *      const x = Math.floor(Math.random() * 10);
     *      const y = Math.floor(Math.random() * 10);
     *
     *      globalTilemap.tile('bomb.png', x * 100, y * 100);
     * });
     */
    class CompositeTilemap extends display.Container
    {
        /** The hard limit on the number of tile textures used in each tilemap. */
        

        /**
         * The animation frame vector.
         *
         * Animated tiles have four parameters - `animX`, `animY`, `animCountX`, `animCountY`. The textures
         * of adjacent animation frames are at offset `animX` or `animY` of each other, with `animCountX` per
         * row and `animCountY` per column.
         *
         * The animation frame vector specifies which animation frame texture to use. If the x/y coordinate is
         * larger than the `animCountX` or `animCountY` for a specific tile, the modulus is taken.
         */
         __init() {this.tileAnim = null;}

        /** The last modified tilemap. */
         __init2() {this.lastModifiedTilemap = null;}

         __init3() {this.modificationMarker = 0;}
         __init4() {this.shadowColor = new Float32Array([0.0, 0.0, 0.0, 0.5]);}
         __init5() {this._globalMat = null;}

        /**
         * @param tileset - A list of tile base-textures that will be used to eagerly initialized the layered
         *  tilemaps. This is only an performance optimization, and using {@link CompositeTilemap.tile tile}
         *  will work equivalently.
         */
        constructor(tileset)
        {
            super();CompositeTilemap.prototype.__init.call(this);CompositeTilemap.prototype.__init2.call(this);CompositeTilemap.prototype.__init3.call(this);CompositeTilemap.prototype.__init4.call(this);CompositeTilemap.prototype.__init5.call(this);CompositeTilemap.prototype.__init6.call(this);CompositeTilemap.prototype.__init7.call(this);;

            this.tileset(tileset);
            this.texturesPerTilemap = settings.TEXTURES_PER_TILEMAP;
        }

        /**
         * This will preinitialize the tilesets of the layered tilemaps.
         *
         * If used after a tilemap has been created (or a tile added), this will overwrite the tile textures of the
         * existing tilemaps. Passing the tileset to the constructor instead is the best practice.
         *
         * @param tileTextures - The list of tile textures that make up the tileset.
         */
        tileset(tileTextures)
        {
            if (!tileTextures)
            {
                tileTextures = [];
            }

            const texPerChild = this.texturesPerTilemap;
            const len1 = this.children.length;
            const len2 = Math.ceil(tileTextures.length / texPerChild);

            for (let i = 0; i < Math.min(len1, len2); i++)
            {
                (this.children[i] ).setTileset(
                    tileTextures.slice(i * texPerChild, (i + 1) * texPerChild)
                );
            }
            for (let i = len1; i < len2; i++)
            {
                const tilemap = new Tilemap(tileTextures.slice(i * texPerChild, (i + 1) * texPerChild));

                tilemap.compositeParent = true;
                tilemap.offsetX = settings.TEXTILE_DIMEN;
                tilemap.offsetY = settings.TEXTILE_DIMEN;

                // TODO: Don't use children
                this.addChild(tilemap);
            }

            return this;
        }

        /** Clears the tilemap composite. */
        clear()
        {
            for (let i = 0; i < this.children.length; i++)
            {
                (this.children[i] ).clear();
            }

            this.modificationMarker = 0;

            return this;
        }

        /** Changes the rotation of the last added tile. */
        tileRotate(rotate)
        {
            if (this.lastModifiedTilemap)
            {
                this.lastModifiedTilemap.tileRotate(rotate);
            }

            return this;
        }

        /** Changes `animX`, `animCountX` of the last added tile. */
        tileAnimX(offset, count)
        {
            if (this.lastModifiedTilemap)
            {
                this.lastModifiedTilemap.tileAnimX(offset, count);
            }

            return this;
        }

        /** Changes `animY`, `animCountY` of the last added tile. */
        tileAnimY(offset, count)
        {
            if (this.lastModifiedTilemap)
            {
                this.lastModifiedTilemap.tileAnimY(offset, count);
            }

            return this;
        }

        /** Changes `tileAnimDivisor` value of the last added tile. */
        tileAnimDivisor(divisor)
        {
            if (this.lastModifiedTilemap)
            {
                this.lastModifiedTilemap.tileAnimDivisor(divisor);
            }

            return this;
        }

        /**
         * Adds a tile that paints the given tile texture at (x, y).
         *
         * @param tileTexture - The tile texture. You can pass an index into the composite tilemap as well.
         * @param x - The local x-coordinate of the tile's location.
         * @param y - The local y-coordinate of the tile's location.
         * @param options - Additional options to pass to {@link Tilemap.tile}.
         * @param [options.u=texture.frame.x] - The x-coordinate of the texture in its base-texture's space.
         * @param [options.v=texture.frame.y] - The y-coordinate of the texture in its base-texture's space.
         * @param [options.tileWidth=texture.orig.width] - The local width of the tile.
         * @param [options.tileHeight=texture.orig.height] - The local height of the tile.
         * @param [options.animX=0] - For animated tiles, this is the "offset" along the x-axis for adjacent
         *      animation frame textures in the base-texture.
         * @param [options.animY=0] - For animated tiles, this is the "offset" along the y-axis for adjacent
         *      animation frames textures in the base-texture.
         * @param [options.rotate=0]
         * @param [options.animCountX=1024] - For animated tiles, this is the number of animation frame textures
         *      per row.
         * @param [options.animCountY=1024] - For animated tiles, this is the number of animation frame textures
         *      per column.
         * @param [options.animDivisor=1] - For animated tiles, this is the animation duration each frame
         * @param [options.alpha=1] - Tile alpha
         * @return This tilemap, good for chaining.
         */
        tile(
            tileTexture,
            x,
            y,
            options











     = {}
        )
        {
            let tilemap = null;
            const children = this.children;

            this.lastModifiedTilemap = null;

            if (typeof tileTexture === 'number')
            {
                const childIndex = tileTexture / this.texturesPerTilemap >> 0;
                let tileIndex  = 0;

                tilemap = children[childIndex] ;

                if (!tilemap)
                {
                    tilemap = children[0] ;

                    // Silently fail if the tilemap doesn't exist
                    if (!tilemap) return this;

                    tileIndex = 0;
                }
                else
                {
                    tileIndex = tileTexture % this.texturesPerTilemap;
                }

                tilemap.tile(
                    tileIndex,
                    x,
                    y,
                    options,
                );
            }
            else
            {
                if (typeof tileTexture === 'string')
                {
                    tileTexture = core.Texture.from(tileTexture);
                }

                // Probe all tilemaps to find which tileset contains the base-texture.
                for (let i = 0; i < children.length; i++)
                {
                    const child = children[i] ;
                    const tex = child.getTileset();

                    for (let j = 0; j < tex.length; j++)
                    {
                        if (tex[j] === tileTexture.baseTexture)
                        {
                            tilemap = child;
                            break;
                        }
                    }

                    if (tilemap)
                    {
                        break;
                    }
                }

                // If no tileset contains the base-texture, attempt to add it.
                if (!tilemap)
                {
                    // Probe the tilemaps to find one below capacity. If so, add the texture into that tilemap.
                    for (let i = children.length - 1; i >= 0; i--)
                    {
                        const child = children[i] ;

                        if (child.getTileset().length < this.texturesPerTilemap)
                        {
                            tilemap = child;
                            child.getTileset().push(tileTexture.baseTexture);
                            break;
                        }
                    }

                    // Otherwise, create a new tilemap initialized with that tile texture.
                    if (!tilemap)
                    {
                        tilemap = new Tilemap(tileTexture.baseTexture);
                        tilemap.compositeParent = true;
                        tilemap.offsetX = settings.TEXTILE_DIMEN;
                        tilemap.offsetY = settings.TEXTILE_DIMEN;

                        this.addChild(tilemap);
                    }
                }

                tilemap.tile(
                    tileTexture,
                    x,
                    y,
                    options,
                );
            }

            this.lastModifiedTilemap = tilemap;

            return this;
        }

        __init6() {this.renderCanvas = (renderer) =>
        {
            if (!this.visible || this.worldAlpha <= 0 || !this.renderable)
            {
                return;
            }

            const tilemapPlugin = renderer.plugins.tilemap;

            if (tilemapPlugin && !tilemapPlugin.dontUseTransform)
            {
                const wt = this.worldTransform;

                renderer.context.setTransform(
                    wt.a,
                    wt.b,
                    wt.c,
                    wt.d,
                    wt.tx * renderer.resolution,
                    wt.ty * renderer.resolution
                );
            }

            const layers = this.children;

            for (let i = 0; i < layers.length; i++)
            {
                const layer = (layers[i] );

                layer.tileAnim = this.tileAnim;
                layer.renderCanvasCore(renderer);
            }
        };}

        render(renderer)
        {
            if (!this.visible || this.worldAlpha <= 0 || !this.renderable)
            {
                return;
            }

            const plugin = renderer.plugins.tilemap ;
            const shader = plugin.getShader();

            renderer.batch.setObjectRenderer(plugin);

            // TODO: dont create new array, please
            this._globalMat = shader.uniforms.projTransMatrix;
            renderer.globalUniforms.uniforms.projectionMatrix.copyTo(this._globalMat).append(this.worldTransform);
            shader.uniforms.shadowColor = this.shadowColor;
            shader.uniforms.animationFrame = this.tileAnim || plugin.tileAnim;

            renderer.shader.bind(shader, false);

            const layers = this.children;

            for (let i = 0; i < layers.length; i++)
            {
                (layers[i] ).renderWebGLCore(renderer, plugin);
            }
        }

        /**
         * @internal
         * @ignore
         */
        isModified(anim)
        {
            const layers = this.children;

            if (this.modificationMarker !== layers.length)
            {
                return true;
            }
            for (let i = 0; i < layers.length; i++)
            {
                if ((layers[i] ).isModified(anim))
                {
                    return true;
                }
            }

            return false;
        }

        /**
         * @internal
         * @ignore
         */
        clearModify()
        {
            const layers = this.children;

            this.modificationMarker = layers.length;
            for (let i = 0; i < layers.length; i++)
            {
                (layers[i] ).clearModify();
            }
        }

        /**
         * @deprecated Since @pixi/tilemap 3.
         * @see CompositeTilemap.tile
         */
        addFrame(
            texture,
            x,
            y,
            animX,
            animY,
            animWidth,
            animHeight,
            animDivisor,
            alpha
        )
        {
            return this.tile(
                texture,
                x, y,
                {
                    animX,
                    animY,
                    animCountX: animWidth,
                    animCountY: animHeight,
                    animDivisor,
                    alpha
                }
            );
        }

        /**
         * @deprecated @pixi/tilemap 3
         * @see CompositeTilemap.tile
         */
        // eslint-disable-next-line max-params
        addRect(
            textureIndex,
            u,
            v,
            x,
            y,
            tileWidth,
            tileHeight,
            animX,
            animY,
            rotate,
            animWidth,
            animHeight
        )
        {
            const childIndex = textureIndex / this.texturesPerTilemap >> 0;
            const textureId = textureIndex % this.texturesPerTilemap;

            if (this.children[childIndex] && (this.children[childIndex] ).getTileset())
            {
                this.lastModifiedTilemap = (this.children[childIndex] );
                this.lastModifiedTilemap.addRect(
                    textureId, u, v, x, y, tileWidth, tileHeight, animX, animY, rotate, animWidth, animHeight
                );
            }
            else
            {
                this.lastModifiedTilemap = null;
            }

            return this;
        }

        /**
         * Alias for {@link CompositeTilemap.tileset tileset}.
         *
         * @deprecated Since @pixi/tilemap 3.
         */
        __init7() {this.setBitmaps = this.tileset;}

        /**
         * @deprecated Since @pixi/tilemap 3.
         * @readonly
         * @see CompositeTilemap.texturesPerTilemap
         */
        get texPerChild() { return this.texturesPerTilemap; }
    }

    // For some reason ESLint goes mad with indendation in this file ^&^
    /* eslint-disable indent */

    /**
     * This texture tiling resource can be used to upload multiple base-textures together.
     *
     * This resource combines multiple base-textures into a "textile". They're laid out in
     * a dual column format, placed in row-order order. The size of each tile is predefined,
     * and defaults to {@link settings.TEXTILE_DIMEN}. This means that each input base-texture
     * must is smaller than that along both its width and height.
     *
     * @see settings.TEXTILE_UNITS
     */
    class TextileResource extends core.Resource
    {
    	/** The base-texture that contains all the texture tiles. */
    	 __init() {this.baseTexture = null;}

    	
    	
    	

    	 __init2() {this._clearBuffer = null;}

    	/**
    	 * @param options - This will default to the "settings" exported by @pixi/tilemap.
    	 * @param options.TEXTILE_DIMEN - The dimensions of each tile.
    	 * @param options.TEXTILE_UNITS - The number of texture tiles.
    	 */
    	constructor(options = settings)
    	{
    		super(
    			options.TEXTILE_DIMEN * 2,
    			options.TEXTILE_DIMEN * Math.ceil(options.TEXTILE_UNITS / 2),
    		);TextileResource.prototype.__init.call(this);TextileResource.prototype.__init2.call(this);;

    		const tiles = this.tiles = new Array(options.TEXTILE_UNITS);

    		this.doClear = !!options.DO_CLEAR;
    		this.tileDimen = options.TEXTILE_DIMEN;

    		for (let j = 0; j < options.TEXTILE_UNITS; j++)
    		{
    			tiles[j] = {
    				dirtyId: 0,
    				x: options.TEXTILE_DIMEN * (j & 1),
    				y: options.TEXTILE_DIMEN * (j >> 1),
    				baseTexture: core.Texture.WHITE.baseTexture,
    			};
    		}
    	}

    	/**
    	 * Sets the texture to be uploaded for the given tile.
    	 *
    	 * @param index - The index of the tile being set.
    	 * @param texture - The texture with the base-texture to upload.
    	 */
    	tile(index, texture)
    	{
    		const tile = this.tiles[index];

    		if (tile.baseTexture === texture)
    		{
    			return;
    		}

    		tile.baseTexture = texture;
    		this.baseTexture.update();

    		this.tiles[index].dirtyId = (this.baseTexture ).dirtyId;
    	}

    	/** @override */
    	bind(baseTexture)
    	{
    		if (this.baseTexture)
    		{
    			throw new Error('Only one baseTexture is allowed for this resource!');
    		}

    		this.baseTexture = baseTexture;
    		super.bind(baseTexture);
    	}

    	/** @override */
    	upload(renderer, texture, glTexture)
    	{
    		const { gl } = renderer;
    		const { width, height } = this;

    		gl.pixelStorei(
    			gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,
    			texture.alphaMode === undefined || texture.alphaMode === constants.ALPHA_MODES.UNPACK
    		);

    		if (glTexture.dirtyId < 0)
    		{
    			(glTexture ).width = width;
    			(glTexture ).height = height;

    			gl.texImage2D(texture.target, 0,
    				texture.format,
    				width,
    				height,
    				0,
    				texture.format,
    				texture.type,
    				null);
    		}

    		const doClear = this.doClear;
    		const tiles = this.tiles;

    		if (doClear && !this._clearBuffer)
    		{
    			this._clearBuffer = new Uint8Array(settings.TEXTILE_DIMEN * settings.TEXTILE_DIMEN * 4);
    		}

    		for (let i = 0; i < tiles.length; i++)
    		{
    			const spr = tiles[i];
    			const tex = spr.baseTexture;

    			if (glTexture.dirtyId >= this.tiles[i].dirtyId)
    			{
    				continue;
    			}

    			const res = tex.resource ;

    			if (!tex.valid || !res || !res.source)
    			{
    				continue;
    			}
    			if (doClear && (tex.width < this.tileDimen || tex.height < this.tileDimen))
    			{
    				gl.texSubImage2D(texture.target, 0,
    					spr.x,
    					spr.y,
    					this.tileDimen,
    					this.tileDimen,
    					texture.format,
    					texture.type,
    					this._clearBuffer);
    			}

    			gl.texSubImage2D(texture.target, 0,
    				spr.x,
    				spr.y,
    				texture.format,
    				texture.type,
    				res.source);
    		}

    		return true;
    	}
    }

    /**
     * This will generate fragment shader code that samples the correct texture into the "color" variable.
     *
     * @internal
     * @ignore
     * @param maxTextures - The texture array length in the shader's uniforms.
     */
    function generateSampleSrc(maxTextures)
    {
        let src = '';

        src += '\n';
        src += '\n';

        src += 'if(vTextureId <= -1.0) {';
        src += '\n\tcolor = shadowColor;';
        src += '\n}';

        for (let i = 0; i < maxTextures; i++)
        {
            src += '\nelse ';

            if (i < maxTextures - 1)
            {
                src += `if(textureId == ${i}.0)`;
            }

            src += '\n{';
            src += `\n\tcolor = texture2D(uSamplers[${i}], textureCoord * uSamplerSize[${i}]);`;
            src += '\n}';
        }

        src += '\n';
        src += '\n';

        return src;
    }

    /**
     * @internal
     * @ignore
     * @param shader
     * @param maxTextures
     */
    function fillSamplers(shader, maxTextures)
    {
        const sampleValues = [];

        for (let i = 0; i < maxTextures; i++)
        {
            sampleValues[i] = i;
        }

        shader.uniforms.uSamplers = sampleValues;

        const samplerSize = [];

        for (let i = 0; i < maxTextures; i++)
        {
            // These are overwritten by TileRenderer when textures actually bound.
            samplerSize.push(1.0 / 2048);
            samplerSize.push(1.0 / 2048);
        }

        shader.uniforms.uSamplerSize = samplerSize;
    }

    /**
     * @internal
     * @ignore
     * @param maxTextures
     * @param fragmentSrc
     * @returns
     */
    function generateFragmentSrc(maxTextures, fragmentSrc)
    {
        return fragmentSrc.replace(/%count%/gi, `${maxTextures}`)
            .replace(/%forloop%/gi, generateSampleSrc(maxTextures));
    }

    var tilemapVertexTemplateSrc = "attribute vec2 aVertexPosition;\nattribute vec2 aTextureCoord;\nattribute vec4 aFrame;\nattribute vec2 aAnim;\nattribute float aAnimDivisor;\nattribute float aTextureId;\nattribute float aAlpha;\n\nuniform mat3 projTransMatrix;\nuniform vec2 animationFrame;\n\nvarying vec2 vTextureCoord;\nvarying float vTextureId;\nvarying vec4 vFrame;\nvarying float vAlpha;\n\nvoid main(void)\n{\n   gl_Position = vec4((projTransMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);\n   vec2 animCount = floor((aAnim + 0.5) / 2048.0);\n   vec2 animFrameOffset = aAnim - animCount * 2048.0;\n   vec2 currentFrame = floor(animationFrame / aAnimDivisor);\n   vec2 animOffset = animFrameOffset * floor(mod(currentFrame + 0.5, animCount));\n\n   vTextureCoord = aTextureCoord + animOffset;\n   vFrame = aFrame + vec4(animOffset, animOffset);\n   vTextureId = aTextureId;\n   vAlpha = aAlpha;\n}\n";

    var tilemapFragmentTemplateSrc = "varying vec2 vTextureCoord;\nvarying vec4 vFrame;\nvarying float vTextureId;\nvarying float vAlpha;\nuniform vec4 shadowColor;\nuniform sampler2D uSamplers[%count%];\nuniform vec2 uSamplerSize[%count%];\n\nvoid main(void)\n{\n   vec2 textureCoord = clamp(vTextureCoord, vFrame.xy, vFrame.zw);\n   float textureId = floor(vTextureId + 0.5);\n\n   vec4 color;\n   %forloop%\n   gl_FragColor = color * vAlpha;\n}\n";

    // eslint-disable-next-line @typescript-eslint/triple-slash-reference, spaced-comment

    // For some reason ESLint goes mad with indendation in this file ^&^
    /* eslint-disable no-mixed-spaces-and-tabs, indent */

    class TilemapShader extends core.Shader
    {
    	__init() {this.maxTextures = 0;}

    	constructor(maxTextures)
    	{
    	    super(
    	        new core.Program(
    				tilemapVertexTemplateSrc,
    				generateFragmentSrc(maxTextures, tilemapFragmentTemplateSrc)
    			),
    	        {
    	            animationFrame: new Float32Array(2),
    	            uSamplers: [],
    	            uSamplerSize: [],
    	            projTransMatrix: new math.Matrix()
    	        }
    	    );TilemapShader.prototype.__init.call(this);;

    	    this.maxTextures = maxTextures;
    	    fillSamplers(this, this.maxTextures);
    	}
    }

    class TilemapGeometry extends core.Geometry
    {
    	__init2() {this.vertSize = 13;}
    	__init3() {this.vertPerQuad = 4;}
    	__init4() {this.stride = this.vertSize * 4;}
    	__init5() {this.lastTimeAccess = 0;}

    	constructor()
    	{
    	    super();TilemapGeometry.prototype.__init2.call(this);TilemapGeometry.prototype.__init3.call(this);TilemapGeometry.prototype.__init4.call(this);TilemapGeometry.prototype.__init5.call(this);;

    	    const buf = this.buf = new core.Buffer(new Float32Array(2), true, false);

    	    this.addAttribute('aVertexPosition', buf, 0, false, 0, this.stride, 0)
    	        .addAttribute('aTextureCoord', buf, 0, false, 0, this.stride, 2 * 4)
    	        .addAttribute('aFrame', buf, 0, false, 0, this.stride, 4 * 4)
    	        .addAttribute('aAnim', buf, 0, false, 0, this.stride, 8 * 4)
    	        .addAttribute('aTextureId', buf, 0, false, 0, this.stride, 10 * 4)
                .addAttribute('aAnimDivisor', buf, 0, false, 0, this.stride, 11 * 4)
                .addAttribute('aAlpha', buf, 0, false, 0, this.stride, 12 * 4);
    	}

    	
    }

    // For some reason ESLint goes mad with indendation in this file ^&^
    /* eslint-disable no-mixed-spaces-and-tabs, indent */

    /**
     * Rendering helper pipeline for tilemaps. This plugin is registered automatically.
     */
    class TileRenderer extends core.ObjectRenderer
    {
    	/** The managing renderer */
    	

    	/** The tile animation frame */
    	 __init() {this.tileAnim = [0, 0];}

    	 __init2() {this.ibLen = 0;}// index buffer length

    	/** The index buffer for the tilemaps to share. */
    	 __init3() {this.indexBuffer = null;}

    	/** The shader used to render tilemaps. */
    	

    	/**
    	 * {@link TextileResource} instances used to upload textures batched in tiled groups. This is
    	 * used only if {@link settings.TEXTURES_PER_TILEMAP} is greater than 1.
    	 */
    	 __init4() {this.textiles = [];}

    	/** @param renderer - The managing renderer */
    	constructor(renderer)
    	{
    	    super(renderer);TileRenderer.prototype.__init.call(this);TileRenderer.prototype.__init2.call(this);TileRenderer.prototype.__init3.call(this);TileRenderer.prototype.__init4.call(this);;

    	    this.shader = new TilemapShader(settings.TEXTURES_PER_TILEMAP);
    	    this.indexBuffer = new core.Buffer(undefined, true, true);
    	    this.checkIndexBuffer(2000);
    	    this.makeTextiles();
    	}

    	/**
    	 * Binds the tile textures to the renderer, and updates the tilemap shader's `uSamplerSize` uniform.
    	 *
    	 * If {@link settings.TEXTILE_UNITS}
    	 *
    	 * @param renderer - The renderer to which the textures are to be bound.
    	 * @param textures - The tile textures being bound.
    	 */
    	bindTileTextures(renderer, textures)
    	{
    	    const len = textures.length;
    		const shader = this.shader;
    	    const maxTextures = settings.TEXTURES_PER_TILEMAP;
    		const samplerSize = shader.uniforms.uSamplerSize;

    	    if (len > settings.TEXTILE_UNITS * maxTextures)
    	    {
    			// TODO: Show error message instead of silently failing!
    	        return;
    	    }

    		if (settings.TEXTILE_UNITS <= 1)
    	    {
    			// Bind each texture directly & update samplerSize.
    			for (let i = 0; i < textures.length; i++)
    			{
    				const texture = textures[i];

    				if (!texture || !texture.valid)
    				{
    					return;
    				}

    				renderer.texture.bind(textures[i], i);

    				samplerSize[i * 2] = 1.0 / textures[i].realWidth;
    				samplerSize[(i * 2) + 1] = 1.0 / textures[i].realHeight;
    			}
    	    }
    		else
    		{
    			// Ensure we have enough textiles, in case settings.TEXTILE_UNITS was modified.
    			this.makeTextiles();

    			const usedTextiles = Math.ceil(len / settings.TEXTILE_UNITS);

    			// First ensure each textile has all tiles point to the right textures.
    			for (let i = 0; i < len; i++)
    			{
    				const texture = textures[i];

    				if (texture && texture.valid)
    				{
    					const resourceIndex = Math.floor(i / settings.TEXTILE_UNITS);
    					const tileIndex = i % settings.TEXTILE_UNITS;

    					this.textiles[resourceIndex].tile(tileIndex, texture);
    				}
    			}

    			// Then bind the textiles + update samplerSize.
    			for (let i = 0; i < usedTextiles; i++)
    			{
    				renderer.texture.bind(this.textiles[i].baseTexture, i);

    				samplerSize[i * 2] = 1.0 / this.textiles[i].width;
    				samplerSize[(i * 2) + 1] = 1.0 / this.textiles[i].baseTexture.height;
    			}
    		}

    		shader.uniforms.uSamplerSize = samplerSize;
    	}

    	start()
    	{
    	    // sorry, nothing
    	}

    	/**
    	 * @internal
    	 * @ignore
    	 */
    	createVb()
    	{
    	    const geom = new TilemapGeometry();

    	    geom.addIndex(this.indexBuffer);
    	    geom.lastTimeAccess = Date.now();

    	    return geom;
    	}

    	/** @return The {@link TilemapShader} shader that this rendering pipeline is using. */
    	getShader() { return this.shader; }

    	destroy()
    	{
    	    super.destroy();
    	    // this.rectShader.destroy();
    	    this.shader = null;
    	}

    	 checkIndexBuffer(size, _vb = null)
    	{
    	    const totalIndices = size * 6;

    	    if (totalIndices <= this.ibLen)
    	    {
    	        return;
    	    }

    	    let len = totalIndices;

    	    while (len < totalIndices)
    	    {
    	        len <<= 1;
    	    }

    	    this.ibLen = totalIndices;
    	    this.indexBuffer.update(utils.createIndicesForQuads(size,
    	        settings.use32bitIndex ? new Uint32Array(size * 6) : undefined));

    	    // 	TODO: create new index buffer instead?
    	    // if (vb) {
    	    // 	const curIndex = vb.getIndex();
    	    // 	if (curIndex !== this.indexBuffer && (curIndex.data as any).length < totalIndices) {
    	    // 		this.swapIndex(vb, this.indexBuffer);
    	    // 	}
    	    // }
    	}

    	/** Makes textile resources and initializes {@link TileRenderer.textiles}. */
    	 makeTextiles()
    	{
    	    if (settings.TEXTILE_UNITS <= 1)
    	    {
    	        return;
    	    }

    	    for (let i = 0; i < settings.TEXTILE_UNITS; i++)
    	    {
    			if (this.textiles[i]) continue;

    			const resource = new TextileResource();
    	        const baseTex = new core.BaseTexture(resource);

    	        baseTex.scaleMode = settings.TEXTILE_SCALE_MODE;
    	        baseTex.wrapMode = constants.WRAP_MODES.CLAMP;

    			this.textiles[i] = resource;
    	    }
    	}
    }

    core.Renderer.registerPlugin('tilemap', TileRenderer );

    // eslint-disable-next-line camelcase
    const pixi_tilemap = {
        CanvasTileRenderer,
        CompositeRectTileLayer: CompositeTilemap,
        CompositeTilemap,
        Constant,
        TextileResource,
        MultiTextureResource: TextileResource,
        RectTileLayer: Tilemap,
        Tilemap,
        TilemapShader,
        TilemapGeometry,
        RectTileShader: TilemapShader,
        RectTileGeom: TilemapGeometry,
        TileRenderer,
    };

    exports.CanvasTileRenderer = CanvasTileRenderer;
    exports.CompositeRectTileLayer = CompositeTilemap;
    exports.CompositeTilemap = CompositeTilemap;
    exports.Constant = Constant;
    exports.POINT_STRUCT_SIZE = POINT_STRUCT_SIZE;
    exports.RectTileLayer = Tilemap;
    exports.TextileResource = TextileResource;
    exports.TileRenderer = TileRenderer;
    exports.Tilemap = Tilemap;
    exports.TilemapGeometry = TilemapGeometry;
    exports.TilemapShader = TilemapShader;
    exports.fillSamplers = fillSamplers;
    exports.generateFragmentSrc = generateFragmentSrc;
    exports.pixi_tilemap = pixi_tilemap;
    exports.settings = settings;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
if (typeof _pixi_tilemap !== 'undefined') { Object.assign(this.PIXI.tilemap, _pixi_tilemap); }
//# sourceMappingURL=pixi-tilemap.umd.js.map
