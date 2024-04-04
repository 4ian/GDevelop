// @flow
import { type I18n as I18nType } from '@lingui/core';
import * as React from 'react';
import ResourceSelectorWithThumbnail from '../ResourcesList/ResourceSelectorWithThumbnail';
import SelectOption from '../UI/SelectOption';
import { type MenuItemTemplate } from '../UI/Menu/Menu.flow';
import {
  type ResourceKind,
  type ResourceManagementProps,
} from '../ResourcesList/ResourceSource';
import {
  ResponsiveLineStackLayout,
  ColumnStackLayout,
  LineStackLayout,
} from '../UI/Layout';
import CompactSelectField from '../UI/CompactSelectField';
import CompactSemiControlledTextField from '../UI/CompactSemiControlledTextField';
import CompactSemiControlledNumberField from '../UI/CompactSemiControlledNumberField';
import { type UnsavedChanges } from '../MainFrame/UnsavedChangesContext';
import { Line } from '../UI/Grid';
import Text from '../UI/Text';
import useForceUpdate from '../Utils/UseForceUpdate';
import Edit from '../UI/CustomSvgIcons/Edit';
import IconButton from '../UI/IconButton';
import FlatButton from '../UI/FlatButton';
import VerticallyCenterWithBar from '../UI/VerticallyCenterWithBar';

// An "instance" here is the objects for which properties are shown
export type Instance = Object; // This could be improved using generics.
export type Instances = Array<Instance>;

// "Value" fields are fields displayed in the properties.
export type ValueFieldCommonProperties = {|
  name: string,
  getLabel?: Instance => string,
  getDescription?: Instance => string,
  getExtraDescription?: Instance => string,
  disabled?: boolean | ((instances: Array<gdInitialInstance>) => boolean),
  onEditButtonBuildMenuTemplate?: (i18n: I18nType) => Array<MenuItemTemplate>,
  onEditButtonClick?: () => void,
|};

// "Primitive" value fields are "simple" fields.
export type PrimitiveValueField =
  | {|
      valueType: 'number',
      getValue: Instance => number,
      setValue: (instance: Instance, newValue: number) => void,
      // TODO: support this attribute.
      getEndAdornment?: Instance => {|
        label: string,
        tooltipContent: React.Node,
      |},
      renderLeftIcon?: () => React.Node,
      ...ValueFieldCommonProperties,
    |}
  | {|
      valueType: 'string',
      getValue: Instance => string,
      setValue: (instance: Instance, newValue: string) => void,
      getChoices?: ?() => Array<{|
        value: string,
        label: string,
        labelIsUserDefined?: boolean,
      |}>,
      renderLeftIcon?: () => React.Node,
      ...ValueFieldCommonProperties,
    |}
  | {|
      valueType: 'boolean',
      getValue: Instance => boolean,
      setValue: (instance: Instance, newValue: boolean) => void,
      ...ValueFieldCommonProperties,
    |}
  | {|
      valueType: 'booleanIcon',
      renderIcon: (value: boolean) => React.Node,
      getValue: Instance => boolean,
      setValue: (instance: Instance, newValue: boolean) => void,
      ...ValueFieldCommonProperties,
    |}
  | {|
      valueType: 'color',
      getValue: Instance => string,
      setValue: (instance: Instance, newValue: string) => void,
      ...ValueFieldCommonProperties,
    |}
  | {|
      valueType: 'textarea',
      getValue: Instance => string,
      setValue: (instance: Instance, newValue: string) => void,
      ...ValueFieldCommonProperties,
    |};

// "Resource" fields are showing a resource selector.
type ResourceField = {|
  valueType: 'resource',
  resourceKind: ResourceKind,
  fallbackResourceKind?: ResourceKind,
  getValue: Instance => string,
  setValue: (instance: Instance, newValue: string) => void,
  renderLeftIcon?: () => React.Node,
  ...ValueFieldCommonProperties,
|};

type Title = {|
  name: string,
  renderLeftIcon: () => React.Node,
  getValue?: Instance => string,
  nonFieldType: 'title',
  defaultValue?: string,
|};

type SectionTitle = {|
  name: string,
  nonFieldType: 'sectionTitle',
  getValue: typeof undefined,
|};

