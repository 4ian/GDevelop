// @flow

import * as React from 'react';
import { type I18n as I18nType } from '@lingui/core';
import { t, Trans } from '@lingui/macro';
import { type AuthenticatedUser } from '../../../Profile/AuthenticatedUserContext';
import {
  type SigningCredential,
  filterAppleCertificateSigningCredentials,
  signingCredentialApi,
} from '../../../Utils/GDevelopServices/Build';
import PlaceholderError from '../../../UI/PlaceholderError';
import PlaceholderLoader from '../../../UI/PlaceholderLoader';
import { EmptyPlaceholder } from '../../../UI/EmptyPlaceholder';
import Card from '../../../UI/Card';
import ThreeDotsMenu from '../../../UI/CustomSvgIcons/ThreeDotsMenu';
import IconButton from '../../../UI/IconButton';
import ElementWithMenu from '../../../UI/Menu/ElementWithMenu';
import Text from '../../../UI/Text';
import { ColumnStackLayout } from '../../../UI/Layout';
import RaisedButton from '../../../UI/RaisedButton';
import Add from '../../../UI/CustomSvgIcons/Add';
import File from '../../../UI/CustomSvgIcons/File';
import AlertMessage from '../../../UI/AlertMessage';
import { List, ListItem } from '../../../UI/List';
import { Line } from '../../../UI/Grid';
import CheckCircle from '../../../UI/CustomSvgIcons/CheckCircle';
import GDevelopThemeContext from '../../../UI/Theme/GDevelopThemeContext';
import CircledInfo from '../../../UI/CustomSvgIcons/CircledInfo';
import useAlertDialog from '../../../UI/Alert/useAlertDialog';

type Props = {
  signingCredentials: Array<SigningCredential> | null,
  authenticatedUser: AuthenticatedUser,
  error: Error | null,
  onRefreshSigningCredentials: () => Promise<void>,
  onAddNew: () => void,
};

const styles = {
  bulletIcon: { width: 20, height: 20, marginRight: 10 },
};

export const AppleCertificatesList = ({
  signingCredentials,
  authenticatedUser,
  error,
  onRefreshSigningCredentials,
  onAddNew,
}: Props) => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const { showConfirmation } = useAlertDialog();

  const appleCertificateSigningCredentials = filterAppleCertificateSigningCredentials(
    signingCredentials
  );

  return (
    <ColumnStackLayout noMargin>
      {error ? (
        <PlaceholderError onRetry={onRefreshSigningCredentials}>
          <Trans>An error happened while loading the certificates.</Trans>
        </PlaceholderError>
      ) : !appleCertificateSigningCredentials ? (
        <PlaceholderLoader />
      ) : !appleCertificateSigningCredentials.length ? (
        <EmptyPlaceholder
          title={<Trans>Create your Apple certificate for iOS</Trans>}
          actionLabel={<Trans>Add</Trans>}
          onAction={onAddNew}
          description={
            <Trans>
              Create your certificate and "provisioning profile" thanks to your
              Apple Developer account. We'll guide you with a step by step
              process.
            </Trans>
          }
        />
      ) : (
        appleCertificateSigningCredentials.map(signingCredential => {
          return (
            <Card
              background="medium"
              header={
                <Text size="block-title" noMargin>
                  <Trans>{signingCredential.name}</Trans>
                </Text>
              }
              cardCornerAction={
                <ElementWithMenu
                  element={
                    <IconButton size="small">
                      <ThreeDotsMenu />
                    </IconButton>
                  }
                  buildMenuTemplate={(i18n: I18nType) => [
                    {
                      label: i18n._(t`Remove this certificate`),
                      click: async () => {
                        if (signingCredential.hasCertificateReady) {
                          const answer = await showConfirmation({
                            level: 'warning',
                            title: t`Remove this certificate?`,
                            message: t`Once removed, you'll need to generate a new certificate. Provisioning profiles will also be removed.`,
                            confirmButtonLabel: t`Remove certificate`,
                          });
                          if (!answer) return;
                        }

                        try {
                          const userId = authenticatedUser.profile
                            ? authenticatedUser.profile.id
                            : null;
                          if (!userId) {
                            return;
                          }

                          await signingCredentialApi.deleteSigningCredential(
                            authenticatedUser.getAuthorizationHeader,
                            userId,
                            {
                              type: 'apple-certificate',
                              certificateSerial:
                                signingCredential.certificateSerial,
                            }
                          );
                          onRefreshSigningCredentials();
                        } catch (err) {
                          console.error(
                            'Unable to delete the certificate',
                            err
                          );
                        }
                      },
                    },
                  ]}
                />
              }
              disabled={!signingCredential.hasCertificateReady}
            >
              <ColumnStackLayout noMargin>
                <Line noMargin alignItems="center">
                  <CircledInfo style={styles.bulletIcon} />
                  <Text size="body" allowSelection>
                    <Trans>Serial: {signingCredential.certificateSerial}</Trans>
                  </Text>
                </Line>
                {!signingCredential.hasCertificateReady ? (
                  <AlertMessage kind="error">
                    <Trans>
                      This certificate was not sent or is not ready to be used.
                    </Trans>
                  </AlertMessage>
                ) : signingCredential.kind === 'unknown' ? (
                  <AlertMessage kind="warning">
                    <Trans>
                      This certificate has an unknown type and is probably
                      unable to be used by GDevelop.
                    </Trans>
                  </AlertMessage>
                ) : (
                  <Line noMargin alignItems="center">
                    <CheckCircle
                      style={{
                        ...styles.bulletIcon,
                        color: gdevelopTheme.message.valid,
                      }}
                    />
                    <Text size="body">
                      <Trans>Certificate type: {signingCredential.kind}</Trans>
                    </Text>
                  </Line>
                )}
                {
                  <Text size="sub-title" noMargin>
                    <Trans>Provisioning profiles</Trans>
                  </Text>
                }
                {!signingCredential.provisioningProfiles.length ? (
                  <AlertMessage
                    kind="warning"
                    renderRightButton={() => (
                      <RaisedButton
                        key="add-new"
                        primary
                        icon={<Add />}
                        label={<Trans>Add new</Trans>}
                        onClick={onAddNew}
                      />
                    )}
                  >
                    <Trans>
                      There are no provisioning profile created for this
                      certificate. Create one in the Apple Developer interface
                      and add it here.
                    </Trans>
                  </AlertMessage>
                ) : (
                  <List>
                    {signingCredential.provisioningProfiles.map(
                      provisioningProfile => (
                        <ListItem
                          primaryText={provisioningProfile.name}
                          secondaryText={provisioningProfile.uuid}
                          leftIcon={<File />}
                        />
                      )
                    )}
                  </List>
                )}
              </ColumnStackLayout>
            </Card>
          );
        })
      )}
    </ColumnStackLayout>
  );
};
