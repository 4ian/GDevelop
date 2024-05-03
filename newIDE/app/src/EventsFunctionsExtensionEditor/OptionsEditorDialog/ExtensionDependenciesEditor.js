//@flow
import React from 'react';
import { Trans, t } from '@lingui/macro';
import TableContainer from '@material-ui/core/TableContainer';
import {
  Table,
  TableRow,
  TableBody,
  TableRowColumn,
  TableHeader,
  TableHeaderColumn,
} from '../../UI/Table';
import RaisedButton from '../../UI/RaisedButton';
import IconButton from '../../UI/IconButton';
import SemiControlledTextField from '../../UI/SemiControlledTextField';
import SelectField from '../../UI/SelectField';
import SelectOption from '../../UI/SelectOption';
import { Line, Column } from '../../UI/Grid';

import { mapVector } from '../../Utils/MapFor';
import newNameGenerator from '../../Utils/NewNameGenerator';
import useForceUpdate from '../../Utils/UseForceUpdate';
import BackgroundText from '../../UI/BackgroundText';
import { showWarningBox } from '../../UI/Messages/MessageBox';
import Paper from '../../UI/Paper';
import Trash from '../../UI/CustomSvgIcons/Trash';
import Add from '../../UI/CustomSvgIcons/Add';

const styles = {
  paper: { minWidth: '100%' },
};

const checkNameExists = (
  name: string,
  deps: gdVectorDependencyMetadata
): boolean => {
  for (let i = 0; i < deps.size(); i++)
    if (deps.at(i).getName() === name) return true;
  return false;
};

type Props = {| eventsFunctionsExtension: gdEventsFunctionsExtension |};

export const ExtensionDependenciesEditor = ({
  eventsFunctionsExtension,
}: Props) => {
  const deps = eventsFunctionsExtension.getAllDependencies();
  const forceUpdate = useForceUpdate();

  const addDependency = () => {
    eventsFunctionsExtension
      .addDependency()
      .setName(
        newNameGenerator('New Dependency', newName =>
          checkNameExists(newName, deps)
        )
      )
      .setExportName('my-dependency')
      .setVersion('1.0.0')
      .setDependencyType('cordova');
    forceUpdate();
  };

  return (
    <Column noMargin>
      <Line expand>
        <TableContainer
          component={({ children }) => (
            <Paper style={styles.paper} background="medium">
              {children}
            </Paper>
          )}
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHeaderColumn>
                  <Trans>Name</Trans>
                </TableHeaderColumn>
                <TableHeaderColumn>
                  <Trans>Export name</Trans>
                </TableHeaderColumn>
                <TableHeaderColumn>
                  <Trans>Version</Trans>
                </TableHeaderColumn>
                <TableHeaderColumn>
                  <Trans>Dependency type</Trans>
                </TableHeaderColumn>
                <TableHeaderColumn>
                  <Trans>Action</Trans>
                </TableHeaderColumn>
              </TableRow>
            </TableHeader>
            <TableBody>
              {// $FlowFixMe - unsure why Flow complains about TableRow.
              mapVector<gdDependencyMetadata, TableRow>(
                eventsFunctionsExtension.getAllDependencies(),
                (dependency, index) => (
                  // $FlowFixMe - unsure why Flow complains about TableRow.
                  <TableRow key={dependency.getName()}>
                    <TableRowColumn>
                      <SemiControlledTextField
                        commitOnBlur
                        value={dependency.getName()}
                        onChange={newName => {
                          if (newName === dependency.getName()) return;

                          if (checkNameExists(newName, deps)) {
                            showWarningBox(
                              `This name is already in use! Please use a unique name.`,
                              { delayToNextTick: true }
                            );
                          } else {
                            dependency.setName(newName);
                            forceUpdate();
                          }
                        }}
                        margin="none"
                      />
                    </TableRowColumn>
                    <TableRowColumn>
                      <SemiControlledTextField
                        commitOnBlur
                        value={dependency.getExportName()}
                        onChange={newExportName => {
                          if (newExportName === dependency.getExportName())
                            return;

                          dependency.setExportName(newExportName);
                          forceUpdate();
                        }}
                        margin="none"
                      />
                    </TableRowColumn>
                    <TableRowColumn>
                      <SemiControlledTextField
                        commitOnBlur
                        value={dependency.getVersion()}
                        onChange={newVersion => {
                          if (newVersion === dependency.getVersion()) return;

                          dependency.setVersion(newVersion);
                          forceUpdate();
                        }}
                        margin="none"
                      />
                    </TableRowColumn>
                    <TableRowColumn>
                      <SelectField
                        value={dependency.getDependencyType()}
                        onChange={(_, __, newType) => {
                          if (newType === dependency.getDependencyType())
                            return;

                          dependency.setDependencyType(newType);
                          forceUpdate();
                        }}
                        margin="none"
                      >
                        <SelectOption value="npm" label={t`NPM`} />
                        <SelectOption value="cordova" label={t`Cordova`} />
                      </SelectField>
                    </TableRowColumn>
                    <TableRowColumn>
                      <IconButton
                        tooltip={t`Delete`}
                        onClick={() => {
                          eventsFunctionsExtension.removeDependencyAt(index);
                          forceUpdate();
                        }}
                        size="small"
                      >
                        <Trash />
                      </IconButton>
                    </TableRowColumn>
                  </TableRow>
                )
              )}
            </TableBody>
          </Table>
          <Column expand>
            <Line justifyContent="flex-end">
              <RaisedButton
                primary
                icon={<Add />}
                label={<Trans>Add</Trans>}
                onClick={addDependency}
              />
            </Line>
          </Column>
        </TableContainer>
      </Line>
      <Line>
        <BackgroundText>
          <Trans>
            Dependencies allow to add additional libraries in the exported
            games. NPM dependencies will be included for Electron builds
            (Windows, macOS, Linux) and Cordova dependencies will be included
            for Cordova builds (Android, iOS). Note that this is intended for
            usage in JavaScript events only. If you are only using standard
            events, you should not worry about this.
          </Trans>
        </BackgroundText>
      </Line>
    </Column>
  );
};
