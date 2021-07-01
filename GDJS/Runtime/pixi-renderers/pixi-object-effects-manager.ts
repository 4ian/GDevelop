/*
 * GDevelop JS Platform
 * Copyright 2013-2021 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
namespace gdjs {
  import PIXI = GlobalPIXIModule.PIXI;

  class PixiObjectEffectsManager {
    protected _filters: Hashtable<Hashtable<PixiFiltersTools.Filter>>;

    constructor() {
      this._filters = new Hashtable();
    }

    update(runtimeObject: RuntimeObject) {
      const filters: Hashtable<
        PixiFiltersTools.Filter
      > | void = this._filters.get(runtimeObject.getName());
      if (!filters) return;
      const filterValues: PixiFiltersTools.Filter[] = [];
      filters.values(filterValues);
      for (const filter of filterValues) {
        filter.update(filter.pixiFilter, runtimeObject);
      }
    }

    /**
     * Add a new effect on a runtime object, or replace the one 
     * with the same name.
     * @param runtimeObject The runtime object
     * @param effectData The data of the effect to add.
     */
    addEffect(runtimeObject: RuntimeObject, effectData: EffectData) {
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
        pixiFilter: filterCreator.makePIXIFilter(runtimeObject, effectData),
        updateDoubleParameter: filterCreator.updateDoubleParameter,
        updateStringParameter: filterCreator.updateStringParameter,
        updateBooleanParameter: filterCreator.updateBooleanParameter,
        update: filterCreator.update,
      };

      const renderer = runtimeObject.getRendererObject();
      renderer.filters = (renderer.filters || []).concat(filter.pixiFilter);

      if (!this._filters.containsKey(runtimeObject.getName())) {
        this._filters.put(runtimeObject.getName(), new Hashtable());
      }

      const filtersHashtable = this._filters.get(runtimeObject.getName());
      filtersHashtable.put(effectData.name, filter);
    }

    /**
     * Remove the effect from a runtime object with the specified name
     * @param runtimeObject The runtime object.
     * @param effectName The name of the effect.
     */
    removeEffect(runtimeObject: RuntimeObject, effectName: string) {
      const filters: Hashtable<
        PixiFiltersTools.Filter
      > | void = this._filters.get(runtimeObject.getName());
      if (!filters) return;
      if (!filters.containsKey(effectName)) return;
      const filter = filters.get(effectName);
      const renderer: PIXI.DisplayObject = runtimeObject.getRendererObject();
      renderer.filters = (renderer.filters || []).filter(
        (pixiFilter) => pixiFilter !== filter.pixiFilter
      );
      filters.remove(effectName);
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
      const filters = this._filters.get(runtimeObject.getName());
      if (!filters) {
        return;
      }
      if (!filters.containsKey(name)) return;
      const filter = filters.get(name);
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
      const filters = this._filters.get(runtimeObject.getName());
      if (!filters) {
        return;
      }
      if (!filters.containsKey(name)) return;
      const filter = filters.get(name);
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
      const filters = this._filters.get(runtimeObject.getName());
      if (!filters) {
        return;
      }
      if (!filters.containsKey(name)) return;
      const filter = filters.get(name);
      filter.updateBooleanParameter(filter.pixiFilter, parameterName, value);
    }

    /**
     * Check if an effect exists.
     * @param runtimeObject
     * @param name The effect name
     * @returns True if the effect exists, false otherwise
     */
    hasEffect(runtimeObject: RuntimeObject, name: string): boolean {
      const filters = this._filters.get(runtimeObject.getName());
      if (!filters) return false;
      return !!filters.get(name);
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
      const filters = this._filters.get(runtimeObject.getName());
      if (!filters) {
        return;
      }
      if (!filters.containsKey(name)) return;
      const filter = filters.get(name);
      gdjs.PixiFiltersTools.enableEffect(filter, value);
    }

    /**
     * Check if an effect is enabled.
     * @param runtimeObject The runtime object
     * @param name The effect name
     * @return true if the filter is enabled
     */
    isEffectEnabled(runtimeObject: RuntimeObject, name: string): boolean {
      const filters = this._filters.get(runtimeObject.getName());
      if (!filters) {
        return false;
      }
      if (!filters.containsKey(name)) return false;
      const filter = filters.get(name);
      return gdjs.PixiFiltersTools.isEffectEnabled(filter);
    }
  }

  export const ObjectEffectsManager = PixiObjectEffectsManager;
  export type ObjectEffectsManager = PixiObjectEffectsManager;
}
