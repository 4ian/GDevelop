// @flow
import * as React from 'react';
import { mapReverseFor } from '../Utils/MapFor';
import { useCommandWithOptions } from '../CommandPalette/CommandHooks';

type Props = {|
  layout: gdLayout,
  onEditLayerEffects: (layer: gdLayer) => void,
  onEditLayer: (layer: gdLayer) => void,
|};

const useLayersListCommands = (props: Props) => {
  const { layout, onEditLayerEffects, onEditLayer } = props;

  useCommandWithOptions('EDIT_LAYER_EFFECTS', true, {
    generateOptions: React.useCallback(
      () => {
        const layersCount = layout.getLayersCount();
        return mapReverseFor(0, layersCount, i => {
          const layer = layout.getLayerAt(i);
          return {
            text: layer.getName() || 'Base layer',
            handler: () => onEditLayerEffects(layer),
          };
        });
      },
      [layout, onEditLayerEffects]
    ),
  });

  useCommandWithOptions('EDIT_LAYER', true, {
    generateOptions: React.useCallback(
      () => {
        const layersCount = layout.getLayersCount();
        return mapReverseFor(0, layersCount, i => {
          const layer = layout.getLayerAt(i);
          return {
            text: layer.getName() || 'Base layer',
            handler: () => onEditLayer(layer),
          };
        });
      },
      [layout, onEditLayer]
    ),
  });
};

export default useLayersListCommands;
