// @flow

import * as React from 'react';
import { Trans } from '@lingui/macro';

import Link from '../UI/Link';
import RaisedButton from '../UI/RaisedButton';
import Text from '../UI/Text';
import { ColumnStackLayout, LineStackLayout } from '../UI/Layout';
import Graphs from '../UI/CustomSvgIcons/Graphs';
import GDevelopThemeContext from '../UI/Theme/GDevelopThemeContext';
import { getHelpLink } from '../Utils/HelpLink';
import Window from '../Utils/Window';
import useDisplayNewFeature from '../Utils/UseDisplayNewFeature';
import HighlightingTooltip from '../UI/HighlightingTooltip';
import Publish from '../UI/CustomSvgIcons/Publish';
import Paper from '../UI/Paper';
import AuthenticatedUserContext from '../Profile/AuthenticatedUserContext';
import { ListItem } from '../UI/List';
import { getProjectManagerItemId } from '.';
import { useResponsiveWindowWidth } from '../UI/Reponsive/ResponsiveWindowMeasurer';

const publishingWikiArticle = getHelpLink('/publishing/');
const gamesDashboardWikiArticle = getHelpLink('/interface/games-dashboard/');

const styles = {
  gamesDashboardInfoContainer: {
    border: '1px solid',
    padding: 8,
    margin: 4,
  },
  gamesDashboardInfoTextContainer: {
    opacity: 0.7,
  },
};

type Props = {|
  onShareProject: () => void,
  onOpenGamesDashboardDialog?: ?() => void,
  canDisplayTooltip: boolean,
|};

const GamesDashboardInfo = ({
  onShareProject,
  onOpenGamesDashboardDialog,
  canDisplayTooltip,
}: Props) => {
  const { profile, onOpenLoginDialog } = React.useContext(
    AuthenticatedUserContext
  );
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const {
    shouldDisplayNewFeatureHighlighting,
    acknowledgeNewFeature,
  } = useDisplayNewFeature();
  const windowWidth = useResponsiveWindowWidth();
  const isMobile = windowWidth === 'small';

  const [
    gameDashboardItemContainer,
    setGameDashboardItemContainer,
  ] = React.useState<?HTMLDivElement>(null);
  const [
    displayTooltipDelayed,
    setDisplayTooltipDelayed,
  ] = React.useState<boolean>(false);

  const onClickShare = React.useCallback(
    () => {
      if (!!profile) {
        onShareProject();
      } else {
        onOpenLoginDialog();
      }
    },
    [profile, onShareProject, onOpenLoginDialog]
  );

  const onCloseTooltip = React.useCallback(
    () => {
      setDisplayTooltipDelayed(false);
      acknowledgeNewFeature({ featureId: 'gamesDashboardInProjectManager' });
    },
    [acknowledgeNewFeature]
  );

  const shouldDisplayTooltip = shouldDisplayNewFeatureHighlighting({
    featureId: 'gamesDashboardInProjectManager',
  });

  const displayTooltip =
    canDisplayTooltip && shouldDisplayTooltip && gameDashboardItemContainer;

  React.useEffect(
    () => {
      if (displayTooltip) {
        const timeoutId = setTimeout(() => {
          setDisplayTooltipDelayed(true);
        }, 500);
        return () => clearTimeout(timeoutId);
      }
    },
    // Delay display of tooltip because the project manager opening is animated
    // and the popper does not follow the item.
    [displayTooltip]
  );

  if (onOpenGamesDashboardDialog) {
    return (
      <div ref={ref => setGameDashboardItemContainer(ref)}>
        <ListItem
          id={getProjectManagerItemId('manage')}
          primaryText={<Trans>Game Dashboard</Trans>}
          leftIcon={<Graphs />}
          onClick={onOpenGamesDashboardDialog}
          noPadding
        />
        {displayTooltipDelayed && (
          <HighlightingTooltip
            // $FlowIgnore - displayTooltipDelayed makes sure the element is defined
            anchorElement={gameDashboardItemContainer}
            thumbnailSource="res/features/games-dashboard.svg"
            thumbnailAlt={'Red hero presenting games analytics'}
            title={<Trans>Game Dashboard</Trans>}
            content={[
              <Text noMargin key="paragraph">
                <Trans>
                  Follow your game’s online performance, manage published
                  versions, and collect player feedback.
                </Trans>
              </Text>,
              <Text noMargin key="link">
                <Link
                  href={gamesDashboardWikiArticle}
                  onClick={() =>
                    Window.openExternalURL(gamesDashboardWikiArticle)
                  }
                >
                  <Trans>Learn more</Trans>
                </Link>
              </Text>,
            ]}
            placement={isMobile ? 'bottom' : 'right'}
            onClose={onCloseTooltip}
            closeWithBackdropClick
          />
        )}
      </div>
    );
  }

  return (
    <Paper
      square={false}
      background="dark"
      style={{
        ...styles.gamesDashboardInfoContainer,
        borderColor: gdevelopTheme.toolbar.separatorColor,
      }}
    >
      <ColumnStackLayout noMargin>
        <div style={styles.gamesDashboardInfoTextContainer}>
          <ColumnStackLayout noMargin>
            <LineStackLayout noMargin alignItems="center">
              <Graphs />
              <Text noMargin>
                <Trans>Games Dashboard</Trans>
              </Text>
            </LineStackLayout>
            <Text noMargin>
              <Trans>
                Share your project online to unlock player engagement analytics,
                player feedback and other functionalities.
              </Trans>
            </Text>
          </ColumnStackLayout>
        </div>
        <Text noMargin>
          <Link
            href={publishingWikiArticle}
            onClick={() => Window.openExternalURL(publishingWikiArticle)}
          >
            <Trans>Learn more</Trans>
          </Link>
        </Text>
        <RaisedButton
          primary
          label={<Trans>Share</Trans>}
          icon={<Publish />}
          onClick={onClickShare}
        />
      </ColumnStackLayout>
    </Paper>
  );
};

export default GamesDashboardInfo;
