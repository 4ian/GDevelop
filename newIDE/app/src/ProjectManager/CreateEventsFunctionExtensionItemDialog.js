// @flow
import * as React from 'react';
import { Trans, t } from '@lingui/macro';

import Dialog from '../UI/Dialog';
import FlatButton from '../UI/FlatButton';
import RaisedButton from '../UI/RaisedButton';
import TextField from '../UI/TextField';
import SelectField from '../UI/SelectField';
import SelectOption from '../UI/SelectOption';
import { ColumnStackLayout } from '../UI/Layout';
import { isExtensionNameTaken } from './EventFunctionExtensionNameVerifier';

const gd: libGDevelop = global.gd;

export type ExtensionItemKind = 'prefab' | 'behavior' | 'function';
export type PrefabObjectDimension = '2d' | '3d';

export type CreateExtensionItemPayload = {|
  itemKind: ExtensionItemKind,
  itemName: string,
  extensionName: string,
  newExtensionName: string,
  prefabObjectDimension: PrefabObjectDimension,
  functionType: EventsFunction_FunctionType,
|};

type Props = {|
  project: gdProject,
  itemKind: ExtensionItemKind,
  initialFunctionName?: ?string,
  initialFunctionType?: EventsFunction_FunctionType,
  isFunctionTypeDisabled?: boolean,
  onCancel: () => void,
  onCreate: CreateExtensionItemPayload => void,
|};

const createInNewExtensionValue = '__create-new-extension__';

const styles = {
  form: {
    padding: '0 24px 8px 24px',
  },
};

const getDefaultItemName = (itemKind: ExtensionItemKind): string => {
  if (itemKind === 'prefab') return 'MyObject';
  if (itemKind === 'behavior') return 'MyBehavior';
  return 'Function';
};

const getFunctionTypeValue = (
  functionType?: EventsFunction_FunctionType
): string => {
  if (functionType === gd.EventsFunction.Condition) return 'condition';
  if (functionType === gd.EventsFunction.Expression) return 'expression';

  return 'action';
};

const getFunctionTypeFromValue = (
  functionType: string
): EventsFunction_FunctionType => {
  return functionType === 'condition'
    ? gd.EventsFunction.Condition
    : functionType === 'expression'
    ? gd.EventsFunction.Expression
    : gd.EventsFunction.Action;
};

const getDialogTitle = (itemKind: ExtensionItemKind): React.Node => {
  if (itemKind === 'prefab') return <Trans>Create prefab</Trans>;
  if (itemKind === 'behavior') return <Trans>Create behavior</Trans>;
  return <Trans>Create function</Trans>;
};

const getItemNameLabel = (itemKind: ExtensionItemKind): React.Node => {
  if (itemKind === 'prefab') return <Trans>Prefab name</Trans>;
  if (itemKind === 'behavior') return <Trans>Behavior name</Trans>;
  return <Trans>Function name</Trans>;
};

const isValidInternalName = (name: string): boolean =>
  /^[A-Za-z_][A-Za-z0-9_]*$/.test(name);

const getProjectExtensions = (
  project: gdProject
): Array<gdEventsFunctionsExtension> => {
  const extensions = [];
  for (
    let index = 0;
    index < project.getEventsFunctionsExtensionsCount();
    index++
  ) {
    extensions.push(project.getEventsFunctionsExtensionAt(index));
  }
  return extensions;
};

const getExtensionItemExists = (
  extension: gdEventsFunctionsExtension,
  itemKind: ExtensionItemKind,
  itemName: string
): boolean => {
  if (itemKind === 'prefab') {
    return extension.getEventsBasedObjects().has(itemName);
  }

  if (itemKind === 'behavior') {
    return extension.getEventsBasedBehaviors().has(itemName);
  }

  return extension.getEventsFunctions().hasEventsFunctionNamed(itemName);
};

