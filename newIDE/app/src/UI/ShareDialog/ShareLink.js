// @flow

import { t, Trans } from '@lingui/macro';
import * as React from 'react';
import Copy from '../CustomSvgIcons/Copy';
import IconButton from '../IconButton';
import { TextFieldWithButtonLayout } from '../Layout';
import RaisedButton from '../RaisedButton';
import TextField from '../TextField';

type Props = {|
  onCopy: () => void,
  onOpen: () => void,
  buildUrl: string,
|};

const ShareLink = ({ onCopy, onOpen, buildUrl }: Props) => {
  return (
    <TextFieldWithButtonLayout
      noFloatingLabelText
      renderTextField={() => (
        <TextField
          value={buildUrl}
          readOnly
          fullWidth
          endAdornment={
            <IconButton onClick={onCopy} tooltip={t`Copy`} edge="end">
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
  );
};

export default ShareLink;
