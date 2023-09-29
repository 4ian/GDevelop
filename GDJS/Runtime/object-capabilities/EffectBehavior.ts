/*
 * GDevelop JS Platform
 * Copyright 2013-2023 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
namespace gdjs {
  export interface EffectHandler {
    /**
     * Change an effect property value (for properties that are numbers).
     * @param name The name of the effect to update.
     * @param parameterName The name of the property to update.
     * @param value The new value (number).
     */
    setEffectDoubleParameter(
      name: string,
      parameterName: string,
      value: float
    ): boolean;

    /**
     * Change an effect property value (for properties that are strings).
     * @param name The name of the effect to update.
     * @param parameterName The name of the property to update.
     * @param value The new value (string).
     */
    setEffectStringParameter(
      name: string,
      parameterName: string,
      value: string
    ): boolean;

    /**
     * Change an effect property value (for properties that are booleans).
     * @param name The name of the effect to update.
     * @param parameterName The name of the property to update.
     * @param value The new value (boolean).
     */
    setEffectBooleanParameter(
      name: string,
      parameterName: string,
      value: boolean
    ): boolean;

    /**
     * Enable or disable an effect.
     * @param name The name of the effect to enable or disable.
     * @param enable true to enable, false to disable
     */
    enableEffect(name: string, enable: boolean): void;

    /**
     * Check if an effect is enabled
     * @param name The name of the effect
     * @return true if the effect is enabled, false otherwise.
     */
    isEffectEnabled(name: string): boolean;
  }

  /**
   * A behavior that forwards the EffectBehavior interface to its object.
   */
  export class EffectBehavior
    extends gdjs.RuntimeBehavior
    implements EffectHandler {
    private object: gdjs.RuntimeObject & EffectHandler;

    constructor(
      instanceContainer: gdjs.RuntimeInstanceContainer,
      behaviorData,
      owner: gdjs.RuntimeObject & EffectHandler
    ) {
      super(instanceContainer, behaviorData, owner);
      this.object = owner;
    }

    usesLifecycleFunction(): boolean {
      return false;
    }

    updateFromBehaviorData(oldBehaviorData, newBehaviorData): boolean {
      // Nothing to update.
      return true;
    }

    onDeActivate() {}

    onDestroy() {}

    doStepPreEvents(instanceContainer: gdjs.RuntimeInstanceContainer) {}

    doStepPostEvents(instanceContainer: gdjs.RuntimeInstanceContainer) {}

    setEffectDoubleParameter(
      name: string,
      parameterName: string,
      value: float
    ): boolean {
      return this.object.setEffectDoubleParameter(name, parameterName, value);
    }

    setEffectStringParameter(
      name: string,
      parameterName: string,
      value: string
    ): boolean {
      return this.object.setEffectStringParameter(name, parameterName, value);
    }

    setEffectBooleanParameter(
      name: string,
      parameterName: string,
      value: boolean
    ): boolean {
      return this.object.setEffectBooleanParameter(name, parameterName, value);
    }

    enableEffect(name: string, enable: boolean): void {
      this.object.enableEffect(name, enable);
    }

    isEffectEnabled(name: string): boolean {
      return this.object.isEffectEnabled(name);
    }
  }

  gdjs.registerBehavior(
    'EffectCapability::EffectBehavior',
    gdjs.EffectBehavior
  );
}
