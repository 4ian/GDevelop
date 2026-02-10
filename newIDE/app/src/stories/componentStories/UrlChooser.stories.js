// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';

import paperDecorator from '../PaperDecorator';

import { UrlChooser } from '../../ResourcesList/BrowserResourceSources';

const gd: libGDevelop = global.gd;

export default {
  title: 'BrowserResourceSources/UrlChooser',
  component: UrlChooser,
  decorators: [paperDecorator],
};
// $FlowFixMe[signature-verification-failure]
export const Default = () => (
  <UrlChooser
    createNewResource={() => new gd.ImageResource()}
    onChooseResources={action('onChooseResources')}
    options={{
      multiSelection: false,
      resourceKind: 'image',
      initialSourceName: 'unused',
    }}
  />
);

// $FlowFixMe[signature-verification-failure]
export const Multiselection = () => (
  <UrlChooser
    createNewResource={() => new gd.ImageResource()}
    onChooseResources={action('onChooseResources')}
    options={{
      multiSelection: true,
      resourceKind: 'image',
      initialSourceName: 'unused',
    }}
  />
);
