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
import RaisedButton from '../../../../UI/RaisedButton';
import Window from '../../../../Utils/Window';
import Coin from '../../../../Credits/Icons/Coin';
import { selectMessageByLocale } from '../../../../Utils/i18n/MessageByLocale';
import { I18n } from '@lingui/react/cjs/react.production.min';
import CreditsStatusBanner from '../../../../Credits/CreditsStatusBanner';

type Props = {|
  achievements: ?Array<Achievement>,
  badges: ?Array<Badge>,
  onOpenProfile: () => void,
|};

const getAchievement = (achievements: ?Array<Achievement>, id: string) =>
  achievements && achievements.find(achievement => achievement.id === id);

const hasBadge = (badges: ?Array<Badge>, achievementId: string) =>
  !!badges && badges.some(badge => badge.achievementId === achievementId);

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
  },
};

const BadgeItem = ({
  achievements,
  badges,
  achievementId,
  buttonLabel,
  linkUrl,
}: {|
  achievements: ?Array<Achievement>,
  badges: ?Array<Badge>,
  achievementId: string,
  buttonLabel: React.Node,
  linkUrl: string,
|}) => {
  const achievement = getAchievement(achievements, achievementId);
  const hasThisBadge = hasBadge(badges, achievementId);

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
                <Text align="center" size="body" noMargin>
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
                      ''}
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
                    ''}
                </Trans>
              </Text>
              <Text size="body" noMargin>
                <Trans>
                  Worth {achievement ? achievement.rewardValueInCredits : '-'}{' '}
                  credits.
                </Trans>
              </Text>
            </Column>
            <RaisedButton
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

export const EarnBadges = ({ achievements, badges, onOpenProfile }: Props) => {
  return (
    <Column noMargin expand>
      <CreditsStatusBanner
        displayPurchaseAction={false}
        actionButtonLabel={<Trans>Claim credits</Trans>}
        onActionButtonClick={onOpenProfile}
      />
      <LargeSpacer />
      <ResponsiveLineStackLayout noMargin expand alignItems="stretch">
        <BadgeItem
          achievementId={'github-star'}
          achievements={achievements}
          badges={badges}
          buttonLabel={<Trans>Star GDevelop on GitHub</Trans>}
          linkUrl={'https://github.com/4ian/GDevelop'}
        />
        <BadgeItem
          achievementId={'tiktok-follow'}
          achievements={achievements}
          badges={badges}
          buttonLabel={<Trans>Follow</Trans>}
          linkUrl={'https://www.tiktok.com/@gdevelop'}
        />
        <BadgeItem
          achievementId={'twitter-follow'}
          achievements={achievements}
          badges={badges}
          buttonLabel={<Trans>Follow</Trans>}
          linkUrl={'https://x.com/GDevelopApp'}
        />
      </ResponsiveLineStackLayout>
    </Column>
  );
};
