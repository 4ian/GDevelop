// @flow
import { Trans } from '@lingui/macro';
import { type I18n as I18nType } from '@lingui/core';
import * as React from 'react';
import { Column, Line } from '../UI/Grid';
import { sendTutorialOpened } from '../Utils/Analytics/EventSender';
import Window from '../Utils/Window';
import { List, ListItem } from '../UI/List';
import { ColumnStackLayout } from '../UI/Layout';
import Text from '../UI/Text';
import { getAllTutorialHints, type TutorialHint } from '../Hints';
import { I18n } from '@lingui/react';
import ListIcon from '../UI/ListIcon';
import RaisedButton from '../UI/RaisedButton';
import { getHelpLink } from '../Utils/HelpLink';

const TutorialListItem = ({
  tutorialHint,
  i18n,
}: {|
  tutorialHint: TutorialHint,
  i18n: I18nType,
|}) => {
  return (
    <ListItem
      leftIcon={
        tutorialHint.iconSrc ? (
          <ListIcon
            iconWidth={120}
            iconHeight={60}
            src={tutorialHint.iconSrc}
          />
        ) : null
      }
      primaryText={tutorialHint.name}
      secondaryText={i18n._(tutorialHint.message)}
      onClick={() => {
        sendTutorialOpened(tutorialHint.identifier);
        Window.openExternalURL(tutorialHint.link);
      }}
    />
  );
};

export default function Tutorials(): React.Node {
  const allTutorials = getAllTutorialHints();
  const featuredForGettingStartedTutorials = allTutorials.filter(
    tutorialHint => {
      return !!tutorialHint.featuredForGettingStarted;
    }
  );
  const videoTutorials = allTutorials.filter(tutorialHint => {
    return (
      !tutorialHint.featuredForGettingStarted &&
      tutorialHint.kind === 'video-tutorial'
    );
  });
  const nonVideoTutorials = allTutorials.filter(tutorialHint => {
    return (
      !tutorialHint.featuredForGettingStarted &&
      tutorialHint.kind !== 'video-tutorial'
    );
  });

  return (
    <I18n>
      {({ i18n }) => (
        <ColumnStackLayout noMargin>
          <Column>
            <Text>
              <Trans>
                Get started by following a tutorial, the best way to understand
                how GDevelop works.
              </Trans>
            </Text>
          </Column>
          <Column expand noMargin>
            <Column>
              <Text size="title" noMargin>
                <Trans>Getting Started</Trans>
              </Text>
            </Column>
            <List>
              <List>
                {featuredForGettingStartedTutorials.map(tutorialHint => (
                  <TutorialListItem
                    key={tutorialHint.identifier}
                    tutorialHint={tutorialHint}
                    i18n={i18n}
                  />
                ))}
              </List>
            </List>
          </Column>
          <Line justifyContent="center" noMargin>
            <RaisedButton
              primary
              label={<Trans>Open GDevelop documentation</Trans>}
              onClick={() => {
                Window.openExternalURL(getHelpLink('/'));
              }}
            />
          </Line>
          <Column noMargin>
            <Column>
              <Text size="title" noMargin>
                <Trans>Video Tutorials</Trans>
              </Text>
            </Column>
            <List>
              {videoTutorials.map(tutorialHint => (
                <TutorialListItem
                  key={tutorialHint.identifier}
                  tutorialHint={tutorialHint}
                  i18n={i18n}
                />
              ))}
            </List>
          </Column>
          <Line justifyContent="center" noMargin>
            <RaisedButton
              primary
              label={<Trans>Find more on GDevelop Youtube channel</Trans>}
              onClick={() => {
                Window.openExternalURL('https://www.youtube.com/c/GDevelopApp');
              }}
            />
          </Line>
          <Column noMargin>
            <Column>
              <Text size="title" noMargin>
                <Trans>Other Community Tutorials</Trans>
              </Text>
            </Column>
            <List>
              <List>
                {nonVideoTutorials.map(tutorialHint => (
                  <TutorialListItem
                    key={tutorialHint.identifier}
                    tutorialHint={tutorialHint}
                    i18n={i18n}
                  />
                ))}
              </List>
            </List>
          </Column>
        </ColumnStackLayout>
      )}
    </I18n>
  );
}
