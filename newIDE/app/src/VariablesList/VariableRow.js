import React from 'react';
import { TableRow, TableRowColumn } from 'material-ui/Table';
import Delete from 'material-ui/svg-icons/action/delete';
import AddCircle from 'material-ui/svg-icons/content/add-circle';
import TextField from 'material-ui/TextField';
import IconButton from 'material-ui/IconButton';
import styles from './styles';

const VariableRow = (
  {
    name,
    variable,
    depth,
    index,
    parentVariable,
    errorText,
    onBlur,
    onRemove,
    onAddChild,
    onChangeValue,
  }
) => {
  const isStructure = variable.isStructure();
  const key = '' + depth + name;

  const columns = [
    <TableRowColumn
      key="name"
      style={{ paddingLeft: (depth + 1) * styles.tableChildIndentation }}
    >
      <TextField
        name={key + 'name'}
        defaultValue={name}
        errorText={errorText}
        onBlur={onBlur}
      />
    </TableRowColumn>,
  ];
  if (!isStructure) {
    columns.push(
      <TableRowColumn key="value">
        <TextField
          name={key + 'value'}
          value={variable.getString()}
          onChange={onChangeValue}
          multiLine
        />
      </TableRowColumn>
    );
  } else {
    columns.push(<TableRowColumn key="value">(Structure)</TableRowColumn>);
  }
  columns.push(
    <TableRowColumn key="tools" style={styles.toolColumn}>
      <IconButton onTouchTap={onRemove}>
        <Delete />
      </IconButton>
      <IconButton onTouchTap={onAddChild}>
        <AddCircle />
      </IconButton>
    </TableRowColumn>
  );

  return (
    <TableRow>
      {columns}
    </TableRow>
  );
};

export default VariableRow;
