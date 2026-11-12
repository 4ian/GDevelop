// @flow
import * as React from 'react';
import { type I18n as I18nType } from '@lingui/core';
import AuthenticatedUserContext from '../../Profile/AuthenticatedUserContext';
import { type CliProjectCreationCallbacks } from '../CliEditorFunctions';
import { createLookupToolCall } from '../../Utils/GDevelopServices/Generation';
import { prepareAiUserContent } from '../../AiGeneration/PrepareAiUserContent';
import { makeSimplifiedProjectBuilder } from '../../EditorFunctions/SimplifiedProject/SimplifiedProject';
import { getPublicApi } from '../../EditorFunctions/PublicApi';
import { notLoggedInErrorMessage } from '../../AiGeneration/UseGenerateEvents';
import { listAllExamples } from '../../Utils/GDevelopServices/Example';
import UrlStorageProvider from '../../ProjectsStorage/UrlStorageProvider';
import CloudStorageProvider from '../../ProjectsStorage/CloudStorageProvider';
import { type NewProjectSetup } from '../../ProjectCreation/NewProjectSetupDialog';
import { type McpServerTool } from './McpServerTool';
import { makeLookupTools } from './LookupTools';
import { makeProjectCreationTools } from './ProjectCreationTools';
import { makeAiRequestTools } from './AiRequestTools';
import {
  startAutomatedAiRequest,
  getAutomatedAiRequestRun,
} from '../../AiGeneration/AskAiAutomation';
import { type OpenAskAiOptions } from '../../AiGeneration/Utils';

const gd: libGDevelop = global.gd;

/**
 * The tools of the MCP server needing the editor (the user, the project
 * creation): created once, they use the latest state of the editor.
 */
export const useMcpServerTools = ({
  i18n,
  project,
  projectCreationCallbacks,
  openAskAi,
}: {|
  i18n: I18nType,
  project: ?gdProject,
  projectCreationCallbacks: CliProjectCreationCallbacks,
  openAskAi: (?OpenAskAiOptions) => void,
|}): {|
  lookupTools: Array<McpServerTool>,
  projectCreationTools: Array<McpServerTool>,
  aiRequestTools: Array<McpServerTool>,
|} => {
  const { profile, getAuthorizationHeader } = React.useContext(
    AuthenticatedUserContext
  );
  const profileRef = React.useRef(profile);
  profileRef.current = profile;
  const getAuthorizationHeaderRef = React.useRef(getAuthorizationHeader);
  getAuthorizationHeaderRef.current = getAuthorizationHeader;
  const projectCreationCallbacksRef = React.useRef(projectCreationCallbacks);
  projectCreationCallbacksRef.current = projectCreationCallbacks;
  const i18nRef = React.useRef(i18n);
  i18nRef.current = i18n;
  const projectRef = React.useRef(project);
  projectRef.current = project;
  const openAskAiRef = React.useRef(openAskAi);
  openAskAiRef.current = openAskAi;

  // Like for the GDevelop AI, the extensions of the project are given so that
  // they are documented too.
  const lookupTools = React.useMemo(
    () =>
      makeLookupTools(async ({ name, args, withProjectExtensions }) => {
        const currentProfile = profileRef.current;
        if (!currentProfile) throw new Error(notLoggedInErrorMessage);
        const currentProject = projectRef.current;
        const projectSpecificExtensionsSummaryJson =
          withProjectExtensions && currentProject
            ? JSON.stringify(
                makeSimplifiedProjectBuilder(
                  gd
                ).getProjectSpecificExtensionsSummary(currentProject)
              )
            : null;
        const preparedAiUserContent = await prepareAiUserContent({
          getAuthorizationHeader: () => getAuthorizationHeaderRef.current(),
          userId: currentProfile.id,
          simplifiedProjectJson: null,
          projectSpecificExtensionsSummaryJson,
        });
        const lookupToolCall = await createLookupToolCall(
          () => getAuthorizationHeaderRef.current(),
          {
            userId: currentProfile.id,
            name,
            args,
            toolsVersion: getPublicApi().toolsVersion,
            projectSpecificExtensionsSummaryJson:
              preparedAiUserContent.projectSpecificExtensionsSummaryJson,
            projectSpecificExtensionsSummaryJsonUserRelativeKey:
              preparedAiUserContent.projectSpecificExtensionsSummaryJsonUserRelativeKey,
          }
        );
        return lookupToolCall.output;
      }),
    []
  );

  // Like the GDevelop AI, the project is created from a template (or empty),
  // then saved in the cloud projects of the user.
  const projectCreationTools = React.useMemo(
    () =>
      makeProjectCreationTools({
        listGameTemplates: async () => {
          const { exampleShortHeaders } = await listAllExamples();
          return exampleShortHeaders.map(exampleShortHeader => ({
            slug: exampleShortHeader.slug,
            name: exampleShortHeader.name,
            shortDescription: exampleShortHeader.shortDescription,
            tags: exampleShortHeader.tags,
          }));
        },
        createProject: async ({ name, templateSlug }) => {
          const {
            createEmptyProject,
            createProjectFromExample,
            saveProjectAsWithStorageProvider,
          } = projectCreationCallbacksRef.current;
          const newProjectSetup: NewProjectSetup = {
            projectName: name,
            storageProvider: UrlStorageProvider,
            saveAsLocation: null,
            creationSource: 'mcp',
          };
          let createdProject = null;
          if (templateSlug) {
            const { exampleShortHeaders } = await listAllExamples();
            const exampleShortHeader = exampleShortHeaders.find(
              header => header.slug === templateSlug
            );
            if (!exampleShortHeader) {
              return {
                success: false,
                message: `No game template with the slug "${templateSlug}": use \`list_game_templates\` to find one.`,
              };
            }
            ({ createdProject } = await createProjectFromExample({
              exampleShortHeader,
              newProjectSetup,
              i18n: i18nRef.current,
            }));
          } else {
            ({ createdProject } = await createEmptyProject(newProjectSetup));
          }
          if (!createdProject) {
            return {
              success: false,
              message:
                'The project could not be created (possibly a network error). Try again.',
            };
          }

          const fileMetadata = await saveProjectAsWithStorageProvider({
            requestedStorageProvider: CloudStorageProvider,
            forcedSavedAsLocation: { name },
            createdProject,
          });
          const createdFrom = templateSlug
            ? `from the template "${templateSlug}"`
            : 'empty (one scene)';
          return {
            success: true,
            message: fileMetadata
              ? `Created the project "${name}" ${createdFrom}, opened in the editor and saved in the GDevelop cloud projects of the user.`
              : `Created the project "${name}" ${createdFrom}, opened in the editor, but it could not be saved in the cloud projects of the user (they may not be logged in, or have reached their limit of cloud projects). Tell the user to save it themselves.`,
          };
        },
      }),
    []
  );

  // The request is made in the Ask AI editor, as by the user.
  const aiRequestTools = React.useMemo(
    () =>
      makeAiRequestTools({
        startAiRequest: options => {
          openAskAiRef.current({ aiRequestId: null, paneIdentifier: 'center' });
          return startAutomatedAiRequest(options);
        },
        getAiRequestRun: getAutomatedAiRequestRun,
      }),
    []
  );

  return { lookupTools, projectCreationTools, aiRequestTools };
};
