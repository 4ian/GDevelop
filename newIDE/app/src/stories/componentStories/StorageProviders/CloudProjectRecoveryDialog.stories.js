// @flow

import * as React from 'react';
import MockAdapter from 'axios-mock-adapter';

import { action } from '@storybook/addon-actions';
import emptyGameContent from './fixtures/emptyGame.json';

import {
  apiClient as projectApiAxiosClient,
  type ExpandedCloudProjectVersion,
  projectResourcesClient as resourcesAxiosClient,
} from '../../../Utils/GDevelopServices/Project';
import CloudProjectRecoveryDialog from '../../../ProjectsStorage/CloudStorageProvider/CloudProjectRecoveryDialog';
import AuthenticatedUserContext from '../../../Profile/AuthenticatedUserContext';
import { fakeSilverAuthenticatedUserWithCloudProjects } from '../../../fixtures/GDevelopServicesTestData';
import {
  GDevelopProjectApi,
  GDevelopProjectResourcesStorage,
} from '../../../Utils/GDevelopServices/ApiConfigs';
import { createZipWithSingleTextFile } from '../../../Utils/Zip.js/Utils';

export default {
  title: 'Storage Providers/CloudStorageProvider/CloudProjectRecoveryDialog',
  component: CloudProjectRecoveryDialog,
};

export const Default = () => {
  const projectId = 'fb4d878a-1935-4916-b681-f9235475d354';
  const versions: Array<ExpandedCloudProjectVersion> = [
    {
      id: '8e067d2d-6f08-4f93-ad2d-f3ad5ca3c69c',
      projectId,
      createdAt: '2022-12-14T10:11:49.305Z',
      previousVersion: '9f9f50a3-1bb2-41c3-9ddb-feaf9be45648',
    },
    {
      id: '9f9f50a3-1bb2-41c3-9ddb-feaf9be45648',
      projectId,
      createdAt: '2022-12-13T10:11:49.305Z',
      previousVersion: '5280e344-bd36-4662-9948-cb0d18928d03',
    },
    {
      id: '5280e344-bd36-4662-9948-cb0d18928d03',
      projectId,
      createdAt: '2022-12-12T10:11:49.305Z',
      previousVersion: null,
    },
  ];

  const projectServiceMock = new MockAdapter(projectApiAxiosClient, {
    delayResponse: 1000,
  });
  projectServiceMock
    .onGet(`${GDevelopProjectApi.baseUrl}/project/${projectId}/version`)
    .reply(200, versions)
    .onAny()
    .reply(config => {
      console.error(`Unexpected call to ${config.url} (${config.method})`);
      return [504, null];
    });

  createZipWithSingleTextFile(JSON.stringify(emptyGameContent)).then(
    zipFile => {
      const resourcesMock = new MockAdapter(resourcesAxiosClient, {
        delayResponse: 500,
      });
      resourcesMock
        .onGet(
          `${GDevelopProjectResourcesStorage.baseUrl}/${projectId}/versions/${
            versions[1].id
          }.zip`
        )
        .reply(200, zipFile, {
          'content-type': 'application/zip',
        })
        .onAny()
        .reply(config => {
          console.error(`Unexpected call to ${config.url} (${config.method})`);
          return [504, null];
        });
    }
  );

  return (
    <AuthenticatedUserContext.Provider
      value={fakeSilverAuthenticatedUserWithCloudProjects}
    >
      <CloudProjectRecoveryDialog
        cloudProjectId={projectId}
        onClose={() => action('onClose')()}
        onOpenPreviousVersion={() => action('onOpenPreviousVersion')()}
      />
    </AuthenticatedUserContext.Provider>
  );
};

export const NoFallbackVersion = () => {
  const projectId = 'fb4d878a-1935-4916-b681-f9235475d354';
  const versions: Array<ExpandedCloudProjectVersion> = [
    {
      id: '8e067d2d-6f08-4f93-ad2d-f3ad5ca3c69c',
      projectId,
      createdAt: '2022-12-14T10:11:49.305Z',
      previousVersion: '9f9f50a3-1bb2-41c3-9ddb-feaf9be45648',
    },
    {
      id: '9f9f50a3-1bb2-41c3-9ddb-feaf9be45648',
      projectId,
      createdAt: '2022-12-13T10:11:49.305Z',
      previousVersion: '5280e344-bd36-4662-9948-cb0d18928d03',
    },
    {
      id: '5280e344-bd36-4662-9948-cb0d18928d03',
      projectId,
      createdAt: '2022-12-12T10:11:49.305Z',
      previousVersion: null,
    },
  ];

  const projectServiceMock = new MockAdapter(projectApiAxiosClient, {
    delayResponse: 1000,
  });
  projectServiceMock
    .onGet(`${GDevelopProjectApi.baseUrl}/project/${projectId}/version`)
    .reply(200, versions)
    .onAny()
    .reply(config => {
      console.error(`Unexpected call to ${config.url} (${config.method})`);
      return [504, null];
    });

  const stringifiedEmptyGameJson = JSON.stringify(emptyGameContent);

  createZipWithSingleTextFile(
    stringifiedEmptyGameJson.slice(0, stringifiedEmptyGameJson.length - 5)
  ).then(zipFile => {
    const resourcesMock = new MockAdapter(resourcesAxiosClient, {
      delayResponse: 500,
    });
    resourcesMock
      .onGet(
        `${GDevelopProjectResourcesStorage.baseUrl}/${projectId}/versions/${
          versions[1].id
        }.zip`
      )
      .reply(200, zipFile, {
        'content-type': 'application/zip',
      })
      .onGet(
        `${GDevelopProjectResourcesStorage.baseUrl}/${projectId}/versions/${
          versions[2].id
        }.zip`
      )
      .reply(200, zipFile, {
        'content-type': 'application/zip',
      })
      .onAny()
      .reply(config => {
        console.error(`Unexpected call to ${config.url} (${config.method})`);
        return [504, null];
      });
  });

  return (
    <AuthenticatedUserContext.Provider
      value={fakeSilverAuthenticatedUserWithCloudProjects}
    >
      <CloudProjectRecoveryDialog
        cloudProjectId={projectId}
        onClose={() => action('onClose')()}
        onOpenPreviousVersion={() => action('onOpenPreviousVersion')()}
      />
    </AuthenticatedUserContext.Provider>
  );
};

export const Errored = () => {
  const projectId = 'projectId';

  const assetServiceMock = new MockAdapter(projectApiAxiosClient, {
    delayResponse: 1000,
  });
  assetServiceMock
    .onGet(`${GDevelopProjectApi.baseUrl}/project/${projectId}/version`)
    .reply(500)
    .onAny()
    .reply(config => {
      console.error(`Unexpected call to ${config.url} (${config.method})`);
      return [504, null];
    });

  return (
    <AuthenticatedUserContext.Provider
      value={fakeSilverAuthenticatedUserWithCloudProjects}
    >
      <CloudProjectRecoveryDialog
        cloudProjectId={projectId}
        onClose={() => action('onClose')()}
        onOpenPreviousVersion={() => action('onOpenPreviousVersion')()}
      />
    </AuthenticatedUserContext.Provider>
  );
};
