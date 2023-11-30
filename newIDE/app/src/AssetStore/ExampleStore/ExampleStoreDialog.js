// @flow
import { Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';
import * as React from 'react';
import { ExampleStore } from '../../AssetStore/ExampleStore';
import Dialog, { DialogPrimaryButton } from '../../UI/Dialog';
import FlatButton from '../../UI/FlatButton';
import { type ExampleShortHeader } from '../../Utils/GDevelopServices/Example';
import { type PrivateGameTemplateListingData } from '../../Utils/GDevelopServices/Shop';

export type ExampleStoreDialogProps = {|
  open: boolean,
  onClose: () => void,
  selectedExampleShortHeader: ?ExampleShortHeader,
  selectedPrivateGameTemplateListingData: ?PrivateGameTemplateListingData,
  onSelectExampleShortHeader: (exampleShortHeader: ?ExampleShortHeader) => void,
  onSelectPrivateGameTemplateListingData: (
    privateGameTemplateListingData: ?PrivateGameTemplateListingData
  ) => void,
  onOpenNewProjectSetupDialog: () => void,
  isProjectOpening: boolean,
|};

const ExampleStoreDialog = ({
  open,
  onClose,
  selectedExampleShortHeader,
  selectedPrivateGameTemplateListingData,
  onSelectExampleShortHeader,
  onSelectPrivateGameTemplateListingData,
  onOpenNewProjectSetupDialog,
  isProjectOpening,
}: ExampleStoreDialogProps) => {
  const actions = React.useMemo(
    () => [
      <FlatButton
        key="close"
        label={<Trans>Close</Trans>}
        primary={false}
        onClick={onClose}
      />,
      <DialogPrimaryButton
        key="create-blank"
        id="create-blank-project-button"
        label={<Trans>Create a blank project</Trans>}
        primary
        onClick={onOpenNewProjectSetupDialog}
      />,
    ],
    [onClose, onOpenNewProjectSetupDialog]
  );

  if (!open) return null;

  return (
    <I18n>
      {({ i18n }) => (
        <Dialog
          title={<Trans>Create a new project</Trans>}
          actions={actions}
          onRequestClose={onClose}
          onApply={onOpenNewProjectSetupDialog}
          open={open}
          fullHeight
          flexColumnBody
        >
          <ExampleStore
            focusOnMount
            isOpening={isProjectOpening}
            onOpenNewProjectSetupDialog={onOpenNewProjectSetupDialog}
            onSelectExampleShortHeader={onSelectExampleShortHeader}
            onSelectPrivateGameTemplateListingData={
              onSelectPrivateGameTemplateListingData
            }
            selectedExampleShortHeader={selectedExampleShortHeader}
            selectedPrivateGameTemplateListingData={
              selectedPrivateGameTemplateListingData
            }
          />
        </Dialog>
      )}
    </I18n>
  );
};

export default ExampleStoreDialog;
