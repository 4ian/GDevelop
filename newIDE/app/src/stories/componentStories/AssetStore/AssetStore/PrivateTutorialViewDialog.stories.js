// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';
import MockAdapter from 'axios-mock-adapter';

import paperDecorator from '../../../PaperDecorator';
import { PrivateTutorialViewDialog } from '../../../../AssetStore/PrivateTutorials/PrivateTutorialViewDialog';

import {
  client as assetApiAxiosClient,
  type PrivatePdfTutorial,
} from '../../../../Utils/GDevelopServices/Asset';
import { type Tutorial } from '../../../../Utils/GDevelopServices/Tutorial';
import AuthenticatedUserContext, {
  type AuthenticatedUser,
} from '../../../../Profile/AuthenticatedUserContext';
import {
  fakeAuthenticatedTeacherFromEducationPlan,
  fakeSilverAuthenticatedUserWithCloudProjects,
} from '../../../../fixtures/GDevelopServicesTestData';
import {
  fakeEducationCurriculumPrivateTutorial,
  fakeEducationCurriculumPrivatePdfTutorial,
} from '../../../../fixtures/GDevelopServicesTestData/FakeTutorials';

export default {
  title: 'AssetStore/AssetStore/PrivateTutorialViewDialog',
  component: PrivateTutorialViewDialog,
  decorators: [paperDecorator],
};

const PrivateTutorialViewDialogStory = ({
  tutorial,
  privatePdfTutorial,
  authenticatedUser = fakeSilverAuthenticatedUserWithCloudProjects,
  delayResponse = 0,
  errorCode,
}: {
  tutorial: Tutorial,
  privatePdfTutorial: PrivatePdfTutorial,
  authenticatedUser?: AuthenticatedUser,
  delayResponse?: number,
  errorCode?: number,
}) => {
  const assetServiceMock = new MockAdapter(assetApiAxiosClient, {
    delayResponse,
  });
  assetServiceMock
    .onGet(`/pdf-tutorial/${privatePdfTutorial.id}`)
    .reply(errorCode || 200, errorCode ? null : privatePdfTutorial)
    .onAny()
    .reply(config => {
      console.error(`Unexpected call to ${config.url} (${config.method})`);
      return [504, null];
    });

  return (
    <AuthenticatedUserContext.Provider value={authenticatedUser}>
      <PrivateTutorialViewDialog
        tutorial={tutorial}
        onClose={action('close')}
      />
    </AuthenticatedUserContext.Provider>
  );
};

export const Unauthenticated = () => (
  <PrivateTutorialViewDialogStory
    tutorial={fakeEducationCurriculumPrivateTutorial}
    privatePdfTutorial={fakeEducationCurriculumPrivatePdfTutorial}
    onClose={action('close')}
  />
);

export const WithAccess = () => (
  <PrivateTutorialViewDialogStory
    authenticatedUser={fakeAuthenticatedTeacherFromEducationPlan}
    tutorial={fakeEducationCurriculumPrivateTutorial}
    privatePdfTutorial={fakeEducationCurriculumPrivatePdfTutorial}
    delayResponse={1000}
    onClose={action('close')}
  />
);

export const Errored = () => (
  <PrivateTutorialViewDialogStory
    authenticatedUser={fakeAuthenticatedTeacherFromEducationPlan}
    tutorial={fakeEducationCurriculumPrivateTutorial}
    privatePdfTutorial={fakeEducationCurriculumPrivatePdfTutorial}
    errorCode={500}
    onClose={action('close')}
  />
);
