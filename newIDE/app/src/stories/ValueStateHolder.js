import React, { Component } from 'react';

export default class ValueStateHolder extends Component {
  constructor(props) {
    super(props);

    this.state = {
      value: props.initialValue,
    };
  }

  render() {
    return React.cloneElement(this.props.children, {
      onChange: value => this.setState({ value }),
      value: this.state.value,
    });
  }
}
