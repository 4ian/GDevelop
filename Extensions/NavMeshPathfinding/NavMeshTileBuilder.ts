namespace gdjs {
  /**
   * The settings of Recast used to build the tiles of a navigation mesh.
   * Distances are in cells, as Recast takes them.
   * @category Behaviors > NavMesh pathfinding
   */
  export type NavMeshTileConfiguration = {
    cellSize: float;
    cellHeight: float;
    walkableSlopeAngle: float;
    walkableHeight: integer;
    walkableClimb: integer;
    walkableRadius: integer;
  };

  /**
   * An area of the navigation mesh, in the coordinates of Recast (Y is up).
   * @category Behaviors > NavMesh pathfinding
   */
  export type NavMeshArea = {
    minX: float;
    minZ: float;
    maxX: float;
    maxZ: float;
  };

  // Small tiles are cheap to rebuild when an obstacle moves, but each tile
  // also voxelizes a border around it (see `borderSizeInCells`): 32 cells
  // is the usual trade-off of Recast.
  const tileSizeInCellsMin = 32;
  // Tile and polygon references share 22 bits: the more tiles, the less
  // polygons per tile. With up to 1024 tiles (and the room kept for more,
  // see `maxTilesCount`), each tile can have 1024 polygons. Bigger tiles can
  // have more polygons.
  const tilesCountMax = 1024;
  const polygonsAndTileBits = 22;

  const logger = new gdjs.Logger('NavMesh');

  /**
   * What happened to a tile given to Detour: its polygons can be too many
   * to be converted, or to be added to the navigation mesh.
   */
  type NavMeshTileAddition = 'added' | 'notConverted' | 'refused';

  const maxEdgeLength = 12;
  const maxSimplificationError = 1.3;
  const minRegionArea = 8 * 8;
  const mergeRegionArea = 20 * 20;
  const maxVerticesPerPolygon = 6;
  const detailSampleDistanceInCells = 6;
  const detailSampleMaxErrorInCells = 1;

  /**
   * Build the tiles of a tiled navigation mesh with Recast. Each tile is
   * built from the triangles touching it, so that only the tiles around
   * a change need to be built again.
   *
   * Tiles cover the X and Z axis of Recast (the X and Y axis of the scene).
   * @category Behaviors > NavMesh pathfinding
   */
  export class NavMeshTileBuilder {
    /**
     * The WebAssembly module of Recast, set when it's loaded (see
     * `NavMeshCharacterRuntimeBehavior`). Its low level functions are not
     * exposed by `RecastNav`.
     */
    static recastModule: typeof RecastNav.RawModule | null = null;

    readonly configuration: NavMeshTileConfiguration;
    readonly tileSizeInCells: integer;
    readonly tileWidth: float;
    private readonly originX: float;
    private readonly originZ: float;
    private readonly maxTilesCount: integer;
    private tilesCount: integer = 0;
    /**
     * Each tile is voxelized with a border, so that the erosion by the
     * character radius and the regions match between neighbor tiles.
     */
    private readonly borderSizeInCells: integer;
    readonly borderWidth: float;
    private readonly recastModule: typeof RecastNav.RawModule;
    private readonly recast: RecastNav.RawModule.Recast;
    private readonly detourNavMeshBuilder: RecastNav.RawModule.DetourNavMeshBuilder;
    private readonly detourFailureStatus: integer;
    private readonly buildContext: RecastNav.RecastBuildContext;
    private readonly vertices: RecastNav.FloatArray;
    private readonly triangles: RecastNav.IntArray;
    private readonly triangleIndices: Array<integer> = [];

    /**
     * @param configuration The settings of Recast.
     * @param area The area where the obstacles are when the navigation mesh
     * is built.
     */
    constructor(
      recastModule: typeof RecastNav.RawModule,
      configuration: NavMeshTileConfiguration,
      area: NavMeshArea
    ) {
      this.recastModule = recastModule;
      this.configuration = configuration;
      this.originX = area.minX;
      this.originZ = area.minZ;
      const { cellSize } = configuration;
      let tileSizeInCells = tileSizeInCellsMin;
      const getTilesCount = () =>
        Math.ceil((area.maxX - area.minX) / (tileSizeInCells * cellSize)) *
        Math.ceil((area.maxZ - area.minZ) / (tileSizeInCells * cellSize));
      while (getTilesCount() > tilesCountMax) {
        tileSizeInCells *= 2;
      }
      this.tileSizeInCells = tileSizeInCells;
      this.tileWidth = tileSizeInCells * cellSize;
      // Twice the tiles are kept for obstacles moving out of the area the
      // navigation mesh was built for (with the tiles of its border).
      this.maxTilesCount = RecastNav.dtNextPow2(
        Math.max(2, (Math.ceil(Math.sqrt(getTilesCount())) + 2) ** 2 * 2)
      );
      this.borderSizeInCells = configuration.walkableRadius + 3;
      this.borderWidth = this.borderSizeInCells * cellSize;

      this.recast = new recastModule.Recast();
      this.detourNavMeshBuilder = new recastModule.DetourNavMeshBuilder();
      const detour = new recastModule.Detour();
      this.detourFailureStatus = detour.FAILURE;
      recastModule.destroy(detour);
      this.buildContext = new RecastNav.RecastBuildContext(false);
      this.vertices = new RecastNav.FloatArray();
      this.triangles = new RecastNav.IntArray();
    }

    createNavMesh(): RecastNav.NavMesh | null {
      const navMesh = new RecastNav.NavMesh();
      const navMeshParams = RecastNav.NavMeshParams.create({
        orig: { x: this.originX, y: 0, z: this.originZ },
        tileWidth: this.tileWidth,
        tileHeight: this.tileWidth,
        maxTiles: this.maxTilesCount,
        maxPolys:
          1 << (polygonsAndTileBits - RecastNav.dtIlog2(this.maxTilesCount)),
      });
      const isInitialized = navMesh.initTiled(navMeshParams);
      this.recastModule.destroy(navMeshParams.raw);
      if (!isInitialized) {
        navMesh.destroy();
        return null;
      }
      return navMesh;
    }

    getTileKey(tileX: integer, tileY: integer): integer {
      // Tiles can have negative coordinates when obstacles move out of the
      // area the navigation mesh was built for.
      return (tileX + 0x8000) * 0x10000 + (tileY + 0x8000);
    }

    getTileX(x: float): integer {
      return Math.floor((x - this.originX) / this.tileWidth);
    }

    getTileY(z: float): integer {
      return Math.floor((z - this.originZ) / this.tileWidth);
    }

    /**
     * Call a function for each tile overlapping an area.
     */
    forEachTileIn(
      area: NavMeshArea,
      callback: (tileX: integer, tileY: integer) => void
    ): void {
      const minTileX = this.getTileX(area.minX);
      const minTileY = this.getTileY(area.minZ);
      const maxTileX = this.getTileX(area.maxX);
      const maxTileY = this.getTileY(area.maxZ);
      for (let tileY = minTileY; tileY <= maxTileY; tileY++) {
        for (let tileX = minTileX; tileX <= maxTileX; tileX++) {
          callback(tileX, tileY);
        }
      }
    }

    /**
     * Call a function for each tile that must be built again when the
     * geometry of an area changes: the tiles overlapping it, and the ones
     * whose border overlaps it.
     */
    forEachTileAffectedBy(
      area: NavMeshArea,
      callback: (tileX: integer, tileY: integer) => void
    ): void {
      this.forEachTileIn(
        {
          minX: area.minX - this.borderWidth,
          minZ: area.minZ - this.borderWidth,
          maxX: area.maxX + this.borderWidth,
          maxZ: area.maxZ + this.borderWidth,
        },
        callback
      );
    }

    /**
     * The area whose geometry is used to build a tile: the tile and its
     * border.
     */
    getTileGeometryArea(tileX: integer, tileY: integer): NavMeshArea {
      const minX = this.originX + tileX * this.tileWidth;
      const minZ = this.originZ + tileY * this.tileWidth;
      return {
        minX: minX - this.borderWidth,
        minZ: minZ - this.borderWidth,
        maxX: minX + this.tileWidth + this.borderWidth,
        maxZ: minZ + this.tileWidth + this.borderWidth,
      };
    }

    /**
     * Build a tile and replace it in the navigation mesh.
     * @param vertices The X, Y and Z of the 3 vertices of each triangle
     * touching the tile geometry area (see `getTileGeometryArea`).
     * @returns false if the navigation mesh can't contain more tiles.
     */
    buildTile(
      navMesh: RecastNav.NavMesh,
      tileX: integer,
      tileY: integer,
      vertices: Array<float>
    ): boolean {
      this.removeTile(navMesh, tileX, tileY);
      if (vertices.length === 0) {
        return true;
      }
      const polygonMesh = this.buildPolygonMesh(tileX, tileY, vertices);
      if (!polygonMesh) {
        return true;
      }
      const { polyMesh, polyMeshDetail } = polygonMesh;
      const tileAddition = this.addTile(
        navMesh,
        tileX,
        tileY,
        polyMesh,
        polyMeshDetail
      );
      this.recast.freePolyMesh(polyMesh);
      this.recast.freePolyMeshDetail(polyMeshDetail);
      if (tileAddition === 'added') {
        this.tilesCount++;
        return true;
      }
      if (tileAddition === 'refused' && this.tilesCount >= this.maxTilesCount) {
        return false;
      }
      // Building the navigation mesh again would give the same tile.
      logger.warn(
        `The tile ${tileX};${tileY} of the navigation mesh has too many polygons or vertices: try bigger cells.`
      );
      return true;
    }

    removeTile(navMesh: RecastNav.NavMesh, tileX: integer, tileY: integer) {
      const tileRef = navMesh.getTileRefAt(tileX, tileY, 0);
      if (tileRef) {
        navMesh.removeTile(tileRef);
        this.tilesCount--;
      }
    }

    /**
     * The usual steps of Recast for a tile: voxelize the triangles, keep the
     * floors where characters fit, and turn them into polygons.
     */
    private buildPolygonMesh(
      tileX: integer,
      tileY: integer,
      vertices: Array<float>
    ): {
      polyMesh: RecastNav.RawModule.rcPolyMesh;
      polyMeshDetail: RecastNav.RawModule.rcPolyMeshDetail;
    } | null {
      const { recast, configuration } = this;
      const context = this.buildContext.raw;
      const {
        cellSize,
        cellHeight,
        walkableHeight,
        walkableClimb,
        walkableRadius,
      } = configuration;

      const heightfield = recast.allocHeightfield();
      const isRasterized = this.rasterizeTriangles(
        tileX,
        tileY,
        vertices,
        heightfield
      );
      if (!isRasterized) {
        recast.freeHeightfield(heightfield);
        return null;
      }
      recast.filterLowHangingWalkableObstacles(
        context,
        walkableClimb,
        heightfield
      );
      recast.filterLedgeSpans(
        context,
        walkableHeight,
        walkableClimb,
        heightfield
      );
      recast.filterWalkableLowHeightSpans(context, walkableHeight, heightfield);

      const compactHeightfield = recast.allocCompactHeightfield();
      const isCompacted = recast.buildCompactHeightfield(
        context,
        walkableHeight,
        walkableClimb,
        heightfield,
        compactHeightfield
      );
      recast.freeHeightfield(heightfield);
      if (
        !isCompacted ||
        !recast.erodeWalkableArea(
          context,
          walkableRadius,
          compactHeightfield
        ) ||
        !recast.buildDistanceField(context, compactHeightfield) ||
        !recast.buildRegions(
          context,
          compactHeightfield,
          this.borderSizeInCells,
          minRegionArea,
          mergeRegionArea
        )
      ) {
        recast.freeCompactHeightfield(compactHeightfield);
        return null;
      }

      const contourSet = recast.allocContourSet();
      const polyMesh = recast.allocPolyMesh();
      const polyMeshDetail = recast.allocPolyMeshDetail();
      const isBuilt =
        recast.buildContours(
          context,
          compactHeightfield,
          maxSimplificationError,
          maxEdgeLength,
          contourSet,
          this.recastModule.RC_CONTOUR_TESS_WALL_EDGES
        ) &&
        recast.buildPolyMesh(
          context,
          contourSet,
          maxVerticesPerPolygon,
          polyMesh
        ) &&
        polyMesh.get_npolys() > 0 &&
        recast.buildPolyMeshDetail(
          context,
          polyMesh,
          compactHeightfield,
          detailSampleDistanceInCells * cellSize,
          detailSampleMaxErrorInCells * cellHeight,
          polyMeshDetail
        );
      recast.freeContourSet(contourSet);
      recast.freeCompactHeightfield(compactHeightfield);
      if (!isBuilt) {
        recast.freePolyMesh(polyMesh);
        recast.freePolyMeshDetail(polyMeshDetail);
        return null;
      }
      return { polyMesh, polyMeshDetail };
    }

    private rasterizeTriangles(
      tileX: integer,
      tileY: integer,
      vertices: Array<float>,
      heightfield: RecastNav.RawModule.rcHeightfield
    ): boolean {
      const { recast, configuration } = this;
      const context = this.buildContext.raw;
      let minY = Number.POSITIVE_INFINITY;
      let maxY = Number.NEGATIVE_INFINITY;
      for (let index = 1; index < vertices.length; index += 3) {
        minY = Math.min(minY, vertices[index]);
        maxY = Math.max(maxY, vertices[index]);
      }
      // Cells of all tiles are aligned on the same heights, so that the
      // edges of neighbor tiles are at the same heights.
      minY =
        Math.floor(minY / configuration.cellHeight) * configuration.cellHeight;
      const area = this.getTileGeometryArea(tileX, tileY);
      const sizeInCells = this.tileSizeInCells + this.borderSizeInCells * 2;
      if (
        !recast.createHeightfield(
          context,
          heightfield,
          sizeInCells,
          sizeInCells,
          [area.minX, minY, area.minZ],
          // A flat ground needs a heightfield of at least one cell.
          [area.maxX, maxY + configuration.cellHeight, area.maxZ],
          configuration.cellSize,
          configuration.cellHeight
        )
      ) {
        return false;
      }
      const vertexCount = vertices.length / 3;
      const { triangleIndices } = this;
      for (let index = triangleIndices.length; index < vertexCount; index++) {
        triangleIndices.push(index);
      }
      triangleIndices.length = vertexCount;
      this.vertices.copy(vertices);
      this.triangles.copy(triangleIndices);
      const triangleCount = vertexCount / 3;
      const triangleAreas = new this.recastModule.UnsignedCharArray();
      triangleAreas.resize(triangleCount);
      recast.markWalkableTriangles(
        context,
        configuration.walkableSlopeAngle,
        this.vertices.raw,
        vertexCount,
        this.triangles.raw,
        triangleCount,
        triangleAreas
      );
      const isRasterized = recast.rasterizeTriangles(
        context,
        this.vertices.raw,
        vertexCount,
        this.triangles.raw,
        triangleAreas,
        triangleCount,
        heightfield,
        configuration.walkableClimb
      );
      this.recastModule.destroy(triangleAreas);
      return isRasterized;
    }

    private addTile(
      navMesh: RecastNav.NavMesh,
      tileX: integer,
      tileY: integer,
      polyMesh: RecastNav.RawModule.rcPolyMesh,
      polyMeshDetail: RecastNav.RawModule.rcPolyMeshDetail
    ): NavMeshTileAddition {
      const { recastModule, configuration } = this;
      const walkableAreaId = this.recast.WALKABLE_AREA;
      for (let index = 0; index < polyMesh.get_npolys(); index++) {
        if (polyMesh.get_areas(index) === walkableAreaId) {
          // Detour uses area 0 as the default area, with the flag 1 for
          // the default query filter.
          polyMesh.set_areas(index, 0);
          polyMesh.set_flags(index, 1);
        }
      }
      const params = new recastModule.dtNavMeshCreateParams();
      this.detourNavMeshBuilder.setPolyMeshCreateParams(params, polyMesh);
      this.detourNavMeshBuilder.setPolyMeshDetailCreateParams(
        params,
        polyMeshDetail
      );
      params.set_walkableHeight(
        configuration.walkableHeight * configuration.cellHeight
      );
      params.set_walkableRadius(
        configuration.walkableRadius * configuration.cellSize
      );
      params.set_walkableClimb(
        configuration.walkableClimb * configuration.cellHeight
      );
      params.set_cs(configuration.cellSize);
      params.set_ch(configuration.cellHeight);
      params.set_buildBvTree(true);
      params.set_tileX(tileX);
      params.set_tileY(tileY);
      params.set_tileLayer(0);
      const result = this.detourNavMeshBuilder.createNavMeshData(params);
      recastModule.destroy(params);
      const navMeshData = result.get_navMeshData();
      const isCreated = result.get_success();
      recastModule.destroy(result);
      if (!isCreated) {
        recastModule.destroy(navMeshData);
        // The polygons can't be converted for Detour (too many vertices).
        return 'notConverted';
      }
      const { status } = navMesh.addTile(
        RecastNav.UnsignedCharArray.fromRaw(navMeshData),
        recastModule.DT_TILE_FREE_DATA,
        0
      );
      const isAdded = (status & this.detourFailureStatus) === 0;
      // The navigation mesh frees the data with the tile: only the array
      // object is destroyed.
      if (isAdded) {
        navMeshData.set_isView(true);
      }
      recastModule.destroy(navMeshData);
      return isAdded ? 'added' : 'refused';
    }

    dispose(): void {
      const { recastModule } = this;
      recastModule.destroy(this.recast);
      recastModule.destroy(this.detourNavMeshBuilder);
      recastModule.destroy(this.buildContext.raw);
      this.vertices.destroy();
      this.triangles.destroy();
    }
  }
}
