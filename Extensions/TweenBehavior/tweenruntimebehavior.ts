/*
GDevelop - Tween Behavior Extension
Copyright (c) 2010-2023 Florian Rival (Florian.Rival@gmail.com)
 */
namespace gdjs {
  const logger = new gdjs.Logger('Tween');

  interface TweenBehaviorNetworkSyncDataType {
    tweenManager: TweenManagerNetworkSyncData;
  }
  /**
   * @category Synchronization > Tween
   */
  export interface TweenBehaviorNetworkSyncData
    extends BehaviorNetworkSyncData {
    props: TweenBehaviorNetworkSyncDataType;
  }

  interface IColorable extends gdjs.RuntimeObject {
    setColor(color: string): void;
    getColor(): string;
  }

  interface ICharacterScalable extends gdjs.RuntimeObject {
    setCharacterSize(characterSize: number): void;
    getCharacterSize(): number;
  }

  function isScalable(
    object: gdjs.RuntimeObject
  ): object is gdjs.RuntimeObject & gdjs.Scalable {
    return (
      //@ts-ignore We are checking if the methods are present.
      object.setScaleX &&
      //@ts-ignore
      object.setScaleY &&
      //@ts-ignore
      object.getScaleX &&
      //@ts-ignore
      object.getScaleY
    );
  }

  function isOpaque(
    object: gdjs.RuntimeObject
  ): object is gdjs.RuntimeObject & gdjs.OpacityHandler {
    //@ts-ignore We are checking if the methods are present.
    return object.setOpacity && object.getOpacity;
  }

  function is3D(
    object: gdjs.RuntimeObject
  ): object is gdjs.RuntimeObject & gdjs.Base3DHandler {
    //@ts-ignore We are checking if the methods are present.
    return object.getZ && object.setZ;
  }

  function isColorable(object: gdjs.RuntimeObject): object is IColorable {
    //@ts-ignore We are checking if the methods are present.
    return object.setColor && object.getColor;
  }

  function isCharacterScalable(
    object: gdjs.RuntimeObject
  ): object is ICharacterScalable {
    //@ts-ignore We are checking if the methods are present.
    return object.setCharacterSize && object.getCharacterSize;
  }

  const linearInterpolation = gdjs.evtTools.common.lerp;
  const exponentialInterpolation =
    gdjs.evtTools.common.exponentialInterpolation;

  const tweenObjectValueSetter = () => {};
  const getTweenVariableSetter = (variable: gdjs.Variable) => {
    return (value: float) => variable.setNumber(value);
  };
  const getTweenObjectPositionXSetter = (object: gdjs.RuntimeObject) => {
    return (value: float) => object.setX(value);
  };
  const getTweenObjectPositionYSetter = (object: gdjs.RuntimeObject) => {
    return (value: float) => object.setY(value);
  };
  const getTweenObjectPositionZSetter = (object: gdjs.RuntimeObject) => {
    if (!is3D(object)) return () => {};
    return (value: float) => object.setZ(value);
  };
  const getTweenObjectPositionSetter = (object: gdjs.RuntimeObject) => {
    return ([x, y]: float[]) => object.setPosition(x, y);
  };
  const getTweenObjectAngleSetter = (object: gdjs.RuntimeObject) => {
    return (value: float) => object.setAngle(value);
  };
  const getTweenObjectWidthSetter = (object: gdjs.RuntimeObject) => {
    return (value: float) => object.setWidth(value);
  };
  const getTweenObjectHeightSetter = (object: gdjs.RuntimeObject) => {
    return (value: float) => object.setHeight(value);
  };
  const getTweenObjectRotationXSetter = (
    object: gdjs.RuntimeObject & gdjs.Base3DHandler
  ) => {
    return (value: float) => object.setRotationX(value);
  };
  const getTweenObjectRotationYSetter = (
    object: gdjs.RuntimeObject & gdjs.Base3DHandler
  ) => {
    return (value: float) => object.setRotationY(value);
  };
  const getTweenObjectDepthSetter = (
    object: gdjs.RuntimeObject & gdjs.Base3DHandler
  ) => {
    return (value: float) => object.setDepth(value);
  };
  const getTweenObjectScaleXYSetter = (
    object: gdjs.RuntimeObject & gdjs.Scalable,
    scaleFromCenterOfObject: boolean
  ) => {
    return scaleFromCenterOfObject
      ? ([scaleX, scaleY]: float[]) => {
          const oldX = object.getCenterXInScene();
          const oldY = object.getCenterYInScene();
          object.setScaleX(scaleX);
          object.setScaleY(scaleY);
          object.setCenterPositionInScene(oldX, oldY);
        }
      : ([scaleX, scaleY]: float[]) => {
          object.setScaleX(scaleX);
          object.setScaleY(scaleY);
        };
  };
  const getTweenObjectScaleSetter = (
    object: gdjs.RuntimeObject & gdjs.Scalable,
    object3d: (gdjs.RuntimeObject & gdjs.Base3DHandler) | null,
    scaleFromCenterOfObject: boolean
  ) => {
    return scaleFromCenterOfObject
      ? (scale: float) => {
          const oldX = object.getCenterXInScene();
          const oldY = object.getCenterYInScene();
          const oldZ = object3d ? object3d.getCenterZInScene() : 0;
          object.setScale(scale);
          object.setCenterXInScene(oldX);
          object.setCenterYInScene(oldY);
          if (object3d) {
            object3d.setCenterZInScene(oldZ);
          }
        }
      : (scale: float) => object.setScale(scale);
  };
  const getTweenObjectScaleXSetter = (
    object: gdjs.RuntimeObject & gdjs.Scalable,
    scaleFromCenterOfObject: boolean
  ) => {
    return scaleFromCenterOfObject
      ? (scaleX: float) => {
          const oldX = object.getCenterXInScene();
          object.setScaleX(scaleX);
          object.setCenterXInScene(oldX);
        }
      : (scaleX: float) => object.setScaleX(scaleX);
  };
  const getTweenObjectScaleYSetter = (
    object: gdjs.RuntimeObject & gdjs.Scalable,
    scaleFromCenterOfObject: boolean
  ) => {
    return scaleFromCenterOfObject
      ? (scaleY: float) => {
          const oldY = object.getCenterYInScene();
          object.setScaleY(scaleY);
          object.setCenterYInScene(oldY);
        }
      : (scaleY: float) => object.setScaleY(scaleY);
  };
  const getTweenObjectOpacitySetter = (
    object: gdjs.RuntimeObject & gdjs.OpacityHandler
  ) => {
    return (value: float) => object.setOpacity(value);
  };
  const getTweenObjectCharacterSizeSetter = (object: ICharacterScalable) => {
    return (value: float) => object.setCharacterSize(value);
  };
  const getTweenObjectNumberEffectPropertySetter = (
    effect: PixiFiltersTools.Filter,
    propertyName: string
  ) => {
    return (value: float) => {
      effect.updateDoubleParameter(propertyName, value);
    };
  };
  const getTweenObjectColorEffectPropertySetter = (
    effect: PixiFiltersTools.Filter,
    propertyName: string
  ) => {
    return ([hue, saturation, lightness]: number[]) => {
      const rgbFromHslColor = gdjs.evtTools.tween.hslToRgb(
        hue,
        saturation,
        lightness
      );
      effect.updateColorParameter(
        propertyName,
        gdjs.rgbToHexNumber(
          rgbFromHslColor[0],
          rgbFromHslColor[1],
          rgbFromHslColor[2]
        )
      );
    };
  };
  const getTweenObjectColorSetter = (
    object: IColorable,
    useHSLColorTransition: boolean
  ) => {
    if (useHSLColorTransition) {
      return ([hue, saturation, lightness]: number[]) => {
        const rgbFromHslColor = gdjs.evtTools.tween.hslToRgb(
          hue,
          saturation,
          lightness
        );
        object.setColor(
          Math.floor(rgbFromHslColor[0]) +
            ';' +
            Math.floor(rgbFromHslColor[1]) +
            ';' +
            Math.floor(rgbFromHslColor[2])
        );
      };
    } else {
      return ([red, green, blue]: number[]) => {
        object.setColor(
          Math.floor(red) + ';' + Math.floor(green) + ';' + Math.floor(blue)
        );
      };
    }
  };
  const getTweenObjectColorHSLSetter = (object: IColorable) => {
    return ([hue, saturation, lightness]: number[]) => {
      const rgbFromHslColor = gdjs.evtTools.tween.hslToRgb(
        hue,
        saturation,
        lightness
      );

      object.setColor(
        Math.floor(rgbFromHslColor[0]) +
          ';' +
          Math.floor(rgbFromHslColor[1]) +
          ';' +
          Math.floor(rgbFromHslColor[2])
      );
    };
  };

