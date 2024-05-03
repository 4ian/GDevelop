// @flow
import * as React from 'react';
import { Trans, t } from '@lingui/macro';
import Text from '../../../UI/Text';
import { ColumnStackLayout, LineStackLayout } from '../../../UI/Layout';
import RaisedButton from '../../../UI/RaisedButton';
import { Column, Line } from '../../../UI/Grid';
import LeftLoader from '../../../UI/LeftLoader';
import { openBlobDownloadUrl } from '../../../Utils/BlobDownloadUrlHolder';
import Paper from '../../../UI/Paper';
import AlertMessage from '../../../UI/AlertMessage';
import { MarkdownText } from '../../../UI/MarkdownText';
import FlatButton from '../../../UI/FlatButton';
import Window from '../../../Utils/Window';
import Apple from '../../../UI/CustomSvgIcons/Apple';
import GDevelopThemeContext from '../../../UI/Theme/GDevelopThemeContext';
import useAlertDialog from '../../../UI/Alert/useAlertDialog';
import { type AuthenticatedUser } from '../../../Profile/AuthenticatedUserContext';
import { signingCredentialApi } from '../../../Utils/GDevelopServices/Build';
import SemiControlledTextField from '../../../UI/SemiControlledTextField';

export const getBase64FromFile = async (file: File) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string')
        throw new Error('Unexpected result when reading file.');

      const base64String = reader.result.split(',')[1];
      if (!base64String) {
        reject(new Error('Could not read base64 content from the file.'));
        return;
      }
      resolve(base64String);
    };
    reader.onerror = error => {
      reject(error);
    };
    reader.readAsDataURL(file);
  });
};

const styles = {
  appleIcon: {
    width: 32,
    height: 32,
  },
};

type Props = {
  authenticatedUser: AuthenticatedUser,
};