const CreateEventsFunctionExtensionItemDialog = ({
  project,
  itemKind,
  initialFunctionName,
  initialFunctionType,
  isFunctionTypeDisabled,
  onCancel,
  onCreate,
}: Props): React.Node => {
  const projectExtensions = getProjectExtensions(project);
  const [itemName, setItemName] = React.useState(
    itemKind === 'function' && initialFunctionName
      ? initialFunctionName
      : getDefaultItemName(itemKind)
  );
  const [extensionName, setExtensionName] = React.useState(
    projectExtensions.length > 0
      ? projectExtensions[0].getName()
      : createInNewExtensionValue
  );
  const [newExtensionName, setNewExtensionName] = React.useState('');
  const [functionType, setFunctionType] = React.useState<string>(
    getFunctionTypeValue(initialFunctionType)
  );
  const [
    prefabObjectDimension,
    setPrefabObjectDimension,
  ] = React.useState<PrefabObjectDimension>('2d');

  const trimmedItemName = itemName.trim();
  const trimmedNewExtensionName = newExtensionName.trim();
  const shouldCreateNewExtension = extensionName === createInNewExtensionValue;
  const selectedExtension = projectExtensions.find(
    extension => extension.getName() === extensionName
  );
  const isFunctionNameDisabled =
    itemKind === 'function' &&
    !!initialFunctionName &&
    gd.MetadataDeclarationHelper.isExtensionLifecycleEventsFunction(
      initialFunctionName
    );

  let itemNameError = null;
  if (!trimmedItemName) {
    itemNameError = <Trans>Enter a name.</Trans>;
  } else if (!isValidInternalName(trimmedItemName)) {
    itemNameError = (
      <Trans>
        Use letters, numbers and underscores. The first character must not be a
        number.
      </Trans>
    );
  } else if (
    selectedExtension &&
    !shouldCreateNewExtension &&
    getExtensionItemExists(selectedExtension, itemKind, trimmedItemName)
  ) {
    itemNameError = <Trans>This name is already used in the extension.</Trans>;
  }

  let extensionNameError = null;
  if (shouldCreateNewExtension) {
    if (!trimmedNewExtensionName) {
      extensionNameError = <Trans>Enter a new extension name.</Trans>;
    } else if (!isValidInternalName(trimmedNewExtensionName)) {
      extensionNameError = (
        <Trans>
          Use letters, numbers and underscores. The first character must not be
          a number.
        </Trans>
      );
    } else if (isExtensionNameTaken(trimmedNewExtensionName, project)) {
      extensionNameError = <Trans>This extension already exists.</Trans>;
    }
  } else if (!selectedExtension) {
    extensionNameError = <Trans>Choose an extension.</Trans>;
  }

  const canCreate = !itemNameError && !extensionNameError;

  const create = () => {
    if (!canCreate) return;

    onCreate({
      itemKind,
      itemName: trimmedItemName,
      extensionName: shouldCreateNewExtension ? '' : extensionName,
      newExtensionName: shouldCreateNewExtension ? trimmedNewExtensionName : '',
      prefabObjectDimension,
      functionType: getFunctionTypeFromValue(functionType),
    });
  };

  return (
    <Dialog
      open
      title={getDialogTitle(itemKind)}
      onRequestClose={onCancel}
      onApply={create}
      maxWidth="sm"
      actions={[
        <FlatButton
          key="cancel"
          label={<Trans>Cancel</Trans>}
          onClick={onCancel}
        />,
        <RaisedButton
          key="create"
          primary
          label={<Trans>Create</Trans>}
          disabled={!canCreate}
          onClick={create}
        />,
      ]}
    >
      <div style={styles.form}>
        <ColumnStackLayout noMargin>
          <TextField
            value={itemName}
            onChange={(event, value) => setItemName(value)}
            floatingLabelText={getItemNameLabel(itemKind)}
            errorText={itemNameError}
            fullWidth
            disabled={isFunctionNameDisabled}
            autoFocus={isFunctionNameDisabled ? undefined : 'desktop'}
          />
          <SelectField
            value={extensionName}
            onChange={(event, index, value) => {
              setExtensionName(value);
              if (value !== createInNewExtensionValue) {
                setNewExtensionName('');
              }
            }}
            floatingLabelText={<Trans>Extension</Trans>}
            fullWidth
            disabled={projectExtensions.length === 0}
          >
            {projectExtensions.map(extension => (
              <SelectOption
                key={extension.getName()}
                value={extension.getName()}
                label={extension.getFullName() || extension.getName()}
                shouldNotTranslate
              />
            ))}
            <SelectOption
              value={createInNewExtensionValue}
              label={t`Create a new extension`}
            />
          </SelectField>
          {shouldCreateNewExtension && (
            <TextField
              value={newExtensionName}
              onChange={(event, value) => setNewExtensionName(value)}
              floatingLabelText={<Trans>New extension name</Trans>}
              errorText={extensionNameError}
              fullWidth
            />
          )}
          {itemKind === 'function' && (
            <SelectField
              value={functionType}
              onChange={(event, index, value) => setFunctionType(value)}
              floatingLabelText={<Trans>Function type</Trans>}
              fullWidth
              disabled={isFunctionTypeDisabled}
            >
              <SelectOption value="action" label={t`Action`} />
              <SelectOption value="condition" label={t`Condition`} />
              <SelectOption value="expression" label={t`Expression`} />
            </SelectField>
          )}
          {itemKind === 'prefab' && (
            <SelectField
              value={prefabObjectDimension}
              onChange={(event, index, value) => {
                setPrefabObjectDimension(value === '3d' ? '3d' : '2d');
              }}
              floatingLabelText={<Trans>Object type</Trans>}
              fullWidth
            >
              <SelectOption value="2d" label={t`2D object`} />
              <SelectOption value="3d" label={t`3D object`} />
            </SelectField>
          )}
        </ColumnStackLayout>
      </div>
    </Dialog>
  );
};

export default CreateEventsFunctionExtensionItemDialog;
