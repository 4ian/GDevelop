import { Trans } from '@lingui/macro';
import React, { Component } from 'react';
import Paper from '@material-ui/core/Paper';
import RaisedButton from '../UI/RaisedButton';
import { serializeToJSObject } from '../Utils/Serializer';

export default class SerializedObjectDisplay extends Component {
  update = () => {
    this.forceUpdate();
  };

  render() {
    return (
      <div>
        {this.props.children}
        <Paper elevation={2}>
          Object serialized to JSON:{' '}
          <RaisedButton label={<Trans>Update</Trans>} onClick={this.update} />
          <pre style={{ maxHeight: 400, overflow: 'scroll' }}>
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
