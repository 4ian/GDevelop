// @flow

import * as React from 'react';
import paperDecorator from '../../../PaperDecorator';
import ShareLink from '../../../../UI/ShareDialog/ShareLink';

export default {
  title: 'UI Building Blocks/ShareDialog/ShareLink',
  component: ShareLink,
  decorators: [paperDecorator],
};

export const DefaultShareLink = () => (
  <ShareLink url={'https://gd.games/username/game-slug'} />
);
