// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import Text from '../../UI/Text';
import { getHelpLink } from '../../Utils/HelpLink';
import Window from '../../Utils/Window';
import FlatButton from '../../UI/FlatButton';
import { Column, Line, Spacer } from '../../UI/Grid';
import AlertMessage from '../../UI/AlertMessage';
import ItchIo from '../../UI/CustomSvgIcons/ItchIo';
import GameJolt from '../../UI/CustomSvgIcons/GameJolt';
import Poki from '../../UI/CustomSvgIcons/Poki';
import CrazyGames from '../../UI/CustomSvgIcons/CrazyGames';
import NewsGround from '../../UI/CustomSvgIcons/NewsGround';
import { useResponsiveWindowWidth } from '../../UI/Reponsive/ResponsiveWindowMeasurer';
import DismissableTutorialMessage from '../../Hints/DismissableTutorialMessage';

const getIconStyle = windowWidth => ({
  height: windowWidth === 'small' ? 30 : 48,
  width: windowWidth === 'small' ? 30 : 48,
  margin: 10,
});

export const ExplanationHeader = () => {
  const windowWidth = useResponsiveWindowWidth();
  const iconStyle = getIconStyle(windowWidth);
  return (
    <Column noMargin>
      <DismissableTutorialMessage tutorialId="export-to-itch" />
      <Line>
        <Text>
          <Trans>
            This will export your game to a folder. You can then upload it on a
            website/game hosting service and share it on marketplaces and gaming
            portals like CrazyGames, Poki, Game Jolt, itch.io, Newgrounds...
          </Trans>
        </Text>
      </Line>
      <Line justifyContent="center">
        <ItchIo color="secondary" style={iconStyle} />
        <GameJolt color="secondary" style={iconStyle} />
        <Poki color="secondary" style={iconStyle} />
        <CrazyGames color="secondary" style={iconStyle} />
        <NewsGround color="secondary" style={iconStyle} />
      </Line>
    </Column>
  );
};

export const DoneFooter = ({
  renderGameButton,
}: {|
  renderGameButton: () => React.Node,
|}) => (
  <Column noMargin>
    <Text>
      <Trans>
        You can now upload the game to a web hosting to play to the game.
      </Trans>
    </Text>
    <AlertMessage kind="warning">
      <Trans>
        Your game won't work if you open index.html on your computer. You must
        upload it to a web hosting (Kongregate, Itch.io, etc...) or a web server
        to run it.
      </Trans>
    </AlertMessage>
    <Spacer />
    {renderGameButton()}
    <Spacer />
    <FlatButton
      fullWidth
      primary
      onClick={() =>
        Window.openExternalURL(
          getHelpLink('/publishing/publishing-to-gamejolt-store')
        )
      }
      label={<Trans>Publish your game on Game Jolt</Trans>}
      leftIcon={<GameJolt />}
    />
    <FlatButton
      fullWidth
      primary
      onClick={() =>
        Window.openExternalURL('https://gdevelop.io/page/crazy-games')
      }
      label={<Trans>Publish your game on CrazyGames.com</Trans>}
      leftIcon={<CrazyGames />}
    />
    <FlatButton
      fullWidth
      primary
      onClick={() =>
        Window.openExternalURL(
          getHelpLink('/publishing/publishing-to-kongregate-store')
        )
      }
      label={<Trans>Publish your game on Kongregate</Trans>}
    />
    <FlatButton
      fullWidth
      primary
      onClick={() =>
        Window.openExternalURL(getHelpLink('/publishing/publishing-to-itch-io'))
      }
      label={<Trans>Publish your game on Itch.io</Trans>}
      leftIcon={<ItchIo />}
    />
    <FlatButton
      fullWidth
      primary
      onClick={() => Window.openExternalURL('https://gdevelop.io/page/poki')}
      label={<Trans>Publish your game on Poki.com</Trans>}
      leftIcon={<Poki />}
    />
    <FlatButton
      fullWidth
      onClick={() => Window.openExternalURL(getHelpLink('/publishing'))}
      label={<Trans>Learn more about publishing</Trans>}
    />
  </Column>
);

export const html5Exporter = {
  key: 'webexport',
  tabName: <Trans>Web</Trans>,
  name: <Trans>Web</Trans>,
  helpPage: '/publishing/html5_game_in_a_local_folder',
};
