// @flow
import { Trans } from '@lingui/macro';
import { type I18n as I18nType } from '@lingui/core';
import { t } from '@lingui/macro';

import * as React from 'react';
import Background from '../../UI/Background';
import enumerateLayers from '../../LayersList/EnumerateLayers';
import EmptyMessage from '../../UI/EmptyMessage';
import PropertiesEditor from '../../PropertiesEditor';
import propertiesMapToSchema from '../../PropertiesEditor/PropertiesMapToSchema';
import { type Schema } from '../../PropertiesEditor';
import getObjectByName from '../../Utils/GetObjectByName';
import IconButton from '../../UI/IconButton';
import { Line, Column } from '../../UI/Grid';
import OpenInNew from '@material-ui/icons/OpenInNew';
import Text from '../../UI/Text';
import { type UnsavedChanges } from '../../MainFrame/UnsavedChangesContext';
import ScrollView from '../../UI/ScrollView';
import EventsRootVariablesFinder from '../../Utils/EventsRootVariablesFinder';
import VariablesList, {
  type HistoryHandler,
} from '../../VariablesList/VariablesList';

type Props = {|
  project: gdProject,
  layout: gdLayout,
  instances: Array<gdInitialInstance>,
  onEditObjectByName: string => void,
  onInstancesModified?: (Array<gdInitialInstance>) => void,
  editInstanceVariables: gdInitialInstance => void,
  unsavedChanges?: ?UnsavedChanges,
  i18n: I18nType,
  historyHandler?: HistoryHandler,
|};

export default class InstancePropertiesEditor extends React.Component<Props> {
  schema: Schema = [
    {
      name: this.props.i18n._(t`Object`),
      getValue: (instance: gdInitialInstance) => instance.getObjectName(),
      nonFieldType: 'sectionTitle',
      defaultValue: this.props.i18n._(t`Different objects`),
    },
    {
      label: this.props.i18n._(t`Edit object`),
      disabled: 'onValuesDifferent',
      nonFieldType: 'button',
      getValue: (instance: gdInitialInstance) => instance.getObjectName(),
      onClick: (instance: gdInitialInstance) =>
        this.props.onEditObjectByName(instance.getObjectName()),
    },
    {
      name: this.props.i18n._(t`Instance`),
      nonFieldType: 'sectionTitle',
    },
    {
      name: this.props.i18n._(t`Position`),
      type: 'row',
      children: [
        {
          name: this.props.i18n._(t`X`),
          valueType: 'number',
          getValue: (instance: gdInitialInstance) => instance.getX(),
          setValue: (instance: gdInitialInstance, newValue: number) =>
            instance.setX(newValue),
          roundValue: true,
        },
        {
          name: this.props.i18n._(t`Y`),
          valueType: 'number',
          getValue: (instance: gdInitialInstance) => instance.getY(),
          setValue: (instance: gdInitialInstance, newValue: number) =>
            instance.setY(newValue),
          roundValue: true,
        },
      ],
    },
    {
      name: this.props.i18n._(t`Angle`),
      valueType: 'number',
      getValue: (instance: gdInitialInstance) => instance.getAngle(),
      setValue: (instance: gdInitialInstance, newValue: number) =>
        instance.setAngle(newValue),
      roundValue: true,
    },
    {
      name: this.props.i18n._(t`Lock position/angle in the editor`),
      valueType: 'boolean',
      getValue: (instance: gdInitialInstance) => instance.isLocked(),
      setValue: (instance: gdInitialInstance, newValue: boolean) =>
        instance.setLocked(newValue),
    },
    {
      name: this.props.i18n._(t`Prevent selection in the canvas`),
      valueType: 'boolean',
      disabled: (instances: gdInitialInstance[]) => {
        return instances.some(instance => !instance.isLocked());
      },
      getValue: (instance: gdInitialInstance) => instance.isSealed(),
      setValue: (instance: gdInitialInstance, newValue: boolean) =>
        instance.setSealed(newValue),
    },
    {
      name: this.props.i18n._(t`Z Order`),
      valueType: 'number',
      getValue: (instance: gdInitialInstance) => instance.getZOrder(),
      setValue: (instance: gdInitialInstance, newValue: number) =>
        instance.setZOrder(newValue),
    },
    {
      name: this.props.i18n._(t`Layer`),
      valueType: 'string',
      getChoices: () => enumerateLayers(this.props.layout),
      getValue: (instance: gdInitialInstance) => instance.getLayer(),
      setValue: (instance: gdInitialInstance, newValue: string) =>
        instance.setLayer(newValue),
    },
    {
      name: this.props.i18n._(t`Custom size`),
      valueType: 'boolean',
      getValue: (instance: gdInitialInstance) => instance.hasCustomSize(),
      setValue: (instance: gdInitialInstance, newValue: boolean) =>
        instance.setHasCustomSize(newValue),
    },
    {
      name: 'custom-size-row',
      type: 'row',
      children: [
        {
          name: this.props.i18n._(t`Width`),
          valueType: 'number',
          getValue: (instance: gdInitialInstance) => instance.getCustomWidth(),
          setValue: (instance: gdInitialInstance, newValue: number) =>
            instance.setCustomWidth(Math.max(newValue, 0)),
        },
        {
          name: this.props.i18n._(t`Height`),
          valueType: 'number',
          getValue: (instance: gdInitialInstance) => instance.getCustomHeight(),
          setValue: (instance: gdInitialInstance, newValue: number) =>
            instance.setCustomHeight(Math.max(newValue, 0)),
        },
      ],
    },
  ];

