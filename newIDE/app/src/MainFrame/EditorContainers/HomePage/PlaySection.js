// @flow
import * as React from 'react';
import { Line } from '../../../UI/Grid';
import Text from '../../../UI/Text';
import { GamesShowcase } from '../../../GamesShowcase';
import PublishIcon from '@material-ui/icons/Publish';
import FlatButton from '../../../UI/FlatButton';
import Window from '../../../Utils/Window';
import { Trans } from '@lingui/macro';
import { LineStackLayout, ResponsiveLineStackLayout } from '../../../UI/Layout';
import RaisedButton from '../../../UI/RaisedButton';
import { SectionContainer } from './SectionContainer';
import { useResponsiveWindowWidth } from '../../../UI/Reponsive/ResponsiveWindowMeasurer';

export const PlaySection = () => {
  const windowWidth = useResponsiveWindowWidth();
  return (
    <SectionContainer>
      <Line>
        <Text size="main-title">Showcased Games</Text>
      </Line>
      <ResponsiveLineStackLayout expand noMargin>
        <GamesShowcase />
      </ResponsiveLineStackLayout>
      <LineStackLayout>
        {windowWidth !== 'small' && (
          <FlatButton
            key="submit-game-showcase"
            onClick={() => {
              Window.openExternalURL(
                'https://docs.google.com/forms/d/e/1FAIpQLSfjiOnkbODuPifSGuzxYY61vB5kyMWdTZSSqkJsv3H6ePRTQA/viewform?usp=sf_link'
              );
            }}
            primary
            icon={<PublishIcon />}
            label={<Trans>Submit your game to the showcase</Trans>}
          />
        )}
        <RaisedButton
          primary
          label={<Trans>Play on Liluo.io</Trans>}
          onClick={() => Window.openExternalURL('https://liluo.io')}
        />
      </LineStackLayout>
    </SectionContainer>
  );
};
