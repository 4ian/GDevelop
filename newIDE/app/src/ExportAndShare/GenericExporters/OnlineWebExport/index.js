// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import Text from '../../../UI/Text';
import { Column, Line } from '../../../UI/Grid';
import OnlineGameLink from './OnlineGameLink';
import DismissableTutorialMessage from '../../../Hints/DismissableTutorialMessage';
import GdGames from '../../../UI/CustomSvgIcons/GdGames';
import { type Game } from '../../../Utils/GDevelopServices/Game';
import { getBuilds } from '../../../Utils/GDevelopServices/Build';
import AuthenticatedUserContext from '../../../Profile/AuthenticatedUserContext';
import AlertMessage from '../../../UI/AlertMessage';

const iconStyle = {
  height: 48,
  width: 48,
  margin: 10,
};

type Props = {|
  game: ?Game,
|};

const ExplanationHeader = ({ game }: Props) => {
  const { getAuthorizationHeader, firebaseUser } = React.useContext(
    AuthenticatedUserContext
  );
  const hasGameExistingBuilds = React.useMemo(
    async () => {
      if (!game) return false;
      if (!firebaseUser) return false; // This should not happen.
      const builds = await getBuilds(
        getAuthorizationHeader,
        firebaseUser.uid,
        game.id
      );
      return !!builds.length;
    },
    [firebaseUser, game, getAuthorizationHeader]
  );
  const isGamePublishedOnGdGames = !!game && !!game.publicWebBuildId;

  return (
    <Column noMargin expand>
      <DismissableTutorialMessage tutorialId="publish-on-gdgames" />
      <Line alignItems="center" justifyContent="center">
        <Text>
          <Trans>
            Generate a unique link, playable from any computer or mobile phone's
            browser.
          </Trans>
        </Text>
      </Line>
      <Line justifyContent="center">
        <GdGames color="secondary" style={iconStyle} />
      </Line>
      {!!isGamePublishedOnGdGames ? (
        <AlertMessage kind="info">
          <Trans>
            A new private link will be created without replacing the version
            published on gd.games. You will then be able to share it like this
            or push it live!
          </Trans>
        </AlertMessage>
      ) : !!hasGameExistingBuilds ? (
        <AlertMessage kind="info">
          <Trans>
            A new private link will be created. You will then be able to share
            it like this or decide to promote it on gd.games.
          </Trans>
        </AlertMessage>
      ) : null}
    </Column>
  );
};

const onlineWebExporter = {
  key: 'onlinewebexport',
  tabName: 'Web',
  name: <Trans>Web</Trans>,
  helpPage: '/publishing/web',
};

export { onlineWebExporter, ExplanationHeader, OnlineGameLink };
