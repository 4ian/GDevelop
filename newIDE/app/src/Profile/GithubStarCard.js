// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import Text from '../UI/Text';
import { CalloutCard } from '../UI/CalloutCard';
import { ColumnStackLayout, ResponsiveLineStackLayout } from '../UI/Layout';
import TextButton from '../UI/TextButton';
import Window from '../Utils/Window';
import RaisedButton from '../UI/RaisedButton';
import { Spacer } from '../UI/Grid';
import { type Badge, type Achievement } from '../Utils/GDevelopServices/Badge';

type Props = {|
  achievements: ?Array<Achievement>,
  onOpenProfile: () => void,
|};

export const shouldDisplayGithubStarCard = ({
  badges,
}: {|
  badges: ?Array<Badge>,
|}) => {
  return (
    !badges || !badges.some(badge => badge.achievementId === 'github-star')
  );
};

export const GithubStarCard = ({ onOpenProfile, achievements }: Props) => {
  const githubStarAchievement =
    (achievements &&
      achievements.find(achievement => achievement.id === 'github-star')) ||
    null;

  return (
    <CalloutCard
      renderImage={style => (
        <img
          src="res/github-star-credits.svg"
          alt="Star on GitHub"
          style={style}
        />
      )}
    >
      <ResponsiveLineStackLayout noMargin expand alignItems="stretch">
        <ColumnStackLayout alignItems="flex-start" expand noMargin>
          <Text size="block-title">
            <Trans>Star GDevelop on GitHub and win credits</Trans>
          </Text>
          <Text size="body">
            <Trans>
              Get{' '}
              {(githubStarAchievement &&
                githubStarAchievement.rewardValueInCredits) ||
                '-'}{' '}
              credits by liking GDevelop on GitHub to help the open-source
              project gain visiblity. To collect your credits, make sure to add
              your GitHub user name to your in-app profile.
            </Trans>
          </Text>
        </ColumnStackLayout>
        <Spacer />
        <ColumnStackLayout justifyContent="center" alignItems="center" noMargin>
          <RaisedButton
            label={<Trans>Star GDevelop on GitHub</Trans>}
            primary
            fullWidth
            onClick={() => {
              Window.openExternalURL('https://github.com/4ian/GDevelop');
            }}
          />
          <TextButton
            label={<Trans>Claim credits</Trans>}
            fullWidth
            onClick={onOpenProfile}
          />
        </ColumnStackLayout>
      </ResponsiveLineStackLayout>
    </CalloutCard>
  );
};
