// @flow
import * as React from 'react';
import MockAdapter from 'axios-mock-adapter';
import paperDecorator from '../../../PaperDecorator';

import InviteHome from '../../../../ExportAndShare/ShareDialog/InviteHome';
import {
  fakeSilverAuthenticatedUser,
  fakeNotAuthenticatedUser,
  fakeStartupAuthenticatedUser,
} from '../../../../fixtures/GDevelopServicesTestData';
import AuthenticatedUserContext from '../../../../Profile/AuthenticatedUserContext';
import {
  apiClient as projectApiClient,
  type ProjectUserAclWithEmail,
} from '../../../../Utils/GDevelopServices/Project';
import { client as userApiClient } from '../../../../Utils/GDevelopServices/User';

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
  const projectApiMock = React.useMemo(() => {
    const mock = new MockAdapter(projectApiClient, {
      delayResponse: 500,
    });

    mock
      .onGet('/project-user-acl', {
        params: {
          userId: 'indie-user',
          projectId: ownedProjectId,
        },
      })
      .reply(200, []);

    return mock;
  }, []);

  React.useEffect(
    () => {
      return () => {
        projectApiMock.restore();
      };
    },
    [projectApiMock]
  );

  return (
    <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
      <InviteHome cloudProjectId={ownedProjectId} />
    </AuthenticatedUserContext.Provider>
  );
};

export const NotOwnerOfProject = () => {
  const projectApiMock = React.useMemo(() => {
    const mock = new MockAdapter(projectApiClient, {
      delayResponse: 500,
    });

    mock
      .onGet('/project-user-acl', {
        params: {
          userId: 'indie-user',
          projectId: notOwnedProjectId,
        },
      })
      .reply(403, []);

    return mock;
  }, []);

  React.useEffect(
    () => {
      return () => {
        projectApiMock.restore();
      };
    },
    [projectApiMock]
  );

  return (
    <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
      <InviteHome cloudProjectId={notOwnedProjectId} />
    </AuthenticatedUserContext.Provider>
  );
};

export const Errored = () => {
  const projectApiMock = React.useMemo(() => {
    const mock = new MockAdapter(projectApiClient, {
      delayResponse: 500,
    });

    mock
      .onGet('/project-user-acl', {
        params: {
          userId: 'indie-user',
          projectId: ownedProjectId,
        },
      })
      .reply(500, []);

    return mock;
  }, []);

  React.useEffect(
    () => {
      return () => {
        projectApiMock.restore();
      };
    },
    [projectApiMock]
  );

  return (
    <AuthenticatedUserContext.Provider value={fakeStartupAuthenticatedUser}>
      <InviteHome cloudProjectId={ownedProjectId} />
    </AuthenticatedUserContext.Provider>
  );
};

export const WithCollaborators = () => {
  const projectApiMock = React.useMemo(() => {
    const mock = new MockAdapter(projectApiClient, {
      delayResponse: 500,
    });

    mock
      .onGet('/project-user-acl', {
        params: {
          userId: 'indie-user',
          projectId: ownedProjectId,
        },
      })
      .reply(200, projectUserAcls);

    return mock;
  }, []);

  const userApiMock = React.useMemo(() => {
    const mock = new MockAdapter(userApiClient, {
      delayResponse: 500,
    });

    mock
      .onGet('/user-public-profile', {
        params: {
          id: 'other-user,other-user-2',
        },
      })
      .reply(200, {
        'other-user': {
          id: 'other-user',
          username: 'Other User',
          avatarUrl: 'https://example.com/avatar1.png',
        },
        'other-user-2': {
          id: 'other-user-2',
          username: 'Second User',
          avatarUrl: 'https://example.com/avatar2.png',
        },
      });

    return mock;
  }, []);

  React.useEffect(
    () => {
      return () => {
        userApiMock.restore();
        projectApiMock.restore();
      };
    },
    [userApiMock, projectApiMock]
  );

  return (
    <AuthenticatedUserContext.Provider value={fakeStartupAuthenticatedUser}>
      <InviteHome cloudProjectId={ownedProjectId} />
    </AuthenticatedUserContext.Provider>
  );
};