type VerticalCenterWithBar = {|
  name: string,
  nonFieldType: 'verticalCenterWithBar',
  child: PrimitiveValueField,
|};

type ActionButton = {|
  label: string,
  disabled: 'onValuesDifferent',
  getValue: Instance => string,
  nonFieldType: 'button',
  onClick: (instance: Instance) => void,
|};

// A value field is a primitive or a resource.
export type ValueField = PrimitiveValueField | ResourceField;

// A field can be a primitive, a resource or a list of fields
export type Field =
  | PrimitiveValueField
  | ResourceField
  | SectionTitle
  | Title
  | ActionButton
  | VerticalCenterWithBar
  | {|
      name: string,
      type: 'row' | 'column',
      preventWrap?: boolean,
      title?: ?string,
      children: Array<Field>,
    |};

// The schema is the tree of all fields.
export type Schema = Array<Field>;

type Props = {|
  onInstancesModified?: Instances => void,
  instances: Instances,
  schema: Schema,
  mode?: 'column' | 'row',
  preventWrap?: boolean,

  // If set, render the "extra" description content from fields
  // (see getExtraDescription).
  renderExtraDescriptionText?: (extraDescription: string) => string,
  unsavedChanges?: ?UnsavedChanges,

  // Optional context:
  project?: ?gdProject,
  resourceManagementProps?: ?ResourceManagementProps,
|};

const styles = {
  columnContainer: {
    display: 'flex',
    flexDirection: 'column',
  },
  fieldContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  field: {
    flex: 1,
    width: 'auto',
  },
  subHeader: {
    paddingLeft: 0,
  },
  container: { flex: 1, minWidth: 0 },
};

const getDisabled = ({
  instances,
  field,
}: {|
  instances: Instances,
  field: ValueField,
|}): boolean => {
  return typeof field.disabled === 'boolean'
    ? field.disabled
    : typeof field.disabled === 'function'
    ? field.disabled(instances)
    : false;
};

/**
 * Get the value for the given field across all instances.
 * If one of the instances doesn't share the same value, returns the default value.
 * If there is no instances, returns the default value.
 * If the field does not have a `getValue` method, returns `null`.
 */
const getFieldValue = ({
  instances,
  field,
  defaultValue,
}: {|
  instances: Instances,
  field: ValueField | ActionButton | SectionTitle | Title,
  defaultValue?: any,
|}): any => {
  if (!instances[0]) {
    console.log(
      'getFieldValue was called with an empty list of instances (or containing undefined). This is a bug that should be fixed'
    );
    return defaultValue;
  }

  const { getValue } = field;
  if (!getValue) return null;

  let value = getValue(instances[0]);
  for (var i = 1; i < instances.length; ++i) {
    if (value !== getValue(instances[i])) {
      if (typeof defaultValue !== 'undefined') value = defaultValue;
      break;
    }
  }

  return value;
};

const getFieldLabel = ({
  instances,
  field,
}: {|
  instances: Instances,
  field: ValueField,
|}): any => {
  if (!instances[0]) {
    console.log(
      'PropertiesEditor._getFieldLabel was called with an empty list of instances (or containing undefined). This is a bug that should be fixed'
    );
    return field.name;
  }

  if (field.getLabel) return field.getLabel(instances[0]);

  return field.name;
};

