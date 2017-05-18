import React, { Component } from 'react';
import FlatButton from 'material-ui/FlatButton';
import Paper from 'material-ui/Paper';
import BaseEditor from './BaseEditor'

const styles = {
  logoPaper: {
    margin: 10,
    backgroundColor: '#FFFFFF',
    padding: 5,
    maxWidth: 400,
    textAlign: 'center',
  }
}

export default class StartPage extends BaseEditor {
  getProject() {
    return undefined;
  }

  getLabel() {
    return 'Unknown editor';
  }

  updateToolbar() {
    if (this.props.setToolbar) this.props.setToolbar(null);
  }

  render() {
    return (
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Paper zDepth={1} style={styles.logoPaper}>
          <img src="res/GD-logo-simple.png" role="presentation"/>
          <p>GDevelop is an easy-to-use game creator with no programming language to learn.</p>
        </Paper>
        <Paper zDepth={1}>
          <FlatButton label="Open a project" fullWidth onClick={this.props.onOpen} />
          <FlatButton label="Create a new project" disabled fullWidth />
        </Paper>
      </div>
    );
  }
}
