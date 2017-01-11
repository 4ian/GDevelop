import React, { Component } from 'react';

export default class Panes extends Component {
  render() {
    return (
      <div style={{display: 'flex', flex: 1}}>
        <div style={{
          flex: 0.5,
          borderRightWidth: 1,
          borderRightColor: '#DDD',
          borderRightStyle: 'solid',
          overflowY: 'scroll',
        }}>
          {this.props.firstChild}
        </div>
        <div style={{flex: 0.8, display: 'flex'}}>
          {this.props.secondChild}
        </div>
      </div>
    )
  }
}
