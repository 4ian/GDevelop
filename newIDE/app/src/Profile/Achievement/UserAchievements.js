// @ts-check

import React from 'react';
import { Column } from '../../UI/Grid';
import { ResponsiveLineStackLayout } from '../../UI/Layout';
import Text from '../../UI/Text';
import AchievementList from './AchievementList';
import { ReactComponent as Trophy } from './resources/trophy.svg';

const styles = {
  summary: {
    padding: 20,
    textAlign: 'center',
  },
  leftContainer: {
    flex: 1,
    backgroundColor: '#CCCCCC',
    borderRadius: '20px',
    margin: '20px',
  },
  rightContainer: {
    flex: 2,
  },
};

const UserAchievements = props => {
  return (
    <Column>
      <ResponsiveLineStackLayout>
        <div style={styles.leftContainer}>
          <div style={styles.summary}>
            <Trophy height="100px" />
            <Text size="title">0/3 achievements</Text>
          </div>
        </div>
        <div style={styles.rightContainer}>
          <AchievementList />
        </div>
      </ResponsiveLineStackLayout>
    </Column>
  );
};

export default UserAchievements;
