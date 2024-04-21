// @flow
import * as React from 'react';
import paperDecorator from '../../../PaperDecorator';

import InviteHome from '../../../../ExportAndShare/ShareDialog/InviteHome';
import {
  fakeSilverAuthenticatedUser,
  fakeNotAuthenticatedUser,
  fakeStartupAuthenticatedUser,
} from '../../../../fixtures/GDevelopServicesTestData';
import AuthenticatedUserContext from '../../../../Profile/AuthenticatedUserContext';
import { GDevelopProjectApi } from '../../../../Utils/GDevelopServices/ApiConfigs';
import { type ProjectUserAclWithEmail } from '../../../../Utils/GDevelopServices/Project';

const projectUserAcls: ProjectUserAclWithEmail[] = [
  {
    projectId: '1234',
    userId: 'indie-user',
    feature: 'ownership',
    level: 'owner',
    email: 'indie-user@email.com',
  },
  {
    projectId: '1234',
    userId: 'other-user',
    feature: 'collaboration',
    level: 'writer',
    email: 'other-user@email.com',
  },
  {
    projectId: '1234',
    userId: 'other-user-2',
    feature: 'collaboration',
    level: 'reader',
    email: 'other-user-2@email.com',
  },
];

const ownedProjectId = 'owned-project-id';
const notOwnedProjectId = 'not-owned-project-id';

export default {
  title: 'Share/InviteHome',
  component: InviteHome,
  decorators: [paperDecorator],
};

export const NotLoggedInOrOffline = () => {
  return (
    <AuthenticatedUserContext.Provider value={fakeNotAuthenticatedUser}>
      <InviteHome cloudProjectId="owned-project-id" />
    </AuthenticatedUserContext.Provider>
  );
};

export const ProjectNotSaved = () => {
  return (
    <AuthenticatedUserContext.Provider value={fakeStartupAuthenticatedUser}>
      <InviteHome cloudProjectId={null} />
    </AuthenticatedUserContext.Provider>
  );
};

export const NoStartupSubscription = () => {
  return (
    <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
      <InviteHome cloudProjectId={ownedProjectId} />
    </AuthenticatedUserContext.Provider>
  );
};
NoStartupSubscription.parameters = {
  mockData: [
    {
      url: `${
        GDevelopProjectApi.baseUrl
      }/project-user-acl?userId=indie-user&projectId=${ownedProjectId}`,
      method: 'GET',
      status: 200,
      response: [],
      delay: 500,
    },
  ],
};

export const NotOwnerOfProject = () => {
  return (
    <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
      <InviteHome cloudProjectId={notOwnedProjectId} />
    </AuthenticatedUserContext.Provider>
  );
};
NotOwnerOfProject.parameters = {
  mockData: [
    {
      url: `${
        GDevelopProjectApi.baseUrl
      }/project-user-acl?userId=indie-user&projectId=${notOwnedProjectId}`,
      method: 'GET',
      status: 403,
      response: [],
      delay: 500,
    },
  ],
};

export const Errored = () => {
  return (
    <AuthenticatedUserContext.Provider value={fakeStartupAuthenticatedUser}>
      <InviteHome cloudProjectId={ownedProjectId} />
    </AuthenticatedUserContext.Provider>
  );
};
Errored.parameters = {
  mockData: [
    {
      url: `${
        GDevelopProjectApi.baseUrl
      }/project-user-acl?userId=indie-user&projectId=${ownedProjectId}`,
      method: 'GET',
      status: 500,
      response: [],
      delay: 500,
    },
  ],
};

export const WithCollaborators = () => {
  return (
    <AuthenticatedUserContext.Provider value={fakeStartupAuthenticatedUser}>
      <InviteHome cloudProjectId={ownedProjectId} />
    </AuthenticatedUserContext.Provider>
  );
};
WithCollaborators.parameters = {
  mockData: [
    {
      url: `${
        GDevelopProjectApi.baseUrl
      }/project-user-acl?userId=indie-user&projectId=${ownedProjectId}`,
      method: 'GET',
      status: 200,
      response: projectUserAcls,
      delay: 500,
    },
  ],
};
