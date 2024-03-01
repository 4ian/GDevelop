// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import { Line, Column } from '../../UI/Grid';
import EmptyMessage from '../../UI/EmptyMessage';
import { type EditorProps } from './EditorProps.flow';

export default function EmptyEditor({ renderObjectNameField }: EditorProps) {
  return (
    <Column noMargin>
      {renderObjectNameField && renderObjectNameField()}
      <Line>
        <EmptyMessage>
          <Trans>
            This object does not have any specific configuration. Add it on the
            scene and use events to interact with it.
          </Trans>
        </EmptyMessage>
      </Line>
    </Column>
  );
}
