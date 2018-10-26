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

export default class TrueFalseField extends Component {
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
          label="True"
          primary={this.props.value === 'True'}
          onClick={() => this.props.onChange('True')}
        />
        <RaisedButton
          style={styles.button}
          label="False"
          primary={this.props.value !== 'True'}
          onClick={() => this.props.onChange('False')}
        />
      </div>
    );
  }
}
