// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import Text from '../../../../UI/Text';
import {
  ColumnStackLayout,
  LineStackLayout,
  ResponsiveLineStackLayout,
} from '../../../../UI/Layout';
import {
  type Badge,
  type Achievement,
} from '../../../../Utils/GDevelopServices/Badge';
import { Column, LargeSpacer } from '../../../../UI/Grid';
import Window from '../../../../Utils/Window';
import Coin from '../../../../Credits/Icons/Coin';
import { selectMessageByLocale } from '../../../../Utils/i18n/MessageByLocale';
import { I18n } from '@lingui/react';
import CreditsStatusBanner from '../../../../Credits/CreditsStatusBanner';
import FlatButton from '../../../../UI/FlatButton';
import { useResponsiveWindowSize } from '../../../../UI/Responsive/ResponsiveWindowMeasurer';

const getAchievement = (achievements: ?Array<Achievement>, id: string) =>
  achievements && achievements.find(achievement => achievement.id === id);

const hasBadge = (badges: ?Array<Badge>, achievementId: string) =>
  !!badges && badges.some(badge => badge.achievementId === achievementId);

export const hasMissingBadges = (
  badges: ?Array<Badge>,
  achievements: ?Array<Achievement>
) =>
  // Not connected
  !badges ||
  !achievements ||
  // Connected but some achievements are not yet claimed
  achievements.some(achievement => !hasBadge(badges, achievement.id));

const styles = {
  badgeContainer: {
    position: 'relative',
    width: 65,
    height: 65,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeImage: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },
  badgeCoinIcon: {
    width: 16,
    height: 16,
  },
  badgeTextContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    gap: 4,
    color: 'white',
  },
};

const BadgeItem = ({
  achievement,
  hasThisBadge,
  buttonLabel,
  linkUrl,
}: {|
  achievement: ?Achievement,
  hasThisBadge: boolean,
  buttonLabel: React.Node,
  linkUrl: string,
|}) => {
  return (
    <I18n>
      {({ i18n }) => (
        <LineStackLayout expand alignItems="center">
          <div style={styles.badgeContainer}>
            <img
              src={
                (hasThisBadge && achievement && achievement.iconUrl) ||
                'res/badges/empty-badge.svg'
              }
              alt="Empty badge"
              style={styles.badgeImage}
            />
            {!hasThisBadge && (
              <div style={styles.badgeTextContainer}>
                <Coin style={styles.badgeCoinIcon} />
                <Text align="center" size="body" noMargin color="inherit">
                  {achievement ? achievement.rewardValueInCredits : ''}{' '}
                </Text>
              </div>
            )}
          </div>
          <ColumnStackLayout noMargin expand alignItems="flex-start">
            <Column noMargin expand>
              <Text size="body" noMargin>
                <b>
                  <Trans>
                    {(achievement &&
                      selectMessageByLocale(i18n, achievement.nameByLocale)) ||
                      '-'}
                  </Trans>
                </b>
              </Text>
              <Text size="body" noMargin>
                <Trans>
                  {(achievement &&
                    selectMessageByLocale(
                      i18n,
                      achievement.shortDescriptionByLocale
                    )) ||
                    '-'}
                </Trans>
              </Text>
            </Column>
            <FlatButton
              label={buttonLabel}
              primary
              onClick={() => {
                Window.openExternalURL(linkUrl);
              }}
              disabled={hasThisBadge}
            />
          </ColumnStackLayout>
        </LineStackLayout>
      )}
    </I18n>
  );
};

const allBadgesInfo = [
  {
    id: 'github-star',
    label: <Trans>Star GDevelop</Trans>,
    linkUrl: 'https://github.com/4ian/GDevelop',
  },
  {
    id: 'twitter-follow',
    label: <Trans>Follow</Trans>,
    linkUrl: 'https://www.tiktok.com/@gdevelop',
  },
  {
    id: 'twitter-follow',
    label: <Trans>Follow</Trans>,
    linkUrl: 'https://x.com/GDevelopApp',
  },
];

type Props = {|
  achievements: ?Array<Achievement>,
  badges: ?Array<Badge>,
  onOpenProfile: () => void,
  hideStatusBanner?: boolean,
  showRandomBadge?: boolean,
  showAllBadges?: boolean,
|};

export const EarnBadges = ({
  achievements,
  badges,
  onOpenProfile,
  hideStatusBanner,
  showRandomBadge,
  showAllBadges,
}: Props) => {
  const { isMobile } = useResponsiveWindowSize();
  const badgesToShow = React.useMemo(
    () => {
      const allBadgesWithOwnedStatus = allBadgesInfo.map(badgeInfo => ({
        ...badgeInfo,
        hasThisBadge: hasBadge(badges, badgeInfo.id),
      }));
      const notOwnedBadges = allBadgesWithOwnedStatus.filter(
        badge => !badge.hasThisBadge
      );

      // If on mobile, and not forcing all badges, show only 1 badge to avoid taking too much space.
      if (showRandomBadge || (isMobile && !showAllBadges)) {
        if (notOwnedBadges.length === 0) {
          const randomIndex = Math.floor(
            Math.random() * allBadgesWithOwnedStatus.length
          );
          return [allBadgesWithOwnedStatus[randomIndex]];
        }

        const randomIndex = Math.floor(Math.random() * notOwnedBadges.length);
        return [notOwnedBadges[randomIndex]];
      }

      return allBadgesWithOwnedStatus;
    },
    [badges, showRandomBadge, isMobile, showAllBadges]
  );

  // Slice badges in arrays of two to display them in a responsive way.
  const badgesSlicedInArraysOfTwo = React.useMemo(
    () => {
      const slicedBadges = [];
      for (let i = 0; i < badgesToShow.length; i += 2) {
        slicedBadges.push(badgesToShow.slice(i, i + 2));
      }
      return slicedBadges;
    },
    [badgesToShow]
  );

  return (
    <Column noMargin expand>
      {!hideStatusBanner && (
        <CreditsStatusBanner
          displayPurchaseAction={false}
          actionButtonLabel={<Trans>Claim credits</Trans>}
          onActionButtonClick={onOpenProfile}
        />
      )}
      <LargeSpacer />
      <ResponsiveLineStackLayout noMargin expand>
        {badgesSlicedInArraysOfTwo.map((badges, index) => (
          <ResponsiveLineStackLayout noMargin>
            {badges.slice(0, 2).map(badge => (
              <BadgeItem
                key={badge.id}
                achievement={getAchievement(achievements, badge.id)}
                hasThisBadge={badge.hasThisBadge}
                buttonLabel={badge.label}
                linkUrl={badge.linkUrl}
              />
            ))}
          </ResponsiveLineStackLayout>
        ))}
      </ResponsiveLineStackLayout>
    </Column>
  );
};
