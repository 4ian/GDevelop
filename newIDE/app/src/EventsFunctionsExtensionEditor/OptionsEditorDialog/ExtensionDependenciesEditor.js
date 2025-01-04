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
import CompactSemiControlledTextField from '../../UI/CompactSemiControlledTextField';
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
import { ColumnStackLayout } from '../../UI/Layout';
import Text from '../../UI/Text';
import { CompactResourceSelectorWithThumbnail } from '../../ResourcesList/CompactResourceSelectorWithThumbnail';
import { type ResourceManagementProps } from '../../ResourcesList/ResourceSource';
import CompactSelectField from '../../UI/CompactSelectField';

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

type Props = {|
  eventsFunctionsExtension: gdEventsFunctionsExtension,

  // For source files:
  project: gdProject,
  resourceManagementProps: ResourceManagementProps,
|};

export const ExtensionDependenciesEditor = ({
  eventsFunctionsExtension,
  project,
  resourceManagementProps,
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
    <ColumnStackLayout noMargin noOverflowParent>
      <Text size="block-title">
        <Trans>Dependencies</Trans>
      </Text>
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
                    <CompactSemiControlledTextField
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
                    />
                  </TableRowColumn>
                  <TableRowColumn>
                    <CompactSemiControlledTextField
                      commitOnBlur
                      value={dependency.getExportName()}
                      onChange={newExportName => {
                        if (newExportName === dependency.getExportName())
                          return;

                        dependency.setExportName(newExportName);
                        forceUpdate();
                      }}
                    />
                  </TableRowColumn>
                  <TableRowColumn>
                    <CompactSemiControlledTextField
                      commitOnBlur
                      value={dependency.getVersion()}
                      onChange={newVersion => {
                        if (newVersion === dependency.getVersion()) return;

                        dependency.setVersion(newVersion);
                        forceUpdate();
                      }}
                    />
                  </TableRowColumn>
                  <TableRowColumn>
                    <CompactSelectField
                      value={dependency.getDependencyType()}
                      onChange={newType => {
                        if (newType === dependency.getDependencyType()) return;

                        dependency.setDependencyType(newType);
                        forceUpdate();
                      }}
                    >
                      <SelectOption value="npm" label={t`NPM`} />
                      <SelectOption value="cordova" label={t`Cordova`} />
                    </CompactSelectField>
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
      <BackgroundText>
        <Trans>
          Dependencies allow to add additional libraries in the exported games.
          NPM dependencies will be included for Electron builds (Windows, macOS,
          Linux) and Cordova dependencies will be included for Cordova builds
          (Android, iOS). Note that this is intended for usage in JavaScript
          events only. If you are only using standard events, you should not
          worry about this.
        </Trans>
      </BackgroundText>
      <Text size="block-title">
        <Trans>Extra source files (experimental)</Trans>
      </Text>
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
                <Trans>Source file</Trans>
              </TableHeaderColumn>
              <TableHeaderColumn>
                <Trans>Loading Position</Trans>
              </TableHeaderColumn>
              <TableHeaderColumn>
                <Trans>Action</Trans>
              </TableHeaderColumn>
            </TableRow>
          </TableHeader>
          <TableBody>
            {// $FlowFixMe - unsure why Flow complains about TableRow.
            mapVector<gdSourceFileMetadata, TableRow>(
              eventsFunctionsExtension.getAllSourceFiles(),
              (sourceFile, index) => (
                // $FlowFixMe - unsure why Flow complains about TableRow.
                <TableRow key={sourceFile.getResourceName()}>
                  <TableRowColumn>
                    <CompactResourceSelectorWithThumbnail
                      project={project}
                      resourceManagementProps={resourceManagementProps}
                      resourceKind="javascript"
                      resourceName={sourceFile.getResourceName()}
                      onChange={newResourceName => {
                        sourceFile.setResourceName(newResourceName);
                        forceUpdate();
                      }}
                    />
                  </TableRowColumn>
                  <TableRowColumn>
                    <CompactSelectField
                      value={sourceFile.getIncludePosition()}
                      onChange={newType => {
                        if (newType === sourceFile.getIncludePosition()) return;

                        sourceFile.setIncludePosition(newType);
                        forceUpdate();
                      }}
                    >
                      <SelectOption
                        value="first"
                        label={t`First (before other files)`}
                      />
                      <SelectOption
                        value="last"
                        label={t`Last (after other files)`}
                      />
                    </CompactSelectField>
                  </TableRowColumn>
                  <TableRowColumn>
                    <IconButton
                      tooltip={t`Delete`}
                      onClick={() => {
                        eventsFunctionsExtension.removeSourceFileAt(index);
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
              onClick={() => {
                eventsFunctionsExtension.addSourceFile();
                forceUpdate();
              }}
            />
          </Line>
        </Column>
      </TableContainer>
      <BackgroundText>
        <Trans>
          JavaScript files are imported as is (no compilation and not available
          in JavaScript code block autocompletions). Make sure your extension is
          used by the game (at least one action/condition used in a scene),
          otherwise the files won't be imported.
        </Trans>
      </BackgroundText>
    </ColumnStackLayout>
  );
};
