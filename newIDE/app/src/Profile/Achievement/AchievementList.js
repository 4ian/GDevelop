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

const AchievementList = ({
  badges,
  achievements,
  displayUnclaimedAchievements,
}: Props) => {
  const [formattedAchievements, setFormattedAchievements] = useState([]);

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
      let formattedAchievements = [];
      if (displayUnclaimedAchievements) {
        const badgeByAchievementId = badges.reduce((acc, badge) => {
          acc[badge.achievementId] = badge;
          return acc;
        }, {});

        formattedAchievements = achievements.map(achievement => {
          if (!!badgeByAchievementId[achievement.id]) {
            return {
              ...achievement,
              unlockedAt: badgeByAchievementId[achievement.id].unlockedAt,
            };
          }
          return achievement;
        });
      } else {
        formattedAchievements = badges.map(badge => {
          return {
            ...achievements.find(
              achievement => achievement.id === badge.achievementId
            ),
            unlockedAt: badge.unlockedAt,
          };
        });
      }
      formattedAchievements.sort((a, b) => {
        if (a.unlockedAt && b.unlockedAt) {
          return parseISO(b.unlockedAt) - parseISO(a.unlockedAt);
        } else if (a.unlockedAt && !b.unlockedAt) {
          return -1;
        } else if (!a.unlockedAt && b.unlockedAt) {
          return 1;
        } else {
          return 0;
        }
      });
      setFormattedAchievements(formattedAchievements);
    },
    [badges, achievements, displayUnclaimedAchievements]
  );

  return (
    <Column>
      <I18n>
        {({ i18n }) => (
          <ScrollView style={styles.achievementsContainer}>
            {formattedAchievements.map(achievement => (
              <Line
                key={achievement.id}
                justifyContent="space-between"
                padding="0 20px"
              >
                <Text
                  style={
                    achievement.unlockedAt
                      ? styles.unlockedAchievement
                      : styles.lockedAchievement
                  }
                >
                  {achievement.name}
                </Text>
                {achievement.unlockedAt ? (
                  <Text>{i18n.date(parseISO(achievement.unlockedAt))}</Text>
                ) : (
                  <Lock style={styles.lockedAchievement} />
                )}
              </Line>
            ))}
          </ScrollView>
        )}
      </I18n>
    </Column>
  );
};

export default AchievementList;
