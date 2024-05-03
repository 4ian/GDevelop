// @flow

import * as React from 'react';

import { type ExpandedCloudProjectVersion } from '../../../Utils/GDevelopServices/Project';

import paperDecorator from '../../PaperDecorator';
import VersionHistory from '../../../VersionHistory';
import MockAdapter from 'axios-mock-adapter';
import type { OpenedVersionStatus } from '../../../VersionHistory';
import { client as userApiAxiosClient } from '../../../Utils/GDevelopServices/User';
import { GDevelopUserApi } from '../../../Utils/GDevelopServices/ApiConfigs';
import { delay } from '../../../Utils/Delay';
import {
  ColumnStackLayout,
  ResponsiveLineStackLayout,
} from '../../../UI/Layout';
import FlatButton from '../../../UI/FlatButton';
import { Column } from '../../../UI/Grid';
import OpenedVersionStatusChip from '../../../VersionHistory/OpenedVersionStatusChip';

export default {
  title: 'VersionHistory',
  component: VersionHistory,
  decorators: [paperDecorator],
};

const projectId = 'fb4d878a-1935-4916-b681-f9235475d354';
const initialVersions: Array<ExpandedCloudProjectVersion> = [
  {
    id: 'dddbe02b-be5e-4008-aff4-90ab32e3315a',
    projectId,
    createdAt: '2023-12-04T17:21:26.729Z',
    previousVersion: '0b43b267-ae5a-4822-a926-af14bf52f06d',
    userId: 'a9bc54be-07e1-4f29-9739-5fbec2b04da7',
  },
  {
    id: '0b43b267-ae5a-4822-a926-af14bf52f06d',
    projectId,
    createdAt: '2023-12-04T16:02:26.729Z',
    previousVersion: '24ab6329-9fed-41a3-989f-f88b90647658',
    userId: 'a9bc54be-07e1-4f29-9739-5fbec2b04da7',
  },
  {
    id: '24ab6329-9fed-41a3-989f-f88b90647658',
    projectId,
    label: 'Client presentation for the newcomers of this year',
    createdAt: '2023-08-01T07:21:26.729Z',
    previousVersion: '30194561-9651-445b-8cec-702310ca2ec8',
    userId: 'c73c4d69-86a2-441b-a8b7-afe6b8fce810',
  },
  {
    id: '30194561-9651-445b-8cec-702310ca2ec8',
    projectId,
    createdAt: '2023-07-28T19:52:26.729Z',
    previousVersion: '8e067d2d-6f08-4f93-ad2d-f3ad5ca3c69c',
    userId: 'c73c4d69-86a2-441b-a8b7-afe6b8fce810',
    restoredFromVersion: {
      id: 'fd174383-30dd-4c69-945b-5d348b273828',
      projectId,
      createdAt: '2022-10-12T03:58:49.305Z',
      previousVersion: '4b0e3a7a-3127-4f52-b7d8-ce646728b96b',
      userId: 'a9bc54be-07e1-4f29-9739-5fbec2b04da7',
    },
  },
  {
    id: '8e067d2d-6f08-4f93-ad2d-f3ad5ca3c69c',
    projectId,
    createdAt: '2022-11-14T10:11:49.305Z',
    previousVersion: '9f9f50a3-1bb2-41c3-9ddb-feaf9be45648',
    userId: 'a9bc54be-07e1-4f29-9739-5fbec2b04da7',
  },
  {
    id: '9f9f50a3-1bb2-41c3-9ddb-feaf9be45648',
    projectId,
    createdAt: '2022-11-13T10:11:49.305Z',
    previousVersion: '5280e344-bd36-4662-9948-cb0d18928d03',
    userId: 'c73c4d69-86a2-441b-a8b7-afe6b8fce810',
  },
  {
    id: '5280e344-bd36-4662-9948-cb0d18928d03',
    projectId,
    createdAt: '2022-10-12T10:11:49.305Z',
    previousVersion: 'e51c123a-2abb-47fc-aff6-50b0572c5dc2',
  },
];

const nextVersions: Array<ExpandedCloudProjectVersion> = [
  {
    id: 'e51c123a-2abb-47fc-aff6-50b0572c5dc2',
    projectId,
    createdAt: '2022-10-12T09:02:49.305Z',
    previousVersion: 'fd174383-30dd-4c69-945b-5d348b273828',
    userId: 'a9bc54be-07e1-4f29-9739-5fbec2b04da7',
  },
  {
    id: 'fd174383-30dd-4c69-945b-5d348b273828',
    projectId,
    createdAt: '2022-10-12T03:58:49.305Z',
    previousVersion: '4b0e3a7a-3127-4f52-b7d8-ce646728b96b',
    userId: 'a9bc54be-07e1-4f29-9739-5fbec2b04da7',
  },
  {
    id: '4b0e3a7a-3127-4f52-b7d8-ce646728b96b',
    projectId,
    createdAt: '2022-10-10T18:52:49.305Z',
    previousVersion: '76d74273-2a87-4b65-af80-ce2ce75d796c',
    userId: 'c73c4d69-86a2-441b-a8b7-afe6b8fce810',
  },
  {
    id: '76d74273-2a87-4b65-af80-ce2ce75d796c',
    projectId,
    createdAt: '2022-10-09T17:51:49.305Z',
    previousVersion: '5757f84a-c5e3-407f-9504-2dc9601382ac',
    userId: 'c73c4d69-86a2-441b-a8b7-afe6b8fce810',
  },
  {
    id: '5757f84a-c5e3-407f-9504-2dc9601382ac',
    projectId,
    createdAt: '2022-10-02T12:47:49.305Z',
    userId: 'a9bc54be-07e1-4f29-9739-5fbec2b04da7',
    previousVersion: null,
  },
];

