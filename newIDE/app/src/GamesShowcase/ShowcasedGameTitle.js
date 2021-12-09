// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import Text from '../UI/Text';
import { type ShowcasedGame } from '../Utils/GDevelopServices/Game';
import { ColumnStackLayout, ResponsiveLineStackLayout } from '../UI/Layout';

const ShowcasedGameTitle = ({
  showcasedGame,
  forceColumn = false,
}: {|
  showcasedGame: ShowcasedGame,
  forceColumn?: boolean,
|}): React.Node => {
  const { title, author } = showcasedGame;
  const StackLayout = forceColumn
    ? ColumnStackLayout
    : ResponsiveLineStackLayout;
  return (
    <StackLayout noMargin alignItems="baseline" expand>
      <Text noMargin displayInlineAsSpan>
        {title}
      </Text>
      <Text noMargin size="body2" displayInlineAsSpan>
        <Trans>by {author}</Trans>
      </Text>
    </StackLayout>
  );
};

export default ShowcasedGameTitle;
