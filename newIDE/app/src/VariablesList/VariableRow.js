import React from 'react';
import { TreeTableRow, TreeTableCell } from '../UI/TreeTable';
import DragHandle from '../UI/DragHandle';
import Delete from 'material-ui/svg-icons/action/delete';
import AddCircle from 'material-ui/svg-icons/content/add-circle';
import SubdirectoryArrowRight from 'material-ui/svg-icons/navigation/subdirectory-arrow-right';
import TextField from 'material-ui/TextField';
import IconButton from 'material-ui/IconButton';
import muiThemeable from 'material-ui/styles/muiThemeable';
import styles from './styles';

const Indent = ({ width }) => (
  <div style={{ ...styles.indent, width }}>
    <SubdirectoryArrowRight color={styles.indentIconColor} />
  </div>
);

const ThemableVariableRow = ({
  name,
  variable,
  depth,
  errorText,
  onBlur,
  onRemove,
  onAddChild,
  onChangeValue,
  children,
  muiTheme,
}) => {
  const isStructure = variable.isStructure();
  const key = '' + depth + name;

  const columns = [
    <TreeTableCell key="name">
      {depth > 0 && (
        <Indent width={(depth + 1) * styles.tableChildIndentation} />
      )}
      {depth === 0 && <DragHandle />}
      <TextField
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
        <TextField
          fullWidth
          name={key + 'value'}
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
      <IconButton onClick={onRemove}>
        <Delete />
      </IconButton>
      <IconButton onClick={onAddChild}>
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
