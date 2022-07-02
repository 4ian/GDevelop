// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import { Column, Line } from './Grid';
import RaisedButton from './RaisedButton';
import EmptyMessage from './EmptyMessage';
import { ColumnStackLayout } from './Layout';

type Props = {|
  children: React.Node,
  onRetry?: () => void | Promise<void>,
|};

const PlaceholderError = ({ onRetry, children }: Props) => {
  return (
    <Column expand alignItems="center" justifyContent="center">
      <Line noMargin>
        <ColumnStackLayout noMargin alignItems="center">
          <EmptyMessage>{children}</EmptyMessage>
          <Line noMargin>
            {onRetry && (
              <RaisedButton
                primary
                label={<Trans>Retry</Trans>}
                onClick={onRetry}
              />
            )}
          </Line>
        </ColumnStackLayout>
      </Line>
    </Column>
  );
};

export default PlaceholderError;
