import React, { Component } from 'react';
import RaisedButton from 'material-ui/RaisedButton';

const styles = {
  button: {
    margin: 5,
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
      <div>
        {description}
        <RaisedButton
          style={styles.button}
          label="True"
          primary={this.props.value === 'true'}
          onClick={() => this.props.onChange('true')}
        />
        <RaisedButton
          style={styles.button}
          label="False"
          primary={this.props.value !== 'true'}
          onClick={() => this.props.onChange('false')}
        />
      </div>
    );
  }
}
