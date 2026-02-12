// @flow
import * as React from 'react';

import paperDecorator from '../../PaperDecorator';

import SoundPlayer from '../../../UI/SoundPlayer';

export default {
  title: 'UI Building Blocks/SoundPlayer',
  component: SoundPlayer,
  decorators: [paperDecorator],
};

const sounds = [
  {
    src:
      'https://asset-resources.gdevelop.io/public-resources/Music/Fantasy/47015d883b0004880ab7752e27507f434eb9617a17d9ab14fa543fe64a65fe02_Magical Transition.aac',
    title: 'Magical Transition.aac',
    subtitle: 'CCO',
  },
  {
    src:
      'https://asset-resources.gdevelop.io/staging/public-resources/Space%20Shooter%20by%20Pixel%20boy/Sound/fd9ef457624f189e13776de12f581f733c7b2ee563a9c3f967ed57e556d7d74e_Boss%20Death.aac',
    title: 'Boss Death.aac',
    subtitle: 'MIT',
  },
  {
    src:
      'https://asset-resources.gdevelop.io/staging/public-resources/Music/Comedy/226c49a40b52068e2f1a80bbcc6ef6461bda024dc981db0d4d018223f75e2bc9_Comic%20Game%20Loop%20-%20Mischief.aac',
    title: 'Mischief.aac',
    subtitle: 'CCA 4.0',
  },
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
    <SoundPlayer
      soundSrc={currentPlayingSound.src}
      onSoundLoaded={() => console.log('Sound is loaded')}
      title={currentPlayingSound.title}
      subtitle={currentPlayingSound.subtitle}
      onSkipBack={onSkipBack}
      onSkipForward={onSkipForward}
    />
  );
};
