//@flow
import React from 'react';
import { Trans, t } from '@lingui/macro';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import FlatButton from '../../UI/FlatButton';
import IconButton from '../../UI/IconButton';
import Add from '@material-ui/icons/Add';
import Delete from '@material-ui/icons/Delete';
import SemiControlledTextField from '../../UI/SemiControlledTextField';
import SelectField from '../../UI/SelectField';
import SelectOption from '../../UI/SelectOption';

import Window from '../../Utils/Window';
import { mapVector } from '../../Utils/MapFor';
import newNameGenerator from '../../Utils/NewNameGenerator';
import useForceUpdate from '../../Utils/UseForceUpdate';
import BackgroundText from '../../UI/BackgroundText';

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
    <>
      <TableContainer
        component={({ children }) => <Paper elevation={4}>{children}</Paper>}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <Trans>Name</Trans>
              </TableCell>
              <TableCell>
                <Trans>Export name</Trans>
              </TableCell>
              <TableCell>
                <Trans>Version</Trans>
              </TableCell>
              <TableCell>
                <Trans>Dependency type</Trans>
              </TableCell>
              <TableCell>
                <Trans>Action</Trans>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {mapVector<gdDependencyMetadata, TableRow>(
              eventsFunctionsExtension.getAllDependencies(),
              (dependency, index) => (
                <TableRow key={dependency.getName()}>
                  <TableCell>
                    <SemiControlledTextField
                      commitOnBlur
                      value={dependency.getName()}
                      onChange={newName => {
                        if (checkNameExists(newName, deps))
                          Window.showMessageBox(
                            `This name is already in use! Please use a unique name.`,
                            'error'
                          );
                        else
                          eventsFunctionsExtension
                            .getAllDependencies()
                            .at(index)
                            .setName(newName) && forceUpdate();
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <SemiControlledTextField
                      commitOnBlur
                      value={dependency.getExportName()}
                      onChange={newExportName =>
                        dependency.setExportName(newExportName) && forceUpdate()
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <SemiControlledTextField
                      commitOnBlur
                      value={dependency.getVersion()}
                      onChange={newVersion =>
                        dependency.setVersion(newVersion) && forceUpdate()
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <SelectField
                      value={dependency.getDependencyType()}
                      onChange={(_, __, newType) =>
                        dependency.setDependencyType(newType) && forceUpdate()
                      }
                    >
                      <SelectOption value="npm" primaryText={t`NPM`} />
                      <SelectOption value="cordova" primaryText={t`Cordova`} />
                    </SelectField>
                  </TableCell>
                  <TableCell>
                    <IconButton
                      tooltip={t`Remove`}
                      onClick={() => {
                        eventsFunctionsExtension.removeDependencyAt(index);
                        forceUpdate();
                      }}
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              )
            )}
          </TableBody>
        </Table>
        <FlatButton
          icon={<Add />}
          label={<Trans>Add</Trans>}
          onClick={addDependency}
        />
      </TableContainer>
      <br />
      <BackgroundText>
        <Trans>
          Dependencies allow to require javascript libraries to be present on
          the built game. NPM dependencies will be included on electron build
          and cordova dependencies will be included on cordova builds. Note that
          this is intended for usage in javascript events, if you are using
          standard events, you should not worry about this.
        </Trans>
      </BackgroundText>
    </>
  );
};
