// @flow

import * as React from 'react';
import { type I18n as I18nType } from '@lingui/core';
import { t, Trans } from '@lingui/macro';
import { type AuthenticatedUser } from '../../../Profile/AuthenticatedUserContext';
import {
  type SigningCredential,
  filterAndroidKeystoreSigningCredentials,
  signingCredentialApi,
} from '../../../Utils/GDevelopServices/Build';
import Dialog from '../../../UI/Dialog';
import FlatButton from '../../../UI/FlatButton';
import RaisedButton from '../../../UI/RaisedButton';
import { Tabs } from '../../../UI/Tabs';
import { Line } from '../../../UI/Grid';
import { ColumnStackLayout } from '../../../UI/Layout';
import Text from '../../../UI/Text';
import TextField from '../../../UI/TextField';
import PlaceholderError from '../../../UI/PlaceholderError';
import PlaceholderLoader from '../../../UI/PlaceholderLoader';
import Card from '../../../UI/Card';
import IconButton from '../../../UI/IconButton';
import ThreeDotsMenu from '../../../UI/CustomSvgIcons/ThreeDotsMenu';
import ElementWithMenu from '../../../UI/Menu/ElementWithMenu';
import AlertMessage from '../../../UI/AlertMessage';
import HelpButton from '../../../UI/HelpButton';
import useAlertDialog from '../../../UI/Alert/useAlertDialog';
import CircledInfo from '../../../UI/CustomSvgIcons/CircledInfo';
import Add from '../../../UI/CustomSvgIcons/Add';

const GENERATE_TAB = 'generate';
const UPLOAD_TAB = 'upload';

type Props = {|
  authenticatedUser: AuthenticatedUser,
  signingCredentials: Array<SigningCredential> | null,
  error: Error | null,
  onRefreshSigningCredentials: () => Promise<void>,
  onClose: () => void,
|};

