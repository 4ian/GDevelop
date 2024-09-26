// @flow
import * as React from 'react';

import paperDecorator from '../../PaperDecorator';

import SoundPlayer from '../../../UI/SoundPlayer';

export default {
  title: 'UI Building Blocks/SoundPlayer',
  component: SoundPlayer,
  decorators: [paperDecorator],
};

export const Default = () => (
  <SoundPlayer soundSrc="https://asset-resources.gdevelop.io/public-resources/Music/Fantasy/47015d883b0004880ab7752e27507f434eb9617a17d9ab14fa543fe64a65fe02_Magical Transition.aac" />
);
