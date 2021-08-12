/*
 * GDevelop JS Platform
 * Copyright 2013-2021 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
namespace gdjs {
  import PIXI = GlobalPIXIModule.PIXI;

  type RendererEffects = Record<string, PixiFiltersTools.Filter>;

  class PixiObjectEffectsManager {
    /**
     * Initialize the renderer effects from the effect data.
     * @param effectData The effect data
     * @param rendererEffects The renderer effects collection
     * @param layer The layer
     */
    initializeEffect(
      effectData: EffectData,
      rendererEffects: RendererEffects,
      layer: Layer
    ): boolean {
      const filterCreator = gdjs.PixiFiltersTools.getFilterCreator(
        effectData.effectType
      );
      if (!filterCreator) {
        console.log(
          'Filter "' +
            effectData.name +
            '" has an unknown effect type: "' +
            effectData.effectType +
            '". Was it registered properly? Is the effect type correct?'
        );
        return false;
      }

      const filter: PixiFiltersTools.Filter = {
        pixiFilter: filterCreator.makePIXIFilter(layer, effectData),
        updateDoubleParameter: filterCreator.updateDoubleParameter,
        updateStringParameter: filterCreator.updateStringParameter,
        updateBooleanParameter: filterCreator.updateBooleanParameter,
        update: filterCreator.update,
      };

      rendererEffects[effectData.name] = filter;
      return true;
    }

    /**
     * Apply the effect on the renderer object.
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
     * Update the filters applied on an object.
     * @param runtimeObject
     * @param layer
     */
    update(rendererEffects: RendererEffects, layer: Layer) {
      for (const filterName in rendererEffects) {
        const filter = rendererEffects[filterName];
        filter.update(filter.pixiFilter, layer);
      }
    }

    /**
     * Add a new effect on a runtime object, or replace the one
     * with the same name.
     * @param effectData The effect data
     * @param rendererEffects The renderer effects
     * @param rendererObject The renderer object
     * @param layer The Layer
     */
    addEffect(
      effectData: EffectData,
      rendererEffects: RendererEffects,
      rendererObject: PIXI.DisplayObject,
      layer: Layer
    ): boolean {
      let effectAdded = true;
      effectAdded =
        this.initializeEffect(effectData, rendererEffects, layer) &&
        effectAdded;
      effectAdded =
        this.updateAllEffectParameters(rendererEffects, effectData) &&
        effectAdded;
      effectAdded =
        this.applyEffect(rendererObject, rendererEffects[effectData.name]) &&
        effectAdded;
      return effectAdded;
    }

    /**
     * Remove the effect from a runtime object with the specified name
     * @param rendererEffects The renderer effects of the object.
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
     * Update the parameter of an effect (with a number).
     * @param rendererEffects The renderer effects of the object.
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
     * @param rendererEffects The renderer effects of the object.
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
     * @param rendererEffects The renderer effects of the object.
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
     * @param rendererEffects The renderer effects of the object.
     * @param name The effect name
     * @returns True if the effect exists, false otherwise
     */
    hasEffect(rendererEffects: RendererEffects, name: string): boolean {
      return !!rendererEffects[name];
    }

    /**
     * Enable an effect.
     * @param rendererEffects The renderer effects of the object.
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
     * @param rendererEffects The renderer effects of the object.
     * @param name The effect name
     * @return true if the filter is enabled
     */
    isEffectEnabled(rendererEffects: RendererEffects, name: string): boolean {
      const filter = rendererEffects[name];
      if (!filter) return false;
      return gdjs.PixiFiltersTools.isEffectEnabled(filter);
    }
  }

  export const ObjectEffectsManager = PixiObjectEffectsManager;
  export type ObjectEffectsManager = PixiObjectEffectsManager;
}
