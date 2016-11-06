import React, { Component } from 'react';

export default class Panes extends Component {
  render() {
    return (
      <div style={{display: 'flex'}}>
        <div style={{
          flex: 0.4,
          borderRightWidth: 1,
          borderRightColor: '#DDD',
          borderRightStyle: 'solid',
        }}>
          {this.props.firstChild}
        </div>
        <div style={{flex: 0.6}}>
          {this.props.secondChild}
        </div>
      </div>
    )
  }
}
