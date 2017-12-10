import React, { Component } from 'react';
import Timer from 'material-ui/svg-icons/image/timer';
import FlatButton from 'material-ui/FlatButton';
import Checkbox from 'material-ui/Checkbox';
import Repeat from 'material-ui/svg-icons/av/repeat';
import PlayArrow from 'material-ui/svg-icons/av/play-arrow';
import TextField from 'material-ui/TextField';
import Dialog from '../../../UI/Dialog';
import AnimationPreview from './AnimationPreview';

const styles = {
  container: {
    paddingLeft: 12,
    paddingRight: 12,
    display: 'flex',
    alignItems: 'center',
  },
  timeField: {
    width: 75,
  },
  timeIcon: {
    paddingLeft: 6,
    paddingRight: 6,
  },
  repeatContainer: {
    width: 130,
  },
  repeatLabel: {
    whiteSpace: 'nowrap',
  },
  spacer: {
    width: 16,
  },
};

const formatTime = time => Number(time.toFixed(6));

export default class DirectionTools extends Component {
  state = {
    timeBetweenFrames: formatTime(this.props.direction.getTimeBetweenFrames()),
    timeError: false,
  };

  componentWillReceiveProps(newProps) {
    this.setState({
      timeBetweenFrames: formatTime(
        this.props.direction.getTimeBetweenFrames()
      ),
      timeError: false,
    });
  }

  saveTimeBetweenFrames = () => {
    const { direction } = this.props;

    const newTime = parseFloat(this.state.timeBetweenFrames);
    const newTimeIsValid = !isNaN(newTime);

    if (newTimeIsValid) direction.setTimeBetweenFrames(newTime);
    this.setState({
      timeBetweenFrames: formatTime(
        this.props.direction.getTimeBetweenFrames()
      ),
      timeError: newTimeIsValid,
    });
  };

  setLooping = check => {
    const { direction } = this.props;

    direction.setLoop(!!check);
    this.forceUpdate();
  };

  openPreview = open => {
    this.setState({
      previewOpen: open,
    });
  };

  render() {
    const { direction, resourcesLoader, project } = this.props;

    return (
      <div style={styles.container}>
        <FlatButton
          label="Preview"
          icon={<PlayArrow />}
          onClick={() => this.openPreview(true)}
        />
        <Timer style={styles.timeIcon} />
        <TextField
          value={this.state.timeBetweenFrames}
          onChange={(e, text) => this.setState({ timeBetweenFrames: text })}
          onBlur={() => this.saveTimeBetweenFrames()}
          id="direction-time-between-frames"
          style={styles.timeField}
        />
        <span style={styles.spacer} />
        <div style={styles.repeatContainer}>
          <Checkbox
            checkedIcon={<Repeat />}
            uncheckedIcon={<Repeat />}
            checked={direction.isLooping()}
            label={direction.isLooping() ? 'Loop' : "Don't loop"}
            onCheck={(e, check) => this.setLooping(check)}
            labelStyle={styles.repeatLabel}
          />
        </div>
        {this.state.previewOpen && (
          <Dialog
            actions={
              <FlatButton
                label="Close"
                primary
                onClick={() => this.openPreview(false)}
              />
            }
            autoScrollBodyContent
            noMargin
            modal
            onRequestClose={() => this.openPreview(false)}
            open={this.state.previewOpen}
          >
            <AnimationPreview
              spritesContainer={direction}
              resourcesLoader={resourcesLoader}
              project={project}
            />
          </Dialog>
        )}
      </div>
    );
  }
}
