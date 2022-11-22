// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import Dialog, { DialogPrimaryButton } from '../../UI/Dialog';
import FlatButton from '../../UI/FlatButton';
import { Line, Column } from '../../UI/Grid';
import { MarkdownText } from '../../UI/MarkdownText';
import { ColumnStackLayout } from '../../UI/Layout';

const styles = {
  imgContainer: {
    marginBottom: 16,
  },
};

const dialogContent = `
GDevelop provides tutorials to discover the app or to explore some features.

You can stop the tutorial at any moment and come back later to complete it!
`;
const dialogContentForAlreadyStartedTutorials = `
You have the choice to start the tutorial over or to resume the one you already started.
`;

type Props = {|
  open: boolean,
  onClose: () => void,
  isTutorialAlreadyStarted: boolean,
  startTutorial: (scenario: 'resume' | 'startOver') => Promise<void>,
|};

const StartTutorialDialog = ({
  open,
  onClose,
  isTutorialAlreadyStarted,
  startTutorial,
}: Props) => {
  const resumeTutorial = () => startTutorial('resume');
  const startOverTutorial = () => startTutorial('startOver');

  const actions = [
    <FlatButton
      key="close"
      label={<Trans>No thanks, I'm good</Trans>}
      onClick={onClose}
    />,
    <DialogPrimaryButton
      key="start"
      label={
        isTutorialAlreadyStarted ? (
          <Trans>Resume tutorial</Trans>
        ) : (
          <Trans>Let's go!</Trans>
        )
      }
      primary
      onClick={isTutorialAlreadyStarted ? resumeTutorial : startOverTutorial}
    />,
  ];
  const secondaryActions = isTutorialAlreadyStarted
    ? [
        <FlatButton
          key="startOver"
          label={<Trans>Start over</Trans>}
          onClick={() => startTutorial('startOver')}
        />,
      ]
    : undefined;

  return (
    <Dialog
      title={<Trans>Take a quick tour?</Trans>}
      actions={actions}
      secondaryActions={secondaryActions}
      open={open}
      onRequestClose={onClose}
      onApply={isTutorialAlreadyStarted ? resumeTutorial : startOverTutorial}
      maxWidth="xs"
    >
      <ColumnStackLayout noMargin>
        <Line alignItems="center" justifyContent="center" noMargin>
          <div style={styles.imgContainer}>
            <img alt="hero" src="res/hero.png" width={48} height={48} />
          </div>
        </Line>
        <Column noMargin>
          <MarkdownText source={dialogContent} allowParagraphs />
          {isTutorialAlreadyStarted && (
            <MarkdownText
              source={dialogContentForAlreadyStartedTutorials}
              allowParagraphs
            />
          )}
        </Column>
      </ColumnStackLayout>
    </Dialog>
  );
};

export default StartTutorialDialog;
