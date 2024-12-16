// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import Text from '../../../../UI/Text';
import {
  LineStackLayout,
  ResponsiveLineStackLayout,
} from '../../../../UI/Layout';
import {
  type Badge,
  type Achievement,
} from '../../../../Utils/GDevelopServices/Badge';
import { Column } from '../../../../UI/Grid';
import Window from '../../../../Utils/Window';
import Coin from '../../../../Credits/Icons/Coin';
import { selectMessageByLocale } from '../../../../Utils/i18n/MessageByLocale';
import { I18n } from '@lingui/react';
import { useResponsiveWindowSize } from '../../../../UI/Responsive/ResponsiveWindowMeasurer';
import TextButton from '../../../../UI/TextButton';

type CreditItemType = 'badge' | 'feedback';
type BadgeInfo = {|
  id: string,
  label: React.Node,
  linkUrl: string,
  hasThisBadge?: boolean,
  type: 'badge',
|};
type FeedbackInfo = {|
  id: string,
  type: 'feedback',
|};
type CreditItem = BadgeInfo | FeedbackInfo;

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
  itemPlaceholder: {
    display: 'flex',
    flex: 1,
  },
};

const FeedbackItem = () => {
  return (
    <LineStackLayout expand alignItems="center" noMargin>
      <div style={styles.badgeContainer}>
        <img
          src={'res/badges/empty-badge.svg'}
          alt="Empty badge"
          style={styles.badgeImage}
        />
        <div style={styles.badgeTextContainer}>
          <Coin style={styles.badgeCoinIcon} />
          <Text align="center" size="body" noMargin color="inherit">
            10
          </Text>
        </div>
      </div>
      <Column noMargin expand>
        <Text size="body" noMargin>
          <b>
            <Trans>Community helper</Trans>
          </b>
        </Text>
        <Text size="body" noMargin color="secondary">
          <Trans>Give feedback on a game!</Trans>
        </Text>
      </Column>
      <TextButton
        label={<Trans>Play a game</Trans>}
        secondary
        onClick={() => {
          Window.openExternalURL('https://gd.games/games/random');
        }}
      />
    </LineStackLayout>
  );
};

const allBadgesInfo: BadgeInfo[] = [
  {
    id: 'github-star',
    label: <Trans>Star GDevelop</Trans>,
    linkUrl: 'https://github.com/4ian/GDevelop',
    type: 'badge',
  },
  {
    id: 'tiktok-follow',
    label: <Trans>Follow</Trans>,
    linkUrl: 'https://www.tiktok.com/@gdevelop',
    type: 'badge',
  },
  {
    id: 'twitter-follow',
    label: <Trans>Follow</Trans>,
    linkUrl: 'https://x.com/GDevelopApp',
    type: 'badge',
  },
];

const getAllBadgesWithOwnedStatus = (badges: ?Array<Badge>): BadgeInfo[] => {
  return allBadgesInfo.map(badgeInfo => ({
    ...badgeInfo,
    hasThisBadge: hasBadge(badges, badgeInfo.id),
  }));
};

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
        <LineStackLayout expand alignItems="center" noMargin>
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
            <Text size="body" noMargin color="secondary">
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
          <TextButton
            label={buttonLabel}
            secondary
            onClick={() => {
              Window.openExternalURL(linkUrl);
            }}
            disabled={hasThisBadge}
          />
        </LineStackLayout>
      )}
    </I18n>
  );
};

type Props = {|
  achievements: ?Array<Achievement>,
  badges: ?Array<Badge>,
  onOpenProfile: () => void,
  showRandomItem?: boolean,
  showAllItems?: boolean,
|};

