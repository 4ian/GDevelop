// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import Text from '../../UI/Text';
import { getHelpLink } from '../../Utils/HelpLink';
import Window from '../../Utils/Window';
import FlatButton from '../../UI/FlatButton';
import { Column, Spacer } from '../../UI/Grid';
import AlertMessage from '../../UI/AlertMessage';

export const ExplanationHeader = () => (
  <Text>
    <Trans>This will export your game to a folder.</Trans>
    <Trans>
      You can then upload it on a website/game hosting service and share it on
      marketplaces and gaming portals like CrazyGames, Poki, Game Jolt, itch.io,
      Newsground...
    </Trans>
  </Text>
);

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
    />
    <FlatButton
      fullWidth
      primary
      onClick={() =>
        Window.openExternalURL('https://gdevelop-app.com/crazy-games')
      }
      label={<Trans>Publish your game on CrazyGames.com</Trans>}
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
    />
    <FlatButton
      fullWidth
      primary
      onClick={() => Window.openExternalURL('https://gdevelop-app.com/poki')}
      label={<Trans>Publish your game on Poki.com</Trans>}
    />
    <FlatButton
      fullWidth
      onClick={() => Window.openExternalURL(getHelpLink('/publishing'))}
      label={<Trans>Learn more about publishing</Trans>}
    />
  </Column>
);
