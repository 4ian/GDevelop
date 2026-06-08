// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import Dialog, { DialogPrimaryButton } from '../UI/Dialog';
import FlatButton from '../UI/FlatButton';
import ChoicesEditor, { type Choice } from '../ChoicesEditor';

type Props = {|
  initialValue: string,
  initialValues: Array<string>,
  onClose: (?{| value: string, values: Array<string> |}) => void,
|};

const getInitialChoices = (
  initialValue: string,
  initialValues: Array<string>
): Array<Choice> => {
  const values =
    initialValues.length > 0 ? initialValues : [initialValue || 'New Option'];
  return values.map(value => ({ value, label: '' }));
};

const getUniqueNonEmptyChoiceValues = (choices: Array<Choice>) => {
  const values = [];
  choices.forEach(choice => {
    const value = choice.value.trim();
    if (!value || values.includes(value)) return;
    values.push(value);
  });
  return values;
};

export const EnumVariableEditorDialog = ({
  initialValue,
  initialValues,
  onClose,
}: Props): React.Node => {
  const [choices, setChoices] = React.useState<Array<Choice>>(() =>
    getInitialChoices(initialValue, initialValues)
  );

  const apply = React.useCallback(
    () => {
      const values = getUniqueNonEmptyChoiceValues(choices);
      onClose({
        values,
        value:
          values.length === 0 || values.includes(initialValue)
            ? initialValue
            : values[0],
      });
    },
    [choices, initialValue, onClose]
  );

  return (
    <Dialog
      open
      title={<Trans>Enum values</Trans>}
      flexColumnBody
      fullscreen="never-even-on-mobile"
      actions={[
        <FlatButton
          key="cancel"
          label={<Trans>Cancel</Trans>}
          onClick={() => onClose(null)}
        />,
        <DialogPrimaryButton
          key="ok"
          label={<Trans>Apply</Trans>}
          primary
          onClick={apply}
        />,
      ]}
      maxWidth="md"
      onRequestClose={() => onClose(null)}
      onApply={apply}
    >
      <ChoicesEditor
        choices={choices}
        setChoices={choices =>
          setChoices(choices.map(choice => ({ ...choice })))
        }
        hideLabels
        isNumber={false}
      />
    </Dialog>
  );
};
