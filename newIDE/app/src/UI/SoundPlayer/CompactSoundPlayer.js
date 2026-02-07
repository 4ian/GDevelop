// @flow

import * as React from 'react';
import IconButton from '@material-ui/core/IconButton';
import Play from '../CustomSvgIcons/Play';
import Pause from '../CustomSvgIcons/Pause';

type Props = {|
  soundSrc: string | null,
  onSoundLoaded?: () => void,
  onSoundError?: () => void,
|};

export type CompactSoundPlayerInterface = {|
  playPause: (forcePlay: boolean) => void,
|};

const CompactSoundPlayer = React.forwardRef<Props, CompactSoundPlayerInterface>(
  (
    { soundSrc, onSoundLoaded, onSoundError },
    ref
  ) => {
    const mobileAudioRef = React.useRef<?Audio>(null);
    const [isPlaying, setIsPlaying] = React.useState(false);

    const onPlayPause = React.useCallback(
      (forcePlay?: boolean) => {
        if (!soundSrc) return;
        setIsPlaying(_isPlaying => forcePlay || !_isPlaying);
      },
      [soundSrc]
    );

    const onLoad = React.useCallback(() => {
      setIsPlaying(false);
    }, []);

    const onAudioReady = React.useCallback(
      () => {
        if (!mobileAudioRef.current) return;
        if (onSoundLoaded) onSoundLoaded();
      },
      [onSoundLoaded]
    );

    React.useImperativeHandle(ref, () => ({
      playPause: onPlayPause,
    }));

    React.useEffect(
      () => {
        if (!mobileAudioRef.current) return;
        if (isPlaying) {
          mobileAudioRef.current.play();
        } else {
          mobileAudioRef.current.pause();
        }
      },
      [isPlaying]
    );

    React.useEffect(
      () => {
        if (soundSrc) {
          if (mobileAudioRef.current) {
            mobileAudioRef.current.pause();
          }
          const audio = new Audio(soundSrc);
          audio.loop = true;
          audio.addEventListener('loadstart', onLoad);
          audio.addEventListener('loadedmetadata', onAudioReady);
          audio.addEventListener('error', () => {
            if (onSoundError) onSoundError();
          });
          mobileAudioRef.current = audio;
        }
        onLoad();
      },
      [soundSrc, onLoad, onAudioReady, onSoundError]
    );

    if (!soundSrc) {
      return null;
    }

    return (
      <IconButton size="small" onClick={() => onPlayPause()}>
        {isPlaying ? <Pause /> : <Play />}
      </IconButton>
    );
  }
);

export default CompactSoundPlayer;
