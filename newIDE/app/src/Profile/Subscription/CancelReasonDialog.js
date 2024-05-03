// @flow
import { Trans, t } from '@lingui/macro';
import { I18n } from '@lingui/react';
import * as React from 'react';
import Dialog, { DialogPrimaryButton } from '../../UI/Dialog';
import AuthenticatedUserContext from '../AuthenticatedUserContext';
import { changeUserSubscription } from '../../Utils/GDevelopServices/Usage';
import { ColumnStackLayout, LineStackLayout } from '../../UI/Layout';
import useAlertDialog from '../../UI/Alert/useAlertDialog';
import GDevelopGLogo from '../../UI/CustomSvgIcons/GDevelopGLogo';
import Form from '../../UI/Form';
import Text from '../../UI/Text';
import { Spacer } from '../../UI/Grid';
import TextField from '../../UI/TextField';
import Checkbox from '../../UI/Checkbox';
import FlatButton from '../../UI/FlatButton';
import StarIcon from '../../UI/CustomSvgIcons/Star';

type Props = {|
  onClose: () => void,
  onCloseAfterSuccess: () => void,
|};

const CancelReasonDialog = ({ onClose, onCloseAfterSuccess }: Props) => {
  const [isCancelingSubscription, setIsCancelingSubscription] = React.useState(
    false
  );
  const [hasCanceledSubscription, setHasCanceledSubscription] = React.useState(
    false
  );
  const [
    stoppedMakingGamesChecked,
    setStoppedMakingGamesChecked,
  ] = React.useState(false);
  const [strugglingChecked, setStrugglingChecked] = React.useState(false);
  const [
    preferFreeVersionChecked,
    setPreferFreeVersionChecked,
  ] = React.useState(false);
  const [missingFeatureChecked, setMissingFeatureChecked] = React.useState(
    false
  );
  const [qualityIssuesChecked, setQualityIssuesChecked] = React.useState(false);
  const [otherChecked, setOtherChecked] = React.useState(false);
  const [freeText, setFreeText] = React.useState('');
  const authenticatedUser = React.useContext(AuthenticatedUserContext);
  const { showAlert } = useAlertDialog();

  const canSubmit =
    (stoppedMakingGamesChecked ||
      strugglingChecked ||
      preferFreeVersionChecked ||
      qualityIssuesChecked ||
      missingFeatureChecked ||
      otherChecked) &&
    ((!missingFeatureChecked && !otherChecked) || freeText.trim().length > 0);

  const cancelPlan = React.useCallback(
    async () => {
      if (isCancelingSubscription || !canSubmit) return;
      const {
        getAuthorizationHeader,
        subscription,
        profile,
      } = authenticatedUser;
      if (!profile || !subscription) return;
      setIsCancelingSubscription(true);
      try {
        await changeUserSubscription(
          getAuthorizationHeader,
          profile.id,
          {
            planId: null,
          },
          {
            cancelImmediately: false,
            cancelReasons: {
              'stopped-making-games': stoppedMakingGamesChecked,
              'struggling-with-gdevelop': strugglingChecked,
              'prefer-free-version': preferFreeVersionChecked,
              'missing-feature': missingFeatureChecked,
              'quality-issues': qualityIssuesChecked,
              other: otherChecked,
              freeText: freeText,
            },
          }
        );
        await authenticatedUser.onRefreshSubscription();
        setHasCanceledSubscription(true);
      } catch (rawError) {
        await authenticatedUser.onRefreshSubscription();
        console.error('Error while canceling subscription:', rawError);
        showAlert({
          title: t`Could not cancel your subscription`,
          message: t`There was an error while canceling your subscription. Verify your internet connection or try again later.`,
        });
      } finally {
        setIsCancelingSubscription(false);
      }
    },
    [
      authenticatedUser,
      showAlert,
      isCancelingSubscription,
      canSubmit,
      freeText,
      stoppedMakingGamesChecked,
      strugglingChecked,
      preferFreeVersionChecked,
      qualityIssuesChecked,
      missingFeatureChecked,
      otherChecked,
    ]
  );

  const isLoading =
    !authenticatedUser.subscription ||
    !authenticatedUser.profile ||
    isCancelingSubscription;

  const actions = hasCanceledSubscription
    ? [
        <DialogPrimaryButton
          label={<Trans>Close</Trans>}
          key="close"
          onClick={onCloseAfterSuccess}
          primary
        />,
      ]
    : [
        <DialogPrimaryButton
          label={<Trans>Submit and cancel</Trans>}
          key="submit"
          onClick={cancelPlan}
          disabled={!canSubmit || isLoading}
          primary
        />,
      ];

  const secondaryActions = hasCanceledSubscription
    ? []
    : [
        <FlatButton
          label={<Trans>Back</Trans>}
          key="back"
          onClick={onClose}
          disabled={isLoading}
        />,
      ];

  return (
    <I18n>
      {({ i18n }) => (
        <Dialog
          title={null}
          actions={actions}
          secondaryActions={secondaryActions}
          open
          cannotBeDismissed
          onApply={cancelPlan}
          maxWidth="sm"
        >
          {hasCanceledSubscription ? (
            <ColumnStackLayout
              expand
              justifyContent="center"
              alignItems="center"
            >
              <GDevelopGLogo fontSize="large" />
              <Text size="block-title" align="center">
                <Trans>Your subscription has been canceled</Trans>
              </Text>
              <LineStackLayout noMargin alignItems="center">
                <StarIcon />
                <Text size="sub-title" align="center">
                  <Trans>Thank you for your feedback</Trans>
                </Text>
              </LineStackLayout>
            </ColumnStackLayout>
          ) : (
            <ColumnStackLayout
              expand
              justifyContent="center"
              alignItems="center"
            >
              <GDevelopGLogo fontSize="large" />
              <Text size="block-title" align="center">
                <Trans>Before you go...</Trans>
              </Text>
              <Text size="body2" noMargin align="center">
                <Trans>
                  Your feedback is valuable to help us improve our premium
                  services. Why are you canceling your subscription?
                </Trans>
              </Text>
              <Spacer />
              <Form
                onSubmit={cancelPlan}
                autoComplete="off"
                name="cancel"
                fullWidth
              >
                <ColumnStackLayout noMargin expand>
                  <Checkbox
                    label={<Trans>I've stopped using GDevelop</Trans>}
                    checked={stoppedMakingGamesChecked}
                    onCheck={(e, checked) =>
                      setStoppedMakingGamesChecked(checked)
                    }
                    disabled={isLoading}
                  />
                  <Checkbox
                    label={<Trans>I'm struggling to create what I want</Trans>}
                    checked={strugglingChecked}
                    onCheck={(e, checked) => setStrugglingChecked(checked)}
                    disabled={isLoading}
                  />
                  <Checkbox
                    label={<Trans>The free version is enough for me</Trans>}
                    checked={preferFreeVersionChecked}
                    onCheck={(e, checked) =>
                      setPreferFreeVersionChecked(checked)
                    }
                    disabled={isLoading}
                  />

                  <Checkbox
                    label={
                      <Trans>It's missing a feature (please specify)</Trans>
                    }
                    checked={missingFeatureChecked}
                    onCheck={(e, checked) => setMissingFeatureChecked(checked)}
                    disabled={isLoading}
                  />
                  <Checkbox
                    label={
                      <Trans>
                        I have encountered bugs or performance problems
                      </Trans>
                    }
                    checked={qualityIssuesChecked}
                    onCheck={(e, checked) => setQualityIssuesChecked(checked)}
                    disabled={isLoading}
                  />
                  <Checkbox
                    label={<Trans>Other reason (please specify)</Trans>}
                    checked={otherChecked}
                    onCheck={(e, checked) => setOtherChecked(checked)}
                    disabled={isLoading}
                  />
                  <Spacer />
                  <TextField
                    autoFocus="desktop"
                    value={freeText}
                    multiline
                    translatableHintText={t`Please tell us more`}
                    floatingLabelText={<Trans>Details</Trans>}
                    floatingLabelFixed
                    onChange={(e, value) => {
                      setFreeText(value);
                    }}
                    onBlur={event => {
                      setFreeText(event.currentTarget.value.trim());
                    }}
                    fullWidth
                    disabled={isLoading}
                    rows={4}
                  />
                </ColumnStackLayout>
              </Form>
            </ColumnStackLayout>
          )}
        </Dialog>
      )}
    </I18n>
  );
};

export default CancelReasonDialog;
