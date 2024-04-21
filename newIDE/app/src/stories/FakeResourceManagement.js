// @flow
import { action } from '@storybook/addon-actions';
import { emptyStorageProvider } from '../ProjectsStorage/ProjectStorageProviders';
import { type ResourceManagementProps } from '../ResourcesList/ResourceSource';
import fakeResourceExternalEditors from './FakeResourceExternalEditors';

/**
 * Fake "resource management props" to be used in Storybook.
 */
const fakeResourceManagementProps: ResourceManagementProps = {
  getStorageProvider: () => emptyStorageProvider,
  onFetchNewlyAddedResources: async () => {},
  resourceSources: [],
  onChooseResource: () => {
    action('onChooseResource');
    return Promise.reject('Unimplemented');
  },
  resourceExternalEditors: fakeResourceExternalEditors,
  getStorageProviderResourceOperations: () => null,
};

export default fakeResourceManagementProps;
