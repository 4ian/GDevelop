// @flow

import * as React from 'react';
import paperDecorator from '../../../PaperDecorator';
import SocialShareButtons from '../../../../UI/ShareDialog/SocialShareButtons';

export default {
  title: 'UI Building Blocks/ShareDialog/SocialShareButtons',
  component: SocialShareButtons,
  decorators: [paperDecorator],
};

export const DefaultSocialShareButtons = () => (
  <SocialShareButtons url={'https://gd.games/username/game-slug'} />
);
