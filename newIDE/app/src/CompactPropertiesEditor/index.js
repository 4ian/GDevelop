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
import { Column, Line, Spacer, marginsSize } from '../UI/Grid';
import Text from '../UI/Text';
import useForceUpdate from '../Utils/UseForceUpdate';
import Edit from '../UI/CustomSvgIcons/Edit';
import IconButton from '../UI/IconButton';
import FlatButton from '../UI/FlatButton';
import VerticallyCenterWithBar from '../UI/VerticallyCenterWithBar';
import GDevelopThemeContext from '../UI/Theme/GDevelopThemeContext';
import { textEllipsisStyle } from '../UI/TextEllipsis';
import CompactPropertiesEditorRowField from './CompactPropertiesEditorRowField';
import { CompactToggleField } from '../UI/CompactToggleField';
import { CompactTextAreaField } from '../UI/CompactTextAreaField';

// An "instance" here is the objects for which properties are shown
export type Instance = Object; // This could be improved using generics.
export type Instances = Array<Instance>;

// "Value" fields are fields displayed in the properties.
export type ValueFieldCommonProperties = {|
  name: string,
  getLabel?: Instance => string,
  getDescription?: Instance => string,
  hideLabel?: boolean,
  getExtraDescription?: Instance => string,
  disabled?: (instances: Array<gdInitialInstance>) => boolean,
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
      getEndAdornmentIcon?: Instance => ?(className: string) => React.Node,
      onClickEndAdornment?: Instance => void,
      renderLeftIcon?: (className?: string) => React.Node,
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
      getEndAdornmentIcon?: Instance => ?(className: string) => React.Node,
      onClickEndAdornment?: Instance => void,
      renderLeftIcon?: (className?: string) => React.Node,
      ...ValueFieldCommonProperties,
    |}
  | {|
      valueType: 'boolean',
      getValue: Instance => boolean,
      setValue: (instance: Instance, newValue: boolean) => void,
      ...ValueFieldCommonProperties,
    |}
  | {|
      valueType: 'enumIcon',
      renderIcon: (value: any) => React.Node,
      getValue: Instance => any,
      isHighlighted: (value: any) => boolean,
      setValue: (instance: Instance, newValue: any) => void,
      getNextValue: (currentValue: any) => any,
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
  renderLeftIcon?: (className?: string) => React.Node,
  ...ValueFieldCommonProperties,
|};

type Title = {|
  name: string,
  title: string,
  renderLeftIcon: (className?: string) => React.Node,
  getValue?: Instance => string,
  nonFieldType: 'title',
  defaultValue?: string,
|};

export type SectionTitle = {|
  name: string,
  title: string,
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
  getIcon?: ({| fontSize: string |}) => React.Node,
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
      removeSpacers?: boolean,
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
  removeSpacers?: boolean,

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
  separator: {
    marginRight: -marginsSize,
    marginLeft: -marginsSize,
    marginTop: marginsSize,
    borderTop: '1px solid black', // Border color is changed in the component.
  },
};

export const Separator = () => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  return (
    <div
      style={{
        ...styles.separator,
        borderColor: gdevelopTheme.listItem.separatorColor,
      }}
    />
  );
};

const getDisabled = ({
  instances,
  field,
}: {|
  instances: Instances,
  field: ValueField,
|}): boolean => (field.disabled ? field.disabled(instances) : false);

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
    console.warn(
      'getFieldValue was called with an empty list of instances (or containing undefined). This is a bug that should be fixed.'
    );
    return defaultValue;
  }

  const { getValue } = field;
  if (!getValue) return null;

  let value = getValue(instances[0]);
  if (typeof defaultValue !== 'undefined') {
    for (var i = 1; i < instances.length; ++i) {
      if (value !== getValue(instances[i])) {
        value = defaultValue;
        break;
      }
    }
  }

  return value;
};

const getFieldEndAdornmentIcon = ({
  instances,
  field,
}: {|
  instances: Instances,
  field: ValueField,
|}): ?(className: string) => React.Node => {
  if (!instances[0]) {
    console.warn(
      'getFieldEndAdornmentIcon was called with an empty list of instances (or containing undefined). This is a bug that should be fixed.'
    );
    return null;
  }
  if (!field.getEndAdornmentIcon) return null;

  for (const instance of instances) {
    const getEndAdornmentIcon = field.getEndAdornmentIcon(instance);
    if (getEndAdornmentIcon) return getEndAdornmentIcon;
  }
  return null;
};

