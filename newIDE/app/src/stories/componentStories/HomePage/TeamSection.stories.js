// @flow
import * as React from 'react';
import MockAdapter from 'axios-mock-adapter';
import { action } from '@storybook/addon-actions';

import paperDecorator from '../../PaperDecorator';
import { testProject } from '../../GDevelopJsInitializerDecorator';
import FixedHeightFlexContainer from '../../FixedHeightFlexContainer';
import TeamSection from '../../../MainFrame/EditorContainers/HomePage/TeamSection';
import CloudStorageProvider from '../../../ProjectsStorage/CloudStorageProvider';
import { MockTeamProvider } from '../../MockTeamProvider';
import { apiClient as usageClient } from '../../../Utils/GDevelopServices/Usage';

export default {
  title: 'HomePage/TeamSection',
  component: TeamSection,
  decorators: [paperDecorator],
};

export const Default = () => {
  const usageApiMock = React.useMemo(() => {
    const mock = new MockAdapter(usageClient, {
      delayResponse: 250,
    });

    mock
      .onGet('/subscription-plan', { params: { includeLegacy: true } })
      .reply(200, []);

    return mock;
  }, []);

  React.useEffect(
    () => {
      return () => {
        usageApiMock.restore();
      };
    },
    [usageApiMock]
  );

  return (
    <MockTeamProvider loading={false} teamSize={12}>
      <FixedHeightFlexContainer height={600}>
        <TeamSection
          project={testProject.project}
          currentFileMetadata={null}
          onOpenRecentFile={action('onOpenRecentFile')}
          storageProviders={[CloudStorageProvider]}
          onOpenTeachingResources={action('onOpenTeachingResources')}
        />
      </FixedHeightFlexContainer>
    </MockTeamProvider>
  );
};

export const WithNoGroupsYet = () => {
  const usageApiMock = React.useMemo(() => {
    const mock = new MockAdapter(usageClient, {
      delayResponse: 250,
    });

    mock
      .onGet('/subscription-plan', { params: { includeLegacy: true } })
      .reply(200, []);

    return mock;
  }, []);

  React.useEffect(
    () => {
      return () => {
        usageApiMock.restore();
      };
    },
    [usageApiMock]
  );

  return (
    <MockTeamProvider loading={false} noGroups>
      <FixedHeightFlexContainer height={600}>
        <TeamSection
          project={testProject.project}
          currentFileMetadata={null}
          onOpenRecentFile={action('onOpenRecentFile')}
          storageProviders={[CloudStorageProvider]}
          onOpenTeachingResources={action('onOpenTeachingResources')}
        />
      </FixedHeightFlexContainer>
    </MockTeamProvider>
  );
};

export const WithNoStudentsYet = () => {
  const usageApiMock = React.useMemo(() => {
    const mock = new MockAdapter(usageClient, {
      delayResponse: 250,
    });

    mock
      .onGet('/subscription-plan', { params: { includeLegacy: true } })
      .reply(200, []);

    return mock;
  }, []);

  React.useEffect(
    () => {
      return () => {
        usageApiMock.restore();
      };
    },
    [usageApiMock]
  );

  return (
    <MockTeamProvider loading={false} noGroups noMembers>
      <FixedHeightFlexContainer height={600}>
        <TeamSection
          project={testProject.project}
          currentFileMetadata={null}
          onOpenRecentFile={action('onOpenRecentFile')}
          storageProviders={[CloudStorageProvider]}
          onOpenTeachingResources={action('onOpenTeachingResources')}
        />
      </FixedHeightFlexContainer>
    </MockTeamProvider>
  );
};

export const WithArchivedStudentsOnly = () => {
  const usageApiMock = React.useMemo(() => {
    const mock = new MockAdapter(usageClient, {
      delayResponse: 250,
    });

    mock
      .onGet('/subscription-plan', { params: { includeLegacy: true } })
      .reply(200, []);

    return mock;
  }, []);

  React.useEffect(
    () => {
      return () => {
        usageApiMock.restore();
      };
    },
    [usageApiMock]
  );

  return (
    <MockTeamProvider loading={false} noGroups noActiveMembers>
      <FixedHeightFlexContainer height={600}>
        <TeamSection
          project={testProject.project}
          currentFileMetadata={null}
          onOpenRecentFile={action('onOpenRecentFile')}
          storageProviders={[CloudStorageProvider]}
          onOpenTeachingResources={action('onOpenTeachingResources')}
        />
      </FixedHeightFlexContainer>
    </MockTeamProvider>
  );
};

export const Loading = () => {
  const usageApiMock = React.useMemo(() => {
    const mock = new MockAdapter(usageClient, {
      delayResponse: 250,
    });

    mock
      .onGet('/subscription-plan', { params: { includeLegacy: true } })
      .reply(200, []);

    return mock;
  }, []);

  React.useEffect(
    () => {
      return () => {
        usageApiMock.restore();
      };
    },
    [usageApiMock]
  );

  return (
    <MockTeamProvider loading={true}>
      <FixedHeightFlexContainer height={600}>
        <TeamSection
          project={testProject.project}
          currentFileMetadata={null}
          onOpenRecentFile={action('onOpenRecentFile')}
          storageProviders={[CloudStorageProvider]}
          onOpenTeachingResources={action('onOpenTeachingResources')}
        />
      </FixedHeightFlexContainer>
    </MockTeamProvider>
  );
};
