// @flow
import * as React from 'react';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';
import { t } from '@lingui/macro';
import { Column, Line } from '../UI/Grid';
import Text from '../UI/Text';
import ScrollView from '../UI/ScrollView';
import BackgroundText from '../UI/BackgroundText';
import ThemeConsumer from '../UI/Theme/ThemeConsumer';
import IconButton from '../UI/IconButton';
import FlatButton from '../UI/FlatButton';
import PlayArrow from '@material-ui/icons/PlayArrow';
import Pause from '@material-ui/icons/Pause';
import Stop from '@material-ui/icons/Stop';
import Add from '@material-ui/icons/Add';
import FastRewind from '@material-ui/icons/FastRewind';
import Menu from '../UI/Menu/Menu';
import ContextMenu from '../UI/Menu/ContextMenu';

const styles = {
    container: { display: 'flex', flexDirection: 'column', flex: 1, backgroundColor: 'var(--mosaic-window-body-bg)', overflow: 'hidden' },
    toolbar: { display: 'flex', alignItems: 'center', padding: '4px 8px', borderBottom: '1px solid var(--mosaic-border-color)' },
    mainArea: { display: 'flex', flex: 1, overflow: 'hidden' },
    trackList: { width: 250, borderRight: '1px solid var(--mosaic-border-color)', overflowY: 'auto' },
    timelineArea: { flex: 1, position: 'relative', overflowX: 'auto', overflowY: 'hidden' },
    trackHeader: { height: 40, display: 'flex', alignItems: 'center', padding: '0 8px', borderBottom: '1px solid var(--mosaic-border-color)' },
    trackRow: { height: 40, borderBottom: '1px solid var(--mosaic-border-color)', position: 'relative' },
    timeRulerContainer: { display: 'flex', flexDirection: 'column' },
    timeRuler: { height: 30, borderBottom: '1px solid var(--mosaic-border-color)', position: 'relative', overflow: 'hidden' },
    keyframe: { position: 'absolute', width: 12, height: 12, backgroundColor: '#007acc', transform: 'rotate(45deg) translateY(-50%)', top: '50%', cursor: 'grab', border: '1px solid #fff' },
    playhead: { position: 'absolute', width: 2, height: '100%', backgroundColor: '#ff0000', zIndex: 10, pointerEvents: 'none' },
};

export default class CinematicSequenceEditor extends React.Component {
    _playTimer = null;
    _timelineRef = React.createRef();

    constructor(props) {
        super(props);
        this.state = {
            currentTime: 0,
            isPlaying: false,
            duration: 10, // Default 10 seconds
            tracks: this._parseTracks(),
            zoom: 100, // pixels per second
        };
    }

    componentWillUnmount() {
        this._stop();
    }

    _parseTracks() {
        try {
            const data = this.props.cinematicSequence.getSequenceData();
            if (!data) return [];
            const parsed = JSON.parse(data);
            if (parsed && Array.isArray(parsed.tracks)) {
                return parsed.tracks;
            }
            return [];
        } catch (err) {
            console.error('Failed to parse cinematic sequence data', err);
            return [];
        }
    }

    _saveTracks(tracks) {
        const data = JSON.stringify({ tracks });
        this.props.cinematicSequence.setSequenceData(data);
        this.props.onSequenceModified();
        this.setState({ tracks });
    }

    _play = () => {
        if (this.state.isPlaying) return;
        this.setState({ isPlaying: true });
        let lastTime = performance.now();
        this._playTimer = setInterval(() => {
            const now = performance.now();
            const dt = (now - lastTime) / 1000;
            lastTime = now;
            this.setState(prevState => {
                let nextTime = prevState.currentTime + dt;
                if (nextTime >= prevState.duration) {
                    nextTime = 0; // Loop or stop
                    this._stop();
                    return { currentTime: prevState.duration, isPlaying: false };
                }
                return { currentTime: nextTime };
            }, () => {
                if (this.props.onTimeChange) {
                    this.props.onTimeChange(this.state.currentTime);
                }
            });
        }, 16);
    };

    _pause = () => {
        this._stop();
        this.setState({ isPlaying: false });
    };

    _stop = () => {
        if (this._playTimer) {
            clearInterval(this._playTimer);
            this._playTimer = null;
        }
    };

    _resetPlayhead = () => {
        this.setState({ currentTime: 0 });
        this._pause();
        if (this.props.onTimeChange) {
            this.props.onTimeChange(0);
        }
    };