  const tweenSetterFactory =
    (object: RuntimeObject) =>
    (tweenInformation: TweenInformationNetworkSyncData) => {
      const type = tweenInformation.type;
      const variablePath = tweenInformation.variablePath;
      const effectName = tweenInformation.effectName;
      const propertyName = tweenInformation.propertyName;
      const scaleFromCenterOfObject =
        !!tweenInformation.scaleFromCenterOfObject;
      const useHSLColorTransition = !!tweenInformation.useHSLColorTransition;
      if (type === 'objectValue') {
        return tweenObjectValueSetter;
      }
      if (type === 'variable' && variablePath) {
        const variable = object
          .getVariables()
          .getVariableFromPath(variablePath);
        if (!variable) return () => {};
        return getTweenVariableSetter(variable);
      }
      if (type === 'positionX') {
        return getTweenObjectPositionXSetter(object);
      }
      if (type === 'positionY') {
        return getTweenObjectPositionYSetter(object);
      }
      if (type === 'position') {
        return getTweenObjectPositionSetter(object);
      }
      if (type === 'positionZ') {
        return getTweenObjectPositionZSetter(object);
      }
      if (type === 'width') {
        return getTweenObjectWidthSetter(object);
      }
      if (type === 'height') {
        return getTweenObjectHeightSetter(object);
      }
      if (type === 'depth') {
        if (!is3D(object)) return () => {};
        return getTweenObjectDepthSetter(object);
      }
      if (type === 'angle') {
        return getTweenObjectAngleSetter(object);
      }
      if (type === 'rotationX') {
        if (!is3D(object)) return () => {};
        return getTweenObjectRotationXSetter(object);
      }
      if (type === 'rotationY') {
        if (!is3D(object)) return () => {};
        return getTweenObjectRotationYSetter(object);
      }
      if (type === 'scale') {
        if (!isScalable(object)) return () => {};

        const object3d = is3D(object) ? object : null;
        return getTweenObjectScaleSetter(
          object,
          object3d,
          scaleFromCenterOfObject
        );
      }
      if (type === 'scaleXY') {
        if (!isScalable(object)) return () => {};
        return getTweenObjectScaleXYSetter(object, scaleFromCenterOfObject);
      }
      if (type === 'scaleX') {
        if (!isScalable(object)) return () => {};
        return getTweenObjectScaleXSetter(object, scaleFromCenterOfObject);
      }
      if (type === 'scaleY') {
        if (!isScalable(object)) return () => {};
        return getTweenObjectScaleYSetter(object, scaleFromCenterOfObject);
      }
      if (type === 'opacity') {
        if (!isOpaque(object)) return () => {};
        return getTweenObjectOpacitySetter(object);
      }
      if (type === 'characterSize') {
        if (!isCharacterScalable(object)) return () => {};
        return getTweenObjectCharacterSizeSetter(object);
      }
      if (type === 'numberEffectProperty' && effectName && propertyName) {
        const effect = object.getRendererEffects()[effectName];
        if (!effect) {
          logger.error(
            `The object "${object.name}" doesn't have any effect called "${effectName}"`
          );
        }
        return getTweenObjectNumberEffectPropertySetter(effect, propertyName);
      }
      if (type === 'colorEffectProperty' && effectName && propertyName) {
        const effect = object.getRendererEffects()[effectName];
        if (!effect) {
          logger.error(
            `The object "${object.name}" doesn't have any effect called "${effectName}"`
          );
        }

        return getTweenObjectColorEffectPropertySetter(effect, propertyName);
      }

      if (type === 'objectColor') {
        if (!isColorable(object)) return () => {};

        return getTweenObjectColorSetter(object, useHSLColorTransition);
      }
      if (type === 'objectColorHSL') {
        if (!isColorable(object)) return () => {};

        return getTweenObjectColorHSLSetter(object);
      }

      return () => {};
    };

  /**
   * @category Behaviors > Tween
   */
  export class TweenRuntimeBehavior extends gdjs.RuntimeBehavior {
    private _tweens = new gdjs.evtTools.tween.TweenManager();
    private _isActive: boolean = true;

    /**
     * @param instanceContainer The instance container the behavior belongs to.
     * @param behaviorData The data to initialize the behavior
     * @param owner The runtime object the behavior belongs to.
     */
    constructor(
      instanceContainer: gdjs.RuntimeInstanceContainer,
      behaviorData: BehaviorData,
      owner: gdjs.RuntimeObject
    ) {
      super(instanceContainer, behaviorData, owner);
    }

    updateFromBehaviorData(
      oldBehaviorData: BehaviorData,
      newBehaviorData: BehaviorData
    ): boolean {
      // Nothing to update.
      return true;
    }

    getNetworkSyncData(
      syncOptions: GetNetworkSyncDataOptions
    ): TweenBehaviorNetworkSyncData {
      return {
        ...super.getNetworkSyncData(syncOptions),
        props: {
          tweenManager: this._tweens.getNetworkSyncData(),
        },
      };
    }

    updateFromNetworkSyncData(
      networkSyncData: TweenBehaviorNetworkSyncData,
      options: UpdateFromNetworkSyncDataOptions
    ): void {
      super.updateFromNetworkSyncData(networkSyncData, options);

      if (networkSyncData.props.tweenManager) {
        this._tweens.updateFromNetworkSyncData(
          networkSyncData.props.tweenManager,
          (tweenInformationNetworkSyncData) => {
            return this.owner;
          },
          (tweenInformationNetworkSyncData) => {
            return tweenSetterFactory(this.owner)(
              tweenInformationNetworkSyncData
            );
          },
          (tweenInformationNetworkSyncData) => {
            return tweenInformationNetworkSyncData.destroyObjectWhenFinished
              ? () => this._deleteFromScene()
              : null;
          }
        );
      }
    }

    doStepPreEvents(instanceContainer: gdjs.RuntimeInstanceContainer): void {
      this._tweens.step();
    }

    private _deleteFromScene() {
      this.owner.deleteFromScene();
    }

    /**
     * Add an object variable tween.
     * @deprecated Use addVariableTween3 instead.
     * This function is misleading since one could think that the tween starts
     * right at the moment this function is called whereas the value of the variable
     * will change at the next frame only. Moreover, the variable will not start from
     * the start value exactly since time will have passed at the moment the next
     * frame is rendered.
     * See https://github.com/4ian/GDevelop/issues/4270
     * @param identifier Unique id to identify the tween
     * @param variable The object variable to store the tweened value
     * @param fromValue Start value
     * @param toValue End value
     * @param easing Easing function identifier
     * @param duration Duration in milliseconds
     * @param destroyObjectWhenFinished Destroy this object when the tween ends
     */
    addVariableTween(
      identifier: string,
      variable: gdjs.Variable,
      fromValue: float,
      toValue: float,
      easing: string,
      duration: float,
      destroyObjectWhenFinished: boolean
    ) {
      this._tweens.addSimpleTween(
        identifier,
        this.owner.getRuntimeScene(),
        duration / 1000,
        easing,
        linearInterpolation,
        fromValue,
        toValue,
        getTweenVariableSetter(variable),
        {
          type: 'variable',
          variable,
          destroyObjectWhenFinished,
        },
        destroyObjectWhenFinished ? () => this._deleteFromScene() : null
      );
    }

