import { mapFor } from '../Utils/MapFor';

const enumerateLayers = layersContainer =>
  mapFor(0, layersContainer.getLayersCount(), i => {
    return {
      value: layersContainer.getLayerAt(i).getName(),
      label: layersContainer.getLayerAt(i).getName() || 'Base layer',
      labelIsUserDefined: layersContainer.getLayerAt(i).getName(),
    };
  });

export default enumerateLayers;
