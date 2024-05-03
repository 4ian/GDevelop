// @flow

import * as React from 'react';
import type { ExampleShortHeader } from '../Utils/GDevelopServices/Example';
import type { PrivateGameTemplateListingData } from '../Utils/GDevelopServices/Shop';
import ExampleStoreDialog from '../AssetStore/ExampleStore/ExampleStoreDialog';
import { ExampleDialog } from '../AssetStore/ExampleStore/ExampleDialog';
import PrivateGameTemplateInformationDialog from '../AssetStore/PrivateGameTemplates/PrivateGameTemplateInformationDialog';
import { PrivateGameTemplateStoreContext } from '../AssetStore/PrivateGameTemplates/PrivateGameTemplateStoreContext';
import AuthenticatedUserContext from '../Profile/AuthenticatedUserContext';

type Props = {|
  isProjectOpening: boolean,
  onOpenNewProjectSetupDialog: () => void,
|};

const useExampleOrGameTemplateDialogs = ({
  isProjectOpening,
  onOpenNewProjectSetupDialog,
}: Props) => {
  const [
    exampleStoreDialogOpen,
    setExampleStoreDialogOpen,
  ] = React.useState<boolean>(false);
  const [
    selectedExampleShortHeader,
    setSelectedExampleShortHeader,
  ] = React.useState<?ExampleShortHeader>(null);
  const [
    selectedPrivateGameTemplate,
    setSelectedPrivateGameTemplate,
  ] = React.useState<?{|
    privateGameTemplateListingData: PrivateGameTemplateListingData,
    /**
     * At the moment, only MainFrame uses this hook and handles the selected private
     * game template in both build and store sections in this single variable.
     * But the store section handles the preview of the game template content (unlike
     * the build section that needs this hook to open the information dialog) so we
     * let the possibility to select a game template without opening the dialog
     * (This selected game template is then used by the NewProjectSetupDialog to use).
     */
    openDialog: boolean,
  |}>(null);

  const { receivedGameTemplates } = React.useContext(AuthenticatedUserContext);
  const { privateGameTemplateListingDatas } = React.useContext(
    PrivateGameTemplateStoreContext
  );

  const closeExampleStoreDialog = React.useCallback(
    ({
      deselectExampleAndGameTemplate,
    }: {|
      deselectExampleAndGameTemplate: boolean,
    |}) => {
      setExampleStoreDialogOpen(false);
      if (deselectExampleAndGameTemplate) {
        setSelectedExampleShortHeader(null);
        setSelectedPrivateGameTemplate(null);
      }
    },
    [setExampleStoreDialogOpen]
  );
  const openExampleStoreDialog = React.useCallback(
    () => {
      setExampleStoreDialogOpen(true);
    },
    [setExampleStoreDialogOpen]
  );

  const privateGameTemplateListingDatasFromSameCreator: ?Array<PrivateGameTemplateListingData> = React.useMemo(
    () => {
      if (
        !selectedPrivateGameTemplate ||
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
              selectedPrivateGameTemplate.privateGameTemplateListingData
                .sellerId &&
            !receivedGameTemplateIds.includes(template.sellerId)
        )
        .sort((template1, template2) =>
          template1.name.localeCompare(template2.name)
        );
    },
    [
      selectedPrivateGameTemplate,
      privateGameTemplateListingDatas,
      receivedGameTemplates,
    ]
  );

  const renderExampleOrGameTemplateDialogs = () => {
    return (
      <>
        {exampleStoreDialogOpen && (
          <ExampleStoreDialog
            open
            onClose={() =>
              closeExampleStoreDialog({ deselectExampleAndGameTemplate: true })
            }
            isProjectOpening={isProjectOpening}
            selectedExampleShortHeader={selectedExampleShortHeader}
            selectedPrivateGameTemplateListingData={
              selectedPrivateGameTemplate
                ? selectedPrivateGameTemplate.privateGameTemplateListingData
                : null
            }
            onSelectExampleShortHeader={setSelectedExampleShortHeader}
            onSelectPrivateGameTemplateListingData={privateGameTemplateListingData =>
              privateGameTemplateListingData
                ? setSelectedPrivateGameTemplate({
                    privateGameTemplateListingData,
                    openDialog: true,
                  })
                : setSelectedPrivateGameTemplate(null)
            }
            onOpenNewProjectSetupDialog={onOpenNewProjectSetupDialog}
          />
        )}
        {!!selectedExampleShortHeader && (
          <ExampleDialog
            isOpening={isProjectOpening}
            exampleShortHeader={selectedExampleShortHeader}
            onOpen={onOpenNewProjectSetupDialog}
            onClose={() => setSelectedExampleShortHeader(null)}
          />
        )}
        {!!selectedPrivateGameTemplate &&
          selectedPrivateGameTemplate.openDialog && (
            <PrivateGameTemplateInformationDialog
              privateGameTemplateListingData={
                selectedPrivateGameTemplate.privateGameTemplateListingData
              }
              onCreateWithGameTemplate={onOpenNewProjectSetupDialog}
              onGameTemplateOpen={privateGameTemplateListingData =>
                setSelectedPrivateGameTemplate({
                  privateGameTemplateListingData,
                  openDialog: true,
                })
              }
              onClose={() => setSelectedPrivateGameTemplate(null)}
              privateGameTemplateListingDatasFromSameCreator={
                privateGameTemplateListingDatasFromSameCreator
              }
            />
          )}
      </>
    );
  };
  return {
    selectedExampleShortHeader,
    selectedPrivateGameTemplateListingData: selectedPrivateGameTemplate
      ? selectedPrivateGameTemplate.privateGameTemplateListingData
      : null,
    closeExampleStoreDialog,
    openExampleStoreDialog,
    onSelectExampleShortHeader: setSelectedExampleShortHeader,
    onSelectPrivateGameTemplate: setSelectedPrivateGameTemplate,
    renderExampleOrGameTemplateDialogs,
  };
};

export default useExampleOrGameTemplateDialogs;
