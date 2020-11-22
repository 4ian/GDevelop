// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from '../UI/Table';
import { type Usages } from '../Utils/GDevelopServices/Usage';
import { Column, Line } from '../UI/Grid';
import EmptyMessage from '../UI/EmptyMessage';
import format from 'date-fns/format';
import PlaceholderLoader from '../UI/PlaceholderLoader';

type Props = { usages: ?Usages };

export default ({ usages }: Props) => (
  <Column noMargin>
    <Line>
      {!usages ? (
        <PlaceholderLoader />
      ) : usages.length === 0 ? (
        <EmptyMessage>
          <Trans>You don't have any usage of the online services for now</Trans>
        </EmptyMessage>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHeaderColumn>Date</TableHeaderColumn>
              <TableHeaderColumn>Type</TableHeaderColumn>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usages.map(usage => (
              <TableRow key={usage.id}>
                <TableRowColumn>
                  {format(usage.createdAt, 'yyyy-MM-dd HH:mm:ss')}
                </TableRowColumn>
                <TableRowColumn>{usage.type}</TableRowColumn>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Line>
  </Column>
);
