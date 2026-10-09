/*
 * GDevelop JS Platform
 * Copyright 2013-2023 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
namespace gdjs {
  /** A value compared with a condition operator ("=", "<", ">", "<=", ">=" or "!="). */
  const compareWithOperator = (
    currentValue: float,
    operator: string,
    value: float
  ): boolean => {
    if (operator === '<') return currentValue < value;
    if (operator === '>') return currentValue > value;
    if (operator === '<=') return currentValue <= value;
    if (operator === '>=') return currentValue >= value;
    if (operator === '!=') return currentValue !== value;
    return currentValue === value;
  };

  /**
   * @category Objects > 3D Objects
   */
  export interface Base3DHandler {
    /**
     * Set the object position on the Z axis.
     */
    setZ(z: float): void;

    /**
     * Get the object position on the Z axis.
     */
    getZ(): float;

    /**
     * Return the Z position of the object center, **relative to the scene origin**.
     */
    getCenterZInScene(): float;

    /**
     * Change the object center Z position in the scene.
     * @param z The new Z position of the center in the scene.
     */
    setCenterZInScene(z: float): void;

    /**
     * Set the object rotation on the X axis.
     *
     * This is an Euler angle. Objects use the `ZYX` order.
     *
     * @param angle the rotation angle on the X axis in degree
     */
    setRotationX(angle: float): void;

    /**
     * Set the object rotation on the Y axis.
     *
     * This is an Euler angle. Objects use the `ZYX` order.
     *
     * @param angle the rotation angle on the Y axis in degree
     */
    setRotationY(angle: float): void;

    /**
     * Get the object rotation on the X axis in degree.
     *
     * This is an Euler angle. Objects use the `ZYX` order.
     */
    getRotationX(): float;

    /**
     * Get the object rotation on the Y axis in degree.
     *
     * This is an Euler angle. Objects use the `ZYX` order.
     */
    getRotationY(): float;

    /**
     * Turn the object around the scene X axis at its center.
     * @param deltaAngle the rotation angle in degree
     */
    turnAroundX(deltaAngle: float): void;

    /**
     * Turn the object around the scene Y axis at its center.
     * @param deltaAngle the rotation angle in degree
     */
    turnAroundY(deltaAngle: float): void;

    /**
     * Turn the object around the scene Z axis at its center.
     * @param deltaAngle the rotation angle in degree
     */
    turnAroundZ(deltaAngle: float): void;

    /**
     * Turn the object around its own X axis (which moves with the object
     * rotation) at its center.
     * @param deltaAngle the rotation angle in degree
     */
    turnAroundLocalX(deltaAngle: float): void;

    /**
     * Turn the object around its own Y axis (which moves with the object
     * rotation) at its center.
     * @param deltaAngle the rotation angle in degree
     */
    turnAroundLocalY(deltaAngle: float): void;

    /**
     * Turn the object around its own Z axis (which moves with the object
     * rotation) at its center.
     * @param deltaAngle the rotation angle in degree
     */
    turnAroundLocalZ(deltaAngle: float): void;

    /**
     * Get the X component of the forward vector of the object.
     */
    getForwardX(): float;

    /**
     * Get the Y component of the forward vector of the object.
     */
    getForwardY(): float;

    /**
     * Get the Z component of the forward vector of the object.
     */
    getForwardZ(): float;

    /**
     * Get the X component of the up vector of the object.
     */
    getUpX(): float;

    /**
     * Get the Y component of the up vector of the object.
     */
    getUpY(): float;

    /**
     * Get the Z component of the up vector of the object.
     */
    getUpZ(): float;

    /**
     * Get the X component of the right vector of the object.
     */
    getRightX(): float;

    /**
     * Get the Y component of the right vector of the object.
     */
    getRightY(): float;

    /**
     * Get the Z component of the right vector of the object.
     */
    getRightZ(): float;

    /**
     * Get the object size on the Z axis (called "depth").
     */
    getDepth(): float;

    /**
     * Set the object size on the Z axis (called "depth").
     */
    setDepth(depth: float): void;

    /**
     * Change the scale on Z axis of the object (changing its depth).
     *
     * @param newScale The new scale (must be greater than 0).
     */
    setScaleZ(newScale: float): void;

    /**
     * Get the scale of the object on Z axis.
     *
     * @return the scale of the object on Z axis
     */
    getScaleZ(): float;

    flipZ(enable: boolean): void;

    isFlippedZ(): boolean;

    /**
     * Return the bottom Z of the object.
     * Rotations around X and Y are not taken into account.
     */
    getUnrotatedAABBMinZ(): float;

    /**
     * Return the top Z of the object.
     * Rotations around X and Y are not taken into account.
     */
    getUnrotatedAABBMaxZ(): float;

    /**
     * Return the depth of the object before any custom size is applied.
     * @return The depth of the object
     */
    getOriginalDepth(): float;
  }

  /** @category Objects > 3D Objects */
  export interface Object3DDataContent {
    width: float;
    height: float;
    depth: float;
  }
  /**
   * Base parameters for {@link gdjs.RuntimeObject3D}
   * @category Objects > 3D Objects
   */
  export interface Object3DData extends ObjectData {
    /** The base parameters of the RuntimeObject3D */
    content: Object3DDataContent;
  }

  /** The axes of an object that can be chosen as its front or up. */
  const axisVectors: { [axis: string]: [float, float, float] } = {
    '+X': [1, 0, 0],
    '-X': [-1, 0, 0],
    '+Y': [0, 1, 0],
    '-Y': [0, -1, 0],
    '+Z': [0, 0, 1],
    '-Z': [0, 0, -1],
  };

  /**
   * A behavior that forwards the Base3D interface to its object.
   * @category Core Engine > Behavior
   */
  export class Base3DBehavior
    extends gdjs.RuntimeBehavior
    implements Base3DHandler
  {
    private object: gdjs.RuntimeObject & Base3DHandler;

    constructor(
      instanceContainer: gdjs.RuntimeInstanceContainer,
      behaviorData,
      owner: gdjs.RuntimeObject & Base3DHandler
    ) {
      super(instanceContainer, behaviorData, owner);
      this.object = owner;
    }

    override applyBehaviorOverriding(behaviorData): boolean {
      // Nothing to update.
      return true;
    }

    onDeActivate() {}

    onDestroy() {}

    doStepPreEvents(instanceContainer: gdjs.RuntimeInstanceContainer) {}

    doStepPostEvents(instanceContainer: gdjs.RuntimeInstanceContainer) {}

    setZ(z: float): void {
      this.object.setZ(z);
    }

    getZ(): float {
      return this.object.getZ();
    }

    getCenterZInScene(): number {
      return this.object.getCenterZInScene();
    }

    setCenterZInScene(z: number): void {
      this.object.setCenterZInScene(z);
    }

    setRotationX(angle: float): void {
      this.object.setRotationX(angle);
    }

    setRotationY(angle: float): void {
      this.object.setRotationY(angle);
    }

    /**
     * Change the X, Y and Z rotations at once (the Z rotation is the angle).
     */
    setRotation(rotationX: float, rotationY: float, rotationZ: float): void {
      this.object.setRotationX(rotationX);
      this.object.setRotationY(rotationY);
      this.object.setAngle(rotationZ);
    }

    getRotationX(): float {
      return this.object.getRotationX();
    }

    getRotationY(): float {
      return this.object.getRotationY();
    }

    /**
     * The rotation on Z axis is the angle of the object.
     */
    getRotationZ(): float {
      return this.object.getAngle();
    }

    /**
     * The rotation on Z axis is the angle of the object.
     */
    setRotationZ(angle: float): void {
      this.object.setAngle(angle);
    }

    turnAroundX(deltaAngle: float): void {
      this.object.turnAroundX(deltaAngle);
    }

    turnAroundY(deltaAngle: float): void {
      this.object.turnAroundY(deltaAngle);
    }

    turnAroundZ(deltaAngle: float): void {
      this.object.turnAroundZ(deltaAngle);
    }

    turnAroundLocalX(deltaAngle: float): void {
      this.object.turnAroundLocalX(deltaAngle);
    }

    turnAroundLocalY(deltaAngle: float): void {
      this.object.turnAroundLocalY(deltaAngle);
    }

    turnAroundLocalZ(deltaAngle: float): void {
      this.object.turnAroundLocalZ(deltaAngle);
    }

    /**
     * Turn the object so that one of its axes (its front) points toward a
     * position, from its center. Another one of its axes (its up) keeps its
     * direction, or points as much as possible toward the top of the scene (the
     * Z axis).
     *
     * @param frontAxis the axis of the object pointing toward the position:
     * "+X", "-X", "+Y", "-Y", "+Z" or "-Z".
     * @param upAxis the axis of the object pointing up, perpendicular to the
     * front axis: "+X", "-X", "+Y", "-Y", "+Z" or "-Z".
     * @param keepRotationAroundFront `true` (the default) to keep the current
     * rotation of the object around its front axis (the up axis keeps its
     * direction as much as possible), so that the rotations around this axis
     * add up. `false` to point the up axis toward the top of the scene.
     */
    turnTowardPosition(
      targetX: float,
      targetY: float,
      targetZ: float,
      frontAxis: string = '+X',
      upAxis: string = '+Z',
      keepRotationAroundFront: boolean = true
    ): void {
      const temporaries = Base3DBehavior._getTurnTowardTemporaries();
      const worldFront = temporaries.worldFront.set(
        targetX - this.object.getCenterXInScene(),
        targetY - this.object.getCenterYInScene(),
        targetZ - this.object.getCenterZInScene()
      );
      if (worldFront.lengthSq() === 0) {
        return;
      }
      worldFront.normalize();

      const localFront = temporaries.localFront.fromArray(
        axisVectors[frontAxis] || axisVectors['+X']
      );
      const localUp = temporaries.localUp.fromArray(
        axisVectors[upAxis] || axisVectors['+Z']
      );
      if (Math.abs(localFront.dot(localUp)) > 0.5) {
        // The up axis must be perpendicular to the front axis: models made
        // for a Y-up world look along their Z axis.
        localUp.fromArray(
          localFront.z !== 0 ? axisVectors['+Y'] : axisVectors['+Z']
        );
      }

      // The up axis goes as close as possible to the top of the scene, or to
      // its current direction to keep the rotation around the front axis. When
      // this direction is along the front, the other one is used.
      const currentUp = temporaries.currentUp
        .copy(localUp)
        .applyEuler(
          temporaries.currentRotation.set(
            gdjs.toRad(this.object.getRotationX()),
            gdjs.toRad(this.object.getRotationY()),
            gdjs.toRad(this.object.getAngle()),
            'ZYX'
          )
        );
      const sceneUp = temporaries.sceneUp.set(0, 0, 1);
      const worldUp = temporaries.worldUp.copy(
        keepRotationAroundFront ? currentUp : sceneUp
      );
      if (Math.abs(worldFront.dot(worldUp)) > 0.9999) {
        worldUp.copy(keepRotationAroundFront ? sceneUp : currentUp);
        if (Math.abs(worldFront.dot(worldUp)) > 0.9999) {
          worldUp.set(1, 0, 0);
        }
      }
      worldUp.addScaledVector(worldFront, -worldFront.dot(worldUp)).normalize();

      // The rotation sends the local front, up and third axes to the ones in
      // the scene: rotation = worldBasis * transpose(localBasis).
      const localThird = temporaries.localThird.crossVectors(
        localFront,
        localUp
      );
      const worldThird = temporaries.worldThird.crossVectors(
        worldFront,
        worldUp
      );
      const rotationMatrix = temporaries.worldBasis
        .makeBasis(worldFront, worldUp, worldThird)
        .multiply(
          temporaries.localBasis
            .makeBasis(localFront, localUp, localThird)
            .transpose()
        );
      const rotation = temporaries.newRotation.setFromRotationMatrix(
        rotationMatrix,
        'ZYX'
      );
      this.object.setRotationX(gdjs.toDegrees(rotation.x));
      this.object.setRotationY(gdjs.toDegrees(rotation.y));
      this.object.setAngle(gdjs.toDegrees(rotation.z));
    }

    /**
     * Turn the object so that one of its axes (its front) points toward the
     * center of another object (2D objects are considered at Z = 0), while
     * another one of its axes (its up) points as much as possible toward the
     * top of the scene (or keeps its direction, see `turnTowardPosition`).
     */
    turnTowardObject(
      targetObject: gdjs.RuntimeObject | null,
      frontAxis: string = '+X',
      upAxis: string = '+Z',
      keepRotationAroundFront: boolean = true
    ): void {
      if (!targetObject) {
        return;
      }
      this.turnTowardPosition(
        targetObject.getCenterXInScene(),
        targetObject.getCenterYInScene(),
        gdjs.Base3DHandler.is3D(targetObject)
          ? targetObject.getCenterZInScene()
          : 0,
        frontAxis,
        upAxis,
        keepRotationAroundFront
      );
    }

    private static _turnTowardTemporaries: {
      worldFront: THREE.Vector3;
      worldUp: THREE.Vector3;
      worldThird: THREE.Vector3;
      localFront: THREE.Vector3;
      localUp: THREE.Vector3;
      localThird: THREE.Vector3;
      currentUp: THREE.Vector3;
      sceneUp: THREE.Vector3;
      worldBasis: THREE.Matrix4;
      localBasis: THREE.Matrix4;
      currentRotation: THREE.Euler;
      newRotation: THREE.Euler;
    } | null = null;

    private static _getTurnTowardTemporaries() {
      if (!Base3DBehavior._turnTowardTemporaries) {
        Base3DBehavior._turnTowardTemporaries = {
          worldFront: new THREE.Vector3(),
          worldUp: new THREE.Vector3(),
          worldThird: new THREE.Vector3(),
          localFront: new THREE.Vector3(),
          localUp: new THREE.Vector3(),
          localThird: new THREE.Vector3(),
          currentUp: new THREE.Vector3(),
          sceneUp: new THREE.Vector3(),
          worldBasis: new THREE.Matrix4(),
          localBasis: new THREE.Matrix4(),
          currentRotation: new THREE.Euler(),
          newRotation: new THREE.Euler(),
        };
      }
      return Base3DBehavior._turnTowardTemporaries;
    }

    getForwardX(): float {
      return this.object.getForwardX();
    }

    getForwardY(): float {
      return this.object.getForwardY();
    }

    getForwardZ(): float {
      return this.object.getForwardZ();
    }

    getUpX(): float {
      return this.object.getUpX();
    }

    getUpY(): float {
      return this.object.getUpY();
    }

    getUpZ(): float {
      return this.object.getUpZ();
    }

    getRightX(): float {
      return this.object.getRightX();
    }

    getRightY(): float {
      return this.object.getRightY();
    }

    getRightZ(): float {
      return this.object.getRightZ();
    }

    getDepth(): float {
      return this.object.getDepth();
    }

    setDepth(depth: float): void {
      this.object.setDepth(depth);
    }

    /**
     * Compare the width, height and depth of the object with the same
     * operator: true if the three comparisons are true.
     */
    compareSize(
      operator: string,
      width: float,
      height: float,
      depth: float
    ): boolean {
      return (
        compareWithOperator(this.object.getWidth(), operator, width) &&
        compareWithOperator(this.object.getHeight(), operator, height) &&
        compareWithOperator(this.object.getDepth(), operator, depth)
      );
    }

    setScaleZ(newScale: number): void {
      this.object.setScaleZ(newScale);
    }

    getScaleZ(): float {
      return this.object.getScaleZ();
    }

    flipZ(enable: boolean): void {
      this.object.flipZ(enable);
    }

    isFlippedZ(): boolean {
      return this.object.isFlippedZ();
    }

    getUnrotatedAABBMinZ(): number {
      return this.object.getUnrotatedAABBMinZ();
    }

    getUnrotatedAABBMaxZ(): number {
      return this.object.getUnrotatedAABBMaxZ();
    }

    getOriginalDepth(): float {
      return this.object.getOriginalDepth();
    }
  }

  gdjs.registerBehavior('Scene3D::Base3DBehavior', gdjs.Base3DBehavior);
}
