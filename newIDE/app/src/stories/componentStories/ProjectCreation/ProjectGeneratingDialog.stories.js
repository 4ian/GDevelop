// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';

import paperDecorator from '../../PaperDecorator';
import ProjectGeneratingDialog from '../../../ProjectCreation/ProjectGeneratingDialog';
import UrlStorageProvider from '../../../ProjectsStorage/UrlStorageProvider';
import { GDevelopGenerationApi } from '../../../Utils/GDevelopServices/ApiConfigs';
import AuthenticatedUserContext from '../../../Profile/AuthenticatedUserContext';
import { fakeSilverAuthenticatedUser } from '../../../fixtures/GDevelopServicesTestData';

export default {
  title: 'Project Creation/ProjectGeneratingDialog',
  component: ProjectGeneratingDialog,
  decorators: [paperDecorator],
};

export const Generating = () => {
  return (
    <ProjectGeneratingDialog
      storageProvider={UrlStorageProvider}
      onClose={() => action('on close')()}
      onCreate={() => action('on create')()}
      generatingProjectId="fake-generating-project-id"
      saveAsLocation={null}
    />
  );
};

export const Errored = () => {
  return (
    <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
      <ProjectGeneratingDialog
        storageProvider={UrlStorageProvider}
        onClose={() => action('on close')()}
        onCreate={() => action('on create')()}
        generatingProjectId="fake-generating-project-id"
        saveAsLocation={null}
      />
    </AuthenticatedUserContext.Provider>
  );
};
Errored.parameters = {
  mockData: [
    {
      url: `${
        GDevelopGenerationApi.baseUrl
      }/generated-project/fake-generating-project-id?userId=indie-user`,
      method: 'GET',
      status: 500,
      response: {},
      delay: 500,
    },
  ],
};
