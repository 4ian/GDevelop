// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import { Column, Line } from './Grid';
import RaisedButton from './RaisedButton';
import EmptyMessage from './EmptyMessage';
import GDevelopThemeContext from './Theme/ThemeContext';

type Props = {|
  children: React.Node,
  onRetry?: () => void | Promise<void>,
  kind?: 'error' | 'valid' | 'warning',
|};

const PlaceholderError = ({ onRetry, children, kind }: Props) => {
  const theme = React.useContext(GDevelopThemeContext);
  return (
    <Column expand alignItems="center">
      <EmptyMessage style={kind ? { color: theme.message[kind] } : undefined}>
        {children}
      </EmptyMessage>
      <Line>
        {onRetry && (
          <RaisedButton
            primary
            label={<Trans>Retry</Trans>}
            onClick={() => {
              onRetry();
            }}
          />
        )}
      </Line>
    </Column>
  );
};

export default PlaceholderError;
