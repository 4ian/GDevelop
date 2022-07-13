// @flow

import * as React from 'react';
import muiDecorator from '../../../ThemeDecorator';
import paperDecorator from '../../../PaperDecorator';
import SocialShareButtons from '../../../../UI/ShareDialog/SocialShareButtons';

export default {
  title: 'UI Building Blocks/ShareDialog/SocialShareButtons',
  component: SocialShareButtons,
  decorators: [paperDecorator, muiDecorator],
};

export const DefaultSocialShareButtons = () => (
  <SocialShareButtons url={'https://liluo.io/username/game-slug'} />
);
