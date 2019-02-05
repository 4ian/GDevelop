// @flow
import React from 'react';
import MainFrame from './MainFrame';
import Window from './Utils/Window';
import ExportDialog from './Export/ExportDialog';
import CreateProjectDialog from './ProjectCreation/CreateProjectDialog';
import Authentification from './Utils/GDevelopServices/Authentification';
import './UI/iconmoon-font.css'; // Styles for Iconmoon font.

// Import for browser only IDE
import BrowserExamples from './ProjectCreation/BrowserExamples';
import BrowserStarters from './ProjectCreation/BrowserStarters';
import BrowserProjectOpener from './ProjectsStorage/BrowserProjectOpener';
import BrowserSaveDialog from './ProjectsStorage/BrowserSaveDialog';
import BrowserIntroDialog from './MainFrame/BrowserIntroDialog';
import browserResourceSources from './ResourcesList/BrowserResourceSources';
import browserResourceExternalEditors from './ResourcesList/BrowserResourceExternalEditors';
import BrowserS3PreviewLauncher from './Export/BrowserExporters/BrowserS3PreviewLauncher';
import { getBrowserExporters } from './Export/BrowserExporters';
import makeExtensionsLoader from './JsExtensionsLoader/BrowserJsExtensionsLoader';
import ObjectsEditorService from './ObjectEditor/ObjectsEditorService';
import ObjectsRenderingService from './ObjectsRendering/ObjectsRenderingService';
import { makeBrowserS3EventsFunctionWriter } from './EventsFunctionsExtensionsLoader/BrowserS3EventsFunctionWriter';
import Providers from './MainFrame/Providers';

export const create = (authentification: Authentification) => {
  Window.setUpContextMenu();

  let app = null;
  const appArguments = Window.getArguments();

  app = (
    <Providers
      authentification={authentification}
      disableCheckForUpdates={!!appArguments['disable-update-check']}
    >
      {({ i18n }) => (
        <MainFrame
          i18n={i18n}
          previewLauncher={<BrowserS3PreviewLauncher />}
          exportDialog={<ExportDialog exporters={getBrowserExporters()} />}
          createDialog={
            <CreateProjectDialog
              examplesComponent={BrowserExamples}
              startersComponent={BrowserStarters}
            />
          }
          introDialog={<BrowserIntroDialog />}
          saveDialog={<BrowserSaveDialog />}
          onReadFromPathOrURL={BrowserProjectOpener.readInternalFile}
          resourceSources={browserResourceSources}
          resourceExternalEditors={browserResourceExternalEditors}
          authentification={authentification}
          extensionsLoader={makeExtensionsLoader({
            objectsEditorService: ObjectsEditorService,
            objectsRenderingService: ObjectsRenderingService,
            filterExamples: !Window.isDev(),
          })}
          initialPathsOrURLsToOpen={appArguments['_']}
          eventsFunctionWriter={makeBrowserS3EventsFunctionWriter()}
        />
      )}
    </Providers>
  );

  return app;
};
