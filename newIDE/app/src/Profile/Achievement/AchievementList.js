// @flow
import * as React from 'react';
import { I18n } from '@lingui/react';
import { parseISO } from 'date-fns';
import Lock from '../../UI/CustomSvgIcons/Lock';
import { Column, Line } from '../../UI/Grid';
import Text from '../../UI/Text';
import DotBadge from '../../UI/DotBadge';

import {
  compareAchievements,
  type Badge as BadgeType,
  type Achievement,
  type AchievementWithBadgeData,
} from '../../Utils/GDevelopServices/Badge';
import ScrollView from '../../UI/ScrollView';

type Props = {|
  badges: Array<BadgeType>,
  achievements: Array<Achievement>,
  displayUnclaimedAchievements: boolean,
  displayNotifications: boolean,
|};

const styles = {
  achievementsContainer: {
    maxHeight: 250,
  },
  lockedAchievement: {
    opacity: 0.4,
  },
  unlockedAchievement: {},
};

const AchievementList = ({
  badges,
  achievements,
  displayUnclaimedAchievements,
  displayNotifications,
}: Props) => {
  const [
    achievementsWithBadgeData,
    setAchievementsWithBadgeData,
  ] = React.useState<Array<AchievementWithBadgeData>>([]);

  React.useEffect(
    () => {
      const badgeByAchievementId = badges.reduce((acc, badge) => {
        acc[badge.achievementId] = badge;
        return acc;
      }, {});

      const achievementsWithBadgeData = achievements.reduce(
        (acc, achievement) => {
          const badge = badgeByAchievementId[achievement.id];
          const hasBadge = !!badge;
          if (hasBadge || (!hasBadge && displayUnclaimedAchievements)) {
            acc.push({
              ...achievement,
              seen: hasBadge ? badge.seen : undefined,
              unlockedAt: hasBadge ? parseISO(badge.unlockedAt) : null,
            });
          }

          return acc;
        },
        []
      );

      achievementsWithBadgeData.sort(compareAchievements);

      setAchievementsWithBadgeData(achievementsWithBadgeData);
    },
    [badges, achievements, displayUnclaimedAchievements]
  );

  return (
    <Column noMargin>
      <I18n>
        {({ i18n }) => (
          <ScrollView style={styles.achievementsContainer}>
            {achievementsWithBadgeData.map(achievementWithBadgeData => (
              <Line
                key={achievementWithBadgeData.id}
                justifyContent="space-between"
              >
                <Column justifyContent="center" alignItems="flex-start">
                  <DotBadge
                    invisible={
                      !(
                        displayNotifications &&
                        achievementWithBadgeData.seen === false
                      )
                    }
                  >
                    <Text
                      noMargin
                      size="sub-title"
                      style={
                        achievementWithBadgeData.unlockedAt
                          ? styles.unlockedAchievement
                          : styles.lockedAchievement
                      }
                    >
                      {achievementWithBadgeData.name}
                    </Text>
                  </DotBadge>
                  {displayUnclaimedAchievements && (
                    <Text
                      noMargin
                      style={
                        achievementWithBadgeData.unlockedAt
                          ? styles.unlockedAchievement
                          : styles.lockedAchievement
                      }
                      size="body2"
                    >
                      {achievementWithBadgeData.description}
                    </Text>
                  )}
                </Column>
                <Column>
                  {achievementWithBadgeData.unlockedAt ? (
                    <Text>
                      {i18n.date(achievementWithBadgeData.unlockedAt)}
                    </Text>
                  ) : (
                    <Lock style={styles.lockedAchievement} />
                  )}
                </Column>
              </Line>
            ))}
          </ScrollView>
        )}
      </I18n>
    </Column>
  );
};

export default AchievementList;
