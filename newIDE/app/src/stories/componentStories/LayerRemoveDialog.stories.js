// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';

import muiDecorator from '../ThemeDecorator';
import paperDecorator from '../PaperDecorator';

import LayerRemoveDialog from '../../LayersList/LayerRemoveDialog';

const gd: libGDevelop = global.gd;

export default {
  title: 'LayerRemoveDialog',
  component: LayerRemoveDialog,
  decorators: [paperDecorator, muiDecorator],
};

export const Default = () => {
  const layout = new gd.Layout();
  layout.insertNewLayer('GUI', 0);
  layout.insertNewLayer('OtherLayer', 0);
  return (
    <LayerRemoveDialog
      open
      layersContainer={layout}
      layerRemoved="GUI"
      onClose={action('onClose')}
    />
  );
};
