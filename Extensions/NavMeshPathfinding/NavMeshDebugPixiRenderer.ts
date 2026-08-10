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
    isRegisteredFor2D = false;

    constructor(obstaclesManager: NavMeshObstaclesManager) {
      this.obstaclesManager = obstaclesManager;
    }

    setEnabled(
      instanceContainer: gdjs.RuntimeInstanceContainer,
      enabled: boolean
    ): void {
      this.enabled = enabled;
      if (enabled) {
        this.renderFor3D();
        if (!this.isRegisteredFor2D) {
          this.isRegisteredFor2D = true;
          this.registerFor2D(instanceContainer);
        }
      } else {
        this.removeFor3D();
      }
    }

    private registerFor2D(instanceContainer: gdjs.RuntimeInstanceContainer) {
      instanceContainer
        .getScene()
        .registerDebugDrawHook((rendererObject: PIXI.Graphics) => {
          if (!this.enabled || this.obstaclesManager.is3D) {
            return;
          }
          const { navMesh, obstacles } = this.obstaclesManager;
          if (!navMesh) {
            return;
          }
          const firstObstacle: gdjs.NavMeshObstacleRuntimeBehavior = obstacles
            .values()
            .next().value;
          if (!firstObstacle) {
            return;
          }
          const scene = firstObstacle.owner.getRuntimeScene();
          const layer = scene.getLayer(firstObstacle.owner.getLayer());
          const workingPoint: FloatPoint = [0, 0];

          rendererObject.beginFill();
          rendererObject.fill.alpha = 0.5;
          rendererObject.fill.color = 0x778ee8;

          if (!this.debugDrawerUtils) {
            this.debugDrawerUtils = new RecastNav.DebugDrawerUtils();
          }
          const primitives = this.debugDrawerUtils.drawNavMesh(navMesh);
          const speedScaleY = this.obstaclesManager.speedScaleY;
          for (const primitive of primitives) {
            switch (primitive.type) {
              case 'tris':
                for (let i = 0; i + 2 < primitive.vertices.length; i += 3) {
                  const [x0, y0, z0] = primitive.vertices[i];
                  if (y0 < 1) {
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

    removeFor3D() {
      for (const mesh of this.meshes) {
        mesh.removeFromParent();
      }
      this.meshes.length = 0;
    }

    renderFor3D() {
      this.removeFor3D();
      if (!this.enabled || !this.obstaclesManager.is3D) {
        return;
      }
      const { navMesh, obstacles } = this.obstaclesManager;
      if (!navMesh) {
        return;
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
      if (!this.debugDrawerUtils) {
        this.debugDrawerUtils = new RecastNav.DebugDrawerUtils();
      }
      const primitives = this.debugDrawerUtils.drawNavMesh(navMesh);
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
            this.meshes.push(mesh);
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
