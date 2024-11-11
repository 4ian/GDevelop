// @flow
import { t, Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';
import * as React from 'react';
import Dialog, { DialogPrimaryButton } from '../../../UI/Dialog';
import Text from '../../../UI/Text';
import { ColumnStackLayout, LineStackLayout } from '../../../UI/Layout';
import FlatButton from '../../../UI/FlatButton';
import TextField from '../../../UI/TextField';
import AuthenticatedUserContext from '../../../Profile/AuthenticatedUserContext';
import useAlertDialog from '../../../UI/Alert/useAlertDialog';
import Paper from '../../../UI/Paper';
import { Column, Line } from '../../../UI/Grid';
import CreateProfile from '../../../Profile/CreateProfile';
import LeftLoader from '../../../UI/LeftLoader';
import { submitQuestion } from '../../../Utils/GDevelopServices/Question';
import AlertMessage from '../../../UI/AlertMessage';
import Window from '../../../Utils/Window';
import Link from '../../../UI/Link';
import SquaredInfo from '../../../UI/CustomSvgIcons/SquaredInfo';

type Props = {|
  onClose: () => void,
|};

const styles = {
  infoIcon: { width: 24, height: 24 },
};

const maxLength = 500;
const minLength = 20;

const AnyQuestionDialog = ({ onClose }: Props) => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [questionText, setQuestionText] = React.useState('');
  const [error, setError] = React.useState<?Error>(null);
  const [wasQuestionSubmitted, setWasQuestionSubmitted] = React.useState(false);
  const { showAlert } = useAlertDialog();
  const authenticatedUser = React.useContext(AuthenticatedUserContext);
  const { limits } = authenticatedUser;

  const onSubmit = React.useCallback(
    async () => {
      if (!questionText || wasQuestionSubmitted) return;

      const { profile, getAuthorizationHeader } = authenticatedUser;
      if (!profile) return;

      if (questionText.length < minLength) {
        showAlert({
          title: t`Your question is too short`,
          message: t`Your question must be at least ${minLength} characters long.`,
        });
        return;
      }

      if (
        limits &&
        limits.quotas['ask-question'] &&
        limits.quotas['ask-question'].limitReached
      ) {
        showAlert({
          title: t`You've reached your limit`,
          message: t`You've reached your limit of questions. Wait a bit and try again tomorrow, or get a subscription to unlock more questions!`,
        });
        return;
      }

      try {
        setError(null);
        setIsLoading(true);

        await submitQuestion(getAuthorizationHeader, {
          userId: profile.id,
          questionText,
        });
        setWasQuestionSubmitted(true);
      } catch (error) {
        setError(error);
      } finally {
        setIsLoading(false);
      }
    },
    [questionText, wasQuestionSubmitted, authenticatedUser, showAlert, limits]
  );

  const actions = [
    <LeftLoader isLoading={isLoading}>
      <FlatButton
        key="cancel"
        label={<Trans>Close</Trans>}
        primary={false}
        onClick={onClose}
      />
    </LeftLoader>,
    <DialogPrimaryButton
      key="send"
      label={<Trans>Send the question</Trans>}
      color="success"
      onClick={onSubmit}
      disabled={isLoading || wasQuestionSubmitted}
    />,
  ];

  return (
    <I18n>
      {({ i18n }) => (
        <Dialog
          title={<Trans>Ask any question</Trans>}
          open
          actions={actions}
          onRequestClose={onClose}
          onApply={onSubmit}
          maxWidth="sm"
        >
          <ColumnStackLayout noMargin>
            <Text size="body">
              <Trans>
                Write your question as precisely as possible. Tell where you're
                blocked or what you want to do.
              </Trans>
            </Text>
            {!authenticatedUser.authenticated && (
              <Paper background="dark" variant="outlined">
                <Line justifyContent="center">
                  <CreateProfile
                    onOpenLoginDialog={authenticatedUser.onOpenLoginDialog}
                    onOpenCreateAccountDialog={
                      authenticatedUser.onOpenCreateAccountDialog
                    }
                    message={
                      <Trans>
                        Create an account first to send your question.
                      </Trans>
                    }
                  />
                </Line>
              </Paper>
            )}
            <TextField
              value={questionText}
              multiline
              rows={3}
              floatingLabelText={<Trans>Your question</Trans>}
              onChange={(e, value) => {
                setQuestionText(value);
              }}
              fullWidth
              disabled={isLoading || wasQuestionSubmitted}
              maxLength={maxLength}
              helperMarkdownText={i18n._(
                t`**${
                  questionText.length
                }**/${maxLength} characters. You'll receive your answer by email.`
              )}
            />
            {error ? (
              <AlertMessage kind="error">
                <Trans>
                  An error happened while sending your question. Please verify
                  your internet connection or try again later.
                </Trans>
              </AlertMessage>
            ) : wasQuestionSubmitted ? (
              <AlertMessage kind="info">
                <Trans>
                  Your question has been sent! You'll receive your answer by
                  email.
                </Trans>
              </AlertMessage>
            ) : null}
            <Paper background="light" variant="outlined">
              <Column expand>
                <LineStackLayout expand alignItems="center">
                  <SquaredInfo style={styles.infoIcon} />
                  <Text size="body-small">
                    <Trans>
                      You can also ask your question on{' '}
                      <Link
                        onClick={() =>
                          Window.openExternalURL('https://forum.gdevelop.io')
                        }
                        href="#"
                      >
                        the forum
                      </Link>
                      , on{' '}
                      <Link
                        onClick={() =>
                          Window.openExternalURL('https://discord.gg/gdevelop')
                        }
                        href="#"
                      >
                        the GDevelop Discord server
                      </Link>{' '}
                      or{' '}
                      <Link
                        onClick={() =>
                          Window.openExternalURL(
                            'https://gdevelop.io/pricing/support'
                          )
                        }
                        href="#"
                      >
                        book fast professional support
                      </Link>
                      .
                    </Trans>
                  </Text>
                </LineStackLayout>
              </Column>
            </Paper>
          </ColumnStackLayout>
        </Dialog>
      )}
    </I18n>
  );
};

export default AnyQuestionDialog;
