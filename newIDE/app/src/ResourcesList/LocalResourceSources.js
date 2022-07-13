// @flow
import { t } from '@lingui/macro';
import {
  type ResourceSource,
  allResourceKindsAndMetadata,
} from './ResourceSource';
import { isPathInProjectFolder, copyAllToProjectFolder } from './ResourceUtils';
import optionalRequire from '../Utils/OptionalRequire';
import Window from '../Utils/Window';
const remote = optionalRequire('@electron/remote');
const dialog = remote ? remote.dialog : null;
const path = optionalRequire('path');

const localResourceSources: Array<ResourceSource> = [
  ...allResourceKindsAndMetadata.map(
    ({ kind, displayName, fileExtensions, createNewResource }) => ({
      name: 'local-file-opener-' + kind,
      displayName: t`Choose a file`,
      displayTab: 'import',
      kind,
      selectResourcesHeadless: async ({
        i18n,
        getLastUsedPath,
        setLastUsedPath,
        project,
        options,
      }) => {
        if (!dialog)
          throw new Error('Electron dialog not supported in this environment.');

        const properties = ['openFile'];
        if (options.multiSelection) properties.push('multiSelections');

        const projectPath = path.dirname(project.getProjectFile());
        const latestPath = getLastUsedPath(project, kind) || projectPath;

        const browserWindow = remote.getCurrentWindow();
        let { filePaths } = await dialog.showOpenDialog(browserWindow, {
          title: i18n._(t`Choose a file`),
          properties,
          filters: [
            { name: i18n._(t`Supported files`), extensions: fileExtensions },
          ],
          defaultPath: latestPath,
        });
        if (!filePaths || !filePaths.length) return [];

        const lastUsedPath = path.parse(filePaths[0]).dir;
        setLastUsedPath(project, kind, lastUsedPath);

        const outsideProjectFolderPaths = filePaths.filter(
          path => !isPathInProjectFolder(project, path)
        );

        if (outsideProjectFolderPaths.length) {
          const answer = Window.showConfirmDialog(
            i18n._(
              t`This/these file(s) are outside the project folder. Would you like to make a copy of them in your project folder first (recommended)?`
            )
          );

          if (answer) {
            filePaths = await copyAllToProjectFolder(project, filePaths);
          }
        }

        return filePaths.map(filePath => {
          const newResource = createNewResource();
          const projectPath = path.dirname(project.getProjectFile());
          newResource.setFile(path.relative(projectPath, filePath));
          newResource.setName(path.relative(projectPath, filePath));

          return newResource;
        });
      },
      renderComponent: () => null,
    })
  ),
];

export default localResourceSources;
