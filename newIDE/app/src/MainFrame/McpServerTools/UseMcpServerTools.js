// @flow
import * as React from 'react';
import { type I18n as I18nType } from '@lingui/core';
import AuthenticatedUserContext from '../../Profile/AuthenticatedUserContext';
import { type CliProjectCreationCallbacks } from '../CliEditorFunctions';
import { createResourceSearch } from '../../Utils/GDevelopServices/Generation';
import { notLoggedInErrorMessage } from '../../AiGeneration/UseGenerateEvents';
import { listAllExamples } from '../../Utils/GDevelopServices/Example';
import UrlStorageProvider from '../../ProjectsStorage/UrlStorageProvider';
import CloudStorageProvider from '../../ProjectsStorage/CloudStorageProvider';
import { type NewProjectSetup } from '../../ProjectCreation/NewProjectSetupDialog';
import { type McpServerTool } from './McpServerTool';
import { makeResourceStoreTools } from './ResourceStoreTools';
import { makeProjectCreationTools } from './ProjectCreationTools';

/**
 * The tools of the MCP server needing the editor (the user, the project
 * creation): created once, they use the latest state of the editor.
 */
export const useMcpServerTools = ({
  i18n,
  projectCreationCallbacks,
}: {|
  i18n: I18nType,
  projectCreationCallbacks: CliProjectCreationCallbacks,
|}): {|
  resourceStoreTools: Array<McpServerTool>,
  projectCreationTools: Array<McpServerTool>,
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

  // The search the editor does to install a resource by name (see
  // `useSearchAndInstallResource`), done for the agent to choose the name.
  const resourceStoreTools = React.useMemo(
    () =>
      makeResourceStoreTools(async ({ searchTerms, resourceKind }) => {
        const currentProfile = profileRef.current;
        if (!currentProfile) throw new Error(notLoggedInErrorMessage);
        const resourceSearch = await createResourceSearch(
          () => getAuthorizationHeaderRef.current(),
          { userId: currentProfile.id, searchTerms, resourceKind }
        );
        return (resourceSearch.results || []).map(({ resource }) => ({
          name: resource.name,
          tags: resource.tags || [],
          metadata: resource.metadata || null,
        }));
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

  return { resourceStoreTools, projectCreationTools };
};
