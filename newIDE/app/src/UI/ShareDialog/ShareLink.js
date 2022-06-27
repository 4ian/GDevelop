// @flow

import { t, Trans } from '@lingui/macro';
import * as React from 'react';
import Copy from '../CustomSvgIcons/Copy';
import IconButton from '../IconButton';
import { TextFieldWithButtonLayout } from '../Layout';
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
      <TextFieldWithButtonLayout
        noFloatingLabelText
        renderTextField={() => (
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
        )}
        renderButton={style => (
          <RaisedButton
            primary
            label={<Trans>Open</Trans>}
            onClick={onOpen}
            style={style}
          />
        )}
      />
      <InfoBar
        message={<Trans>Copied to clipboard!</Trans>}
        visible={showCopiedInfoBar}
        hide={() => setShowCopiedInfoBar(false)}
      />
    </>
  );
};

export default ShareLink;
