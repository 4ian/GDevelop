// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import Text from '../../UI/Text';
import { Column } from '../../UI/Grid';
import FlatButton from '../../UI/FlatButton';
import { getHelpLink } from '../../Utils/HelpLink';
import Window from '../../Utils/Window';
import { ResponsiveLineStackLayout } from '../../UI/Layout';

export const ExplanationHeader = () => (
  <Text>
    <Trans>
      Prepare your game for Facebook Instant Games so that it can be play on
      Facebook Messenger. GDevelop will create a compressed file that you can
      upload on your Facebook Developer account.
    </Trans>
  </Text>
);

export const DoneFooter = ({
  renderGameButton,
}: {|
  renderGameButton: () => React.Node,
|}) => {
  const openLearnMore = () => {
    Window.openExternalURL(
      getHelpLink('/publishing/publishing-to-facebook-instant-games')
    );
  };

  return (
    <Column noMargin>
      <Text>
        <Trans>
          You can now create a game on Facebook Instant Games, if not already
          done, and upload the generated archive.
        </Trans>
      </Text>
      <ResponsiveLineStackLayout justifyContent="center">
        {renderGameButton()}
        <FlatButton
          label={<Trans>Learn more about Instant Games publication</Trans>}
          primary
          onClick={openLearnMore}
        />
      </ResponsiveLineStackLayout>
    </Column>
  );
};

export const facebookInstantGamesExporter = {
  key: 'facebookinstantgamesexport',
  tabName: <Trans>Instant Games</Trans>,
  name: <Trans>Facebook Instant Games</Trans>,
  helpPage: '/publishing/publishing-to-facebook-instant-games',
};
