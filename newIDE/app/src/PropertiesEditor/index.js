// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import SemiControlledTextField from '../UI/SemiControlledTextField';
import InlineCheckbox from '../UI/InlineCheckbox';
import ResourceSelectorWithThumbnail from '../ResourcesList/ResourceSelectorWithThumbnail';
import Subheader from '../UI/Subheader';
import SelectField from '../UI/SelectField';
import SelectOption from '../UI/SelectOption';
import ColorField from '../UI/ColorField';
import { MarkdownText } from '../UI/MarkdownText';
import { rgbOrHexToRGBString } from '../Utils/ColorTransformer';
import FormHelperText from '@material-ui/core/FormHelperText';
import InputAdornment from '@material-ui/core/InputAdornment';
import { type ResourceManagementProps } from '../ResourcesList/ResourceSource';
import {
  TextFieldWithButtonLayout,
  ResponsiveLineStackLayout,
  ColumnStackLayout,
} from '../UI/Layout';
import RaisedButton from '../UI/RaisedButton';
import UnsavedChangesContext, {
  type UnsavedChanges,
} from '../MainFrame/UnsavedChangesContext';
import { Column, Line } from '../UI/Grid';
import Text from '../UI/Text';
import useForceUpdate from '../Utils/UseForceUpdate';
import RaisedButtonWithSplitMenu from '../UI/RaisedButtonWithSplitMenu';
import Tooltip from '@material-ui/core/Tooltip';
import Edit from '../UI/CustomSvgIcons/Edit';
import {
  type Schema,
  type ValueField,
  type ActionButton,
  type SectionTitle,
  type ResourceField,
  type LeaderboardIdField,
} from '../CompactPropertiesEditor';
import LeaderboardIdPropertyField from './LeaderboardIdPropertyField';
import SemiControlledAutoComplete from '../UI/SemiControlledAutoComplete';

// Re-export the types.
export type {
  Schema,
  ValueField,
  ActionButton,
  SectionTitle,
  ResourceField,
  Field,
} from '../CompactPropertiesEditor';

// An "instance" here is the objects for which properties are shown
export type Instance = Object; // This could be improved using generics.
export type Instances = Array<Instance>;

