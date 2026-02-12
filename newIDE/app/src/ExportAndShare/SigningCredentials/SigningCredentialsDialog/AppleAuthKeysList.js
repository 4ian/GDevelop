// @flow

import * as React from 'react';
import { type I18n as I18nType } from '@lingui/core';
import { t, Trans } from '@lingui/macro';
import { type AuthenticatedUser } from '../../../Profile/AuthenticatedUserContext';
import {
  type SigningCredential,
  filterAppleAuthKeySigningCredentials,
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
import AlertMessage from '../../../UI/AlertMessage';
import { Line } from '../../../UI/Grid';
import CircledInfo from '../../../UI/CustomSvgIcons/CircledInfo';

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

export const AppleAuthKeysList = ({
  signingCredentials,
  authenticatedUser,
  error,
  onRefreshSigningCredentials,
  onAddNew,
}: Props) => {
  const appleAuthKeySigningCredentials = filterAppleAuthKeySigningCredentials(
    signingCredentials
  );

  return (
    <ColumnStackLayout noMargin>
      {error ? (
        <PlaceholderError onRetry={onRefreshSigningCredentials}>
          <Trans>An error happened while loading the certificates.</Trans>
        </PlaceholderError>
      ) : !appleAuthKeySigningCredentials ? (
        <PlaceholderLoader />
      ) : !appleAuthKeySigningCredentials.length ? (
        <EmptyPlaceholder
          title={
            <Trans>
              Create your Auth Key to send your game to App Store Connect
            </Trans>
          }
          actionLabel={<Trans>Add</Trans>}
          onAction={onAddNew}
          description={
            <Trans>
              Declare your app on App Store Connect and then register a key so
              that your game can be automatically uploaded when built. It's
              perfect to try your game with testers on Apple TestFlight.
            </Trans>
          }
        />
      ) : (
        appleAuthKeySigningCredentials.map(signingCredential => {
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
                      label: i18n._(t`Remove this Auth Key`),
                      click: async () => {
                        const userId = authenticatedUser.profile
                          ? authenticatedUser.profile.id
                          : null;
                        if (!userId) {
                          return;
                        }

                        try {
                          await signingCredentialApi.deleteSigningCredential(
                            authenticatedUser.getAuthorizationHeader,
                            userId,
                            {
                              type: 'apple-auth-key',
                              appleApiKey: signingCredential.apiKey,
                            }
                          );
                          onRefreshSigningCredentials();
                        } catch (err) {
                          console.error('Unable to delete the auth key', err);
                        }
                      },
                    },
                  ]}
                />
              }
              disabled={!signingCredential.hasAuthKeyReady}
            >
              <ColumnStackLayout noMargin>
                <Line noMargin alignItems="center">
                  <CircledInfo style={styles.bulletIcon} />
                  <Text size="body" allowSelection>
                    <Trans>API key: {signingCredential.apiKey}</Trans>
                  </Text>
                </Line>
                <Line noMargin alignItems="center">
                  <CircledInfo style={styles.bulletIcon} />
                  <Text size="body" allowSelection>
                    <Trans>API Issuer ID: {signingCredential.apiIssuer}</Trans>
                  </Text>
                </Line>
                {!signingCredential.hasAuthKeyReady && (
                  <AlertMessage kind="error">
                    <Trans>
                      This Auth Key was not sent or is not ready to be used.
                    </Trans>
                  </AlertMessage>
                )}
              </ColumnStackLayout>
            </Card>
          );
        })
      )}
    </ColumnStackLayout>
  );
};
