// @flow

import * as React from 'react';
import type { ExampleShortHeader } from '../Utils/GDevelopServices/Example';
import type { PrivateGameTemplateListingData } from '../Utils/GDevelopServices/Shop';
import ExampleStoreDialog from '../AssetStore/ExampleStore/ExampleStoreDialog';
import { ExampleDialog } from '../AssetStore/ExampleStore/ExampleDialog';
import PrivateGameTemplateInformationDialog from '../AssetStore/PrivateGameTemplates/PrivateGameTemplateInformationDialog';
import PrivateGameTemplatePurchaseDialog from '../AssetStore/PrivateGameTemplates/PrivateGameTemplatePurchaseDialog';

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

  const closeExampleStoreDialog = React.useCallback(
    () => {
      setExampleStoreDialogOpen(false);
      setSelectedExampleShortHeader(null);
      setSelectedPrivateGameTemplateListingData(null);
    },
    [setExampleStoreDialogOpen]
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
            privateGameTemplateListingDatasFromSameCreator={[]}
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
