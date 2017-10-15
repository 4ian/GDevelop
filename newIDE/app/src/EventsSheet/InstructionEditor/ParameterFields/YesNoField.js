import React, { Component } from 'react';
import RaisedButton from 'material-ui/RaisedButton';

const styles = {
  container: {
    marginTop: 10,
  },
  button: {
    margin: 5,
  },
  description: {
    display: 'inline-block',
    marginRight: 5,
  },
};

export default class DefaultField extends Component {
  focus() {}

  render() {
    const { parameterMetadata } = this.props;
    const description = parameterMetadata
      ? parameterMetadata.getDescription()
      : undefined;

    return (
      <div style={styles.container}>
        <p style={styles.description}>{description}</p>
        <RaisedButton
          style={styles.button}
          label="Yes"
          primary={this.props.value === 'yes'}
          onClick={() => this.props.onChange('yes')}
        />
        <RaisedButton
          style={styles.button}
          label="No"
          primary={this.props.value !== 'yes'}
          onClick={() => this.props.onChange('no')}
        />
      </div>
    );
  }
}
