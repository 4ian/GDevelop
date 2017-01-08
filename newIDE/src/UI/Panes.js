import React, { Component } from 'react';

export default class Panes extends Component {
  render() {
    return (
      <div style={{display: 'flex'}}>
        <div style={{
          flex: 0.3,
          borderRightWidth: 1,
          borderRightColor: '#DDD',
          borderRightStyle: 'solid',
        }}>
          {this.props.firstChild}
        </div>
        <div style={{flex: 0.8}}>
          {this.props.secondChild}
        </div>
      </div>
    )
  }
}
