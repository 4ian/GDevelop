namespace gdjs {
  export interface RuntimeInstanceContainer {
    navMeshObstaclesManager: gdjs.NavMeshObstaclesManager;
  }

  const cubePositions = [
    0.5, 0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5, -0.5, 0.5, -0.5, -0.5, -0.5, 0.5,
    -0.5, -0.5, -0.5, -0.5, -0.5, 0.5, 0.5, -0.5, -0.5, 0.5, 0.5, 0.5, 0.5,
  ];
  const cubeIndices = [
    0, 1, 2, 1, 3, 2, 4, 5, 6, 5, 7, 6, 4, 6, 2, 6, 8, 2, 7, 5, 1, 5, 3, 1, 6,
    7, 8, 7, 1, 8, 2, 3, 4, 3, 5, 4,
  ];

  const isModel3D = (
    object: gdjs.RuntimeObject
  ): object is gdjs.Model3DRuntimeObject => {
    //@ts-ignore We are checking if the methods are present.
    return object._modelResourceName;
  };

  /**
   * Building a tile of 32x32 cells takes 1 to 3 milliseconds. When the
   * navigation mesh is first built (a whole level), at most this many cells
   * of tiles are built per frame.
   */
  const cellsBuiltPerFrameMaxForFirstBuild = 4 * 32 * 32;
  /**
   * After obstacles changed, at most one tile is built per frame, so that
   * frames stay regular, and at most this many per second, whatever the
   * frame rate.
   */
  const tilesRebuiltPerSecondMax = 40;
  /**
   * Obstacles moving continuously (pushed, falling...) would rebuild their
   * tiles at every frame: each tile is rebuilt at most 10 times per second.
   */
  const tileRebuildIntervalMin = 0.1;
  /**
   * Paths are searched again at most once per second after the navigation
   * mesh changed, like when the whole navigation mesh was rebuilt.
   */
  const pathsRefreshInterval = 1;
  /**
   * How far from a position the navigation mesh is searched for characters
   * and destinations.
   */
  const searchHalfExtent = 100;
  /**
   * The debug draw shows the tiles rebuilt during the last second, and is
   * drawn again at most 4 times per second (drawing the whole navigation
   * mesh is slow).
   */
  const debugDrawnRebuiltTileDuration = 1;
  const debugDrawIntervalMin = 0.25;

  type NavMeshTileCoordinates = { x: integer; y: integer };

  /**
   * NavMeshObstaclesManager manages the common objects shared by objects
   * having a pathfinding behavior: In particular, the obstacles behaviors are
   * required to declare themselves (see
   * `NavMeshObstaclesManager.addObstacle`) to the manager of their
   * associated container (see `NavMeshObstaclesManager.getManager`).
   *
   * The navigation mesh is made of tiles: when an obstacle changes, only the
   * tiles around it are built again.
   * @category Behaviors > NavMesh pathfinding
   */
  export class NavMeshObstaclesManager {
    instanceContainer: gdjs.RuntimeInstanceContainer;
    obstacles = new Set<NavMeshObstacleRuntimeBehavior>();
    characters = new Set<NavMeshCharacterRuntimeBehavior>();
    is3D = false;
    navMesh: RecastNav.NavMesh | null = null;
    private tileBuilder: gdjs.NavMeshTileBuilder | null = null;
    private obstacleGeometries = new Map<
      NavMeshObstacleRuntimeBehavior,
      gdjs.NavMeshObstacleGeometry
    >();
    /** The tiles to build, in the order they are built. */
    private tilesToBuild = new Map<integer, NavMeshTileCoordinates>();
    private tileVertices: Array<float> = [];
    /** In 2D, the ground goes around the obstacles. */
    private groundArea: gdjs.NavMeshArea | null = null;
    private obstaclesAreaAroundGround: gdjs.NavMeshArea | null = null;
    private isFirstBuildInProgress = false;
    private haveTilesChangedSincePathsRefresh = false;
    private timeSincePathsRefresh: float = 0;
    /** The time of the manager, to know when tiles were built. */
    private time: float = 0;
    private tileBuildTimes = new Map<integer, float>();
    /** How many tiles can be rebuilt now (see `tilesRebuiltPerSecondMax`). */
    private tileRebuildsAllowance: float = 1;
    private crowdCapacity: integer = 0;
    private crowdAgentRadiusMax: float = 0;
    cellSize: float = 10;
    cellDepth: float = 10;
    slopeMaxAngle: float = 50;
    walkableRadius: float = -1;
    walkableDepth: float = 150;
    stairHeightMax: float = 20;
    speedScaleY: float = 1;
    inverseSpeedScaleY: float = 1;
    timeSinceLastNavMeshLastRebuild: float = 1;
    isNavMeshDirty = true;
    isFirstFrame = true;
    crowd: RecastNav.Crowd | null = null;
    hasStepped = false;
    debuggerRenderer: gdjs.NavMeshDebuggerRenderer | null = null;
    private isDebugDrawOutdated = false;
    private debugDrawTime: float = Number.NEGATIVE_INFINITY;
    private firstBuildEndTime: float = Number.POSITIVE_INFINITY;

    constructor(instanceContainer: gdjs.RuntimeInstanceContainer, sharedData) {
      this.instanceContainer = instanceContainer;
      if (!sharedData) {
        // It can happens when there is no object with the character behavior.
        return;
      }
      this.cellSize = Math.max(0, sharedData.cellSize) || 10;
      this.cellDepth = sharedData.cellDepth;
      this.slopeMaxAngle = sharedData.slopeMaxAngle;
      this.stairHeightMax = sharedData.stairHeightMax;
      this.walkableDepth = sharedData.walkableDepth;
      this.walkableRadius = sharedData.walkableRadius;
      this.speedScaleY =
        sharedData.speedScaleY > 0 ? sharedData.speedScaleY : 1;
      this.inverseSpeedScaleY = 1 / this.speedScaleY;
    }

    /**
     * Get the obstacles manager of an instance container.
     */
    static getManager(
      instanceContainer: gdjs.RuntimeInstanceContainer
    ): gdjs.NavMeshObstaclesManager {
      if (!instanceContainer.navMeshObstaclesManager) {
        // Create the shared manager if necessary.
        const initialData =
          instanceContainer.getInitialSharedDataForBehavior('NavMeshCharacter');
        instanceContainer.navMeshObstaclesManager =
          new gdjs.NavMeshObstaclesManager(instanceContainer, initialData);
      }
      return instanceContainer.navMeshObstaclesManager;
    }

    step(timeDelta: float): void {
      if (this.hasStepped) {
        return;
      }
      this.hasStepped = true;
      this.timeSinceLastNavMeshLastRebuild += timeDelta;
      this.timeSincePathsRefresh += timeDelta;
      this.time += timeDelta;
      this.tileRebuildsAllowance = Math.min(
        1,
        this.tileRebuildsAllowance + timeDelta * tilesRebuiltPerSecondMax
      );
      // Don't try to build the nav mesh before the events get a chance
      // to build the level.
      if (!this.isFirstFrame) {
        this.rebuildNavMeshIfNeeded();
        this.buildTilesOfFrame();
      }
      this.isFirstFrame = false;
      this.updateDebugDraw();

      if (!this.crowd) {
        return;
      }
      this.refreshPathsIfNeeded();
      for (const character of this.characters) {
        this.placeLostAgentBackOnNavMesh(character);
        character.teleportAgentToObjectIfNeeded();
      }
      this.crowd.update(timeDelta); //1 / 60, timeDelta, 8);
    }

    /**
     * Build the whole navigation mesh again (for instance, when the radius
     * of characters changed). Obstacles only rebuild the tiles around them
     * (see `updateObstacle`).
     */
    invalidateNavMesh(): void {
      this.isNavMeshDirty = true;
    }

    rebuildNavMeshIfNeeded(): void {
      if (!this.isNavMeshDirty || this.timeSinceLastNavMeshLastRebuild < 1) {
        return;
      }
      this.timeSinceLastNavMeshLastRebuild = 0;
      this.isNavMeshDirty = false;
      this.buildNavMesh();
    }

    private buildNavMesh(): void {
      const recastModule = gdjs.NavMeshTileBuilder.recastModule;
      if (!recastModule) {
        return;
      }
      const obstaclesArea = this.getObstaclesArea();
      const groundArea = this.is3D ? null : this.getGroundArea(obstaclesArea);
      const area = groundArea || obstaclesArea;
      if (!area) {
        return;
      }
      const tileBuilder = new gdjs.NavMeshTileBuilder(
        recastModule,
        this.getTileConfiguration(),
        area
      );
      const navMesh = tileBuilder.createNavMesh();
      if (!navMesh) {
        tileBuilder.dispose();
        return;
      }
      const isFirstBuild = !this.navMesh;
      const oldNavMesh = this.navMesh;
      const oldTileBuilder = this.tileBuilder;
      const oldCrowd = this.crowd;
      this.navMesh = navMesh;
      this.tileBuilder = tileBuilder;
      this.groundArea = groundArea;
      this.obstaclesAreaAroundGround = groundArea ? obstaclesArea : null;

      this.tilesToBuild.clear();
      this.tileBuildTimes.clear();
      if (groundArea) {
        this.addTilesToBuildIn(groundArea);
      } else {
        for (const obstacle of this.obstacles) {
          this.addTilesToBuildIn(this.getObstacleGeometry(obstacle).area);
        }
      }
      if (isFirstBuild) {
        // The tiles are built over several frames, the ones around
        // characters first. Others are built when needed by a query (see
        // `buildTilesAround`).
        this.isFirstBuildInProgress = true;
        this.sortTilesToBuildByDistanceToCharacters();
      } else {
        this.isFirstBuildInProgress = false;
        this.buildAllTiles();
      }

      this.createCrowd();
      if (oldCrowd) {
        oldCrowd.destroy();
      }
      if (oldNavMesh) {
        oldNavMesh.destroy();
      }
      if (oldTileBuilder) {
        oldTileBuilder.dispose();
      }
      this.isDebugDrawOutdated = true;
    }

    private createCrowd(): void {
      if (!this.navMesh) {
        return;
      }
      this.crowdCapacity = this.characters.size + 100;
      this.crowdAgentRadiusMax = this.getCharacterRadiusMax();
      this.crowd = new RecastNav.Crowd(this.navMesh, {
        maxAgents: this.crowdCapacity,
        maxAgentRadius: this.crowdAgentRadiusMax,
      });
      for (const character of this.characters) {
        this.buildCharacterAgent(character);
      }
    }

    /** The height of the cells of the navigation mesh, along the Z axis. */
    getCellHeight(): float {
      return this.is3D ? this.cellDepth : this.cellSize;
    }

    private getTileConfiguration(): gdjs.NavMeshTileConfiguration {
      let walkableClimb = 0.1;
      let walkableHeight = 2;
      if (this.is3D) {
        const walkableClimbMin = this.slopeMaxAngle > 40 ? 2 : 1;
        walkableClimb = Math.max(
          walkableClimbMin,
          this.stairHeightMax / this.cellDepth
        );
        walkableHeight = this.walkableDepth / this.cellDepth;
      }
      // Recast takes distances in whole cells.
      return {
        cellSize: this.cellSize,
        cellHeight: this.getCellHeight(),
        walkableSlopeAngle: this.slopeMaxAngle,
        walkableHeight: Math.floor(walkableHeight),
        walkableClimb: Math.floor(walkableClimb),
        walkableRadius: this.getWalkableRadiusInCells(),
      };
    }

    private getWalkableRadiusInCells(): integer {
      return Math.floor(
        (this.walkableRadius < 0
          ? this.getCharacterRadiusMax()
          : this.walkableRadius) / this.cellSize
      );
    }

    private getCharacterRadiusMax(): float {
      let characterRadiusMax = 0;
      for (const character of this.characters) {
        characterRadiusMax = Math.max(
          characterRadiusMax,
          character.getRadius()
        );
      }
      return characterRadiusMax;
    }

    private getObstaclesArea(): gdjs.NavMeshArea | null {
      let area: gdjs.NavMeshArea | null = null;
      for (const obstacle of this.obstacles) {
        const geometry = this.getObstacleGeometry(obstacle);
        if (geometry.isEmpty()) {
          continue;
        }
        area = area ? getAreasUnion(area, geometry.area) : { ...geometry.area };
      }
      return area;
    }

    /**
     * The ground of 2D navigation meshes covers the obstacles, and extends
     * around them in case the area is not closed by obstacles and
     * characters are expected to go around them.
     */
    private getGroundArea(
      obstaclesArea: gdjs.NavMeshArea | null
    ): gdjs.NavMeshArea {
      const game = this.instanceContainer.getGame();
      if (!obstaclesArea) {
        return {
          minX: 0,
          minZ: 0,
          maxX: game.getGameResolutionWidth(),
          maxZ: game.getGameResolutionHeight() * this.inverseSpeedScaleY,
        };
      }
      const gameSize = Math.max(
        game.getGameResolutionWidth(),
        game.getGameResolutionHeight()
      );
      return {
        minX: obstaclesArea.minX - gameSize,
        maxX: obstaclesArea.maxX + gameSize,
        minZ: (obstaclesArea.minZ - gameSize) * this.inverseSpeedScaleY,
        maxZ: (obstaclesArea.maxZ + gameSize) * this.inverseSpeedScaleY,
      };
    }

    private addTilesToBuildIn(area: gdjs.NavMeshArea): void {
      const { tileBuilder } = this;
      if (!tileBuilder || !Number.isFinite(area.minX)) {
        return;
      }
      tileBuilder.forEachTileAffectedBy(area, (tileX, tileY) => {
        const tileKey = tileBuilder.getTileKey(tileX, tileY);
        if (!this.tilesToBuild.has(tileKey)) {
          this.tilesToBuild.set(tileKey, { x: tileX, y: tileY });
        }
      });
    }

    private sortTilesToBuildByDistanceToCharacters(): void {
      const { tileBuilder } = this;
      if (!tileBuilder || this.characters.size === 0) {
        return;
      }
      const getDistanceToCharacters = (tile: NavMeshTileCoordinates) => {
        const area = tileBuilder.getTileGeometryArea(tile.x, tile.y);
        const tileCenterX = (area.minX + area.maxX) / 2;
        const tileCenterZ = (area.minZ + area.maxZ) / 2;
        let distanceMin = Number.POSITIVE_INFINITY;
        for (const character of this.characters) {
          distanceMin = Math.min(
            distanceMin,
            Math.hypot(
              character.owner.getX() - tileCenterX,
              this.toNavMeshZ(character.owner.getY()) - tileCenterZ
            )
          );
        }
        return distanceMin;
      };
      const tilesWithDistance = Array.from(this.tilesToBuild.entries()).map(
        ([tileKey, tile]) => ({
          tileKey,
          tile,
          distance: getDistanceToCharacters(tile),
        })
      );
      tilesWithDistance.sort(
        (a, b) => a.distance - b.distance || a.tileKey - b.tileKey
      );
      this.tilesToBuild.clear();
      for (const { tileKey, tile } of tilesWithDistance) {
        this.tilesToBuild.set(tileKey, tile);
      }
    }

    private toNavMeshZ(sceneY: float): float {
      return this.is3D ? sceneY : sceneY * this.inverseSpeedScaleY;
    }

    private buildAllTiles(): void {
      for (const tile of this.tilesToBuild.values()) {
        this.buildTile(tile);
      }
      this.tilesToBuild.clear();
      this.onTilesBuilt();
    }

    private buildTilesOfFrame(): void {
      const { tileBuilder } = this;
      if (
        !tileBuilder ||
        this.tilesToBuild.size === 0 ||
        (!this.isFirstBuildInProgress && this.tileRebuildsAllowance < 1)
      ) {
        return;
      }
      if (
        !this.isFirstBuildInProgress &&
        this.getWalkableRadiusInCells() !==
          tileBuilder.configuration.walkableRadius
      ) {
        // The characters changed since the navigation mesh was built: all
        // the tiles must be eroded by their new radius.
        this.invalidateNavMesh();
      }
      const tileCellsCount =
        tileBuilder.tileSizeInCells * tileBuilder.tileSizeInCells;
      const cellsBuiltPerFrameMax = this.isFirstBuildInProgress
        ? cellsBuiltPerFrameMaxForFirstBuild
        : tileCellsCount;
      let builtCellsCount = 0;
      for (const [tileKey, tile] of this.tilesToBuild) {
        if (builtCellsCount >= cellsBuiltPerFrameMax) {
          break;
        }
        const tileBuildTime = this.tileBuildTimes.get(tileKey);
        if (
          tileBuildTime !== undefined &&
          this.time - tileBuildTime < tileRebuildIntervalMin
        ) {
          continue;
        }
        this.tilesToBuild.delete(tileKey);
        this.buildTile(tile);
        builtCellsCount += tileCellsCount;
      }
      if (builtCellsCount > 0) {
        this.tileRebuildsAllowance = 0;
        this.onTilesBuilt();
      }
    }

    /**
     * Build the tiles waiting to be built around a position of the scene,
     * for queries that can't wait for them.
     */
    buildTilesAround(sceneX: float, sceneY: float): void {
      const { tileBuilder } = this;
      if (!tileBuilder || this.tilesToBuild.size === 0) {
        return;
      }
      const z = this.toNavMeshZ(sceneY);
      let hasBuiltTiles = false;
      tileBuilder.forEachTileIn(
        {
          minX: sceneX - searchHalfExtent,
          minZ: z - searchHalfExtent,
          maxX: sceneX + searchHalfExtent,
          maxZ: z + searchHalfExtent,
        },
        (tileX, tileY) => {
          const tileKey = tileBuilder.getTileKey(tileX, tileY);
          const tile = this.tilesToBuild.get(tileKey);
          if (!tile) {
            return;
          }
          this.tilesToBuild.delete(tileKey);
          this.buildTile(tile);
          hasBuiltTiles = true;
        }
      );
      if (hasBuiltTiles) {
        this.onTilesBuilt();
      }
    }

    private buildTile(tile: NavMeshTileCoordinates): void {
      const { navMesh, tileBuilder } = this;
      if (!navMesh || !tileBuilder) {
        return;
      }
      const geometryArea = tileBuilder.getTileGeometryArea(tile.x, tile.y);
      const vertices = this.tileVertices;
      vertices.length = 0;
      for (const obstacle of this.obstacles) {
        const geometry = this.getObstacleGeometry(obstacle);
        if (geometry.overlaps(geometryArea)) {
          geometry.appendTileTriangles(tileBuilder, tile.x, tile.y, vertices);
        }
      }
      if (this.groundArea) {
        this.addGroundFor2D(this.groundArea, geometryArea, vertices);
      }
      this.tileBuildTimes.set(
        tileBuilder.getTileKey(tile.x, tile.y),
        this.time
      );
      const isBuilt = tileBuilder.buildTile(navMesh, tile.x, tile.y, vertices);
      if (!isBuilt) {
        // Obstacles moved too far from where they were: the navigation mesh
        // is built again for their new area.
        this.invalidateNavMesh();
      }
      this.haveTilesChangedSincePathsRefresh = true;
    }

    private onTilesBuilt(): void {
      if (this.isFirstBuildInProgress && this.tilesToBuild.size === 0) {
        this.isFirstBuildInProgress = false;
        this.firstBuildEndTime = this.time;
        // Paths found while tiles were missing can now be improved.
        this.timeSincePathsRefresh = pathsRefreshInterval;
      }
      this.isDebugDrawOutdated = true;
    }

    private updateDebugDraw(): void {
      if (
        !this.debuggerRenderer ||
        !this.isDebugDrawOutdated ||
        this.time - this.debugDrawTime < debugDrawIntervalMin
      ) {
        return;
      }
      this.debugDrawTime = this.time;
      this.debuggerRenderer.renderFor3D();
      // Rebuilt tiles are drawn again when they are no longer recent.
      this.isDebugDrawOutdated = false;
      for (const tileBuildTime of this.tileBuildTimes.values()) {
        if (this.isRecentTileRebuild(tileBuildTime)) {
          this.isDebugDrawOutdated = true;
          break;
        }
      }
    }

    private isRecentTileRebuild(tileBuildTime: float): boolean {
      return (
        tileBuildTime > this.firstBuildEndTime &&
        this.time - tileBuildTime < debugDrawnRebuiltTileDuration
      );
    }

    /**
     * How the debug draw shows the tile at a position of the navigation
     * mesh: tiles are drawn like a checkerboard, and the ones rebuilt during
     * the last second stand out.
     */
    getTileDebugDrawing(x: float, z: float): 'even' | 'odd' | 'rebuilt' {
      const { tileBuilder } = this;
      if (!tileBuilder) {
        return 'even';
      }
      const tileX = tileBuilder.getTileX(x);
      const tileY = tileBuilder.getTileY(z);
      const tileBuildTime = this.tileBuildTimes.get(
        tileBuilder.getTileKey(tileX, tileY)
      );
      if (
        tileBuildTime !== undefined &&
        this.isRecentTileRebuild(tileBuildTime)
      ) {
        return 'rebuilt';
      }
      return (tileX + tileY) % 2 === 0 ? 'even' : 'odd';
    }

    private refreshPathsIfNeeded(): void {
      if (
        !this.haveTilesChangedSincePathsRefresh ||
        this.timeSincePathsRefresh < pathsRefreshInterval
      ) {
        return;
      }
      this.haveTilesChangedSincePathsRefresh = false;
      this.timeSincePathsRefresh = 0;
      for (const character of this.characters) {
        character.refreshPath();
      }
    }

    /**
     * Agents are lost by the crowd when the tile under them is built again
     * without any floor near them (an obstacle came on them).
     */
    private placeLostAgentBackOnNavMesh(
      character: NavMeshCharacterRuntimeBehavior
    ): void {
      const agent = character._agent;
      const recastModule = gdjs.NavMeshTileBuilder.recastModule;
      if (
        !agent ||
        !this.crowd ||
        !recastModule ||
        agent.state() !== recastModule.DT_CROWDAGENT_STATE_INVALID
      ) {
        return;
      }
      const velocity = agent.velocity();
      this.crowd.removeAgent(agent);
      character._agent = null;
      this.buildCharacterAgent(character);
      // Set by `buildCharacterAgent`.
      const newAgent = character._agent as RecastNav.CrowdAgent | null;
      if (newAgent) {
        newAgent.raw.set_vel(0, velocity.x);
        newAgent.raw.set_vel(1, velocity.y);
        newAgent.raw.set_vel(2, velocity.z);
      }
    }

    private getObstacleGeometry(
      obstacle: NavMeshObstacleRuntimeBehavior
    ): gdjs.NavMeshObstacleGeometry {
      let geometry = this.obstacleGeometries.get(obstacle);
      if (!geometry) {
        geometry = this.createObstacleGeometry(obstacle);
        this.obstacleGeometries.set(obstacle, geometry);
      }
      return geometry;
    }

    private createObstacleGeometry(
      obstacle: NavMeshObstacleRuntimeBehavior
    ): gdjs.NavMeshObstacleGeometry {
      const positions: Array<float> = [];
      const indices: Array<integer> = [];
      const object = obstacle.owner;
      // Surfaces are in 3D: they are ignored by 2D navigation meshes.
      const surface = this.is3D ? object.getSurface() : null;
      if (surface && gdjs.Base3DHandler.is3D(object)) {
        this.addSurfaceFor(object, surface, positions, indices);
      } else if (gdjs.Base3DHandler.is3D(object)) {
        if (isModel3D(object) && obstacle._shape === 'Mesh') {
          this.addMeshFor(object, obstacle, positions, indices);
        } else {
          this.addBoxFor(object, positions, indices);
        }
      } else if (!this.is3D) {
        this.addPolygonsFor(object, positions, indices);
      }
      if (obstacle._isObstacleOnly) {
        this.makeTrianglesNotWalkable(positions, indices, 0);
      }
      return new gdjs.NavMeshObstacleGeometry(positions, indices);
    }

    setDebugDrawEnabled(
      instanceContainer: gdjs.RuntimeInstanceContainer,
      enableDebugDraw: boolean
    ): void {
      if (!this.debuggerRenderer) {
        this.debuggerRenderer = new gdjs.NavMeshDebuggerRenderer(this);
      }
      this.debuggerRenderer.setEnabled(instanceContainer, enableDebugDraw);
    }

    /**
     * Add the part of the ground in the area of a tile.
     */
    private addGroundFor2D(
      groundArea: gdjs.NavMeshArea,
      tileGeometryArea: gdjs.NavMeshArea,
      vertices: Array<float>
    ): void {
      const minX = Math.max(groundArea.minX, tileGeometryArea.minX);
      const minZ = Math.max(groundArea.minZ, tileGeometryArea.minZ);
      const maxX = Math.min(groundArea.maxX, tileGeometryArea.maxX);
      const maxZ = Math.min(groundArea.maxZ, tileGeometryArea.maxZ);
      if (minX >= maxX || minZ >= maxZ) {
        return;
      }
      // Y is the top for Recast
      const minY = -this.cellSize;
      const maxY = -1;
      for (const vertexIndex of cubeIndices) {
        const index = vertexIndex * 3;
        vertices.push(
          minX + (cubePositions[index] + 0.5) * (maxX - minX),
          minY + (cubePositions[index + 1] + 0.5) * (maxY - minY),
          minZ + (cubePositions[index + 2] + 0.5) * (maxZ - minZ)
        );
      }
    }

    private addPolygonsFor(
      object: gdjs.RuntimeObject,
      positions: Array<float>,
      indices: Array<integer>
    ): void {
      const vertexFlags: Array<boolean> = [];
      for (const hitBox of object.getHitBoxes()) {
        let indicesOffset = Math.round(positions.length / 3);
        const vertices: Array<Point> = hitBox.vertices.map(([x, y]) => ({
          x,
          y,
        }));
        if (
          getSignedAreaX2(
            vertices[0].x,
            vertices[0].y,
            vertices[1].x,
            vertices[1].y,
            vertices[2].x,
            vertices[2].y
          ) > 0
        ) {
          vertices.reverse();
        }
        const zMax = this.cellSize;
        const zMin = -1;
        triangulate(
          vertices,
          vertexFlags,
          (p1: Point, p2: Point, p3: Point) => {
            // Top
            positions.push(p1.x, zMax, p1.y * this.inverseSpeedScaleY);
            positions.push(p2.x, zMax, p2.y * this.inverseSpeedScaleY);
            positions.push(p3.x, zMax, p3.y * this.inverseSpeedScaleY);
            indices.push(
              indicesOffset + 0,
              indicesOffset + 1,
              indicesOffset + 2
            );
            // Bottom
            positions.push(p1.x, zMin, p1.y * this.inverseSpeedScaleY);
            positions.push(p2.x, zMin, p2.y * this.inverseSpeedScaleY);
            positions.push(p3.x, zMin, p3.y * this.inverseSpeedScaleY);
            indices.push(
              indicesOffset + 3,
              indicesOffset + 5,
              indicesOffset + 4
            );
            indicesOffset += 6;
          }
        );
        for (let index = 0; index < vertices.length; index++) {
          const vertex = vertices[index];
          // Side
          positions.push(vertex.x, zMax, vertex.y * this.inverseSpeedScaleY);
          positions.push(vertex.x, zMin, vertex.y * this.inverseSpeedScaleY);
          indices.push(indicesOffset + 0, indicesOffset + 1, indicesOffset + 2);
          indices.push(indicesOffset + 3, indicesOffset + 2, indicesOffset + 1);
          indicesOffset += 2;
        }
        const vertex = vertices[0];
        positions.push(vertex.x, zMax, vertex.y * this.inverseSpeedScaleY);
        positions.push(vertex.x, zMin, vertex.y * this.inverseSpeedScaleY);
      }
    }

    private addBoxFor(
      object: gdjs.AbstractRuntimeObject3D,
      positions: Array<float>,
      indices: Array<integer>
    ): void {
      const point = new THREE.Vector3();
      const euler = new THREE.Euler();
      euler.order = 'ZYX';

      const indicesOffset = Math.round(positions.length / 3);
      for (let index = 0; index + 2 < cubePositions.length; index = index + 3) {
        let x = cubePositions[index];
        let y = cubePositions[index + 2];
        let z = cubePositions[index + 1];

        x *= object.getWidth();
        y *= object.getHeight();
        z *= object.getDepth();

        point.set(x, y, z);
        euler.set(
          gdjs.toRad(object.getRotationX()),
          gdjs.toRad(object.getRotationY()),
          gdjs.toRad(object.getAngle())
        );
        point.applyEuler(euler);

        x = object.getCenterXInScene() + point.x;
        y = object.getCenterYInScene() + point.y;
        z = object.getCenterZInScene() + point.z;

        // Y is the top for Recast
        positions.push(x, z, y);
      }
      for (const vertexIndex of cubeIndices) {
        indices.push(vertexIndex + indicesOffset);
      }
    }

    /**
     * Recast only walks on triangles facing up: flipped to face down, they
     * still block characters but can't be walked on.
     *
     * Surfaces less than a step (`walkableClimb`) above a walkable floor are
     * still merged with it by Recast: they stay walkable. Excluding them
     * would need to mark their volume as not walkable during the build
     * (`markBoxArea` in Recast, or tile cache obstacles).
     */
    private makeTrianglesNotWalkable(
      positions: Array<float>,
      indices: Array<integer>,
      firstIndex: integer
    ): void {
      for (let index = firstIndex; index + 2 < indices.length; index += 3) {
        const a = indices[index] * 3;
        const b = indices[index + 1] * 3;
        const c = indices[index + 2] * 3;
        // Y of (b - a) x (c - a), Y being the top for Recast.
        const normalY =
          (positions[b + 2] - positions[a + 2]) *
            (positions[c] - positions[a]) -
          (positions[b] - positions[a]) * (positions[c + 2] - positions[a + 2]);
        if (normalY > 0) {
          indices[index] = indices[index + 1];
          indices[index + 1] = a / 3;
        }
      }
    }

    private addSurfaceFor(
      object: gdjs.AbstractRuntimeObject3D,
      surface: gdjs.Surface,
      positions: Array<float>,
      indices: Array<integer>
    ): void {
      const heightField = surface.getHeightField();
      const triangles = heightField
        ? this.getHeightFieldTriangles(object, heightField)
        : surface.getTriangles();
      if (!triangles) {
        this.addBoxFor(object, positions, indices);
        return;
      }
      const point = new THREE.Vector3();
      // A matrix avoids computing the rotation again for each vertex.
      const rotation = new THREE.Matrix4().makeRotationFromEuler(
        new THREE.Euler(
          gdjs.toRad(object.getRotationX()),
          gdjs.toRad(object.getRotationY()),
          gdjs.toRad(object.getAngle()),
          'ZYX'
        )
      );
      const width = object.getWidth();
      const height = object.getHeight();
      const depth = object.getDepth();
      const centerX = object.getCenterXInScene();
      const centerY = object.getCenterYInScene();
      const centerZ = object.getCenterZInScene();
      const indicesOffset = Math.round(positions.length / 3);
      const surfacePositions = triangles.positions;
      for (let index = 0; index + 2 < surfacePositions.length; index += 3) {
        // Positions are from 0 to 1 in the object box, rotated around its center.
        point.set(
          (surfacePositions[index] - 0.5) * width,
          (surfacePositions[index + 1] - 0.5) * height,
          (surfacePositions[index + 2] - 0.5) * depth
        );
        point.applyMatrix4(rotation);
        // Y is the top for Recast
        positions.push(centerX + point.x, centerZ + point.z, centerY + point.y);
      }
      const surfaceIndices = triangles.indices;
      for (let index = 0; index + 2 < surfaceIndices.length; index += 3) {
        // Swapping Y and Z mirrors triangles: they are flipped back.
        indices.push(
          indicesOffset + surfaceIndices[index + 1],
          indicesOffset + surfaceIndices[index],
          indicesOffset + surfaceIndices[index + 2]
        );
      }
    }

    /**
     * Recast samples triangles with cells of the navigation mesh: the height
     * field is sampled with the same precision, skipping smaller details.
     */
    private getHeightFieldTriangles(
      object: gdjs.AbstractRuntimeObject3D,
      heightField: gdjs.SurfaceHeightField
    ): gdjs.SurfaceTriangles {
      const { columns, rows, heights } = heightField;
      const cellSize = Math.max(
        object.getWidth() / (columns - 1),
        object.getHeight() / (rows - 1)
      );
      const step = Math.max(1, Math.floor(this.cellSize / cellSize));
      const getSampledIndices = (count: integer) => {
        const sampledIndices: Array<integer> = [];
        for (let index = 0; index < count - 1; index += step) {
          sampledIndices.push(index);
        }
        sampledIndices.push(count - 1);
        return sampledIndices;
      };
      const sampledColumns = getSampledIndices(columns);
      const sampledRows = getSampledIndices(rows);
      const rowSize = sampledColumns.length;
      const positions = new Float32Array(rowSize * sampledRows.length * 3);
      for (let j = 0; j < sampledRows.length; j++) {
        const row = sampledRows[j];
        for (let i = 0; i < rowSize; i++) {
          const column = sampledColumns[i];
          const index = (j * rowSize + i) * 3;
          positions[index] = column / (columns - 1);
          positions[index + 1] = row / (rows - 1);
          positions[index + 2] = heights[row * columns + column];
        }
      }
      const cellIndices: Array<integer> = [];
      for (let j = 0; j + 1 < sampledRows.length; j++) {
        for (let i = 0; i + 1 < rowSize; i++) {
          const a = j * rowSize + i;
          const b = a + 1;
          const c = a + rowSize;
          const d = c + 1;
          // Cells with a hole (NaN) are skipped.
          if (
            Number.isNaN(
              positions[a * 3 + 2] +
                positions[b * 3 + 2] +
                positions[c * 3 + 2] +
                positions[d * 3 + 2]
            )
          ) {
            continue;
          }
          cellIndices.push(a, b, c, b, d, c);
        }
      }
      for (let index = 2; index < positions.length; index += 3) {
        if (Number.isNaN(positions[index])) positions[index] = 0;
      }
      return { positions, indices: new Uint32Array(cellIndices) };
    }

    private addMeshFor(
      model3DRuntimeObject: gdjs.Model3DRuntimeObject,
      obstacle: NavMeshObstacleRuntimeBehavior,
      positions: Array<float>,
      indices: Array<integer>
    ): void {
      const originalModel = model3DRuntimeObject
        .getInstanceContainer()
        .getGame()
        .getModel3DManager()
        .getModel(
          obstacle._meshShapeResourceName ||
            model3DRuntimeObject._modelResourceName ||
            ''
        );

      const modelInCube = new THREE.Group();
      modelInCube.rotation.order = 'ZYX';
      const root = THREE_ADDONS.SkeletonUtils.clone(originalModel.scene);
      modelInCube.add(root);

      const data = model3DRuntimeObject._data.content;
      model3DRuntimeObject._renderer.stretchModelIntoUnitaryCube(
        modelInCube,
        data.rotationX,
        data.rotationY,
        data.rotationZ
      );

      const threeObject = new THREE.Group();
      threeObject.rotation.order = 'ZYX';
      threeObject.add(modelInCube);
      const object = model3DRuntimeObject;
      const width = object.getWidth();
      const height = object.getHeight();
      const depth = object.getDepth();
      threeObject.scale.set(
        object.isFlippedX() ? -width : width,
        object.isFlippedY() ? -height : height,
        object.isFlippedZ() ? -depth : depth
      );
      threeObject.position.set(
        object.getCenterXInScene(),
        object.getCenterYInScene(),
        object.getCenterZInScene()
      );
      threeObject.rotation.set(
        gdjs.toRad(object.getRotationX()),
        gdjs.toRad(object.getRotationY()),
        gdjs.toRad(object.getAngle())
      );

      threeObject.updateMatrixWorld();

      // For indexed triangles
      const vector3 = new THREE.Vector3();

      threeObject.traverse((object3d) => {
        const mesh = object3d as THREE.Mesh;
        if (!mesh.isMesh) {
          return;
        }
        const indicesOffset = Math.round(positions.length / 3);
        const positionAttribute = mesh.geometry.getAttribute('position');
        object3d.getWorldScale(vector3);
        // Negate it because we swap Y and Z.
        const shouldTrianglesBeFlipped = !(
          vector3.x * vector3.y * vector3.z <
          0
        );
        const index = mesh.geometry.getIndex();
        if (index) {
          for (let i = 0; i < positionAttribute.count; i++) {
            vector3.fromBufferAttribute(positionAttribute, i);
            object3d.localToWorld(vector3);
            positions.push(vector3.x, vector3.z, vector3.y);
          }
          for (let i = 0; i < index.count; i += 3) {
            indices.push(
              indicesOffset + index.getX(shouldTrianglesBeFlipped ? i + 1 : i),
              indicesOffset + index.getX(shouldTrianglesBeFlipped ? i : i + 1),
              indicesOffset + index.getX(i + 2)
            );
          }
        } else {
          for (let i = 0; i < positionAttribute.count; i += 3) {
            vector3.fromBufferAttribute(positionAttribute, i);
            object3d.localToWorld(vector3);
            positions.push(vector3.x, vector3.z, vector3.y);

            vector3.fromBufferAttribute(positionAttribute, i + 1);
            object3d.localToWorld(vector3);
            positions.push(vector3.x, vector3.z, vector3.y);

            vector3.fromBufferAttribute(positionAttribute, i + 2);
            object3d.localToWorld(vector3);
            positions.push(vector3.x, vector3.z, vector3.y);

            indices.push(
              indicesOffset + (shouldTrianglesBeFlipped ? i + 1 : i),
              indicesOffset + (shouldTrianglesBeFlipped ? i : i + 1),
              indicesOffset + i + 2
            );
          }
        }
      });
    }

    buildCharacterAgent(character: NavMeshCharacterRuntimeBehavior): void {
      if (!this.navMesh || !this.crowd) {
        return;
      }
      const owner = character.owner;
      this.buildTilesAround(owner.getX(), owner.getY());
      const navMeshQuery = new RecastNav.NavMeshQuery(this.navMesh);
      const { success: hasFoundOrigin, point: origin } =
        navMeshQuery.findClosestPoint(
          {
            x: owner.getX(),
            y: gdjs.Base3DHandler.is3D(owner) ? owner.getZ() : 0,
            z: this.toNavMeshZ(owner.getY()),
          },
          {
            halfExtents: {
              x: searchHalfExtent,
              y: this.is3D ? searchHalfExtent : this.cellSize / 2 - 0.5,
              z: searchHalfExtent,
            },
          }
        );
      navMeshQuery.destroy();
      if (!hasFoundOrigin) {
        character._agent = null;
        return;
      }

      character._crowdAgentParams.radius = character.getRadius();
      character._crowdAgentParams.height = gdjs.Base3DHandler.is3D(owner)
        ? owner.getDepth()
        : 1;
      const agent = this.crowd
        ? this.crowd.addAgent(origin, character._crowdAgentParams)
        : null;

      const oldAgent = character._agent;
      character._agent = agent;
      if (agent) {
        if (character.pathFound() && !character.destinationReached()) {
          character.moveTo(
            character.getDestinationX(),
            character.getDestinationY(),
            character.getDestinationZ()
          );
        }
        if (oldAgent) {
          agent.raw.set_vel(0, oldAgent.raw.get_vel(0));
          agent.raw.set_vel(1, oldAgent.raw.get_vel(1));
          agent.raw.set_vel(2, oldAgent.raw.get_vel(2));
        }
      }
    }

    /**
     * Add a obstacle to the list of existing obstacles.
     */
    addObstacle(obstacle: NavMeshObstacleRuntimeBehavior): void {
      this.obstacles.add(obstacle);
      if (gdjs.Base3DHandler.is3D(obstacle.owner)) {
        this.use3D();
      }
      this.updateObstacle(obstacle);
    }

    /**
     * Remove a obstacle from the list of existing obstacles. Be sure that the obstacle was
     * added before.
     */
    removeObstacle(obstacle: NavMeshObstacleRuntimeBehavior): void {
      this.obstacles.delete(obstacle);
      const geometry = this.obstacleGeometries.get(obstacle);
      this.obstacleGeometries.delete(obstacle);
      if (geometry) {
        this.addTilesToBuildIn(geometry.area);
      }
    }

    /**
     * Take into account a change of an obstacle (position, size, shape...):
     * the tiles where it was and where it is now are built again.
     */
    updateObstacle(obstacle: NavMeshObstacleRuntimeBehavior): void {
      const oldGeometry = this.obstacleGeometries.get(obstacle);
      if (!this.tileBuilder) {
        // It will be computed when the navigation mesh is built. It was
        // not built yet, or there was no obstacle.
        this.obstacleGeometries.delete(obstacle);
        this.invalidateNavMesh();
        return;
      }
      const geometry = this.createObstacleGeometry(obstacle);
      this.obstacleGeometries.set(obstacle, geometry);
      if (oldGeometry) {
        this.addTilesToBuildIn(oldGeometry.area);
      }
      this.addTilesToBuildIn(geometry.area);
      this.extendGroundIfNeeded(geometry);
    }

    /**
     * Take into account a change of the surface of an obstacle: only the
     * tiles of the part of the surface that changed are built again.
     * @param changedArea The part of the surface that changed, from 0 to 1
     * in the object box (see `gdjs.Surface.getChangedArea`).
     */
    updateObstacleSurface(
      obstacle: NavMeshObstacleRuntimeBehavior,
      changedArea: gdjs.SurfaceArea
    ): void {
      if (!this.tileBuilder || !this.obstacleGeometries.has(obstacle)) {
        this.updateObstacle(obstacle);
        return;
      }
      const geometry = this.createObstacleGeometry(obstacle);
      this.obstacleGeometries.set(obstacle, geometry);
      // The triangles touching the part that changed go beyond it.
      const area = this.getObjectArea(obstacle.owner, changedArea);
      const triangleSizeMax = geometry.getTriangleSizeMax();
      this.addTilesToBuildIn({
        minX: area.minX - triangleSizeMax,
        minZ: area.minZ - triangleSizeMax,
        maxX: area.maxX + triangleSizeMax,
        maxZ: area.maxZ + triangleSizeMax,
      });
    }

    /**
     * The area of the navigation mesh covered by a part of an object box.
     * @param boxArea The part of the box, from 0 to 1.
     */
    private getObjectArea(
      object: gdjs.RuntimeObject,
      boxArea: gdjs.SurfaceArea
    ): gdjs.NavMeshArea {
      const point = new THREE.Vector3();
      const euler = new THREE.Euler(0, 0, gdjs.toRad(object.getAngle()), 'ZYX');
      let depth = 0;
      if (gdjs.Base3DHandler.is3D(object)) {
        euler.x = gdjs.toRad(object.getRotationX());
        euler.y = gdjs.toRad(object.getRotationY());
        depth = object.getDepth();
      }
      let area: gdjs.NavMeshArea | null = null;
      for (const boxX of [boxArea.minX, boxArea.maxX]) {
        for (const boxY of [boxArea.minY, boxArea.maxY]) {
          for (const boxZ of [0, 1]) {
            point.set(
              (boxX - 0.5) * object.getWidth(),
              (boxY - 0.5) * object.getHeight(),
              (boxZ - 0.5) * depth
            );
            point.applyEuler(euler);
            const x = object.getCenterXInScene() + point.x;
            const z = this.toNavMeshZ(object.getCenterYInScene() + point.y);
            const cornerArea = { minX: x, minZ: z, maxX: x, maxZ: z };
            area = area ? getAreasUnion(area, cornerArea) : cornerArea;
          }
        }
      }
      return area || { minX: 0, minZ: 0, maxX: 0, maxZ: 0 };
    }

    /**
     * The 2D ground is built around the obstacles: it must be built again
     * when they go out of it.
     */
    private extendGroundIfNeeded(geometry: gdjs.NavMeshObstacleGeometry) {
      const { groundArea, obstaclesAreaAroundGround } = this;
      if (
        groundArea &&
        !geometry.isEmpty() &&
        (!obstaclesAreaAroundGround ||
          !isAreaInside(geometry.area, obstaclesAreaAroundGround))
      ) {
        this.invalidateNavMesh();
      }
    }

    /**
     * Obstacles and characters in 3D make the navigation mesh in 3D: the
     * geometry of obstacles changes.
     */
    private use3D(): void {
      if (this.is3D) {
        return;
      }
      this.is3D = true;
      this.obstacleGeometries.clear();
      this.invalidateNavMesh();
    }

    /**
     * Add a character to the list of existing characters.
     */
    addCharacter(character: NavMeshCharacterRuntimeBehavior): void {
      if (this.characters.has(character)) {
        return;
      }
      this.characters.add(character);
      if (gdjs.Base3DHandler.is3D(character.owner)) {
        this.use3D();
      }
      if (
        this.crowd &&
        (this.characters.size > this.crowdCapacity ||
          // The crowd looks for agents on the navigation mesh around them,
          // according to the biggest radius.
          character.getRadius() > this.crowdAgentRadiusMax)
      ) {
        const oldCrowd = this.crowd;
        this.createCrowd();
        oldCrowd.destroy();
        return;
      }
      this.buildCharacterAgent(character);
    }

    /**
     * Remove a character from the list of existing characters.
     */
    removeCharacter(character: NavMeshCharacterRuntimeBehavior): void {
      this.characters.delete(character);
      if (this.crowd && character._agent) {
        this.crowd.removeAgent(character._agent);
        character._agent = null;
      }
    }

    /**
     * Free the navigation mesh and the crowd from the WebAssembly memory.
     * The manager must not be used after this.
     */
    dispose(): void {
      for (const character of this.characters) {
        character._agent = null;
      }
      this.characters.clear();
      this.obstacles.clear();
      this.obstacleGeometries.clear();
      this.tilesToBuild.clear();
      this.tileBuildTimes.clear();
      if (this.crowd) {
        this.crowd.destroy();
        this.crowd = null;
      }
      if (this.navMesh) {
        this.navMesh.destroy();
        this.navMesh = null;
      }
      if (this.tileBuilder) {
        this.tileBuilder.dispose();
        this.tileBuilder = null;
      }
      if (this.debuggerRenderer) {
        this.debuggerRenderer.dispose();
        this.debuggerRenderer = null;
      }
    }
  }

  const getAreasUnion = (
    a: gdjs.NavMeshArea,
    b: gdjs.NavMeshArea
  ): gdjs.NavMeshArea => ({
    minX: Math.min(a.minX, b.minX),
    minZ: Math.min(a.minZ, b.minZ),
    maxX: Math.max(a.maxX, b.maxX),
    maxZ: Math.max(a.maxZ, b.maxZ),
  });

  const isAreaInside = (
    area: gdjs.NavMeshArea,
    container: gdjs.NavMeshArea
  ): boolean =>
    area.minX >= container.minX &&
    area.minZ >= container.minZ &&
    area.maxX <= container.maxX &&
    area.maxZ <= container.maxZ;

  gdjs.registerRuntimeSceneUnloadedCallback(function (runtimeScene) {
    // Without this, the navigation mesh and the crowd of each unloaded scene
    // would stay allocated in the WebAssembly memory.
    const navMeshObstaclesManager = runtimeScene.navMeshObstaclesManager;
    if (navMeshObstaclesManager) {
      navMeshObstaclesManager.dispose();
      // @ts-ignore The manager is set back to undefined like before its creation.
      runtimeScene.navMeshObstaclesManager = undefined;
    }
  });

  /** @category Behaviors > NavMesh pathfinding */
  export namespace NavMeshObstaclesManager {
    /**
     * Enable or disable the debug draw.
     * @param instanceContainer The current container.
     * @param enableDebugDraw true to enable the debug draw, false to disable it.
     */
    export const enableDebugDraw = function (
      instanceContainer: gdjs.RuntimeInstanceContainer,
      enableDebugDraw: boolean
    ): void {
      if (enableDebugDraw) {
        // Make sure the debug layer will be displayed.
        // We never set it back to false because users might have enabled hit-box
        // debug draw with the other action.
        instanceContainer._debugDrawEnabled = true;
      }
      const manager =
        gdjs.NavMeshObstaclesManager.getManager(instanceContainer);
      manager.setDebugDrawEnabled(instanceContainer, enableDebugDraw);
    };
  }

  /**
   * NavMeshObstacleRuntimeBehavior represents a behavior allowing objects to be
   * considered as a obstacle by objects having Character Behavior.
   * @category Behaviors > NavMesh pathfinding
   */
  export class NavMeshObstacleRuntimeBehavior extends gdjs.RuntimeBehavior {
    _shape: string;
    _meshShapeResourceName: string;
    _isObstacleOnly: boolean;
    _oldSurface: gdjs.Surface | null = null;
    _oldSurfaceVersion: integer = 0;

    // The transformation of the object when its geometry was given to the
    // navigation mesh.
    _oldCenterX: float = 0;
    _oldCenterY: float = 0;
    _oldCenterZ: float = 0;
    _oldWidth: float = 0;
    _oldHeight: float = 0;
    _oldDepth: float = 0;
    _oldRotationX: float = 0;
    _oldRotationY: float = 0;
    _oldRotationZ: float = 0;
    _manager: NavMeshObstaclesManager;
    _registeredInManager: boolean = false;

    constructor(
      instanceContainer: gdjs.RuntimeInstanceContainer,
      behaviorData,
      owner: gdjs.RuntimeObject
    ) {
      super(instanceContainer, behaviorData, owner);
      this._shape = behaviorData.shape;
      this._meshShapeResourceName = behaviorData.meshShapeResourceName;
      this._isObstacleOnly = !!behaviorData.obstacleOnly;
      this._manager = NavMeshObstaclesManager.getManager(instanceContainer);

      //Note that we can't use getX(), getWidth()... of owner here:
      //The owner is not yet fully constructed.
    }

    override applyBehaviorOverriding(behaviorData): boolean {
      if (behaviorData.shape !== undefined) {
        this._shape = behaviorData.shape;
      }
      if (behaviorData.meshShapeResourceName !== undefined) {
        this._meshShapeResourceName = behaviorData.meshShapeResourceName;
      }
      if (behaviorData.obstacleOnly !== undefined) {
        this._isObstacleOnly = !!behaviorData.obstacleOnly;
      }
      if (this._registeredInManager) {
        this._manager.updateObstacle(this);
      }
      return true;
    }

    override onDestroy() {
      if (this._registeredInManager) {
        this._manager.removeObstacle(this);
      }
    }

    override doStepPreEvents(instanceContainer: gdjs.RuntimeInstanceContainer) {
      if (!this.activated() && this._registeredInManager) {
        this._manager.removeObstacle(this);
        this._registeredInManager = false;
      } else if (this.activated() && !this._registeredInManager) {
        this.addToManager();
      }
      if (!this._registeredInManager) {
        return;
      }

      const surface = this.owner.getSurface();
      const surfaceVersion = surface ? surface.getVersion() : 0;
      const hasSurfaceChanged =
        surface !== this._oldSurface ||
        surfaceVersion !== this._oldSurfaceVersion;
      const changedSurfaceArea =
        hasSurfaceChanged && surface && surface === this._oldSurface
          ? surface.getChangedArea(this._oldSurfaceVersion)
          : null;
      this._oldSurface = surface;
      this._oldSurfaceVersion = surfaceVersion;

      if (this.hasMovedNoticeably()) {
        this.rememberTransformation();
        this._manager.updateObstacle(this);
      } else if (hasSurfaceChanged) {
        if (changedSurfaceArea) {
          this._manager.updateObstacleSurface(this, changedSurfaceArea);
        } else {
          this._manager.updateObstacle(this);
        }
      }
    }

    private addToManager() {
      this.rememberTransformation();
      const surface = this.owner.getSurface();
      this._oldSurface = surface;
      this._oldSurfaceVersion = surface ? surface.getVersion() : 0;
      this._manager.addObstacle(this);
      this._registeredInManager = true;
    }

    private rememberTransformation() {
      const owner = this.owner;
      this._oldCenterX = owner.getCenterXInScene();
      this._oldCenterY = owner.getCenterYInScene();
      this._oldWidth = owner.getWidth();
      this._oldHeight = owner.getHeight();
      this._oldRotationZ = owner.getAngle();
      if (gdjs.Base3DHandler.is3D(owner)) {
        this._oldCenterZ = owner.getCenterZInScene();
        this._oldDepth = owner.getDepth();
        this._oldRotationX = owner.getRotationX();
        this._oldRotationY = owner.getRotationY();
      }
    }

    /**
     * Recast voxelizes obstacles in cells, and simplifies the outlines of
     * the floors by more than a cell: a change moving the object box by
     * less than half a cell can't make a noticeable difference in the
     * navigation mesh. Ignoring it avoids building tiles again for physics
     * bodies jittering or settling slowly. Changes are measured since the
     * last update, so slow movements still add up.
     */
    private hasMovedNoticeably(): boolean {
      const owner = this.owner;
      const angleDifference = gdjs.evtTools.common.angleDifference;
      let centerZ = 0;
      let depth = 0;
      let rotationX = 0;
      let rotationY = 0;
      if (gdjs.Base3DHandler.is3D(owner)) {
        centerZ = owner.getCenterZInScene();
        depth = owner.getDepth();
        rotationX = owner.getRotationX();
        rotationY = owner.getRotationY();
      }
      const width = owner.getWidth();
      const height = owner.getHeight();
      // A rotation moves the corners of the box at most by its angle (in
      // radians) times half of the box diagonal.
      const halfDiagonal = Math.hypot(width, height, depth) / 2;
      const tiltDistance =
        gdjs.toRad(
          Math.abs(angleDifference(rotationX, this._oldRotationX)) +
            Math.abs(angleDifference(rotationY, this._oldRotationY))
        ) * halfDiagonal;
      const horizontalDistance =
        Math.hypot(
          owner.getCenterXInScene() - this._oldCenterX,
          owner.getCenterYInScene() - this._oldCenterY
        ) +
        (Math.abs(width - this._oldWidth) +
          Math.abs(height - this._oldHeight)) /
          2 +
        gdjs.toRad(
          Math.abs(angleDifference(owner.getAngle(), this._oldRotationZ))
        ) *
          halfDiagonal +
        tiltDistance;
      const verticalDistance =
        Math.abs(centerZ - this._oldCenterZ) +
        Math.abs(depth - this._oldDepth) / 2 +
        tiltDistance;
      return (
        horizontalDistance > this._manager.cellSize / 2 ||
        verticalDistance > this._manager.getCellHeight() / 2
      );
    }

    override doStepPostEvents(
      instanceContainer: gdjs.RuntimeInstanceContainer
    ) {}

    override onActivate() {
      if (this._registeredInManager) {
        return;
      }
      this.addToManager();
    }

    override onDeActivate() {
      if (!this._registeredInManager) {
        return;
      }
      this._manager.removeObstacle(this);
      this._registeredInManager = false;
    }
  }
  gdjs.registerBehavior(
    'NavMeshPathfinding::NavMeshObstacleBehavior',
    gdjs.NavMeshObstacleRuntimeBehavior
  );

  // The following code is inspired from Critterai
  // https://github.com/stevefsp/critterai
  interface Point {
    x: number;
    y: number;
  }

  /**
   * Attempts to triangulate a polygon.
   *
   * @param vertices the polygon to be triangulate.
   * The content is manipulated during the operation
   * and it will be left in an undefined state at the end of
   * the operation.
   * @param vertexFlags only used internally
   * @param outTriangles is called for each triangle derived
   * from the original polygon.
   */
  function triangulate(
    vertices: Array<Point>,
    vertexFlags: Array<boolean>,
    outTriangles: (p1: Point, p2: Point, p3: Point) => void
  ): void {
    // Terminology, concepts and such:
    //
    // This algorithm loops around the edges of a polygon looking for
    // new internal edges to add that will partition the polygon into a
    // new valid triangle internal to the starting polygon. During each
    // iteration the shortest potential new edge is selected to form that
    // iteration's new triangle.
    //
    // Triangles will only be formed if a single new edge will create
    // a triangle. Two new edges will never be added during a single
    // iteration. This means that the triangulated portions of the
    // original polygon will only contain triangles and the only
    // non-triangle polygon will exist in the untriangulated portion
    // of the original polygon.
    //
    // "Partition edge" refers to a potential new edge that will form a
    // new valid triangle.
    //
    // "Center" vertex refers to the vertex in a potential new triangle
    // which, if the triangle is formed, will be external to the
    // remaining untriangulated portion of the polygon. Since it
    // is now external to the polygon, it can't be used to form any
    // new triangles.
    //
    // Some documentation refers to "iPlus2" even though the variable is
    // not in scope or does not exist for that section of code. For
    // documentation purposes, iPlus2 refers to the 2nd vertex after the
    // primary vertex.
    // E.g.: i, iPlus1, and iPlus2.
    //
    // Visualizations: http://www.critterai.org/projects/nmgen_study/polygen.html#triangulation

    // Loop through all vertices, flagging all indices that represent
    // a center vertex of a valid new triangle.
    vertexFlags.length = vertices.length;
    for (let i = 0; i < vertices.length; i++) {
      const iPlus1 = (i + 1) % vertices.length;
      const iPlus2 = (i + 2) % vertices.length;
      // A triangle formed by i, iPlus1, and iPlus2 will result
      // in a valid internal triangle.
      // Flag the center vertex (iPlus1) to indicate a valid triangle
      // location.
      vertexFlags[iPlus1] = isValidPartition(i, iPlus2, vertices);
    }

    // Loop through the vertices creating triangles. When there is only a
    // single triangle left,  the operation is complete.
    //
    // When a valid triangle is formed, remove its center vertex. So for
    // each loop, a single vertex will be removed.
    //
    // At the start of each iteration the indices list is in the following
    // state:
    // - Represents a simple polygon representing the un-triangulated
    //   portion of the original polygon.
    // - All valid center vertices are flagged.
    while (vertices.length > 3) {
      // Find the shortest new valid edge.

      // NOTE: i and iPlus1 are defined in two different scopes in
      // this section. So be careful.

      // Loop through all indices in the remaining polygon.
      let minLengthSq = Number.MAX_VALUE;
      let minLengthSqVertexIndex = -1;
      for (let i = 0; i < vertices.length; i++) {
        if (vertexFlags[(i + 1) % vertices.length]) {
          // Indices i, iPlus1, and iPlus2 are known to form a
          // valid triangle.
          const vert = vertices[i];
          const vertPlus2 = vertices[(i + 2) % vertices.length];

          // Determine the length of the partition edge.
          // (i -> iPlus2)
          const deltaX = vertPlus2.x - vert.x;
          const deltaY = vertPlus2.y - vert.y;
          const lengthSq = deltaX * deltaX + deltaY * deltaY;

          if (lengthSq < minLengthSq) {
            minLengthSq = lengthSq;
            minLengthSqVertexIndex = i;
          }
        }
      }

      if (minLengthSqVertexIndex === -1)
        // Could not find a new triangle. Triangulation failed.
        // This happens if there are three or more vertices
        // left, but none of them are flagged as being a
        // potential center vertex.
        return;

      let i = minLengthSqVertexIndex;
      let iPlus1 = (i + 1) % vertices.length;

      // Add the new triangle to the output.
      outTriangles(
        vertices[i],
        vertices[iPlus1],
        vertices[(i + 2) % vertices.length]
      );

      // iPlus1, the "center" vert in the new triangle, is now external
      // to the untriangulated portion of the polygon. Remove it from
      // the vertices list since it cannot be a member of any new
      // triangles.
      vertices.splice(iPlus1, 1);
      vertexFlags.splice(iPlus1, 1);

      if (iPlus1 === 0 || iPlus1 >= vertices.length) {
        // The vertex removal has invalidated iPlus1 and/or i. So
        // force a wrap, fixing the indices so they reference the
        // correct indices again. This only occurs when the new
        // triangle is formed across the wrap location of the polygon.
        // Case 1: i = 14, iPlus1 = 15, iPlus2 = 0
        // Case 2: i = 15, iPlus1 = 0, iPlus2 = 1;
        i = vertices.length - 1;
        iPlus1 = 0;
      }

      // At this point i and iPlus1 refer to the two indices from a
      // successful triangulation that will be part of another new
      // triangle. We now need to re-check these indices to see if they
      // can now be the center index in a potential new partition.
      vertexFlags[i] = isValidPartition(
        (i - 1 + vertices.length) % vertices.length,
        iPlus1,
        vertices
      );
      vertexFlags[iPlus1] = isValidPartition(
        i,
        (i + 2) % vertices.length,
        vertices
      );
    }

    // Only 3 vertices remain.
    // Add their triangle to the output list.
    outTriangles(vertices[0], vertices[1], vertices[2]);
  }

  /**
   * Check if the line segment formed by vertex A and vertex B will
   * form a valid partition of the polygon.
   *
   * I.e. the line segment AB is internal to the polygon and will not
   * cross existing line segments.
   *
   * Assumptions:
   * - The vertices arguments define a valid simple polygon
   * with vertices wrapped clockwise.
   * - indexA != indexB
   *
   * Behavior is undefined if the arguments to not meet these
   * assumptions
   *
   * @param indexA the index of the vertex that will form the segment AB.
   * @param indexB the index of the vertex that will form the segment AB.
   * @param vertices a polygon wrapped clockwise.
   * @return true if the line segment formed by vertex A and vertex B will
   * form a valid partition of the polygon.
   */
  function isValidPartition(
    indexA: integer,
    indexB: integer,
    vertices: Point[]
  ): boolean {
    //  First check whether the segment AB lies within the internal
    //  angle formed at A (this is the faster check).
    //  If it does, then perform the more costly check.
    return (
      liesWithinInternalAngle(indexA, indexB, vertices) &&
      !hasIllegalEdgeIntersection(indexA, indexB, vertices)
    );
  }

  /**
   * Check if vertex B lies within the internal angle of the polygon
   * at vertex A.
   *
   * Vertex B does not have to be within the polygon border. It just has
   * be be within the area encompassed by the internal angle formed at
   * vertex A.
   *
   * This operation is a fast way of determining whether a line segment
   * can possibly form a valid polygon partition. If this test returns
   * FALSE, then more expensive checks can be skipped.
   *
   * Visualizations: http://www.critterai.org/projects/nmgen_study/polygen.html#anglecheck
   *
   * Special case:
   * FALSE is returned if vertex B lies directly on either of the rays
   * cast from vertex A along its associated polygon edges. So the test
   * on vertex B is exclusive of the polygon edges.
   *
   * Assumptions:
   * - The vertices and indices arguments define a valid simple polygon
   * with vertices wrapped clockwise.
   * -indexA != indexB
   *
   * Behavior is undefined if the arguments to not meet these
   * assumptions
   *
   * @param indexA the index of the vertex that will form the segment AB.
   * @param indexB the index of the vertex that will form the segment AB.
   * @param vertices a polygon wrapped clockwise.
   * @return true if vertex B lies within the internal angle of
   * the polygon at vertex A.
   */
  function liesWithinInternalAngle(
    indexA: integer,
    indexB: integer,
    vertices: Point[]
  ): boolean {
    // Get pointers to the main vertices being tested.
    const vertexA = vertices[indexA];
    const vertexB = vertices[indexB];

    // Get pointers to the vertices just before and just after vertA.
    const vertexAMinus =
      vertices[(indexA - 1 + vertices.length) % vertices.length];
    const vertexAPlus = vertices[(indexA + 1) % vertices.length];

    // First, find which of the two angles formed by the line segments
    //  AMinus->A->APlus is internal to (pointing towards) the polygon.
    // Then test to see if B lies within the area formed by that angle.

    // TRUE if A is left of or on line AMinus->APlus
    if (
      isLeftOrCollinear(
        vertexA.x,
        vertexA.y,
        vertexAMinus.x,
        vertexAMinus.y,
        vertexAPlus.x,
        vertexAPlus.y
      )
    )
      // The angle internal to the polygon is <= 180 degrees
      // (non-reflex angle).
      // Test to see if B lies within this angle.
      return (
        isLeft(
          // TRUE if B is left of line A->AMinus
          vertexB.x,
          vertexB.y,
          vertexA.x,
          vertexA.y,
          vertexAMinus.x,
          vertexAMinus.y
        ) &&
        // TRUE if B is right of line A->APlus
        isRight(
          vertexB.x,
          vertexB.y,
          vertexA.x,
          vertexA.y,
          vertexAPlus.x,
          vertexAPlus.y
        )
      );

    // The angle internal to the polygon is > 180 degrees (reflex angle).
    // Test to see if B lies within the external (<= 180 degree) angle and
    // flip the result. (If B lies within the external angle, it can't
    // lie within the internal angle)
    return !(
      // TRUE if B is left of or on line A->APlus
      (
        isLeftOrCollinear(
          vertexB.x,
          vertexB.y,
          vertexA.x,
          vertexA.y,
          vertexAPlus.x,
          vertexAPlus.y
        ) &&
        // TRUE if B is right of or on line A->AMinus
        isRightOrCollinear(
          vertexB.x,
          vertexB.y,
          vertexA.x,
          vertexA.y,
          vertexAMinus.x,
          vertexAMinus.y
        )
      )
    );
  }

  /**
   * Check if point P is to the left of line AB when looking
   * from A to B.
   * @param px The x-value of the point to test.
   * @param py The y-value of the point to test.
   * @param ax The x-value of the point (ax, ay) that is point A on line AB.
   * @param ay The y-value of the point (ax, ay) that is point A on line AB.
   * @param bx The x-value of the point (bx, by) that is point B on line AB.
   * @param by The y-value of the point (bx, by) that is point B on line AB.
   * @return TRUE if point P is to the left of line AB when looking
   * from A to B.
   */
  function isLeft(
    px: integer,
    py: integer,
    ax: integer,
    ay: integer,
    bx: integer,
    by: integer
  ): boolean {
    return getSignedAreaX2(ax, ay, px, py, bx, by) < 0;
  }

  /**
   * Check if point P is to the left of line AB when looking
   * from A to B or is collinear with line AB.
   * @param px The x-value of the point to test.
   * @param py The y-value of the point to test.
   * @param ax The x-value of the point (ax, ay) that is point A on line AB.
   * @param ay The y-value of the point (ax, ay) that is point A on line AB.
   * @param bx The x-value of the point (bx, by) that is point B on line AB.
   * @param by The y-value of the point (bx, by) that is point B on line AB.
   * @return TRUE if point P is to the left of line AB when looking
   * from A to B, or is collinear with line AB.
   */
  function isLeftOrCollinear(
    px: integer,
    py: integer,
    ax: integer,
    ay: integer,
    bx: integer,
    by: integer
  ): boolean {
    return getSignedAreaX2(ax, ay, px, py, bx, by) <= 0;
  }

  /**
   * Check if point P is to the right of line AB when looking
   * from A to B.
   * @param px The x-value of the point to test.
   * @param py The y-value of the point to test.
   * @param ax The x-value of the point (ax, ay) that is point A on line AB.
   * @param ay The y-value of the point (ax, ay) that is point A on line AB.
   * @param bx The x-value of the point (bx, by) that is point B on line AB.
   * @param by The y-value of the point (bx, by) that is point B on line AB.
   * @return TRUE if point P is to the right of line AB when looking
   * from A to B.
   */
  function isRight(
    px: integer,
    py: integer,
    ax: integer,
    ay: integer,
    bx: integer,
    by: integer
  ): boolean {
    return getSignedAreaX2(ax, ay, px, py, bx, by) > 0;
  }

  /**
   * Check if point P is to the right of or on line AB when looking
   * from A to B.
   * @param px The x-value of the point to test.
   * @param py The y-value of the point to test.
   * @param ax The x-value of the point (ax, ay) that is point A on line AB.
   * @param ay The y-value of the point (ax, ay) that is point A on line AB.
   * @param bx The x-value of the point (bx, by) that is point B on line AB.
   * @param by The y-value of the point (bx, by) that is point B on line AB.
   * @return TRUE if point P is to the right of or on line AB when looking
   * from A to B.
   */
  function isRightOrCollinear(
    px: integer,
    py: integer,
    ax: integer,
    ay: integer,
    bx: integer,
    by: integer
  ): boolean {
    return getSignedAreaX2(ax, ay, px, py, bx, by) >= 0;
  }

  /**
   * The absolute value of the returned value is two times the area of the
   * triangle defined by points (A, B, C).
   *
   * A positive value indicates:
   * - Counterclockwise wrapping of the points.
   * - Point B lies to the right of line AC, looking from A to C.
   *
   * A negative value indicates:
   * - Clockwise wrapping of the points.<
   * - Point B lies to the left of line AC, looking from A to C.
   *
   * A value of zero indicates that all points are collinear or
   * represent the same point.
   *
   * This is a fast operation.
   *
   * @param ax The x-value for point (ax, ay) for vertex A of the triangle.
   * @param ay The y-value for point (ax, ay) for vertex A of the triangle.
   * @param bx The x-value for point (bx, by) for vertex B of the triangle.
   * @param by The y-value for point (bx, by) for vertex B of the triangle.
   * @param cx The x-value for point (cx, cy) for vertex C of the triangle.
   * @param cy The y-value for point (cx, cy) for vertex C of the triangle.
   * @return The signed value of two times the area of the triangle defined
   * by the points (A, B, C).
   */
  function getSignedAreaX2(
    ax: integer,
    ay: integer,
    bx: integer,
    by: integer,
    cx: integer,
    cy: integer
  ): integer {
    // References:
    // http://softsurfer.com/Archive/algorithm_0101/algorithm_0101.htm#Modern%20Triangles
    // http://mathworld.wolfram.com/TriangleArea.html (Search for "signed")
    return (bx - ax) * (cy - ay) - (cx - ax) * (by - ay);
  }

  /**
   * Check if the line segment AB intersects any edges not already
   * connected to one of the two vertices.
   *
   * Assumptions:
   * - The vertices and indices arguments define a valid simple polygon
   * with vertices wrapped clockwise.
   * - indexA != indexB
   *
   * Behavior is undefined if the arguments to not meet these
   * assumptions
   *
   * @param indexA the index of the vertex that will form the segment AB.
   * @param indexB the index of the vertex that will form the segment AB.
   * @param vertices a polygon wrapped clockwise.
   * @return true if the line segment AB intersects any edges not already
   * connected to one of the two vertices.
   */
  function hasIllegalEdgeIntersection(
    indexA: integer,
    indexB: integer,
    vertices: Point[]
  ): boolean {
    // Get pointers to the primary vertices being tested.
    const vertexA = vertices[indexA];
    const vertexB = vertices[indexB];

    // Loop through the polygon edges.
    for (
      let edgeBeginIndex = 0;
      edgeBeginIndex < vertices.length;
      edgeBeginIndex++
    ) {
      const edgeEndIndex = (edgeBeginIndex + 1) % vertices.length;
      if (
        edgeBeginIndex === indexA ||
        edgeBeginIndex === indexB ||
        edgeEndIndex === indexA ||
        edgeEndIndex === indexB
      ) {
        continue;
      }
      // Neither of the test indices are endpoints of this edge.
      // Get this edge's vertices.
      const edgeBegin = vertices[edgeBeginIndex];
      const edgeEnd = vertices[edgeEndIndex];
      if (
        (edgeBegin.x === vertexA.x && edgeBegin.y === vertexA.y) ||
        (edgeBegin.x === vertexB.x && edgeBegin.y === vertexB.y) ||
        (edgeEnd.x === vertexA.x && edgeEnd.y === vertexA.y) ||
        (edgeEnd.x === vertexB.x && edgeEnd.y === vertexB.y)
      ) {
        // One of the test vertices is co-located
        // with one of the endpoints of this edge (this is a
        // test of the actual position of the vertices rather than
        // simply the index check performed earlier).
        // Skip this edge.
        continue;
      }
      // This edge is not connected to either of the test vertices.
      // If line segment AB intersects  with this edge, then the
      // intersection is illegal.
      // I.e. New edges cannot cross existing edges.
      if (
        segmentsIntersect(
          vertexA.x,
          vertexA.y,
          vertexB.x,
          vertexB.y,
          edgeBegin.x,
          edgeBegin.y,
          edgeEnd.x,
          edgeEnd.y
        )
      ) {
        return true;
      }
    }
    return false;
  }

  /**
   * Returns TRUE if line segment AB intersects with line segment CD in any
   * manner. Either collinear or at a single point.
   * @param ax The x-value for point (ax, ay) in line segment AB.
   * @param ay The y-value for point (ax, ay) in line segment AB.
   * @param bx The x-value for point (bx, by) in line segment AB.
   * @param by The y-value for point (bx, by) in line segment AB.
   * @param cx The x-value for point (cx, cy) in line segment CD.
   * @param cy The y-value for point (cx, cy) in line segment CD.
   * @param dx The x-value for point (dx, dy) in line segment CD.
   * @param dy The y-value for point (dx, dy) in line segment CD.
   * @return TRUE if line segment AB intersects with line segment CD in any
   * manner.
   */
  function segmentsIntersect(
    ax: integer,
    ay: integer,
    bx: integer,
    by: integer,
    cx: integer,
    cy: integer,
    dx: integer,
    dy: integer
  ): boolean {
    // This is modified 2D line-line intersection/segment-segment
    // intersection test.

    const deltaABx = bx - ax;
    const deltaABy = by - ay;
    const deltaCAx = ax - cx;
    const deltaCAy = ay - cy;
    const deltaCDx = dx - cx;
    const deltaCDy = dy - cy;

    const numerator = deltaCAy * deltaCDx - deltaCAx * deltaCDy;
    const denominator = deltaABx * deltaCDy - deltaABy * deltaCDx;

    // Perform early exit tests.
    if (denominator === 0 && numerator !== 0) {
      // If numerator is zero, then the lines are colinear.
      // Since it isn't, then the lines must be parallel.
      return false;
    }

    // Lines intersect. But do the segments intersect?

    // Forcing float division on both of these via casting of the
    // denominator.
    const factorAB = numerator / denominator;
    const factorCD = (deltaCAy * deltaABx - deltaCAx * deltaABy) / denominator;

    // Determine the type of intersection
    if (
      factorAB >= 0.0 &&
      factorAB <= 1.0 &&
      factorCD >= 0.0 &&
      factorCD <= 1.0
    ) {
      return true; // The two segments intersect.
    }

    // The lines intersect, but segments to not.

    return false;
  }
}
