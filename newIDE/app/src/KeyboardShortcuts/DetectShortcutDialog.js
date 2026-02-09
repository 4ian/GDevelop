// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import Dialog from '../UI/Dialog';
import FlatButton from '../UI/FlatButton';
import { getShortcutMetadataFromEvent, getShortcutDisplayName } from './index';
import Text from '../UI/Text';
import Paper from '../UI/Paper';

const styles = {
  shortcutBox: {
    padding: 15,
    textAlign: 'center',
  },
};

type Props = {|
  commandText: ?string,
  onSet: (shortcut: string) => void,
  onClose: () => void,
|};

const DetectShortcutDialog = (props: Props): React.Node => {
  const [shortcutString, setShortcutString] = React.useState('');
  const [isValid, setIsValid] = React.useState(false);

  const onApply = () => {
    if (!isValid) return;
    shortcutString && props.onSet(shortcutString);
    props.onClose();
  };

  React.useEffect(() => {
    // $FlowFixMe[cannot-resolve-name]
    const handler = (e: KeyboardEvent) => {
      e.preventDefault();
      const metadata = getShortcutMetadataFromEvent(e);
      if (e.type === 'keyup') return;
      setIsValid(metadata.isValid);
      setShortcutString(metadata.shortcutString);
    };
    // $FlowFixMe[cannot-resolve-name]
    document.addEventListener('keyup', handler);
    // $FlowFixMe[cannot-resolve-name]
    document.addEventListener('keydown', handler);
    return () => {
      // $FlowFixMe[cannot-resolve-name]
      document.removeEventListener('keydown', handler);
      // $FlowFixMe[cannot-resolve-name]
      document.removeEventListener('keyup', handler);
    };
  }, []);

  return (
    <Dialog
      title={<Trans>Set shortcut</Trans>}
      open
      maxWidth="xs"
      actions={[
        <FlatButton
          key="Cancel"
          label={<Trans>Cancel</Trans>}
          onClick={props.onClose}
        />,
        <FlatButton
          label={<Trans>Set shortcut</Trans>}
          primary
          key="Set"
          onClick={onApply}
          disabled={!isValid}
        />,
      ]}
      secondaryActions={[
        <FlatButton
          key="Remove"
          label={<Trans>Remove shortcut</Trans>}
          onClick={() => {
            props.onSet('');
            props.onClose();
          }}
        />,
      ]}
      onRequestClose={props.onClose}
      onApply={onApply}
    >
      <Text>{props.commandText}</Text>
      <Paper variant="outlined" style={styles.shortcutBox} background="light">
        <Text>
          {shortcutString ? (
            getShortcutDisplayName(shortcutString)
          ) : (
            <Trans>Press a shortcut combination...</Trans>
          )}
        </Text>
      </Paper>
    </Dialog>
  );
};

export default DetectShortcutDialog;