type Props = {|
  onInstancesModified?: Instances => void,
  instances: Instances,
  schema: Schema,
  mode?: 'column' | 'row',

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
  field: ValueField | ActionButton | SectionTitle,
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

const PropertiesEditor = ({
  onInstancesModified,
  instances,
  schema,
  mode,
  renderExtraDescriptionText,
  unsavedChanges,
  project,
  resourceManagementProps,
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
        const { setValue } = field;
        const description = getFieldDescription(field);

        return (
          <InlineCheckbox
            label={
              !description ? (
                getFieldLabel({ instances, field })
              ) : (
                <React.Fragment>
                  <Line noMargin>{getFieldLabel({ instances, field })}</Line>
                  <FormHelperText style={{ display: 'inline' }}>
                    <MarkdownText source={description} />
                  </FormHelperText>
                </React.Fragment>
              )
            }
            key={field.name}
            id={field.name}
            checked={getFieldValue({ instances, field })}
            onCheck={(event, newValue) => {
              instances.forEach(i => setValue(i, !!newValue));
              _onInstancesModified(instances);
            }}
            disabled={getDisabled({ instances, field })}
          />
        );
      } else if (field.valueType === 'number') {
        const { setValue, getEndAdornment } = field;
        const endAdornment = getEndAdornment && getEndAdornment(instances[0]);
        return (
          <SemiControlledTextField
            value={getFieldValue({ instances, field })}
            key={field.name}
            id={field.name}
            floatingLabelText={getFieldLabel({ instances, field })}
            floatingLabelFixed
            helperMarkdownText={getFieldDescription(field)}
            onChange={newValue => {
              const newNumberValue = parseFloat(newValue);
              // If the value is not a number, the user is probably still typing, adding a dot or a comma.
              // So don't update the value, it will be reverted if they leave the field.
              if (isNaN(newNumberValue)) return;
              instances.forEach(i => setValue(i, newNumberValue));
              _onInstancesModified(instances);
            }}
            type="number"
            style={styles.field}
            disabled={getDisabled({ instances, field })}
            endAdornment={
              endAdornment && (
                <Tooltip title={endAdornment.tooltipContent}>
                  <InputAdornment position="end">
                    {endAdornment.label}
                  </InputAdornment>
                </Tooltip>
              )
            }
          />
        );
      } else if (field.valueType === 'color') {
        const { setValue } = field;
        return (
          <Column key={field.name} expand noMargin>
            <ColorField
              id={field.name}
              floatingLabelText={getFieldLabel({ instances, field })}
              helperMarkdownText={getFieldDescription(field)}
              disableAlpha
              fullWidth
              color={getFieldValue({ instances, field })}
              onChange={color => {
                const rgbString =
                  color.length === 0 ? '' : rgbOrHexToRGBString(color);
                instances.forEach(i => setValue(i, rgbString));
                _onInstancesModified(instances);
              }}
            />
          </Column>
        );
      } else if (field.valueType === 'textarea') {
        const { setValue } = field;
        return (
          <SemiControlledTextField
            key={field.name}
            id={field.name}
            onChange={text => {
              instances.forEach(i => setValue(i, text || ''));
              _onInstancesModified(instances);
            }}
            value={getFieldValue({ instances, field })}
            floatingLabelText={getFieldLabel({ instances, field })}
            floatingLabelFixed
            helperMarkdownText={getFieldDescription(field)}
            multiline
            style={styles.field}
          />
        );
      } else {
        const {
          onEditButtonBuildMenuTemplate,
          onEditButtonClick,
          setValue,
        } = field;
        return (
          <TextFieldWithButtonLayout
            key={field.name}
            renderTextField={() => (
              <SemiControlledTextField
                value={getFieldValue({
                  instances,
                  field,
                  defaultValue: '(Multiple values)',
                })}
                id={field.name}
                floatingLabelText={getFieldLabel({ instances, field })}
                floatingLabelFixed
                helperMarkdownText={getFieldDescription(field)}
                onChange={newValue => {
                  instances.forEach(i => setValue(i, newValue || ''));
                  _onInstancesModified(instances);
                }}
                style={styles.field}
                disabled={getDisabled({ instances, field })}
              />
            )}
            renderButton={style =>
              onEditButtonClick && !onEditButtonBuildMenuTemplate ? (
                <RaisedButton
                  style={style}
                  primary
                  disabled={instances.length !== 1}
                  icon={<Edit />}
                  label={<Trans>Edit</Trans>}
                  onClick={onEditButtonClick}
                />
              ) : onEditButtonBuildMenuTemplate ? (
                <RaisedButtonWithSplitMenu
                  style={style}
                  primary
                  disabled={instances.length !== 1}
                  icon={<Edit />}
                  label={<Trans>Edit</Trans>}
                  onClick={onEditButtonClick}
                  buildMenuTemplate={onEditButtonBuildMenuTemplate}
                />
              ) : null
            }
          />
        );
      }
    },
    [instances, getFieldDescription, _onInstancesModified]
  );

  const renderSelectField = React.useCallback(
    (field: ValueField) => {
      if (!field.getChoices || !field.getValue) return;

      const choices = field.getChoices();
      if (choices.length < 2 && field.isHiddenWhenOnlyOneChoice) {
        return;
      }

      const children = choices.map(({ value, label, labelIsUserDefined }) => (
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
          <SelectField
            value={getFieldValue({ instances, field })}
            key={field.name}
            id={field.name}
            floatingLabelText={getFieldLabel({ instances, field })}
            helperMarkdownText={getFieldDescription(field)}
            onChange={(event, index, newValue: string) => {
              instances.forEach(i => setValue(i, parseFloat(newValue) || 0));
              _onInstancesModified(instances);
            }}
            style={styles.field}
            disabled={field.disabled}
          >
            {children}
          </SelectField>
        );
      } else if (field.valueType === 'string') {
        const { setValue } = field;
        return (
          <SelectField
            value={getFieldValue({
              instances,
              field,
              defaultValue: '(Multiple values)',
            })}
            key={field.name}
            id={field.name}
            floatingLabelText={getFieldLabel({ instances, field })}
            helperMarkdownText={getFieldDescription(field)}
            onChange={(event, index, newValue: string) => {
              instances.forEach(i => setValue(i, newValue || ''));
              _onInstancesModified(instances);
            }}
            style={styles.field}
            disabled={getDisabled({ instances, field })}
          >
            {children}
          </SelectField>
        );
      }
    },
    [instances, _onInstancesModified, getFieldDescription]
  );

  const renderAutocompletionField = React.useCallback(
    (field: ValueField) => {
      if (!field.getChoices || !field.getValue || field.valueType !== 'string')
        return;

      const choices = field.getChoices();
      const { setValue } = field;
      const value = getFieldValue({
        instances,
        field,
        defaultValue: '(Multiple values)',
      });

      return (
        <SemiControlledAutoComplete
          value={value}
          key={field.name}
          id={field.name}
          floatingLabelText={getFieldLabel({ instances, field })}
          helperMarkdownText={getFieldDescription(field)}
          onChange={(newValue: string) => {
            instances.forEach(i => setValue(i, newValue || ''));
            _onInstancesModified(instances);
          }}
          dataSource={choices.map(({ value }) => ({
            value: value,
            text: value,
          }))}
          fullWidth
          errorText={
            field.isAllowingAnyValue ||
            value === '(Multiple values)' ||
            choices.some(data => data.value === value) ? (
              undefined
            ) : !value ? (
              <Trans>You must select a value.</Trans>
            ) : (
              <Trans>
                You must select a valid value. "{value}" is not valid.
              </Trans>
            )
          }
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
        <RaisedButton
          key={`button-${field.label}`}
          fullWidth
          primary
          icon={<Edit />}
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

  const renderLeaderboardField = (field: LeaderboardIdField) => {
    if (!project) {
      return null;
    }

    const { setValue } = field;
    return (
      <LeaderboardIdPropertyField
        key={field.name}
        project={project}
        value={getFieldValue({
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
        fieldStyle={styles.field}
      />
    );
  };

  const renderContainer =
    mode === 'row'
      ? (fields: React.Node) => (
          <ResponsiveLineStackLayout
            noMargin
            noResponsiveLandscape={Array.isArray(fields) && fields.length <= 3}
          >
            {fields}
          </ResponsiveLineStackLayout>
        )
      : (fields: React.Node) => (
          <ColumnStackLayout noMargin>{fields}</ColumnStackLayout>
        );

  const renderSectionTitle = React.useCallback((field: SectionTitle) => {
    return (
      <Line key={`section-title-${field.name}`}>
        <Text displayInlineAsSpan>{field.name}</Text>
      </Line>
    );
  }, []);

  return renderContainer(
    schema.map(field => {
      if (!!field.nonFieldType) {
        if (field.nonFieldType === 'sectionTitle') {
          return renderSectionTitle(field);
        } else if (field.nonFieldType === 'button') {
          return renderButton(field);
        }
        return null;
      } else if (field.children) {
        if (field.type === 'row') {
          const contentView = (
            <UnsavedChangesContext.Consumer key={field.name}>
              {unsavedChanges => (
                <PropertiesEditor
                  project={project}
                  resourceManagementProps={resourceManagementProps}
                  schema={field.children}
                  instances={instances}
                  mode="row"
                  unsavedChanges={unsavedChanges}
                  onInstancesModified={onInstancesModified}
                />
              )}
            </UnsavedChangesContext.Consumer>
          );
          if (field.title) {
            return [
              <Text key={field.name + '-title'} size="block-title">
                {field.title}
              </Text>,
              contentView,
            ];
          }
          return contentView;
        }

        return (
          <div key={field.name}>
            <Subheader>{field.name}</Subheader>
            <UnsavedChangesContext.Consumer key={field.name}>
              {unsavedChanges => (
                <PropertiesEditor
                  project={project}
                  resourceManagementProps={resourceManagementProps}
                  schema={field.children}
                  instances={instances}
                  mode="column"
                  unsavedChanges={unsavedChanges}
                  onInstancesModified={onInstancesModified}
                />
              )}
            </UnsavedChangesContext.Consumer>
          </div>
        );
      } else if (field.valueType === 'resource') {
        return renderResourceField(field);
      } else if (field.valueType === 'leaderboardId') {
        return renderLeaderboardField(field);
      } else {
        if (field.getChoices && field.getValue) {
          if (field.isAutocompleted) {
            return renderAutocompletionField(field);
          } else {
            return renderSelectField(field);
          }
        }
        if (field.getValue) return renderInputField(field);
      }
      return null;
    })
  );
};

export default PropertiesEditor;
