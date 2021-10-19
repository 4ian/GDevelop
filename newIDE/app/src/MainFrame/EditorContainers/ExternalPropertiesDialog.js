// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import FlatButton from '../../UI/FlatButton';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import Dialog from '../../UI/Dialog';
import { mapFor } from '../../Utils/MapFor';
import Text from '../../UI/Text';
import BackgroundText from '../../UI/BackgroundText';
import { Line } from '../../UI/Grid';

type Props = {|
  open: boolean,
  onChoose: string => void,
  onClose: () => void,
  project: gdProject,
  title?: React.Node,
  helpText?: React.Node,
|};

/**
 * Update the title bar according to the project and the current theme.
 */
export default function ExternalPropertiesDialog({
  open,
  onChoose,
  onClose,
  project,
  title,
  helpText,
}: Props) {
  const [selectedLayoutName, setSelectedLayoutName] = React.useState<string>(
    ''
  );

  const actions = [
    <FlatButton
      key="cancel"
      label={<Trans>Cancel</Trans>}
      primary={false}
      onClick={onClose}
    />,
    <FlatButton
      key="choose"
      label={<Trans>Choose</Trans>}
      primary
      keyboardFocused
      onClick={() => onChoose(selectedLayoutName)}
      disabled={!selectedLayoutName}
    />,
  ];

  const layoutNames = mapFor(0, project.getLayoutsCount(), i => {
    return project.getLayoutAt(i).getName();
  });

  return (
    <Dialog
      actions={actions}
      open={open}
      title={title}
      onRequestClose={onClose}
      cannotBeDismissed={false}
      maxWidth="sm"
    >
      {helpText && (
        <Line>
          <BackgroundText>{helpText}</BackgroundText>
        </Line>
      )}
      <Text>
        <Trans>Choose the associated scene</Trans>
      </Text>
      <RadioGroup
        aria-label="Associated scene"
        name="associated-layout"
        value={selectedLayoutName}
        onChange={event => setSelectedLayoutName(event.target.value)}
      >
        {layoutNames.map(name => (
          <FormControlLabel
            key={name}
            value={name}
            control={<Radio color="primary" />}
            label={name}
          />
        ))}
      </RadioGroup>
    </Dialog>
  );
}
