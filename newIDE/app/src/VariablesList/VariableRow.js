// @flow
import { t } from '@lingui/macro';
import * as React from 'react';
import { TreeTableRow, TreeTableCell } from '../UI/TreeTable';
import DragHandle from '../UI/DragHandle';
import SemiControlledTextField from '../UI/SemiControlledTextField';
import Checkbox from '../UI/Checkbox';
import AddCircle from '@material-ui/icons/AddCircle';
import SubdirectoryArrowRight from '@material-ui/icons/SubdirectoryArrowRight';
import TextField from '../UI/TextField';
import IconButton from '../UI/IconButton';
import Replay from '@material-ui/icons/Replay';
import styles from './styles';
import { type VariableOrigin } from './VariablesList.flow';
import Text from '../UI/Text';

//TODO: Refactor into TreeTable?
const Indent = ({ width }) => (
  <div style={{ ...styles.indent, width }}>
    <SubdirectoryArrowRight htmlColor={styles.indentIconColor} />
  </div>
);

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
  showHandle: boolean,
  showSelectionCheckbox: boolean,
  isSelected: boolean,
  onSelect: boolean => void,
  origin: VariableOrigin,
|};

const VariableRow = ({
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
      <TextField
        margin="none"
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
      <TreeTableCell key="value" expand>
        <SemiControlledTextField
          margin="none"
          commitOnBlur
          fullWidth
          name={key + 'value'}
          value={variable.getString()}
          onChange={text => {
            if (variable.getString() !== text) {
              onChangeValue(text);
            }
          }}
          multiline
          disabled={origin === 'parent' && depth !== 0}
        />
      </TreeTableCell>
    );
  } else {
    columns.push(
      <TreeTableCell
        expand
        key="value"
        style={limitEditing ? styles.fadedButton : undefined}
      >
        <Text>(Structure)</Text>
      </TreeTableCell>
    );
  }
  columns.push(
    <TreeTableCell key="tools" style={styles.toolColumn}>
      {origin === 'inherited' && depth === 0 && (
        <IconButton
          onClick={onResetToDefaultValue}
          style={isStructure ? undefined : styles.fadedButton}
          tooltip={t`Reset`}
        >
          <Replay />
        </IconButton>
      )}
      {!(origin === 'inherited' && depth === 0) && origin !== 'parent' && (
        <IconButton
          onClick={onAddChild}
          style={isStructure ? undefined : styles.fadedButton}
          tooltip={t`Add child variable`}
        >
          <AddCircle />
        </IconButton>
      )}
    </TreeTableCell>
  );

  return (
    <div>
      <TreeTableRow>{columns}</TreeTableRow>
      {children}
    </div>
  );
};

export default VariableRow;
