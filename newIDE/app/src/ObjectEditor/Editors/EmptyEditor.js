// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import { type EditorProps } from './EditorProps.flow';
import { Line, Column } from '../../UI/Grid';
import EmptyMessage from '../../UI/EmptyMessage';

export default class EmptyEditor extends React.Component<EditorProps, void> {
  render() {
    return (
      <Column>
        <Line>
          <EmptyMessage>
            <Trans>
              This object does not have any specific configuration. Add it on
              the scene and use events to interact with it.
            </Trans>
          </EmptyMessage>
        </Line>
      </Column>
    );
  }
}
