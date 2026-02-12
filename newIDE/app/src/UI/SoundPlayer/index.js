// @flow

import * as React from 'react';
import Divider from '@material-ui/core/Divider';
import WaveSurferPlayer from './WaveSurfer';
import { Column, Line, marginsSize } from '../Grid';
import { LineStackLayout } from '../Layout';
import PlayButton from './PlayButton';
import Text from '../Text';
import IconButton from '../IconButton';
import { formatDuration } from '../../Utils/Duration';
import GDevelopThemeContext from '../Theme/GDevelopThemeContext';
import { useResponsiveWindowSize } from '../Responsive/ResponsiveWindowMeasurer';
import SkipBack from '../CustomSvgIcons/SkipBack';
import SkipForward from '../CustomSvgIcons/SkipForward';
import { textEllipsisStyle } from './../TextEllipsis';

const styles = {
  waveSurferContainer: {
    height: 80,
    width: 'calc(100% - 100px)', // 100px is the space taken by the time display + a margin.
  },
  textContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    overflow: 'hidden',
    justifyContent: 'center',
    flexGrow: 0,
    flexShrink: 1,
  },
  container: {
    minHeight: 70,
    paddingLeft: marginsSize / 2,
    paddingRight: marginsSize / 2,
    display: 'flex',
  },
  waveSurferAndTimeContainer: {
    display: 'flex',
    alignItems: 'stretch',
    overflow: 'hidden',
    justifyContent: 'space-between',
    marginTop: marginsSize,
    marginBottom: marginsSize,
    flexGrow: 1,
    flexShrink: 0,
  },
};

type Props = {|
  soundSrc: string | null,
  title: string | null,
  subtitle: React.Node,
  onSoundLoaded: () => void,
  onSkipForward?: () => void,
  onSkipBack?: () => void,
|};

export type SoundPlayerInterface = {|
  playPause: (forcePlay: boolean) => void,
|};

