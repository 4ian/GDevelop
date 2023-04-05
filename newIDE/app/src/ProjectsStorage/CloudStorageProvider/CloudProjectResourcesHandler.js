// @flow
import * as React from 'react';

import { Trans, t } from '@lingui/macro';
import { type AuthenticatedUser } from '../../Profile/AuthenticatedUserContext';
import { type ResourcesActionsProps } from '../../ProjectsStorage';
import optionalRequire from '../../Utils/OptionalRequire';
import { getCredentialsForCloudProject } from '../../Utils/GDevelopServices/Project';
import { downloadUrlsToLocalFiles } from '../../Utils/LocalFileDownloader';
import { checkIfIsGDevelopCloudBucketUrl } from '../../Utils/CrossOrigin';
import Window from '../../Utils/Window';
import ResourcesLoader from '../../ResourcesLoader';

const path = optionalRequire('path');
const electron = optionalRequire('electron');
const remote = optionalRequire('@electron/remote');
const app = remote ? remote.app : null;

export const generateGetResourceActions = ({
  authenticatedUser,
}: {
  authenticatedUser: AuthenticatedUser,
}) => ({
  project,
  resource,
  i18n,
  fileMetadata,
  informUser,
}: ResourcesActionsProps) => {
  const openLabel = app && path ? t`Download` : t`Open resource in browser`;
  return [
    {
      label: i18n._(openLabel),
      click: async () => {
        const resourceUrl = ResourcesLoader.getResourceFullUrl(
          project,
          resource.getName(),
          {}
        );
        if (checkIfIsGDevelopCloudBucketUrl(resourceUrl)) {
          await getCredentialsForCloudProject(
            authenticatedUser,
            fileMetadata.fileIdentifier
          );
        }
        if (app && path && electron) {
          const targetPath = path.join(
            app.getPath('downloads'),
            resource.getName()
          );
          await downloadUrlsToLocalFiles({
            urlContainers: [
              {
                url: resourceUrl,
                filePath: targetPath,
              },
            ],
            onProgress: () => {},
            throwIfAnyError: false,
          });
          informUser({
            actionLabel: <Trans>Open folder</Trans>,
            message: <Trans>The resource has been downloaded</Trans>,
            onActionClick: () =>
              electron.shell.showItemInFolder(path.resolve(targetPath)),
          });
        } else {
          Window.openExternalURL(resourceUrl);
        }
      },
    },
  ];
};
