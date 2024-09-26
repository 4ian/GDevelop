// @flow

import * as React from 'react';
import WavesurferPlayer from './WaveSurfer';
import { Column, Line } from '../Grid';
import PlayButton from './PlayButton';
import Text from '../Text';
import { formatDuration } from '../../Utils/Duration';

type Props = {|
  soundSrc: string,
|};

const SoundPlayer = ({ soundSrc }: Props) => {
  const [wavesurfer, setWavesurfer] = React.useState(null);
  const [duration, setDuration] = React.useState<?number>(null);
  const [time, setTime] = React.useState<?number>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);

  const onReady = ws => {
    setWavesurfer(ws);
    setDuration(Math.round(ws.getDuration()));
    setTime(0);
  };

  const onLoad = () => {
    setIsPlaying(false);
    setTime(null);
    setDuration(null);
  };

  const onPlayPause = () => {
    wavesurfer && wavesurfer.playPause();
    setIsPlaying(_isPlaying => !_isPlaying);
  };

  const onTimeupdate = () => {
    if (wavesurfer) setTime(wavesurfer.getCurrentTime());
  };

  return (
    <Line>
      <Column>
        <PlayButton  isPlaying={isPlaying} onClick={onPlayPause} />
      </Column>
      <Column expand>
        <WavesurferPlayer
          url={soundSrc}
          waveColor="#9979F1"
          progressColor="#7046EC"
          height={100}
          onReady={onReady}
          onTimeupdate={onTimeupdate}
          onLoad={onLoad}
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
};

export default SoundPlayer;
