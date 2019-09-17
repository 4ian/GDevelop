// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import { Column, Line } from './Grid';
import RaisedButton from './RaisedButton';
import EmptyMessage from './EmptyMessage';

type Props = {|
  children: React.Node,
  onRetry?: () => void,
|};

export default ({ onRetry, children }: Props) => (
  <Column expand alignItems="center">
    <EmptyMessage>{children}</EmptyMessage>
    <Line>
      {onRetry && (
        <RaisedButton
          primary
          label={<Trans>Retry</Trans>}
          onClick={() => onRetry()}
        />
      )}
    </Line>
  </Column>
);