    /**
     * Tween an object variable.
     * @deprecated Use addVariableTween3 instead.
     * @param identifier Unique id to identify the tween
     * @param variable The object variable to store the tweened value
     * @param toValue End value
     * @param easing Easing function identifier
     * @param duration Duration in milliseconds
     * @param destroyObjectWhenFinished Destroy this object when the tween ends
     */
    addVariableTween2(
      identifier: string,
      variable: gdjs.Variable,
      toValue: float,
      easing: string,
      duration: float,
      destroyObjectWhenFinished: boolean
    ) {
      this._addVariableTween(
        identifier,
        variable,
        toValue,
        easing,
        duration / 1000,
        destroyObjectWhenFinished,
        this.owner.getRuntimeScene()
      );
    }

    /**
     * Tween an object variable.
     * @param identifier Unique id to identify the tween
     * @param variable The object variable to store the tweened value
     * @param toValue End value
     * @param easing Easing function identifier
     * @param duration Duration in seconds
     * @param destroyObjectWhenFinished Destroy this object when the tween ends
     */
    addVariableTween3(
      identifier: string,
      variable: gdjs.Variable,
      toValue: float,
      easing: string,
      duration: float,
      destroyObjectWhenFinished: boolean
    ) {
      this._addVariableTween(
        identifier,
        variable,
        toValue,
        easing,
        duration,
        destroyObjectWhenFinished,
        this.owner
      );
    }

    private _addVariableTween(
      identifier: string,
      variable: gdjs.Variable,
      toValue: float,
      easing: string,
      duration: float,
      destroyObjectWhenFinished: boolean,
      timeSource: gdjs.evtTools.tween.TimeSource
    ) {
      if (variable.getType() !== 'number') {
        return;
      }
      this._tweens.addSimpleTween(
        identifier,
        timeSource,
        duration,
        easing,
        linearInterpolation,
        variable.getValue() as number,
        toValue,
        getTweenVariableSetter(variable),
        {
          type: 'variable',
          variable,
          destroyObjectWhenFinished,
        },
        destroyObjectWhenFinished ? () => this._deleteFromScene() : null
      );
    }

    /**
     * Add an object value tween.
     * @param identifier Unique id to identify the tween
     * @param fromValue Start value
     * @param toValue End value
     * @param easing Easing function identifier
     * @param duration Duration in seconds
     * @param useExponentialInterpolation Set it to true to use a exponential
     * It's useful for values that are factors like a scale or a zoom.
     * @param destroyObjectWhenFinished Destroy this object when the tween ends
     */
    addValueTween(
      identifier: string,
      fromValue: float,
      toValue: float,
      easing: string,
      duration: float,
      useExponentialInterpolation: boolean,
      destroyObjectWhenFinished: boolean
    ) {
      this._tweens.addSimpleTween(
        identifier,
        this.owner,
        duration,
        easing,
        useExponentialInterpolation
          ? exponentialInterpolation
          : linearInterpolation,
        fromValue,
        toValue,
        tweenObjectValueSetter,
        {
          type: 'objectValue',
          destroyObjectWhenFinished,
        },
        destroyObjectWhenFinished ? () => this._deleteFromScene() : null
      );
    }

    /**
     * Tween an object position.
     * @deprecated Use addObjectPositionTween2 instead.
     * @param identifier Unique id to identify the tween
     * @param toX The target X position
     * @param toY The target Y position
     * @param easing Easing function identifier
     * @param duration Duration in milliseconds
     * @param destroyObjectWhenFinished Destroy this object when the tween ends
     */
    addObjectPositionTween(
      identifier: string,
      toX: number,
      toY: number,
      easing: string,
      duration: float,
      destroyObjectWhenFinished: boolean
    ) {
      this._addObjectPositionTween(
        identifier,
        toX,
        toY,
        easing,
        duration / 1000,
        destroyObjectWhenFinished,
        this.owner.getRuntimeScene()
      );
    }

    /**
     * Tween an object position.
     * @param identifier Unique id to identify the tween
     * @param toX The target X position
     * @param toY The target Y position
     * @param easing Easing function identifier
     * @param duration Duration in seconds
     * @param destroyObjectWhenFinished Destroy this object when the tween ends
     */
    addObjectPositionTween2(
      identifier: string,
      toX: number,
      toY: number,
      easing: string,
      duration: float,
      destroyObjectWhenFinished: boolean
    ) {
      this._addObjectPositionTween(
        identifier,
        toX,
        toY,
        easing,
        duration,
        destroyObjectWhenFinished,
        this.owner
      );
    }

    private _addObjectPositionTween(
      identifier: string,
      toX: number,
      toY: number,
      easing: string,
      duration: float,
      destroyObjectWhenFinished: boolean,
      timeSource: gdjs.evtTools.tween.TimeSource
    ) {
      this._tweens.addMultiTween(
        identifier,
        timeSource,
        duration,
        easing,
        linearInterpolation,
        [this.owner.getX(), this.owner.getY()],
        [toX, toY],
        getTweenObjectPositionSetter(this.owner),
        {
          type: 'position',
          destroyObjectWhenFinished,
        },
        destroyObjectWhenFinished ? () => this._deleteFromScene() : null
      );
    }

    /**
     * Tween an object X position.
     * @deprecated Use addObjectPositionXTween2 instead.
     * @param identifier Unique id to identify the tween
     * @param toX The target X position
     * @param easing Easing function identifier
     * @param duration Duration in milliseconds
     * @param destroyObjectWhenFinished Destroy this object when the tween ends
     */
    addObjectPositionXTween(
      identifier: string,
      toX: number,
      easing: string,
      duration: float,
      destroyObjectWhenFinished: boolean
    ) {
      this._addObjectPositionXTween(
        identifier,
        toX,
        easing,
        duration / 1000,
        destroyObjectWhenFinished,
        this.owner.getRuntimeScene()
      );
    }

    /**
     * Tween an object X position.
     * @param identifier Unique id to identify the tween
     * @param toX The target X position
     * @param easing Easing function identifier
     * @param duration Duration in seconds
     * @param destroyObjectWhenFinished Destroy this object when the tween ends
     */
    addObjectPositionXTween2(
      identifier: string,
      toX: number,
      easing: string,
      duration: float,
      destroyObjectWhenFinished: boolean
    ) {
      this._addObjectPositionXTween(
        identifier,
        toX,
        easing,
        duration,
        destroyObjectWhenFinished,
        this.owner
      );
    }

    private _addObjectPositionXTween(
      identifier: string,
      toX: number,
      easing: string,
      duration: float,
      destroyObjectWhenFinished: boolean,
      timeSource: gdjs.evtTools.tween.TimeSource
    ) {
      this._tweens.addSimpleTween(
        identifier,
        timeSource,
        duration,
        easing,
        linearInterpolation,
        this.owner.getX(),
        toX,
        getTweenObjectPositionXSetter(this.owner),
        {
          type: 'positionX',
          destroyObjectWhenFinished,
        },
        destroyObjectWhenFinished ? () => this._deleteFromScene() : null
      );
    }

    /**
     * Tween an object Y position.
     * @deprecated Use addObjectPositionYTween2 instead.
     * @param identifier Unique id to identify the tween
     * @param toY The target Y position
     * @param easing Easing function identifier
     * @param duration Duration in milliseconds
     * @param destroyObjectWhenFinished Destroy this object when the tween ends
     */
    addObjectPositionYTween(
      identifier: string,
      toY: number,
      easing: string,
      duration: float,
      destroyObjectWhenFinished: boolean
    ) {
      this._addObjectPositionYTween(
        identifier,
        toY,
        easing,
        duration / 1000,
        destroyObjectWhenFinished,
        this.owner.getRuntimeScene()
      );
    }

