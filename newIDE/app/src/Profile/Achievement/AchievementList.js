// @flow
import React from 'react';

import { Column, Line } from '../../UI/Grid';
import Text from '../../UI/Text';
import { type Badge } from '../../Utils/GDevelopServices/User';

type Props = {|
  badges: Array<Badge>,
|};

const styles = {
  achievementsContainer: {
    maxHeight: 250,
    overflowY: 'scroll',
  },
};

const AchievementList = ({ badges }: Props) => {
  console.log(badges);
  return (
    <Column>
      <div style={styles.achievementsContainer}>
        {badges.map(badge => (
          <Line>
            <Text>{badge.achievementId}</Text>
          </Line>
        ))}
      </div>
    </Column>
  );
};

export default AchievementList;
