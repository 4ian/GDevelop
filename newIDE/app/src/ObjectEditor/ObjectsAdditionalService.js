// @flow
import { type AlertMessageIdentifier } from '../MainFrame/Preferences/PreferencesContext';

/*
 * Define additional logic which executes after an object has been created.
 * Also returns an InfoBar which could notify users of the additional changes.
 * Declare new identifier for infoBar in Mainframe/Preferences/PreferenceContext
 * and add it in hints/explaination list.
 */

export type InfoBarDetails = {
  identifier: AlertMessageIdentifier,
  message: string,
  touchScreenMessage: string,
};

export default {
  runAdditionalService(object: gdObject, project: gdProject, layout: gdLayout) {
    const objectTypeFunction = this.objectType[object.getType()];
    if (objectTypeFunction) {
      return objectTypeFunction(object, project, layout);
    }

    return null;
  },

  objectType: {
    'Lighting::LightObject': (
      object: gdObject,
      project: gdProject,
      layout: gdLayout
    ): ?InfoBarDetails => {
      let hasLightingLayer = false;
      for (let i = 0; i < layout.getLayersCount(); i++) {
        const layer = layout.getLayerAt(i);
        if (layer.getLightingLayer()) {
          hasLightingLayer = true;
          break;
        }
      }
      if (!hasLightingLayer) {
        layout.insertNewLayer('Lighting', layout.getLayersCount());
        const lightingLayer: gdLayer = layout.getLayer('Lighting');
        lightingLayer.setLightingLayer(true);
        lightingLayer.setSyncWithBaseLayer(true);
        lightingLayer.setAmbientLightColor(128, 128, 128);

        return {
          identifier: 'automatic-lighting-layer',
          message: 'Lighting layer created! Ideally put Light 0bjects in this layer.',
          touchScreenMessage: 'Lighting layer created!',
        };
      }

      return null;
    },
  },
};
