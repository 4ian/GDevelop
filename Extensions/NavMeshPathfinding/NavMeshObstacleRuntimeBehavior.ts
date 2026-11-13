namespace gdjs {
  export interface RuntimeInstanceContainer {
    navMeshObstaclesManager: gdjs.NavMeshObstaclesManager;
  }

  /**
   * Building a tile of 32x32 cells takes 1 to 3 milliseconds. When the
   * navigation mesh is first built (a whole level), at most this many cells
   * of tiles are built per frame.
   */
  const cellsBuiltPerFrameMaxForFirstBuild = 4 * 32 * 32;
  /**
   * After obstacles changed, at most one tile is built per frame, so that
   * frames stay regular, and at most 40 per second, whatever the frame rate.
   */
  const tilesRebuildIntervalMin = 1 / 40;
  /**
   * Obstacles moving continuously (pushed, falling...) would rebuild their
   * tiles at every frame: each tile is rebuilt at most 10 times per second.
   */
  const tileRebuildIntervalMin = 0.1;
  /**
   * The geometry of obstacles that changed (moved, surface edited...) is
   * computed again at most 10 times per second, as converting a terrain
   * or a 3D model takes several milliseconds.
   */
  const obstaclesUpdateIntervalMin = 0.1;
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
    /**
     * The geometry of each obstacle, except the ones added since the last
     * update of changed obstacles (see `updateChangedObstacles`).
     */
    private obstacleGeometries = new Map<
      NavMeshObstacleRuntimeBehavior,
      gdjs.NavMeshObstacleGeometry
    >();
    /**
     * The obstacles whose geometry must be computed again, with the part of
     * their surface that changed, or null if the whole obstacle changed.
     */
    private changedObstacles = new Map<
      NavMeshObstacleRuntimeBehavior,
      gdjs.SurfaceArea | null
    >();
    private obstaclesUpdateTime: float = Number.NEGATIVE_INFINITY;
    /** The tiles to build, in the order they are built. */
    private tilesToBuild = new Map<integer, NavMeshTileCoordinates>();
    private tileVertices: Array<float> = [];
    /** In 2D, the ground goes around the obstacles. */
    private groundArea: gdjs.NavMeshArea | null = null;
    private obstaclesAreaAroundGround: gdjs.NavMeshArea | null = null;
    private isFirstBuildInProgress = false;
    private haveTilesChangedSincePathsRefresh = false;
    private pathsRefreshTime: float = 0;
    /** The time of the manager, compared to the times below. */
    private time: float = 0;
    /**
     * When each tile was built again since the first build, to limit how
     * often it is, and to show it in the debug draw.
     */
    private tileBuildTimes = new Map<integer, float>();
    private tilesRebuildTime: float = Number.NEGATIVE_INFINITY;
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
      this.time += timeDelta;
      // Don't try to build the nav mesh before the events get a chance
      // to build the level.
      if (!this.isFirstFrame) {
        this.rebuildNavMeshIfNeeded();
        this.updateChangedObstaclesIfNeeded();
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
      this.buildNavMesh();
    }

    private buildNavMesh(): void {
      const recastModule = gdjs.NavMeshTileBuilder.recastModule;
      if (!recastModule) {
        return;
      }
      // Even if the navigation mesh can't be built, the current one is kept
      // up to date with the obstacles.
      this.updateChangedObstacles();
      // Changes extending the 2D ground (see `extendGroundIfNeeded`) are
      // taken into account by this build.
      this.isNavMeshDirty = false;
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
        this.destroyCrowd(oldCrowd);
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
        (!this.isFirstBuildInProgress &&
          this.time - this.tilesRebuildTime < tilesRebuildIntervalMin)
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
        return;
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
        this.tilesRebuildTime = this.time;
        this.onTilesBuilt();
      }
    }

    /**
     * Build the tiles waiting to be built around a position of the scene,
     * for queries that can't wait for them.
     */
    buildTilesAround(sceneX: float, sceneY: float): void {
      this.updateChangedObstaclesIfNeeded();
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
        // Obstacles added since the last update of changed obstacles are
        // not in the navigation mesh yet: their tiles will be built then.
        const geometry = this.obstacleGeometries.get(obstacle);
        if (geometry && geometry.overlaps(geometryArea)) {
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
        // Only the tiles built again from now on are shown as rebuilt.
        this.tileBuildTimes.clear();
        // Paths found while tiles were missing can now be improved.
        this.pathsRefreshTime = Number.NEGATIVE_INFINITY;
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
      return this.time - tileBuildTime < debugDrawnRebuiltTileDuration;
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
        this.time - this.pathsRefreshTime < pathsRefreshInterval
      ) {
        return;
      }
      this.haveTilesChangedSincePathsRefresh = false;
      this.pathsRefreshTime = this.time;
      for (const character of this.characters) {
        if (!character._agent) {
          // There may now be a floor near the character.
          this.buildCharacterAgent(character);
        }
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
        geometry = gdjs.NavMeshObstacleGeometry.create(obstacle, this);
        this.obstacleGeometries.set(obstacle, geometry);
      }
      return geometry;
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
      gdjs.NavMeshObstacleGeometry.appendBoxTriangles(
        vertices,
        [minX, -this.cellSize, minZ],
        [maxX, -1, maxZ]
      );
    }

    /**
     * The closest point of the navigation mesh around a position of the
     * scene, or null if there is none.
     */
    findClosestPoint(
      sceneX: float,
      sceneY: float,
      sceneZ: float
    ): RecastNav.Vector3 | null {
      if (!this.crowd) {
        return null;
      }
      // The query of the crowd is used: creating one for each search is
      // slow, and `RecastNav.NavMeshQuery` doesn't free all its memory.
      const { success, point } = this.crowd.navMeshQuery.findClosestPoint(
        { x: sceneX, y: sceneZ, z: this.toNavMeshZ(sceneY) },
        {
          halfExtents: {
            x: searchHalfExtent,
            y: this.is3D ? searchHalfExtent : this.cellSize / 2 - 0.5,
            z: searchHalfExtent,
          },
        }
      );
      return success ? point : null;
    }

    /**
     * `RecastNav.Crowd` doesn't free the default filter of its query.
     */
    private destroyCrowd(crowd: RecastNav.Crowd): void {
      const recastModule = gdjs.NavMeshTileBuilder.recastModule;
      if (recastModule) {
        recastModule.destroy(crowd.navMeshQuery.defaultFilter.raw);
      }
      crowd.destroy();
    }

    buildCharacterAgent(character: NavMeshCharacterRuntimeBehavior): void {
      if (!this.navMesh || !this.crowd) {
        return;
      }
      const owner = character.owner;
      this.buildTilesAround(owner.getX(), owner.getY());
      const origin = this.findClosestPoint(
        owner.getX(),
        owner.getY(),
        gdjs.Base3DHandler.is3D(owner) ? owner.getZ() : 0
      );
      if (!origin) {
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
      this.changedObstacles.delete(obstacle);
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
      if (!this.tileBuilder) {
        // It will be computed when the navigation mesh is built. It was
        // not built yet, or there was no obstacle.
        this.obstacleGeometries.delete(obstacle);
        this.invalidateNavMesh();
        return;
      }
      this.changedObstacles.set(obstacle, null);
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
      if (!this.changedObstacles.has(obstacle)) {
        this.changedObstacles.set(obstacle, { ...changedArea });
        return;
      }
      const previousChangedArea = this.changedObstacles.get(obstacle);
      // The whole obstacle may already have changed.
      if (previousChangedArea) {
        previousChangedArea.minX = Math.min(
          previousChangedArea.minX,
          changedArea.minX
        );
        previousChangedArea.minY = Math.min(
          previousChangedArea.minY,
          changedArea.minY
        );
        previousChangedArea.maxX = Math.max(
          previousChangedArea.maxX,
          changedArea.maxX
        );
        previousChangedArea.maxY = Math.max(
          previousChangedArea.maxY,
          changedArea.maxY
        );
      }
    }

    private updateChangedObstaclesIfNeeded(): void {
      if (
        this.changedObstacles.size === 0 ||
        // They will be updated when the navigation mesh is built again,
        // maybe with other settings (in 3D instead of 2D...).
        this.isNavMeshDirty ||
        this.time - this.obstaclesUpdateTime < obstaclesUpdateIntervalMin
      ) {
        return;
      }
      this.updateChangedObstacles();
    }

    /**
     * Compute again the geometry of the obstacles that changed, and add the
     * tiles where they were and where they are now to the tiles to build.
     */
    private updateChangedObstacles(): void {
      this.obstaclesUpdateTime = this.time;
      for (const [obstacle, changedSurfaceArea] of this.changedObstacles) {
        const oldGeometry = this.obstacleGeometries.get(obstacle);
        const geometry = gdjs.NavMeshObstacleGeometry.create(obstacle, this);
        this.obstacleGeometries.set(obstacle, geometry);
        if (oldGeometry && changedSurfaceArea) {
          // The triangles touching the part that changed go beyond it.
          const area = this.getObjectArea(obstacle.owner, changedSurfaceArea);
          const triangleSizeMax = Math.max(
            oldGeometry.getTriangleSizeMax(),
            geometry.getTriangleSizeMax()
          );
          this.addTilesToBuildIn({
            minX: area.minX - triangleSizeMax,
            minZ: area.minZ - triangleSizeMax,
            maxX: area.maxX + triangleSizeMax,
            maxZ: area.maxZ + triangleSizeMax,
          });
        } else {
          if (oldGeometry) {
            this.addTilesToBuildIn(oldGeometry.area);
          }
          this.addTilesToBuildIn(geometry.area);
        }
        this.extendGroundIfNeeded(geometry);
      }
      this.changedObstacles.clear();
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
      // Their geometry is computed again when the navigation mesh is built.
      if (this.tileBuilder) {
        for (const obstacle of this.obstacles) {
          this.changedObstacles.set(obstacle, null);
        }
      } else {
        this.obstacleGeometries.clear();
      }
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
        this.destroyCrowd(oldCrowd);
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
      this.changedObstacles.clear();
      this.tilesToBuild.clear();
      this.tileBuildTimes.clear();
      if (this.crowd) {
        this.destroyCrowd(this.crowd);
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
}
