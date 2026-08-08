/*
GDevelop - Pathfinding Behavior Extension
Copyright (c) 2013-2016 Florian Rival (Florian.Rival@gmail.com)
 */

namespace gdjs {
  class NavMeshDebuggerPixiRenderer {
    obstaclesManager: NavMeshObstaclesManager;
    debugDrawerUtils: RecastNav.DebugDrawerUtils | null = null;
    enabled = false;
    meshes: Array<THREE.Mesh> = [];
    material: THREE.MeshStandardMaterial | null = null;

    constructor(obstaclesManager: NavMeshObstaclesManager) {
      this.obstaclesManager = obstaclesManager;
    }

    setEnabled(enabled: boolean): void {
      this.enabled = enabled;
    }

    registerFor2D() {
      const firstObstacle: NavMeshObstacleRuntimeBehavior =
        this.obstaclesManager.obstacles.values().next().value;
      if (firstObstacle) {
        firstObstacle.owner
          .getRuntimeScene()
          .registerDebugDrawHook((rendererObject: PIXI.Graphics) => {
            if (!this.enabled || this.obstaclesManager.is3D) {
              return;
            }
            const { navMesh, obstacles } = this.obstaclesManager;
            if (!navMesh) {
              return;
            }
            if (!this.debugDrawerUtils) {
              this.debugDrawerUtils = new RecastNav.DebugDrawerUtils();
            }
            const primitives = this.debugDrawerUtils.drawNavMesh(navMesh);
            const firstObstacle: gdjs.NavMeshObstacleRuntimeBehavior = obstacles
              .values()
              .next().value;
            const scene = firstObstacle.owner.getRuntimeScene();
            const layer = scene.getLayer(firstObstacle.owner.getLayer());
            const workingPoint: FloatPoint = [0, 0];

            rendererObject.beginFill();
            rendererObject.fill.alpha = 0.5;
            rendererObject.fill.color = 0x778ee8;

            const speedScaleY = this.obstaclesManager.speedScaleY;
            for (const primitive of primitives) {
              switch (primitive.type) {
                case 'tris':
                  for (let i = 0; i + 2 < primitive.vertices.length; i += 3) {
                    const [x0, y0, z0] = primitive.vertices[i];
                    if (
                      y0 < 1
                    ) {
                      const [x1, _y1, z1] = primitive.vertices[i + 1];
                      const [x2, _y2, z2] = primitive.vertices[i + 2];

                      const positions: Array<float> = [];
                      positions.push.apply(
                        positions,
                        layer.applyLayerTransformation(
                          x0,
                          z0 * speedScaleY,
                          0,
                          workingPoint
                        )
                      );
                      positions.push.apply(
                        positions,
                        layer.applyLayerTransformation(
                          x1,
                          z1 * speedScaleY,
                          0,
                          workingPoint
                        )
                      );
                      positions.push.apply(
                        positions,
                        layer.applyLayerTransformation(
                          x2,
                          z2 * speedScaleY,
                          0,
                          workingPoint
                        )
                      );
                      rendererObject.drawPolygon(positions);
                    }
                  }
                  break;
              }
            }
            rendererObject.endFill();
          });
      }
    }

    renderFor3D() {
      for (const mesh of this.meshes) {
        mesh.removeFromParent();
      }
      this.meshes.length = 0;
      if (!this.enabled || !this.obstaclesManager.is3D) {
        return;
      }
      const { navMesh, obstacles } = this.obstaclesManager;
      if (!navMesh) {
        return;
      }
      if (!this.debugDrawerUtils) {
        this.debugDrawerUtils = new RecastNav.DebugDrawerUtils();
      }
      const firstObstacle: gdjs.NavMeshObstacleRuntimeBehavior = obstacles
        .values()
        .next().value;
      const scene = firstObstacle.owner.getRuntimeScene();
      const layer = scene.getLayer(firstObstacle.owner.getLayer());
      const rendererObject = layer.get3DRendererObject();
      if (!rendererObject) {
        return;
      }
      const primitives = this.debugDrawerUtils.drawNavMesh(navMesh);
      const meshes: Array<THREE.Mesh> = [];
      for (const primitive of primitives) {
        switch (primitive.type) {
          case 'tris':
            const geometry = new THREE.BufferGeometry();
            const positions = new Float32Array(primitive.vertices.length * 3);

            for (let i = 0; i < primitive.vertices.length; i++) {
              const [x, y, z] = primitive.vertices[i];

              // Invert triangles side
              const triangleVertexIndex = i % 3;
              const vertexIndex =
                triangleVertexIndex === 0
                  ? i + 1
                  : triangleVertexIndex === 1
                    ? i - 1
                    : i;

              positions[vertexIndex * 3 + 0] = x;
              positions[vertexIndex * 3 + 1] = z;
              positions[vertexIndex * 3 + 2] = y;
            }

            geometry.setAttribute(
              'position',
              new THREE.BufferAttribute(positions, 3)
            );

            if (!this.material) {
              this.material = new THREE.MeshStandardMaterial({
                color: 0x778ee8,
              });
            }
            const mesh = new THREE.Mesh(geometry, this.material);
            meshes.push(mesh);
            rendererObject.add(mesh);
            break;
        }
      }
    }
  }

  // Register the class to let the engine use it.
  /**
   * @category Debugging > Debugger Renderer
   */
  export type NavMeshDebuggerRenderer = NavMeshDebuggerPixiRenderer;
  /**
   * @category Debugging > Debugger Renderer
   */
  export const NavMeshDebuggerRenderer = NavMeshDebuggerPixiRenderer;
}
