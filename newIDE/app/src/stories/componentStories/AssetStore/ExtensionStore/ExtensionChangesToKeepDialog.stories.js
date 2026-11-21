// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';

import paperDecorator from '../../../PaperDecorator';
import ExtensionChangesToKeepDialog from '../../../../AssetStore/ExtensionStore/ExtensionChangesToKeep/ExtensionChangesToKeepDialog';
import {
  leaderboardProjectExtension,
  leaderboardNewExtension,
  arrayToolsProjectExtension,
  arrayToolsNewExtension,
} from './ExtensionChangesToKeepFixtures';

export default {
  title: 'AssetStore/ExtensionStore/ExtensionChangesToKeepDialog',
  component: ExtensionChangesToKeepDialog,
  decorators: [paperDecorator],
};

export const Prefab = (): React.Node => (
  <ExtensionChangesToKeepDialog
    projectSerializedExtension={leaderboardProjectExtension}
    newSerializedExtension={leaderboardNewExtension}
    onApply={action('onApply')}
    onCancel={action('onCancel')}
  />
);

export const ManyFunctions = (): React.Node => (
  <ExtensionChangesToKeepDialog
    projectSerializedExtension={arrayToolsProjectExtension}
    newSerializedExtension={arrayToolsNewExtension}
    onApply={action('onApply')}
    onCancel={action('onCancel')}
  />
);
