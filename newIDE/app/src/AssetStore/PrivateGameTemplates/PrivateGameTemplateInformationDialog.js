// @flow
import * as React from 'react';
import { type PrivateGameTemplateListingData } from '../../Utils/GDevelopServices/Shop';
import { Trans } from '@lingui/macro';
import Dialog from '../../UI/Dialog';
import FlatButton from '../../UI/FlatButton';
import PrivateGameTemplateInformationPage from './PrivateGameTemplateInformationPage';

type Props = {|
  privateGameTemplateListingData: PrivateGameTemplateListingData,
  privateGameTemplateListingDatasFromSameCreator: ?Array<PrivateGameTemplateListingData>,
  onOpenPurchaseDialog: () => void,
  isPurchaseDialogOpen: boolean,
  onGameTemplateOpen: PrivateGameTemplateListingData => void,
  onCreateWithGameTemplate: PrivateGameTemplateListingData => void,
  onClose: () => void,
|};

const PrivateGameTemplateInformationDialog = ({
  privateGameTemplateListingData,
  privateGameTemplateListingDatasFromSameCreator,
  onOpenPurchaseDialog,
  isPurchaseDialogOpen,
  onGameTemplateOpen,
  onCreateWithGameTemplate,
  onClose,
}: Props) => {
  return (
    <Dialog
      title={null} // Handled by the content.
      actions={[
        <FlatButton
          key="close"
          label={<Trans>Back</Trans>}
          primary={false}
          onClick={onClose}
          disabled={isPurchaseDialogOpen}
        />,
      ]}
      open
      onRequestClose={onClose}
    >
      <PrivateGameTemplateInformationPage
        privateGameTemplateListingData={privateGameTemplateListingData}
        privateGameTemplateListingDatasFromSameCreator={
          privateGameTemplateListingDatasFromSameCreator
        }
        onOpenPurchaseDialog={onOpenPurchaseDialog}
        isPurchaseDialogOpen={isPurchaseDialogOpen}
        onGameTemplateOpen={onGameTemplateOpen}
        onCreateWithGameTemplate={onCreateWithGameTemplate}
      />
    </Dialog>
  );
};

export default PrivateGameTemplateInformationDialog;
