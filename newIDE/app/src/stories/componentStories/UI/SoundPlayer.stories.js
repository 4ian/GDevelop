// @flow
import * as React from 'react';

import paperDecorator from '../../PaperDecorator';

import SoundPlayer from '../../../UI/SoundPlayer';
import { Column } from '../../../UI/Grid';
import Text from '../../../UI/Text';

export default {
  title: 'UI Building Blocks/SoundPlayer',
  component: SoundPlayer,
  decorators: [paperDecorator],
};

const sounds = [
  'https://asset-resources.gdevelop.io/public-resources/Music/Fantasy/47015d883b0004880ab7752e27507f434eb9617a17d9ab14fa543fe64a65fe02_Magical Transition.aac',
  'https://asset-resources.gdevelop.io/staging/public-resources/Space%20Shooter%20by%20Pixel%20boy/Sound/fd9ef457624f189e13776de12f581f733c7b2ee563a9c3f967ed57e556d7d74e_Boss%20Death.aac',
  'https://asset-resources.gdevelop.io/staging/public-resources/Music/Comedy/226c49a40b52068e2f1a80bbcc6ef6461bda024dc981db0d4d018223f75e2bc9_Comic%20Game%20Loop%20-%20Mischief.aac',
];

export const Default = () => {
  const [currentSoundIndex, setCurrentSoundIndex] = React.useState<number>(0);
  const onSkipBack = () => {
    setCurrentSoundIndex(_currentSoundIndex => {
      if (_currentSoundIndex === 0) {
        return sounds.length - 1;
      } else {
        return _currentSoundIndex - 1;
      }
    });
  };
  const onSkipForward = () => {
    setCurrentSoundIndex(_currentSoundIndex => {
      if (_currentSoundIndex >= sounds.length - 1) {
        return 0;
      } else {
        return _currentSoundIndex + 1;
      }
    });
  };
  const currentPlayingSound = sounds[currentSoundIndex];
  return (
    <Column>
      <SoundPlayer
        soundSrc={currentPlayingSound}
        onSoundLoaded={() => console.log('Sound is loaded')}
        onSkipBack={onSkipBack}
        onSkipForward={onSkipForward}
      />
      <Text>Current playing sound: {currentPlayingSound}</Text>
    </Column>
  );
};
