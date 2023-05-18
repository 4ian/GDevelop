// @flow
import { Trans } from '@lingui/macro';
import { type I18n as I18nType } from '@lingui/core';
import { t } from '@lingui/macro';

import * as React from 'react';
import Background from '../../UI/Background';
import enumerateLayers from '../../LayersList/EnumerateLayers';
import EmptyMessage from '../../UI/EmptyMessage';
import PropertiesEditor from '../../PropertiesEditor';
import propertiesMapToSchema, {
  reorganizeSchemaFor3DInstance,
} from '../../PropertiesEditor/PropertiesMapToSchema';
import { type Schema } from '../../PropertiesEditor';
import getObjectByName from '../../Utils/GetObjectByName';
import IconButton from '../../UI/IconButton';
import { Line, Column } from '../../UI/Grid';
import Text from '../../UI/Text';
import { type UnsavedChanges } from '../../MainFrame/UnsavedChangesContext';
import ScrollView from '../../UI/ScrollView';
import EventsRootVariablesFinder from '../../Utils/EventsRootVariablesFinder';
import VariablesList, {
  type HistoryHandler,
} from '../../VariablesList/VariablesList';
import ShareExternal from '../../UI/CustomSvgIcons/ShareExternal';
import useForceUpdate from '../../Utils/UseForceUpdate';

type Props = {|
  project: gdProject,
  layout: gdLayout,
  instances: Array<gdInitialInstance>,
  onEditObjectByName: string => void,
  onInstancesModified?: (Array<gdInitialInstance>) => void,
  onGetInstanceSize: gdInitialInstance => [number, number],
  editInstanceVariables: gdInitialInstance => void,
  unsavedChanges?: ?UnsavedChanges,
  i18n: I18nType,
  historyHandler?: HistoryHandler,
|};

export type InstancePropertiesEditorInterface = {| forceUpdate: () => void |};

