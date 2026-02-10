// @flow

import * as React from 'react';
import paperDecorator from '../../../PaperDecorator';
import ShareLink from '../../../../UI/ShareDialog/ShareLink';

export default {
  title: 'UI Building Blocks/ShareDialog/ShareLink',
  component: ShareLink,
  decorators: [paperDecorator],
};

// $FlowFixMe[signature-verification-failure]
export const DefaultShareLink = () => (
  <ShareLink url={'https://gd.games/username/game-slug'} />
);
