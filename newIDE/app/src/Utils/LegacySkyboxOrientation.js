// @flow
import { mapFor } from './MapFor';

/**
 * A skybox made before the "3D world top" property has faces rotated by hand:
 * give it the legacy value, as a property without a value shows its default.
 */
export const markEffectIfLegacySkybox = (effect: gdEffect) => {
  if (
    effect.getEffectType() === 'Scene3D::Skybox' &&
    !effect.hasStringParameter('top')
  ) {
    effect.setStringParameter('top', 'Legacy');
  }
};

const markLayersLegacySkyboxes = (layers: gdLayersContainer) => {
  mapFor(0, layers.getLayersCount(), layerIndex => {
    const effects = layers.getLayerAt(layerIndex).getEffects();
    mapFor(0, effects.getEffectsCount(), effectIndex => {
      markEffectIfLegacySkybox(effects.getEffectAt(effectIndex));
    });
  });
};

export const markLegacySkyboxes = (project: gdProject) => {
  mapFor(0, project.getLayoutsCount(), i => {
    markLayersLegacySkyboxes(project.getLayoutAt(i).getLayers());
  });
  mapFor(0, project.getEventsFunctionsExtensionsCount(), i => {
    const eventsBasedObjects = project
      .getEventsFunctionsExtensionAt(i)
      .getEventsBasedObjects();
    mapFor(0, eventsBasedObjects.getCount(), j => {
      markLayersLegacySkyboxes(eventsBasedObjects.getAt(j).getLayers());
    });
  });
};
