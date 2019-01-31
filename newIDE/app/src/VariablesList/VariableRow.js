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
  type: String,
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
  type,
}: Props) => {
  const isStructure = variable.isStructure();
  const key = '' + depth + name;

  const limitEditing = type === 'object' || type === 'inherited';

  const columns = [
    <TreeTableCell key="name">
      {depth > 0 && (
        <Indent width={(depth + 1) * styles.tableChildIndentation} />
      )}
      {depth === 0 && showHandle && <DragHandle />}
      {showSelectionCheckbox && (
        <InlineCheckbox
          checked={isSelected}
          onCheck={(e, checked) => onSelect(checked)}
          disabled={limitEditing}
        />
      )}
      <TextField
        style={{
          fontStyle: limitEditing ? 'normal' : 'italic',
          fontWeight: limitEditing ? 'bold' : 'normal',
        }}
        fullWidth
        name={key + 'name'}
        defaultValue={name}
        errorText={errorText}
        onBlur={onBlur}
        disabled={limitEditing}
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
          disabled={depth !== 0 && limitEditing} //disable temporary until it works
        />
      </TreeTableCell>
    );
  } else {
    columns.push(<TreeTableCell key="value">(Structure)</TreeTableCell>);
  }
  columns.push(
    <TreeTableCell key="tools" style={styles.toolColumn}>
      {type === 'inherited' && !isStructure && (
        <IconButton
          onClick={onResetToDefaultValue}
          style={isStructure ? undefined : styles.fadedButton}
          disabled={depth !== 0} //disable temporary until we can fix it
        >
          <Reset />
        </IconButton>
      )}
      <IconButton
        onClick={onAddChild}
        style={isStructure ? undefined : styles.fadedButton}
        disabled={limitEditing}
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