const InstancePropertiesEditor = ({
  instances,
  i18n,
  project,
  layout,
  unsavedChanges,
  historyHandler,
  onEditObjectByName,
  onGetInstanceSize,
  editInstanceVariables,
  onInstancesModified,
}: Props) => {
  const schema: Schema = React.useMemo(
    () => [
      {
        name: i18n._(t`Object`),
        getValue: (instance: gdInitialInstance) => instance.getObjectName(),
        nonFieldType: 'sectionTitle',
        defaultValue: i18n._(t`Different objects`),
      },
      {
        label: i18n._(t`Edit object`),
        disabled: 'onValuesDifferent',
        nonFieldType: 'button',
        getValue: (instance: gdInitialInstance) => instance.getObjectName(),
        onClick: (instance: gdInitialInstance) =>
          onEditObjectByName(instance.getObjectName()),
      },
      {
        name: i18n._(t`Instance`),
        nonFieldType: 'sectionTitle',
      },
      {
        name: 'Position',
        type: 'row',
        children: [
          {
            name: 'X',
            getLabel: () => i18n._(t`X`),
            valueType: 'number',
            getValue: (instance: gdInitialInstance) => instance.getX(),
            setValue: (instance: gdInitialInstance, newValue: number) =>
              instance.setX(newValue),
          },
          {
            name: 'Y',
            getLabel: () => i18n._(t`Y`),
            valueType: 'number',
            getValue: (instance: gdInitialInstance) => instance.getY(),
            setValue: (instance: gdInitialInstance, newValue: number) =>
              instance.setY(newValue),
          },
        ],
      },
      {
        name: 'Angles',
        type: 'row',
        children: [
          {
            name: 'Angle',
            getLabel: () => i18n._(t`Angle`),
            valueType: 'number',
            getValue: (instance: gdInitialInstance) => instance.getAngle(),
            setValue: (instance: gdInitialInstance, newValue: number) =>
              instance.setAngle(newValue),
          },
        ],
      },
      {
        name: 'Lock instance position angle',
        getLabel: () => i18n._(t`Lock position/angle in the editor`),
        valueType: 'boolean',
        getValue: (instance: gdInitialInstance) => instance.isLocked(),
        setValue: (instance: gdInitialInstance, newValue: boolean) => {
          instance.setLocked(newValue);
          if (!newValue) {
            instance.setSealed(newValue);
          }
        },
      },
      {
        name: 'Prevent instance selection',
        getLabel: () => i18n._(t`Prevent selection in the editor`),
        valueType: 'boolean',
        disabled: (instances: gdInitialInstance[]) => {
          return instances.some(instance => !instance.isLocked());
        },
        getValue: (instance: gdInitialInstance) => instance.isSealed(),
        setValue: (instance: gdInitialInstance, newValue: boolean) =>
          instance.setSealed(newValue),
      },
      {
        name: 'Z Order',
        getLabel: () => i18n._(t`Z Order`),
        valueType: 'number',
        getValue: (instance: gdInitialInstance) => instance.getZOrder(),
        setValue: (instance: gdInitialInstance, newValue: number) =>
          instance.setZOrder(newValue),
      },
      {
        name: 'Layer',
        getLabel: () => i18n._(t`Layer`),
        valueType: 'string',
        getChoices: () => enumerateLayers(layout),
        getValue: (instance: gdInitialInstance) => instance.getLayer(),
        setValue: (instance: gdInitialInstance, newValue: string) =>
          instance.setLayer(newValue),
      },
      {
        name: 'Custom size',
        getLabel: () => i18n._(t`Custom size`),
        valueType: 'boolean',
        getValue: (instance: gdInitialInstance) => instance.hasCustomSize(),
        setValue: (instance: gdInitialInstance, newValue: boolean) => {
          if (newValue) {
            const [width, height] = onGetInstanceSize(instance);
            instance.setCustomWidth(width);
            instance.setCustomHeight(height);
          }
          instance.setHasCustomSize(newValue);
        },
      },
      {
        name: 'custom-size-row',
        type: 'row',
        children: [
          {
            name: 'Width',
            getLabel: () => i18n._(t`Width`),
            valueType: 'number',
            getValue: (instance: gdInitialInstance) =>
              instance.getCustomWidth(),
            setValue: (instance: gdInitialInstance, newValue: number) => {
              instance.setHasCustomSize(true);
              instance.setCustomWidth(Math.max(newValue, 0));
            },
          },
          {
            name: 'Height',
            getLabel: () => i18n._(t`Height`),
            valueType: 'number',
            getValue: (instance: gdInitialInstance) =>
              instance.getCustomHeight(),
            setValue: (instance: gdInitialInstance, newValue: number) => {
              instance.setHasCustomSize(true);
              instance.setCustomHeight(Math.max(newValue, 0));
            },
          },
        ],
      },
    ],
    [i18n, layout, onEditObjectByName, onGetInstanceSize]
  );

  const instance = instances[0];

  const { object, instanceSchema } = React.useMemo(
    () => {
      if (!instance) return {};
      const associatedObjectName = instance.getObjectName();
      const object = getObjectByName(project, layout, associatedObjectName);
      // TODO: multiple instances support
      const properties = instance.getCustomProperties(project, layout);
      // TODO: Reorganize fields if any of the selected instances is 3D.
      const is3DInstance = properties.has('z');
      const instanceSchemaForCustomProperties = propertiesMapToSchema(
        properties,
        (instance: gdInitialInstance) =>
          instance.getCustomProperties(project, layout),
        (instance: gdInitialInstance, name, value) =>
          instance.updateCustomProperty(name, value, project, layout)
      );
      return {
        object,
        instanceSchema: is3DInstance
          ? reorganizeSchemaFor3DInstance(
              schema,
              instanceSchemaForCustomProperties
            )
          : schema.concat(instanceSchemaForCustomProperties),
      };
    },
    [project, layout, instance, schema]
  );

  if (!object || !instance || !instanceSchema) return null;

  return (
    <ScrollView
      autoHideScrollbar
      key={instances
        .map((instance: gdInitialInstance) => '' + instance.ptr)
        .join(';')}
    >
      <Column expand noMargin id="instance-properties-editor">
        <Column>
          <PropertiesEditor
            unsavedChanges={unsavedChanges}
            schema={instanceSchema}
            instances={instances}
            onInstancesModified={onInstancesModified}
          />
          <Line alignItems="center" justifyContent="space-between">
            <Text>
              <Trans>Instance Variables</Trans>
            </Text>
            <IconButton
              size="small"
              onClick={() => {
                editInstanceVariables(instance);
              }}
            >
              <ShareExternal />
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
            historyHandler={historyHandler}
          />
        ) : null}
      </Column>
    </ScrollView>
  );
};

const InstancePropertiesEditorContainer = React.forwardRef<
  Props,
  InstancePropertiesEditorInterface
>((props, ref) => {
  const editorRef = React.useRef<?InstancePropertiesEditorInterface>(null);
  const forceUpdate = useForceUpdate();
  React.useImperativeHandle(ref, () => ({
    forceUpdate,
  }));

  return (
    <Background>
      {!props.instances || !props.instances.length ? (
        <EmptyMessage>
          <Trans>
            Click on an instance in the scene to display its properties
          </Trans>
        </EmptyMessage>
      ) : (
        <InstancePropertiesEditor {...props} ref={editorRef} />
      )}
    </Background>
  );
});

export default InstancePropertiesEditorContainer;