    /**
     * Tween an object Y position.
     * @param identifier Unique id to identify the tween
     * @param toY The target Y position
     * @param easing Easing function identifier
     * @param duration Duration in seconds
     * @param destroyObjectWhenFinished Destroy this object when the tween ends
     */
    addObjectPositionYTween2(
      identifier: string,
      toY: number,
      easing: string,
      duration: float,
      destroyObjectWhenFinished: boolean
    ) {
      this._addObjectPositionYTween(
        identifier,
        toY,
        easing,
        duration,
        destroyObjectWhenFinished,
        this.owner
      );
    }

    private _addObjectPositionYTween(
      identifier: string,
      toY: number,
      easing: string,
      duration: float,
      destroyObjectWhenFinished: boolean,
      timeSource: gdjs.evtTools.tween.TimeSource
    ) {
      this._tweens.addSimpleTween(
        identifier,
        timeSource,
        duration,
        easing,
        linearInterpolation,
        this.owner.getY(),
        toY,
        getTweenObjectPositionYSetter(this.owner),
        {
          type: 'positionY',
          destroyObjectWhenFinished,
        },
        destroyObjectWhenFinished ? () => this._deleteFromScene() : null
      );
    }

    /**
     * Tween an object Z position.
     * @deprecated Use addObjectPositionZTween2 instead.
     * @param identifier Unique id to identify the tween
     * @param toZ The target Z position
     * @param easing Easing function identifier
     * @param duration Duration in milliseconds
     * @param destroyObjectWhenFinished Destroy this object when the tween ends
     */
    addObjectPositionZTween(
      identifier: string,
      toZ: number,
      easing: string,
      duration: float,
      destroyObjectWhenFinished: boolean
    ) {
      this._addObjectPositionZTween(
        identifier,
        toZ,
        easing,
        duration / 1000,
        destroyObjectWhenFinished,
        this.owner.getRuntimeScene()
      );
    }

    /**
     * Tween an object Z position.
     * @param object3DBehavior Only used by events can be set to null
     * @param identifier Unique id to identify the tween
     * @param toZ The target Z position
     * @param easing Easing function identifier
     * @param duration Duration in seconds
     * @param destroyObjectWhenFinished Destroy this object when the tween ends
     */
    addObjectPositionZTween2(
      object3DBehavior: any,
      identifier: string,
      toZ: number,
      easing: string,
      duration: float,
      destroyObjectWhenFinished: boolean
    ) {
      this._addObjectPositionZTween(
        identifier,
        toZ,
        easing,
        duration,
        destroyObjectWhenFinished,
        this.owner
      );
    }

    private _addObjectPositionZTween(
      identifier: string,
      toZ: number,
      easing: string,
      duration: float,
      destroyObjectWhenFinished: boolean,
      timeSource: gdjs.evtTools.tween.TimeSource
    ) {
      const { owner } = this;
      if (!is3D(owner)) return;

      this._tweens.addSimpleTween(
        identifier,
        timeSource,
        duration,
        easing,
        linearInterpolation,
        owner.getZ(),
        toZ,
        getTweenObjectPositionZSetter(owner),
        {
          type: 'positionZ',
          destroyObjectWhenFinished,
        },
        destroyObjectWhenFinished ? () => this._deleteFromScene() : null
      );
    }

    /**
     * Tween an object angle.
     * @deprecated Use addObjectAngleTween2 instead.
     * @param identifier Unique id to identify the tween
     * @param toAngle The target angle
     * @param easing Easing function identifier
     * @param duration Duration in milliseconds
     * @param destroyObjectWhenFinished Destroy this object when the tween ends
     */
    addObjectAngleTween(
      identifier: string,
      toAngle: float,
      easing: string,
      duration: float,
      destroyObjectWhenFinished: boolean
    ) {
      this._addObjectAngleTween(
        identifier,
        toAngle,
        easing,
        duration / 1000,
        destroyObjectWhenFinished,
        this.owner.getRuntimeScene()
      );
    }

    /**
     * Tween an object angle.
     * @param identifier Unique id to identify the tween
     * @param toAngle The target angle
     * @param easing Easing function identifier
     * @param duration Duration in seconds
     * @param destroyObjectWhenFinished Destroy this object when the tween ends
     */
    addObjectAngleTween2(
      identifier: string,
      toAngle: float,
      easing: string,
      duration: float,
      destroyObjectWhenFinished: boolean
    ) {
      this._addObjectAngleTween(
        identifier,
        toAngle,
        easing,
        duration,
        destroyObjectWhenFinished,
        this.owner
      );
    }

    private _addObjectAngleTween(
      identifier: string,
      toAngle: float,
      easing: string,
      duration: float,
      destroyObjectWhenFinished: boolean,
      timeSource: gdjs.evtTools.tween.TimeSource
    ) {
      this._tweens.addSimpleTween(
        identifier,
        timeSource,
        duration,
        easing,
        linearInterpolation,
        this.owner.getAngle(),
        toAngle,
        getTweenObjectAngleSetter(this.owner),
        {
          type: 'angle',
          destroyObjectWhenFinished,
        },
        destroyObjectWhenFinished ? () => this._deleteFromScene() : null
      );
    }

    /**
     * Tween a 3D object rotation X.
     * @param object3DBehavior Only used by events can be set to null
     * @param identifier Unique id to identify the tween
     * @param toAngle The target angle
     * @param easing Easing function identifier
     * @param duration Duration in seconds
     * @param destroyObjectWhenFinished Destroy this object when the tween ends
     */
    addObjectRotationXTween(
      object3DBehavior: any,
      identifier: string,
      toAngle: float,
      easing: string,
      duration: float,
      destroyObjectWhenFinished: boolean
    ) {
      const { owner } = this;
      if (!is3D(owner)) return;

      this._tweens.addSimpleTween(
        identifier,
        this.owner,
        duration,
        easing,
        linearInterpolation,
        owner.getRotationX(),
        toAngle,
        getTweenObjectRotationXSetter(owner),
        {
          type: 'rotationX',
          destroyObjectWhenFinished,
        },
        destroyObjectWhenFinished ? () => this._deleteFromScene() : null
      );
    }

    /**
     * Tween a 3D object rotation Y.
     * @param object3DBehavior Only used by events can be set to null
     * @param identifier Unique id to identify the tween
     * @param toAngle The target angle
     * @param easing Easing function identifier
     * @param duration Duration in seconds
     * @param destroyObjectWhenFinished Destroy this object when the tween ends
     */
    addObjectRotationYTween(
      object3DBehavior: any,
      identifier: string,
      toAngle: float,
      easing: string,
      duration: float,
      destroyObjectWhenFinished: boolean
    ) {
      const { owner } = this;
      if (!is3D(owner)) return;

      this._tweens.addSimpleTween(
        identifier,
        this.owner,
        duration,
        easing,
        linearInterpolation,
        owner.getRotationY(),
        toAngle,
        getTweenObjectRotationYSetter(owner),
        {
          type: 'rotationY',
          destroyObjectWhenFinished,
        },
        destroyObjectWhenFinished ? () => this._deleteFromScene() : null
      );
    }

    /**
     * Tween an object scale.
     * @deprecated Use addObjectScaleTween2 instead.
     * @param identifier Unique id to identify the tween
     * @param toScaleX The target X-scale
     * @param toScaleY The target Y-scale
     * @param easing Easing function identifier
     * @param duration Duration in milliseconds
     * @param destroyObjectWhenFinished Destroy this object when the tween ends
     * @param scaleFromCenterOfObject Scale the transform from the center of the object (or point that is called center), not the top-left origin
     */
    addObjectScaleTween(
      identifier: string,
      toScaleX: number,
      toScaleY: number,
      easing: string,
      duration: float,
      destroyObjectWhenFinished: boolean,
      scaleFromCenterOfObject: boolean
    ) {
      this._addObjectScaleTween(
        identifier,
        toScaleX,
        toScaleY,
        easing,
        duration / 1000,
        destroyObjectWhenFinished,
        scaleFromCenterOfObject,
        this.owner.getRuntimeScene(),
        linearInterpolation
      );
    }

