// @flow
import { Trans } from '@lingui/macro';
import React from 'react';
import { Column, Line } from '../UI/Grid';
import { sendTutorialOpened } from '../Utils/Analytics/EventSender';
import Window from '../Utils/Window';
import { List, ListItem } from '../UI/List';
import Text from '../UI/Text';
import { getAllTutorialHints } from '../Hints';
import { I18n } from '@lingui/react';
import ListIcon from '../UI/ListIcon';

export const VideoTutorials = () => {
  return (
    <I18n>
      {({ i18n }) => (
        <Column noMargin>
          <Line>
            <Column>
              <Text>
                <Trans>
                  Explore video tutorials to learn how to make specific features
                  in your game:
                </Trans>
              </Text>
            </Column>
          </Line>
          <Line>
            <Column expand noMargin>
              <List>
                {getAllTutorialHints().map(tutorialHint => (
                  <ListItem
                    key={tutorialHint.identifier}
                    leftIcon={
                      <ListIcon iconWidth={120} iconHeight={60} src={tutorialHint.iconSrc} />
                    }
                    primaryText={tutorialHint.name}
                    secondaryText={i18n._(tutorialHint.message)}
                    onClick={() => {
                      sendTutorialOpened(tutorialHint.identifier);
                      Window.openExternalURL(tutorialHint.link);
                    }}
                  />
                ))}
              </List>
            </Column>
          </Line>
        </Column>
      )}
    </I18n>
  );
};
