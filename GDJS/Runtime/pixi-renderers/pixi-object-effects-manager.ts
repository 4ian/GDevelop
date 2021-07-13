/*
 * GDevelop JS Platform
 * Copyright 2013-2021 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
namespace gdjs {
  import PIXI = GlobalPIXIModule.PIXI;

  class PixiObjectEffectsManager {

    update(runtimeObject: RuntimeObject, layer: Layer) {
      const filters = runtimeObject.getFilters();
      for (const filterName in filters) {
        const filter = filters[filterName];
        filter.update(filter.pixiFilter, layer);
      }
    }

    /**
     * Add a new effect on a runtime object, or replace the one
     * with the same name.
     * @param runtimeObject The runtime object
     * @param effectData The data of the effect to add.
     */
    addEffect(
      runtimeObject: RuntimeObject,
      effectData: EffectData,
      layer: Layer
    ) {
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
        return;
      }

      const filter: PixiFiltersTools.Filter = {
        pixiFilter: filterCreator.makePIXIFilter(layer, effectData),
        updateDoubleParameter: filterCreator.updateDoubleParameter,
        updateStringParameter: filterCreator.updateStringParameter,
        updateBooleanParameter: filterCreator.updateBooleanParameter,
        update: filterCreator.update,
      };

      const renderer = runtimeObject.getRendererObject();
      renderer.filters = (renderer.filters || []).concat(filter.pixiFilter);

      const filters = runtimeObject.getFilters();
      filters[effectData.name] = filter;
    }

    /**
     * Remove the effect from a runtime object with the specified name
     * @param runtimeObject The runtime object.
     * @param effectName The name of the effect.
     */
    removeEffect(runtimeObject: RuntimeObject, effectName: string) {
      const filter = runtimeObject.getFilters()[effectName];
      if (!filter) return;
      const renderer: PIXI.DisplayObject = runtimeObject.getRendererObject();
      renderer.filters = (renderer.filters || []).filter(
        (pixiFilter) => pixiFilter !== filter.pixiFilter
      );
      delete filter[effectName];
    }

    /**
     * Update the parameter of an effect (with a number).
     * @param runtimeObject The runtime object
     * @param name The effect name
     * @param parameterName The parameter name
     * @param value The new value for the parameter
     */
    setEffectDoubleParameter(
      runtimeObject: RuntimeObject,
      name: string,
      parameterName: string,
      value: float
    ): void {
      const filter = runtimeObject.getFilters()[name];
      if (!filter) return;
      filter.updateDoubleParameter(filter.pixiFilter, parameterName, value);
    }

    /**
     * Update the parameter of an effect (with a string).
     * @param runtimeObject The runtime object
     * @param name The effect name
     * @param parameterName The parameter name
     * @param value The new value for the parameter
     */
    setEffectStringParameter(
      runtimeObject: RuntimeObject,
      name: string,
      parameterName: string,
      value: string
    ): void {
      const filter = runtimeObject.getFilters()[name];
      if (!filter) return;
      filter.updateStringParameter(filter.pixiFilter, parameterName, value);
    }

    /**
     * Enable or disable the parameter of an effect (boolean).
     * @param runtimeObject The runtime object
     * @param name The effect name
     * @param parameterName The parameter name
     * @param value The new value for the parameter
     */
    setEffectBooleanParameter(
      runtimeObject: RuntimeObject,
      name: string,
      parameterName: string,
      value: boolean
    ): void {
      const filter = runtimeObject.getFilters()[name];
      if (!filter) return;
      filter.updateBooleanParameter(filter.pixiFilter, parameterName, value);
    }

    /**
     * Check if an effect exists.
     * @param runtimeObject
     * @param name The effect name
     * @returns True if the effect exists, false otherwise
     */
    hasEffect(runtimeObject: RuntimeObject, name: string): boolean {
      return !!runtimeObject.getFilters()[name];
    }

    /**
     * Enable an effect.
     * @param runtimeObject The runtime object.
     * @param name The effect name
     * @param value Set to true to enable, false to disable
     */
    enableEffect(
      runtimeObject: RuntimeObject,
      name: string,
      value: boolean
    ): void {
      const filter = runtimeObject.getFilters()[name];
      if (!filter) return;
      gdjs.PixiFiltersTools.enableEffect(filter, value);
    }

    /**
     * Check if an effect is enabled.
     * @param runtimeObject The runtime object
     * @param name The effect name
     * @return true if the filter is enabled
     */
    isEffectEnabled(runtimeObject: RuntimeObject, name: string): boolean {
      const filter = runtimeObject.getFilters()[name];
      if (!filter) return false;
      return gdjs.PixiFiltersTools.isEffectEnabled(filter);
    }
  }

  export const ObjectEffectsManager = PixiObjectEffectsManager;
  export type ObjectEffectsManager = PixiObjectEffectsManager;
}
