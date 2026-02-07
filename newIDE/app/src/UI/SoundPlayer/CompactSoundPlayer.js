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

const CompactSoundPlayer = React.forwardRef<Props>(
  ({ soundSrc, onSoundLoaded, onSoundError }, ref) => {
    const audioRef = React.useRef<?Audio>(null);
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
        if (onSoundLoaded) onSoundLoaded();
      },
      [onSoundLoaded]
    );

    React.useEffect(
      () => {
        if (!audioRef.current) return;
        if (isPlaying) {
          audioRef.current.play();
        } else {
          audioRef.current.pause();
        }
      },
      [isPlaying]
    );

    React.useEffect(
      () => {
        if (soundSrc) {
          if (audioRef.current) {
            audioRef.current.pause();
          }
          const audio = new Audio(soundSrc);
          audio.loop = true;
          audio.addEventListener('loadstart', onLoad);
          audio.addEventListener('loadedmetadata', onAudioReady);
          audio.addEventListener('error', () => {
            if (onSoundError) onSoundError();
          });
          audioRef.current = audio;
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
