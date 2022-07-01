// @flow
import * as React from 'react';
import { Line, Column } from '../../../UI/Grid';
import Text from '../../../UI/Text';
import { createStyles, makeStyles, Paper } from '@material-ui/core';
import { TutorialsList } from '../../../Tutorial/TutorialsList';
import FlatButton from '../../../UI/FlatButton';
import Window from '../../../Utils/Window';
import { Trans } from '@lingui/macro';
import PublishIcon from '@material-ui/icons/Publish';
import { ResponsiveLineStackLayout } from '../../../UI/Layout';
import { type HomeTab } from './HomePageMenu';
import { shouldValidate } from '../../../UI/KeyboardShortcuts/InteractionKeys';
import { isUserflowRunning } from '../../Onboarding/OnboardingDialog';
import { isMobile } from '../../../Utils/Platform';
import optionalRequire from '../../../Utils/OptionalRequire';
import { sendOnboardingManuallyOpened } from '../../../Utils/Analytics/EventSender';
import { SectionContainer } from './SectionContainer';
const electron = optionalRequire('electron');

const componentStyles = {
  paper: {
    padding: 10,
    maxWidth: 200,
    textAlign: 'center',
  },
  helpItemsContainer: {
    marginBottom: 20,
  },
};

// Styles to give the impression of pressing an element.
const useStylesForHelpItem = makeStyles(theme =>
  createStyles({
    root: {
      '&:focus': {
        outline: `2px solid ${theme.palette.primary.main}`,
      },
    },
  })
);

type Props = {|
  onOpenOnboardingDialog: () => void,
  onOpenExamples: () => void,
  onTabChange: (tab: HomeTab) => void,
  onOpenHelpFinder: () => void,
|};

export const LearnSection = ({
  onOpenOnboardingDialog,
  onOpenExamples,
  onTabChange,
  onOpenHelpFinder,
}: Props) => {
  const classes = useStylesForHelpItem();
  const helpItems = [
    !electron && !isMobile() && !isUserflowRunning
      ? {
          title: <Trans>Guided Tour</Trans>,
          description: (
            <Trans>Learn the fundamentals of the editor in 5 minutes</Trans>
          ),
          action: () => {
            sendOnboardingManuallyOpened();
            onOpenOnboardingDialog();
          },
        }
      : undefined,
    {
      title: <Trans>Documentation</Trans>,
      description: <Trans>Find the complete documentation on everything</Trans>,
      action: onOpenHelpFinder,
    },
    {
      title: <Trans>Examples</Trans>,
      description: (
        <Trans>Have a look from the inside at existing projects</Trans>
      ),
      action: onOpenExamples,
    },
    {
      title: <Trans>Community</Trans>,
      description: <Trans>Ask your questions to the community</Trans>,
      action: () => onTabChange('Community'),
    },
  ].filter(Boolean);

  return (
    <SectionContainer title="Help and guides">
      <Line>
        <Text size="body">
          <Trans>Shortcuts</Trans>
        </Text>
      </Line>
      <div style={componentStyles.helpItemsContainer}>
        <ResponsiveLineStackLayout noMargin>
          {helpItems.map((helpItem, index) => (
            <Paper
              elevation={10}
              style={componentStyles.paper}
              onClick={helpItem.action}
              classes={classes}
              key={index}
              tabIndex={0}
              onKeyPress={(
                event: SyntheticKeyboardEvent<HTMLLIElement>
              ): void => {
                if (shouldValidate(event)) {
                  helpItem.action();
                }
              }}
            >
              <Column alignItems="center">
                <Text size="title">{helpItem.title}</Text>
                <Text size="body2">{helpItem.description}</Text>
              </Column>
            </Paper>
          ))}
        </ResponsiveLineStackLayout>
      </div>
      <Line>
        <Text size="title">
          <Trans>Guides and tutorials</Trans>
        </Text>
      </Line>
      <Line noMargin>
        <Text size="body">
          <Trans>Learn by doing</Trans>
        </Text>
      </Line>
      <ResponsiveLineStackLayout expand noMargin>
        <TutorialsList />
      </ResponsiveLineStackLayout>
      <Line justifyContent="start">
        <FlatButton
          key="submit-example"
          onClick={() => {
            Window.openExternalURL(
              'https://github.com/GDevelopApp/GDevelop-examples/issues/new/choose'
            );
          }}
          primary
          icon={<PublishIcon />}
          label={<Trans>Submit your project as an example</Trans>}
        />
      </Line>
    </SectionContainer>
  );
};