    /**
     * Tween an object scale.
     * @deprecated Use addObjectScaleXTween2 and addObjectScaleYTween2 instead.
     * @param identifier Unique id to identify the tween
     * @param toScaleX The target X-scale
     * @param toScaleY The target Y-scale
     * @param easing Easing function identifier
     * @param duration Duration in milliseconds
     * @param destroyObjectWhenFinished Destroy this object when the tween ends
     * @param scaleFromCenterOfObject Scale the transform from the center of the object (or point that is called center), not the top-left origin
     */
    addObjectScaleTween2(
      identifier: string,
      toScaleX: number,
      toScaleY: number,
      easing: string,
      duration: float,
      destroyObjectWhenFinished: boolean,
      scaleFromCenterOfObject: boolean
    ) {
      this._addObjectScaleTween(
        identifier,
        toScaleX,
        toScaleY,
        easing,
        duration,
        destroyObjectWhenFinished,
        scaleFromCenterOfObject,
        this.owner,
        exponentialInterpolation
      );
    }

    private _addObjectScaleTween(
      identifier: string,
      toScaleX: number,
      toScaleY: number,
      easing: string,
      duration: float,
      destroyObjectWhenFinished: boolean,
      scaleFromCenterOfObject: boolean,
      timeSource: gdjs.evtTools.tween.TimeSource,
      interpolation: gdjs.evtTools.tween.Interpolation
    ) {
      const owner = this.owner;
      if (!isScalable(owner)) return;

      if (toScaleX < 0) toScaleX = 0;
      if (toScaleY < 0) toScaleY = 0;

      this._tweens.addMultiTween(
        identifier,
        timeSource,
        duration,
        easing,
        interpolation,
        [owner.getScaleX(), owner.getScaleY()],
        [toScaleX, toScaleY],
        getTweenObjectScaleXYSetter(owner, scaleFromCenterOfObject),
        {
          type: 'scaleXY',
          destroyObjectWhenFinished,
        },
        destroyObjectWhenFinished ? () => this._deleteFromScene() : null
      );
    }

    /**
     * Tween an object scale.
     * @param identifier Unique id to identify the tween
     * @param toScale The target scale
     * @param easing Easing function identifier
     * @param duration Duration in seconds
     * @param destroyObjectWhenFinished Destroy this object when the tween ends
     * @param scaleFromCenterOfObject Scale the transform from the center of the object (or point that is called center), not the top-left origin
     */
    addObjectScaleTween3(
      identifier: string,
      toScale: number,
      easing: string,
      duration: float,
      destroyObjectWhenFinished: boolean,
      scaleFromCenterOfObject: boolean
    ) {
      this._addObjectScaleXTween(
        identifier,
        toScale,
        easing,
        duration,
        destroyObjectWhenFinished,
        scaleFromCenterOfObject,
        this.owner,
        exponentialInterpolation
      );
      const owner = this.owner;
      if (!isScalable(owner)) return;

      // This action doesn't require 3D capabilities.
      // So, gdjs.RuntimeObject3D may not exist
      // when the 3D extension is not used.
      const owner3d = is3D(owner) ? owner : null;

      this._tweens.addSimpleTween(
        identifier,
        this.owner,
        duration,
        easing,
        exponentialInterpolation,
        owner.getScale(),
        toScale,
        getTweenObjectScaleSetter(owner, owner3d, scaleFromCenterOfObject),
        {
          type: 'scale',
          scaleFromCenterOfObject,
          destroyObjectWhenFinished,
        },
        destroyObjectWhenFinished ? () => this._deleteFromScene() : null
      );
    }

    /**
     * Tween an object X-scale.
     * @deprecated Use addObjectScaleXTween2 instead.
     * @param identifier Unique id to identify the tween
     * @param toScaleX The target X-scale
     * @param easing Easing function identifier
     * @param duration Duration in milliseconds
     * @param destroyObjectWhenFinished Destroy this object when the tween ends
     * @param scaleFromCenterOfObject Scale the transform from the center of the object (or point that is called center), not the top-left origin
     */
    addObjectScaleXTween(
      identifier: string,
      toScaleX: number,
      easing: string,
      duration: float,
      destroyObjectWhenFinished: boolean,
      scaleFromCenterOfObject: boolean
    ) {
      this._addObjectScaleXTween(
        identifier,
        toScaleX,
        easing,
        duration / 1000,
        destroyObjectWhenFinished,
        scaleFromCenterOfObject,
        this.owner.getRuntimeScene(),
        linearInterpolation
      );
    }

    /**
     * Tween an object X-scale.
     * @param identifier Unique id to identify the tween
     * @param toScaleX The target X-scale
     * @param easing Easing function identifier
     * @param duration Duration in seconds
     * @param destroyObjectWhenFinished Destroy this object when the tween ends
     * @param scaleFromCenterOfObject Scale the transform from the center of the object (or point that is called center), not the top-left origin
     */
    addObjectScaleXTween2(
      identifier: string,
      toScaleX: number,
      easing: string,
      duration: float,
      destroyObjectWhenFinished: boolean,
      scaleFromCenterOfObject: boolean
    ) {
      this._addObjectScaleXTween(
        identifier,
        toScaleX,
        easing,
        duration,
        destroyObjectWhenFinished,
        scaleFromCenterOfObject,
        this.owner,
        exponentialInterpolation
      );
    }

    private _addObjectScaleXTween(
      identifier: string,
      toScaleX: number,
      easing: string,
      duration: float,
      destroyObjectWhenFinished: boolean,
      scaleFromCenterOfObject: boolean,
      timeSource: gdjs.evtTools.tween.TimeSource,
      interpolation: gdjs.evtTools.tween.Interpolation
    ) {
      const owner = this.owner;
      if (!isScalable(owner)) return;

      this._tweens.addSimpleTween(
        identifier,
        timeSource,
        duration,
        easing,
        interpolation,
        owner.getScaleX(),
        toScaleX,
        getTweenObjectScaleXSetter(owner, scaleFromCenterOfObject),
        {
          type: 'scaleX',
          scaleFromCenterOfObject,
          destroyObjectWhenFinished,
        },
        destroyObjectWhenFinished ? () => this._deleteFromScene() : null
      );
    }

    /**
     * Tween an object Y-scale.
     * @deprecated Use addObjectScaleYTween2 instead.
     * @param identifier Unique id to identify the tween
     * @param toScaleY The target Y-scale
     * @param easing Easing function identifier
     * @param duration Duration in milliseconds
     * @param destroyObjectWhenFinished Destroy this object when the tween ends
     * @param scaleFromCenterOfObject Scale the transform from the center of the object (or point that is called center), not the top-left origin
     */
    addObjectScaleYTween(
      identifier: string,
      toScaleY: number,
      easing: string,
      duration: float,
      destroyObjectWhenFinished: boolean,
      scaleFromCenterOfObject: boolean
    ) {
      this._addObjectScaleYTween(
        identifier,
        toScaleY,
        easing,
        duration / 1000,
        destroyObjectWhenFinished,
        scaleFromCenterOfObject,
        this.owner.getRuntimeScene(),
        linearInterpolation
      );
    }