export const CreateIosCertificateSteps = ({ authenticatedUser }: Props) => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const { showConfirmation } = useAlertDialog();
  const userId = authenticatedUser.profile
    ? authenticatedUser.profile.id
    : null;

  const [commonName, setCommonName] = React.useState('');
  const [countryName, setCountryName] = React.useState('');
  const [certificateRequestUuid, setCertificateRequestUuid] = React.useState(
    ''
  );
  const [csrPem, setCsrPem] = React.useState('');
  const [
    isCertificateSigningRequestLoading,
    setIsCertificateSigningRequestLoading,
  ] = React.useState(false);
  const [
    certificateSigningRequestError,
    setCertificateSigningRequestError,
  ] = React.useState<?Error>(null);

  const onCreateSigningRequest = React.useCallback(
    async () => {
      if (!userId) return;

      try {
        setIsCertificateSigningRequestLoading(true);
        setCertificateSigningRequestError(null);
        const {
          certificateRequestUuid,
          csrPem,
        } = await signingCredentialApi.createCertificateSigningRequest(
          authenticatedUser.getAuthorizationHeader,
          userId,
          {
            commonName: commonName || 'Unspecified',
            countryName: countryName || 'US',
          }
        );
        setCertificateRequestUuid(certificateRequestUuid);
        setCsrPem(csrPem);
      } catch (error) {
        console.error(
          'Error while creating certificate signing request:',
          error
        );
        setCertificateSigningRequestError(error);
      } finally {
        setIsCertificateSigningRequestLoading(false);
      }
    },
    [authenticatedUser.getAuthorizationHeader, userId, commonName, countryName]
  );

  const [wasCertificateGenerated, setWasCertificateGenerated] = React.useState(
    false
  );
  const [certificateError, setCertificateError] = React.useState<?Error>(null);
  const [isCertificateLoading, setIsCertificateLoading] = React.useState(false);
  const [
    lastUploadedProvisioningProfileName,
    setLastUploadedProvisioningProfileName,
  ] = React.useState('');

  const [
    mobileProvisionError,
    setMobileProvisionError,
  ] = React.useState<?Error>(null);
  const [
    isMobileProvisionLoading,
    setIsMobileProvisionLoading,
  ] = React.useState(false);

  const onUploadCertificate = React.useCallback(
    async (certificateFile: File) => {
      if (!userId) return;

      try {
        setWasCertificateGenerated(false);
        setIsCertificateLoading(true);

        const certificateAsBase64 = await getBase64FromFile(certificateFile);
        const {
          certificateSerial,
          certificateKind,
        } = await signingCredentialApi.uploadCertificate(
          authenticatedUser.getAuthorizationHeader,
          userId,
          {
            certificateAsBase64,
          }
        );
        if (certificateKind === 'unknown') {
          const answer = await showConfirmation({
            title: t`Unknown certificate type`,
            message: t`This certificate type is unknown and might not work when building the app. Are you sure you want to continue?`,
            level: 'warning',
            confirmButtonLabel: t`Continue`,
            dismissButtonLabel: t`Cancel`,
          });
          if (!answer) return;
        }
        await signingCredentialApi.createCertificateP12(
          authenticatedUser.getAuthorizationHeader,
          userId,
          {
            certificateSerial,
            certificateKind,
            certificateRequestUuid,
          }
        );

        setWasCertificateGenerated(true);
      } catch (err) {
        setCertificateError(err);
      } finally {
        setIsCertificateLoading(false);
      }
    },
    [
      authenticatedUser.getAuthorizationHeader,
      certificateRequestUuid,
      showConfirmation,
      userId,
    ]
  );

  const onUploadMobileProvision = React.useCallback(
    async (mobileProvisionFile: File) => {
      if (!userId) return;

      try {
        setLastUploadedProvisioningProfileName('');
        setIsMobileProvisionLoading(true);

        const mobileProvisionAsBase64 = await getBase64FromFile(
          mobileProvisionFile
        );
        const { name } = await signingCredentialApi.uploadMobileProvision(
          authenticatedUser.getAuthorizationHeader,
          userId,
          {
            mobileProvisionAsBase64,
          }
        );
        setLastUploadedProvisioningProfileName(name);
      } catch (err) {
        setMobileProvisionError(err);
      } finally {
        setIsMobileProvisionLoading(false);
      }
    },
    [authenticatedUser.getAuthorizationHeader, userId]
  );

  return (
    <ColumnStackLayout noMargin>
      <AlertMessage
        kind="info"
        renderLeftIcon={() => <Apple style={styles.appleIcon} />}
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
          You need a Apple Developer account to create a certificate.
        </Trans>
      </AlertMessage>
      <Text size="block-title">
        <Trans>1) Create a Certificate Signing Request and a Certificate</Trans>
      </Text>
      <MarkdownText
        isStandaloneText
        allowParagraphs
        translatableSource={t`Create a certificate signing request that will be asked by Apple to generate a full certificate.`}
      />

      <LineStackLayout noMargin>
        <SemiControlledTextField
          fullWidth
          floatingLabelText={<Trans>Company name or full name</Trans>}
          value={commonName}
          onChange={text => setCommonName(text)}
          maxLength={64}
        />
        <SemiControlledTextField
          fullWidth
          floatingLabelText={<Trans>Country name</Trans>}
          value={countryName}
          onChange={text => setCountryName(text)}
          maxLength={64}
        />
      </LineStackLayout>

      <LineStackLayout noMargin justifyContent="flex-end">
        <LeftLoader isLoading={isCertificateSigningRequestLoading}>
          <RaisedButton
            primary={!certificateRequestUuid}
            disabled={isCertificateSigningRequestLoading}
            label={<Trans>Create a signing request</Trans>}
            onClick={onCreateSigningRequest}
          />
        </LeftLoader>
        <RaisedButton
          primary={!!certificateRequestUuid && !wasCertificateGenerated}
          disabled={!csrPem}
          onClick={() =>
            openBlobDownloadUrl(
              'data:text/plain;charset=utf-8,' + encodeURIComponent(csrPem),
              'request.csr'
            )
          }
          label={<Trans>Download the request file</Trans>}
        />
      </LineStackLayout>

      {certificateSigningRequestError && (
        <AlertMessage kind="error">
          An error occured while generating the Certificate Signing Request.
        </AlertMessage>
      )}

      <Text size="block-title">
        <Trans>2) Upload the Certificate generated by Apple</Trans>
      </Text>
      <MarkdownText
        isStandaloneText
        allowParagraphs
        translatableSource={t`Go to [Apple Developer Certificates list](https://developer.apple.com/account/resources/certificates/list) and click on the + button. Choose **Apple Distribution** (for app store) or **Apple Development** (for testing on device). When requested, upload the request file you downloaded.`}
      />
      <MarkdownText
        isStandaloneText
        allowParagraphs
        translatableSource={t`Download the certificate file (.cer) generated by Apple and upload it here. GDevelop will keep it securely stored.`}
      />

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
              disabled={!certificateRequestUuid || isCertificateLoading}
              onChange={event => {
                const file = event.currentTarget.files[0] || null;
                setCertificateError(null);
                if (file) onUploadCertificate(file);
              }}
            />
          </Column>
        </Line>
      </Paper>

      {certificateError && (
        <AlertMessage kind="error">
          <Trans>An error occured while generating the certificate.</Trans>
        </AlertMessage>
      )}
      {wasCertificateGenerated && (
        <AlertMessage kind="valid">
          <Trans>
            The certificate was properly generated. Don't forget to create and
            upload a provisioning profile associated to it.
          </Trans>
        </AlertMessage>
      )}

      <Text size="block-title">
        <Trans>3) Upload one or more Mobile Provisioning Profiles</Trans>
      </Text>
      <MarkdownText
        isStandaloneText
        allowParagraphs
        translatableSource={t`Go to [Apple Developer Profiles list](https://developer.apple.com/account/resources/profiles/list) and click on the + button. Choose **App Store Connect** or **iOS App Development**. Then, choose *Xcode iOS Wildcard App ID*, then the certificate you created earlier. For development, you can choose [the devices you registered](https://developer.apple.com/help/account/register-devices/register-a-single-device/). Finish by downloading the generated file and upload it here so it can be stored securely by GDevelop.`}
      />

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
              disabled={isMobileProvisionLoading}
              onChange={event => {
                const file = event.currentTarget.files[0] || null;
                setMobileProvisionError(null);
                if (file) onUploadMobileProvision(file);
              }}
            />
          </Column>
        </Line>
      </Paper>

      {mobileProvisionError && (
        <AlertMessage kind="error">
          <Trans>
            An error occured while storing the provisioning profile.
          </Trans>
        </AlertMessage>
      )}
      {lastUploadedProvisioningProfileName && (
        <AlertMessage kind="valid">
          <Trans>
            The provisioning profile was properly stored (
            {lastUploadedProvisioningProfileName}). If you properly uploaded the
            certificate before, it can now be used.
          </Trans>
        </AlertMessage>
      )}
    </ColumnStackLayout>
  );
};
