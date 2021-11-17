// @flow
import React, { useEffect, useState } from 'react';
import { DateFormat } from '@lingui/macro';
import { parseISO } from 'date-fns';

import { Column, Line } from '../../UI/Grid';
import Text from '../../UI/Text';
import {
  type Badge,
  type Achievement,
} from '../../Utils/GDevelopServices/User';

type Props = {|
  badges: Array<Badge>,
  achievements: Array<Achievement>,
|};

const achievementBaseline = {
  width: '100%',
  padding: '0 20px',
};

const styles = {
  achievementsContainer: {
    maxHeight: 250,
    overflowY: 'scroll',
  },
  unlockedAchievement: {
    ...achievementBaseline,
    color: 'green',
    display: 'flex',
    justifyContent: 'space-between',
  },
  lockedAchievement: {
    ...achievementBaseline,
    color: '#CCCCCC',
  },
};

const AchievementList = ({ badges, achievements }: Props) => {
  const [formattedAchievements, setFormattedAchievements] = useState([]);
  useEffect(
    () => {
      const badgeByAchievementId = badges.reduce((acc, badge) => {
        acc[badge.achievementId] = badge;
        return acc;
      }, {});

      const formattedAchievements = achievements.map(achievement => {
        if (Object.keys(badgeByAchievementId).includes(achievement.id)) {
          return {
            ...achievement,
            unlockedAt: badgeByAchievementId[achievement.id].unlockedAt,
          };
        } else {
          return achievement;
        }
      });
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
    [badges, achievements]
  );

  return (
    <Column>
      <div style={styles.achievementsContainer}>
        {formattedAchievements.map(achievement => (
          <Line key={achievement.id}>
            <div
              style={
                achievement.unlockedAt
                  ? styles.unlockedAchievement
                  : styles.lockedAchievement
              }
            >
              <Text>{achievement.name}</Text>
              {achievement.unlockedAt && (
                <Text>
                  <DateFormat>{achievement.unlockedAt}</DateFormat>
                </Text>
              )}
            </div>
          </Line>
        ))}
      </div>
    </Column>
  );
};

export default AchievementList;
