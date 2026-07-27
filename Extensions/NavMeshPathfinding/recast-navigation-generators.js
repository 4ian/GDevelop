(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.RecastNav = {}));
})(this, (function (exports) { 'use strict';

  /**
   * Lower level bindings for the Recast and Detour libraries.
   *
   * The `init` function must be called before using the `Raw` api.
   */
  const Raw = {
    isNull: obj => {
      return Raw.Module.getPointer(obj) === 0;
    },
    destroy: obj => {
      Raw.Module.destroy(obj);
    }
  };
  const Recast = {};
  const Detour = {};

  class BaseArray {
    get size() {
      return this.raw.size;
    }
    constructor(raw) {
      this.raw = raw;
    }
    get(i) {
      return this.raw.get(i);
    }
    set(i, value) {
      this.raw.set(i, value);
    }
    resize(size) {
      this.raw.resize(size);
    }
    copy(data) {
      this.raw.resize(data.length);
      const view = this.getHeapView();
      view.set(data);
    }
    destroy() {
      Raw.destroy(this.raw);
    }
    getHeapView() {
      const heap = this.getHeap();
      return new this.ArrayConstructor(heap.buffer, this.raw.getDataPointer(), this.size);
    }
    toTypedArray() {
      const view = this.getHeapView();
      const data = new this.ArrayConstructor(new ArrayBuffer(this.size * view.BYTES_PER_ELEMENT), 0, this.size);
      data.set(view);
      return data;
    }
  }
  class IntArray extends BaseArray {
    ArrayConstructor = Int32Array;
    constructor(raw) {
      super(raw ?? new Raw.Module.IntArray());
    }
    getHeap() {
      return Raw.Module.HEAP32;
    }
    static fromRaw(raw) {
      return new IntArray(raw);
    }
  }
  class UnsignedCharArray extends BaseArray {
    ArrayConstructor = Uint8Array;
    constructor(raw) {
      super(raw ?? new Raw.Module.UnsignedCharArray());
    }
    getHeap() {
      return Raw.Module.HEAPU8;
    }
    static fromRaw(raw) {
      return new UnsignedCharArray(raw);
    }
  }
  class UnsignedShortArray extends BaseArray {
    ArrayConstructor = Uint16Array;
    constructor(raw) {
      super(raw ?? new Raw.Module.UnsignedShortArray());
    }
    getHeap() {
      return Raw.Module.HEAPU16;
    }
    static fromRaw(raw) {
      return new UnsignedShortArray(raw);
    }
  }
  class FloatArray extends BaseArray {
    ArrayConstructor = Float32Array;
    constructor(raw) {
      super(raw ?? new Raw.Module.FloatArray());
    }
    getHeap() {
      return Raw.Module.HEAPF32;
    }
    static fromRaw(raw) {
      return new FloatArray(raw);
    }
  }
  const VerticesArray = FloatArray;
  const TrianglesArray = IntArray;
  const TriangleAreasArray = UnsignedCharArray;
  const ChunkIdsArray = IntArray;
  const TileCacheData = UnsignedCharArray;

  const vec3 = {
    toRaw: ({
      x,
      y,
      z
    }, existing) => {
      if (existing) {
        existing.x = x;
        existing.y = y;
        existing.z = z;
        return existing;
      }
      return new Raw.Module.Vec3(x, y, z);
    },
    fromRaw: vec3 => {
      const {
        x,
        y,
        z
      } = vec3;
      return {
        x,
        y,
        z
      };
    },
    fromArray: ([x, y, z]) => {
      return {
        x,
        y,
        z
      };
    },
    toArray: ({
      x,
      y,
      z
    }) => {
      return [x, y, z];
    },
    lerp: (a, b, t, out = {
      x: 0,
      y: 0,
      z: 0
    }) => {
      out.x = a.x + (b.x - a.x) * t;
      out.y = a.y + (b.y - a.y) * t;
      out.z = a.z + (b.z - a.z) * t;
    },
    copy: (source, out = {
      x: 0,
      y: 0,
      z: 0
    }) => {
      out.x = source.x;
      out.y = source.y;
      out.z = source.z;
    }
  };
  const array = (getter, count) => {
    const array = [];
    for (let i = 0; i < count; i++) {
      array.push(getter(i));
    }
    return array;
  };

  const statusSucceed = status => {
    return Raw.Detour.statusSucceed(status);
  };
  const statusFailed = status => {
    return Raw.Detour.statusFailed(status);
  };
  const statusToReadableString = status => {
    if (Raw.Detour.statusSucceed(status)) {
      return 'success';
    }
    if (Raw.Detour.statusInProgress(status)) {
      return 'in progress';
    }
    if (Raw.Detour.statusFailed(status)) {
      let reason;
      const DT_STATUS_REASONS = {
        DT_WRONG_MAGIC: Detour.DT_WRONG_MAGIC,
        DT_WRONG_VERSION: Detour.DT_WRONG_VERSION,
        DT_OUT_OF_MEMORY: Detour.DT_OUT_OF_MEMORY,
        DT_INVALID_PARAM: Detour.DT_INVALID_PARAM,
        DT_BUFFER_TOO_SMALL: Detour.DT_BUFFER_TOO_SMALL,
        DT_OUT_OF_NODES: Detour.DT_OUT_OF_NODES,
        DT_PARTIAL_RESULT: Detour.DT_PARTIAL_RESULT,
        DT_ALREADY_OCCUPIED: Detour.DT_ALREADY_OCCUPIED
      };
      for (const [reasonName, reasonMask] of Object.entries(DT_STATUS_REASONS)) {
        if (Raw.Detour.statusDetail(status, reasonMask)) {
          reason = reasonName;
          break;
        }
      }
      if (reason) {
        return `failed - ${reason}`;
      }
      return `failed - unknown`;
    }
    return 'unknown';
  };
  class DetourPolyDetail {
    constructor(raw) {
      this.raw = raw;
    }
    vertBase() {
      return this.raw.vertBase;
    }
    triBase() {
      return this.raw.triBase;
    }
    vertCount() {
      return this.raw.vertCount;
    }
    triCount() {
      return this.raw.triCount;
    }
  }
  class DetourLink {
    constructor(raw) {
      this.raw = raw;
    }
    ref() {
      return this.raw.ref;
    }
    next() {
      return this.raw.next;
    }
    edge() {
      return this.raw.edge;
    }
    side() {
      return this.raw.side;
    }
    bmin() {
      return this.raw.bmin;
    }
    bmax() {
      return this.raw.bmax;
    }
  }
  class DetourBVNode {
    constructor(raw) {
      this.raw = raw;
    }
    bmin() {
      return vec3.fromArray(array(i => this.raw.get_bmin(i), 3));
    }
    bmax() {
      return vec3.fromArray(array(i => this.raw.get_bmax(i), 3));
    }
    i() {
      return this.raw.i;
    }
  }
  class DetourOffMeshConnection {
    constructor(raw) {
      this.raw = raw;
    }
    pos(index) {
      return this.raw.get_pos(index);
    }
    rad() {
      return this.raw.rad;
    }
    poly() {
      return this.raw.poly;
    }
    flags() {
      return this.raw.flags;
    }
    side() {
      return this.raw.side;
    }
    userId() {
      return this.raw.userId;
    }
  }
  class DetourMeshHeader {
    constructor(raw) {
      this.raw = raw;
    }
    magic() {
      return this.raw.magic;
    }
    version() {
      return this.raw.version;
    }
    x() {
      return this.raw.x;
    }
    y() {
      return this.raw.y;
    }
    layer() {
      return this.raw.layer;
    }
    userId() {
      return this.raw.userId;
    }
    polyCount() {
      return this.raw.polyCount;
    }
    vertCount() {
      return this.raw.vertCount;
    }
    maxLinkCount() {
      return this.raw.maxLinkCount;
    }
    detailMeshCount() {
      return this.raw.detailMeshCount;
    }
    detailVertCount() {
      return this.raw.detailVertCount;
    }
    detailTriCount() {
      return this.raw.detailTriCount;
    }
    bvNodeCount() {
      return this.raw.bvNodeCount;
    }
    offMeshConCount() {
      return this.raw.offMeshConCount;
    }
    offMeshBase() {
      return this.raw.offMeshBase;
    }
    walkableHeight() {
      return this.raw.walkableHeight;
    }
    walkableRadius() {
      return this.raw.walkableRadius;
    }
    walkableClimb() {
      return this.raw.walkableClimb;
    }
    bmin(index) {
      return this.raw.get_bmin(index);
    }
    bmax(index) {
      return this.raw.get_bmax(index);
    }
    bvQuantFactor() {
      return this.raw.bvQuantFactor;
    }
  }
  class DetourPoly {
    constructor(raw) {
      this.raw = raw;
    }
    firstLink() {
      return this.raw.firstLink;
    }
    verts(index) {
      return this.raw.get_verts(index);
    }
    neis(index) {
      return this.raw.get_neis(index);
    }
    flags() {
      return this.raw.flags;
    }
    vertCount() {
      return this.raw.vertCount;
    }
    areaAndType() {
      return this.raw.get_areaAndtype();
    }
    getType() {
      return this.raw.getType();
    }
  }
  class DetourMeshTile {
    constructor(raw) {
      this.raw = raw;
    }
    salt() {
      return this.raw.salt;
    }
    linksFreeList() {
      return this.raw.linksFreeList;
    }
    header() {
      return !Raw.isNull(this.raw.header) ? new DetourMeshHeader(this.raw.header) : null;
    }
    polys(index) {
      return new DetourPoly(this.raw.get_polys(index));
    }
    verts(index) {
      return this.raw.get_verts(index);
    }
    links(index) {
      return new DetourLink(this.raw.get_links(index));
    }
    detailMeshes(index) {
      return new DetourPolyDetail(this.raw.get_detailMeshes(index));
    }
    detailVerts(index) {
      return this.raw.get_detailVerts(index);
    }
    detailTris(index) {
      return this.raw.get_detailTris(index);
    }
    bvTree(index) {
      return new DetourBVNode(this.raw.get_bvTree(index));
    }
    offMeshCons(index) {
      return new DetourOffMeshConnection(this.raw.get_offMeshCons(index));
    }
    data(index) {
      return this.raw.get_data(index);
    }
    dataSize() {
      return this.raw.dataSize;
    }
    flags() {
      return this.raw.flags;
    }
    next() {
      return new DetourMeshTile(this.raw.next);
    }
  }
  const createNavMeshData = navMeshCreateParams => {
    const result = Raw.DetourNavMeshBuilder.createNavMeshData(navMeshCreateParams.raw);
    return {
      success: result.success,
      navMeshData: UnsignedCharArray.fromRaw(result.navMeshData)
    };
  };
  class NavMeshCreateParams {
    constructor(raw) {
      this.raw = raw ?? new Raw.Module.dtNavMeshCreateParams();
    }
    setPolyMeshCreateParams(polyMesh) {
      Raw.DetourNavMeshBuilder.setPolyMeshCreateParams(this.raw, polyMesh.raw);
    }
    setPolyMeshDetailCreateParams(polyMeshDetail) {
      Raw.DetourNavMeshBuilder.setPolyMeshDetailCreateParams(this.raw, polyMeshDetail.raw);
    }
    setOffMeshConnections(offMeshConnections) {
      if (offMeshConnections.length <= 0) return;
      const verts = [];
      const rads = [];
      const dir = [];
      const areas = [];
      const flags = [];
      const userIds = [];
      for (let i = 0; i < offMeshConnections.length; i++) {
        const connection = offMeshConnections[i];
        verts.push(connection.startPosition.x, connection.startPosition.y, connection.startPosition.z);
        verts.push(connection.endPosition.x, connection.endPosition.y, connection.endPosition.z);
        rads.push(connection.radius);
        dir.push(connection.bidirectional ? 1 : 0);
        areas.push(connection.area ?? 0);
        flags.push(connection.flags ?? 1);
        userIds.push(connection.userId ?? 1000 + i);
      }
      Raw.DetourNavMeshBuilder.setOffMeshConnections(this.raw, offMeshConnections.length, verts, rads, dir, areas, flags, userIds);
    }
    verts(index) {
      return this.raw.get_verts(index);
    }
    setVerts(index, value) {
      this.raw.set_verts(index, value);
    }
    vertCount() {
      return this.raw.vertCount;
    }
    polys(index) {
      return this.raw.get_polys(index);
    }
    setPolys(index, value) {
      this.raw.set_polys(index, value);
    }
    polyAreas(index) {
      return this.raw.get_polyAreas(index);
    }
    setPolyAreas(index, value) {
      this.raw.set_polyAreas(index, value);
    }
    polyFlags(index) {
      return this.raw.get_polyFlags(index);
    }
    setPolyFlags(index, value) {
      this.raw.set_polyFlags(index, value);
    }
    polyCount() {
      return this.raw.polyCount;
    }
    nvp() {
      return this.raw.nvp;
    }
    setNvp(value) {
      this.raw.nvp = value;
    }
    detailMeshes(index) {
      return this.raw.get_detailMeshes(index);
    }
    setDetailMeshes(index, value) {
      this.raw.set_detailMeshes(index, value);
    }
    detailVerts(index) {
      return this.raw.get_detailVerts(index);
    }
    setDetailVerts(index, value) {
      this.raw.set_detailVerts(index, value);
    }
    detailVertsCount() {
      return this.raw.detailVertsCount;
    }
    detailTris(index) {
      return this.raw.get_detailTris(index);
    }
    setDetailTris(index, value) {
      this.raw.set_detailTris(index, value);
    }
    detailTriCount() {
      return this.raw.detailTriCount;
    }
    offMeshConVerts(index) {
      return this.raw.get_offMeshConVerts(index);
    }
    offMeshConRad(index) {
      return this.raw.get_offMeshConRad(index);
    }
    offMeshConDir(index) {
      return this.raw.get_offMeshConDir(index);
    }
    offMeshConAreas(index) {
      return this.raw.get_offMeshConAreas(index);
    }
    offMeshConFlags(index) {
      return this.raw.get_offMeshConFlags(index);
    }
    offMeshConUserID(index) {
      return this.raw.get_offMeshConUserID(index);
    }
    offMeshConCount() {
      return this.raw.offMeshConCount;
    }
    userId() {
      return this.raw.userId;
    }
    tileX() {
      return this.raw.tileX;
    }
    setTileX(value) {
      this.raw.tileX = value;
    }
    tileY() {
      return this.raw.tileY;
    }
    setTileY(value) {
      this.raw.tileY = value;
    }
    tileLayer() {
      return this.raw.tileLayer;
    }
    setTileLayer(value) {
      this.raw.tileLayer = value;
    }
    boundsMin() {
      return array(i => this.raw.get_bmin(i), 3);
    }
    setBoundsMin(value) {
      this.raw.set_bmin(0, value[0]);
      this.raw.set_bmin(1, value[1]);
      this.raw.set_bmin(2, value[2]);
    }
    boundsMax() {
      return array(i => this.raw.get_bmax(i), 3);
    }
    setBoundsMax(value) {
      this.raw.set_bmax(0, value[0]);
      this.raw.set_bmax(1, value[1]);
      this.raw.set_bmax(2, value[2]);
    }
    walkableHeight() {
      return this.raw.walkableHeight;
    }
    setWalkableHeight(value) {
      this.raw.walkableHeight = value;
    }
    walkableRadius() {
      return this.raw.walkableRadius;
    }
    setWalkableRadius(value) {
      this.raw.walkableRadius = value;
    }
    walkableClimb() {
      return this.raw.walkableClimb;
    }
    setWalkableClimb(value) {
      this.raw.walkableClimb = value;
    }
    cellSize() {
      return this.raw.cs;
    }
    setCellSize(value) {
      this.raw.cs = value;
    }
    cellHeight() {
      return this.raw.ch;
    }
    setCellHeight(value) {
      this.raw.ch = value;
    }
    buildBvTree() {
      return this.raw.buildBvTree;
    }
    setBuildBvTree(value) {
      this.raw.buildBvTree = value;
    }
  }

  class NavMeshGetTilesAtResult {
    constructor(raw) {
      this.raw = raw;
    }
    tiles(index) {
      return new DetourMeshTile(this.raw.get_tiles(index));
    }
    tileCount() {
      return this.raw.tileCount;
    }
  }
  class NavMeshRemoveTileResult {
    constructor(raw) {
      this.raw = raw;
    }
    data() {
      return array(i => this.raw.get_data(i), this.raw.dataSize);
    }
    dataSize() {
      return this.raw.dataSize;
    }
  }
  class NavMeshCalcTileLocResult {
    constructor(raw) {
      this.raw = raw;
    }
    tileX() {
      return this.raw.tileX;
    }
    tileY() {
      return this.raw.tileY;
    }
  }
  class NavMeshStoreTileStateResult {
    constructor(raw) {
      this.raw = raw;
    }
    data() {
      return array(i => this.raw.get_data(i), this.raw.dataSize);
    }
    dataSize() {
      return this.raw.dataSize;
    }
  }
  class NavMeshParams {
    constructor(raw) {
      this.raw = raw;
    }
    static create(params) {
      const raw = new Raw.Module.dtNavMeshParams();
      raw.set_orig(0, params.orig.x);
      raw.set_orig(1, params.orig.y);
      raw.set_orig(2, params.orig.z);
      raw.tileWidth = params.tileWidth;
      raw.tileHeight = params.tileHeight;
      raw.maxTiles = params.maxTiles;
      raw.maxPolys = params.maxPolys;
      return new NavMeshParams(raw);
    }
    clone() {
      return NavMeshParams.create({
        orig: {
          x: this.raw.get_orig(0),
          y: this.raw.get_orig(1),
          z: this.raw.get_orig(2)
        },
        tileWidth: this.raw.tileWidth,
        tileHeight: this.raw.tileHeight,
        maxTiles: this.raw.maxTiles,
        maxPolys: this.raw.maxPolys
      });
    }
  }
  class NavMesh {
    constructor(raw) {
      this.raw = raw ?? new Raw.Module.NavMesh();
    }
    /**
     * Initializes the NavMesh for use with a single tile.
     * @param navMeshData the nav mesh data
     * @returns the status of the operation
     */
    initSolo(navMeshData) {
      return this.raw.initSolo(navMeshData.raw);
    }
    /**
     * Initializes the NavMesh for use with multiple tiles.
     * @param params parameters for the NavMesh
     * @returns the status of the operation
     */
    initTiled(params) {
      return this.raw.initTiled(params.raw);
    }
    /**
     * Adds a tile to the NavMesh.
     * @param navMeshData the nav mesh data
     * @param flags the flags to use when building the nav mesh
     * @param lastRef
     * @returns the status of the operation and the reference of the added tile
     */
    addTile(navMeshData, flags, lastRef) {
      const tileRefRaw = new Raw.UnsignedIntRef();
      const status = this.raw.addTile(navMeshData.raw, flags, lastRef, tileRefRaw);
      const tileRef = tileRefRaw.value;
      Raw.destroy(tileRefRaw);
      return {
        status,
        tileRef
      };
    }
    /**
     * Decodes a standard polygon reference.
     * @param polyRef The polygon reference to decode
     * @returns the decoded polygon reference
     */
    decodePolyId(polyRef) {
      const saltRef = new Raw.UnsignedIntRef();
      const itRef = new Raw.UnsignedIntRef();
      const ipRef = new Raw.UnsignedIntRef();
      this.raw.decodePolyId(polyRef, saltRef, itRef, ipRef);
      const tileSalt = saltRef.value;
      Raw.destroy(saltRef);
      const tileIndex = itRef.value;
      Raw.destroy(itRef);
      const tilePolygonIndex = ipRef.value;
      Raw.destroy(ipRef);
      return {
        tileSalt,
        tileIndex,
        tilePolygonIndex
      };
    }
    /**
     * Derives a standard polygon reference.
     * @param salt The tile's salt value.
     * @param tileIndex The index of the tile. `it` in the C++ api.
     * @param tilePolygonIndex The index of the polygon within the tile. `ip` in the C++ api.
     * @returns the derived polygon reference
     */
    encodePolyId(salt, tileIndex, tilePolygonIndex) {
      return this.raw.encodePolyId(salt, tileIndex, tilePolygonIndex);
    }
    /**
     * Removes a tile from the NavMesh
     * @param ref the tile ref
     * @returns the nav mesh data, so it can be added back later
     */
    removeTile(ref) {
      return new NavMeshRemoveTileResult(this.raw.removeTile(ref));
    }
    /**
     * Calculates the tile grid location for the specified world position.
     * @param pos The world position for the query. [(x, y, z)]
     * @returns
     */
    calcTileLoc(pos) {
      return new NavMeshCalcTileLocResult(this.raw.calcTileLoc(vec3.toArray(pos)));
    }
    /**
     * Gets the tile at the specified grid location.
     * @param x The tile's x-location. (x, y, layer)
     * @param y The tile's y-location. (x, y, layer)
     * @param layer The tile's layer. (x, y, layer)
     * @returns The tile, or null if the tile does not exist.
     */
    getTileAt(x, y, layer) {
      const tile = this.raw.getTileAt(x, y, layer);
      return !Raw.isNull(tile) ? new DetourMeshTile(tile) : null;
    }
    /**
     * Gets all tiles at the specified grid location. (All layers.)
     * @param x The tile's x-location. (x, y)
     * @param y The tile's y-location. (x, y)
     * @param maxTiles The maximum tiles the tiles parameter can hold.
     */
    getTilesAt(x, y, maxTiles) {
      return new NavMeshGetTilesAtResult(this.raw.getTilesAt(x, y, maxTiles));
    }
    /**
     * Gets the tile reference for the tile at specified grid location.
     * @param x The tile's x-location. (x, y, layer)
     * @param y The tile's y-location. (x, y, layer)
     * @param layer The tile's layer. (x, y, layer)
     * @returns The tile reference of the tile, or 0 if there is none.
     */
    getTileRefAt(x, y, layer) {
      return this.raw.getTileRefAt(x, y, layer);
    }
    /**
     * Gets the tile reference for the specified tile.
     * @param tile
     * @returns
     */
    getTileRef(tile) {
      return this.raw.getTileRef(tile.raw);
    }
    /**
     * Gets the tile for the specified tile reference.
     * @param ref The tile reference of the tile to retrieve.
     * @returns The tile for the specified reference, or null if the reference is invalid.
     */
    getTileByRef(ref) {
      const tile = this.raw.getTileByRef(ref);
      return !Raw.isNull(tile) ? new DetourMeshTile(tile) : null;
    }
    /**
     * Returns the maximum number of tiles supported by the navigation mesh.
     */
    getMaxTiles() {
      return this.raw.getMaxTiles();
    }
    /**
     * Gets the tile at the specified index.
     * @param i the tile index. [Limit: 0 >= index < #getMaxTiles()]
     * @returns
     */
    getTile(i) {
      return new DetourMeshTile(this.raw.getTile(i));
    }
    /**
     * Gets the tile and polygon for the specified polygon reference.
     * @param ref The reference for the a polygon.
     * @returns
     */
    getTileAndPolyByRef(ref) {
      const result = this.raw.getTileAndPolyByRef(ref);
      const tile = new DetourMeshTile(result.tile);
      const poly = new DetourPoly(result.poly);
      return {
        success: statusSucceed(result.status),
        status: result.status,
        tile,
        poly
      };
    }
    /**
     * Gets the tile and polygon for the specified polygon reference.
     * @param ref A known valid reference for a polygon.
     * @returns
     */
    getTileAndPolyByRefUnsafe(ref) {
      const result = this.raw.getTileAndPolyByRef(ref);
      const tile = new DetourMeshTile(result.tile);
      const poly = new DetourPoly(result.poly);
      return {
        tile,
        poly
      };
    }
    /**
     * Checks the validity of a polygon reference.
     * @param ref
     * @returns
     */
    isValidPolyRef(ref) {
      return this.raw.isValidPolyRef(ref);
    }
    /**
     * Gets the polygon reference for the tile's base polygon.
     * @param tile
     * @returns
     */
    getPolyRefBase(tile) {
      return this.raw.getPolyRefBase(tile.raw);
    }
    /**
     * Gets the endpoints for an off-mesh connection, ordered by "direction of travel".
     * @param prevRef The reference of the polygon before the connection.
     * @param polyRef The reference of the off-mesh connection polygon.
     * @returns
     */
    getOffMeshConnectionPolyEndPoints(prevRef, polyRef) {
      const startRaw = new Raw.Vec3();
      const endRaw = new Raw.Vec3();
      const status = this.raw.getOffMeshConnectionPolyEndPoints(prevRef, polyRef, startRaw, endRaw);
      const start = vec3.fromRaw(startRaw);
      Raw.destroy(startRaw);
      const end = vec3.fromRaw(endRaw);
      Raw.destroy(endRaw);
      return {
        success: statusSucceed(status),
        status,
        start,
        end
      };
    }
    /**
     * Gets the specified off-mesh connection.
     * @param ref The polygon reference of the off-mesh connection.
     * @returns
     */
    getOffMeshConnectionByRef(ref) {
      return new DetourOffMeshConnection(this.raw.getOffMeshConnectionByRef(ref));
    }
    /**
     * Sets the user defined flags for the specified polygon.
     * @param ref The polygon reference.
     * @param flags The new flags for the polygon.
     */
    setPolyFlags(ref, flags) {
      return this.raw.setPolyFlags(ref, flags);
    }
    /**
     * Gets the user defined flags for the specified polygon.
     * @param ref The polygon reference.
     * @returns
     */
    getPolyFlags(ref) {
      const flagsRaw = new Raw.UnsignedShortRef();
      const status = this.raw.getPolyFlags(ref, flagsRaw);
      const flags = flagsRaw.value;
      Raw.destroy(flagsRaw);
      return {
        status,
        flags
      };
    }
    /**
     * Sets the user defined area for the specified polygon.
     * @param ref The polygon reference.
     * @param flags The new flags for the polygon.
     */
    setPolyArea(ref, area) {
      return this.raw.setPolyArea(ref, area);
    }
    /**
     * Gets the user defined area for the specified polygon.
     * @param ref The polygon reference.
     * @returns
     */
    getPolyArea(ref) {
      const areaRaw = new Raw.UnsignedCharRef();
      const status = this.raw.getPolyArea(ref, areaRaw);
      const area = areaRaw.value;
      Raw.destroy(areaRaw);
      return {
        status,
        area
      };
    }
    /**
     * Gets the size of the buffer required by #storeTileState to store the specified tile's state.
     * @param tile
     * @returns The size of the buffer required to store the state.
     */
    getTileStateSize(tile) {
      return this.raw.getTileStateSize(tile.raw);
    }
    /**
     * Stores the non-structural state of the tile in the specified buffer. (Flags, area ids, etc.)
     * @param tile The tile.
     * @param maxDataSize The size of the data buffer. [Limit: >= #getTileStateSize]
     * @returns
     */
    storeTileState(tile, maxDataSize) {
      return new NavMeshStoreTileStateResult(this.raw.storeTileState(tile.raw, maxDataSize));
    }
    /**
     * Restores the state of the tile.
     * @param tile The tile.
     * @param data The new state. (Obtained from @see storeTileState)
     * @param maxDataSize The size of the state within the data buffer.
     * @returns
     */
    restoreTileState(tile, data, maxDataSize) {
      return this.raw.restoreTileState(tile.raw, data, maxDataSize);
    }
    /**
     * Destroys the NavMesh.
     */
    destroy() {
      this.raw.destroy();
      Raw.Module.destroy(this.raw);
    }
  }

  const recastConfigDefaults = {
    borderSize: 0,
    tileSize: 0,
    cs: 0.2,
    ch: 0.2,
    walkableSlopeAngle: 60,
    walkableHeight: 2,
    walkableClimb: 2,
    walkableRadius: 0.5,
    maxEdgeLen: 12,
    maxSimplificationError: 1.3,
    minRegionArea: 8,
    mergeRegionArea: 20,
    maxVertsPerPoly: 6,
    detailSampleDist: 6,
    detailSampleMaxError: 1
  };
  const createRcConfig = partialConfig => {
    const config = {
      ...recastConfigDefaults,
      ...partialConfig
    };
    const rcConfig = new Raw.Module.rcConfig();
    rcConfig.borderSize = config.borderSize;
    rcConfig.tileSize = config.tileSize;
    rcConfig.cs = config.cs;
    rcConfig.ch = config.ch;
    rcConfig.walkableSlopeAngle = config.walkableSlopeAngle;
    rcConfig.walkableHeight = config.walkableHeight;
    rcConfig.walkableClimb = config.walkableClimb;
    rcConfig.walkableRadius = config.walkableRadius;
    rcConfig.maxEdgeLen = config.maxEdgeLen;
    rcConfig.maxSimplificationError = config.maxSimplificationError;
    rcConfig.minRegionArea = config.minRegionArea;
    rcConfig.mergeRegionArea = config.mergeRegionArea;
    rcConfig.maxVertsPerPoly = config.maxVertsPerPoly;
    rcConfig.detailSampleDist = config.detailSampleDist;
    rcConfig.detailSampleMaxError = config.detailSampleMaxError;
    return rcConfig;
  };
  const cloneRcConfig = rcConfig => {
    const clone = new Raw.Module.rcConfig();
    clone.set_bmin(0, rcConfig.get_bmin(0));
    clone.set_bmin(1, rcConfig.get_bmin(1));
    clone.set_bmin(2, rcConfig.get_bmin(2));
    clone.set_bmax(0, rcConfig.get_bmax(0));
    clone.set_bmax(1, rcConfig.get_bmax(1));
    clone.set_bmax(2, rcConfig.get_bmax(2));
    clone.width = rcConfig.width;
    clone.height = rcConfig.height;
    clone.borderSize = rcConfig.borderSize;
    clone.tileSize = rcConfig.tileSize;
    clone.cs = rcConfig.cs;
    clone.ch = rcConfig.ch;
    clone.walkableSlopeAngle = rcConfig.walkableSlopeAngle;
    clone.walkableHeight = rcConfig.walkableHeight;
    clone.walkableClimb = rcConfig.walkableClimb;
    clone.walkableRadius = rcConfig.walkableRadius;
    clone.maxEdgeLen = rcConfig.maxEdgeLen;
    clone.maxSimplificationError = rcConfig.maxSimplificationError;
    clone.minRegionArea = rcConfig.minRegionArea;
    clone.mergeRegionArea = rcConfig.mergeRegionArea;
    clone.maxVertsPerPoly = rcConfig.maxVertsPerPoly;
    clone.detailSampleDist = rcConfig.detailSampleDist;
    clone.detailSampleMaxError = rcConfig.detailSampleMaxError;
    return clone;
  };
  class RecastBuildContext {
    logs = [];
    startTimes = {};
    accumulatedTimes = {};
    constructor(timersAndLogsEnabled = true) {
      const impl = new Raw.Module.RecastBuildContextJsImpl();
      impl.log = (category, msg, len) => {
        if (!this.raw.logEnabled()) return;
        // type is string, but webidl binder passes us a pointer
        const msgPointer = msg;
        const view = new Uint8Array(Raw.Module.HEAPU8.buffer, msgPointer, len);
        const data = new Uint8Array(len);
        data.set(view);
        const msgString = new TextDecoder().decode(data);
        this.log(category, msgString);
      };
      impl.resetLog = () => {
        this.resetLog();
      };
      impl.startTimer = label => {
        if (!this.raw.timerEnabled()) return;
        this.startTimer(label);
      };
      impl.stopTimer = label => {
        if (!this.raw.timerEnabled()) return;
        this.stopTimer(label);
      };
      impl.getAccumulatedTime = label => {
        if (!this.raw.timerEnabled()) return -1;
        return this.getAccumulatedTime(label);
      };
      impl.resetTimers = () => {
        if (!this.raw.timerEnabled()) return;
        this.startTimes = {};
        this.accumulatedTimes = {};
      };
      this.raw = new Raw.Module.RecastBuildContext(impl);
      this.raw.enableTimer(timersAndLogsEnabled);
      this.raw.enableLog(timersAndLogsEnabled);
      this.resetTimers();
    }
    log(category, msg) {
      this.logs.push({
        category,
        msg
      });
    }
    resetLog() {
      this.logs = [];
    }
    startTimer(label) {
      this.startTimes[label] = performance.now();
    }
    stopTimer(label) {
      const endTime = performance.now();
      const deltaTime = endTime - this.startTimes[label];
      if (this.accumulatedTimes[label] === -1) {
        this.accumulatedTimes[label] = deltaTime;
      } else {
        this.accumulatedTimes[label] += deltaTime;
      }
    }
    getAccumulatedTime(label) {
      return this.accumulatedTimes[label];
    }
    resetTimers() {
      for (let i = 0; i < Recast.RC_MAX_TIMERS; i++) {
        this.startTimes[i] = -1;
        this.accumulatedTimes[i] = -1;
      }
    }
  }
  class RecastChunkyTriMesh {
    constructor(raw) {
      this.raw = raw ?? new Raw.rcChunkyTriMesh();
    }
    init(verts, tris, ntris, trisPerChunk) {
      return Raw.ChunkyTriMeshUtils.createChunkyTriMesh(verts.raw, tris.raw, ntris, trisPerChunk, this.raw);
    }
    getChunksOverlappingRect(boundsMin, boundsMax, chunks, maxChunks) {
      return Raw.ChunkyTriMeshUtils.getChunksOverlappingRect(this.raw, boundsMin, boundsMax, chunks.raw, maxChunks);
    }
    getNodeTris(nodeId) {
      return IntArray.fromRaw(Raw.ChunkyTriMeshUtils.getChunkyTriMeshNodeTris(this.raw, nodeId));
    }
    nodes(index) {
      return this.raw.get_nodes(index);
    }
    maxTrisPerChunk() {
      return this.raw.maxTrisPerChunk;
    }
  }
  class RecastSpan {
    constructor(raw) {
      this.raw = raw;
    }
    smin() {
      return this.raw.smin;
    }
    smax() {
      return this.raw.smax;
    }
    area() {
      return this.raw.area;
    }
    next() {
      return !Raw.isNull(this.raw.next) ? new RecastSpan(this.raw.next) : null;
    }
  }
  class RecastSpanPool {
    constructor(raw) {
      this.raw = raw;
    }
    next() {
      return !Raw.isNull(this.raw.next) ? new RecastSpanPool(this.raw.next) : null;
    }
    items(index) {
      return new RecastSpan(this.raw.get_items(index));
    }
  }
  class RecastHeightfield {
    constructor(raw) {
      this.raw = raw;
    }
    width() {
      return this.raw.width;
    }
    height() {
      return this.raw.height;
    }
    bmin() {
      return vec3.fromArray(array(i => this.raw.get_bmin(i), 3));
    }
    bmax() {
      return vec3.fromArray(array(i => this.raw.get_bmax(i), 3));
    }
    cs() {
      return this.raw.cs;
    }
    ch() {
      return this.raw.ch;
    }
    spans(index) {
      return new RecastSpan(this.raw.get_spans(index));
    }
    pools(index) {
      return new RecastSpanPool(this.raw.get_pools(index));
    }
    freelist(index) {
      return new RecastSpan(this.raw.get_freelist(index));
    }
  }
  class RecastCompactCell {
    constructor(raw) {
      this.raw = raw;
    }
    index() {
      return this.raw.get_index();
    }
    count() {
      return this.raw.get_count();
    }
  }
  class RecastCompactSpan {
    constructor(raw) {
      this.raw = raw;
    }
    y() {
      return this.raw.get_y();
    }
    reg() {
      return this.raw.get_reg();
    }
    con() {
      return this.raw.get_con();
    }
    h() {
      return this.raw.get_h();
    }
  }
  class RecastCompactHeightfield {
    constructor(raw) {
      this.raw = raw;
    }
    width() {
      return this.raw.width;
    }
    height() {
      return this.raw.height;
    }
    spanCount() {
      return this.raw.spanCount;
    }
    walkableHeight() {
      return this.raw.walkableHeight;
    }
    walkableClimb() {
      return this.raw.walkableClimb;
    }
    borderSize() {
      return this.raw.borderSize;
    }
    maxDistance() {
      return this.raw.maxDistance;
    }
    maxRegions() {
      return this.raw.maxRegions;
    }
    bmin() {
      return vec3.fromArray(array(i => this.raw.get_bmin(i), 3));
    }
    bmax() {
      return vec3.fromArray(array(i => this.raw.get_bmax(i), 3));
    }
    cs() {
      return this.raw.cs;
    }
    ch() {
      return this.raw.ch;
    }
    cells(index) {
      return new RecastCompactCell(this.raw.get_cells(index));
    }
    spans(index) {
      return new RecastCompactSpan(this.raw.get_spans(index));
    }
    dist(index) {
      return this.raw.get_dist(index);
    }
    areas(index) {
      return this.raw.get_areas(index);
    }
  }
  class RecastContour {
    constructor(raw) {
      this.raw = raw;
    }
    verts(index) {
      return this.raw.get_verts(index);
    }
    nverts() {
      return this.raw.nverts;
    }
    rverts(index) {
      return this.raw.get_rverts(index);
    }
    nrverts() {
      return this.raw.nrverts;
    }
    reg() {
      return this.raw.reg;
    }
    area() {
      return this.raw.area;
    }
  }
  class RecastContourSet {
    constructor(raw) {
      this.raw = raw;
    }
    conts(index) {
      return new RecastContour(this.raw.get_conts(index));
    }
    nconts() {
      return this.raw.nconts;
    }
    bmin() {
      return vec3.fromArray(array(i => this.raw.get_bmin(i), 3));
    }
    bmax() {
      return vec3.fromArray(array(i => this.raw.get_bmax(i), 3));
    }
    cs() {
      return this.raw.cs;
    }
    ch() {
      return this.raw.ch;
    }
    width() {
      return this.raw.width;
    }
    height() {
      return this.raw.height;
    }
    borderSize() {
      return this.raw.borderSize;
    }
    maxError() {
      return this.raw.maxError;
    }
  }
  class RecastHeightfieldLayer {
    constructor(raw) {
      this.raw = raw;
    }
    bmin() {
      return vec3.fromArray(array(i => this.raw.get_bmin(i), 3));
    }
    bmax() {
      return vec3.fromArray(array(i => this.raw.get_bmax(i), 3));
    }
    cs() {
      return this.raw.cs;
    }
    ch() {
      return this.raw.ch;
    }
    width() {
      return this.raw.width;
    }
    height() {
      return this.raw.height;
    }
    minx() {
      return this.raw.minx;
    }
    maxx() {
      return this.raw.maxx;
    }
    miny() {
      return this.raw.miny;
    }
    maxy() {
      return this.raw.maxy;
    }
    hmin() {
      return this.raw.hmin;
    }
    hmax() {
      return this.raw.hmax;
    }
    heights(index) {
      return this.raw.get_heights(index);
    }
    areas(index) {
      return this.raw.get_areas(index);
    }
    cons(index) {
      return this.raw.get_cons(index);
    }
  }
  class RecastHeightfieldLayerSet {
    constructor(raw) {
      this.raw = raw;
    }
    layers(index) {
      return new RecastHeightfieldLayer(this.raw.get_layers(index));
    }
    nlayers() {
      return this.raw.nlayers;
    }
  }
  class RecastPolyMesh {
    constructor(raw) {
      this.raw = raw;
    }
    verts(index) {
      return this.raw.get_verts(index);
    }
    polys(index) {
      return this.raw.get_polys(index);
    }
    regs(index) {
      return this.raw.get_regs(index);
    }
    flags(index) {
      return this.raw.get_flags(index);
    }
    setFlags(index, value) {
      this.raw.set_flags(index, value);
    }
    areas(index) {
      return this.raw.get_areas(index);
    }
    setAreas(index, value) {
      this.raw.set_areas(index, value);
    }
    nverts() {
      return this.raw.nverts;
    }
    npolys() {
      return this.raw.npolys;
    }
    maxpolys() {
      return this.raw.maxpolys;
    }
    nvp() {
      return this.raw.nvp;
    }
    bmin() {
      return vec3.fromArray(array(i => this.raw.get_bmin(i), 3));
    }
    bmax() {
      return vec3.fromArray(array(i => this.raw.get_bmax(i), 3));
    }
    cs() {
      return this.raw.cs;
    }
    ch() {
      return this.raw.ch;
    }
    borderSize() {
      return this.raw.borderSize;
    }
    maxEdgeError() {
      return this.raw.maxEdgeError;
    }
  }
  class RecastPolyMeshDetail {
    constructor(raw) {
      this.raw = raw;
    }
    meshes(index) {
      return this.raw.get_meshes(index);
    }
    verts(index) {
      return this.raw.get_verts(index);
    }
    tris(index) {
      return this.raw.get_tris(index);
    }
    nmeshes() {
      return this.raw.nmeshes;
    }
    nverts() {
      return this.raw.nverts;
    }
    ntris() {
      return this.raw.ntris;
    }
  }
  const calcGridSize = (bmin, bmax, cs) => {
    return Raw.Recast.calcGridSize(bmin, bmax, cs);
  };
  const createHeightfield = (buildContext, heightfield, width, height, bmin, bmax, cs, ch) => {
    return Raw.Recast.createHeightfield(buildContext.raw, heightfield.raw, width, height, bmin, bmax, cs, ch);
  };
  const markWalkableTriangles = (buildContext, walkableSlopeAngle, verts, nv, tris, nt, areas) => {
    return Raw.Recast.markWalkableTriangles(buildContext.raw, walkableSlopeAngle, verts.raw, nv, tris.raw, nt, areas.raw);
  };
  const rasterizeTriangles = (buildContext, verts, nv, tris, areas, nt, heightfield, flagMergeThreshold = 1) => {
    return Raw.Recast.rasterizeTriangles(buildContext.raw, verts.raw, nv, tris.raw, areas.raw, nt, heightfield.raw, flagMergeThreshold);
  };
  const filterLowHangingWalkableObstacles = (buildContext, walkableClimb, heightfield) => {
    return Raw.Recast.filterLowHangingWalkableObstacles(buildContext.raw, walkableClimb, heightfield.raw);
  };
  const filterLedgeSpans = (buildContext, walkableHeight, walkableClimb, heightfield) => {
    return Raw.Recast.filterLedgeSpans(buildContext.raw, walkableHeight, walkableClimb, heightfield.raw);
  };
  const filterWalkableLowHeightSpans = (buildContext, walkableHeight, heightfield) => {
    return Raw.Recast.filterWalkableLowHeightSpans(buildContext.raw, walkableHeight, heightfield.raw);
  };
  const buildCompactHeightfield = (buildContext, walkableHeight, walkableClimb, heightfield, compactHeightfield) => {
    return Raw.Recast.buildCompactHeightfield(buildContext.raw, walkableHeight, walkableClimb, heightfield.raw, compactHeightfield.raw);
  };
  const erodeWalkableArea = (buildContext, radius, compactHeightfield) => {
    return Raw.Recast.erodeWalkableArea(buildContext.raw, radius, compactHeightfield.raw);
  };
  const buildDistanceField = (buildContext, compactHeightfield) => {
    return Raw.Recast.buildDistanceField(buildContext.raw, compactHeightfield.raw);
  };
  const buildRegions = (buildContext, compactHeightfield, borderSize, minRegionArea, mergeRegionArea) => {
    return Raw.Recast.buildRegions(buildContext.raw, compactHeightfield.raw, borderSize, minRegionArea, mergeRegionArea);
  };
  const buildHeightfieldLayers = (buildContext, compactHeightfield, borderSize, walkableHeight, heightfieldLayerSet) => {
    return Raw.Recast.buildHeightfieldLayers(buildContext.raw, compactHeightfield.raw, borderSize, walkableHeight, heightfieldLayerSet.raw);
  };
  const buildContours = (buildContext, compactHeightfield, maxError, maxEdgeLen, contourSet, buildFlags = Recast.RC_CONTOUR_TESS_WALL_EDGES) => {
    return Raw.Recast.buildContours(buildContext.raw, compactHeightfield.raw, maxError, maxEdgeLen, contourSet.raw, buildFlags);
  };
  const buildPolyMesh = (buildContext, contourSet, nvp, polyMesh) => {
    return Raw.Recast.buildPolyMesh(buildContext.raw, contourSet.raw, nvp, polyMesh.raw);
  };
  const buildPolyMeshDetail = (buildContext, mesh, compactHeightfield, sampleDist, sampleMaxError, polyMeshDetail) => {
    return Raw.Recast.buildPolyMeshDetail(buildContext.raw, mesh.raw, compactHeightfield.raw, sampleDist, sampleMaxError, polyMeshDetail.raw);
  };
  const getHeightfieldLayerHeights = heightfieldLayer => {
    return UnsignedCharArray.fromRaw(Raw.Recast.getHeightfieldLayerHeights(heightfieldLayer.raw));
  };
  const getHeightfieldLayerAreas = heightfieldLayer => {
    return UnsignedCharArray.fromRaw(Raw.Recast.getHeightfieldLayerAreas(heightfieldLayer.raw));
  };
  const getHeightfieldLayerCons = heightfieldLayer => {
    return UnsignedCharArray.fromRaw(Raw.Recast.getHeightfieldLayerCons(heightfieldLayer.raw));
  };
  const allocHeightfield = () => {
    return new RecastHeightfield(Raw.Recast.allocHeightfield());
  };
  const freeHeightfield = heightfield => {
    return Raw.Recast.freeHeightfield(heightfield.raw);
  };
  const allocCompactHeightfield = () => {
    return new RecastCompactHeightfield(Raw.Recast.allocCompactHeightfield());
  };
  const freeCompactHeightfield = compactHeightfield => {
    return Raw.Recast.freeCompactHeightfield(compactHeightfield.raw);
  };
  const allocHeightfieldLayerSet = () => {
    return new RecastHeightfieldLayerSet(Raw.Recast.allocHeightfieldLayerSet());
  };
  const freeHeightfieldLayerSet = heightfieldLayerSet => {
    return Raw.Recast.freeHeightfieldLayerSet(heightfieldLayerSet.raw);
  };
  const allocContourSet = () => {
    return new RecastContourSet(Raw.Recast.allocContourSet());
  };
  const freeContourSet = contourSet => {
    return Raw.Recast.freeContourSet(contourSet.raw);
  };
  const allocPolyMesh = () => {
    return new RecastPolyMesh(Raw.Recast.allocPolyMesh());
  };
  const freePolyMesh = polyMesh => {
    return Raw.Recast.freePolyMesh(polyMesh.raw);
  };
  const allocPolyMeshDetail = () => {
    return new RecastPolyMeshDetail(Raw.Recast.allocPolyMeshDetail());
  };
  const freePolyMeshDetail = polyMeshDetail => {
    return Raw.Recast.freePolyMeshDetail(polyMeshDetail.raw);
  };

  class DetourTileCacheParams {
    constructor(raw) {
      this.raw = raw;
    }
    static create(config) {
      const tileCacheParams = new Raw.Module.dtTileCacheParams();
      tileCacheParams.set_orig(0, config.orig[0]);
      tileCacheParams.set_orig(1, config.orig[1]);
      tileCacheParams.set_orig(2, config.orig[2]);
      tileCacheParams.set_cs(config.cs);
      tileCacheParams.set_ch(config.ch);
      tileCacheParams.set_width(config.width);
      tileCacheParams.set_height(config.height);
      tileCacheParams.set_walkableHeight(config.walkableHeight);
      tileCacheParams.set_walkableRadius(config.walkableRadius);
      tileCacheParams.set_walkableClimb(config.walkableClimb);
      tileCacheParams.set_maxSimplificationError(config.maxSimplificationError);
      tileCacheParams.set_maxTiles(config.maxTiles);
      tileCacheParams.set_maxObstacles(config.maxObstacles);
      return new DetourTileCacheParams(tileCacheParams);
    }
  }
  class TileCache {
    obstacles = new Map();
    constructor(raw) {
      this.raw = raw ?? new Raw.Module.TileCache();
    }
    /**
     * Initialises the TileCache
     * @param params
     */
    init(params, alloc, compressor, meshProcess) {
      return this.raw.init(params.raw, alloc, compressor, meshProcess.raw);
    }
    /**
     * Updates the tile cache by rebuilding tiles touched by unfinished obstacle requests.
     *
     * After adding or removing obstacles you can call `tileCache.update(navMesh)` to rebuild navmesh tiles.
     *
     * Adding or removing an obstacle will internally create an "obstacle request".
     * TileCache supports queuing up to 64 obstacle requests.
     *
     * The `tileCache.update` method returns `upToDate`, whether the tile cache is fully up to date with obstacle requests and tile rebuilds.
     * Each update call processes up to 64 tiles touched by added or removed obstacles.
     * If the tile cache isn't up to date another call will continue processing obstacle requests and tile rebuilds; otherwise it will have no effect.
     *
     * If not many obstacle requests occur between updates, an easy pattern is to call `tileCache.update` periodically, such as every game update.
     * If many obstacle requests have been made and you need to avoid reaching the 64 obstacle request limit, you can call `tileCache.update` multiple times, bailing out when `upToDate` is true or after a maximum number of updates.
     *
     * @example
     * ```ts
     * const { success, status, upToDate } = tileCache.update(navMesh);
     * ```
     */
    update(navMesh) {
      const {
        status,
        upToDate
      } = this.raw.update(navMesh.raw);
      return {
        success: statusSucceed(status),
        status,
        upToDate
      };
    }
    /**
     * Creates a cylinder obstacle and adds it to the navigation mesh.
     */
    addCylinderObstacle(position, radius, height) {
      const result = this.raw.addCylinderObstacle(vec3.toRaw(position), radius, height);
      if (result.status !== Detour.DT_SUCCESS) {
        return {
          success: false,
          status: result.status
        };
      }
      const ref = result.ref;
      const obstacle = {
        type: 'cylinder',
        ref,
        position,
        radius,
        height
      };
      this.obstacles.set(ref, obstacle);
      return {
        success: true,
        status: result.status,
        obstacle
      };
    }
    /**
     * Creates a box obstacle and adds it to the navigation mesh.
     */
    addBoxObstacle(position, halfExtents, angle) {
      const rawPosition = vec3.toRaw(position);
      const rawHalfExtents = vec3.toRaw(halfExtents);
      const result = this.raw.addBoxObstacle(rawPosition, rawHalfExtents, angle);
      Raw.destroy(rawPosition);
      Raw.destroy(rawHalfExtents);
      if (result.status !== Detour.DT_SUCCESS) {
        return {
          success: false,
          status: result.status
        };
      }
      const ref = result.ref;
      const obstacle = {
        type: 'box',
        ref,
        position,
        halfExtents,
        angle
      };
      this.obstacles.set(ref, obstacle);
      return {
        success: true,
        status: result.status,
        obstacle
      };
    }
    /**
     * Removes an obstacle from the navigation mesh.
     */
    removeObstacle(obstacle) {
      let ref;
      if (typeof obstacle === 'object') {
        ref = obstacle.ref;
      } else {
        ref = obstacle;
      }
      this.obstacles.delete(ref);
      const status = this.raw.removeObstacle(ref);
      return {
        success: statusSucceed(status),
        status
      };
    }
    addTile(data, flags = Detour.DT_COMPRESSEDTILE_FREE_DATA) {
      return this.raw.addTile(data.raw, flags);
    }
    buildNavMeshTile(ref, navMesh) {
      return this.raw.buildNavMeshTile(ref, navMesh.raw);
    }
    buildNavMeshTilesAt(tx, ty, navMesh) {
      return this.raw.buildNavMeshTilesAt(tx, ty, navMesh.raw);
    }
    destroy() {
      this.raw.destroy();
    }
  }
  class TileCacheMeshProcess {
    constructor(process) {
      this.raw = new Raw.Module.TileCacheMeshProcess();
      this.raw.process = (paramsPtr, polyAreasArrayPtr, polyFlagsArrayPtr) => {
        const params = new NavMeshCreateParams(Raw.Module.wrapPointer(paramsPtr, Raw.Module.dtNavMeshCreateParams));
        const polyAreasArray = Raw.Module.wrapPointer(polyAreasArrayPtr, Raw.Module.UnsignedCharArray);
        const polyFlagsArray = Raw.Module.wrapPointer(polyFlagsArrayPtr, Raw.Module.UnsignedShortArray);
        process(params, UnsignedCharArray.fromRaw(polyAreasArray), UnsignedShortArray.fromRaw(polyFlagsArray));
      };
    }
  }
  const buildTileCacheLayer = (comp, header, heights, areas, cons, tileCacheData) => {
    return Raw.DetourTileCacheBuilder.buildTileCacheLayer(comp, header, heights.raw, areas.raw, cons.raw, tileCacheData.raw);
  };

  const getBoundingBox = (positions, indices) => {
    const bbMin = {
      x: Infinity,
      y: Infinity,
      z: Infinity
    };
    const bbMax = {
      x: -Infinity,
      y: -Infinity,
      z: -Infinity
    };
    for (let i = 0; i < indices.length; i++) {
      const ind = indices[i];
      const x = positions[ind * 3];
      const y = positions[ind * 3 + 1];
      const z = positions[ind * 3 + 2];
      bbMin.x = Math.min(bbMin.x, x);
      bbMin.y = Math.min(bbMin.y, y);
      bbMin.z = Math.min(bbMin.z, z);
      bbMax.x = Math.max(bbMax.x, x);
      bbMax.y = Math.max(bbMax.y, y);
      bbMax.z = Math.max(bbMax.z, z);
    }
    return {
      bbMin: vec3.toArray(bbMin),
      bbMax: vec3.toArray(bbMax)
    };
  };
  const dtIlog2 = v => {
    let r = 0;
    let shift = 0;
    r = Number(v > 0xffff) << 4;
    v >>= r;
    shift = Number(v > 0xff) << 3;
    v >>= shift;
    r |= shift;
    shift = Number(v > 0xf) << 2;
    v >>= shift;
    r |= shift;
    shift = Number(v > 0x3) << 1;
    v >>= shift;
    r |= shift;
    r |= v >> 1;
    return r;
  };
  const dtNextPow2 = v => {
    v--;
    v |= v >> 1;
    v |= v >> 2;
    v |= v >> 4;
    v |= v >> 8;
    v |= v >> 16;
    v++;
    return v;
  };

  const soloNavMeshGeneratorConfigDefaults = {
    ...recastConfigDefaults,
    buildBvTree: true
  };
  /**
   * Builds Solo NavMesh data from the given positions and indices.
   * @param positions a flat array of positions
   * @param indices a flat array of indices
   * @param navMeshGeneratorConfig optional configuration for the NavMesh generator
   * @param keepIntermediates if true intermediates will be returned
   */
  const generateSoloNavMeshData = (positions, indices, navMeshGeneratorConfig = {}, keepIntermediates = false) => {
    const buildContext = new RecastBuildContext();
    const intermediates = {
      type: 'solo',
      buildContext
    };
    const cleanup = () => {
      if (keepIntermediates) return;
      if (intermediates.heightfield) {
        freeHeightfield(intermediates.heightfield);
        intermediates.heightfield = undefined;
      }
      if (intermediates.compactHeightfield) {
        freeCompactHeightfield(intermediates.compactHeightfield);
        intermediates.compactHeightfield = undefined;
      }
      if (intermediates.contourSet) {
        freeContourSet(intermediates.contourSet);
        intermediates.contourSet = undefined;
      }
      if (intermediates.polyMesh) {
        freePolyMesh(intermediates.polyMesh);
        intermediates.polyMesh = undefined;
      }
      if (intermediates.polyMeshDetail) {
        freePolyMeshDetail(intermediates.polyMeshDetail);
        intermediates.polyMeshDetail = undefined;
      }
    };
    const fail = error => {
      cleanup();
      return {
        navMeshData: undefined,
        success: false,
        intermediates,
        error
      };
    };
    /* input geometry */
    const vertices = positions;
    const numVertices = indices.length;
    const verticesArray = new VerticesArray();
    verticesArray.copy(vertices);
    const triangles = indices;
    const numTriangles = indices.length / 3;
    const trianglesArray = new TrianglesArray();
    trianglesArray.copy(triangles);
    let bbMin;
    let bbMax;
    if (navMeshGeneratorConfig.bounds) {
      bbMin = navMeshGeneratorConfig.bounds[0];
      bbMax = navMeshGeneratorConfig.bounds[1];
    } else {
      const boundingBox = getBoundingBox(positions, indices);
      bbMin = boundingBox.bbMin;
      bbMax = boundingBox.bbMax;
    }
    //
    // Step 1. Initialize build config.
    //
    const config = {
      ...soloNavMeshGeneratorConfigDefaults,
      ...navMeshGeneratorConfig
    };
    const rcConfig = createRcConfig(config);
    rcConfig.minRegionArea = rcConfig.minRegionArea * rcConfig.minRegionArea; // Note: area = size*size
    rcConfig.mergeRegionArea = rcConfig.mergeRegionArea * rcConfig.mergeRegionArea; // Note: area = size*size
    rcConfig.detailSampleDist = rcConfig.detailSampleDist < 0.9 ? 0 : rcConfig.cs * rcConfig.detailSampleDist;
    rcConfig.detailSampleMaxError = rcConfig.ch * rcConfig.detailSampleMaxError;
    const gridSize = calcGridSize(bbMin, bbMax, rcConfig.cs);
    rcConfig.width = gridSize.width;
    rcConfig.height = gridSize.height;
    //
    // Step 2. Rasterize input polygon soup.
    //
    // Allocate voxel heightfield where we rasterize our input data to.
    const heightfield = allocHeightfield();
    intermediates.heightfield = heightfield;
    if (!createHeightfield(buildContext, heightfield, rcConfig.width, rcConfig.height, bbMin, bbMax, rcConfig.cs, rcConfig.ch)) {
      return fail('Could not create heightfield');
    }
    // Find triangles which are walkable based on their slope and rasterize them.
    // If your input data is multiple meshes, you can transform them here, calculate
    // the are type for each of the meshes and rasterize them.
    const triangleAreasArray = new TriangleAreasArray();
    triangleAreasArray.resize(numTriangles);
    markWalkableTriangles(buildContext, rcConfig.walkableSlopeAngle, verticesArray, numVertices, trianglesArray, numTriangles, triangleAreasArray);
    if (!rasterizeTriangles(buildContext, verticesArray, numVertices, trianglesArray, triangleAreasArray, numTriangles, heightfield, rcConfig.walkableClimb)) {
      return fail('Could not rasterize triangles');
    }
    triangleAreasArray.destroy();
    verticesArray.destroy();
    trianglesArray.destroy();
    //
    // Step 3. Filter walkables surfaces.
    //
    // Once all geoemtry is rasterized, we do initial pass of filtering to
    // remove unwanted overhangs caused by the conservative rasterization
    // as well as filter spans where the character cannot possibly stand.
    filterLowHangingWalkableObstacles(buildContext, rcConfig.walkableClimb, heightfield);
    filterLedgeSpans(buildContext, rcConfig.walkableHeight, rcConfig.walkableClimb, heightfield);
    filterWalkableLowHeightSpans(buildContext, rcConfig.walkableHeight, heightfield);
    //
    // Step 4. Partition walkable surface to simple regions.
    //
    // Compact the heightfield so that it is faster to handle from now on.
    // This will result more cache coherent data as well as the neighbours
    // between walkable cells will be calculated.
    const compactHeightfield = allocCompactHeightfield();
    intermediates.compactHeightfield = compactHeightfield;
    if (!buildCompactHeightfield(buildContext, rcConfig.walkableHeight, rcConfig.walkableClimb, heightfield, compactHeightfield)) {
      return fail('Failed to build compact data');
    }
    if (!keepIntermediates) {
      freeHeightfield(heightfield);
      intermediates.heightfield = undefined;
    }
    // Erode the walkable area by agent radius.
    if (!erodeWalkableArea(buildContext, rcConfig.walkableRadius, compactHeightfield)) {
      return fail('Failed to erode walkable area');
    }
    // (Optional) Mark areas
    // markConvexPolyArea(...)
    // Prepare for region partitioning, by calculating Distance field along the walkable surface.
    if (!buildDistanceField(buildContext, compactHeightfield)) {
      return fail('Failed to build distance field');
    }
    // Partition the walkable surface into simple regions without holes.
    if (!buildRegions(buildContext, compactHeightfield, rcConfig.borderSize, rcConfig.minRegionArea, rcConfig.mergeRegionArea)) {
      return fail('Failed to build regions');
    }
    //
    // Step 5. Trace and simplify region contours.
    //
    const contourSet = allocContourSet();
    intermediates.contourSet = contourSet;
    if (!buildContours(buildContext, compactHeightfield, rcConfig.maxSimplificationError, rcConfig.maxEdgeLen, contourSet, Recast.RC_CONTOUR_TESS_WALL_EDGES)) {
      return fail('Failed to create contours');
    }
    //
    // Step 6. Build polygons mesh from contours.
    //
    const polyMesh = allocPolyMesh();
    intermediates.polyMesh = polyMesh;
    if (!buildPolyMesh(buildContext, contourSet, rcConfig.maxVertsPerPoly, polyMesh)) {
      return fail('Failed to triangulate contours');
    }
    //
    // Step 7. Create detail mesh which allows to access approximate height on each polygon.
    //
    const polyMeshDetail = allocPolyMeshDetail();
    intermediates.polyMeshDetail = polyMeshDetail;
    if (!buildPolyMeshDetail(buildContext, polyMesh, compactHeightfield, rcConfig.detailSampleDist, rcConfig.detailSampleMaxError, polyMeshDetail)) {
      return fail('Failed to build detail mesh');
    }
    if (!keepIntermediates) {
      freeCompactHeightfield(compactHeightfield);
      intermediates.compactHeightfield = undefined;
      freeContourSet(contourSet);
      intermediates.contourSet = undefined;
    }
    //
    // Step 8. Create Detour data from Recast poly mesh.
    //
    for (let i = 0; i < polyMesh.npolys(); i++) {
      if (polyMesh.areas(i) === Recast.RC_WALKABLE_AREA) {
        polyMesh.setAreas(i, 0);
      }
      if (polyMesh.areas(i) === 0) {
        polyMesh.setFlags(i, 1);
      }
    }
    const navMeshCreateParams = new NavMeshCreateParams();
    navMeshCreateParams.setPolyMeshCreateParams(polyMesh);
    navMeshCreateParams.setPolyMeshDetailCreateParams(polyMeshDetail);
    navMeshCreateParams.setWalkableHeight(rcConfig.walkableHeight * rcConfig.ch);
    navMeshCreateParams.setWalkableRadius(rcConfig.walkableRadius * rcConfig.cs);
    navMeshCreateParams.setWalkableClimb(rcConfig.walkableClimb * rcConfig.ch);
    navMeshCreateParams.setCellSize(rcConfig.cs);
    navMeshCreateParams.setCellHeight(rcConfig.ch);
    navMeshCreateParams.setBuildBvTree(config.buildBvTree);
    if (navMeshGeneratorConfig.offMeshConnections) {
      navMeshCreateParams.setOffMeshConnections(navMeshGeneratorConfig.offMeshConnections);
    }
    const createNavMeshDataResult = createNavMeshData(navMeshCreateParams);
    if (!createNavMeshDataResult.success) {
      return fail('Failed to create Detour navmesh data');
    }
    cleanup();
    return {
      navMeshData: createNavMeshDataResult.navMeshData,
      success: true,
      intermediates
    };
  };
  /**
   * Builds a Solo NavMesh from the given positions and indices.
   * @param positions a flat array of positions
   * @param indices a flat array of indices
   * @param navMeshGeneratorConfig optional configuration for the NavMesh generator
   * @param keepIntermediates if true intermediates will be returned
   */
  const generateSoloNavMesh = (positions, indices, navMeshGeneratorConfig = {}, keepIntermediates = false) => {
    if (!Raw.Module) {
      throw new Error('"init" must be called before using any recast-navigation-js APIs. See: https://github.com/isaac-mason/recast-navigation-js?tab=readme-ov-file#initialization');
    }
    const createNavMeshDataResult = generateSoloNavMeshData(positions, indices, navMeshGeneratorConfig, keepIntermediates);
    if (!createNavMeshDataResult.success) {
      return {
        navMesh: undefined,
        success: false,
        intermediates: createNavMeshDataResult.intermediates,
        error: createNavMeshDataResult.error
      };
    }
    const {
      navMeshData
    } = createNavMeshDataResult;
    const navMesh = new NavMesh();
    if (!navMesh.initSolo(navMeshData)) {
      navMeshData.destroy();
      return {
        navMesh: undefined,
        success: false,
        intermediates: createNavMeshDataResult.intermediates,
        error: 'Failed to initialize solo NavMesh'
      };
    }
    return {
      success: true,
      navMesh,
      intermediates: createNavMeshDataResult.intermediates
    };
  };

  const tileCacheGeneratorConfigDefaults = {
    ...recastConfigDefaults,
    tileSize: 32,
    expectedLayersPerTile: 4,
    maxObstacles: 128
  };
  const createDefaultTileCacheMeshProcess = () => new TileCacheMeshProcess((navMeshCreateParams, polyAreas, polyFlags) => {
    for (let i = 0; i < navMeshCreateParams.polyCount(); ++i) {
      polyAreas.set(i, 0);
      polyFlags.set(i, 1);
    }
  });
  /**
   * Builds a TileCache and NavMesh from the given positions and indices.
   * TileCache assumes small tiles (around 32-64 squared) and does some tricks to make the update fast.
   * @param positions a flat array of positions
   * @param indices a flat array of indices
   * @param navMeshConfig optional configuration for the NavMesh
   * @param keepIntermediates if true intermediates will be returned
   */
  const generateTileCache = (positions, indices, navMeshGeneratorConfig = {}, keepIntermediates = false) => {
    if (!Raw.Module) {
      throw new Error('"init" must be called before using any recast-navigation-js APIs. See: https://github.com/isaac-mason/recast-navigation-js?tab=readme-ov-file#initialization');
    }
    const buildContext = new RecastBuildContext();
    const intermediates = {
      type: 'tilecache',
      buildContext,
      chunkyTriMesh: undefined,
      tileIntermediates: []
    };
    const tileCache = new TileCache();
    const navMesh = new NavMesh();
    /* input geometry */
    const vertices = positions;
    const numVertices = indices.length;
    const verticesArray = new VerticesArray();
    verticesArray.copy(vertices);
    const triangles = indices;
    const numTriangles = indices.length / 3;
    const trianglesArray = new TrianglesArray();
    trianglesArray.copy(triangles);
    let bbMin;
    let bbMax;
    if (navMeshGeneratorConfig.bounds) {
      bbMin = navMeshGeneratorConfig.bounds[0];
      bbMax = navMeshGeneratorConfig.bounds[1];
    } else {
      const boundingBox = getBoundingBox(positions, indices);
      bbMin = boundingBox.bbMin;
      bbMax = boundingBox.bbMax;
    }
    const {
      expectedLayersPerTile,
      maxObstacles,
      ...recastConfig
    } = {
      ...tileCacheGeneratorConfigDefaults,
      ...navMeshGeneratorConfig
    };
    const cleanup = () => {
      verticesArray.destroy();
      trianglesArray.destroy();
      if (!keepIntermediates) {
        for (let i = 0; i < intermediates.tileIntermediates.length; i++) {
          const tileIntermediate = intermediates.tileIntermediates[i];
          if (tileIntermediate.heightfield) {
            freeHeightfield(tileIntermediate.heightfield);
            tileIntermediate.heightfield = undefined;
          }
          if (tileIntermediate.compactHeightfield) {
            freeCompactHeightfield(tileIntermediate.compactHeightfield);
            tileIntermediate.compactHeightfield = undefined;
          }
          if (tileIntermediate.heightfieldLayerSet) {
            freeHeightfieldLayerSet(tileIntermediate.heightfieldLayerSet);
            tileIntermediate.heightfieldLayerSet = undefined;
          }
        }
      }
    };
    const fail = error => {
      cleanup();
      tileCache.destroy();
      navMesh.destroy();
      return {
        success: false,
        navMesh: undefined,
        tileCache: undefined,
        intermediates,
        error
      };
    };
    //
    // Step 1. Initialize build config.
    //
    const config = createRcConfig(recastConfig);
    const gridSize = calcGridSize(bbMin, bbMax, config.cs);
    config.width = gridSize.width;
    config.height = gridSize.height;
    config.minRegionArea = config.minRegionArea * config.minRegionArea; // Note: area = size*size
    config.mergeRegionArea = config.mergeRegionArea * config.mergeRegionArea; // Note: area = size*size
    config.detailSampleDist = config.detailSampleDist < 0.9 ? 0 : config.cs * config.detailSampleDist;
    config.detailSampleMaxError = config.ch * config.detailSampleMaxError;
    const tileSize = Math.floor(config.tileSize);
    const tileWidth = Math.floor((config.width + tileSize - 1) / tileSize);
    const tileHeight = Math.floor((config.height + tileSize - 1) / tileSize);
    // Generation params
    config.borderSize = config.walkableRadius + 3; // Reserve enough padding.
    config.width = config.tileSize + config.borderSize * 2;
    config.height = config.tileSize + config.borderSize * 2;
    // Tile cache params
    const tileCacheParams = DetourTileCacheParams.create({
      orig: bbMin,
      cs: config.cs,
      ch: config.ch,
      width: config.tileSize,
      height: config.tileSize,
      walkableHeight: config.walkableHeight * config.ch,
      walkableRadius: config.walkableRadius * config.cs,
      walkableClimb: config.walkableClimb * config.ch,
      maxSimplificationError: config.maxSimplificationError,
      maxTiles: tileWidth * tileHeight * expectedLayersPerTile,
      maxObstacles
    });
    const allocator = new Raw.RecastLinearAllocator(32000);
    const compressor = new Raw.RecastFastLZCompressor();
    const tileCacheMeshProcess = navMeshGeneratorConfig.tileCacheMeshProcess ?? createDefaultTileCacheMeshProcess();
    if (!tileCache.init(tileCacheParams, allocator, compressor, tileCacheMeshProcess)) {
      return fail('Failed to initialize tile cache');
    }
    const orig = vec3.fromArray(bbMin);
    // Max tiles and max polys affect how the tile IDs are caculated.
    // There are 22 bits available for identifying a tile and a polygon.
    let tileBits = Math.min(Math.floor(dtIlog2(dtNextPow2(tileWidth * tileHeight * expectedLayersPerTile))), 14);
    if (tileBits > 14) {
      tileBits = 14;
    }
    const polyBits = 22 - tileBits;
    const maxTiles = 1 << tileBits;
    const maxPolysPerTile = 1 << polyBits;
    const navMeshParams = NavMeshParams.create({
      orig,
      tileWidth: config.tileSize * config.cs,
      tileHeight: config.tileSize * config.cs,
      maxTiles,
      maxPolys: maxPolysPerTile
    });
    if (!navMesh.initTiled(navMeshParams)) {
      return fail('Failed to initialize tiled navmesh');
    }
    const chunkyTriMesh = new RecastChunkyTriMesh();
    intermediates.chunkyTriMesh = chunkyTriMesh;
    if (!chunkyTriMesh.init(verticesArray, trianglesArray, numTriangles, 256)) {
      return fail('Failed to build chunky triangle mesh');
    }
    const rasterizeTileLayers = (tileX, tileY) => {
      // Tile intermediates
      const tileIntermediates = {
        tileX,
        tileY
      };
      // Tile bounds
      const tcs = config.tileSize * config.cs;
      const tileConfig = cloneRcConfig(config);
      const tileBoundsMin = [bbMin[0] + tileX * tcs, bbMin[1], bbMin[2] + tileY * tcs];
      const tileBoundsMax = [bbMin[0] + (tileX + 1) * tcs, bbMax[1], bbMin[2] + (tileY + 1) * tcs];
      tileBoundsMin[0] -= tileConfig.borderSize * tileConfig.cs;
      tileBoundsMin[2] -= tileConfig.borderSize * tileConfig.cs;
      tileBoundsMax[0] += tileConfig.borderSize * tileConfig.cs;
      tileBoundsMax[2] += tileConfig.borderSize * tileConfig.cs;
      tileConfig.set_bmin(0, tileBoundsMin[0]);
      tileConfig.set_bmin(1, tileBoundsMin[1]);
      tileConfig.set_bmin(2, tileBoundsMin[2]);
      tileConfig.set_bmax(0, tileBoundsMax[0]);
      tileConfig.set_bmax(1, tileBoundsMax[1]);
      tileConfig.set_bmax(2, tileBoundsMax[2]);
      // Allocate voxel heightfield where we rasterize our input data to.
      const heightfield = allocHeightfield();
      tileIntermediates.heightfield = heightfield;
      if (!createHeightfield(buildContext, heightfield, tileConfig.width, tileConfig.height, tileBoundsMin, tileBoundsMax, tileConfig.cs, tileConfig.ch)) {
        return {
          n: 0
        };
      }
      const tbmin = [tileBoundsMin[0], tileBoundsMin[2]];
      const tbmax = [tileBoundsMax[0], tileBoundsMax[2]];
      // TODO: Make grow when returning too many items.
      const maxChunkIds = 512;
      const chunkIdsArray = new ChunkIdsArray();
      chunkIdsArray.resize(maxChunkIds);
      const nChunksOverlapping = chunkyTriMesh.getChunksOverlappingRect(tbmin, tbmax, chunkIdsArray, maxChunkIds);
      if (nChunksOverlapping === 0) {
        return {
          n: 0
        };
      }
      for (let i = 0; i < nChunksOverlapping; ++i) {
        const nodeId = chunkIdsArray.get(i);
        const node = chunkyTriMesh.nodes(nodeId);
        const nNodeTris = node.n;
        const nodeTrianglesArray = chunkyTriMesh.getNodeTris(nodeId);
        const triangleAreasArray = new TriangleAreasArray();
        triangleAreasArray.resize(nNodeTris);
        // Find triangles which are walkable based on their slope and rasterize them.
        // If your input data is multiple meshes, you can transform them here, calculate
        // the are type for each of the meshes and rasterize them.
        markWalkableTriangles(buildContext, tileConfig.walkableSlopeAngle, verticesArray, numVertices, nodeTrianglesArray, nNodeTris, triangleAreasArray);
        const success = rasterizeTriangles(buildContext, verticesArray, numVertices, nodeTrianglesArray, triangleAreasArray, nNodeTris, heightfield, tileConfig.walkableClimb);
        triangleAreasArray.destroy();
        if (!success) {
          return {
            n: 0
          };
        }
      }
      // Once all geometry is rasterized, we do initial pass of filtering to
      // remove unwanted overhangs caused by the conservative rasterization
      // as well as filter spans where the character cannot possibly stand.
      filterLowHangingWalkableObstacles(buildContext, config.walkableClimb, heightfield);
      filterLedgeSpans(buildContext, config.walkableHeight, config.walkableClimb, heightfield);
      filterWalkableLowHeightSpans(buildContext, config.walkableHeight, heightfield);
      const compactHeightfield = allocCompactHeightfield();
      if (!buildCompactHeightfield(buildContext, config.walkableHeight, config.walkableClimb, heightfield, compactHeightfield)) {
        return {
          n: 0
        };
      }
      if (!keepIntermediates) {
        freeHeightfield(tileIntermediates.heightfield);
        tileIntermediates.heightfield = undefined;
      }
      // Erode the walkable area by agent radius
      if (!erodeWalkableArea(buildContext, config.walkableRadius, compactHeightfield)) {
        return {
          n: 0
        };
      }
      const heightfieldLayerSet = allocHeightfieldLayerSet();
      if (!buildHeightfieldLayers(buildContext, compactHeightfield, config.borderSize, config.walkableHeight, heightfieldLayerSet)) {
        return {
          n: 0
        };
      }
      if (!keepIntermediates) {
        freeCompactHeightfield(compactHeightfield);
        tileIntermediates.compactHeightfield = undefined;
      }
      const tiles = [];
      for (let i = 0; i < heightfieldLayerSet.nlayers(); i++) {
        const tile = new TileCacheData();
        const heightfieldLayer = heightfieldLayerSet.layers(i);
        // Store header
        const header = new Raw.dtTileCacheLayerHeader();
        header.magic = Detour.DT_TILECACHE_MAGIC;
        header.version = Detour.DT_TILECACHE_VERSION;
        // Tile layer location in the navmesh
        header.tx = tileX;
        header.ty = tileY;
        header.tlayer = i;
        const heightfieldLayerBin = heightfieldLayer.bmin();
        const heightfieldLayerBmax = heightfieldLayer.bmax();
        header.set_bmin(0, heightfieldLayerBin.x);
        header.set_bmin(1, heightfieldLayerBin.y);
        header.set_bmin(2, heightfieldLayerBin.z);
        header.set_bmax(0, heightfieldLayerBmax.x);
        header.set_bmax(1, heightfieldLayerBmax.y);
        header.set_bmax(2, heightfieldLayerBmax.z);
        // Tile info
        header.width = heightfieldLayer.width();
        header.height = heightfieldLayer.height();
        header.minx = heightfieldLayer.minx();
        header.maxx = heightfieldLayer.maxx();
        header.miny = heightfieldLayer.miny();
        header.maxy = heightfieldLayer.maxy();
        header.hmin = heightfieldLayer.hmin();
        header.hmax = heightfieldLayer.hmax();
        const heights = getHeightfieldLayerHeights(heightfieldLayer);
        const areas = getHeightfieldLayerAreas(heightfieldLayer);
        const cons = getHeightfieldLayerCons(heightfieldLayer);
        const status = buildTileCacheLayer(compressor, header, heights, areas, cons, tile);
        if (statusFailed(status)) {
          return {
            n: 0
          };
        }
        tiles.push(tile);
      }
      if (!keepIntermediates) {
        freeHeightfieldLayerSet(heightfieldLayerSet);
        tileIntermediates.heightfieldLayerSet = undefined;
      }
      intermediates.tileIntermediates.push(tileIntermediates);
      return {
        n: tiles.length,
        tiles
      };
    };
    // Preprocess tiles
    for (let y = 0; y < tileHeight; ++y) {
      for (let x = 0; x < tileWidth; ++x) {
        const {
          n,
          tiles: newTiles
        } = rasterizeTileLayers(x, y);
        if (n > 0 && newTiles) {
          for (let i = 0; i < n; i++) {
            const tileCacheData = newTiles[i];
            const addResult = tileCache.addTile(tileCacheData);
            if (statusFailed(addResult.status)) {
              buildContext.log(Recast.RC_LOG_WARNING, `Failed to add tile to tile cache - tx: ${x}, ty: ${y}`);
            }
          }
        }
      }
    }
    // Build initial meshes
    for (let y = 0; y < tileHeight; y++) {
      for (let x = 0; x < tileWidth; x++) {
        const dtStatus = tileCache.buildNavMeshTilesAt(x, y, navMesh);
        if (statusFailed(dtStatus)) {
          return fail(`Failed to build nav mesh tiles at ${x}, ${y}`);
        }
      }
    }
    cleanup();
    return {
      success: true,
      tileCache,
      navMesh,
      intermediates
    };
  };

  const buildTiledNavMeshRcConfig = ({
    recastConfig,
    navMeshBounds: [navMeshBoundsMin, navMeshBoundsMax]
  }) => {
    //
    // Initialize build config.
    //
    const config = createRcConfig(recastConfig);
    /* grid size */
    const gridSize = calcGridSize(navMeshBoundsMin, navMeshBoundsMax, config.cs);
    config.width = gridSize.width;
    config.height = gridSize.height;
    config.minRegionArea = config.minRegionArea * config.minRegionArea; // Note: area = size*size
    config.mergeRegionArea = config.mergeRegionArea * config.mergeRegionArea; // Note: area = size*size
    config.tileSize = Math.floor(config.tileSize);
    config.borderSize = config.walkableRadius + 3; // Reserve enough padding.
    config.width = config.tileSize + config.borderSize * 2;
    config.height = config.tileSize + config.borderSize * 2;
    config.detailSampleDist = config.detailSampleDist < 0.9 ? 0 : config.cs * config.detailSampleDist;
    config.detailSampleMaxError = config.ch * config.detailSampleMaxError;
    // tile size
    const tileSize = Math.floor(config.tileSize);
    const tileWidth = Math.floor((gridSize.width + tileSize - 1) / tileSize);
    const tileHeight = Math.floor((gridSize.height + tileSize - 1) / tileSize);
    const tcs = config.tileSize * config.cs;
    /* Create dtNavMeshParams, initialise nav mesh for tiled use */
    const orig = vec3.fromArray(navMeshBoundsMin);
    // Max tiles and max polys affect how the tile IDs are caculated.
    // There are 22 bits available for identifying a tile and a polygon.
    let tileBits = Math.min(Math.floor(dtIlog2(dtNextPow2(tileWidth * tileHeight))), 14);
    if (tileBits > 14) tileBits = 14;
    const polyBits = 22 - tileBits;
    const maxTiles = 1 << tileBits;
    const maxPolysPerTile = 1 << polyBits;
    return {
      config,
      gridSize,
      tileSize,
      tileWidth,
      tileHeight,
      tcs,
      orig,
      maxTiles,
      maxPolysPerTile
    };
  };
  const tiledNavMeshGeneratorConfigDefaults = {
    ...recastConfigDefaults,
    chunkyTriMeshTrisPerChunk: 256,
    buildBvTree: true
  };
  const generateTileNavMeshData = (positions, indices, rcConfig, chunkyTriMesh, tile, options = {}, keepIntermediates = false, buildContext = new RecastBuildContext()) => {
    const tileIntermediate = {
      x: tile.x,
      y: tile.y
    };
    const cleanup = () => {
      if (keepIntermediates) return;
      if (tileIntermediate.compactHeightfield) {
        freeCompactHeightfield(tileIntermediate.compactHeightfield);
        tileIntermediate.compactHeightfield = undefined;
      }
      if (tileIntermediate.heightfield) {
        freeHeightfield(tileIntermediate.heightfield);
        tileIntermediate.heightfield = undefined;
      }
      if (tileIntermediate.contourSet) {
        freeContourSet(tileIntermediate.contourSet);
        tileIntermediate.contourSet = undefined;
      }
      if (tileIntermediate.polyMesh) {
        freePolyMesh(tileIntermediate.polyMesh);
        tileIntermediate.polyMesh = undefined;
      }
      if (tileIntermediate.polyMeshDetail) {
        freePolyMeshDetail(tileIntermediate.polyMeshDetail);
        tileIntermediate.polyMeshDetail = undefined;
      }
    };
    const failTileMesh = error => {
      buildContext.log(Recast.RC_LOG_ERROR, error);
      cleanup();
      return {
        success: false,
        error,
        intermediates: tileIntermediate
      };
    };
    const tileConfig = cloneRcConfig(rcConfig);
    // Expand the heightfield bounding box by border size to find the extents of geometry we need to build this tile.
    //
    // This is done in order to make sure that the navmesh tiles connect correctly at the borders,
    // and the obstacles close to the border work correctly with the dilation process.
    // No polygons (or contours) will be created on the border area.
    //
    // IMPORTANT!
    //
    //   :''''''''':
    //   : +-----+ :
    //   : |     | :
    //   : |     |<--- tile to build
    //   : |     | :
    //   : +-----+ :<-- geometry needed
    //   :.........:
    //
    // You should use this bounding box to query your input geometry.
    //
    // For example if you build a navmesh for terrain, and want the navmesh tiles to match the terrain tile size
    // you will need to pass in data from neighbour terrain tiles too! In a simple case, just pass in all the 8 neighbours,
    // or use the bounding box below to only pass in a sliver of each of the 8 neighbours.
    const expandedTileBoundsMin = [...tile.bmin];
    const expandedTileBoundsMax = [...tile.bmax];
    expandedTileBoundsMin[0] -= tileConfig.borderSize * tileConfig.cs;
    expandedTileBoundsMin[2] -= tileConfig.borderSize * tileConfig.cs;
    expandedTileBoundsMax[0] += tileConfig.borderSize * tileConfig.cs;
    expandedTileBoundsMax[2] += tileConfig.borderSize * tileConfig.cs;
    tileConfig.set_bmin(0, expandedTileBoundsMin[0]);
    tileConfig.set_bmin(1, expandedTileBoundsMin[1]);
    tileConfig.set_bmin(2, expandedTileBoundsMin[2]);
    tileConfig.set_bmax(0, expandedTileBoundsMax[0]);
    tileConfig.set_bmax(1, expandedTileBoundsMax[1]);
    tileConfig.set_bmax(2, expandedTileBoundsMax[2]);
    // Reset build timer
    buildContext.resetTimers();
    // Start the build process
    buildContext.startTimer(Recast.RC_TIMER_TOTAL);
    buildContext.log(Recast.RC_LOG_PROGRESS, `Building tile at x: ${tile.x}, y: ${tile.y}`);
    buildContext.log(Recast.RC_LOG_PROGRESS, ` - ${tileConfig.width} x ${tileConfig.height} cells`);
    buildContext.log(Recast.RC_LOG_PROGRESS, ` - ${positions.size / 3 / 1000}K verts, ${indices.size / 3 / 1000}K tris`);
    // Allocate voxel heightfield where we rasterize our input data to.
    const heightfield = allocHeightfield();
    tileIntermediate.heightfield = heightfield;
    if (!createHeightfield(buildContext, heightfield, tileConfig.width, tileConfig.height, expandedTileBoundsMin, expandedTileBoundsMax, tileConfig.cs, tileConfig.ch)) {
      return failTileMesh('Could not create heightfield');
    }
    // Allocate array that can hold triangle flags.
    // If you have multiple meshes you need to process, allocate
    // and array which can hold the max number of triangles you need to process.
    const triAreas = new TriangleAreasArray();
    triAreas.resize(chunkyTriMesh.maxTrisPerChunk());
    const tbmin = [expandedTileBoundsMin[0], expandedTileBoundsMin[2]];
    const tbmax = [expandedTileBoundsMax[0], expandedTileBoundsMax[2]];
    // TODO: Make grow when returning too many items.
    const maxChunkIds = 512;
    const chunkIdsArray = new ChunkIdsArray();
    chunkIdsArray.resize(maxChunkIds);
    const nChunksOverlapping = chunkyTriMesh.getChunksOverlappingRect(tbmin, tbmax, chunkIdsArray, maxChunkIds);
    if (nChunksOverlapping === 0) {
      return {
        success: true,
        intermediates: tileIntermediate
      };
    }
    for (let i = 0; i < nChunksOverlapping; ++i) {
      const nodeId = chunkIdsArray.get(i);
      const node = chunkyTriMesh.nodes(nodeId);
      const nNodeTris = node.n;
      const nodeTrianglesArray = chunkyTriMesh.getNodeTris(nodeId);
      const triangleAreasArray = new TriangleAreasArray();
      triangleAreasArray.resize(nNodeTris);
      // Find triangles which are walkable based on their slope and rasterize them.
      // If your input data is multiple meshes, you can transform them here, calculate
      // the are type for each of the meshes and rasterize them.
      markWalkableTriangles(buildContext, tileConfig.walkableSlopeAngle, positions, indices.size, nodeTrianglesArray, nNodeTris, triangleAreasArray);
      const success = rasterizeTriangles(buildContext, positions, indices.size, nodeTrianglesArray, triangleAreasArray, nNodeTris, heightfield, tileConfig.walkableClimb);
      triangleAreasArray.destroy();
      if (!success) {
        return failTileMesh('Could not rasterize triangles');
      }
    }
    // Once all geometry is rasterized, we do initial pass of filtering to
    // remove unwanted overhangs caused by the conservative rasterization
    // as well as filter spans where the character cannot possibly stand.
    filterLowHangingWalkableObstacles(buildContext, tileConfig.walkableClimb, heightfield);
    filterLedgeSpans(buildContext, tileConfig.walkableHeight, tileConfig.walkableClimb, heightfield);
    filterWalkableLowHeightSpans(buildContext, tileConfig.walkableHeight, heightfield);
    // Compact the heightfield so that it is faster to handle from now on.
    // This will result more cache coherent data as well as the neighbours
    // between walkable cells will be calculated.
    const compactHeightfield = allocCompactHeightfield();
    tileIntermediate.compactHeightfield = compactHeightfield;
    if (!buildCompactHeightfield(buildContext, tileConfig.walkableHeight, tileConfig.walkableClimb, heightfield, compactHeightfield)) {
      return failTileMesh('Could not build compact heightfield');
    }
    if (!keepIntermediates) {
      freeHeightfield(tileIntermediate.heightfield);
      tileIntermediate.heightfield = undefined;
    }
    // Erode the walkable area by agent radius
    if (!erodeWalkableArea(buildContext, tileConfig.walkableRadius, compactHeightfield)) {
      return failTileMesh('Could not erode walkable area');
    }
    // (Optional) Mark areas
    // markConvexPolyArea(...)
    // Prepare for region partitioning, by calculating Distance field along the walkable surface.
    if (!buildDistanceField(buildContext, compactHeightfield)) {
      return failTileMesh('Failed to build distance field');
    }
    // Partition the walkable surface into simple regions without holes.
    if (!buildRegions(buildContext, compactHeightfield, tileConfig.borderSize, tileConfig.minRegionArea, tileConfig.mergeRegionArea)) {
      return failTileMesh('Failed to build regions');
    }
    //
    // Trace and simplify region contours.
    //
    const contourSet = allocContourSet();
    tileIntermediate.contourSet = contourSet;
    if (!buildContours(buildContext, compactHeightfield, tileConfig.maxSimplificationError, tileConfig.maxEdgeLen, contourSet, Recast.RC_CONTOUR_TESS_WALL_EDGES)) {
      return failTileMesh('Failed to create contours');
    }
    //
    // Build polygons mesh from contours.
    //
    const polyMesh = allocPolyMesh();
    tileIntermediate.polyMesh = polyMesh;
    if (!buildPolyMesh(buildContext, contourSet, tileConfig.maxVertsPerPoly, polyMesh)) {
      return failTileMesh('Failed to triangulate contours');
    }
    //
    // Create detail mesh which allows to access approximate height on each polygon.
    //
    const polyMeshDetail = allocPolyMeshDetail();
    tileIntermediate.polyMeshDetail = polyMeshDetail;
    if (!buildPolyMeshDetail(buildContext, polyMesh, compactHeightfield, tileConfig.detailSampleDist, tileConfig.detailSampleMaxError, polyMeshDetail)) {
      return failTileMesh('Failed to build detail mesh');
    }
    if (!keepIntermediates) {
      freeCompactHeightfield(compactHeightfield);
      tileIntermediate.compactHeightfield = undefined;
      freeContourSet(contourSet);
      tileIntermediate.contourSet = undefined;
    }
    // Update poly flags from areas.
    for (let i = 0; i < polyMesh.npolys(); i++) {
      if (polyMesh.areas(i) === Recast.RC_WALKABLE_AREA) {
        polyMesh.setAreas(i, 0);
      }
      if (polyMesh.areas(i) === 0) {
        polyMesh.setFlags(i, 1);
      }
    }
    const navMeshCreateParams = new NavMeshCreateParams();
    navMeshCreateParams.setPolyMeshCreateParams(polyMesh);
    navMeshCreateParams.setPolyMeshDetailCreateParams(polyMeshDetail);
    navMeshCreateParams.setWalkableHeight(tileConfig.walkableHeight * tileConfig.ch);
    navMeshCreateParams.setWalkableRadius(tileConfig.walkableRadius * tileConfig.cs);
    navMeshCreateParams.setWalkableClimb(tileConfig.walkableClimb * tileConfig.ch);
    navMeshCreateParams.setCellSize(tileConfig.cs);
    navMeshCreateParams.setCellHeight(tileConfig.ch);
    navMeshCreateParams.setBuildBvTree(options.buildBvTree ?? tiledNavMeshGeneratorConfigDefaults.buildBvTree);
    if (options.offMeshConnections) {
      navMeshCreateParams.setOffMeshConnections(options.offMeshConnections);
    }
    navMeshCreateParams.setTileX(tile.x);
    navMeshCreateParams.setTileY(tile.y);
    const createNavMeshDataResult = createNavMeshData(navMeshCreateParams);
    if (!createNavMeshDataResult.success) {
      return failTileMesh('Failed to create Detour navmesh data');
    }
    buildContext.log(Recast.RC_LOG_PROGRESS, `>> Polymesh: ${polyMesh.nverts()} vertices  ${polyMesh.npolys()} polygons`);
    return {
      success: true,
      data: createNavMeshDataResult.navMeshData,
      intermediates: tileIntermediate
    };
  };
  /**
   * Builds a Tiled NavMesh
   * @param positions a flat array of positions
   * @param indices a flat array of indices
   * @param navMeshGeneratorConfig optional configuration for the NavMesh generator
   * @param keepIntermediates if true intermediates will be returned
   */
  const generateTiledNavMesh = (positions, indices, navMeshGeneratorConfig = {}, keepIntermediates = false) => {
    if (!Raw.Module) {
      throw new Error('"init" must be called before using any recast-navigation-js APIs. See: https://github.com/isaac-mason/recast-navigation-js?tab=readme-ov-file#initialization');
    }
    const buildContext = new RecastBuildContext();
    const intermediates = {
      type: 'tiled',
      buildContext,
      chunkyTriMesh: undefined,
      tileIntermediates: []
    };
    const navMesh = new NavMesh();
    /* input geometry */
    const vertices = positions;
    const verticesArray = new VerticesArray();
    verticesArray.copy(vertices);
    const triangles = indices;
    const numTriangles = indices.length / 3;
    const trianglesArray = new TrianglesArray();
    trianglesArray.copy(triangles);
    const cleanup = () => {
      verticesArray.destroy();
      trianglesArray.destroy();
      if (keepIntermediates) return;
      if (intermediates.chunkyTriMesh) {
        intermediates.chunkyTriMesh = undefined;
      }
    };
    const fail = error => {
      cleanup();
      navMesh.destroy();
      return {
        success: false,
        navMesh: undefined,
        intermediates,
        error
      };
    };
    //
    // Initialize build config.
    //
    const generatorConfig = {
      ...tiledNavMeshGeneratorConfigDefaults,
      ...navMeshGeneratorConfig
    };
    let bbMin;
    let bbMax;
    if (navMeshGeneratorConfig.bounds) {
      bbMin = navMeshGeneratorConfig.bounds[0];
      bbMax = navMeshGeneratorConfig.bounds[1];
    } else {
      const boundingBox = getBoundingBox(positions, indices);
      bbMin = boundingBox.bbMin;
      bbMax = boundingBox.bbMax;
    }
    const {
      config: rcConfig,
      tileWidth,
      tileHeight,
      tcs,
      orig,
      maxTiles,
      maxPolysPerTile
    } = buildTiledNavMeshRcConfig({
      recastConfig: generatorConfig,
      navMeshBounds: [bbMin, bbMax]
    });
    const navMeshParams = NavMeshParams.create({
      orig,
      tileWidth: generatorConfig.tileSize * generatorConfig.cs,
      tileHeight: generatorConfig.tileSize * generatorConfig.cs,
      maxTiles,
      maxPolys: maxPolysPerTile
    });
    if (!navMesh.initTiled(navMeshParams)) {
      return fail('Could not init nav mesh for tiled use');
    }
    /* create chunky tri mesh */
    const chunkyTriMesh = new RecastChunkyTriMesh();
    intermediates.chunkyTriMesh = chunkyTriMesh;
    if (!chunkyTriMesh.init(verticesArray, trianglesArray, numTriangles, generatorConfig.chunkyTriMeshTrisPerChunk)) {
      return fail('Failed to build chunky triangle mesh');
    }
    buildContext.startTimer(Recast.RC_TIMER_TEMP);
    const lastBuiltTileBmin = [0, 0, 0];
    const lastBuiltTileBmax = [0, 0, 0];
    for (let y = 0; y < tileHeight; y++) {
      for (let x = 0; x < tileWidth; x++) {
        lastBuiltTileBmin[0] = bbMin[0] + x * tcs;
        lastBuiltTileBmin[1] = bbMin[1];
        lastBuiltTileBmin[2] = bbMin[2] + y * tcs;
        lastBuiltTileBmax[0] = bbMin[0] + (x + 1) * tcs;
        lastBuiltTileBmax[1] = bbMax[1];
        lastBuiltTileBmax[2] = bbMin[2] + (y + 1) * tcs;
        const tile = {
          x,
          y,
          bmin: lastBuiltTileBmin,
          bmax: lastBuiltTileBmax
        };
        const generatorOptions = {
          offMeshConnections: generatorConfig.offMeshConnections,
          buildBvTree: generatorConfig.buildBvTree
        };
        const result = generateTileNavMeshData(verticesArray, trianglesArray, rcConfig, chunkyTriMesh, tile, generatorOptions, keepIntermediates, buildContext);
        intermediates.tileIntermediates.push(result.intermediates);
        if (result.success && result.data) {
          navMesh.removeTile(navMesh.getTileRefAt(x, y, 0));
          const addTileResult = navMesh.addTile(result.data, Detour.DT_TILE_FREE_DATA, 0);
          if (statusFailed(addTileResult.status)) {
            buildContext.log(Recast.RC_LOG_WARNING, `Failed to add tile to nav mesh tx: ${x}, ty: ${y}, status: ${statusToReadableString(addTileResult.status)} (${addTileResult.status})`);
            result.data.destroy();
          }
        }
      }
    }
    buildContext.stopTimer(Recast.RC_TIMER_TEMP);
    if (!keepIntermediates) {
      cleanup();
    }
    return {
      success: true,
      navMesh,
      intermediates
    };
  };

  const mergePositionsAndIndices = meshes => {
    const mergedPositions = [];
    const mergedIndices = [];
    const positionToIndex = {};
    let indexCounter = 0;
    for (const {
      positions,
      indices
    } of meshes) {
      for (let i = 0; i < indices.length; i++) {
        const pt = indices[i] * 3;
        const x = positions[pt];
        const y = positions[pt + 1];
        const z = positions[pt + 2];
        const key = `${x}_${y}_${z}`;
        let idx = positionToIndex[key];
        if (!idx) {
          positionToIndex[key] = idx = indexCounter;
          mergedPositions.push(x, y, z);
          indexCounter++;
        }
        mergedIndices.push(idx);
      }
    }
    return [Float32Array.from(mergedPositions), Uint32Array.from(mergedIndices)];
  };

  exports.buildTiledNavMeshRcConfig = buildTiledNavMeshRcConfig;
  exports.createDefaultTileCacheMeshProcess = createDefaultTileCacheMeshProcess;
  exports.dtIlog2 = dtIlog2;
  exports.dtNextPow2 = dtNextPow2;
  exports.generateSoloNavMesh = generateSoloNavMesh;
  exports.generateSoloNavMeshData = generateSoloNavMeshData;
  exports.generateTileCache = generateTileCache;
  exports.generateTileNavMeshData = generateTileNavMeshData;
  exports.generateTiledNavMesh = generateTiledNavMesh;
  exports.getBoundingBox = getBoundingBox;
  exports.mergePositionsAndIndices = mergePositionsAndIndices;
  exports.soloNavMeshGeneratorConfigDefaults = soloNavMeshGeneratorConfigDefaults;
  exports.tileCacheGeneratorConfigDefaults = tileCacheGeneratorConfigDefaults;
  exports.tiledNavMeshGeneratorConfigDefaults = tiledNavMeshGeneratorConfigDefaults;

}));
