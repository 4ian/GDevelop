// @flow

import * as React from 'react';
import type { ExampleShortHeader } from '../Utils/GDevelopServices/Example';
import type { PrivateGameTemplateListingData } from '../Utils/GDevelopServices/Shop';
import ExampleStoreDialog from '../AssetStore/ExampleStore/ExampleStoreDialog';
import { ExampleDialog } from '../AssetStore/ExampleStore/ExampleDialog';
import PrivateGameTemplateInformationDialog from '../AssetStore/PrivateGameTemplates/PrivateGameTemplateInformationDialog';
import PrivateGameTemplatePurchaseDialog from '../AssetStore/PrivateGameTemplates/PrivateGameTemplatePurchaseDialog';
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
    selectedPrivateGameTemplateListingData,
    setSelectedPrivateGameTemplateListingData,
  ] = React.useState<?PrivateGameTemplateListingData>(null);
  const [
    purchasingGameTemplateListingData,
    setPurchasingGameTemplateListingData,
  ] = React.useState<?PrivateGameTemplateListingData>(null);

  const { receivedGameTemplates } = React.useContext(AuthenticatedUserContext);
  const { privateGameTemplateListingDatas } = React.useContext(
    PrivateGameTemplateStoreContext
  );

  const closeExampleStoreDialog = React.useCallback(
    () => {
      setExampleStoreDialogOpen(false);
      setSelectedExampleShortHeader(null);
      setSelectedPrivateGameTemplateListingData(null);
    },
    [setExampleStoreDialogOpen]
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

  const renderExampleOrGameTemplateDialogs = () => {
    return (
      <>
        {exampleStoreDialogOpen && (
          <ExampleStoreDialog
            open
            onClose={closeExampleStoreDialog}
            isProjectOpening={isProjectOpening}
            selectedExampleShortHeader={selectedExampleShortHeader}
            selectedPrivateGameTemplateListingData={
              selectedPrivateGameTemplateListingData
            }
            onSelectExampleShortHeader={setSelectedExampleShortHeader}
            onSelectPrivateGameTemplateListingData={
              setSelectedPrivateGameTemplateListingData
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
        {!!selectedPrivateGameTemplateListingData && (
          <PrivateGameTemplateInformationDialog
            privateGameTemplateListingData={
              selectedPrivateGameTemplateListingData
            }
            isPurchaseDialogOpen={!!purchasingGameTemplateListingData}
            onCreateWithGameTemplate={onOpenNewProjectSetupDialog}
            onGameTemplateOpen={setSelectedPrivateGameTemplateListingData}
            onOpenPurchaseDialog={() => {
              setPurchasingGameTemplateListingData(
                selectedPrivateGameTemplateListingData
              );
            }}
            onClose={() => setSelectedPrivateGameTemplateListingData(null)}
            privateGameTemplateListingDatasFromSameCreator={
              privateGameTemplateListingDatasFromSameCreator
            }
          />
        )}
        {!!purchasingGameTemplateListingData && (
          <PrivateGameTemplatePurchaseDialog
            privateGameTemplateListingData={purchasingGameTemplateListingData}
            onClose={() => setPurchasingGameTemplateListingData(null)}
          />
        )}
      </>
    );
  };
  return {
    selectedExampleShortHeader,
    selectedPrivateGameTemplateListingData,
    onSelectExampleShortHeader: setSelectedExampleShortHeader,
    onSelectPrivateGameTemplateListingData: setSelectedPrivateGameTemplateListingData,
    onOpenExampleStoreDialog: setExampleStoreDialogOpen,
    renderExampleOrGameTemplateDialogs,
  };
};

export default useExampleOrGameTemplateDialogs;
