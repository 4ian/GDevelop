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

// const isAnObjectVariable = props => <Checkbox {...props} style={{ width: 32 }} />;
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
  onResetToDefaultValue: ()=>void,
  children?: React.Node,
  muiTheme: Object,
  showHandle: boolean,
  showSelectionCheckbox: boolean,
  isSelected: boolean,
  onSelect: boolean => void,
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
  variableMetadata = { default: '', isInherited: false },
}: Props) => {
  const isStructure = variable.isStructure();
  const key = '' + depth + name;

  const { isInherited } = variableMetadata;
  const valueIsSameAsInherited = variableMetadata.defaultValue === variable.getString()
  
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
        />
      )}
      <TextField
        style={{
          fontStyle: isInherited ? 'normal' : 'italic',
          fontWeight: isInherited ? 'bold' : 'normal',
        }}
        fullWidth
        name={key + 'name'}
        defaultValue={name}
        errorText={errorText}
        onBlur={onBlur}
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
          placeholder={variableMetadata.default}
          value={variable.getString()}
          onChange={onChangeValue}
          multiLine
        />
      </TreeTableCell>
    );
  } else {
    columns.push(<TreeTableCell key="value">(Structure)</TreeTableCell>);
  }
  columns.push(
    <TreeTableCell key="tools" style={styles.toolColumn}>
        {variableMetadata.isInherited && !valueIsSameAsInherited &&(
            <IconButton
            onClick={onResetToDefaultValue}
            style={isStructure ? undefined : styles.fadedButton}
          >
            <Reset />
          </IconButton>      
        )}
      <IconButton
        onClick={onAddChild}
        style={isStructure ? undefined : styles.fadedButton}
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
