// @flow
import { t } from '@lingui/macro';
import { type AlertMessageIdentifier } from '../MainFrame/Preferences/PreferencesContext';
import newNameGenerator from '../Utils/NewNameGenerator';
import { type MessageDescriptor } from '../Utils/i18n/MessageDescriptor.flow';

/*
 * Define additional logic which executes after an object/instance has been created.
 * Also, InfoBar can be used which could notify users of the additional changes.
 * Declare new identifier for infoBar in Mainframe/Preferences/PreferenceContext
 * and add it in hints/explaination list.
 */

export type InfoBarDetails = {|
  identifier: AlertMessageIdentifier,
  message: MessageDescriptor,
  touchScreenMessage: MessageDescriptor,
|};

type InfoBarEvent = 'onObjectAdded' | 'onInstanceAdded';

export const onObjectAdded = (
  object: gdObject,
  layout: gdLayout,
  project: gdProject
): ?InfoBarDetails => {
  const services = objectType[object.getType()];
  if (services) {
    services.onObjectAdded(object, layout, project);
    return services.getInfoBarDetails('onObjectAdded');
  }

  return null;
};

export const onInstanceAdded = (
  instance: gdInitialInstance,
  layout: gdLayout,
  project: gdProject
): ?InfoBarDetails => {
  const services =
    objectType[layout.getObject(instance.getObjectName()).getType()];
  if (services) {
    services.onInstanceAdded(instance, layout, project);
    return services.getInfoBarDetails('onInstanceAdded');
  }

  return null;
};

const getLightingLayer = (layout: gdLayout): ?gdLayer => {
  for (let i = 0; i < layout.getLayersCount(); i++) {
    const layer = layout.getLayerAt(i);
    if (layer.isLightingLayer()) return layer;
  }

  return null;
};

const objectType = {
  'Lighting::LightObject': {
    onObjectAdded: (object: gdObject, layout: gdLayout, project: gdProject) => {
      const lightingLayer = getLightingLayer(layout);
      if (lightingLayer === null) {
        const name = newNameGenerator('Lighting', name =>
          layout.hasLayerNamed(name)
        );
        layout.insertNewLayer(name, layout.getLayersCount());
        const layer: gdLayer = layout.getLayer('Lighting');
        layer.setLightingLayer(true);
        layer.setFollowBaseLayerCamera(true);
        layer.setAmbientLightColor(128, 128, 128);
      }
    },

    onInstanceAdded: (
      instance: gdInitialInstance,
      layout: gdLayout,
      project: gdProject
    ) => {
      const lightingLayer = getLightingLayer(layout);
      if (lightingLayer) {
        instance.setLayer(lightingLayer.getName());
      }
    },

    getInfoBarDetails: (infoBarEvent: InfoBarEvent): ?InfoBarDetails => {
      if (infoBarEvent === 'onObjectAdded') {
        return {
          identifier: 'automatic-lighting-layer',
          message: t`Lighting Layer created!`,
          touchScreenMessage: t`Lighting Layer created!`,
        };
      }

      if (infoBarEvent === 'onInstanceAdded') {
        return {
          identifier: 'object-moved-in-lighting-layer',
          message: t`Light Object is added in lighting layer!`,
          touchScreenMessage: t`Light Object is added in lighting layer!`,
        };
      }

      return null;
    },
  },
};