const CompactPropertiesEditor = ({
  onInstancesModified,
  instances,
  schema,
  mode,
  renderExtraDescriptionText,
  unsavedChanges,
  project,
  resourceManagementProps,
  preventWrap,
}: Props) => {
  const forceUpdate = useForceUpdate();

  const _onInstancesModified = React.useCallback(
    (instances: Instances) => {
      // This properties editor is dealing with fields that are
      // responsible to update their state (see field.setValue).

      if (unsavedChanges) unsavedChanges.triggerUnsavedChanges();
      if (onInstancesModified) onInstancesModified(instances);
      forceUpdate();
    },
    [unsavedChanges, onInstancesModified, forceUpdate]
  );

  const getFieldDescription = React.useCallback(
    (field: ValueField): ?string => {
      if (!instances[0]) {
        console.log(
          'PropertiesEditor._getFieldDescription was called with an empty list of instances (or containing undefined). This is a bug that should be fixed'
        );
        return undefined;
      }

      const descriptions: Array<string> = [];
      if (field.getDescription)
        descriptions.push(field.getDescription(instances[0]));
      if (renderExtraDescriptionText && field.getExtraDescription)
        descriptions.push(
          renderExtraDescriptionText(field.getExtraDescription(instances[0]))
        );

      return descriptions.join('\n') || undefined;
    },
    [instances, renderExtraDescriptionText]
  );

  const renderInputField = React.useCallback(
    (field: ValueField) => {
      if (field.name === 'PLEASE_ALSO_SHOW_EDIT_BUTTON_THANKS') return null; // This special property was used in GDevelop 4 IDE to ask for a Edit button to be shown, ignore it.

      if (field.valueType === 'boolean') {
        return 'TODO';
        // const { setValue } = field;
        // const description = getFieldDescription(field);
        // return (
        //   <InlineCheckbox
        //     label={
        //       !description ? (
        //         getFieldLabel({ instances, field })
        //       ) : (
        //         <React.Fragment>
        //           <Line noMargin>{getFieldLabel({ instances, field })}</Line>
        //           <FormHelperText style={{ display: 'inline' }}>
        //             <MarkdownText source={description} />
        //           </FormHelperText>
        //         </React.Fragment>
        //       )
        //     }
        //     key={field.name}
        //     id={field.name}
        //     checked={getFieldValue({ instances, field })}
        //     onCheck={(event, newValue) => {
        //       instances.forEach(i => setValue(i, !!newValue));
        //       _onInstancesModified(instances);
        //     }}
        //     disabled={getDisabled({ instances, field })}
        //   />
        // );
      } else if (field.valueType === 'number') {
        const { setValue } = field;
        // TODO: Support end adornment
        // const endAdornment = getEndAdornment && getEndAdornment(instances[0]);

        return (
          <CompactSemiControlledNumberField
            value={getFieldValue({ instances, field })}
            key={field.name}
            id={field.name}
            // floatingLabelText={getFieldLabel({ instances, field })}
            // helperMarkdownText={getFieldDescription(field)}
            onChange={newValue => {
              // If the value is not a number, the user is probably still typing, adding a dot or a comma.
              // So don't update the value, it will be reverted if they leave the field.
              if (isNaN(newValue)) return;
              instances.forEach(i => setValue(i, newValue));
              _onInstancesModified(instances);
            }}
            disabled={getDisabled({ instances, field })}
            renderLeftIcon={field.renderLeftIcon}
            leftIconTooltip={getFieldLabel({ instances, field })}
            useLeftIconAsNumberControl
            // endAdornment={
            //   endAdornment && (
            //     <Tooltip title={endAdornment.tooltipContent}>
            //       <InputAdornment position="end">
            //         {endAdornment.label}
            //       </InputAdornment>
            //     </Tooltip>
            //   )
            // }
          />
        );
      } else if (field.valueType === 'color') {
        return 'TODO';
        // const { setValue } = field;
        // return (
        //   <Column key={field.name} expand noMargin>
        //     <ColorField
        //       id={field.name}
        //       floatingLabelText={getFieldLabel({ instances, field })}
        //       helperMarkdownText={getFieldDescription(field)}
        //       disableAlpha
        //       fullWidth
        //       color={getFieldValue({ instances, field })}
        //       onChange={color => {
        //         const rgbString =
        //           color.length === 0 ? '' : rgbOrHexToRGBString(color);
        //         instances.forEach(i => setValue(i, rgbString));
        //         _onInstancesModified(instances);
        //       }}
        //     />
        //   </Column>
        // );
      } else if (field.valueType === 'booleanIcon') {
        const value = getFieldValue({ instances, field });
        return (
          <IconButton
            key={field.name}
            id={field.name}
            size="small"
            tooltip={getFieldLabel({ instances, field })}
            selected={value}
            onClick={event => {
              instances.forEach(i => field.setValue(i, !value));
              _onInstancesModified(instances);
            }}
          >
            {field.renderIcon(value)}
          </IconButton>
        );
      } else if (field.valueType === 'textarea') {
        return 'TODO';
        // const { setValue } = field;
        // return (
        //   <SemiControlledTextField
        //     key={field.name}
        //     id={field.name}
        //     onChange={text => {
        //       instances.forEach(i => setValue(i, text || ''));
        //       _onInstancesModified(instances);
        //     }}
        //     value={getFieldValue({ instances, field })}
        //     floatingLabelText={getFieldLabel({ instances, field })}
        //     floatingLabelFixed
        //     helperMarkdownText={getFieldDescription(field)}
        //     multiline
        //     style={styles.field}
        //   />
        // );
      } else {
        const {
          // TODO: Still support onEditButtonClick & onEditButtonBuildMenuTemplate ?
          // onEditButtonBuildMenuTemplate,
          // onEditButtonClick,
          setValue,
        } = field;
        return (
          <CompactSemiControlledTextField
            value={getFieldValue({
              instances,
              field,
              defaultValue: '(Multiple values)',
            })}
            id={field.name}
            // floatingLabelText={getFieldLabel({ instances, field })}
            // helperMarkdownText={getFieldDescription(field)}
            onChange={newValue => {
              instances.forEach(i => setValue(i, newValue || ''));
              _onInstancesModified(instances);
            }}
            disabled={getDisabled({ instances, field })}
            renderLeftIcon={field.renderLeftIcon}
            leftIconTooltip={getFieldLabel({ instances, field })}
          />
        );
      }
    },
    [instances, _onInstancesModified]
  );

  const renderSelectField = React.useCallback(
    (field: ValueField) => {
      if (!field.getChoices || !field.getValue) return;

      const children = field
        .getChoices()
        .map(({ value, label, labelIsUserDefined }) => (
          <SelectOption
            key={value}
            value={value}
            label={label}
            shouldNotTranslate={labelIsUserDefined}
          />
        ));

      if (field.valueType === 'number') {
        const { setValue } = field;
        return (
          <CompactSelectField
            value={getFieldValue({ instances, field })}
            key={field.name}
            id={field.name}
            // floatingLabelText={getFieldLabel({ instances, field })}
            // helperMarkdownText={getFieldDescription(field)}
            onChange={(newValue: string) => {
              instances.forEach(i => setValue(i, parseFloat(newValue) || 0));
              _onInstancesModified(instances);
            }}
            disabled={field.disabled}
          >
            {children}
          </CompactSelectField>
        );
      } else if (field.valueType === 'string') {
        const { setValue } = field;
        return (
          <CompactSelectField
            value={getFieldValue({
              instances,
              field,
              defaultValue: '(Multiple values)',
            })}
            key={field.name}
            id={field.name}
            // floatingLabelText={getFieldLabel({ instances, field })}
            // helperMarkdownText={getFieldDescription(field)}
            onChange={(newValue: string) => {
              instances.forEach(i => setValue(i, newValue || ''));
              _onInstancesModified(instances);
            }}
            disabled={getDisabled({ instances, field })}
            renderLeftIcon={field.renderLeftIcon}
            leftIconTooltip={getFieldLabel({ instances, field })}
          >
            {children}
          </CompactSelectField>
        );
      }
    },
    [instances, _onInstancesModified]
  );

  const renderButton = React.useCallback(
    (field: ActionButton) => {
      let disabled = false;
      if (field.disabled === 'onValuesDifferent') {
        const DIFFERENT_VALUES = 'DIFFERENT_VALUES';
        disabled =
          getFieldValue({
            instances,
            field,
            defaultValue: DIFFERENT_VALUES,
          }) === DIFFERENT_VALUES;
      }
      return (
        <FlatButton
          key={`button-${field.label}`}
          fullWidth
          primary
          leftIcon={<Edit fontSize="small" />}
          disabled={disabled}
          label={field.label}
          onClick={() => {
            field.onClick(instances[0]);
          }}
        />
      );
    },
    [instances]
  );

  const renderResourceField = (field: ResourceField) => {
    if (!project || !resourceManagementProps) {
      console.error(
        'You tried to display a resource field in a PropertiesEditor that does not support display resources. If you need to display resources, pass additional props (project, resourceManagementProps).'
      );
      return null;
    }

    const { setValue } = field;
    return (
      <ResourceSelectorWithThumbnail
        key={field.name}
        project={project}
        resourceManagementProps={resourceManagementProps}
        resourceKind={field.resourceKind}
        fallbackResourceKind={field.fallbackResourceKind}
        resourceName={getFieldValue({
          instances,
          field,
          defaultValue: '(Multiple values)', //TODO
        })}
        onChange={newValue => {
          instances.forEach(i => setValue(i, newValue));
          _onInstancesModified(instances);
        }}
        floatingLabelText={getFieldLabel({ instances, field })}
        helperMarkdownText={getFieldDescription(field)}
      />
    );
  };

  const renderVerticalCenterWithBar = (field: Field) => (
    <VerticallyCenterWithBar>
      {field.child && field.child.getValue
        ? renderInputField(field.child)
        : 'TODO'}
    </VerticallyCenterWithBar>
  );

  const renderContainer =
    mode === 'row'
      ? (fields: React.Node) =>
          preventWrap ? (
            <LineStackLayout noMargin alignItems="center" expand>
              {fields}
            </LineStackLayout>
          ) : (
            <ResponsiveLineStackLayout noMargin alignItems="center" expand>
              {fields}
            </ResponsiveLineStackLayout>
          )
      : (fields: React.Node) => (
          <ColumnStackLayout noMargin expand>
            {fields}
          </ColumnStackLayout>
        );

  const renderTitle = React.useCallback(
    (field: Title) => {
      const { getValue, renderLeftIcon } = field;

      let additionalText = null;

      if (getValue) {
        let selectedInstancesValue = getFieldValue({
          instances,
          field,
          defaultValue: field.defaultValue || 'Multiple Values',
        });
        if (!!selectedInstancesValue) additionalText = selectedInstancesValue;
      }

      if (!!additionalText) {
        return (
          <LineStackLayout
            alignItems="center"
            key={`section-title-${field.name}`}
            noMargin
          >
            {renderLeftIcon()}
            <Text displayInlineAsSpan noMargin>
              {field.name}
            </Text>
            <Text allowSelection displayInlineAsSpan size="body2" noMargin>
              -
            </Text>
            <Text allowSelection displayInlineAsSpan size="body2" noMargin>
              {additionalText}
            </Text>
          </LineStackLayout>
        );
      }

      return (
        <LineStackLayout key={`title-${field.name}`}>
          {renderLeftIcon()}
          <Text displayInlineAsSpan size="sub-title">
            {field.name}
          </Text>
        </LineStackLayout>
      );
    },
    [instances]
  );
  const renderSectionTitle = React.useCallback((field: SectionTitle) => {
    return (
      <Line key={`section-title-${field.name}`}>
        <Text displayInlineAsSpan size="sub-title">
          {field.name}
        </Text>
      </Line>
    );
  }, []);

  return renderContainer(
    schema.map(field => {
      if (!!field.nonFieldType) {
        if (field.nonFieldType === 'title') {
          return renderTitle(field);
        } else if (field.nonFieldType === 'sectionTitle') {
          return renderSectionTitle(field);
        } else if (field.nonFieldType === 'button') {
          return renderButton(field);
        } else if (field.nonFieldType === 'verticalCenterWithBar') {
          return renderVerticalCenterWithBar(field);
        }
        return null;
      } else if (field.children) {
        if (field.type === 'row') {
          const contentView = (
            <React.Fragment key={field.name}>
              <CompactPropertiesEditor
                project={project}
                resourceManagementProps={resourceManagementProps}
                schema={field.children}
                instances={instances}
                mode="row"
                unsavedChanges={unsavedChanges}
                onInstancesModified={onInstancesModified}
                preventWrap={field.preventWrap}
              />
            </React.Fragment>
          );
          if (field.title) {
            return [
              <Text key={field.name + '-title'} size="sub-title">
                {field.title}
              </Text>,
              contentView,
            ];
          }
          return contentView;
        }

        return (
          <div key={field.name} style={styles.container}>
            <React.Fragment key={field.name}>
              <CompactPropertiesEditor
                project={project}
                resourceManagementProps={resourceManagementProps}
                schema={field.children}
                instances={instances}
                mode="column"
                unsavedChanges={unsavedChanges}
                onInstancesModified={onInstancesModified}
                preventWrap={field.preventWrap}
              />
            </React.Fragment>
          </div>
        );
      } else if (field.valueType === 'resource') {
        return renderResourceField(field);
      } else {
        if (field.getChoices && field.getValue) return renderSelectField(field);
        if (field.getValue) return renderInputField(field);
      }
      return null;
    })
  );
};

export default CompactPropertiesEditor;
