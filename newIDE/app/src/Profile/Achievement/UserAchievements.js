// @flow

import { Trans } from '@lingui/macro';
import React from 'react';

import { Column } from '../../UI/Grid';
import { ResponsiveLineStackLayout } from '../../UI/Layout';
import Text from '../../UI/Text';
import { type Badge } from '../../Utils/GDevelopServices/User';

import AchievementList from './AchievementList';
// $FlowFixMe[missing-export] TODO: check that this is the correct way to import SVG in the project. If yes, follow https://github.com/facebook/flow/issues/7121.
import { ReactComponent as Trophy } from './resources/trophy.svg';

type Props = {|
  badges: ?Array<Badge>,
|};

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

const UserAchievements = ({ badges }: Props) => {
  return (
    <Column>
      <ResponsiveLineStackLayout>
        <div style={styles.leftContainer}>
          <div style={styles.summary}>
            <Trophy height="100px" />
            <Text size="title">
              <Trans>{badges ? badges.length : 0}/3 achievements</Trans>
            </Text>
          </div>
        </div>
        <div style={styles.rightContainer}>
          {badges && badges.length > 0 ? (
            <AchievementList badges={badges} />
          ) : (
            <Text>
              <Trans>No achievement unlocked</Trans>
            </Text>
          )}
        </div>
      </ResponsiveLineStackLayout>
    </Column>
  );
};

export default UserAchievements;
