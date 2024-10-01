// @flow

import * as React from 'react';
import WavesurferPlayer from './WaveSurfer';
import { Column, Line } from '../Grid';
import PlayButton from './PlayButton';
import Text from '../Text';
import { formatDuration } from '../../Utils/Duration';
import GDevelopThemeContext from '../Theme/GDevelopThemeContext';

type Props = {|
  soundSrc: string | null,
  onSoundLoaded: () => void,
|};

export type SoundPlayerInterface = {|
  playPause: (forcePlay: boolean) => void,
|};

const SoundPlayer = React.forwardRef<Props, SoundPlayerInterface>(
  ({ soundSrc, onSoundLoaded }, ref) => {
    const gdevelopTheme = React.useContext(GDevelopThemeContext);
    const waveSurferRef = React.useRef<?any>(null);
    const [duration, setDuration] = React.useState<?number>(null);
    const [time, setTime] = React.useState<?number>(null);
    const [isPlaying, setIsPlaying] = React.useState(false);

    const onReady = React.useCallback(
      ws => {
        waveSurferRef.current = ws;
        setDuration(Math.round(ws.getDuration()));
        setTime(0);
        onSoundLoaded();
      },
      [onSoundLoaded]
    );

    const onLoad = React.useCallback(() => {
      setIsPlaying(false);
      setTime(null);
      setDuration(null);
    }, []);

    React.useEffect(
      () => {
        if (!waveSurferRef.current) return;
        if (isPlaying) waveSurferRef.current.play();
        else waveSurferRef.current.pause();
      },
      [isPlaying]
    );

    const onPlayPause = React.useCallback(
      (forcePlay?: boolean) => {
        if (!soundSrc) return;
        setIsPlaying(_isPlaying => forcePlay || !_isPlaying);
      },
      [soundSrc]
    );

    const onFinishPlaying = React.useCallback(() => {
      setIsPlaying(false);
    }, []);

    React.useImperativeHandle(ref, () => ({
      playPause: onPlayPause,
    }));

    const onTimeupdate = React.useCallback(() => {
      if (waveSurferRef.current)
        setTime(waveSurferRef.current.getCurrentTime());
    }, []);

    return (
      <Line alignItems="center">
        <Column>
          <PlayButton
            primary
            isPlaying={isPlaying}
            onClick={() => onPlayPause()}
          />
        </Column>
        <Column expand>
          <WavesurferPlayer
            url={soundSrc}
            waveColor={gdevelopTheme.soundPlayer.waveColor}
            progressColor={gdevelopTheme.soundPlayer.progressColor}
            barWidth={2}
            barGap={1}
            barRadius={3}
            height={'auto'}
            normalize
            onReady={onReady}
            onTimeupdate={onTimeupdate}
            onLoad={onLoad}
            onFinish={onFinishPlaying}
          />
        </Column>
        <Column>
          <Line>
            <Text noMargin>
              {typeof time !== 'number' ? '..' : formatDuration(time)}
            </Text>
            &nbsp;
            <Text noMargin color="secondary">
              / {typeof duration !== 'number' ? '..' : formatDuration(duration)}
            </Text>
          </Line>
        </Column>
      </Line>
    );
  }
);

export default SoundPlayer;
