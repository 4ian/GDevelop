// @flow
import * as React from 'react';
import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from 'material-ui/Table';
import { type Usages } from '../Utils/GDevelopServices/Usage';
import { Column, Line } from '../UI/Grid';
import EmptyMessage from '../UI/EmptyMessage';
import format from 'date-fns/format'
import PlaceholderLoader from '../UI/PlaceholderLoader';

type Props = { usages: ?Usages };

//TODO: Do a CircularProgress component that is centered?
export default ({ usages }: Props) => (
  <Column noMargin>
    <Line>
      {!usages ? (
        <PlaceholderLoader />
      ) : usages.length === 0 ? (
        <EmptyMessage>
          You don't have any usage of the online services for now
        </EmptyMessage>
      ) : (
        <Table selectable={false}>
          <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
            <TableRow>
              <TableHeaderColumn>Date</TableHeaderColumn>
              <TableHeaderColumn>Type</TableHeaderColumn>
            </TableRow>
          </TableHeader>
          <TableBody displayRowCheckbox={false}>
            {usages.map(usage => (
              <TableRow key={usage.id}>
                <TableRowColumn>{format(usage.createdAt, 'YYYY-MM-DD HH:mm:ss')}</TableRowColumn>
                <TableRowColumn>{usage.type}</TableRowColumn>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Line>
  </Column>
);
