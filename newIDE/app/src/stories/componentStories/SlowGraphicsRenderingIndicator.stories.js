// @flow
import * as React from 'react';

import paperDecorator from '../PaperDecorator';
import FixedHeightFlexContainer from '../FixedHeightFlexContainer';
import SlowGraphicsRenderingIndicator from '../../SlowGraphicsRendering/SlowGraphicsRenderingIndicator';
import { type SlowGraphicsRenderingReason } from '../../SlowGraphicsRendering';

export default {
  title: 'SlowGraphicsRenderingIndicator',
  component: SlowGraphicsRenderingIndicator,
  decorators: [paperDecorator],
};

const IndicatorStory = ({
  slowGraphicsRenderingReason,
}: {|
  slowGraphicsRenderingReason: SlowGraphicsRenderingReason,
|}) => (
  <FixedHeightFlexContainer
    height={500}
    justifyContent="center"
    alignItems="center"
  >
    <SlowGraphicsRenderingIndicator
      mockedSlowGraphicsRenderingReason={slowGraphicsRenderingReason}
    />
  </FixedHeightFlexContainer>
);

export const SoftwareRendering = (): React.Node => (
  <IndicatorStory slowGraphicsRenderingReason="software-rendering" />
);

export const IntegratedGraphicsCard = (): React.Node => (
  <IndicatorStory slowGraphicsRenderingReason="integrated-graphics-card" />
);
