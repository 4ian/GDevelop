// @flow
import * as React from 'react';
// Keep first as it creates the `global.gd` object:
import '../GDevelopJsInitializerDecorator';
import HotReloadLogsDialog from '../../HotReload/HotReloadLogsDialog';
import '../../UI/Theme/Global/Scrollbar.css';
import '../../UI/Theme/Global/Animation.css';

export default {
  title: 'HotReloadLogsDialog',
};

export const WithAnError = (): React.Node => (
  <HotReloadLogsDialog
    logs={[
      {
        kind: 'error',
        message: 'Oops, something could not be hot-reloaded.',
      },
    ]}
    onClose={() => {}}
    onLaunchNewPreview={() => {}}
  />
);
WithAnError.storyName = 'with an error';

export const WithoutAnError = (): React.Node => (
  <HotReloadLogsDialog
    logs={[
      {
        kind: 'info',
        message: 'Everything is fine',
      },
    ]}
    onClose={() => {}}
    onLaunchNewPreview={() => {}}
  />
);
WithoutAnError.storyName = 'without an error';