    _addTrack = (type) => {
        const newTrack = {
            id: Math.random().toString(36).substring(7),
            name: `New ${type} track`,
            type: type,
            keyframes: [],
        };
        this._saveTracks([...this.state.tracks, newTrack]);
    };

    _addKeyframe = (trackId, time) => {
        const tracks = this.state.tracks.map(t => {
            if (t.id === trackId) {
                return {
                    ...t,
                    keyframes: [...t.keyframes, { time, value: null }].sort((a, b) => a.time - b.time),
                };
            }
            return t;
        });
        this._saveTracks(tracks);
    };

    _removeTrack = (trackId) => {
        const tracks = this.state.tracks.filter(t => t.id !== trackId);
        this._saveTracks(tracks);
    };

    _handleTimelineClick = (e) => {
        if (!this._timelineRef.current) return;
        const rect = this._timelineRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left + this._timelineRef.current.scrollLeft;
        const time = Math.max(0, x / this.state.zoom);
        this.setState({ currentTime: time });
        if (this.props.onTimeChange) {
            this.props.onTimeChange(time);
        }
    };

    render() {
        const { currentTime, isPlaying, duration, tracks, zoom } = this.state;
        const pxPerSecond = zoom;
        const playheadX = currentTime * pxPerSecond;
        const timelineWidth = Math.max(duration * pxPerSecond, 800);

        return (
            <ThemeConsumer>
                {theme => (
                    <I18n>
                        {({ i18n }) => (
                            <div style={styles.container}>
                                {/* TOOLBAR */}
                                <div style={styles.toolbar}>
                                    <IconButton onClick={this._resetPlayhead} tooltip={i18n._(t`Rewind to start`)}>
                                        <FastRewind />
                                    </IconButton>
                                    <IconButton onClick={isPlaying ? this._pause : this._play} tooltip={isPlaying ? i18n._(t`Pause`) : i18n._(t`Play`)}>
                                        {isPlaying ? <Pause /> : <PlayArrow />}
                                    </IconButton>
                                    <IconButton onClick={() => { this._resetPlayhead(); }} tooltip={i18n._(t`Stop`)}>
                                        <Stop />
                                    </IconButton>
                                    <span style={{ marginLeft: 16, marginRight: 16 }}>
                                        {currentTime.toFixed(2)}s / {duration.toFixed(2)}s
                                    </span>

                                    <FlatButton
                                        leftIcon={<Add />}
                                        label={i18n._(t`Add Track`)}
                                        onClick={() => this._addTrack('object')}
                                    />
                                </div>

                                {/* MAIN AREA */}
                                <div style={styles.mainArea}>

                                    {/* TRACK LIST (LEFT) */}
                                    <div style={styles.trackList}>
                                        <div style={styles.trackHeader}>
                                            <Text size="sub-title">{i18n._(t`Tracks`)}</Text>
                                        </div>
                                        {tracks.length === 0 && (
                                            <div style={{ padding: 10 }}>
                                                <Text>{i18n._(t`No tracks added.`)}</Text>
                                            </div>
                                        )}
                                        {tracks.map(track => (
                                            <div key={track.id} style={styles.trackRow}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '100%', padding: '0 8px' }}>
                                                    <Text>{track.name}</Text>
                                                    <span style={{ cursor: 'pointer', color: 'red' }} onClick={() => this._removeTrack(track.id)}>✕</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* TIMELINE (RIGHT) */}
                                    <div style={styles.timelineArea} ref={this._timelineRef}>
                                        <div style={{ ...styles.timeRulerContainer, width: timelineWidth }}>
                                            <div style={styles.timeRuler} onClick={this._handleTimelineClick}>
                                                {/* Ruler markings could go here */}
                                                <div style={{ ...styles.playhead, left: playheadX }} />
                                            </div>

                                            {tracks.map(track => (
                                                <div key={track.id} style={{ ...styles.trackRow, width: timelineWidth }} onDoubleClick={(e) => {
                                                    const rect = e.currentTarget.getBoundingClientRect();
                                                    const x = e.clientX - rect.left;
                                                    this._addKeyframe(track.id, x / zoom);
                                                }}>
                                                    {track.keyframes.map((kf, i) => (
                                                        <div
                                                            key={i}
                                                            style={{ ...styles.keyframe, left: kf.time * zoom }}
                                                            onClick={(e) => { e.stopPropagation(); /* select keyframe */ }}
                                                            title={`${kf.time.toFixed(2)}s`}
                                                        />
                                                    ))}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                </div>
                            </div>
                        )}
                    </I18n>
                )}
            </ThemeConsumer>
        );
    }
}
