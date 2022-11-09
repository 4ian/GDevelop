//@flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import Paper from '../UI/Paper';
import RaisedButton from '../UI/RaisedButton';
import { serializeToJSObject } from '../Utils/Serializer';
import useForceUpdate from '../Utils/UseForceUpdate';

const SerializedObjectDisplay = ({
  children,
  object,
  methodName,
}: {
  children: React.Node,
  object: any,
  methodName?: string,
}) => {
  const forceUpdate = useForceUpdate();

  return (
    <div>
      {children}
      <Paper elevation={2} background="dark">
        Object serialized to JSON:{' '}
        <RaisedButton label={<Trans>Update</Trans>} onClick={forceUpdate} />
        <pre style={{ maxHeight: 400, overflow: 'scroll' }}>
          {JSON.stringify(
            serializeToJSObject(object, methodName || 'serializeTo'),
            null,
            4
          )}
        </pre>
      </Paper>
    </div>
  );
};

export default SerializedObjectDisplay;
