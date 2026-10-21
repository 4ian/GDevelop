// @flow
import * as React from 'react';
// Keep first as it creates the `global.gd` object:
import '../GDevelopJsInitializerDecorator';
import HotReloadPreviewButton from '../../HotReload/HotReloadPreviewButton';
import '../../UI/Theme/Global/Scrollbar.css';
import '../../UI/Theme/Global/Animation.css';

export default {
  title: 'HotReloadPreviewButton',
};

const Default = (): React.Node => (
  <HotReloadPreviewButton
    hasPreviewsRunning={false}
    launchProjectDataOnlyPreview={async () => {}}
    launchProjectCodeAndDataPreview={async () => {}}
    launchProjectWithLoadingScreenPreview={async () => {}}
  />
);

export { Default as _____________________Default };
Default.storyName = 'default';

export const WithPreviewSRunning = (): React.Node => (
  <HotReloadPreviewButton
    hasPreviewsRunning={true}
    launchProjectDataOnlyPreview={async () => {}}
    launchProjectCodeAndDataPreview={async () => {}}
    launchProjectWithLoadingScreenPreview={async () => {}}
  />
);
WithPreviewSRunning.storyName = 'with preview(s) running';