  _renderEmpty() {
    return (
      <EmptyMessage>
        <Trans>
          Click on an instance in the scene to display its properties
        </Trans>
      </EmptyMessage>
    );
  }

  _renderInstancesProperties() {
    const { project, layout, instances } = this.props;
    const instance = instances[0];
    const associatedObjectName = instance.getObjectName();
    const object = getObjectByName(project, layout, associatedObjectName);
    //TODO: multiple instances support
    const properties = instance.getCustomProperties(project, layout);
    const instanceSchema = propertiesMapToSchema(
      properties,
      (instance: gdInitialInstance) =>
        instance.getCustomProperties(project, layout),
      (instance: gdInitialInstance, name, value) =>
        instance.updateCustomProperty(name, value, project, layout)
    );

    return (
      <ScrollView
        autoHideScrollbar
        key={instances
          .map((instance: gdInitialInstance) => '' + instance.ptr)
          .join(';')}
      >
        <Column expand noMargin>
          <Column>
            <PropertiesEditor
              unsavedChanges={this.props.unsavedChanges}
              schema={this.schema.concat(instanceSchema)}
              instances={instances}
              onInstancesModified={this.props.onInstancesModified}
            />
            <Line alignItems="center" justifyContent="space-between">
              <Text>
                <Trans>Instance Variables</Trans>
              </Text>
              <IconButton
                size="small"
                onClick={() => {
                  this.props.editInstanceVariables(instance);
                }}
              >
                <OpenInNew />
              </IconButton>
            </Line>
          </Column>
          {object ? (
            <VariablesList
              commitChangesOnBlur={false}
              inheritedVariablesContainer={object.getVariables()}
              variablesContainer={instance.getVariables()}
              size="small"
              onComputeAllVariableNames={() =>
                object
                  ? EventsRootVariablesFinder.findAllObjectVariables(
                      project.getCurrentPlatform(),
                      project,
                      layout,
                      object
                    )
                  : []
              }
              historyHandler={this.props.historyHandler}
            />
          ) : null}
        </Column>
      </ScrollView>
    );
  }

  render() {
    const { instances } = this.props;

    return (
      <Background>
        {!instances || !instances.length
          ? this._renderEmpty()
          : this._renderInstancesProperties()}
      </Background>
    );
  }
}
