// @flow

import * as React from 'react';
import { Trans, t } from '@lingui/macro';
import { type AuthenticatedUser } from '../../Profile/AuthenticatedUserContext';
import {
  type BuildSigningOptions,
  type AndroidKeystoreSigningCredential,
  filterAndroidKeystoreSigningCredentials,
} from '../../Utils/GDevelopServices/Build';
import SelectField from '../../UI/SelectField';
import SelectOption from '../../UI/SelectOption';
import { LineStackLayout } from '../../UI/Layout';
import FlatButton from '../../UI/FlatButton';
import RaisedButton from '../../UI/RaisedButton';
import { useGetUserSigningCredentials } from './SigningCredentialsDialog';
import { AndroidSigningCredentialsDialog } from './AndroidSigningCredentialsDialog';

const styles = {
  button: { flexShrink: 0 },
};

const getDefaultOrValidKeystoreId = (
  buildSigningOptions: BuildSigningOptions | null,
  keystores: Array<AndroidKeystoreSigningCredential> | null
): string | null => {
  if (!keystores || keystores.length === 0) return null;

  if (
    buildSigningOptions &&
    buildSigningOptions.androidKeystoreId &&
    keystores.find(k => k.keystoreId === buildSigningOptions.androidKeystoreId)
  ) {
    return buildSigningOptions.androidKeystoreId || null;
  }

  return keystores[0].keystoreId;
};

type Props = {|
  authenticatedUser: AuthenticatedUser,
  buildSigningOptions: BuildSigningOptions | null,
  onSelectBuildSigningOptions: (BuildSigningOptions | null) => void,
  disabled?: boolean,
|};

export const AndroidSigningCredentialsSelector = ({
  authenticatedUser,
  buildSigningOptions,
  onSelectBuildSigningOptions,
  disabled,
}: Props): React.Node => {
  const {
    signingCredentials,
    error,
    onRefreshSigningCredentials,
  } = useGetUserSigningCredentials(authenticatedUser);

  const androidKeystores = filterAndroidKeystoreSigningCredentials(
    signingCredentials
  );

  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  React.useEffect(
    () => {
      const validKeystoreId = getDefaultOrValidKeystoreId(
        buildSigningOptions,
        androidKeystores
      );
      if (
        validKeystoreId &&
        validKeystoreId !==
          (buildSigningOptions && buildSigningOptions.androidKeystoreId)
      ) {
        onSelectBuildSigningOptions({
          ...buildSigningOptions,
          keystore: 'custom',
          androidKeystoreId: validKeystoreId,
        });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [signingCredentials]
  );

  return (
    <LineStackLayout noMargin expand alignItems="end">
      <SelectField
        fullWidth
        floatingLabelText={<Trans>Upload key</Trans>}
        value={
          buildSigningOptions && buildSigningOptions.androidKeystoreId
            ? buildSigningOptions.androidKeystoreId
            : ''
        }
        onChange={(e, i, value: string) => {
          onSelectBuildSigningOptions({
            ...buildSigningOptions,
            keystore: 'custom',
            androidKeystoreId: value,
          });
        }}
        translatableHintText={
          androidKeystores
            ? androidKeystores.length > 0
              ? t`Choose a keystore`
              : t`Add a keystore first`
            : t`Loading...`
        }
        disabled={disabled}
      >
        {androidKeystores ? (
          androidKeystores.map(keystore => (
            <SelectOption
              key={keystore.keystoreId}
              disabled={!keystore.hasKeystoreReady}
              label={keystore.name}
              value={keystore.keystoreId}
            />
          ))
        ) : (
          <SelectOption
            disabled
            label={error ? t`Error loading keystores.` : t`Loading...`}
            value=""
          />
        )}
      </SelectField>
      {androidKeystores && androidKeystores.length > 0 ? (
        <FlatButton
          // $FlowFixMe[incompatible-type]
          style={styles.button}
          label={<Trans>Add or edit</Trans>}
          onClick={() => setIsDialogOpen(true)}
          disabled={disabled}
        />
      ) : (
        <RaisedButton
          primary
          // $FlowFixMe[incompatible-type]
          style={styles.button}
          label={<Trans>Add new</Trans>}
          onClick={() => setIsDialogOpen(true)}
          disabled={disabled}
        />
      )}
      {isDialogOpen && (
        <AndroidSigningCredentialsDialog
          authenticatedUser={authenticatedUser}
          signingCredentials={signingCredentials}
          error={error}
          onRefreshSigningCredentials={onRefreshSigningCredentials}
          onClose={() => {
            setIsDialogOpen(false);
            onRefreshSigningCredentials();
          }}
        />
      )}
    </LineStackLayout>
  );
};
