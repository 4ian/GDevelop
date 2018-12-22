import React, { Component } from 'react';

export default class RefGetter extends Component {
  componentDidMount() {
    if (this._ref) {
      this.props.onRef(this._ref);
    }
  }

  render() {
    return React.cloneElement(this.props.children, {
      ref: ref => (this._ref = ref),
    });
  }
}
