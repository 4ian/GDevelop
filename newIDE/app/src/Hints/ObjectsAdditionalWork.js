// @flow
import { t } from '@lingui/macro';
import { type AlertMessageIdentifier } from '../MainFrame/Preferences/PreferencesContext';
import newNameGenerator from '../Utils/NewNameGenerator';
import { type MessageDescriptor } from '../Utils/i18n/MessageDescriptor.flow';
import getObjectByName from '../Utils/GetObjectByName';

/*
 * Define additional logic which executes after an object/instance has been created.
 * Also, InfoBar can be used which could notify users of the additional changes.
 * Declare new identifier for infoBar in Mainframe/Preferences/PreferenceContext
 * and add it in hints/explanation list.
 */

export type InfoBarDetails = {|
  identifier: AlertMessageIdentifier,
  message: MessageDescriptor,
  touchScreenMessage: MessageDescriptor,
|};

type InfoBarEvent = 'onObjectAdded' | 'onInstanceAdded';

type ObjectAddedOptions = {|
  object: gdObject,
  layersContainer: gdLayersContainer,
  globalObjectsContainer: gdObjectsContainer | null,
  objectsContainer: gdObjectsContainer,
|};

type InstanceAddedOptions = {|
  instance: gdInitialInstance,
  layersContainer: gdLayersContainer,
  globalObjectsContainer: gdObjectsContainer | null,
  objectsContainer: gdObjectsContainer,
|};

export const onObjectAdded = (options: ObjectAddedOptions): ?InfoBarDetails => {
  const additionalWork = objectType[options.object.getType()];
  if (additionalWork) {
    additionalWork.onObjectAdded(options);
    return additionalWork.getInfoBarDetails('onObjectAdded');
  }

  return null;
};

export const onInstanceAdded = (
  options: InstanceAddedOptions
): ?InfoBarDetails => {
  const { instance, globalObjectsContainer, objectsContainer } = options;
  const objectName = instance.getObjectName();
  const object = getObjectByName(
    globalObjectsContainer,
    objectsContainer,
    objectName
  );

  const additionalWork = object ? objectType[object.getType()] : null;
  if (additionalWork) {
    additionalWork.onInstanceAdded(options);
    return additionalWork.getInfoBarDetails('onInstanceAdded');
  }

  return null;
};

const getLightingLayer = (layersContainer: gdLayersContainer): ?gdLayer => {
  for (let i = 0; i < layersContainer.getLayersCount(); i++) {
    const layer = layersContainer.getLayerAt(i);
    if (layer.isLightingLayer()) return layer;
  }

  return null;
};

const objectType = {
  'Lighting::LightObject': {
    onObjectAdded: ({ object, layersContainer }: ObjectAddedOptions) => {
      const lightingLayer = getLightingLayer(layersContainer);
      if (lightingLayer === null) {
        const name = newNameGenerator('Lighting', name =>
          layersContainer.hasLayerNamed(name)
        );
        layersContainer.insertNewLayer(name, layersContainer.getLayersCount());
        const layer: gdLayer = layersContainer.getLayer('Lighting');
        layer.setLightingLayer(true);
        layer.setFollowBaseLayerCamera(true);
        layer.setAmbientLightColor(128, 128, 128);
      }
    },

    onInstanceAdded: ({ instance, layersContainer }: InstanceAddedOptions) => {
      const lightingLayer = getLightingLayer(layersContainer);
      if (lightingLayer) {
        instance.setLayer(lightingLayer.getName());
      }
    },

    getInfoBarDetails: (infoBarEvent: InfoBarEvent): ?InfoBarDetails => {
      if (infoBarEvent === 'onObjectAdded') {
        return {
          identifier: 'automatic-lighting-layer',
          message: t`A lighting layer was created. Lights will be placed on it automatically. You can change the ambient light color in the properties of this layer`,
          touchScreenMessage: t`A lighting layer was created. Lights will be placed on it automatically. You can change the ambient light color in the properties of this layer`,
        };
      }

      if (infoBarEvent === 'onInstanceAdded') {
        return {
          identifier: 'object-moved-in-lighting-layer',
          message: t`The light object was automatically placed on the Lighting layer.`,
          touchScreenMessage: t`The light object was automatically placed on the Lighting layer.`,
        };
      }

      return null;
    },
  },
};
