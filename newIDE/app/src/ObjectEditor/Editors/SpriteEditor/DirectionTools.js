import React, { Component } from 'react';
import Timer from 'material-ui/svg-icons/image/timer';
import Checkbox from 'material-ui/Checkbox';
import Repeat from 'material-ui/svg-icons/av/repeat';
import TextField from 'material-ui/TextField';

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
  constructor(props) {
    super(props);

    this.state = {
      timeBetweenFrames: formatTime(
        this.props.direction.getTimeBetweenFrames()
      ),
      timeError: false,
    };
  }

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

  render() {
    const { direction } = this.props;

    return (
      <div style={styles.container}>
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
      </div>
    );
  }
}
