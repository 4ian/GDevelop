// @flow

import * as React from 'react';
import {
  listAllExamples,
  type ExampleShortHeader,
} from '../Utils/GDevelopServices/Example';
import type { PrivateGameTemplateListingData } from '../Utils/GDevelopServices/Shop';
import { PrivateGameTemplateStoreContext } from '../AssetStore/PrivateGameTemplates/PrivateGameTemplateStoreContext';
import AuthenticatedUserContext from '../Profile/AuthenticatedUserContext';
import LoaderModal from '../UI/LoaderModal';
import NewProjectSetupDialog, {
  type NewProjectSetup,
  type ExampleProjectSetup,
} from '../ProjectCreation/NewProjectSetupDialog';
import { type StorageProvider } from '../ProjectsStorage';
import RouterContext from './RouterContext';
import { type CreateProjectResult } from '../Utils/UseCreateProject';
import { type OpenAskAiOptions } from '../AiGeneration/AskAiEditorContainer';

type Props = {|
  isProjectOpening: boolean,
  newProjectSetupDialogOpen: boolean,
  setNewProjectSetupDialogOpen: boolean => void,
  createEmptyProject: NewProjectSetup => Promise<CreateProjectResult>,
  createProjectFromExample: (
    exampleProjectSetup: ExampleProjectSetup
  ) => Promise<CreateProjectResult>,
  createProjectFromPrivateGameTemplate: (
    privateGameTemplateListingData: PrivateGameTemplateListingData,
    newProjectSetup: NewProjectSetup
  ) => Promise<CreateProjectResult>,
  openAskAi: OpenAskAiOptions => void,
  storageProviders: Array<StorageProvider>,
|};

