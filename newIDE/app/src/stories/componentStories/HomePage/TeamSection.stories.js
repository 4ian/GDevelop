// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';

import paperDecorator from '../../PaperDecorator';
import { testProject } from '../../GDevelopJsInitializerDecorator';
import FixedHeightFlexContainer from '../../FixedHeightFlexContainer';
import TeamSection from '../../../MainFrame/EditorContainers/HomePage/TeamSection';
import CloudStorageProvider from '../../../ProjectsStorage/CloudStorageProvider';
import {
  emptySubscriptionPlanMockData,
  MockTeamProvider,
} from '../../MockTeamProvider';

export default {
  title: 'HomePage/TeamSection',
  component: TeamSection,
  decorators: [paperDecorator],
};

export const Default = () => {
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
Default.parameters = {
  mockData: [...emptySubscriptionPlanMockData],
};

export const WithNoGroupsYet = () => (
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
WithNoGroupsYet.parameters = {
  mockData: [...emptySubscriptionPlanMockData],
};

export const WithNoStudentsYet = () => (
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
WithNoStudentsYet.parameters = {
  mockData: [...emptySubscriptionPlanMockData],
};

export const WithArchivedStudentsOnly = () => (
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
WithArchivedStudentsOnly.parameters = {
  mockData: [...emptySubscriptionPlanMockData],
};

export const Loading = () => (
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
Loading.parameters = {
  mockData: [...emptySubscriptionPlanMockData],
};
