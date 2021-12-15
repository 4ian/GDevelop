// @flow
import React, { useEffect, useState } from 'react';
import { I18n } from '@lingui/react';
import { parseISO } from 'date-fns';
import Lock from '@material-ui/icons/Lock';

import { Column, Line } from '../../UI/Grid';
import Text from '../../UI/Text';
import {
  compareAchievements,
  type Badge,
  type Achievement,
  type AchievementWithBadgeData,
} from '../../Utils/GDevelopServices/Badge';
import ScrollView from '../../UI/ScrollView';

type Props = {|
  badges: Array<Badge>,
  achievements: Array<Achievement>,
  displayUnclaimedAchievements: boolean,
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
}: Props) => {
  const [
    achievementsWithBadgeData,
    setAchievementsWithBadgeData,
  ] = useState<Array<AchievementWithBadgeData>>([]);

  useEffect(
    () => {
      const badgeByAchievementId = badges.reduce((acc, badge) => {
        acc[badge.achievementId] = badge;
        return acc;
      }, {});

      const achievementsWithBadgeData = achievements.reduce((acc, achievement) => {
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
      }, []);

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
            {achievementsWithBadgeData.map(
              achievement =>
                achievement && (
                  <Line key={achievement.id} justifyContent="space-between">
                    <Column justifyContent="center">
                      <Text
                        noMargin
                        style={
                          achievement.unlockedAt
                            ? styles.unlockedAchievement
                            : styles.lockedAchievement
                        }
                      >
                        {achievement.name}
                      </Text>
                      {displayUnclaimedAchievements && (
                        <Text
                          noMargin
                          style={
                            achievement.unlockedAt
                              ? styles.unlockedAchievement
                              : styles.lockedAchievement
                          }
                          size="body2"
                        >
                          {achievement.description}
                        </Text>
                      )}
                    </Column>
                    <Column>
                      {achievement.unlockedAt ? (
                        <Text>{i18n.date(achievement.unlockedAt)}</Text>
                      ) : (
                        <Lock style={styles.lockedAchievement} />
                      )}
                    </Column>
                  </Line>
                )
            )}
          </ScrollView>
        )}
      </I18n>
    </Column>
  );
};

export default AchievementList;
