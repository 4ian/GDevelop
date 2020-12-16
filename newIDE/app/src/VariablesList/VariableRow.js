// @flow
import { t } from '@lingui/macro';
import * as React from 'react';
import { TreeTableRow, TreeTableCell } from '../UI/TreeTable';
import DragHandle from '../UI/DragHandle';
import SemiControlledTextField from '../UI/SemiControlledTextField';
import Checkbox from '../UI/Checkbox';
import AddCircle from '@material-ui/icons/AddCircle';
import SubdirectoryArrowRight from '@material-ui/icons/SubdirectoryArrowRight';
import FormatListNumberedIcon from '@material-ui/icons/FormatListNumbered';
import AccountTreeIcon from '@material-ui/icons/AccountTree';
import TextField from '../UI/TextField';
import IconButton from '../UI/IconButton';
import Replay from '@material-ui/icons/Replay';
import styles from './styles';
import { type VariableOrigin } from './VariablesList.flow';
import Text from '../UI/Text';
import { toArray } from 'lodash';
import Popover from '@material-ui/core/Popover';
const gd: libGDevelop = global.gd;

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
  commitVariableValueOnBlur: boolean,
  onBlur: () => void,
  onRemove: () => void,
  onAddChild: (forceType: ?string) => void,
  onChangeValue: string => void,
  onResetToDefaultValue: () => void,
  children?: React.Node,
  showHandle: boolean,
  showSelectionCheckbox: boolean,
  isSelected: boolean,
  onSelect: boolean => void,
  origin: VariableOrigin,
  arrayElement: boolean,
|};

const VariableRow = ({
  name,
  variable,
  depth,
  errorText,
  onBlur,
  commitVariableValueOnBlur,
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
  arrayElement,
}: Props) => {
  const type = variable.getType();
  const isStructural =
    type === gd.Variable.Structure || type === gd.Variable.Array;

  const key = '' + depth + name;
  const limitEditing = origin === 'parent' || origin === 'inherited';

  const [popoverElement, openPopover] = React.useState<?HTMLButtonElement>(
    null
  );

  const addChild = (
    e: ?{
      currentTarget: HTMLButtonElement,
      shiftKey: boolean,
    }
  ) => {
    if (!isStructural || e.shiftKey) openPopover(e.currentTarget);
    else onAddChild();
  };

  const close = () => {
    if (!!popoverElement) {
      openPopover(null);
    }
  };

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
      )}
    </TreeTableCell>,
  ];
  if (isStructural) {
    columns.push(
      <TreeTableCell
        expand
        key="value"
        style={limitEditing ? styles.fadedButton : undefined}
      >
        <Text noMargin>
          ({type === gd.Variable.Structure ? 'Structure' : 'Array'})
        </Text>
      </TreeTableCell>
    );
  } else {
    columns.push(
      <TreeTableCell key="value" expand>
        <SemiControlledTextField
          margin="none"
          commitOnBlur={commitVariableValueOnBlur}
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
  }
  columns.push(
    <TreeTableCell key="tools" style={styles.toolColumn}>
      {origin === 'inherited' && depth === 0 ? (
        <IconButton
          size="small"
          onClick={onResetToDefaultValue}
          style={isStructural ? undefined : styles.fadedButton}
          tooltip={t`Reset`}
        >
          <Replay />
        </IconButton>
      ) : (
        origin !== 'parent' && (
          <>
            <IconButton
              size="small"
              onClick={addChild}
              style={isStructural ? undefined : styles.fadedButton}
              tooltip={t`Add child variable`}
            >
              <AddCircle />
            </IconButton>
            {!!popoverElement && (
              <Popover
                anchorOrigin={{
                  vertical: 'center',
                  horizontal: 'left',
                }}
                transformOrigin={{
                  vertical: 'center',
                  horizontal: 'right',
                }}
                open
                onClose={close}
                anchorEl={popoverElement}
              >
                <IconButton
                  size="small"
                  onClick={() => {
                    onAddChild('structure');
                    close();
                  }}
                  tooltip={t`Convert variable into structure`}
                >
                  <AccountTreeIcon />
                </IconButton>
                <br />
                <IconButton
                  size="small"
                  onClick={() => {
                    onAddChild('array');
                    close();
                  }}
                  tooltip={t`Convert variable into array`}
                >
                  <FormatListNumberedIcon />
                </IconButton>
              </Popover>
            )}
          </>
        )
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
