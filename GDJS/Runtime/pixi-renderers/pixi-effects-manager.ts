/*
 * GDevelop JS Platform
 * Copyright 2013-2021 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
namespace gdjs {
  import PIXI = GlobalPIXIModule.PIXI;

  type RendererEffects = Record<string, PixiFiltersTools.Filter>;

  export interface EffectsTarget {
    getRuntimeScene: () => RuntimeScene;
    getElapsedTime: (runtimeScene?: RuntimeScene) => number;
    getHeight: () => number;
    getWidth: () => number;
    isLightingLayer?: () => boolean;
    getName: () => string;
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

      const filter: PixiFiltersTools.Filter = {
        pixiFilter: filterCreator.makePIXIFilter(target, effectData),
        updateDoubleParameter: filterCreator.updateDoubleParameter,
        updateStringParameter: filterCreator.updateStringParameter,
        updateBooleanParameter: filterCreator.updateBooleanParameter,
        updatePreRender: filterCreator.updatePreRender,
      };

      if (target.isLightingLayer && target.isLightingLayer()) {
        filter.pixiFilter.blendMode = PIXI.BLEND_MODES.ADD;
      }

      rendererEffects[effectData.name] = filter;
      return true;
    }

    /**
     * Apply the effect on the PixiJS DisplayObject.
     * Called after the effect is initialized.
     * @param rendererObject The renderer object
     * @param effect The effect to be applied.
     */
    applyEffect(
      rendererObject: PIXI.DisplayObject,
      effect: PixiFiltersTools.Filter
    ): boolean {
      rendererObject.filters = (rendererObject.filters || []).concat(
        effect.pixiFilter
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
        filter.updatePreRender(filter.pixiFilter, target);
      }
    }

    /**
     * Add a new effect on a PixiJS DisplayObject, or replace the one
     * with the same name.
     * @param effectData The effect data
     * @param rendererEffects The renderer effects
     * @param rendererObject The renderer object
     * @param target The effects target
     */
    addEffect(
      effectData: EffectData,
      rendererEffects: RendererEffects,
      rendererObject: PIXI.DisplayObject,
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
          this.applyEffect(rendererObject, rendererEffects[effectData.name]) &&
          effectAdded;
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
      rendererObject: PIXI.DisplayObject,
      effectName: string
    ): boolean {
      const filter = rendererEffects[effectName];
      if (!filter) return false;
      rendererObject.filters = (rendererObject.filters || []).filter(
        (pixiFilter) => pixiFilter !== filter.pixiFilter
      );
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
     * Update the parameter of an effect (with a number).
     * @param rendererEffects The collection of PixiJS filters.
     * @param name The effect name
     * @param parameterName The parameter name
     * @param value The new value for the parameter
     */
    setEffectDoubleParameter(
      rendererEffects: RendererEffects,
      name: string,
      parameterName: string,
      value: float
    ): boolean {
      const filter = rendererEffects[name];
      if (!filter) return false;
      filter.updateDoubleParameter(filter.pixiFilter, parameterName, value);
      return true;
    }

    /**
     * Update the parameter of an effect (with a string).
     * @param rendererEffects The collection of PixiJS filters.
     * @param name The effect name
     * @param parameterName The parameter name
     * @param value The new value for the parameter
     */
    setEffectStringParameter(
      rendererEffects: RendererEffects,
      name: string,
      parameterName: string,
      value: string
    ): boolean {
      const filter = rendererEffects[name];
      if (!filter) return false;
      filter.updateStringParameter(filter.pixiFilter, parameterName, value);
      return true;
    }

    /**
     * Enable or disable the parameter of an effect (boolean).
     * @param rendererEffects The collection of PixiJS filters.
     * @param name The effect name
     * @param parameterName The parameter name
     * @param value The new value for the parameter
     */
    setEffectBooleanParameter(
      rendererEffects: RendererEffects,
      name: string,
      parameterName: string,
      value: boolean
    ): boolean {
      const filter = rendererEffects[name];
      if (!filter) return false;
      filter.updateBooleanParameter(filter.pixiFilter, parameterName, value);
      return true;
    }

    /**
     * Updates all the effect parameters.
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
      name: string,
      value: boolean
    ): void {
      const filter = rendererEffects[name];
      if (!filter) return;
      gdjs.PixiFiltersTools.enableEffect(filter, value);
    }

    /**
     * Check if an effect is enabled.
     * @param rendererEffects The collection of PixiJS filters.
     * @param name The effect name
     * @return true if the filter is enabled
     */
    isEffectEnabled(rendererEffects: RendererEffects, name: string): boolean {
      const filter = rendererEffects[name];
      if (!filter) return false;
      return gdjs.PixiFiltersTools.isEffectEnabled(filter);
    }
  }

  // Expose the effect manager to the game engine.
  export const EffectsManager = PixiEffectsManager;
  export type EffectsManager = PixiEffectsManager;
}
