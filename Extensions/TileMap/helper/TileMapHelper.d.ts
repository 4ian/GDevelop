import * as PIXI from 'pixi.js';

var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
    return extendStatics(d, b);
};

function __extends(d, b) {
    if (typeof b !== "function" && b !== null)
        throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

function __values(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
}

/**
 * A tile map model.
 *
 * Tile map files are parsed into this model by {@link TiledTileMapLoader}.
 * This model is used for rending ({@link TileMapRuntimeObjectPixiRenderer})
 * and hitboxes handling ({@link TransformedCollisionTileMap}).
 * This allows to support new file format with only a new parser.
 */
var EditableTileMap = /** @class */ (function () {
    /**
     * @param tileWidth The width of a tile.
     * @param tileHeight The height of a tile.
     * @param dimX The number of tile columns in the map.
     * @param dimY The number of tile rows in the map.
     * @param tileSet The tile set.
     */
    function EditableTileMap(tileWidth, tileHeight, dimX, dimY, 
    // TODO should the tile set be built internally?
    // It's not meant to change and it avoid to do a copy.
    tileSet) {
        console.log("tile dimension: " + tileWidth + " " + tileHeight);
        this.tileWidth = tileWidth;
        this.tileHeight = tileHeight;
        this.dimX = dimX;
        this.dimY = dimY;
        this._tileSet = tileSet;
        this._layers = [];
    }
    /**
     * @returns The tile map width in pixels.
     */
    EditableTileMap.prototype.getWidth = function () {
        return this.tileWidth * this.dimX;
    };
    /**
     * @returns The tile map height in pixels.
     */
    EditableTileMap.prototype.getHeight = function () {
        return this.tileHeight * this.dimY;
    };
    /**
     * @returns The tile width in pixels.
     */
    EditableTileMap.prototype.getTileHeight = function () {
        return this.tileWidth;
    };
    /**
     * @returns The tile height in pixels.
     */
    EditableTileMap.prototype.getTileWidth = function () {
        return this.tileHeight;
    };
    /**
     * @returns The number of tile columns in the map.
     */
    EditableTileMap.prototype.getDimensionX = function () {
        return this.dimX;
    };
    /**
     * @returns The number of tile rows in the map.
     */
    EditableTileMap.prototype.getDimensionY = function () {
        return this.dimY;
    };
    /**
     * @param tileId The tile identifier
     * @returns The tile definition form the tile set.
     */
    EditableTileMap.prototype.getTileDefinition = function (tileId) {
        return this._tileSet.get(tileId);
    };
    /**
     * @returns All the tile definitions form the tile set.
     */
    EditableTileMap.prototype.getTileDefinitions = function () {
        return this._tileSet.values();
    };
    /**
     * @param id The identifier of the new layer.
     * @returns The new layer.
     */
    EditableTileMap.prototype.addTileLayer = function (id) {
        var layer = new EditableTileMapLayer(this, id);
        this._layers.push(layer);
        return layer;
    };
    /**
     * @param id The identifier of the new layer.
     * @returns The new layer.
     */
    EditableTileMap.prototype.addObjectLayer = function (id) {
        var layer = new EditableObjectLayer(this, id);
        this._layers.push(layer);
        return layer;
    };
    /**
     * @returns All the layers of the tile map.
     */
    EditableTileMap.prototype.getLayers = function () {
        return this._layers;
    };
    /**
     * Check if a point is inside a tile with a given tag.
     *
     * It doesn't use the tile hitboxes.
     * It only check the point is inside the tile square.
     *
     * @param x The X coordinate of the point to check.
     * @param y The Y coordinate of the point to check.
     * @param tag The tile tag
     * @returns true when the point is inside a tile with a given tag.
     */
    EditableTileMap.prototype.pointIsInsideTile = function (x, y, tag) {
        var e_1, _a;
        var indexX = Math.floor(x / this.tileWidth);
        var indexY = Math.floor(y / this.tileHeight);
        try {
            for (var _b = __values(this._layers), _c = _b.next(); !_c.done; _c = _b.next()) {
                var layer = _c.value;
                var tileLayer = layer;
                if (!tileLayer) {
                    continue;
                }
                var tileId = tileLayer.get(indexX, indexY);
                if (!tileId) {
                    return false;
                }
                var tileDefinition = this._tileSet.get(tileId);
                if (tileDefinition.getTag() === tag) {
                    return true;
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return false;
    };
    return EditableTileMap;
}());
/**
 * A tile map layer.
 */
var AbstractEditableLayer = /** @class */ (function () {
    /**
     * @param tileMap The layer tile map.
     * @param id The layer identifier.
     */
    function AbstractEditableLayer(tileMap, id) {
        this.visible = true;
        this.tileMap = tileMap;
        this.id = id;
    }
    /**
     * @param visible
     */
    AbstractEditableLayer.prototype.setVisible = function (visible) {
        this.visible = visible;
    };
    /**
     * @returns true if the layer is visible.
     */
    AbstractEditableLayer.prototype.isVisible = function () {
        return this.visible;
    };
    return AbstractEditableLayer;
}());
/**
 * A layer where tiles are placed with pixel coordinates.
 */
var EditableObjectLayer = /** @class */ (function (_super) {
    __extends(EditableObjectLayer, _super);
    /**
     * @param tileMap  The layer tile map.
     * @param id The layer identifier.
     */
    function EditableObjectLayer(tileMap, id) {
        var _this = _super.call(this, tileMap, id) || this;
        _this.objects = [];
        return _this;
    }
    /**
     * @param object
     */
    EditableObjectLayer.prototype.add = function (object) {
        this.objects.push(object);
    };
    return EditableObjectLayer;
}(AbstractEditableLayer));
/**
 * A tile that is placed with pixel coordinates.
 */
var TileObject = /** @class */ (function () {
    /**
     * @param x The coordinate of the tile left side.
     * @param y The coordinate of the tile top side.
     * @param tileId The tile identifier in the tile set.
     */
    function TileObject(x, y, tileId) {
        this.tileId = tileId;
        this.x = x;
        this.y = y;
    }
    /**
     * @return The tile identifier in the tile set.
     */
    TileObject.prototype.getTileId = function () {
        return FlippingHelper.getTileId(this.tileId);
    };
    /**
     * @param flippedHorizontally
     */
    TileObject.prototype.setFlippedHorizontally = function (flippedHorizontally) {
        this.tileId = FlippingHelper.setFlippedHorizontally(this.tileId, flippedHorizontally);
    };
    /**
     * @param flippedVertically
     */
    TileObject.prototype.setFlippedVertically = function (flippedVertically) {
        this.tileId = FlippingHelper.setFlippedVertically(this.tileId, flippedVertically);
    };
    /**
     * @param flippedDiagonally
     */
    TileObject.prototype.setFlippedDiagonally = function (flippedDiagonally) {
        this.tileId = FlippingHelper.setFlippedDiagonally(this.tileId, flippedDiagonally);
    };
    /**
     * @returns true if the tile is flipped horizontally.
     */
    TileObject.prototype.isFlippedHorizontally = function () {
        return FlippingHelper.isFlippedHorizontally(this.tileId);
    };
    /**
     * @returns true if the tile is flipped vertically.
     */
    TileObject.prototype.isFlippedVertically = function () {
        return FlippingHelper.isFlippedVertically(this.tileId);
    };
    /**
     * @returns true if the tile is flipped diagonally.
     */
    TileObject.prototype.isFlippedDiagonally = function () {
        return FlippingHelper.isFlippedDiagonally(this.tileId);
    };
    return TileObject;
}());
/**
 * Tile identifiers making to access flipping flags.
 */
var FlippingHelper = /** @class */ (function () {
    function FlippingHelper() {
    }
    FlippingHelper.getTileId = function (tileId) {
        return tileId & FlippingHelper.tileIdMask;
    };
    FlippingHelper.setFlippedHorizontally = function (tileId, flippedHorizontally) {
        tileId &= ~FlippingHelper.flippedHorizontallyFlag;
        if (flippedHorizontally) {
            tileId |= FlippingHelper.flippedHorizontallyFlag;
        }
        return tileId;
    };
    FlippingHelper.setFlippedVertically = function (tileId, flippedVertically) {
        tileId &= ~FlippingHelper.flippedVerticallyFlag;
        if (flippedVertically) {
            tileId |= FlippingHelper.flippedVerticallyFlag;
        }
        return tileId;
    };
    FlippingHelper.setFlippedDiagonally = function (tileId, flippedDiagonally) {
        tileId &= ~FlippingHelper.flippedDiagonallyFlag;
        if (flippedDiagonally) {
            tileId |= FlippingHelper.flippedDiagonallyFlag;
        }
        return tileId;
    };
    FlippingHelper.isFlippedHorizontally = function (tileId) {
        return (tileId & FlippingHelper.flippedHorizontallyFlag) !== 0;
    };
    FlippingHelper.isFlippedVertically = function (tileId) {
        return (tileId & FlippingHelper.flippedVerticallyFlag) !== 0;
    };
    FlippingHelper.isFlippedDiagonally = function (tileId) {
        return (tileId & FlippingHelper.flippedDiagonallyFlag) !== 0;
    };
    FlippingHelper.flippedHorizontallyFlag = 0x80000000;
    FlippingHelper.flippedVerticallyFlag = 0x40000000;
    FlippingHelper.flippedDiagonallyFlag = 0x20000000;
    FlippingHelper.tileIdMask = ~(FlippingHelper.flippedHorizontallyFlag |
        FlippingHelper.flippedVerticallyFlag |
        FlippingHelper.flippedDiagonallyFlag);
    return FlippingHelper;
}());
/**
 * A tile map layer with tile organized in grid.
 */
var EditableTileMapLayer = /** @class */ (function (_super) {
    __extends(EditableTileMapLayer, _super);
    /**
     * @param tileMap The layer tile map.
     * @param id The layer identifier.
     */
    function EditableTileMapLayer(tileMap, id) {
        var _this = _super.call(this, tileMap, id) || this;
        _this._tiles = [];
        _this._tiles.length = _this.tileMap.getDimensionY();
        for (var index = 0; index < _this._tiles.length; index++) {
            _this._tiles[index] = new Int32Array(_this.tileMap.getDimensionX());
        }
        return _this;
    }
    /**
     * @param x The layer column.
     * @param y The layer row.
     * @param tileId The tile identifier in the tile set.
     */
    EditableTileMapLayer.prototype.setTile = function (x, y, tileId) {
        var definition = this.tileMap.getTileDefinition(tileId);
        if (!definition) {
            throw new Error("Invalid tile definition index: ".concat(tileId));
        }
        //console.log(x + " " + y + " set: " + definitionIndex);
        // +1 because 0 mean null
        this._tiles[y][x] = tileId + 1;
    };
    /**
     * @param x The layer column.
     * @param y The layer row.
     */
    EditableTileMapLayer.prototype.removeTile = function (x, y) {
        // 0 mean null
        this._tiles[y][x] = 0;
    };
    /**
     * @param x The layer column.
     * @param y The layer row.
     * @param flippedHorizontally
     */
    EditableTileMapLayer.prototype.setFlippedHorizontally = function (x, y, flippedHorizontally) {
        var tileId = this._tiles[y][x];
        if (tileId === 0) {
            return;
        }
        this._tiles[y][x] = FlippingHelper.setFlippedHorizontally(tileId, flippedHorizontally);
    };
    /**
     * @param x The layer column.
     * @param y The layer row.
     * @param flippedVertically
     */
    EditableTileMapLayer.prototype.setFlippedVertically = function (x, y, flippedVertically) {
        var tileId = this._tiles[y][x];
        if (tileId === 0) {
            return;
        }
        this._tiles[y][x] = FlippingHelper.setFlippedVertically(tileId, flippedVertically);
    };
    /**
     * @param x The layer column.
     * @param y The layer row.
     * @param flippedDiagonally
     */
    EditableTileMapLayer.prototype.setFlippedDiagonally = function (x, y, flippedDiagonally) {
        var tileId = this._tiles[y][x];
        if (tileId === 0) {
            return;
        }
        this._tiles[y][x] = FlippingHelper.setFlippedDiagonally(tileId, flippedDiagonally);
    };
    /**
     * @param x The layer column.
     * @param y The layer row.
     * @returns true if the tile is flipped horizontally.
     */
    EditableTileMapLayer.prototype.isFlippedHorizontally = function (x, y) {
        return FlippingHelper.isFlippedHorizontally(this._tiles[y][x]);
    };
    /**
     * @param x The layer column.
     * @param y The layer row.
     * @returns true if the tile is flipped vertically.
     */
    EditableTileMapLayer.prototype.isFlippedVertically = function (x, y) {
        return FlippingHelper.isFlippedVertically(this._tiles[y][x]);
    };
    /**
     * @param x The layer column.
     * @param y The layer row.
     * @returns true if the tile is flipped diagonally.
     */
    EditableTileMapLayer.prototype.isFlippedDiagonally = function (x, y) {
        return FlippingHelper.isFlippedDiagonally(this._tiles[y][x]);
    };
    /**
     * @param x The layer column.
     * @param y The layer row.
     * @returns The tile identifier from the tile set.
     */
    EditableTileMapLayer.prototype.get = function (x, y) {
        var row = this._tiles[y];
        if (!row || row[x] === 0) {
            return undefined;
        }
        // -1 because 0 is keep for null.
        var tileId = FlippingHelper.getTileId(row[x] - 1);
        return tileId;
    };
    /**
     * The number of tile columns in the layer.
     */
    EditableTileMapLayer.prototype.getDimensionX = function () {
        return this._tiles.length === 0 ? 0 : this._tiles[0].length;
    };
    /**
     * The number of tile rows in the layer.
     */
    EditableTileMapLayer.prototype.getDimensionY = function () {
        return this._tiles.length;
    };
    /**
     * @returns The layer width in pixels.
     */
    EditableTileMapLayer.prototype.getWidth = function () {
        return this.tileMap.getWidth();
    };
    /**
     * @returns The layer height in pixels.
     */
    EditableTileMapLayer.prototype.getHeight = function () {
        return this.tileMap.getHeight();
    };
    return EditableTileMapLayer;
}(AbstractEditableLayer));
/**
 * A tile definition from the tile set.
 */
var TileDefinition = /** @class */ (function () {
    /**
     * @param hitBoxes The hit boxes for this tile.
     * @param tag The tag of this tile.
     * @param animationLength The number of frame in the tile animation.
     */
    function TileDefinition(hitBoxes, tag, animationLength) {
        this.hitBoxes = hitBoxes;
        this.tag = tag;
        this.animationLength = animationLength;
    }
    /**
     * This property is used by {@link TransformedCollisionTileMap}
     * to make collision classes.
     * @returns The tag that is used to filter tiles.
     */
    TileDefinition.prototype.getTag = function () {
        return this.tag;
    };
    /**
     * The hitboxes positioning is done by {@link TransformedCollisionTileMap}.
     * @returns The hit boxes for this tile.
     */
    TileDefinition.prototype.getHiBoxes = function () {
        return this.hitBoxes;
    };
    /**
     * Animated tiles have a limitation:
     * they are only able to use frames arranged horizontally one next
     * to each other on the atlas.
     * @returns The number of frame in the tile animation.
     */
    TileDefinition.prototype.getAnimationLength = function () {
        return this.animationLength;
    };
    return TileDefinition;
}());

var ResourceCache = /** @class */ (function () {
    /**
     *
     */
    function ResourceCache() {
        this._cachedValues = new Map();
        this._callbacks = new Map();
    }
    ResourceCache.prototype.getOrLoad = function (key, load, callback) {
        var _this = this;
        // Check if the value is in the cache.
        {
            var value = this._cachedValues.get(key);
            if (value) {
                callback(value);
                return;
            }
        }
        // Check if the value is being loading.
        {
            var callbacks = this._callbacks.get(key);
            if (callbacks) {
                callbacks.push(callback);
                return;
            }
            else {
                this._callbacks.set(key, [callback]);
            }
        }
        load(function (value) {
            var e_1, _a;
            if (value) {
                _this._cachedValues.set(key, value);
            }
            var callbacks = _this._callbacks.get(key);
            _this._callbacks.delete(key);
            try {
                for (var callbacks_1 = __values(callbacks), callbacks_1_1 = callbacks_1.next(); !callbacks_1_1.done; callbacks_1_1 = callbacks_1.next()) {
                    var callback_1 = callbacks_1_1.value;
                    callback_1(value);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (callbacks_1_1 && !callbacks_1_1.done && (_a = callbacks_1.return)) _a.call(callbacks_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
        });
    };
    return ResourceCache;
}());

/**
 * Decodes a layer data, which can sometimes be store as a compressed base64 string
 * by Tiled.
 * See https://doc.mapeditor.org/en/stable/reference/tmx-map-format/#data.
 * @param pako The zlib library.
 * @param layer The layer data from a Tiled JSON.
 * @returns The decoded layer data.
 */
var decodeBase64LayerData = function (pako, layer) {
    var data = layer.data, compression = layer.compression;
    var dataBase64 = data;
    if (!dataBase64) {
        // The layer data is not encoded.
        return data;
    }
    var index = 4;
    var decodedData = [];
    var step1 = atob(dataBase64)
        .split("")
        .map(function (x) {
        return x.charCodeAt(0);
    });
    try {
        var decodeArray = function (arr, index) {
            return (arr[index] +
                (arr[index + 1] << 8) +
                (arr[index + 2] << 16) +
                (arr[index + 3] << 24)) >>>
                0;
        };
        if (compression === "zlib") {
            var binData = new Uint8Array(step1);
            var decompressedData = pako.inflate(binData);
            while (index <= decompressedData.length) {
                decodedData.push(decodeArray(decompressedData, index - 4));
                index += 4;
            }
        }
        else if (compression === "zstd") {
            console.error("Zstandard compression is not supported for layers in a Tilemap. Use instead zlib compression or no compression.");
            return null;
        }
        else {
            while (index <= step1.length) {
                decodedData.push(decodeArray(step1, index - 4));
                index += 4;
            }
        }
        return decodedData;
    }
    catch (error) {
        console.error("Failed to decompress and unzip base64 layer.data string", error);
        return null;
    }
};
/**
 * Extract information about the rotation of a tile from the tile id.
 * @param globalTileUid
 * @returns The tile identifier and orientation.
 */
var extractTileUidFlippedStates = function (globalTileUid) {
    var FLIPPED_HORIZONTALLY_FLAG = 0x80000000;
    var FLIPPED_VERTICALLY_FLAG = 0x40000000;
    var FLIPPED_DIAGONALLY_FLAG = 0x20000000;
    var flippedHorizontally = globalTileUid & FLIPPED_HORIZONTALLY_FLAG;
    var flippedVertically = globalTileUid & FLIPPED_VERTICALLY_FLAG;
    var flippedDiagonally = globalTileUid & FLIPPED_DIAGONALLY_FLAG;
    var tileUid = globalTileUid &
        ~(FLIPPED_HORIZONTALLY_FLAG |
            FLIPPED_VERTICALLY_FLAG |
            FLIPPED_DIAGONALLY_FLAG);
    return {
        id: tileUid,
        flippedHorizontally: !!flippedHorizontally,
        flippedVertically: !!flippedVertically,
        flippedDiagonally: !!flippedDiagonally,
    };
};

/**
 * It creates a {@link EditableTileMap} from a Tiled JSON.
 */
var TiledTileMapLoader = /** @class */ (function () {
    function TiledTileMapLoader() {
    }
    TiledTileMapLoader.load = function (pako, tiledMap) {
        var e_1, _a, e_2, _b, e_3, _c, e_4, _d;
        if (!tiledMap.tiledversion) {
            console.warn("The loaded Tiled map does not contain a 'tiledversion' key. Are you sure this file has been exported from Tiled (mapeditor.org)?");
            return null;
        }
        var definitions = new Map();
        try {
            for (var _e = __values(tiledMap.tilesets[0].tiles), _f = _e.next(); !_f.done; _f = _e.next()) {
                var tile = _f.value;
                var polygons = [];
                if (tile.objectgroup) {
                    try {
                        for (var _g = (e_2 = void 0, __values(tile.objectgroup.objects)), _h = _g.next(); !_h.done; _h = _g.next()) {
                            var object = _h.value;
                            var polygon = null;
                            if (object.polygon) {
                                polygon = object.polygon.map(function (point) { return [point.x, point.y]; });
                                //TODO check that polygons are convex or split them?
                            }
                            // TODO handle ellipses by creating a polygon?
                            // Make an object property for the number of vertices or always create 8 ones?
                            // Will the user need the same vertices number for every ellipse?
                            else {
                                polygon = [
                                    [object.x, object.y],
                                    [object.x, object.y + object.height],
                                    [object.x + object.width, object.y + object.height],
                                    [object.x + object.width, object.y],
                                ];
                            }
                            polygons.push(polygon);
                        }
                    }
                    catch (e_2_1) { e_2 = { error: e_2_1 }; }
                    finally {
                        try {
                            if (_h && !_h.done && (_b = _g.return)) _b.call(_g);
                        }
                        finally { if (e_2) throw e_2.error; }
                    }
                }
                //console.log("Definition: " + tile.id);
                definitions.set(tile.id, new TileDefinition(polygons, tile.type ? tile.type : "", tile.animation ? tile.animation.length : 0));
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_f && !_f.done && (_a = _e.return)) _a.call(_e);
            }
            finally { if (e_1) throw e_1.error; }
        }
        for (var tileId = 0; tileId < tiledMap.tilesets[0].tilecount; tileId++) {
            if (!definitions.has(tileId)) {
                definitions.set(tileId, new TileDefinition([], "", 0));
            }
        }
        //console.log(definitions.size + " tiles definition");
        var collisionTileMap = new EditableTileMap(tiledMap.tilewidth, tiledMap.tileheight, tiledMap.width, tiledMap.height, definitions);
        try {
            for (var _j = __values(tiledMap.layers), _k = _j.next(); !_k.done; _k = _j.next()) {
                var tiledLayer = _k.value;
                if (tiledLayer.type === "objectgroup") {
                    var objectLayer = collisionTileMap.addObjectLayer(tiledLayer.id);
                    objectLayer.setVisible(tiledLayer.visible);
                    try {
                        for (var _l = (e_4 = void 0, __values(tiledLayer.objects)), _m = _l.next(); !_m.done; _m = _l.next()) {
                            var tiledObject = _m.value;
                            if (!tiledObject.visible) {
                                // Objects layer are nice to put decorations but dynamic objects
                                // must be done with GDevelop objects.
                                // So, there is no point to load it as there won't be any action to
                                // make objects visible individually.
                                continue;
                            }
                            var tileGid = extractTileUidFlippedStates(tiledObject.gid);
                            var object = new TileObject(tiledObject.x, tiledObject.y, tileGid.id);
                            objectLayer.add(object);
                            object.setFlippedHorizontally(tileGid.flippedHorizontally);
                            object.setFlippedVertically(tileGid.flippedVertically);
                            object.setFlippedDiagonally(tileGid.flippedDiagonally);
                        }
                    }
                    catch (e_4_1) { e_4 = { error: e_4_1 }; }
                    finally {
                        try {
                            if (_m && !_m.done && (_d = _l.return)) _d.call(_l);
                        }
                        finally { if (e_4) throw e_4.error; }
                    }
                }
                else if (tiledLayer.type === "tilelayer") {
                    var tileSlotIndex = 0;
                    var layerData = null;
                    if (tiledLayer.encoding === "base64") {
                        layerData = decodeBase64LayerData(pako, tiledLayer);
                        if (!layerData) {
                            console.warn("Failed to uncompress layer.data");
                        }
                    }
                    else {
                        layerData = tiledLayer.data;
                    }
                    if (layerData) {
                        var collisionTileLayer = collisionTileMap.addTileLayer(tiledLayer.id);
                        collisionTileLayer.setVisible(tiledLayer.visible);
                        // TODO handle layer offset
                        for (var y = 0; y < tiledLayer.height; y++) {
                            for (var x = 0; x < tiledLayer.width; x++) {
                                // The "globalTileUid" is the tile UID with encoded
                                // bits about the flipping/rotation of the tile.
                                var globalTileUid = layerData[tileSlotIndex];
                                // Extract the tile UID and the texture.
                                var tileUid = extractTileUidFlippedStates(globalTileUid);
                                //console.log("globalTileUid: " + tileUid.id + " " + tileUid.flippedHorizontally + " " + tileUid.flippedVertically + " " + tileUid.flippedDiagonally);
                                if (tileUid.id > 0) {
                                    collisionTileLayer.setTile(x, y, tileUid.id - 1);
                                    collisionTileLayer.setFlippedHorizontally(x, y, tileUid.flippedHorizontally);
                                    collisionTileLayer.setFlippedVertically(x, y, tileUid.flippedVertically);
                                    collisionTileLayer.setFlippedDiagonally(x, y, tileUid.flippedDiagonally);
                                }
                                tileSlotIndex += 1;
                            }
                        }
                    }
                }
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (_k && !_k.done && (_c = _j.return)) _c.call(_j);
            }
            finally { if (e_3) throw e_3.error; }
        }
        return collisionTileMap;
    };
    return TiledTileMapLoader;
}());

/**
 * A cache to access the tile images.
 *
 * It's created by {@link PixiTileMapHelper.parseAtlas}
 * and used by {@link PixiTileMapHelper.updatePixiTileMap}.
 */
var TileTextureCache = /** @class */ (function () {
    function TileTextureCache() {
        this._textures = new Map();
    }
    TileTextureCache.prototype.setTexture = function (tileId, flippedHorizontally, flippedVertically, flippedDiagonally, texture) {
        var globalTileUid = this._getGlobalId(tileId, flippedHorizontally, flippedVertically, flippedDiagonally);
        this._textures.set(globalTileUid, texture);
    };
    /**
     * Return the texture to use for the tile with the specified uid, which can contains
     * information about rotation in bits 32, 31 and 30
     * (see https://doc.mapeditor.org/en/stable/reference/tmx-map-format/).
     *
     * @param tileId The tile identifier
     * @param flippedHorizontally
     * @param flippedVertically
     * @param flippedDiagonally
     * @returns The texture for the given tile identifier and orientation.
     */
    TileTextureCache.prototype.findTileTexture = function (tileId, flippedHorizontally, flippedVertically, flippedDiagonally) {
        var globalTileUid = this._getGlobalId(tileId, flippedHorizontally, flippedVertically, flippedDiagonally);
        if (globalTileUid === 0)
            return undefined;
        if (this._textures.has(globalTileUid)) {
            return this._textures.get(globalTileUid);
        }
        // If the texture is not in the cache, it's potentially because its ID
        // is a flipped/rotated version of another ID.
        var unflippedTexture = this._textures.get(tileId);
        // If the tile still can't be found in the cache, it means the ID we got
        // is invalid.
        if (!unflippedTexture)
            return undefined;
        // Clone the unflipped texture and save it in the cache
        var frame = unflippedTexture.frame.clone();
        var orig = unflippedTexture.orig.clone();
        if (flippedDiagonally) {
            var width = orig.width;
            orig.width = orig.height;
            orig.height = width;
        }
        var trim = orig.clone();
        // Get the rotation "D8" number.
        // See https://pixijs.io/examples/#/textures/texture-rotate.js
        var rotate = 0;
        if (flippedDiagonally) {
            rotate = 10;
            if (!flippedHorizontally && flippedVertically) {
                rotate = 2;
            }
            else if (flippedHorizontally && !flippedVertically) {
                rotate = 6;
            }
            else if (flippedHorizontally && flippedVertically) {
                rotate = 14;
            }
        }
        else {
            rotate = 0;
            if (!flippedHorizontally && flippedVertically) {
                rotate = 8;
            }
            else if (flippedHorizontally && !flippedVertically) {
                rotate = 12;
            }
            else if (flippedHorizontally && flippedVertically) {
                rotate = 4;
            }
        }
        var flippedTexture = new PIXI.Texture(unflippedTexture.baseTexture, frame, orig, trim, rotate);
        this._textures.set(globalTileUid, flippedTexture);
        return flippedTexture;
    };
    TileTextureCache.prototype._getGlobalId = function (tileId, flippedHorizontally, flippedVertically, flippedDiagonally) {
        var globalTileUid = tileId;
        if (flippedHorizontally) {
            globalTileUid |= TileTextureCache.flippedHorizontallyFlag;
        }
        if (flippedVertically) {
            globalTileUid |= TileTextureCache.flippedVerticallyFlag;
        }
        if (flippedDiagonally) {
            globalTileUid |= TileTextureCache.flippedDiagonallyFlag;
        }
        return globalTileUid;
    };
    TileTextureCache.flippedHorizontallyFlag = 0x80000000;
    TileTextureCache.flippedVerticallyFlag = 0x40000000;
    TileTextureCache.flippedDiagonallyFlag = 0x20000000;
    return TileTextureCache;
}());

var PixiTileMapHelper = /** @class */ (function () {
    function PixiTileMapHelper() {
    }
    /**
     * Parse a Tiled map JSON file,
     * exported from Tiled (https://www.mapeditor.org/)
     * into a generic tile map data (`GenericPixiTileMapData`).
     *
     * @param tiledData A JS object representing a map exported from Tiled.
     * @param atlasTexture
     * @param getTexture A getter to load a texture. Used if atlasTexture is not specified.
     * @returns A textures cache.
     */
    PixiTileMapHelper.parseAtlas = function (tiledData, atlasTexture, getTexture) {
        if (!tiledData.tiledversion) {
            console.warn("The loaded Tiled map does not contain a 'tiledversion' key. Are you sure this file has been exported from Tiled (mapeditor.org)?");
            return null;
        }
        // We only handle tileset embedded in the tilemap. Warn if it's not the case.
        if (!tiledData.tilesets.length || "source" in tiledData.tilesets[0]) {
            console.warn("The loaded Tiled map seems not to contain any tileset data (nothing in 'tilesets' key).");
            return null;
        }
        var _a = tiledData.tilesets[0], tilewidth = _a.tilewidth, tileheight = _a.tileheight, tilecount = _a.tilecount; _a.tiles; var image = _a.image, columns = _a.columns, spacing = _a.spacing, margin = _a.margin;
        if (!atlasTexture)
            atlasTexture = getTexture(image);
        // We try to detect what size Tiled is expecting.
        var rows = tilecount / columns;
        var expectedAtlasWidth = tilewidth * columns + spacing * (columns - 1) + margin * 2;
        var expectedAtlasHeight = tileheight * rows + spacing * (rows - 1) + margin * 2;
        if ((atlasTexture.width !== 1 && expectedAtlasWidth !== atlasTexture.width) ||
            (atlasTexture.height !== 1 && expectedAtlasHeight !== atlasTexture.height)) {
            var expectedSize = expectedAtlasWidth + "x" + expectedAtlasHeight;
            var actualSize = atlasTexture.width + "x" + atlasTexture.height;
            console.warn("It seems the atlas file was resized, which is not supported. It should be " +
                expectedSize +
                "px, but it's " +
                actualSize +
                " px.");
            return null;
        }
        // Prepare the textures pointing to the base "Atlas" Texture for each tile.
        // Note that this cache can be augmented later with rotated/flipped
        // versions of the tile textures.
        var textureCache = new TileTextureCache();
        for (var frame = 0; frame < tilecount; frame++) {
            var columnMultiplier = Math.floor(frame % columns);
            var rowMultiplier = Math.floor(frame / columns);
            var x = margin + columnMultiplier * (tilewidth + spacing);
            var y = margin + rowMultiplier * (tileheight + spacing);
            try {
                var rect = new PIXI.Rectangle(x, y, tilewidth, tileheight);
                var texture = new PIXI.Texture(atlasTexture, rect);
                textureCache.setTexture(frame, false, false, false, texture);
            }
            catch (error) {
                console.error("An error occurred while creating a PIXI.Texture to be used in a TileMap:", error);
            }
        }
        return textureCache;
    };
    /**
     * Re-renders the tilemap whenever its rendering settings have been changed
     *
     * @param pixiTileMap
     * @param tileMap
     * @param textureCache
     * @param displayMode What to display: only a single layer (`index`), only visible layers (`visible`) or everyhing (`all`).
     * @param layerIndex If `displayMode` is set to `index`, the layer index to be displayed.
     */
    PixiTileMapHelper.updatePixiTileMap = function (pixiTileMap, tileMap, textureCache, displayMode, layerIndex) {
        var e_1, _a, e_2, _b;
        if (!pixiTileMap)
            return;
        pixiTileMap.clear();
        try {
            for (var _c = __values(tileMap.getLayers()), _d = _c.next(); !_d.done; _d = _c.next()) {
                var layer = _d.value;
                if ((displayMode === "index" && layerIndex !== layer.id) ||
                    (displayMode === "visible" && !layer.isVisible())) {
                    return;
                }
                if (layer instanceof EditableObjectLayer) {
                    var objectLayer = layer;
                    try {
                        for (var _e = (e_2 = void 0, __values(objectLayer.objects)), _f = _e.next(); !_f.done; _f = _e.next()) {
                            var object = _f.value;
                            var texture = textureCache.findTileTexture(object.getTileId(), object.isFlippedHorizontally(), object.isFlippedVertically(), object.isFlippedDiagonally());
                            if (texture) {
                                pixiTileMap.addFrame(texture, object.x, object.y - objectLayer.tileMap.getTileHeight());
                            }
                        }
                    }
                    catch (e_2_1) { e_2 = { error: e_2_1 }; }
                    finally {
                        try {
                            if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
                        }
                        finally { if (e_2) throw e_2.error; }
                    }
                }
                else if (layer instanceof EditableTileMapLayer) {
                    var tileLayer = layer;
                    for (var y = 0; y < tileLayer.tileMap.getDimensionY(); y++) {
                        for (var x = 0; x < tileLayer.tileMap.getDimensionX(); x++) {
                            var tileWidth = tileLayer.tileMap.getTileWidth();
                            var xPos = tileWidth * x;
                            var yPos = tileLayer.tileMap.getTileHeight() * y;
                            var tileId = tileLayer.get(x, y);
                            var tileTexture = textureCache.findTileTexture(tileId, tileLayer.isFlippedHorizontally(x, y), tileLayer.isFlippedVertically(x, y), tileLayer.isFlippedDiagonally(x, y));
                            if (tileTexture) {
                                var pixiTilemapFrame = pixiTileMap.addFrame(tileTexture, xPos, yPos);
                                var tileDefinition = tileLayer.tileMap.getTileDefinition(tileId);
                                // Animated tiles have a limitation:
                                // they are only able to use frames arranged horizontally one next
                                // to each other on the atlas.
                                if (tileDefinition && tileDefinition.getAnimationLength() > 0) {
                                    pixiTilemapFrame.tileAnimX(tileWidth, tileDefinition.getAnimationLength());
                                }
                            }
                        }
                    }
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
            }
            finally { if (e_1) throw e_1.error; }
        }
    };
    /**
     * Re-renders the collision mask
     *
     * @param pixiTileMap
     * @param tileMap
     * @param textureCache
     * @param displayMode What to display: only a single layer (`index`), only visible layers (`visible`) or everyhing (`all`).
     * @param layerIndex If `displayMode` is set to `index`, the layer index to be displayed.
     */
    PixiTileMapHelper.updatePixiCollisionMask = function (pixiGraphics, tileMap, displayMode, layerIndex, typeFilter, outlineSize, outlineColor, outlineOpacity, fillColor, fillOpacity) {
        var e_3, _a, e_4, _b;
        if (!pixiGraphics)
            return;
        pixiGraphics.clear();
        try {
            for (var _c = __values(tileMap.getLayers()), _d = _c.next(); !_d.done; _d = _c.next()) {
                var layer = _d.value;
                if (displayMode === "index" && layerIndex !== layer.id)
                    return;
                // invisible doesn't mean no collision.
                // TODO add a "Enable" flag next to "Visible" or rename "Visible" to "Enable"?
                var tileWidth = tileMap.getTileWidth();
                var tileHeight = tileMap.getTileHeight();
                if (layer instanceof EditableTileMapLayer) {
                    var tileLayer = layer;
                    for (var y = 0; y < tileLayer.tileMap.getDimensionY(); y++) {
                        for (var x = 0; x < tileLayer.tileMap.getDimensionX(); x++) {
                            var xPos = tileWidth * x;
                            var yPos = tileHeight * y;
                            var tileId = tileLayer.get(x, y);
                            var isFlippedHorizontally = tileLayer.isFlippedHorizontally(x, y);
                            var isFlippedVertically = tileLayer.isFlippedVertically(x, y);
                            var isFlippedDiagonally = tileLayer.isFlippedDiagonally(x, y);
                            var tileDefinition = tileLayer.tileMap.getTileDefinition(tileId);
                            if (!tileDefinition || tileDefinition.getTag() !== typeFilter) {
                                continue;
                            }
                            pixiGraphics.lineStyle(outlineSize, outlineColor, outlineOpacity);
                            try {
                                for (var _e = (e_4 = void 0, __values(tileDefinition.getHiBoxes())), _f = _e.next(); !_f.done; _f = _e.next()) {
                                    var vertices = _f.value;
                                    if (vertices.length === 0)
                                        continue;
                                    pixiGraphics.beginFill(fillColor, fillOpacity);
                                    for (var index = 0; index < vertices.length; index++) {
                                        var vertexX = vertices[index][0];
                                        var vertexY = vertices[index][1];
                                        if (isFlippedHorizontally) {
                                            vertexX = tileWidth - vertexX;
                                        }
                                        if (isFlippedVertically) {
                                            vertexY = tileHeight - vertexY;
                                        }
                                        if (isFlippedDiagonally) {
                                            var swap = vertexX;
                                            vertexX = vertexY;
                                            vertexY = swap;
                                        }
                                        if (index === 0) {
                                            pixiGraphics.moveTo(xPos + vertexX, yPos + vertexY);
                                        }
                                        else {
                                            pixiGraphics.lineTo(xPos + vertexX, yPos + vertexY);
                                        }
                                    }
                                    pixiGraphics.closePath();
                                    pixiGraphics.endFill();
                                }
                            }
                            catch (e_4_1) { e_4 = { error: e_4_1 }; }
                            finally {
                                try {
                                    if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
                                }
                                finally { if (e_4) throw e_4.error; }
                            }
                        }
                    }
                }
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
            }
            finally { if (e_3) throw e_3.error; }
        }
    };
    return PixiTileMapHelper;
}());

/**
 * An holder to share tile maps across the 2 extension objects.
 *
 * Every instance with the same files path in properties will
 * share the same {@link EditableTileMap} and {@link TileTextureCache}.
 *
 * @see {@link TileMapRuntimeManager}
 */
var TileMapManager = /** @class */ (function () {
    /**
     *
     */
    function TileMapManager() {
        this._tileMapCache = new ResourceCache();
        this._textureCacheCaches = new ResourceCache();
    }
    /**
     * @param instanceHolder Where to set the manager instance.
     * @returns The shared manager.
     */
    TileMapManager.getManager = function (instanceHolder) {
        // @ts-ignore
        if (!instanceHolder.tileMapCollisionMaskManager) {
            //Create the shared manager if necessary.
            // @ts-ignore
            instanceHolder.tileMapCollisionMaskManager = new TileMapManager();
        }
        // @ts-ignore
        return instanceHolder.tileMapCollisionMaskManager;
    };
    /**
     * @param loadTiledMap The method that loads the Tiled JSON file in memory.
     * @param tilemapJsonFile
     * @param tilesetJsonFile
     * @param pako The zlib library.
     * @param callback
     */
    TileMapManager.prototype.getOrLoadTileMap = function (loadTiledMap, tilemapJsonFile, tilesetJsonFile, pako, callback) {
        var key = tilemapJsonFile + "|" + tilesetJsonFile;
        this._tileMapCache.getOrLoad(key, function (callback) {
            loadTiledMap(tilemapJsonFile, tilesetJsonFile, function (tiledMap) {
                if (!tiledMap) {
                    callback(null);
                    return;
                }
                var collisionTileMap = TiledTileMapLoader.load(pako, tiledMap);
                callback(collisionTileMap);
            });
        }, callback);
    };
    /**
     * @param loadTiledMap The method that loads the Tiled JSON file in memory.
     * @param getTexture The method that loads the atlas image file in memory.
     * @param atlasImageResourceName
     * @param tilemapJsonFile
     * @param tilesetJsonFile
     * @param callback
     */
    TileMapManager.prototype.getOrLoadTextureCache = function (loadTiledMap, getTexture, atlasImageResourceName, tilemapJsonFile, tilesetJsonFile, callback) {
        var key = tilemapJsonFile + "|" + tilesetJsonFile + "|" + atlasImageResourceName;
        this._textureCacheCaches.getOrLoad(key, function (callback) {
            loadTiledMap(tilemapJsonFile, tilesetJsonFile, function (tiledMap) {
                if (!tiledMap) {
                    // loadTiledMap already log errors.
                    callback(null);
                    return;
                }
                var atlasTexture = atlasImageResourceName
                    ? getTexture(atlasImageResourceName)
                    : null;
                var textureCache = PixiTileMapHelper.parseAtlas(tiledMap, atlasTexture, getTexture);
                callback(textureCache);
            });
        }, callback);
    };
    return TileMapManager;
}());

export { EditableTileMap, EditableTileMapLayer, PixiTileMapHelper, TileDefinition, TileMapManager, TileTextureCache };
