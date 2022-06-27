// @flow

import * as React from 'react';
import { action } from '@storybook/addon-actions';
import muiDecorator from '../../../ThemeDecorator';
import paperDecorator from '../../../PaperDecorator';
import SocialShareButtons from '../../../../UI/ShareDialog/SocialShareButtons';

export default {
  title: 'UI/ShareDialog/SocialShareButtons',
  component: SocialShareButtons,
  decorators: [muiDecorator, paperDecorator],
};

export const DefaultSocialShareButtons = () => (
  <SocialShareButtons url={'https://liluo.io/username/game-slug'} />
);
