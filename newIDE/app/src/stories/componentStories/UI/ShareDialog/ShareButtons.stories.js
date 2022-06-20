// @flow

import * as React from 'react';
import { action } from '@storybook/addon-actions';
import muiDecorator from '../../../ThemeDecorator';
import paperDecorator from '../../../PaperDecorator';
import ShareButtons from '../../../../UI/ShareDialog/ShareButtons';

export default {
  title: 'UI/ShareDialog/ShareButtons',
  component: ShareButtons,
  decorators: [muiDecorator, paperDecorator],
};

export const DefaultShareButtons = () => (
  <ShareButtons url={'https://liluo.io/username/game-slug'} />
);