    /**
     * Tween an object Y-scale.
     * @param identifier Unique id to identify the tween
     * @param toScaleY The target Y-scale
     * @param easing Easing function identifier
     * @param duration Duration in seconds
     * @param destroyObjectWhenFinished Destroy this object when the tween ends
     * @param scaleFromCenterOfObject Scale the transform from the center of the object (or point that is called center), not the top-left origin
     */
    addObjectScaleYTween2(
      identifier: string,
      toScaleY: number,
      easing: string,
      duration: float,
      destroyObjectWhenFinished: boolean,
      scaleFromCenterOfObject: boolean
    ) {
      this._addObjectScaleYTween(
        identifier,
        toScaleY,
        easing,
        duration,
        destroyObjectWhenFinished,
        scaleFromCenterOfObject,
        this.owner,
        exponentialInterpolation
      );
    }

    private _addObjectScaleYTween(
      identifier: string,
      toScaleY: number,
      easing: string,
      duration: float,
      destroyObjectWhenFinished: boolean,
      scaleFromCenterOfObject: boolean,
      timeSource: gdjs.evtTools.tween.TimeSource,
      interpolation: gdjs.evtTools.tween.Interpolation
    ) {
      const owner = this.owner;
      if (!isScalable(owner)) return;

      this._tweens.addSimpleTween(
        identifier,
        timeSource,
        duration,
        easing,
        interpolation,
        owner.getScaleY(),
        toScaleY,
        getTweenObjectScaleYSetter(owner, scaleFromCenterOfObject),
        {
          type: 'scaleY',
          scaleFromCenterOfObject,
          destroyObjectWhenFinished,
        },
        destroyObjectWhenFinished ? () => this._deleteFromScene() : null
      );
    }

    /**
     * Tween an object opacity.
     * @deprecated Use addObjectOpacityTween2 instead.
     * @param identifier Unique id to identify the tween
     * @param toOpacity The target opacity
     * @param easing Easing function identifier
     * @param duration Duration in milliseconds
     * @param destroyObjectWhenFinished Destroy this object when the tween ends
     */
    addObjectOpacityTween(
      identifier: string,
      toOpacity: float,
      easing: string,
      duration: float,
      destroyObjectWhenFinished: boolean
    ) {
      this._addObjectOpacityTween(
        identifier,
        toOpacity,
        easing,
        duration / 1000,
        destroyObjectWhenFinished,
        this.owner.getRuntimeScene()
      );
    }

    /**
     * Tween an object opacity.
     * @param identifier Unique id to identify the tween
     * @param toOpacity The target opacity
     * @param easing Easing function identifier
     * @param duration Duration in second
     * @param destroyObjectWhenFinished Destroy this object when the tween ends
     */
    addObjectOpacityTween2(
      identifier: string,
      toOpacity: float,
      easing: string,
      duration: float,
      destroyObjectWhenFinished: boolean
    ) {
      this._addObjectOpacityTween(
        identifier,
        toOpacity,
        easing,
        duration,
        destroyObjectWhenFinished,
        this.owner
      );
    }

    private _addObjectOpacityTween(
      identifier: string,
      toOpacity: float,
      easing: string,
      duration: float,
      destroyObjectWhenFinished: boolean,
      timeSource: gdjs.evtTools.tween.TimeSource
    ) {
      const owner = this.owner;
      if (!isOpaque(owner)) return;

      this._tweens.addSimpleTween(
        identifier,
        timeSource,
        duration,
        easing,
        linearInterpolation,
        owner.getOpacity(),
        toOpacity,
        getTweenObjectOpacitySetter(owner),
        {
          type: 'opacity',
          destroyObjectWhenFinished,
        },
        destroyObjectWhenFinished ? () => this._deleteFromScene() : null
      );
    }

    /**
     * Tween a numeric object effect property.
     * @param effectBehavior Only used by events can be set to null
     * @param identifier Unique id to identify the tween
     * @param toValue The targeted value
     * @param effectName Effect name
     * @param propertyName Property name
     * @param easing Easing function identifier
     * @param duration Duration in seconds
     * @param destroyObjectWhenFinished Destroy this object when the tween ends
     */
    addNumberEffectPropertyTween(
      effectBehavior: any,
      identifier: string,
      toValue: float,
      effectName: string,
      propertyName: string,
      easing: string,
      duration: float,
      destroyObjectWhenFinished: boolean
    ) {
      const effect = this.owner.getRendererEffects()[effectName];
      if (!effect) {
        logger.error(
          `The object "${this.owner.name}" doesn't have any effect called "${effectName}"`
        );
      }
      this._tweens.addSimpleTween(
        identifier,
        this.owner,
        duration,
        easing,
        linearInterpolation,
        effect ? effect.getDoubleParameter(propertyName) : 0,
        toValue,
        getTweenObjectNumberEffectPropertySetter(effect, propertyName),
        {
          type: 'numberEffectProperty',
          effectName,
          propertyName,
          destroyObjectWhenFinished,
        },
        destroyObjectWhenFinished ? () => this._deleteFromScene() : null
      );
    }

    /**
     * Tween a color object effect property.
     * @param effectBehavior Only used by events can be set to null
     * @param identifier Unique id to identify the tween
     * @param toColorStr The target RGB color (format "128;200;255" with values between 0 and 255 for red, green and blue)
     * @param effectName Effect name
     * @param propertyName Property name
     * @param easing Easing function identifier
     * @param duration Duration in seconds
     * @param destroyObjectWhenFinished Destroy this object when the tween ends
     */
    addColorEffectPropertyTween(
      effectBehavior: any,
      identifier: string,
      toColorStr: string,
      effectName: string,
      propertyName: string,
      easing: string,
      duration: float,
      destroyObjectWhenFinished: boolean
    ) {
      const effect = this.owner.getRendererEffects()[effectName];
      if (!effect) {
        logger.error(
          `The object "${this.owner.name}" doesn't have any effect called "${effectName}"`
        );
      }
      const rgbFromColor = gdjs.hexNumberToRGB(
        effect ? effect.getColorParameter(propertyName) : 0
      );
      const rgbToColor: float[] = gdjs.rgbOrHexToRGBColor(toColorStr);

      this._tweens.addMultiTween(
        identifier,
        this.owner,
        duration,
        easing,
        linearInterpolation,
        gdjs.evtTools.tween.rgbToHsl(
          rgbFromColor.r,
          rgbFromColor.g,
          rgbFromColor.b
        ),
        gdjs.evtTools.tween.rgbToHsl(
          rgbToColor[0],
          rgbToColor[1],
          rgbToColor[2]
        ),
        getTweenObjectColorEffectPropertySetter(effect, propertyName),
        {
          type: 'colorEffectProperty',
          effectName,
          propertyName,
          destroyObjectWhenFinished,
        },
        destroyObjectWhenFinished ? () => this._deleteFromScene() : null
      );
    }

    /**
     * Tween an object color.
     * @deprecated Use addObjectColorTween2 instead.
     * @param identifier Unique id to identify the tween
     * @param toColorStr The target RGB color (format "128;200;255" with values between 0 and 255 for red, green and blue)
     * @param easing Easing function identifier
     * @param duration Duration in milliseconds
     * @param destroyObjectWhenFinished Destroy this object when the tween ends
     * @param useHSLColorTransition Tween using HSL color mappings, rather than direct RGB line
     */
    addObjectColorTween(
      identifier: string,
      toColorStr: string,
      easing: string,
      duration: float,
      destroyObjectWhenFinished: boolean,
      useHSLColorTransition: boolean
    ) {
      this._addObjectColorTween(
        identifier,
        toColorStr,
        easing,
        duration / 1000,
        destroyObjectWhenFinished,
        useHSLColorTransition,
        this.owner.getRuntimeScene()
      );
    }

