// @flow
import * as React from 'react';
import { TreeTableRow, TreeTableCell } from '../UI/TreeTable';
import DragHandle from '../UI/DragHandle';
import SemiControlledTextField from '../UI/SemiControlledTextField';
import Checkbox from 'material-ui/Checkbox';
import AddCircle from 'material-ui/svg-icons/content/add-circle';
import SubdirectoryArrowRight from 'material-ui/svg-icons/navigation/subdirectory-arrow-right';
import TextField from 'material-ui/TextField';
import IconButton from 'material-ui/IconButton';
import Reset from 'material-ui/svg-icons/av/replay';
import muiThemeable from 'material-ui/styles/muiThemeable';
import styles from './styles';

//TODO: Refactor into TreeTable?
const Indent = ({ width }) => (
  <div style={{ ...styles.indent, width }}>
    <SubdirectoryArrowRight color={styles.indentIconColor} />
  </div>
);

const InlineCheckbox = props => <Checkbox {...props} style={{ width: 32 }} />;

type Props = {|
  name: string,
  variable: gdVariable,
  depth: number,
  errorText?: ?string,
  onBlur: () => void,
  onRemove: () => void,
  onAddChild: () => void,
  onChangeValue: string => void,
  onResetToDefaultValue: () => void,
  children?: React.Node,
  muiTheme: Object,
  showHandle: boolean,
  showSelectionCheckbox: boolean,
  isSelected: boolean,
  onSelect: boolean => void,
  origin: 'parent' | 'inherited' | '',
|};

const ThemableVariableRow = ({
  name,
  variable,
  depth,
  errorText,
  onBlur,
  onRemove,
  onAddChild,
  onChangeValue,
  onResetToDefaultValue,
  children,
  muiTheme,
  showHandle,
  showSelectionCheckbox,
  isSelected,
  onSelect,
  origin,
}: Props) => {
  const isStructure = variable.isStructure();
  const key = '' + depth + name;

  const limitEditing = origin === 'parent' || origin === 'inherited';

  const columns = [
    <TreeTableCell key="name">
      {depth > 0 && (
        <Indent width={(depth + 1) * styles.tableChildIndentation} />
      )}
      {depth === 0 && showHandle && <DragHandle />}
      {showSelectionCheckbox && !limitEditing && (
        <InlineCheckbox
          checked={isSelected}
          onCheck={(e, checked) => onSelect(checked)}
        />
      )}
      <TextField
        style={{
          fontStyle: origin !== 'inherited' ? 'normal' : 'italic',
        }}
        fullWidth
        name={key + 'name'}
        defaultValue={name}
        errorText={errorText}
        onBlur={onBlur}
        disabled={origin === 'parent'}
      />
    </TreeTableCell>,
  ];
  if (!isStructure) {
    columns.push(
      <TreeTableCell key="value">
        <SemiControlledTextField
          commitOnBlur
          fullWidth
          name={key + 'value'}
          value={variable.getString()}
          onChange={text => {
            if (variable.getString() !== text) {
              onChangeValue(text);
            }
          }}
          multiLine
          disabled={depth !== 0 && limitEditing} //GD doesn't support deep merging
        />
      </TreeTableCell>
    );
  } else {
    columns.push(<TreeTableCell key="value">(Structure)</TreeTableCell>);
  }
  columns.push(
    <TreeTableCell key="tools" style={styles.toolColumn}>
      {origin === 'inherited' && !isStructure && (
        <IconButton
          onClick={onResetToDefaultValue}
          style={isStructure ? undefined : styles.fadedButton}
          tooltip={'Reset to default object variable'}
        >
          <Reset />
        </IconButton>
      )}
      <IconButton
        onClick={onAddChild}
        style={isStructure ? undefined : styles.fadedButton}
        disabled={limitEditing}
        tooltip={'Add child variable'}
      >
        <AddCircle />
      </IconButton>
    </TreeTableCell>
  );

  return (
    <div>
      <TreeTableRow
        style={{ backgroundColor: muiTheme.list.itemsBackgroundColor }}
      >
        {columns}
      </TreeTableRow>
      {children}
    </div>
  );
};

const VariableRow = muiThemeable()(ThemableVariableRow);
export default VariableRow;
