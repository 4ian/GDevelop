// @flow
import { t, Trans } from '@lingui/macro';
import * as React from 'react';
import { I18n } from '@lingui/react';

import AuthenticatedUserContext from '../../Profile/AuthenticatedUserContext';
import AlertMessage from '../../UI/AlertMessage';
import InlineCheckbox from '../../UI/InlineCheckbox';
import { ColumnStackLayout } from '../../UI/Layout';
import { showErrorBox } from '../../UI/Messages/MessageBox';
import { type Game, updateGame } from '../../Utils/GDevelopServices/Game';
import Text from '../../UI/Text';

type Props = {|
  game: Game,
  onGameUpdated: (updatedGame: Game) => void,
|};

const GameMonetization = ({ game, onGameUpdated }: Props) => {
  const { getAuthorizationHeader, profile } = React.useContext(
    AuthenticatedUserContext
  );
  const [
    pendingDisplayAdsOnGamePage,
    setPendingDisplayAdsOnGamePage,
  ] = React.useState<boolean | null>(null);

  if (!profile) return null;

  return (
    <I18n>
      {({ i18n }) => (
        <ColumnStackLayout noMargin>
          <Text size="sub-title">Ads</Text>
          <AlertMessage kind="info">
            <Trans>
              In the future, games that generate enough revenue will be able to
              opt-in into "revenue share", so that as a creator you can start
              earning from your game sessions.
            </Trans>
          </AlertMessage>
          <InlineCheckbox
            checked={
              pendingDisplayAdsOnGamePage !== null
                ? pendingDisplayAdsOnGamePage
                : !!game.displayAdsOnGamePage
            }
            onCheck={async (e, enable) => {
              setPendingDisplayAdsOnGamePage(enable);
              const updatedGame = { ...game, displayAdsOnGamePage: enable };
              try {
                await updateGame(getAuthorizationHeader, profile.id, game.id, {
                  displayAdsOnGamePage: enable,
                });
                onGameUpdated(updatedGame);
              } catch (error) {
                showErrorBox({
                  message:
                    i18n._(t`Unable to update game.`) +
                    ' ' +
                    i18n._(
                      t`Verify your internet connection or try again later.`
                    ),
                  rawError: error,
                  errorId: 'game-monetization-update-game-error',
                });
              } finally {
                setPendingDisplayAdsOnGamePage(null);
              }
            }}
            label={
              <Trans>
                Allow to display advertisements on the game page on gd.games.
              </Trans>
            }
            tooltipOrHelperText={
              <Trans>
                This is recommended as this allows to maintain free publishing
                on gd.games and allow to analyze if you could benefit from
                revenue sharing.
              </Trans>
            }
          />
        </ColumnStackLayout>
      )}
    </I18n>
  );
};

export default GameMonetization;
