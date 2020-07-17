// @flow
import * as React from 'react';
import { t } from '@lingui/macro';
import { mapReverseFor } from '../Utils/MapFor';
import { useCommandWithOptions } from '../CommandPalette/CommandHooks';

const editLayerEffectsCommandText = t`Edit layer effects...`;

type Props = {|
  layout: gdLayout,
  onEditLayerEffects: (layer: gdLayer) => void,
|};

const useLayersListCommands = (props: Props) => {
  const { layout, onEditLayerEffects } = props;

  useCommandWithOptions('EDIT_LAYER_EFFECTS', true, {
    displayText: editLayerEffectsCommandText,
    generateOptions: React.useCallback(
      () => {
        const layersCount = layout.getLayersCount();
        return mapReverseFor(0, layersCount, i => {
          const layer = layout.getLayerAt(i);
          return {
            value: layer,
            text: layer.getName() || 'Base layer',
            handler: () => onEditLayerEffects(layer),
          };
        });
      },
      [layout, onEditLayerEffects]
    ),
  });
};

export default useLayersListCommands;
