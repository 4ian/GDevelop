// @ts-check
import React from 'react';
import { Column, Line } from '../../UI/Grid';
import Text from '../../UI/Text';

const styles = {
  achievementsContainer: {
    maxHeight: 250,
    overflowY: 'scroll',
  },
};

const AchievementList = props => {
  const achievements = [
    'First tweet',
    'First Publication',
    '1000 players',
    '1000 players',
    '1000 players',
    '1000 players',
    '1000 players',
  ];
  return (
    <Column>
      <div style={styles.achievementsContainer}>
        {achievements.map(achievement => (
          <Line>
            <Text>{achievement}</Text>
          </Line>
        ))}
      </div>
    </Column>
  );
};

export default AchievementList;
