// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';

import paperDecorator from '../../../PaperDecorator';
import { ExampleDialog } from '../../../../AssetStore/ExampleStore/ExampleDialog';
import { exampleFromFutureVersion } from '../../../../fixtures/GDevelopServicesTestData';

export default {
  title: 'AssetStore/ExampleStore/ExampleDialog',
  component: ExampleDialog,
  decorators: [paperDecorator],
};

export const FutureVersion = () => (
  <ExampleDialog
    exampleShortHeader={exampleFromFutureVersion}
    onOpen={action('onOpen')}
    isOpening={false}
    onClose={action('onClose')}
  />
);
