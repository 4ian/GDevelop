// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import Dialog from '../../UI/Dialog';
import FlatButton from '../../UI/FlatButton';
import Changelog from '.';
import Text from '../../UI/Text';
import useForceUpdate from '../../Utils/UseForceUpdate';
import Window from '../../Utils/Window';
import { ResponsiveLineStackLayout } from '../../UI/Layout';

type Props = {|
  open: boolean,
  onClose: () => void,
|};

const ChangelogDialog = ({ open, onClose }: Props) => {
  const forceUpdate = useForceUpdate();
  if (!open) {
    // Don't render anything, to avoid in particular sending useless requests.
    return null;
  }

  const openReleaseNote = () =>
    Window.openExternalURL('https://github.com/4ian/GDevelop/releases');

  const actions = [
    <FlatButton
      key="close"
      label={<Trans>Close</Trans>}
      primary={true}
      onClick={onClose}
    />,
  ];

  return (
    <Dialog
      title={<Trans>What's new in GDevelop?</Trans>}
      actions={actions}
      open={open}
      onRequestClose={onClose}
      flexColumnBody
    >
      <ResponsiveLineStackLayout noMargin justifyContent="space-between">
        <Text>
          <Trans>
            GDevelop was upgraded to a new version! Check out the changes.
          </Trans>
        </Text>
        <FlatButton
          label={<Trans>See all the release notes</Trans>}
          onClick={openReleaseNote}
        />
      </ResponsiveLineStackLayout>
      <Changelog
        onUpdated={forceUpdate} // Force update to ensure dialog is properly positioned
      />
    </Dialog>
  );
};

export default ChangelogDialog;