const getFieldLabel = ({
  instances,
  field,
}: {|
  instances: Instances,
  field: ValueField,
|}): any => {
  if (!instances[0]) {
    console.warn(
      'getFieldLabel was called with an empty list of instances (or containing undefined). This is a bug that should be fixed.'
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
  removeSpacers,
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
        console.warn(
          'getFieldDescription was called with an empty list of instances (or containing undefined). This is a bug that should be fixed.'
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
        const { setValue } = field;

        return (
          <CompactToggleField
            label={getFieldLabel({ instances, field })}
            markdownDescription={getFieldDescription(field)}
            key={field.name}
            id={field.name}
            checked={getFieldValue({ instances, field })}
            onCheck={newValue => {
              instances.forEach(i => setValue(i, newValue));
              _onInstancesModified(instances);
            }}
            disabled={getDisabled({ instances, field })}
            fullWidth
          />
        );
      } else if (field.valueType === 'number') {
        const { setValue, onClickEndAdornment } = field;

        const commonProps = {
          key: field.name,
          id: field.name,
          value: getFieldValue({
            instances,
            field,
          }),
          onChange: newValue => {
            // If the value is not a number, the user is probably still typing, adding a dot or a comma.
            // So don't update the value, it will be reverted if they leave the field.
            if (isNaN(newValue)) return;
            instances.forEach(i => setValue(i, newValue));
            _onInstancesModified(instances);
          },
          disabled: getDisabled({ instances, field }),
          renderEndAdornmentOnHover:
            getFieldEndAdornmentIcon({ instances, field }) || undefined,
          onClickEndAdornment: () => {
            if (!onClickEndAdornment) return;
            instances.forEach(i => onClickEndAdornment(i));
            _onInstancesModified(instances);
          },
        };
        if (field.renderLeftIcon || field.hideLabel) {
          return (
            <CompactSemiControlledNumberField
              {...commonProps}
              useLeftIconAsNumberControl
              renderLeftIcon={field.renderLeftIcon}
              leftIconTooltip={getFieldLabel({ instances, field })}
            />
          );
        } else {
          const { key, ...otherCommonProps } = commonProps;
          return (
            <CompactPropertiesEditorRowField
              key={key}
              label={getFieldLabel({ instances, field })}
              markdownDescription={getFieldDescription(field)}
              field={
                <CompactSemiControlledNumberField
                  {...otherCommonProps}
                />
              }
            />
          );
        }
      } else if (field.valueType === 'color') {
        return null; // TODO
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
      } else if (field.valueType === 'enumIcon') {
        const value = getFieldValue({ instances, field });
        return (
          <IconButton
            key={field.name}
            id={field.name}
            size="small"
            tooltip={getFieldLabel({ instances, field })}
            selected={field.isHighlighted(value)}
            onClick={event => {
              instances.forEach(i =>
                field.setValue(i, field.getNextValue(value))
              );
              _onInstancesModified(instances);
            }}
          >
            {field.renderIcon(value)}
          </IconButton>
        );
      } else if (field.valueType === 'textarea') {
        const { setValue } = field;
        return (
          <CompactTextAreaField
            key={field.name}
            id={field.name}
            onChange={text => {
              instances.forEach(i => setValue(i, text || ''));
              _onInstancesModified(instances);
            }}
            value={getFieldValue({ instances, field })}
            label={getFieldLabel({ instances, field })}
            markdownDescription={getFieldDescription(field)}
          />
        );
      } else if (field.valueType === 'resource') {
        return null; // TODO
      } else {
        const {
          // TODO: Still support onEditButtonClick & onEditButtonBuildMenuTemplate ?
          // onEditButtonBuildMenuTemplate,
          // onEditButtonClick,
          setValue,
          onClickEndAdornment,
        } = field;
        const commonProps = {
          key: field.name,
          id: field.name,
          value: getFieldValue({
            instances,
            field,
            defaultValue: '(Multiple values)',
          }),
          onChange: newValue => {
            instances.forEach(i => setValue(i, newValue || ''));
            _onInstancesModified(instances);
          },
          disabled: getDisabled({ instances, field }),
          renderEndAdornmentOnHover:
            getFieldEndAdornmentIcon({ instances, field }) || undefined,
          onClickEndAdornment: () => {
            if (!onClickEndAdornment) return;
            instances.forEach(i => onClickEndAdornment(i));
            _onInstancesModified(instances);
          },
        };
        if (field.renderLeftIcon || field.hideLabel) {
          return (
            <CompactSemiControlledTextField
              {...commonProps}
              renderLeftIcon={field.renderLeftIcon}
              leftIconTooltip={getFieldLabel({ instances, field })}
            />
          );
        } else {
          const { key, ...otherCommonProps } = commonProps;

          return (
            <CompactPropertiesEditorRowField
              key={key}
              label={getFieldLabel({ instances, field })}
              markdownDescription={getFieldDescription(field)}
              field={<CompactSemiControlledTextField {...otherCommonProps} />}
            />
          );
        }
      }
    },
    [instances, _onInstancesModified, getFieldDescription]
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

      let compactSelectField;
      if (field.valueType === 'number') {
        const { setValue } = field;
        compactSelectField = (
          <CompactSelectField
            value={getFieldValue({ instances, field })}
            id={field.name}
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
        compactSelectField = (
          <CompactSelectField
            value={getFieldValue({
              instances,
              field,
              defaultValue: '(Multiple values)',
            })}
            id={field.name}
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

      if (!compactSelectField) return null;
      if (field.renderLeftIcon || field.hideLabel) return compactSelectField;

      return (
        <CompactPropertiesEditorRowField
          key={field.name}
          label={getFieldLabel({ instances, field })}
          markdownDescription={getFieldDescription(field)}
          field={compactSelectField}
        />
      );
    },
    [instances, _onInstancesModified, getFieldDescription]
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
        <React.Fragment key={`button-${field.label}`}>
          <FlatButton
            fullWidth
            primary
            leftIcon={
              field.getIcon ? (
                field.getIcon({ fontSize: 'small' })
              ) : (
                <Edit fontSize="small" />
              )
            }
            disabled={disabled}
            label={field.label}
            onClick={() => {
              if (!instances[0]) return;
              field.onClick(instances[0]);
            }}
          />
          <Spacer />
        </React.Fragment>
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
          defaultValue: '(Multiple values)',
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

  const renderVerticalCenterWithBar = (field: Field) =>
    field.child && field.child.getValue ? (
      <VerticallyCenterWithBar key={field.name}>
        {renderInputField(field.child)}
      </VerticallyCenterWithBar>
    ) : (
      'TODO'
    );

  const renderContainer =
    mode === 'row'
      ? (fields: React.Node) =>
          preventWrap ? (
            removeSpacers ? (
              <Line noMargin alignItems="center" expand>
                {fields}
              </Line>
            ) : (
              <LineStackLayout noMargin alignItems="center" expand>
                {fields}
              </LineStackLayout>
            )
          ) : (
            <ResponsiveLineStackLayout noMargin alignItems="center" expand>
              {fields}
            </ResponsiveLineStackLayout>
          )
      : (fields: React.Node) =>
          removeSpacers ? (
            <Column noMargin expand>
              {fields}
            </Column>
          ) : (
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
            expand
            noMargin
          >
            {renderLeftIcon()}
            <Text displayInlineAsSpan noMargin>
              {field.title}
            </Text>
            <Text displayInlineAsSpan noMargin>
              -
            </Text>
            <Text
              allowSelection
              displayInlineAsSpan
              noMargin
              style={textEllipsisStyle}
            >
              {additionalText}
            </Text>
          </LineStackLayout>
        );
      }

      return (
        <LineStackLayout
          key={`title-${field.name}`}
          expand
          noMargin
          alignItems="center"
        >
          {renderLeftIcon()}
          <Text displayInlineAsSpan size="sub-title" noMargin>
            {field.title}
          </Text>
        </LineStackLayout>
      );
    },
    [instances]
  );
  const renderSectionTitle = React.useCallback((field: SectionTitle) => {
    return [
      <Separator key={field.name + '-separator'} />,
      <Line key={`section-title-${field.name}`} noMargin>
        <Text displayInlineAsSpan size="sub-title" noMargin>
          {field.title}
        </Text>
      </Line>,
    ];
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
        const contentView =
          field.type === 'row' ? (
            <CompactPropertiesEditor
              key={field.name}
              project={project}
              resourceManagementProps={resourceManagementProps}
              schema={field.children}
              instances={instances}
              mode="row"
              unsavedChanges={unsavedChanges}
              onInstancesModified={onInstancesModified}
              preventWrap={field.preventWrap}
              removeSpacers={field.removeSpacers}
            />
          ) : (
            <div key={field.name} style={styles.container}>
              <CompactPropertiesEditor
                project={project}
                resourceManagementProps={resourceManagementProps}
                schema={field.children}
                instances={instances}
                mode="column"
                unsavedChanges={unsavedChanges}
                onInstancesModified={onInstancesModified}
                preventWrap={field.preventWrap}
                removeSpacers={field.removeSpacers}
              />
            </div>
          );

        if (field.title) {
          return [
            <Separator key={field.name + '-separator'} />,
            <Text key={field.name + '-title'} size="sub-title" noMargin>
              {field.title}
            </Text>,
            contentView,
          ];
        }
        return contentView;
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
