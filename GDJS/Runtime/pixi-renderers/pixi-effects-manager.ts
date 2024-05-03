/*
 * GDevelop JS Platform
 * Copyright 2013-2021 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
namespace gdjs {
  type RendererEffects = Record<string, gdjs.PixiFiltersTools.Filter>;

  export interface EffectsTarget {
    getRuntimeScene: () => gdjs.RuntimeInstanceContainer;
    getElapsedTime: (
      instanceContainer?: gdjs.RuntimeInstanceContainer
    ) => number;
    getHeight: () => number;
    getWidth: () => number;
    isLightingLayer?: () => boolean;
    getName: () => string;
    getRendererObject: () => RendererObjectInterface | null | undefined;
    get3DRendererObject: () => THREE.Object3D | null | undefined;
  }

  /**
   * Handle effects (aka PixiJS "filters") on PixiJS objects.
   */
  class PixiEffectsManager {
    /**
     * Initialize the renderer effect (PixiJS filter) from the effect data.
     * Call the applyEffect method afterwards, to correctly apply the
     * initialized effects on the object.
     * @param effectData The effect data
     * @param rendererEffects The collection of PixiJS filters
     * @param target The effects target
     */
    initializeEffect(
      effectData: EffectData,
      rendererEffects: RendererEffects,
      target: EffectsTarget
    ): boolean {
      const filterCreator = gdjs.PixiFiltersTools.getFilterCreator(
        effectData.effectType
      );
      if (!filterCreator) {
        console.warn(
          `Effect: "${
            effectData.name
          }", on layer: "${target.getName()}", has an unknown effect type: "${
            effectData.effectType
          }". Was it registered properly? Is the effect type correct?`
        );
        return false;
      }

      rendererEffects[effectData.name] = filterCreator.makeFilter(
        target,
        effectData
      );
      return true;
    }

    /**
     * Update the filters applied on a PixiJS DisplayObject.
     * This must be called after the events and before the rendering.
     *
     * This allows effects to be sure that they are up to date and ready
     * to render. This is not called on objects that are not rendered on screen
     * ("culling"). This is always called on layers.
     */
    updatePreRender(rendererEffects: RendererEffects, target: EffectsTarget) {
      for (const filterName in rendererEffects) {
        const filter = rendererEffects[filterName];
        filter.updatePreRender(target);
      }
    }

    /**
     * Add a new effect on a PixiJS DisplayObject, or replace the one
     * with the same name.
     * @param effectData The effect data
     * @param rendererEffects The renderer effects
     * @param target The effects target
     */
    addEffect(
      effectData: EffectData,
      rendererEffects: RendererEffects,
      target: EffectsTarget
    ): boolean {
      let effectAdded = true;
      effectAdded =
        this.initializeEffect(effectData, rendererEffects, target) &&
        effectAdded;
      effectAdded =
        this.updateAllEffectParameters(rendererEffects, effectData) &&
        effectAdded;

      if (rendererEffects[effectData.name]) {
        effectAdded =
          rendererEffects[effectData.name].applyEffect(target) && effectAdded;
      }
      return effectAdded;
    }

    /**
     * Remove the effect with the specified name from a PixiJS DisplayObject.
     * @param rendererEffects The collection of PixiJS filters.
     * @param rendererObject The renderer object.
     * @param effectName The name of the effect.
     */
    removeEffect(
      rendererEffects: RendererEffects,
      target: EffectsTarget,
      effectName: string
    ): boolean {
      const filter = rendererEffects[effectName];
      if (!filter) return false;

      filter.removeEffect(target);

      delete rendererEffects[effectName];
      return true;
    }

    /**
     * Remove all effects from a PixiJS DisplayObject.
     * @param rendererObject The renderer object.
     */
    clearEffects(rendererObject: PIXI.DisplayObject): boolean {
      if (rendererObject) {
        rendererObject.filters = [];
      }
      return true;
    }

    /**
     * Update the property of an effect (with a number).
     * @param rendererEffects The collection of PixiJS filters.
     * @param name The effect name
     * @param parameterName The property name
     * @param value The new value for the property
     */
    setEffectDoubleParameter(
      rendererEffects: RendererEffects,
      name: string,
      parameterName: string,
      value: float
    ): boolean {
      const filter = rendererEffects[name];
      if (!filter) return false;
      filter.updateDoubleParameter(parameterName, value);
      return true;
    }

    /**
     * Update the property of an effect (with a string).
     * @param rendererEffects The collection of PixiJS filters.
     * @param name The effect name
     * @param parameterName The property name
     * @param value The new value for the property
     */
    setEffectStringParameter(
      rendererEffects: RendererEffects,
      name: string,
      parameterName: string,
      value: string
    ): boolean {
      const filter = rendererEffects[name];
      if (!filter) return false;
      filter.updateStringParameter(parameterName, value);
      return true;
    }

    /**
     * Enable or disable the property of an effect (boolean).
     * @param rendererEffects The collection of PixiJS filters.
     * @param name The effect name
     * @param parameterName The property name
     * @param value The new value for the property
     */
    setEffectBooleanParameter(
      rendererEffects: RendererEffects,
      name: string,
      parameterName: string,
      value: boolean
    ): boolean {
      const filter = rendererEffects[name];
      if (!filter) return false;
      filter.updateBooleanParameter(parameterName, value);
      return true;
    }

    /**
     * Updates all the effect properties.
     * @param rendererEffects
     * @param effectData
     */
    updateAllEffectParameters(
      rendererEffects: RendererEffects,
      effectData: EffectData
    ): boolean {
      let updatedDoubles = true;
      let updatedStrings = true;
      let updatedBooleans = true;
      for (let name in effectData.doubleParameters) {
        updatedDoubles =
          this.setEffectDoubleParameter(
            rendererEffects,
            effectData.name,
            name,
            effectData.doubleParameters[name]
          ) && updatedDoubles;
      }
      for (let name in effectData.stringParameters) {
        updatedStrings =
          this.setEffectStringParameter(
            rendererEffects,
            effectData.name,
            name,
            effectData.stringParameters[name]
          ) && updatedStrings;
      }
      for (let name in effectData.booleanParameters) {
        updatedBooleans =
          this.setEffectBooleanParameter(
            rendererEffects,
            effectData.name,
            name,
            effectData.booleanParameters[name]
          ) && updatedBooleans;
      }

      return updatedDoubles && updatedStrings && updatedBooleans;
    }

    /**
     * Check if an effect exists.
     * @param rendererEffects The collection of PixiJS filters.
     * @param name The effect name
     * @returns True if the effect exists, false otherwise
     */
    hasEffect(rendererEffects: RendererEffects, name: string): boolean {
      return !!rendererEffects[name];
    }

    /**
     * Enable an effect.
     * @param rendererEffects The collection of PixiJS filters.
     * @param name The effect name
     * @param value Set to true to enable, false to disable
     */
    enableEffect(
      rendererEffects: RendererEffects,
      target: EffectsTarget,
      name: string,
      value: boolean
    ): void {
      const filter = rendererEffects[name];
      if (!filter) return;
      filter.setEnabled(target, value);
    }

    /**
     * Check if an effect is enabled.
     * @param rendererEffects The collection of PixiJS filters.
     * @param name The effect name
     * @return true if the filter is enabled
     */
    isEffectEnabled(
      rendererEffects: RendererEffects,
      target: EffectsTarget,
      name: string
    ): boolean {
      const filter = rendererEffects[name];
      if (!filter) return false;
      return filter.isEnabled(target);
    }
  }

  // Expose the effect manager to the game engine.
  export const EffectsManager = PixiEffectsManager;
  export type EffectsManager = PixiEffectsManager;
}
