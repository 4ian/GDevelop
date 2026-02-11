// @flow
import { Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';
import * as React from 'react';
import Dialog, { DialogPrimaryButton } from '../../../../UI/Dialog';
import FlatButton from '../../../../UI/FlatButton';
import { Line } from '../../../../UI/Grid';
import { ColumnStackLayout } from '../../../../UI/Layout';
import Text from '../../../../UI/Text';
import InAppTutorialContext from '../../../../InAppTutorial/InAppTutorialContext';
import { type InAppTutorialShortHeader } from '../../../../Utils/GDevelopServices/InAppTutorial';
import { selectMessageByLocale } from '../../../../Utils/i18n/MessageByLocale';

const styles = {
  imgContainer: {
    marginBottom: 16,
  },
};

const getDialogContentByCompletionStatus = ({
  i18n,
  status,
  startTutorial,
  onClose,
  isProjectOpened,
  tutorialShortHeader,
  tutorialId,
}: {
  i18n: I18nType,
  status: 'notStarted' | 'started' | 'complete',
  startTutorial: (scenario: 'resume' | 'startOver' | 'start') => Promise<void>,
  onClose: () => void,
  isProjectOpened?: boolean,
  tutorialShortHeader: InAppTutorialShortHeader,
  tutorialId: string,
}) => {
  const resumeTutorial = () => startTutorial('resume');
  const startOverTutorial = () => startTutorial('startOver');
  const startTutorialForFirstTime = () => startTutorial('start');

  if (status === 'started') {
    return {
      title: <Trans>Welcome back!</Trans>,
      content: (
        <Text>
          <Trans>Let's finish your game, shall we?</Trans>
        </Text>
      ),
      primaryAction: {
        label: <Trans>Let's go</Trans>,
        onClick: resumeTutorial,
      },
      secondaryAction: {
        label: isProjectOpened ? (
          <Trans>No, close project</Trans>
        ) : (
          <Trans>Back</Trans>
        ),
        onClick: onClose,
      },
      tertiaryAction: {
        label: <Trans>Restart tutorial</Trans>,
        onClick: startOverTutorial,
      },
    };
  } else if (status === 'complete') {
    return {
      title: <Trans>Restart the Tutorial</Trans>,
      content: (
        <>
          <Text>
            <Trans>
              You're about to restart this multichapter guided lesson.
            </Trans>
          </Text>
          <Text>
            <Trans>
              GDevelop will save your progress, so you can take a break if you
              need.
            </Trans>
          </Text>
        </>
      ),
      primaryAction: {
        label: <Trans>Restart</Trans>,
        onClick: startOverTutorial,
      },
      secondaryAction: { label: <Trans>Back</Trans>, onClick: onClose },
      tertiaryAction: null,
    };
  }

  return {
    title: selectMessageByLocale(i18n, tutorialShortHeader.titleByLocale),
    content: (
      <>
        <Text>
          <Trans>In this tutorial you will learn:</Trans>
        </Text>
        {tutorialShortHeader.bulletPointsByLocale.map(
          (bulletPointByLocale, index) => (
            <Text displayAsListItem noMargin key={index}>
              {selectMessageByLocale(i18n, bulletPointByLocale)}
            </Text>
          )
        )}
        {!tutorialShortHeader.isMiniTutorial && (
          <Text>
            <Trans>
              This is a multichapter tutorial. GDevelop will save your progress
              so you can take a break when you need it.
            </Trans>
          </Text>
        )}
      </>
    ),
    primaryAction: {
      label: <Trans>Let's go</Trans>,
      onClick: startTutorialForFirstTime,
    },
    secondaryAction: { label: <Trans>Back</Trans>, onClick: onClose },
    tertiaryAction: null,
  };
};

type Props = {|
  open: boolean,
  tutorialId: string,
  onClose: () => void,
  tutorialCompletionStatus: 'notStarted' | 'started' | 'complete',
  isProjectOpened?: boolean,
  isProjectOpening: boolean,
  startTutorial: (scenario: 'resume' | 'startOver' | 'start') => Promise<void>,
|};

const StartInAppTutorialDialog = ({
  open,
  tutorialId,
  onClose,
  tutorialCompletionStatus,
  isProjectOpened,
  startTutorial,
  isProjectOpening,
}: Props) => {
  const { getInAppTutorialShortHeader } = React.useContext(
    InAppTutorialContext
  );

  const tutorialShortHeader = getInAppTutorialShortHeader(tutorialId);
  if (!tutorialShortHeader) {
    console.error(
      `No tutorial short header found for tutorial ${tutorialId} - StartInAppTutorialDialog was opened despite tutorials not being loaded?`
    );
    return null;
  }

  return (
    <I18n>
      {({ i18n }) => {
        const dialogContent = getDialogContentByCompletionStatus({
          i18n,
          status:
            // Always show the "not started" dialog for the mini tutorials.
            tutorialShortHeader.isMiniTutorial
              ? 'notStarted'
              : tutorialCompletionStatus,
          startTutorial,
          onClose,
          isProjectOpened,
          tutorialShortHeader,
          tutorialId,
        });
        const {
          title,
          content,
          primaryAction,
          secondaryAction,
          tertiaryAction,
        } = dialogContent;

        const actions = [
          <FlatButton
            key="close"
            label={secondaryAction.label}
            onClick={secondaryAction.onClick}
            disabled={isProjectOpening}
          />,
          <DialogPrimaryButton
            key="start"
            label={primaryAction.label}
            primary
            onClick={primaryAction.onClick}
            disabled={isProjectOpening}
          />,
        ];
        const secondaryActions = tertiaryAction
          ? [
              <FlatButton
                key="other"
                label={tertiaryAction.label}
                onClick={tertiaryAction.onClick}
                disabled={isProjectOpening}
              />,
            ]
          : undefined;

        return (
          <Dialog
            title={title}
            actions={actions}
            secondaryActions={secondaryActions}
            open={open}
            onRequestClose={onClose}
            onApply={primaryAction.onClick}
            maxWidth="xs"
            cannotBeDismissed
          >
            <ColumnStackLayout noMargin>
              <Line alignItems="center" justifyContent="center" noMargin>
                <div style={styles.imgContainer}>
                  <img alt="hero" src="res/hero.png" width={48} height={48} />
                </div>
              </Line>
              {content}
            </ColumnStackLayout>
          </Dialog>
        );
      }}
    </I18n>
  );
};

export default StartInAppTutorialDialog;
