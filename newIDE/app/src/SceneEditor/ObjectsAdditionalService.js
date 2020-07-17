// @flow
import { type AlertMessageIdentifier } from '../MainFrame/Preferences/PreferencesContext';

/*
 * Define additional logic which executes after an object/instance has been created.
 * Also, InfoBar can be used which could notify users of the additional changes.
 * Declare new identifier for infoBar in Mainframe/Preferences/PreferenceContext
 * and add it in hints/explaination list.
 */

export type InfoBarDetails = {
  identifier: AlertMessageIdentifier,
  message: string,
  touchScreenMessage: string,
  show: boolean,
};

type InfoBarEvent = 'onObjectAdded' | 'onInstanceAdded';

type AdditionalServices = {
  onObjectAdded: (
    object: gdObject,
    project: gdProject,
    layout: gdLayout
  ) => void,
  onInstanceAdded: (
    instance: gdInitialInstance,
    project: gdProject,
    layout: gdLayout
  ) => void,
  getInfoBarDetails: (infoBarEvent: InfoBarEvent) => InfoBarDetails,
};

export default {
  getServices(
    objectOrInstance: gdObject | gdInitialInstance,
    layout: gdLayout,
    isInstance: boolean
  ): ?AdditionalServices {
    let objectTypeServices = null;
    if (isInstance) {
      objectTypeServices = this.objectType[
        // $FlowFixMe
        layout.getObject(objectOrInstance.getObjectName()).getType()
      ];
    } else {
      // $FlowFixMe
      objectTypeServices = this.objectType[objectOrInstance.getType()];
    }
    return objectTypeServices;
  },

  objectType: {
    'Lighting::LightObject': {
      onObjectAdded: (
        object: gdObject,
        project: gdProject,
        layout: gdLayout
      ) => {
        let hasLightingLayer = false;
        for (let i = 0; i < layout.getLayersCount(); i++) {
          const layer = layout.getLayerAt(i);
          if (layer.isLightingLayer()) {
            hasLightingLayer = true;
            break;
          }
        }
        if (!hasLightingLayer) {
          layout.insertNewLayer('Lighting', layout.getLayersCount());
          const lightingLayer: gdLayer = layout.getLayer('Lighting');
          lightingLayer.setLightingLayer(true);
          lightingLayer.setFollowBaseLayerCamera(true);
          lightingLayer.setAmbientLightColor(128, 128, 128);
        }
      },

      onInstanceAdded: (
        instance: gdInitialInstance,
        project: gdProject,
        layout: gdLayout
      ) => {
        let lightingLayer = null;
        for (let i = 0; i < layout.getLayersCount(); i++) {
          const layer = layout.getLayerAt(i);
          if (layer.isLightingLayer()) {
            lightingLayer = layer;
            break;
          }
        }
        if (lightingLayer) {
          instance.setLayer(lightingLayer.getName());
        }
      },

      getInfoBarDetails: (infoBarEvent: InfoBarEvent): ?InfoBarDetails => {
        if (infoBarEvent === 'onObjectAdded') {
          return {
            show: true,
            identifier: 'automatic-lighting-layer',
            message: 'Lighting Layer created!',
            touchScreenMessage: 'Lighting Layer created!',
          };
        }

        if (infoBarEvent === 'onInstanceAdded') {
          return {
            show: true,
            identifier: 'object-moved-in-lighting-layer',
            message: 'Light Object is added in lighting layer!',
            touchScreenMessage: 'Light Object is added in lighting layer!',
          };
        }

        return null;
      },
    },
  },
};
