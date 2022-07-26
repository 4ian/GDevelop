// @flow
import * as React from 'react';
import { GamesShowcase } from '../../../GamesShowcase';
import PublishIcon from '@material-ui/icons/Publish';
import FlatButton from '../../../UI/FlatButton';
import Window from '../../../Utils/Window';
import { Trans } from '@lingui/macro';
import { LineStackLayout } from '../../../UI/Layout';
import RaisedButton from '../../../UI/RaisedButton';
import SectionContainer, { SectionRow } from './SectionContainer';
import { useResponsiveWindowWidth } from '../../../UI/Reponsive/ResponsiveWindowMeasurer';

const PlaySection = () => {
  const windowWidth = useResponsiveWindowWidth();
  return (
    <SectionContainer title={<Trans>Showcased games</Trans>} flexBody>
      <SectionRow expand>
        {windowWidth === 'large' && (
          <LineStackLayout noMargin justifyContent="flex-end">
            <FlatButton
              key="submit-game-showcase"
              onClick={() => {
                Window.openExternalURL(
                  'https://docs.google.com/forms/d/e/1FAIpQLSfjiOnkbODuPifSGuzxYY61vB5kyMWdTZSSqkJsv3H6ePRTQA/viewform?usp=sf_link'
                );
              }}
              primary
              leftIcon={<PublishIcon />}
              label={<Trans>Submit your game to the showcase</Trans>}
            />
            <RaisedButton
              primary
              label={<Trans>Play on Liluo.io</Trans>}
              onClick={() => Window.openExternalURL('https://liluo.io')}
            />
          </LineStackLayout>
        )}
        <GamesShowcase />
      </SectionRow>
    </SectionContainer>
  );
};

export default PlaySection;
