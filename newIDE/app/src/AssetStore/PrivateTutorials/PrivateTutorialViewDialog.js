// @flow
import * as React from 'react';
import { I18n } from '@lingui/react';
import { Trans } from '@lingui/macro';
import {
  canAccessTutorial,
  type Tutorial,
} from '../../Utils/GDevelopServices/Tutorial';
import Dialog from '../../UI/Dialog';
import FlatButton from '../../UI/FlatButton';
import { selectMessageByLocale } from '../../Utils/i18n/MessageByLocale';
import Text from '../../UI/Text';
import AuthenticatedUserContext from '../../Profile/AuthenticatedUserContext';
import { ColumnStackLayout } from '../../UI/Layout';
import { Line } from '../../UI/Grid';
import RaisedButton from '../../UI/RaisedButton';
import Window from '../../Utils/Window';
import AlertMessage from '../../UI/AlertMessage';
import {
  type PrivatePdfTutorial,
  getPrivatePdfTutorial,
} from '../../Utils/GDevelopServices/Asset';
import PlaceholderError from '../../UI/PlaceholderError';
import PlaceholderLoader from '../../UI/PlaceholderLoader';
import { sendTutorialOpened } from '../../Utils/Analytics/EventSender';
import Download from '../../UI/CustomSvgIcons/Download';
import LockOpen from '../../UI/CustomSvgIcons/LockOpen';

type Props = {|
  tutorial: Tutorial,
  onClose: () => void,
|};

export const PrivateTutorialViewDialog = ({ tutorial, onClose }: Props) => {
  const { limits, getAuthorizationHeader, profile } = React.useContext(
    AuthenticatedUserContext
  );
  const [error, setError] = React.useState<Error | null>(null);
  const [
    pdfTutorial,
    setPdfTutorial,
  ] = React.useState<PrivatePdfTutorial | null>(null);
  const isLocked = !canAccessTutorial(
    tutorial,
    limits ? limits.capabilities : null
  );

  const fetchTutorial = React.useCallback(
    async () => {
      if (!profile) return;
      if (!tutorial.isPrivateTutorial || tutorial.type !== 'pdf-tutorial') {
        console.error(
          'PrivateTutorialViewDialog is used for an unsupported tutorial type.'
        );
      }

      setError(null);
      try {
        const pdfTutorial = await getPrivatePdfTutorial(
          getAuthorizationHeader,
          {
            userId: profile.id,
            tutorialId: tutorial.id,
          }
        );
        setPdfTutorial(pdfTutorial);
      } catch (error) {
        console.error(
          'An error occurred while fetching the PDF tutorial:',
          error
        );
        setError(error);
      }
    },
    [getAuthorizationHeader, profile, tutorial]
  );

  React.useEffect(
    () => {
      fetchTutorial();
    },
    [fetchTutorial]
  );

  return (
    <I18n>
      {({ i18n }) => (
        <Dialog
          title={selectMessageByLocale(i18n, tutorial.titleByLocale)}
          open
          maxWidth="md"
          actions={[
            <FlatButton
              key="close"
              label={<Trans>Close</Trans>}
              primary={false}
              onClick={onClose}
            />,
          ]}
          flexColumnBody
        >
          <ColumnStackLayout noMargin expand>
            <Text>
              {selectMessageByLocale(i18n, tutorial.descriptionByLocale)}
            </Text>
            {isLocked ? (
              <ColumnStackLayout noMargin>
                {tutorial.redeemLinkByLocale && (
                  <Line noMargin justifyContent="center" alignItems="center">
                    <RaisedButton
                      icon={<LockOpen />}
                      label={<Trans>Get access</Trans>}
                      primary={true}
                      onClick={() => {
                        if (!tutorial.redeemLinkByLocale) return;

                        Window.openExternalURL(
                          selectMessageByLocale(
                            i18n,
                            tutorial.redeemLinkByLocale
                          )
                        );
                      }}
                    />
                  </Line>
                )}
                <AlertMessage kind="info">
                  {tutorial.redeemHintByLocale ? (
                    selectMessageByLocale(i18n, tutorial.redeemHintByLocale)
                  ) : (
                    <Trans>
                      This tutorial must be unlocked to be accessed.
                    </Trans>
                  )}
                </AlertMessage>
              </ColumnStackLayout>
            ) : pdfTutorial ? (
              <ColumnStackLayout noMargin>
                <Line noMargin justifyContent="center" alignItems="center">
                  <RaisedButton
                    icon={<Download />}
                    label={<Trans>Download</Trans>}
                    primary={true}
                    onClick={() => {
                      sendTutorialOpened(tutorial.id);
                      Window.openExternalURL(pdfTutorial.downloadUrl);
                    }}
                  />
                </Line>
                <AlertMessage kind="info">
                  <Trans>
                    Remember that your access to this resource is exclusive to
                    your account.
                  </Trans>
                </AlertMessage>
              </ColumnStackLayout>
            ) : error ? (
              <PlaceholderError onRetry={fetchTutorial}>
                <Trans>
                  Unable to load the tutorial. Please try again later or contact
                  us if the problem persists.
                </Trans>
              </PlaceholderError>
            ) : (
              <PlaceholderLoader />
            )}
          </ColumnStackLayout>
        </Dialog>
      )}
    </I18n>
  );
};
