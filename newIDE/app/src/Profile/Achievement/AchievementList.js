// @flow
import React, { useEffect, useState } from 'react';
import { I18n } from '@lingui/react';
import { parseISO } from 'date-fns';
import Lock from '@material-ui/icons/Lock';

import { Column, Line } from '../../UI/Grid';
import Text from '../../UI/Text';
import {
  type Badge,
  type Achievement,
} from '../../Utils/GDevelopServices/Badge';
import ScrollView from '../../UI/ScrollView';

type Props = {|
  badges: Array<Badge>,
  achievements: Array<Achievement>,
  displayUnclaimedAchievements: boolean,
|};

type FormattedAchievement = {|
  ...Achievement,
  unlockedAt: ?Date,
|};

const AchievementList = ({
  badges,
  achievements,
  displayUnclaimedAchievements,
}: Props) => {
  const [formattedAchievements, setFormattedAchievements] = useState<
    Array<FormattedAchievement>
  >([]);

  const styles = {
    achievementsContainer: {
      maxHeight: 250,
    },
    lockedAchievement: {
      opacity: 0.4,
    },
    unlockedAchievement: {},
  };

  useEffect(
    () => {
      const badgeByAchievementId = badges.reduce((acc, badge) => {
        acc[badge.achievementId] = badge;
        return acc;
      }, {});

      const achievementsWithDate = achievements.reduce((acc, achievement) => {
        const badge = badgeByAchievementId[achievement.id];
        const hasBadge = !!badge;
        if (hasBadge || (!hasBadge && displayUnclaimedAchievements)) {
          acc.push({
            ...achievement,
            unlockedAt: hasBadge ? parseISO(badge.unlockedAt) : null,
          });
        }

        return acc;
      }, []);

      achievementsWithDate.sort((a, b) => {
        if (b.unlockedAt && a.unlockedAt) {
          return b.unlockedAt - a.unlockedAt;
        } else if (a.unlockedAt && !b.unlockedAt) {
          return -1;
        } else if (!a.unlockedAt && b.unlockedAt) {
          return 1;
        } else {
          return 0;
        }
      });

      setFormattedAchievements(achievementsWithDate);
    },
    [badges, achievements, displayUnclaimedAchievements]
  );

  return (
    <Column>
      <I18n>
        {({ i18n }) => (
          <ScrollView style={styles.achievementsContainer}>
            {formattedAchievements.map(
              achievement =>
                achievement && (
                  <Line
                    key={achievement.id}
                    justifyContent="space-between"
                    padding="0 20px"
                  >
                    <Column>
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
                    </Column>
                    {achievement.unlockedAt ? (
                      <Text>{i18n.date(achievement.unlockedAt)}</Text>
                    ) : (
                      <Lock style={styles.lockedAchievement} />
                    )}
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
