// @flow
import { t } from '@lingui/macro';
import { Trans } from '@lingui/macro';
import { type I18n as I18nType } from '@lingui/core';
import * as React from 'react';
import { TreeTableRow, TreeTableCell } from '../UI/TreeTable';
import DragHandle from '../UI/DragHandle';
import SemiControlledTextField from '../UI/SemiControlledTextField';
import SemiControlledAutoComplete from '../UI/SemiControlledAutoComplete';
import Checkbox from '../UI/Checkbox';
import AddCircle from '@material-ui/icons/AddCircle';
import BuildIcon from '@material-ui/icons/Build';
import SubdirectoryArrowRight from '@material-ui/icons/SubdirectoryArrowRight';
import IconButton from '../UI/IconButton';
import Replay from '@material-ui/icons/Replay';
import styles from './styles';
import BooleanField from '../UI/BooleanField';
import { type VariableOrigin } from './VariablesList.flow';
import Text from '../UI/Text';
import ElementWithMenu from '../UI/Menu/ElementWithMenu';
import BackgroundText from '../UI/BackgroundText';
const gd: libGDevelop = global.gd;

//TODO: Refactor into TreeTable?
const Indent = React.memo(({ width }) => (
  <div style={{ ...styles.indent, width }}>
    <SubdirectoryArrowRight htmlColor={styles.indentIconColor} />
  </div>
));

type Props = {|
  name: string,
  variable: gdVariable,
  depth: number,
  errorText?: ?string,
  commitVariableValueOnBlur: boolean,
  onChangeType: (type: string) => void,
  onRemove: () => void,
  onAddChild: () => void,
  onChangeName: string => void,
  onChangeValue: string => void,
  onResetToDefaultValue: () => void,
  children?: React.Node,
  showHandle: boolean,
  showSelectionCheckbox: boolean,
  isSelected: boolean,
  onSelect: boolean => void,
  origin: VariableOrigin,
  arrayElement: boolean,
  undefinedVariableNames: Array<string>,
|};

const VariableRow = ({
  name,
  variable,
  depth,
  errorText,
  onChangeType,
  commitVariableValueOnBlur,
  onRemove,
  onAddChild,
  onChangeName,
  onChangeValue,
  onResetToDefaultValue,
  children,
  showHandle,
  showSelectionCheckbox,
  isSelected,
  onSelect,
  origin,
  arrayElement,
  undefinedVariableNames,
}: Props) => {
  const type = variable.getType();
  const isCollection = !gd.Variable.isPrimitive(type);

  const key = '' + depth + name;
  const limitEditing = origin === 'parent' || origin === 'inherited';

  const columns = [
    <TreeTableCell key="name" expand>
      {depth > 0 && (
        <Indent width={(depth + 1) * styles.tableChildIndentation} />
      )}
      {depth === 0 && showHandle && <DragHandle />}
      {showSelectionCheckbox && !limitEditing && (
        <Checkbox
          checked={isSelected}
          onCheck={(e, checked) => onSelect(checked)}
        />
      )}
      {arrayElement ? (
        <Text noMargin>{name}</Text>
      ) : (
        <SemiControlledAutoComplete
          margin="none"
          fullWidth
          errorText={errorText}
          disabled={origin === 'parent'}
          value={name}
          onChange={onChangeName}
          dataSource={
            undefinedVariableNames
              ? undefinedVariableNames.map(name => ({
                  text: name,
                  value: name,
                }))
              : []
          }
          openOnFocus={true}
        />
      )}
    </TreeTableCell>,
  ];
  if (isCollection) {
    columns.push(
      <TreeTableCell
        expand
        key="value"
        style={limitEditing ? styles.fadedButton : undefined}
      >
        <BackgroundText>
          {type === gd.Variable.Structure ? (
            <Trans>Structure</Trans>
          ) : (
            <Trans>Array</Trans>
          )}
        </BackgroundText>
      </TreeTableCell>
    );
  } else {
    if (type !== gd.Variable.Boolean)
      columns.push(
        <TreeTableCell key="value" expand>
          <SemiControlledTextField
            margin="none"
            type={type === gd.Variable.String ? 'text' : 'number'}
            commitOnBlur={commitVariableValueOnBlur}
            fullWidth
            name={key + 'value'}
            value={
              type === gd.Variable.String
                ? variable.getString()
                : '' + variable.getValue()
            }
            onChange={newValue => {
              if (
                type === gd.Variable.String
                  ? variable.getString() !== newValue
                  : variable.getValue() !== newValue
              ) {
                // Note that onChangeValue pass all the values as strings.
                // It's the parent responsibility to cast them back according to the variable type.
                onChangeValue(newValue);
              }
            }}
            disabled={origin === 'parent' && depth !== 0}
            multiline={type === gd.Variable.String}
            inputStyle={
              type === gd.Variable.String
                ? styles.noPaddingMultilineTextField
                : undefined
            }
          />
        </TreeTableCell>
      );
    else
      columns.push(
        <TreeTableCell key="value" expand>
          <BooleanField
            value={variable.getBool()}
            onChange={newValue => {
              // Note that onChangeValue pass all the values as strings.
              // It's the parent responsibility to cast them back according to the variable type.
              onChangeValue('' + newValue);
            }}
            disabled={origin === 'parent' && depth !== 0}
          />
        </TreeTableCell>
      );
  }
  columns.push(
    <TreeTableCell key="tools" style={styles.toolColumn}>
      {origin === 'inherited' && depth === 0 ? (
        <IconButton
          size="small"
          onClick={onResetToDefaultValue}
          style={isCollection ? undefined : styles.fadedButton}
          tooltip={t`Reset`}
        >
          <Replay />
        </IconButton>
      ) : (
        origin !== 'parent' && (
          <>
            {isCollection ? (
              <IconButton
                size="small"
                tooltip={t`Add child variable`}
                onClick={() => onAddChild()}
              >
                <AddCircle />
              </IconButton>
            ) : (
              <IconButton
                size="small"
                style={styles.fadedButton}
                tooltip={t`Convert the variable to a collection before adding children`}
              >
                <AddCircle />
              </IconButton>
            )}
            <ElementWithMenu
              element={
                <IconButton size="small" tooltip={t`Change variable type`}>
                  <BuildIcon />
                </IconButton>
              }
              buildMenuTemplate={(i18n: I18nType) => [
                {
                  label: 'Primitive types',
                  submenu: [
                    {
                      visible: type !== gd.Variable.String,
                      label: i18n._(t`Convert to string`),
                      click: () => onChangeType('string'),
                    },
                    {
                      visible: type !== gd.Variable.Number,
                      label: i18n._(t`Convert to number`),
                      click: () => onChangeType('number'),
                    },
                    {
                      visible: type !== gd.Variable.Boolean,
                      label: i18n._(t`Convert to boolean`),
                      click: () => onChangeType('boolean'),
                    },
                  ],
                },

                {
                  label: 'Collection types',
                  submenu: [
                    {
                      visible: type !== gd.Variable.Structure,
                      label: i18n._(t`Convert to structure`),
                      click: () => onChangeType('structure'),
                    },
                    {
                      visible: type !== gd.Variable.Array,
                      label: i18n._(t`Convert to array`),
                      click: () => onChangeType('array'),
                    },
                  ],
                },
              ]}
            />
          </>
        )
      )}
    </TreeTableCell>
  );

  return (
    <>
      <TreeTableRow>{columns}</TreeTableRow>
      {children}
    </>
  );
};

export default VariableRow;
