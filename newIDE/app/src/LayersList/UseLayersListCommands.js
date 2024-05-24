// @flow
import * as React from 'react';
import { mapReverseFor } from '../Utils/MapFor';
import { useCommandWithOptions } from '../CommandPalette/CommandHooks';

type Props = {|
  layersContainer: gdLayersContainer,
  onEditLayerEffects: (layer: gdLayer) => void,
  onEditLayer: (layer: gdLayer) => void,
|};

const useLayersListCommands = (props: Props) => {
  const { layersContainer, onEditLayerEffects, onEditLayer } = props;

  useCommandWithOptions('EDIT_LAYER_EFFECTS', true, {
    generateOptions: React.useCallback(
      () => {
        const layersCount = layersContainer.getLayersCount();
        return mapReverseFor(0, layersCount, i => {
          const layer = layersContainer.getLayerAt(i);
          return {
            text: layer.getName() || 'Base layer',
            handler: () => onEditLayerEffects(layer),
          };
        });
      },
      [layersContainer, onEditLayerEffects]
    ),
  });

  useCommandWithOptions('EDIT_LAYER', true, {
    generateOptions: React.useCallback(
      () => {
        const layersCount = layersContainer.getLayersCount();
        return mapReverseFor(0, layersCount, i => {
          const layer = layersContainer.getLayerAt(i);
          return {
            text: layer.getName() || 'Base layer',
            handler: () => onEditLayer(layer),
          };
        });
      },
      [layersContainer, onEditLayer]
    ),
  });
};

export default useLayersListCommands;