const useNewProjectDialog = ({
  isProjectOpening,
  newProjectSetupDialogOpen,
  setNewProjectSetupDialogOpen,
  createEmptyProject,
  createProjectFromExample,
  createProjectFromPrivateGameTemplate,
  openAskAi,
  storageProviders,
}: Props) => {
  const [isFetchingExample, setIsFetchingExample] = React.useState(false);
  const [
    selectedPrivateGameTemplateListingData,
    setSelectedPrivateGameTemplateListingData,
  ] = React.useState<?PrivateGameTemplateListingData>(null);
  const [
    selectedExampleShortHeader,
    setSelectedExampleShortHeader,
  ] = React.useState<?ExampleShortHeader>(null);
  const [preventBackHome, setPreventBackHome] = React.useState(true);
  const { removeRouteArguments } = React.useContext(RouterContext);

  const { receivedGameTemplates } = React.useContext(AuthenticatedUserContext);
  const { privateGameTemplateListingDatas } = React.useContext(
    PrivateGameTemplateStoreContext
  );

  const closeNewProjectDialog = React.useCallback(
    () => {
      setPreventBackHome(false);
      setSelectedExampleShortHeader(null);
      setSelectedPrivateGameTemplateListingData(null);
      setNewProjectSetupDialogOpen(false);
    },
    [setNewProjectSetupDialogOpen]
  );
  const openNewProjectDialog = React.useCallback(
    () => {
      setPreventBackHome(false);
      setSelectedExampleShortHeader(null);
      setSelectedPrivateGameTemplateListingData(null);
      setNewProjectSetupDialogOpen(true);
    },
    [setNewProjectSetupDialogOpen]
  );

  const privateGameTemplateListingDatasFromSameCreator: ?Array<PrivateGameTemplateListingData> = React.useMemo(
    () => {
      if (
        !selectedPrivateGameTemplateListingData ||
        !privateGameTemplateListingDatas ||
        !receivedGameTemplates
      )
        return null;

      const receivedGameTemplateIds = receivedGameTemplates.map(
        template => template.id
      );

      return privateGameTemplateListingDatas
        .filter(
          template =>
            template.sellerId ===
              selectedPrivateGameTemplateListingData.sellerId &&
            !receivedGameTemplateIds.includes(template.sellerId)
        )
        .sort((template1, template2) =>
          template1.name.localeCompare(template2.name)
        );
    },
    [
      selectedPrivateGameTemplateListingData,
      privateGameTemplateListingDatas,
      receivedGameTemplates,
    ]
  );

  const onSelectPrivateGameTemplateListingData = React.useCallback(
    ({
      privateGameTemplateListingData,
      preventBackHome,
    }: {|
      privateGameTemplateListingData: ?PrivateGameTemplateListingData,
      preventBackHome?: boolean,
    |}) => {
      setSelectedPrivateGameTemplateListingData(privateGameTemplateListingData);
      setPreventBackHome(!!preventBackHome);
      if (privateGameTemplateListingData) {
        setNewProjectSetupDialogOpen(true);
      }
    },
    [setSelectedPrivateGameTemplateListingData, setNewProjectSetupDialogOpen]
  );

  const onSelectExampleShortHeader = React.useCallback(
    ({
      exampleShortHeader,
      preventBackHome,
    }: {|
      exampleShortHeader: ?ExampleShortHeader,
      preventBackHome?: boolean,
    |}) => {
      setSelectedExampleShortHeader(exampleShortHeader);
      setPreventBackHome(!!preventBackHome);
      if (exampleShortHeader) {
        setNewProjectSetupDialogOpen(true);
      }
    },
    [setSelectedExampleShortHeader, setNewProjectSetupDialogOpen]
  );

  const fetchAndOpenNewProjectSetupDialogForExample = React.useCallback(
    async (exampleSlug: string) => {
      try {
        setIsFetchingExample(true);
        const fetchedAllExamples = await listAllExamples();
        const exampleShortHeader = fetchedAllExamples.exampleShortHeaders.find(
          exampleShortHeader => exampleShortHeader.slug === exampleSlug
        );
        if (!exampleShortHeader) {
          throw new Error(
            `Unable to find the example with slug "${exampleSlug}"`
          );
        }

        onSelectExampleShortHeader({
          exampleShortHeader,
          preventBackHome: true, // We open the dialog for this example only.
        });
      } catch (error) {
        console.error('Error caught while opening example:', error);
        return;
      } finally {
        setIsFetchingExample(false);
        // Remove any route arguments in case it was opened from the url,
        // and so that the example is not opened again.
        removeRouteArguments(['create-from-example']);
      }
    },
    [onSelectExampleShortHeader, removeRouteArguments]
  );

  const onOpenAskAi = React.useCallback(
    () => {
      closeNewProjectDialog();
      openAskAi({
        mode: 'agent',
        aiRequestId: null,
        paneIdentifier: 'center',
      });
    },
    [closeNewProjectDialog, openAskAi]
  );

  const renderNewProjectDialog = () => {
    return (
      <>
        {isFetchingExample && <LoaderModal show />}
        {newProjectSetupDialogOpen && (
          <NewProjectSetupDialog
            isProjectOpening={isProjectOpening}
            onClose={closeNewProjectDialog}
            onCreateEmptyProject={createEmptyProject}
            onCreateFromExample={createProjectFromExample}
            onCreateProjectFromPrivateGameTemplate={
              createProjectFromPrivateGameTemplate
            }
            onOpenAskAi={onOpenAskAi}
            storageProviders={storageProviders}
            selectedExampleShortHeader={selectedExampleShortHeader}
            onSelectExampleShortHeader={exampleShortHeader =>
              onSelectExampleShortHeader({
                exampleShortHeader,
                preventBackHome: false,
              })
            }
            selectedPrivateGameTemplateListingData={
              selectedPrivateGameTemplateListingData
            }
            onSelectPrivateGameTemplateListingData={privateGameTemplateListingData =>
              onSelectPrivateGameTemplateListingData({
                privateGameTemplateListingData,
                preventBackHome: false,
              })
            }
            privateGameTemplateListingDatasFromSameCreator={
              privateGameTemplateListingDatasFromSameCreator
            }
            preventBackHome={preventBackHome}
          />
        )}
      </>
    );
  };
  return {
    selectedExampleShortHeader: selectedExampleShortHeader,
    selectedPrivateGameTemplateListingData: selectedPrivateGameTemplateListingData,
    closeNewProjectDialog,
    openNewProjectDialog,
    onSelectExampleShortHeader,
    onSelectPrivateGameTemplateListingData,
    renderNewProjectDialog,
    fetchAndOpenNewProjectSetupDialogForExample,
  };
};

export default useNewProjectDialog;
