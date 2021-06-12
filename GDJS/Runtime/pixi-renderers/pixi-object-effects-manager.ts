/*
 * GDevelop JS Platform
 * Copyright 2013-2021 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
namespace gdjs {
  import PIXI = GlobalPIXIModule.PIXI;

  class PixiObjectEffectsManager {
    initializeEffects(
      runtimeObjectRenderer: gdjs.RuntimeObject,
      effectsData: EffectData[]
    ) {
      for (let i = 0; i < effectsData.length; i++) {
        this.addEffect(runtimeObjectRenderer, effectsData[i]);
      }
    }

    addEffect(runtimeObject: gdjs.RuntimeObject, effectData: EffectData) {
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

      const filter: gdjs.PixiFiltersTools.Filter = {
        pixiFilter: filterCreator.makePIXIFilter(runtimeObject, effectData),
        updateDoubleParameter: filterCreator.updateDoubleParameter,
        updateStringParameter: filterCreator.updateStringParameter,
        updateBooleanParameter: filterCreator.updateBooleanParameter,
        update: filterCreator.update,
      };

      const renderer = runtimeObject.getRendererObject();
      renderer.filters = (renderer.filters || []).concat(filter.pixiFilter);
    }
  }

  export const ObjectEffectsManager = PixiObjectEffectsManager;
  export type ObjectEffectsManager = PixiObjectEffectsManager;
}