const userPublicProfilesByIds = {
  'c73c4d69-86a2-441b-a8b7-afe6b8fce810': {
    id: 'c73c4d69-86a2-441b-a8b7-afe6b8fce810',
    username: 'alex_',
    description: null,
    donateLink: null,
    discordUsername: null,
    communityLinks: {},
    iconUrl:
      'https://www.gravatar.com/avatar/6079a3eba0dc05f12034c55bbce6aaa3?s=40&d=retro',
  },
  'a9bc54be-07e1-4f29-9739-5fbec2b04da7': {
    id: '9bc54be-07e1-4f29-9739-5fbec2b04da7',
    username: 'LuniMoon',
    description: null,
    donateLink: null,
    discordUsername: null,
    communityLinks: {},
    iconUrl:
      'https://www.gravatar.com/avatar/6079a3eba0dc05f12034c55bbce65aa3?s=40&d=retro',
  },
};

export const Default = () => {
  const [versions, setVersions] = React.useState<ExpandedCloudProjectVersion[]>(
    initialVersions
  );
  const [
    openedVersionStatus,
    setOpenedVersionStatus,
  ] = React.useState<?OpenedVersionStatus>(null);
  const projectServiceMock = new MockAdapter(userApiAxiosClient, {
    delayResponse: 1000,
  });
  const latestVersion = versions[0];

  const onCheckoutVersion = React.useCallback(
    async (version: ExpandedCloudProjectVersion) => {
      if (version.id === latestVersion.id) {
        setOpenedVersionStatus(null);
        return;
      }
      setOpenedVersionStatus({
        version,
        status: 'opened',
      });
    },
    [latestVersion.id]
  );

  const onSaveCurrentlyOpenedVersion = React.useCallback(
    async () => {
      if (!openedVersionStatus) return;
      setOpenedVersionStatus({ ...openedVersionStatus, status: 'saving' });
      await delay(2000);

      setOpenedVersionStatus(null);
    },
    [openedVersionStatus]
  );

  const onAddChanges = React.useCallback(
    () => {
      if (!openedVersionStatus) return;
      if (!openedVersionStatus) return;
      setOpenedVersionStatus({
        ...openedVersionStatus,
        status: 'unsavedChanges',
      });
    },
    [openedVersionStatus]
  );

  const onRenameVersion = async (
    version: ExpandedCloudProjectVersion,
    { label }: {| label: string |}
  ) => {
    await delay(1500);
    const newVersions = [...versions];
    const index = newVersions.findIndex(version_ => version_.id === version.id);
    newVersions.splice(index, 1, { ...version, label: label || undefined });
    newVersions.forEach(version_ => {
      if (
        version_.restoredFromVersion &&
        version_.restoredFromVersion.id === version.id
      ) {
        version_.restoredFromVersion = {
          id: version.id,
          createdAt: version.createdAt,
          previousVersion: version.previousVersion,
          projectId: version.projectId,
          label: label || undefined,
        };
      }
    });
    setVersions(newVersions);
  };

  const onLoadMore = async () => {
    await delay(1000);
    setVersions([...versions, ...nextVersions]);
  };

  const onQuitVersionExploration = async () => {
    setOpenedVersionStatus(null);
  };

  const canLoadMore = versions.every(version => version.previousVersion);

  projectServiceMock
    .onGet(`${GDevelopUserApi.baseUrl}/user-public-profile`)
    .reply(200, userPublicProfilesByIds)
    .onAny()
    .reply(config => {
      console.error(`Unexpected call to ${config.url} (${config.method})`);
      return [504, null];
    });

  return (
    <ResponsiveLineStackLayout>
      <Column expand>
        <VersionHistory
          isVisible
          authenticatedUserId=""
          projectId={projectId}
          versions={versions}
          onRenameVersion={onRenameVersion}
          onLoadMore={onLoadMore}
          canLoadMore={canLoadMore}
          onCheckoutVersion={onCheckoutVersion}
          openedVersionStatus={openedVersionStatus}
        />
      </Column>
      {openedVersionStatus && (
        <ColumnStackLayout>
          <OpenedVersionStatusChip
            openedVersionStatus={openedVersionStatus}
            onQuit={onQuitVersionExploration}
            disableQuitting={false}
          />
          <FlatButton label="Save" onClick={onSaveCurrentlyOpenedVersion} />
          <FlatButton label="Add changes to version" onClick={onAddChanges} />
        </ColumnStackLayout>
      )}
    </ResponsiveLineStackLayout>
  );
};