    /**
     * Tween an object color.
     * @param identifier Unique id to identify the tween
     * @param toColorStr The target RGB color (format "128;200;255" with values between 0 and 255 for red, green and blue)
     * @param easing Easing function identifier
     * @param duration Duration in milliseconds
     * @param destroyObjectWhenFinished Destroy this object when the tween ends
     * @param useHSLColorTransition Tween using HSL color mappings, rather than direct RGB line
     */
    addObjectColorTween2(
      identifier: string,
      toColorStr: string,
      easing: string,
      duration: float,
      destroyObjectWhenFinished: boolean,
      useHSLColorTransition: boolean = true
    ) {
      this._addObjectColorTween(
        identifier,
        toColorStr,
        easing,
        duration,
        destroyObjectWhenFinished,
        useHSLColorTransition,
        this.owner
      );
    }

    private _addObjectColorTween(
      identifier: string,
      toColorStr: string,
      easing: string,
      duration: float,
      destroyObjectWhenFinished: boolean,
      useHSLColorTransition: boolean,
      timeSource: gdjs.evtTools.tween.TimeSource
    ) {
      const owner = this.owner;
      if (!isColorable(owner)) {
        return;
      }

      const rgbFromColor: float[] = gdjs.rgbOrHexToRGBColor(owner.getColor());
      const rgbToColor: float[] = gdjs.rgbOrHexToRGBColor(toColorStr);

      const initialValue = useHSLColorTransition
        ? gdjs.evtTools.tween.rgbToHsl(
            rgbFromColor[0],
            rgbFromColor[1],
            rgbFromColor[2]
          )
        : rgbFromColor;
      const targetedValue = useHSLColorTransition
        ? gdjs.evtTools.tween.rgbToHsl(
            rgbToColor[0],
            rgbToColor[1],
            rgbToColor[2]
          )
        : rgbToColor;

      this._tweens.addMultiTween(
        identifier,
        timeSource,
        duration,
        easing,
        linearInterpolation,
        initialValue,
        targetedValue,
        getTweenObjectColorSetter(owner, useHSLColorTransition),
        {
          type: 'objectColor',
          useHSLColorTransition,
          destroyObjectWhenFinished,
        },
        destroyObjectWhenFinished ? () => this._deleteFromScene() : null
      );
    }

    /**
     * Tween an object HSL color, with the "to" color given using HSL (H: any number, S and L: 0-100).
     * @deprecated Use addObjectColorHSLTween2 instead.
     * @param identifier Unique id to identify the tween
     * @param toHue The target hue, or the same as the from color's hue if blank
     * @param animateHue include hue in calculations, as can't set this to -1 as default to ignore
     * @param toSaturation The target saturation, or the same as the from color's saturation if blank
     * @param toLightness The target lightness, or the same as the from color's lightness if blank
     * @param easing Easing function identifier
     * @param duration Duration in milliseconds
     * @param destroyObjectWhenFinished Destroy this object when the tween ends
     */
    addObjectColorHSLTween(
      identifier: string,
      toHue: number,
      animateHue: boolean,
      toSaturation: number,
      toLightness: number,
      easing: string,
      duration: float,
      destroyObjectWhenFinished: boolean
    ) {
      this._addObjectColorHSLTween(
        identifier,
        toHue,
        animateHue,
        toSaturation,
        toLightness,
        easing,
        duration / 1000,
        destroyObjectWhenFinished,
        this.owner.getRuntimeScene()
      );
    }

    /**
     * Tween an object HSL color, with the "to" color given using HSL (H: any number, S and L: 0-100).
     * @param identifier Unique id to identify the tween
     * @param toHue The target hue, or the same as the from color's hue if blank
     * @param animateHue include hue in calculations, as can't set this to -1 as default to ignore
     * @param toSaturation The target saturation, or the same as the from color's saturation if blank
     * @param toLightness The target lightness, or the same as the from color's lightness if blank
     * @param easing Easing function identifier
     * @param duration Duration in seconds
     * @param destroyObjectWhenFinished Destroy this object when the tween ends
     */
    addObjectColorHSLTween2(
      identifier: string,
      toHue: number,
      animateHue: boolean,
      toSaturation: number,
      toLightness: number,
      easing: string,
      duration: float,
      destroyObjectWhenFinished: boolean
    ) {
      this._addObjectColorHSLTween(
        identifier,
        toHue,
        animateHue,
        toSaturation,
        toLightness,
        easing,
        duration,
        destroyObjectWhenFinished,
        this.owner
      );
    }

    private _addObjectColorHSLTween(
      identifier: string,
      toHue: number,
      animateHue: boolean,
      toSaturation: number,
      toLightness: number,
      easing: string,
      duration: float,
      destroyObjectWhenFinished: boolean,
      timeSource: gdjs.evtTools.tween.TimeSource
    ) {
      if (!isColorable(this.owner)) return;
      const owner = this.owner;

      const rgbFromColor = gdjs.rgbOrHexToRGBColor(owner.getColor());
      const hslFromColor = gdjs.evtTools.tween.rgbToHsl(
        rgbFromColor[0],
        rgbFromColor[1],
        rgbFromColor[2]
      );

      const toH = animateHue ? toHue : hslFromColor[0];
      const toS =
        -1 === toSaturation
          ? hslFromColor[1]
          : Math.min(Math.max(toSaturation, 0), 100);
      const toL =
        -1 === toLightness
          ? hslFromColor[2]
          : Math.min(Math.max(toLightness, 0), 100);

      this._tweens.addMultiTween(
        identifier,
        timeSource,
        duration,
        easing,
        linearInterpolation,
        hslFromColor,
        [toH, toS, toL],
        getTweenObjectColorHSLSetter(owner),
        {
          type: 'objectColorHSL',
          destroyObjectWhenFinished,
        },
        destroyObjectWhenFinished ? () => this._deleteFromScene() : null
      );
    }

    /**
     * Tween a text object character size.
     * @deprecated Use addTextObjectCharacterSizeTween2 instead.
     * @param identifier Unique id to identify the tween
     * @param toSize The target character size
     * @param easing Easing function identifier
     * @param duration Duration in milliseconds
     * @param destroyObjectWhenFinished Destroy this object when the tween ends
     */
    addTextObjectCharacterSizeTween(
      identifier: string,
      toSize: number,
      easing: string,
      duration: float,
      destroyObjectWhenFinished: boolean
    ) {
      this._addTextObjectCharacterSizeTween(
        identifier,
        toSize,
        easing,
        duration / 1000,
        destroyObjectWhenFinished,
        this.owner.getRuntimeScene(),
        linearInterpolation
      );
    }

    /**
     * Tween a text object character size.
     * @param identifier Unique id to identify the tween
     * @param toSize The target character size
     * @param easing Easing function identifier
     * @param duration Duration in seconds
     * @param destroyObjectWhenFinished Destroy this object when the tween ends
     */
    addTextObjectCharacterSizeTween2(
      identifier: string,
      toSize: number,
      easing: string,
      duration: float,
      destroyObjectWhenFinished: boolean
    ) {
      this._addTextObjectCharacterSizeTween(
        identifier,
        toSize,
        easing,
        duration,
        destroyObjectWhenFinished,
        this.owner,
        exponentialInterpolation
      );
    }

    private _addTextObjectCharacterSizeTween(
      identifier: string,
      toSize: number,
      easing: string,
      duration: float,
      destroyObjectWhenFinished: boolean,
      timeSource: gdjs.evtTools.tween.TimeSource,
      interpolation: gdjs.evtTools.tween.Interpolation
    ) {
      const owner = this.owner;
      if (!isCharacterScalable(owner)) return;

      this._tweens.addSimpleTween(
        identifier,
        timeSource,
        duration,
        easing,
        interpolation,
        owner.getCharacterSize(),
        toSize,
        getTweenObjectCharacterSizeSetter(owner),
        {
          type: 'characterSize',
          destroyObjectWhenFinished,
        },
        destroyObjectWhenFinished ? () => this._deleteFromScene() : null
      );
    }

