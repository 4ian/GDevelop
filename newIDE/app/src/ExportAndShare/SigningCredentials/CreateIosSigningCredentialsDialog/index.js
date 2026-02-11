// @flow

import * as React from 'react';
import Dialog from '../../../UI/Dialog';
import { Trans } from '@lingui/macro';
import { type AuthenticatedUser } from '../../../Profile/AuthenticatedUserContext';
import FlatButton from '../../../UI/FlatButton';
import { CreateIosCertificateSteps } from './CreateIosCertificateSteps';
import { Tabs } from '../../../UI/Tabs';
import { CreateAuthKeySteps } from './CreateAuthKeySteps';

type Props = {
  authenticatedUser: AuthenticatedUser,
  onClose: () => void,
  initialTab: string,
};

export const CreateIosSigningCredentialsDialog = ({
  onClose,
  initialTab,
  authenticatedUser,
}: Props) => {
  const [currentTab, setCurrentTab] = React.useState<string>(initialTab);

  return (
    <Dialog
      open
      title={<Trans>Create iOS certificate</Trans>}
      flexColumnBody
      maxWidth="md"
      actions={[
        <FlatButton
          key="close"
          primary
          label={<Trans>Close</Trans>}
          onClick={onClose}
        />,
      ]}
      fixedContent={
        <Tabs
          value={currentTab}
          onChange={setCurrentTab}
          options={[
            {
              value: 'apple-certificate',
              label: <Trans>New Apple Certificate/Profile</Trans>,
            },
            {
              value: 'apple-auth-key',
              label: <Trans>New Auth Key (App Store upload)</Trans>,
            },
          ]}
        />
      }
      onRequestClose={onClose}
    >
      {currentTab === 'apple-certificate' && (
        <CreateIosCertificateSteps authenticatedUser={authenticatedUser} />
      )}
      {currentTab === 'apple-auth-key' && (
        <CreateAuthKeySteps authenticatedUser={authenticatedUser} />
      )}
    </Dialog>
  );
};
