// @flow
import * as React from 'react';
import CompactSemiControlledNumberField from '../../UI/CompactSemiControlledNumberField';
import CompactSemiControlledTextField from '../../UI/CompactSemiControlledTextField';
import InlineCheckbox from '../../UI/InlineCheckbox';
import classes from './InspectorTreeView.module.css';

type Props = {|
  value: number | string | boolean,
  onEdit: (newValue: number | string | boolean) => void,
|};

// The field lives in a row of a tree: its clicks and keys are its own, and
// must not select, fold or move in the tree.
const stopPropagation = (event: SyntheticEvent<>) => event.stopPropagation();

/**
 * A value of the running game, edited in place: the new value is sent to the
 * game when the field is left (or checked, for a boolean), with the type the
 * value already has.
 */
const InspectedValueField = ({ value, onEdit }: Props): React.Node => (
  <span
    className={classes.rowField}
    onClick={stopPropagation}
    onDoubleClick={stopPropagation}
    onKeyDown={stopPropagation}
  >
    {typeof value === 'boolean' ? (
      <InlineCheckbox
        paddingSize="small"
        checked={value}
        onCheck={(event, checked) => onEdit(checked)}
      />
    ) : typeof value === 'number' ? (
      <CompactSemiControlledNumberField
        value={value}
        onChange={onEdit}
        commitOnBlur
      />
    ) : (
      <CompactSemiControlledTextField
        value={value}
        onChange={onEdit}
        commitOnBlur
      />
    )}
  </span>
);

export default InspectedValueField;
