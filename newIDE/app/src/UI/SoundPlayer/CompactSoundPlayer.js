// @flow

import * as React from 'react';
import IconButton from '@material-ui/core/IconButton';
import CircularProgress from '@material-ui/core/CircularProgress';
import Play from '../CustomSvgIcons/Play';
import Pause from '../CustomSvgIcons/Pause';
import { useIsMounted } from '../../Utils/UseIsMounted';

type Props = {|
  soundSrc: string | null,
  onSoundLoaded?: () => void,
  onSoundError?: () => void,
|};

const CompactSoundPlayer = ({
  soundSrc,
  onSoundLoaded,
  onSoundError,
}: Props) => {
  const audioRef = React.useRef<?HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isAudioLoaded, setIsAudioLoaded] = React.useState(false);
  const isMountedRef = useIsMounted();
  const abortControllerRef = React.useRef<?AbortController>(null);

  const cleanupAudioAndListeners = React.useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.pause();
    abortControllerRef.current?.abort();

    audio.src = '';
    audioRef.current = null;
    abortControllerRef.current = null;
    setIsPlaying(false);
    setIsLoading(false);
    setIsAudioLoaded(false);
  }, []);

  const initializeAudio = React.useCallback(
    () => {
      if (!soundSrc || audioRef.current) return;

      setIsLoading(true);
      const audio = new Audio(soundSrc);
      audio.loop = false;

      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      const handleLoadedMetadata = () => {
        if (!isMountedRef.current) return;
        setIsLoading(false);
        setIsAudioLoaded(true);
        if (onSoundLoaded) onSoundLoaded();
      };

      const handleError = () => {
        if (!isMountedRef.current) return;
        setIsLoading(false);
        if (onSoundError) onSoundError();
      };

      const handleEnded = () => {
        if (!isMountedRef.current) return;
        setIsPlaying(false);
      };

      audio.addEventListener('loadedmetadata', handleLoadedMetadata, {
        signal: abortController.signal,
      });
      audio.addEventListener('error', handleError, {
        signal: abortController.signal,
      });
      audio.addEventListener('ended', handleEnded, {
        signal: abortController.signal,
      });

      audioRef.current = audio;
      audio.play().catch(() => {
        if (isMountedRef.current) {
          setIsPlaying(false);
        }
      });
    },
    [soundSrc, onSoundLoaded, onSoundError]
  );

  const onPlayPause = React.useCallback(
    () => {
      if (!soundSrc) return;

      if (!isAudioLoaded && !isLoading) {
        setIsPlaying(true);
        initializeAudio();
      } else if (isAudioLoaded) {
        setIsPlaying(_isPlaying => !_isPlaying);
      }
    },
    [soundSrc, isAudioLoaded, isLoading, initializeAudio]
  );

  React.useEffect(
    () => {
      if (!audioRef.current || !isAudioLoaded) return;

      if (isPlaying) {
        audioRef.current.play().catch(() => {
          setIsPlaying(false);
        });
      } else {
        audioRef.current.pause();
      }
    },
    [isPlaying, isAudioLoaded]
  );

  React.useEffect(
    () => {
      return () => {
        cleanupAudioAndListeners();
      };
    },
    [soundSrc, cleanupAudioAndListeners]
  );

  if (!soundSrc) {
    return null;
  }

  if (isLoading) {
    return (
      <IconButton size="small" disabled>
        <CircularProgress size={24} />
      </IconButton>
    );
  }

  return (
    <IconButton size="small" onClick={onPlayPause}>
      {isPlaying ? <Pause /> : <Play />}
    </IconButton>
  );
};

export default CompactSoundPlayer;
