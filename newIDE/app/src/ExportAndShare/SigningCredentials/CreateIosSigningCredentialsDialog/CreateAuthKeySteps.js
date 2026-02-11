// @flow
import * as React from 'react';
import { Trans, t } from '@lingui/macro';
import { ColumnStackLayout, LineStackLayout } from '../../../UI/Layout';
import { Column, Line } from '../../../UI/Grid';
import Paper from '../../../UI/Paper';
import AlertMessage from '../../../UI/AlertMessage';
import { MarkdownText } from '../../../UI/MarkdownText';
import FlatButton from '../../../UI/FlatButton';
import Window from '../../../Utils/Window';
import Apple from '../../../UI/CustomSvgIcons/Apple';
import GDevelopThemeContext from '../../../UI/Theme/GDevelopThemeContext';
import { type AuthenticatedUser } from '../../../Profile/AuthenticatedUserContext';
import { signingCredentialApi } from '../../../Utils/GDevelopServices/Build';
import SemiControlledTextField from '../../../UI/SemiControlledTextField';
import LeftLoader from '../../../UI/LeftLoader';
import RaisedButton from '../../../UI/RaisedButton';
import { getBase64FromFile } from './CreateIosCertificateSteps';

type Props = {
  authenticatedUser: AuthenticatedUser,
};

export const CreateAuthKeySteps = ({ authenticatedUser }: Props) => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const userId = authenticatedUser.profile
    ? authenticatedUser.profile.id
    : null;

  const [authKeyFile, setAuthKeyFile] = React.useState<?File>(null);
  const [name, setName] = React.useState('');
  const [apiKey, setApiKey] = React.useState('');
  const [apiIssuer, setApiIssuer] = React.useState('');

  const [lastUploadedApiKey, setLastUploadedApiKey] = React.useState<?string>(
    null
  );
  const [isAuthKeyLoading, setIsAuthKeyLoading] = React.useState(false);
  const [authKeyError, setAuthKeyError] = React.useState<?Error>(null);

  const onUploadAuthKey = React.useCallback(
    async () => {
      if (!userId || !authKeyFile) return;

      try {
        setIsAuthKeyLoading(true);
        setLastUploadedApiKey(null);
        setAuthKeyError(null);
        const appleAuthKeyP8AsBase64 = await getBase64FromFile(authKeyFile);
        await signingCredentialApi.uploadAuthKey(
          authenticatedUser.getAuthorizationHeader,
          userId,
          {
            name,
            appleAuthKeyP8AsBase64,
            appleApiKey: apiKey,
            appleApiIssuer: apiIssuer,
          }
        );
        setLastUploadedApiKey(apiKey);
      } catch (err) {
        setAuthKeyError(err);
      } finally {
        setIsAuthKeyLoading(false);
      }
    },
    [
      apiIssuer,
      apiKey,
      authKeyFile,
      name,
      authenticatedUser.getAuthorizationHeader,
      userId,
    ]
  );

  return (
    <ColumnStackLayout noMargin>
      <AlertMessage
        kind="info"
        renderLeftIcon={() => (
          <Apple
            style={{
              width: 32,
              height: 32,
            }}
          />
        )}
        renderRightButton={() => (
          <FlatButton
            label={<Trans>Open Apple Developer</Trans>}
            onClick={() =>
              Window.openExternalURL('https://developer.apple.com/account')
            }
          />
        )}
      >
        <Trans>
          You need a Apple Developer account to create an API key that will
          automatically publish your app.
        </Trans>
      </AlertMessage>
      <MarkdownText
        isStandaloneText
        allowParagraphs
        translatableSource={t`Create an API key on the [App Store Connect API page](https://appstoreconnect.apple.com/access/integrations/api). Give it a name and **administrator** rights. Download the "Auth Key" file and upload it here along with the required information you can find on the page.`}
      />

      <SemiControlledTextField
        floatingLabelText={<Trans>Name (optional)</Trans>}
        value={name}
        onChange={setName}
        fullWidth
      />
      <LineStackLayout>
        <SemiControlledTextField
          floatingLabelText={<Trans>API key given by Apple</Trans>}
          hintText="XXXXXXXXXX"
          value={apiKey}
          onChange={setApiKey}
          fullWidth
        />
        <SemiControlledTextField
          floatingLabelText={<Trans>API Issuer given by Apple</Trans>}
          hintText="XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX"
          value={apiIssuer}
          onChange={setApiIssuer}
          fullWidth
        />
      </LineStackLayout>
      {/* // TODO: factor in a UI component ? */}
      <Paper variant="outlined" background="medium">
        <Line expand>
          <Column expand>
            <input
              accept={['*/*']}
              style={{
                color: gdevelopTheme.text.color.primary,
              }}
              multiple={false}
              type="file"
              disabled={!apiKey || !apiIssuer || isAuthKeyLoading}
              onChange={event => {
                setAuthKeyFile(event.currentTarget.files[0] || null);
              }}
            />
          </Column>
        </Line>
      </Paper>
      <Line noMargin justifyContent="flex-end">
        <LeftLoader isLoading={isAuthKeyLoading}>
          <RaisedButton
            primary
            disabled={isAuthKeyLoading || !authKeyFile || !apiIssuer || !apiKey}
            onClick={() => {
              onUploadAuthKey();
            }}
            label={<Trans>Send the Auth Key</Trans>}
          />
        </LeftLoader>
      </Line>

      {authKeyError && (
        <AlertMessage kind="error">
          <Trans>An error occured while storing the auth key.</Trans>
        </AlertMessage>
      )}
      {lastUploadedApiKey && (
        <AlertMessage kind="valid">
          <Trans>
            The auth key {lastUploadedApiKey} was properly stored. It can now be
            used to automatically upload your app to the app store - verify
            you've declared an app for it.
          </Trans>
        </AlertMessage>
      )}
    </ColumnStackLayout>
  );
};
