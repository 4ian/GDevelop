// @flow

import { t, Trans } from '@lingui/macro';
import * as React from 'react';
import Copy from '../CustomSvgIcons/Copy';
import IconButton from '../IconButton';
import { ResponsiveLineStackLayout } from '../Layout';
import RaisedButton from '../RaisedButton';
import TextField from '../TextField';
import Window from '../../Utils/Window';
import InfoBar from '../Messages/InfoBar';

type Props = {|
  url: string,
|};

const ShareLink = ({ url }: Props) => {
  const [showCopiedInfoBar, setShowCopiedInfoBar] = React.useState(false);
  const onCopyLinkToClipboard = () => {
    if (!url) return;
    navigator.clipboard.writeText(url);
    setShowCopiedInfoBar(true);
  };
  const onOpen = () => {
    if (!url) return;
    Window.openExternalURL(url);
  };
  return (
    <>
      <ResponsiveLineStackLayout alignItems="center" noMargin>
        <TextField
          value={url}
          readOnly
          fullWidth
          endAdornment={
            <IconButton
              onClick={onCopyLinkToClipboard}
              tooltip={t`Copy`}
              edge="end"
            >
              <Copy />
            </IconButton>
          }
        />
        <RaisedButton
          primary
          id="open-online-export-button"
          label={<Trans>Open</Trans>}
          onClick={onOpen}
        />
      </ResponsiveLineStackLayout>
      <InfoBar
        message={<Trans>Copied to clipboard!</Trans>}
        visible={showCopiedInfoBar}
        hide={() => setShowCopiedInfoBar(false)}
      />
    </>
  );
};

export default ShareLink;