const SoundPlayer = React.forwardRef<Props, SoundPlayerInterface>(
  (
    { soundSrc, onSoundLoaded, onSkipBack, onSkipForward, title, subtitle },
    ref
  ) => {
    const gdevelopTheme = React.useContext(GDevelopThemeContext);
    const shouldPlayAfterLoading = React.useRef<boolean>(false);
    const { isMobile } = useResponsiveWindowSize();
    const mobileAudioRef = React.useRef<?Audio>(null);
    const waveSurferRef = React.useRef<?any>(null);
    const [duration, setDuration] = React.useState<?number>(null);
    const [time, setTime] = React.useState<?number>(null);
    const [isPlaying, setIsPlaying] = React.useState(false);

    const onWaveSurferReady = React.useCallback(
      ws => {
        waveSurferRef.current = ws;
        setDuration(Math.ceil(ws.getDuration()));
        setTime(0);
        onSoundLoaded();
        if (shouldPlayAfterLoading.current) {
          setIsPlaying(true);
        }
      },
      [onSoundLoaded]
    );

    const onAudioReady = React.useCallback(
      () => {
        if (!mobileAudioRef.current) return;
        setDuration(Math.ceil(mobileAudioRef.current.duration));
        setTime(0);
        onSoundLoaded();
        if (shouldPlayAfterLoading.current) {
          setIsPlaying(true);
        }
      },
      [onSoundLoaded]
    );

    const skipBack = React.useCallback(
      () => {
        shouldPlayAfterLoading.current = isPlaying;
        if (onSkipBack) onSkipBack();
      },
      [isPlaying, onSkipBack]
    );
    const skipForward = React.useCallback(
      () => {
        shouldPlayAfterLoading.current = isPlaying;
        if (onSkipForward) onSkipForward();
      },
      [isPlaying, onSkipForward]
    );

    const onLoad = React.useCallback(() => {
      setIsPlaying(false);
    }, []);

    React.useEffect(
      () => {
        if (!waveSurferRef.current && !mobileAudioRef.current) return;
        if (isPlaying) {
          if (waveSurferRef.current) waveSurferRef.current.play();
          else if (mobileAudioRef.current) mobileAudioRef.current.play();
        } else {
          if (waveSurferRef.current) waveSurferRef.current.pause();
          else if (mobileAudioRef.current) mobileAudioRef.current.pause();
        }
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
      setTime(_time => {
        const playerCurrentTime = mobileAudioRef.current
          ? mobileAudioRef.current.currentTime
          : waveSurferRef.current
          ? waveSurferRef.current.getCurrentTime()
          : null;
        if (playerCurrentTime === null || _time === playerCurrentTime) {
          return _time;
        }
        return playerCurrentTime;
      });
    }, []);

    React.useEffect(
      () => {
        if (isMobile) {
          if (soundSrc) {
            if (mobileAudioRef.current) {
              mobileAudioRef.current.pause();
            }
            const audio = new Audio(soundSrc);
            audio.addEventListener('timeupdate', onTimeupdate);
            audio.addEventListener('ended', onFinishPlaying);
            audio.addEventListener('loadstart', onLoad);
            audio.addEventListener('loadedmetadata', onAudioReady);
            mobileAudioRef.current = audio;
          }
          waveSurferRef.current = null;
        } else {
          mobileAudioRef.current = null;
        }
        onLoad();
      },
      [isMobile, soundSrc, onTimeupdate, onFinishPlaying, onLoad, onAudioReady]
    );

    return (
      <div style={styles.container}>
        <LineStackLayout alignItems="stretch" noMargin expand>
          <LineStackLayout alignItems="center">
            <IconButton size="small" onClick={skipBack} disabled={!onSkipBack}>
              <SkipBack />
            </IconButton>
            <PlayButton
              primary
              isPlaying={isPlaying}
              onClick={() => onPlayPause()}
            />
            <IconButton
              size="small"
              onClick={skipForward}
              disabled={!onSkipForward}
            >
              <SkipForward />
            </IconButton>
          </LineStackLayout>
          <Line noMargin>
            <Divider orientation="vertical" />
          </Line>
          <LineStackLayout
            justifyContent="space-between"
            alignItems="stretch"
            noMargin
            expand
          >
            <div style={styles.textContainer}>
              <Text size="sub-title" noMargin>
                {title || '-'}
              </Text>
              <Text
                size="body-small"
                noMargin
                color="secondary"
                style={textEllipsisStyle}
              >
                {subtitle || '-'}
              </Text>
            </div>

            <div
              style={{
                ...styles.waveSurferAndTimeContainer,
                justifyContent: !soundSrc ? 'flex-end' : 'space-between',
              }}
            >
              {!isMobile && (
                <div style={styles.waveSurferContainer}>
                  <WaveSurferPlayer
                    url={soundSrc}
                    waveColor={gdevelopTheme.soundPlayer.waveColor}
                    progressColor={gdevelopTheme.soundPlayer.progressColor}
                    barWidth={2}
                    barGap={1}
                    barRadius={3}
                    height={80}
                    normalize
                    onReady={onWaveSurferReady}
                    onTimeupdate={onTimeupdate}
                    onLoad={onLoad}
                    onFinish={onFinishPlaying}
                  />
                </div>
              )}
              <Column justifyContent="center" noMargin>
                <Line noMargin>
                  <Text noMargin size="sub-title">
                    {typeof time !== 'number' ? '..' : formatDuration(time)}
                  </Text>
                  &nbsp;
                  <Text noMargin size="sub-title" color="secondary">
                    /{' '}
                    {typeof duration !== 'number'
                      ? '..'
                      : formatDuration(duration)}
                  </Text>
                </Line>
              </Column>
            </div>
          </LineStackLayout>
        </LineStackLayout>
      </div>
    );
  }
);

export default SoundPlayer;