export const EarnCredits = ({
  achievements,
  badges,
  onOpenProfile,
  showRandomItem,
  showAllItems,
}: Props) => {
  const { windowSize, isMobile } = useResponsiveWindowSize();
  const isMobileOrMediumWidth =
    windowSize === 'small' || windowSize === 'medium';

  const allBadgesWithOwnedStatus = React.useMemo(
    () => getAllBadgesWithOwnedStatus(badges),
    [badges]
  );

  const missingBadges = React.useMemo(
    () => {
      return allBadgesWithOwnedStatus.filter(badge => !badge.hasThisBadge);
    },
    [allBadgesWithOwnedStatus]
  );

  const randomItemToShow: ?CreditItemType = React.useMemo(
    () => {
      // If on mobile, and not forcing all items, show only 1 item to avoid taking too much space.
      if (showRandomItem || (isMobile && !showAllItems)) {
        if (missingBadges.length === 0) {
          return 'feedback';
        }

        const totalPossibilities = missingBadges.length + 1; // +1 for feedback
        // Randomize between badge and feedback, with the weight of the number of badges missing.
        const randomIndex = Math.floor(Math.random() * totalPossibilities);
        if (randomIndex === totalPossibilities - 1) {
          return 'feedback';
        }

        return 'badge';
      }

      return null;
    },
    [missingBadges, showRandomItem, showAllItems, isMobile]
  );

  const badgesToShow = React.useMemo(
    () => {
      if (!!randomItemToShow && randomItemToShow !== 'badge') {
        return [];
      }

      if (randomItemToShow === 'badge') {
        if (missingBadges.length === 0) {
          const randomIndex = Math.floor(
            Math.random() * allBadgesWithOwnedStatus.length
          );
          return [allBadgesWithOwnedStatus[randomIndex]];
        }

        const randomIndex = Math.floor(Math.random() * missingBadges.length);
        return [missingBadges[randomIndex]];
      }

      return allBadgesWithOwnedStatus;
    },
    [allBadgesWithOwnedStatus, missingBadges, randomItemToShow]
  );

  const feedbackItemsToShow: FeedbackInfo[] = React.useMemo(
    () => {
      if (!!randomItemToShow && randomItemToShow !== 'feedback') {
        return [];
      }

      return [
        {
          id: 'random-game-feedback',
          type: 'feedback',
        },
      ];
    },
    [randomItemToShow]
  );

  const allItemsToShow: CreditItem[] = React.useMemo(
    () => [...badgesToShow, ...feedbackItemsToShow],
    [badgesToShow, feedbackItemsToShow]
  );

  // Slice items in arrays of two to display them in a responsive way.
  const itemsSlicedInArraysOfTwo: CreditItem[][] = React.useMemo(
    () => {
      const slicedItems: CreditItem[][] = [];
      for (let i = 0; i < allItemsToShow.length; i += 2) {
        slicedItems.push(allItemsToShow.slice(i, i + 2));
      }
      return slicedItems;
    },
    [allItemsToShow]
  );

  const onlyOneItemDisplayed = allItemsToShow.length === 1;

  return (
    <Column noMargin expand>
      <ResponsiveLineStackLayout
        noMargin
        expand
        forceMobileLayout={isMobileOrMediumWidth}
      >
        {itemsSlicedInArraysOfTwo.map((items, index) => (
          <ResponsiveLineStackLayout
            noMargin
            expand={onlyOneItemDisplayed}
            key={`item-line-${index}`}
          >
            {items
              .map(item => {
                if (item.type === 'feedback') {
                  return <FeedbackItem key={item.id} />;
                }

                if (item.type === 'badge') {
                  return (
                    <BadgeItem
                      key={item.id}
                      achievement={getAchievement(achievements, item.id)}
                      hasThisBadge={!!item.hasThisBadge}
                      buttonLabel={item.label}
                      linkUrl={item.linkUrl}
                    />
                  );
                }

                return null;
              })
              .filter(Boolean)}
            {items.length === 1 &&
              !onlyOneItemDisplayed &&
              isMobileOrMediumWidth && <div style={styles.itemPlaceholder} />}
          </ResponsiveLineStackLayout>
        ))}
      </ResponsiveLineStackLayout>
    </Column>
  );
};
