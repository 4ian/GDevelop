// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import Dialog from '../UI/Dialog';
import FlatButton from '../UI/FlatButton';
import Text from '../UI/Text';
import {
  Table,
  TableRow,
  TableRowColumn,
  TableBody,
  TableHeader,
  TableHeaderColumn,
} from '../UI/Table';

const gd: libGDevelop = global.gd;

// If adding new classes, also add them to `patchClassesForUseAfterFreeDetection`
// in postjs.js and to the MemoryTracked member in the C++ class header.
const trackedClasses = [
  'Project',
  'Layout',
  'gdObject',
  'Behavior',
  'BehaviorsSharedData',
  'EffectsContainer',
  'InitialInstancesContainer',
  'LayersContainer',
  'ObjectGroupsContainer',
  'ObjectsContainer',
  'VariablesContainer',
];

type Stats = {|
  className: string,
  alive: number,
  dead: number,
|};

const getStats = (): Array<Stats> => {
  return trackedClasses.map(className => ({
    className,
    alive: gd.MemoryTrackedRegistry.getAliveCountForClass(className),
    dead: gd.MemoryTrackedRegistry.getDeadCountForClass(className),
  }));
};

type Props = {|
  onClose: () => void,
|};

const MemoryTrackedRegistryDialog = ({ onClose }: Props): React.Node => {
  const [stats, setStats] = React.useState<Array<Stats>>(getStats);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setStats(getStats());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const totalAlive = stats.reduce((sum, s) => sum + s.alive, 0);
  const totalDead = stats.reduce((sum, s) => sum + s.dead, 0);

  return (
    <Dialog
      title={<Trans>Memory Tracker Registry</Trans>}
      open
      onRequestClose={onClose}
      actions={[
        <FlatButton
          key="close"
          label={<Trans>Close</Trans>}
          primary
          onClick={onClose}
        />,
      ]}
      maxWidth="sm"
    >
      <Text>
        <Trans>
          Tracked C++ objects exposed to JavaScript. Counts refresh every
          second.
        </Trans>
      </Text>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHeaderColumn>
              <Trans>Class</Trans>
            </TableHeaderColumn>
            <TableHeaderColumn>
              <Trans>Alive</Trans>
            </TableHeaderColumn>
            <TableHeaderColumn>
              <Trans>Dead</Trans>
            </TableHeaderColumn>
          </TableRow>
        </TableHeader>
        <TableBody>
          {stats.map(row => (
            <TableRow key={row.className}>
              <TableRowColumn>{row.className}</TableRowColumn>
              <TableRowColumn>{row.alive}</TableRowColumn>
              <TableRowColumn>{row.dead}</TableRowColumn>
            </TableRow>
          ))}
          <TableRow>
            <TableRowColumn>
              <b>
                <Trans>Total</Trans>
              </b>
            </TableRowColumn>
            <TableRowColumn>
              <b>{totalAlive}</b>
            </TableRowColumn>
            <TableRowColumn>
              <b>{totalDead}</b>
            </TableRowColumn>
          </TableRow>
        </TableBody>
      </Table>
    </Dialog>
  );
};

export default MemoryTrackedRegistryDialog;
