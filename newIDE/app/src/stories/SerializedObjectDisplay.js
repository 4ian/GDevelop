import React, { Component } from 'react';
import Paper from 'material-ui/Paper';
import RaisedButton from 'material-ui/RaisedButton';
import { serializeToJSObject } from '../Utils/Serializer';
const gd = global.gd;

export default class SerializedObjectDisplay extends Component {
  update = () => {
    this.forceUpdate();
  };

  render() {
    return (
      <div>
        {this.props.children}
        <Paper zDepth={2}>
          Object serialized to JSON:{' '}
          <RaisedButton label="Update" onClick={this.update} />
          <pre>
            {JSON.stringify(
              serializeToJSObject(
                this.props.object,
                this.props.methodName || 'serializeTo'
              ),
              null,
              4
            )}
          </pre>
        </Paper>
      </div>
    );
  }
}
