// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import Text from '../../UI/Text';
import { Column, Line } from '../../UI/Grid';
import FlatButton from '../../UI/FlatButton';
import { getHelpLink } from '../../Utils/HelpLink';
import Window from '../../Utils/Window';
import Facebook from '../../UI/CustomSvgIcons/Facebook';
import { type RenderIconProps } from '../ExportDialog';

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
      <Line justifyContent="center">
        {renderGameButton()}
        <FlatButton
          label={<Trans>Learn more about Instant Games publication</Trans>}
          primary
          onClick={openLearnMore}
        />
      </Line>
    </Column>
  );
};

export const facebookInstantGamesExporter = {
  name: <Trans>Facebook Instant Games</Trans>,
  renderIcon: (props: RenderIconProps) => <Facebook {...props} />,
  helpPage: '/publishing/publishing-to-facebook-instant-games',
  description: (
    <Trans>
      Package your game as a Facebook Instant Games that can be played on
      Facebook Messenger.
    </Trans>
  ),
  advanced: true,
};
