// @flow
import { t } from '@lingui/macro';
import { type AlertMessageIdentifier } from '../MainFrame/Preferences/PreferencesContext';
import newNameGenerator from '../Utils/NewNameGenerator';

/*
 * Define additional logic which executes after an object/instance has been created.
 * Also, InfoBar can be used which could notify users of the additional changes.
 * Declare new identifier for infoBar in Mainframe/Preferences/PreferenceContext
 * and add it in hints/explaination list.
 */

export type InfoBarDetails = {
  show: boolean,
  identifier: AlertMessageIdentifier,
  message: string,
  touchScreenMessage: string,
};

type InfoBarEvent = 'onObjectAdded' | 'onInstanceAdded';

export default {
  onObjectAdded(
    object: gdObject,
    layout: gdLayout,
    project: gdProject
  ): ?InfoBarDetails {
    const services = this.objectType[object.getType()];
    if (services) {
      services.onObjectAdded(object, layout, project);
      return services.getInfoBarDetails('onObjectAdded');
    }

    return null;
  },

  onInstanceAdded(
    instance: gdInitialInstance,
    layout: gdLayout,
    project: gdProject
  ): ?InfoBarDetails {
    const services = this.objectType[
      layout.getObject(instance.getObjectName()).getType()
    ];
    if (services) {
      services.onInstanceAdded(instance, layout, project);
      return services.getInfoBarDetails('onInstanceAdded');
    }

    return null;
  },

  objectType: {
    'Lighting::LightObject': {
      onObjectAdded: (
        object: gdObject,
        layout: gdLayout,
        project: gdProject
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
          const name = newNameGenerator('Lighting', name =>
            layout.hasLayerNamed(name)
          );
          layout.insertNewLayer(name, layout.getLayersCount());
          const lightingLayer: gdLayer = layout.getLayer('Lighting');
          lightingLayer.setLightingLayer(true);
          lightingLayer.setFollowBaseLayerCamera(true);
          lightingLayer.setAmbientLightColor(128, 128, 128);
        }
      },

      onInstanceAdded: (
        instance: gdInitialInstance,
        layout: gdLayout,
        project: gdProject
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
            message: t`Lighting Layer created!`,
            touchScreenMessage: t`Lighting Layer created!`,
          };
        }

        if (infoBarEvent === 'onInstanceAdded') {
          return {
            show: true,
            identifier: 'object-moved-in-lighting-layer',
            message: t`Light Object is added in lighting layer!`,
            touchScreenMessage: t`Light Object is added in lighting layer!`,
          };
        }

        return null;
      },
    },
  },
};
