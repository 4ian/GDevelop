import { mapFor } from '../Utils/MapFor';

const enumerateLayers = (layersContainer, baseLayerLabel: string) =>
  mapFor(0, layersContainer.getLayersCount(), i => {
    return {
      value: layersContainer.getLayerAt(i).getName(),
      label: layersContainer.getLayerAt(i).getName() || baseLayerLabel,
    };
  });

export default enumerateLayers;
