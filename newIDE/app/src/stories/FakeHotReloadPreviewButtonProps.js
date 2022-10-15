// @flow
import { action } from '@storybook/addon-actions';
import { type HotReloadPreviewButtonProps } from '../HotReload/HotReloadPreviewButton';

/**
 * Fake "external editors" to be used in Storybook.
 */
const fakeHotReloadPreviewButtonProps: HotReloadPreviewButtonProps = {
  hasPreviewsRunning: false,
  launchProjectDataOnlyPreview: action('launchProjectDataOnlyPreview'),
  launchProjectWithLoadingScreenPreview: action(
    'launchProjectWithLoadingScreenPreview'
  ),
};

export default fakeHotReloadPreviewButtonProps;