    /**
     * Tween an object width.
     * @deprecated Use addObjectWidthTween2 instead.
     * @param identifier Unique id to identify the tween
     * @param toWidth The target width
     * @param easing Easing function identifier
     * @param duration Duration in milliseconds
     * @param destroyObjectWhenFinished Destroy this object when the tween ends
     */
    addObjectWidthTween(
      identifier: string,
      toWidth: float,
      easing: string,
      duration: float,
      destroyObjectWhenFinished: boolean
    ) {
      this._addObjectWidthTween(
        identifier,
        toWidth,
        easing,
        duration / 1000,
        destroyObjectWhenFinished,
        this.owner.getRuntimeScene()
      );
    }

    /**
     * Tween an object width.
     * @param identifier Unique id to identify the tween
     * @param toWidth The target width
     * @param easing Easing function identifier
     * @param duration Duration in seconds
     * @param destroyObjectWhenFinished Destroy this object when the tween ends
     */
    addObjectWidthTween2(
      identifier: string,
      toWidth: float,
      easing: string,
      duration: float,
      destroyObjectWhenFinished: boolean
    ) {
      this._addObjectWidthTween(
        identifier,
        toWidth,
        easing,
        duration,
        destroyObjectWhenFinished,
        this.owner
      );
    }

    private _addObjectWidthTween(
      identifier: string,
      toWidth: float,
      easing: string,
      duration: float,
      destroyObjectWhenFinished: boolean,
      timeSource: gdjs.evtTools.tween.TimeSource
    ) {
      this._tweens.addSimpleTween(
        identifier,
        timeSource,
        duration,
        easing,
        linearInterpolation,
        this.owner.getWidth(),
        toWidth,
        getTweenObjectWidthSetter(this.owner),
        {
          type: 'width',
          destroyObjectWhenFinished,
        },
        destroyObjectWhenFinished ? () => this._deleteFromScene() : null
      );
    }

    /**
     * Tween an object height.
     * @deprecated Use addObjectHeightTween2 instead.
     * @param identifier Unique id to identify the tween
     * @param toHeight The target height
     * @param easing Easing function identifier
     * @param duration Duration in milliseconds
     * @param destroyObjectWhenFinished Destroy this object when the tween ends
     */
    addObjectHeightTween(
      identifier: string,
      toHeight: float,
      easing: string,
      duration: float,
      destroyObjectWhenFinished: boolean
    ) {
      this._addObjectHeightTween(
        identifier,
        toHeight,
        easing,
        duration / 1000,
        destroyObjectWhenFinished,
        this.owner.getRuntimeScene()
      );
    }

    /**
     * Tween an object height.
     * @param identifier Unique id to identify the tween
     * @param toHeight The target height
     * @param easing Easing function identifier
     * @param duration Duration in seconds
     * @param destroyObjectWhenFinished Destroy this object when the tween ends
     */
    addObjectHeightTween2(
      identifier: string,
      toHeight: float,
      easing: string,
      duration: float,
      destroyObjectWhenFinished: boolean
    ) {
      this._addObjectHeightTween(
        identifier,
        toHeight,
        easing,
        duration,
        destroyObjectWhenFinished,
        this.owner
      );
    }

    private _addObjectHeightTween(
      identifier: string,
      toHeight: float,
      easing: string,
      duration: float,
      destroyObjectWhenFinished: boolean,
      timeSource: gdjs.evtTools.tween.TimeSource
    ) {
      this._tweens.addSimpleTween(
        identifier,
        timeSource,
        duration,
        easing,
        linearInterpolation,
        this.owner.getHeight(),
        toHeight,
        getTweenObjectHeightSetter(this.owner),
        {
          type: 'height',
          destroyObjectWhenFinished,
        },
        destroyObjectWhenFinished ? () => this._deleteFromScene() : null
      );
    }

    /**
     * Tween an object depth.
     * @deprecated Use addObjectDepthTween2 instead.
     * @param identifier Unique id to identify the tween
     * @param toDepth The target depth
     * @param easing Easing function identifier
     * @param duration Duration in milliseconds
     * @param destroyObjectWhenFinished Destroy this object when the tween ends
     */
    addObjectDepthTween(
      identifier: string,
      toDepth: float,
      easing: string,
      duration: float,
      destroyObjectWhenFinished: boolean
    ) {
      this._addObjectDepthTween(
        identifier,
        toDepth,
        easing,
        duration / 1000,
        destroyObjectWhenFinished,
        this.owner.getRuntimeScene()
      );
    }

    /**
     * Tween an object depth.
     * @param object3DBehavior Only used by events can be set to null
     * @param identifier Unique id to identify the tween
     * @param toDepth The target depth
     * @param easing Easing function identifier
     * @param duration Duration in seconds
     * @param destroyObjectWhenFinished Destroy this object when the tween ends
     */
    addObjectDepthTween2(
      object3DBehavior: any,
      identifier: string,
      toDepth: float,
      easing: string,
      duration: float,
      destroyObjectWhenFinished: boolean
    ) {
      this._addObjectDepthTween(
        identifier,
        toDepth,
        easing,
        duration,
        destroyObjectWhenFinished,
        this.owner
      );
    }

    private _addObjectDepthTween(
      identifier: string,
      toDepth: float,
      easing: string,
      duration: float,
      destroyObjectWhenFinished: boolean,
      timeSource: gdjs.evtTools.tween.TimeSource
    ) {
      const { owner } = this;
      if (!is3D(owner)) return;

      this._tweens.addSimpleTween(
        identifier,
        timeSource,
        duration,
        easing,
        linearInterpolation,
        owner.getDepth(),
        toDepth,
        getTweenObjectDepthSetter(owner),
        {
          type: 'depth',
          destroyObjectWhenFinished,
        },
        destroyObjectWhenFinished ? () => this._deleteFromScene() : null
      );
    }

    /**
     * Tween is playing.
     * @param identifier Unique id to identify the tween
     */
    isPlaying(identifier: string): boolean {
      return this._tweens.isPlaying(identifier);
    }

    /**
     * Tween exists.
     * @param identifier Unique id to identify the tween
     * @returns The tween exists
     */
    exists(identifier: string): boolean {
      return this._tweens.exists(identifier);
    }

    /**
     * Tween has finished.
     * @param identifier Unique id to identify the tween
     */
    hasFinished(identifier: string): boolean {
      return this._tweens.hasFinished(identifier);
    }

    /**
     * Pause a tween.
     * @param identifier Unique id to identify the tween
     */
    pauseTween(identifier: string) {
      if (this._isActive) {
        this._tweens.pauseTween(identifier);
      }
    }

    /**
     * Stop a tween.
     * @param identifier Unique id to identify the tween
     * @param jumpToDest Move to destination
     */
    stopTween(identifier: string, jumpToDest: boolean) {
      if (this._isActive) {
        this._tweens.stopTween(identifier, jumpToDest);
      }
    }

    /**
     * Resume a tween.
     * @param identifier Unique id to identify the tween
     */
    resumeTween(identifier: string) {
      if (this._isActive) {
        this._tweens.resumeTween(identifier);
      }
    }

    /**
     * Remove a tween.
     * @param identifier Unique id to identify the tween
     */
    removeTween(identifier: string) {
      this._tweens.removeTween(identifier);
    }

    /**
     * Get tween progress.
     * @param identifier Unique id to identify the tween
     * @returns Progress of playing tween animation (between 0.0 and 1.0)
     */
    getProgress(identifier: string): float {
      return this._tweens.getProgress(identifier);
    }

    /**
     * Get tween value.
     *
     * It returns 0 for tweens with several values.
     *
     * @param identifier Unique id to identify the tween
     * @returns Value of playing tween animation
     */
    getValue(identifier: string): float {
      return this._tweens.getValue(identifier);
    }

    onDeActivate() {
      this._isActive = false;
    }

    onActivate() {
      this._isActive = true;
    }
  }
  gdjs.registerBehavior('Tween::TweenBehavior', gdjs.TweenRuntimeBehavior);
}