export const AndroidSigningCredentialsDialog = ({
  authenticatedUser,
  signingCredentials,
  error,
  onRefreshSigningCredentials,
  onClose,
}: Props): React.Node => {
  const { showConfirmation } = useAlertDialog();
  const androidKeystores = filterAndroidKeystoreSigningCredentials(
    signingCredentials
  );

  const [currentTab, setCurrentTab] = React.useState(GENERATE_TAB);

  // Generate tab state
  const [generateName, setGenerateName] = React.useState('');
  const [generateAlias, setGenerateAlias] = React.useState('mykey');
  const [generateCommonName, setGenerateCommonName] = React.useState('');
  const [generateOrg, setGenerateOrg] = React.useState('');
  const [generateCountry, setGenerateCountry] = React.useState('');
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [generatedKeystoreBase64, setGeneratedKeystoreBase64] = React.useState<
    string | null
  >(null);
  const [generatedPassword, setGeneratedPassword] = React.useState<
    string | null
  >(null);
  const [generateError, setGenerateError] = React.useState<?Error>(null);

  // Upload tab state
  const [uploadName, setUploadName] = React.useState('');
  const [uploadAlias, setUploadAlias] = React.useState('');
  const [uploadStorePassword, setUploadStorePassword] = React.useState('');
  const [uploadKeyPassword, setUploadKeyPassword] = React.useState('');
  const [uploadKeystoreBase64, setUploadKeystoreBase64] = React.useState<
    string | null
  >(null);
  const [uploadFileName, setUploadFileName] = React.useState('');
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadError, setUploadError] = React.useState<?Error>(null);

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const userId = authenticatedUser.profile
    ? authenticatedUser.profile.id
    : null;

  const handleFileChange = (e: SyntheticInputEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setUploadFileName(file.name);
    const reader = new FileReader();
    reader.onload = evt => {
      // $FlowFixMe[incompatible-type] - FileReader event target has result
      const target = (evt.target: any);
      if (target && typeof target.result === 'string') {
        // result is a data URL like "data:...;base64,XXXX"
        const base64 = target.result.split(',')[1];
        setUploadKeystoreBase64(base64 || null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    if (!userId) return;
    setIsGenerating(true);
    setGenerateError(null);
    try {
      const result = await signingCredentialApi.createAndroidKeystore(
        authenticatedUser.getAuthorizationHeader,
        userId,
        {
          name: generateName || 'My keystore',
          keystoreAlias: generateAlias || 'mykey',
          commonName: generateCommonName || undefined,
          organizationName: generateOrg || undefined,
          countryName: generateCountry || undefined,
        }
      );
      setGeneratedKeystoreBase64(result.keystoreAsBase64);
      setGeneratedPassword(result.keystorePassword);
      await onRefreshSigningCredentials();
    } catch (err) {
      setGenerateError(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpload = async () => {
    if (!userId || !uploadKeystoreBase64) return;
    setIsUploading(true);
    setUploadError(null);
    try {
      await signingCredentialApi.uploadAndroidKeystore(
        authenticatedUser.getAuthorizationHeader,
        userId,
        {
          name: uploadName || uploadFileName || 'My keystore',
          keystoreAsBase64: uploadKeystoreBase64,
          keystoreAlias: uploadAlias,
          keystoreStorePassword: uploadStorePassword,
          keystoreKeyPassword: uploadKeyPassword || uploadStorePassword,
        }
      );
      setUploadKeystoreBase64(null);
      setUploadFileName('');
      setUploadName('');
      setUploadAlias('');
      setUploadStorePassword('');
      setUploadKeyPassword('');
      await onRefreshSigningCredentials();
    } catch (err) {
      setUploadError(err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadBackup = () => {
    if (!generatedKeystoreBase64) return;
    const byteCharacters = atob(generatedKeystoreBase64);
    const byteNumbers = new Array<number>(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${generateName || 'keystore'}.p12`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog
      title={<Trans>Android upload keystores</Trans>}
      actions={[
        <FlatButton
          key="close"
          label={<Trans>Close</Trans>}
          primary
          onClick={onClose}
        />,
      ]}
      secondaryActions={[
        <HelpButton key="help" helpPagePath="/publishing/android/play-store" />,
      ]}
      open
      onRequestClose={onClose}
      maxWidth="sm"
    >
      <ColumnStackLayout noMargin>
        {/* Existing keystores list */}
        {error ? (
          <PlaceholderError onRetry={onRefreshSigningCredentials}>
            <Trans>An error happened while loading the keystores.</Trans>
          </PlaceholderError>
        ) : !androidKeystores ? (
          <PlaceholderLoader />
        ) : androidKeystores.length > 0 ? (
          <ColumnStackLayout noMargin>
            <Text size="sub-title" noMargin>
              <Trans>Your keystores</Trans>
            </Text>
            {androidKeystores.map(keystore => (
              <Card
                key={keystore.keystoreId}
                background="medium"
                header={
                  <Text size="block-title" noMargin>
                    {keystore.name}
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
                        label: i18n._(t`Remove this keystore`),
                        click: async () => {
                          const answer = await showConfirmation({
                            level: 'warning',
                            title: t`Remove this keystore?`,
                            message: t`If you have already published an app signed with this keystore, removing it will prevent future updates unless you re-upload it. Make sure you have a backup.`,
                            confirmButtonLabel: t`Remove keystore`,
                          });
                          if (!answer) return;
                          if (!userId) return;
                          try {
                            await signingCredentialApi.deleteSigningCredential(
                              authenticatedUser.getAuthorizationHeader,
                              userId,
                              {
                                type: 'android-keystore',
                                keystoreId: keystore.keystoreId,
                              }
                            );
                            onRefreshSigningCredentials();
                          } catch (err) {
                            console.error('Unable to delete the keystore', err);
                          }
                        },
                      },
                    ]}
                  />
                }
              >
                <Line noMargin alignItems="center">
                  <CircledInfo
                    style={{ width: 20, height: 20, marginRight: 10 }}
                  />
                  <Text size="body" allowSelection>
                    <Trans>ID: {keystore.keystoreId}</Trans>
                  </Text>
                </Line>
              </Card>
            ))}
          </ColumnStackLayout>
        ) : null}

        {/* Add new keystore section */}
        <Text size="sub-title" noMargin>
          <Trans>Add a keystore</Trans>
        </Text>
        <Tabs
          value={currentTab}
          onChange={setCurrentTab}
          options={[
            {
              value: GENERATE_TAB,
              label: <Trans>Generate a new keystore</Trans>,
            },
            {
              value: UPLOAD_TAB,
              label: <Trans>Upload existing keystore</Trans>,
            },
          ]}
        />

        {currentTab === GENERATE_TAB && (
          <ColumnStackLayout noMargin>
            <AlertMessage kind="info">
              <Trans>
                GDevelop will generate a new upload keystore for you. Download
                and keep the backup file safe — you will need it if you ever
                need to re-sign your app outside of GDevelop.
              </Trans>
            </AlertMessage>
            <TextField
              floatingLabelText={<Trans>Keystore name</Trans>}
              value={generateName}
              onChange={(e, value) => setGenerateName(value)}
              hintText={t`e.g. My Game`}
              fullWidth
            />
            <TextField
              floatingLabelText={<Trans>Key alias</Trans>}
              value={generateAlias}
              onChange={(e, value) => setGenerateAlias(value)}
              hintText={t`e.g. mykey`}
              fullWidth
            />
            <TextField
              floatingLabelText={<Trans>Common name (optional)</Trans>}
              value={generateCommonName}
              onChange={(e, value) => setGenerateCommonName(value)}
              hintText={t`e.g. Your Name or Company`}
              fullWidth
            />
            <TextField
              floatingLabelText={<Trans>Organization (optional)</Trans>}
              value={generateOrg}
              onChange={(e, value) => setGenerateOrg(value)}
              fullWidth
            />
            <TextField
              floatingLabelText={<Trans>Country code (optional)</Trans>}
              value={generateCountry}
              onChange={(e, value) => setGenerateCountry(value)}
              hintText={t`e.g. US`}
              maxLength={2}
              fullWidth
            />
            {generateError && (
              <AlertMessage kind="error">
                <Trans>
                  An error occurred while generating the keystore. Please try
                  again.
                </Trans>
              </AlertMessage>
            )}
            {generatedKeystoreBase64 && generatedPassword ? (
              <ColumnStackLayout noMargin>
                <AlertMessage kind="valid">
                  <Trans>
                    Keystore generated successfully! Download the backup file
                    and note the password below. Store them securely.
                  </Trans>
                </AlertMessage>
                <Text size="body" allowSelection>
                  <Trans>Password: {generatedPassword}</Trans>
                </Text>
                <RaisedButton
                  primary
                  label={<Trans>Download backup (.p12)</Trans>}
                  onClick={handleDownloadBackup}
                />
              </ColumnStackLayout>
            ) : (
              <Line justifyContent="flex-end">
                <RaisedButton
                  primary
                  label={
                    isGenerating ? (
                      <Trans>Generating...</Trans>
                    ) : (
                      <Trans>Generate keystore</Trans>
                    )
                  }
                  onClick={handleGenerate}
                  disabled={isGenerating || !generateAlias}
                />
              </Line>
            )}
          </ColumnStackLayout>
        )}

        {currentTab === UPLOAD_TAB && (
          <ColumnStackLayout noMargin>
            <AlertMessage kind="info">
              <Trans>
                Upload your existing Android keystore (.jks or .p12). You'll
                need the alias and passwords you chose when creating it.
              </Trans>
            </AlertMessage>
            <TextField
              floatingLabelText={<Trans>Keystore name</Trans>}
              value={uploadName}
              onChange={(e, value) => setUploadName(value)}
              hintText={t`e.g. My Game keystore`}
              fullWidth
            />
            <Line noMargin>
              {/* $FlowFixMe[incompatible-type] */}
              <input
                type="file"
                accept=".jks,.p12,.pfx"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              <RaisedButton
                label={
                  uploadFileName ? (
                    <Trans>File: {uploadFileName}</Trans>
                  ) : (
                    <Trans>Choose keystore file (.jks / .p12)</Trans>
                  )
                }
                icon={<Add />}
                onClick={() => {
                  if (fileInputRef.current) fileInputRef.current.click();
                }}
              />
            </Line>
            <TextField
              floatingLabelText={<Trans>Key alias</Trans>}
              value={uploadAlias}
              onChange={(e, value) => setUploadAlias(value)}
              fullWidth
            />
            <TextField
              floatingLabelText={<Trans>Store password</Trans>}
              value={uploadStorePassword}
              onChange={(e, value) => setUploadStorePassword(value)}
              type="password"
              fullWidth
            />
            <TextField
              floatingLabelText={
                <Trans>
                  Key password (leave empty if same as store password)
                </Trans>
              }
              value={uploadKeyPassword}
              onChange={(e, value) => setUploadKeyPassword(value)}
              type="password"
              fullWidth
            />
            {uploadError && (
              <AlertMessage kind="error">
                <Trans>
                  An error occurred while uploading the keystore. Please check
                  your file and credentials and try again.
                </Trans>
              </AlertMessage>
            )}
            <Line justifyContent="flex-end">
              <RaisedButton
                primary
                label={
                  isUploading ? (
                    <Trans>Uploading...</Trans>
                  ) : (
                    <Trans>Upload keystore</Trans>
                  )
                }
                onClick={handleUpload}
                disabled={
                  isUploading ||
                  !uploadKeystoreBase64 ||
                  !uploadAlias ||
                  !uploadStorePassword
                }
              />
            </Line>
          </ColumnStackLayout>
        )}
      </ColumnStackLayout>
    </Dialog>
  );
};
