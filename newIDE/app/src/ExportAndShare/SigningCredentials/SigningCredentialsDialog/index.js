// @flow

import * as React from 'react';
import Dialog from '../../../UI/Dialog';
import { Trans } from '@lingui/macro';
import { type AuthenticatedUser } from '../../../Profile/AuthenticatedUserContext';
import {
  getUserSigningCredentials,
  type SigningCredential,
} from '../../../Utils/GDevelopServices/Build';
import { CreateIosSigningCredentialsDialog } from '../CreateIosSigningCredentialsDialog';
import FlatButton from '../../../UI/FlatButton';
import RaisedButton from '../../../UI/RaisedButton';
import HelpButton from '../../../UI/HelpButton';
import Add from '../../../UI/CustomSvgIcons/Add';
import { Tabs } from '../../../UI/Tabs';
import { AppleCertificatesList } from './AppleCertificatesList';
import { AppleAuthKeysList } from './AppleAuthKeysList';

type UseGetUserSigningCredentialsOutput = {|
  signingCredentials: Array<SigningCredential> | null,
  onRefreshSigningCredentials: () => Promise<void>,
  error: Error | null,
|};

export const useGetUserSigningCredentials = (
  authenticatedUser: AuthenticatedUser
): UseGetUserSigningCredentialsOutput => {
  const [
    signingCredentials,
    setSigningCredentials,
  ] = React.useState<Array<SigningCredential> | null>(null);
  const [error, setError] = React.useState<Error | null>(null);

  const userId = authenticatedUser.profile
    ? authenticatedUser.profile.id
    : null;

  const onRefreshSigningCredentials = React.useCallback(
    async () => {
      if (!userId) return;

      try {
        setError(null);
        const signingCredentials = await getUserSigningCredentials(
          authenticatedUser.getAuthorizationHeader,
          userId
        );
        setSigningCredentials(signingCredentials);
      } catch (error) {
        console.error('Unable to load signing credentials:', error);
        setError(error);
      }
    },
    [authenticatedUser.getAuthorizationHeader, userId]
  );

  React.useEffect(
    () => {
      onRefreshSigningCredentials();
    },
    [onRefreshSigningCredentials]
  );

  return {
    signingCredentials,
    onRefreshSigningCredentials,
    error,
  };
};

type Props = {
  signingCredentials: Array<SigningCredential> | null,
  authenticatedUser: AuthenticatedUser,
  error: Error | null,
  onRefreshSigningCredentials: () => Promise<void>,
  onClose: () => void,
};

export const SigningCredentialsDialog = ({
  authenticatedUser,
  onClose,
  signingCredentials,
  error,
  onRefreshSigningCredentials,
}: Props) => {
  const [currentTab, setCurrentTab] = React.useState<string>(
    'apple-certificate'
  );
  const [
    createIosSigningCredentialsOpenWithTab,
    setCreateIosSigningCredentialsOpenWithTab,
  ] = React.useState<?string>(null);

  return (
    <Dialog
      open
      title={<Trans>Signing Credentials</Trans>}
      actions={[
        <FlatButton
          key="close"
          primary
          label={<Trans>Close</Trans>}
          onClick={onClose}
        />,
      ]}
      secondaryActions={[
        <HelpButton key="help" helpPagePath="/publishing/ios" />,
        signingCredentials && signingCredentials.length > 0 ? (
          <RaisedButton
            key="add-new"
            primary
            icon={<Add />}
            label={<Trans>Add new</Trans>}
            onClick={() =>
              setCreateIosSigningCredentialsOpenWithTab(currentTab)
            }
          />
        ) : null,
      ]}
      fixedContent={
        <Tabs
          value={currentTab}
          onChange={setCurrentTab}
          options={[
            {
              value: 'apple-certificate',
              label: <Trans>Apple Certificates & Profiles</Trans>,
            },
            {
              value: 'apple-auth-key',
              label: <Trans>Auth Key (App Store upload)</Trans>,
            },
          ]}
        />
      }
      onRequestClose={onClose}
    >
      {currentTab === 'apple-certificate' && (
        <AppleCertificatesList
          authenticatedUser={authenticatedUser}
          signingCredentials={signingCredentials}
          error={error}
          onRefreshSigningCredentials={onRefreshSigningCredentials}
          onAddNew={() => setCreateIosSigningCredentialsOpenWithTab(currentTab)}
        />
      )}
      {currentTab === 'apple-auth-key' && (
        <AppleAuthKeysList
          authenticatedUser={authenticatedUser}
          signingCredentials={signingCredentials}
          error={error}
          onRefreshSigningCredentials={onRefreshSigningCredentials}
          onAddNew={() => setCreateIosSigningCredentialsOpenWithTab(currentTab)}
        />
      )}
      {createIosSigningCredentialsOpenWithTab && (
        <CreateIosSigningCredentialsDialog
          authenticatedUser={authenticatedUser}
          initialTab={createIosSigningCredentialsOpenWithTab}
          onClose={() => {
            setCreateIosSigningCredentialsOpenWithTab(null);
            onRefreshSigningCredentials();
          }}
        />
      )}
    </Dialog>
  );
};
