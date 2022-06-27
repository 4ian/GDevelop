// @flow

import * as React from 'react';
import muiDecorator from '../../../ThemeDecorator';
import paperDecorator from '../../../PaperDecorator';
import ShareLink from '../../../../UI/ShareDialog/ShareLink';

export default {
  title: 'UI/ShareDialog/ShareLink',
  component: ShareLink,
  decorators: [muiDecorator, paperDecorator],
};

export const DefaultShareLink = () => (
  <ShareLink url={'https://liluo.io/username/game-slug'} />
);
