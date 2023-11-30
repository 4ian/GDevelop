// @flow
import * as React from 'react';
import { type PrivateGameTemplateListingData } from '../../Utils/GDevelopServices/Shop';
import { Trans } from '@lingui/macro';
import Dialog from '../../UI/Dialog';
import FlatButton from '../../UI/FlatButton';
import PrivateGameTemplateInformationPage from './PrivateGameTemplateInformationPage';

type Props = {|
  privateGameTemplateListingData: PrivateGameTemplateListingData,
  onOpenPurchaseDialog: () => void,
  isPurchaseDialogOpen: boolean,
  onGameTemplateOpen: PrivateGameTemplateListingData => void,
  onClose: () => void,
|};

const PrivateGameTemplateInformationDialog = ({
  privateGameTemplateListingData,
  onOpenPurchaseDialog,
  isPurchaseDialogOpen,
  onGameTemplateOpen,
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
        onOpenPurchaseDialog={onOpenPurchaseDialog}
        isPurchaseDialogOpen={isPurchaseDialogOpen}
        onGameTemplateOpen={onGameTemplateOpen}
      />
    </Dialog>
  );
};

export default PrivateGameTemplateInformationDialog;
