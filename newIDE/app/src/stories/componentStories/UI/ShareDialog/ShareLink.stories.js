// @flow

import * as React from 'react';
import { action } from '@storybook/addon-actions';
import muiDecorator from '../../../ThemeDecorator';
import paperDecorator from '../../../PaperDecorator';
import ShareLink from '../../../../UI/ShareDialog/ShareLink';

export default {
  title: 'UI/ShareDialog/ShareLink',
  component: ShareLink,
  decorators: [muiDecorator, paperDecorator],
};

export const DefaultShareLink = () => (
  <ShareLink
    buildUrl={'https://liluo.io/username/game-slug'}
    onCopy={() => action('onCopy')()}
    onOpen={() => action('onOpen')()}
  />
);
