// @flow

import * as React from 'react';
import FlatButton from '../UI/FlatButton';
import { Trans } from '@lingui/macro';
import DashboardWidget from './DashboardWidget';
import ArrowRight from '../UI/CustomSvgIcons/ArrowRight';

type Props = {|
  feedbacks: Array<any>,
  onSeeAll: () => void,
|};

const FeedbackWidget = ({ onSeeAll }: Props) => {
  return (
    <DashboardWidget
      gridSize={1}
      title={<Trans>Feedbacks</Trans>}
      seeMoreButton={
        <FlatButton
          label={<Trans>See all</Trans>}
          rightIcon={<ArrowRight fontSize="small" />}
          onClick={onSeeAll}
          primary
        />
      }
    />
  );
};

export default FeedbackWidget;
