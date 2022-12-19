// @flow

import * as React from 'react';
import { Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';

import { ResponsiveLineStackLayout } from '../../UI/Layout';
import Text from '../../UI/Text';
import { Column, Line, Spacer } from '../../UI/Grid';
import Card from '../../UI/Card';

import Rating from './Rating';

import {
  type Comment,
  type GameRatings,
} from '../../Utils/GDevelopServices/Play';
import { getRatings } from './FeedbackCard';

type Props = {|
  feedbacks: Array<Comment>,
|};

const FeedbackAverageCard = ({ feedbacks }: Props) => {
  if (feedbacks.length === 0) return null;

  const ratings = feedbacks.map(feedback => feedback.ratings).filter(Boolean);
  const ratingsSum: GameRatings = ratings.reduce(
    (acc, rating) => {
      if (!rating) return acc;
      return {
        sound: acc.sound + rating.sound,
        visuals: acc.visuals + rating.visuals,
        fun: acc.fun + rating.fun,
        easeOfUse: acc.easeOfUse + rating.easeOfUse,
        version: 1,
      };
    },
    { sound: 0, visuals: 0, fun: 0, easeOfUse: 0, version: 1 }
  );
  const averageRatingValues = {
    sound: ratingsSum.sound / ratings.length,
    visuals: ratingsSum.visuals / ratings.length,
    fun: ratingsSum.fun / ratings.length,
    easeOfUse: ratingsSum.easeOfUse / ratings.length,
    version: 1,
  };
  const displayedRatings = getRatings(averageRatingValues);

  return (
    <I18n>
      {({ i18n }) => (
        <Card background="dark">
          <Column noMargin>
            <Line noMargin justifyContent="space-between" alignItems="start">
              <Column noMargin>
                <Text color="primary" size="block-title">
                  <Trans>Average user feedback</Trans>
                </Text>
              </Column>
            </Line>
            <Spacer />
            {displayedRatings && (
              <ResponsiveLineStackLayout noColumnMargin expand>
                {displayedRatings.map(rating => (
                  <Line expand noMargin key={rating.key}>
                    <Rating label={rating.label} value={rating.value} />
                    <Spacer />
                  </Line>
                ))}
              </ResponsiveLineStackLayout>
            )}
          </Column>
        </Card>
      )}
    </I18n>
  );
};

export default FeedbackAverageCard;
