// @flow

import { Trans } from '@lingui/macro';
import * as React from 'react';
import Copy from '../CustomSvgIcons/Copy';
import IconButton from '../IconButton';
import { LineStackLayout } from '../Layout';
import RaisedButton from '../RaisedButton';
import Window from '../../Utils/Window';
import InfoBar from '../Messages/InfoBar';
import Paper from '../Paper';
import Text from '../Text';
import Link from '../Link';
import { textEllipsisStyle } from '../TextEllipsis';

const styles = {
  linkContainer: {
    display: 'flex',
    padding: '0px 8px',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 4,
    minWidth: 0,
    flex: 1,
  },
};

type Props = {|
  url: string,
  withOpenButton?: boolean,
|};

const ShareLink = ({ url, withOpenButton }: Props) => {
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
      <LineStackLayout alignItems="center" noMargin>
        <Paper style={styles.linkContainer} background="light">
          <LineStackLayout
            alignItems="center"
            justifyContent="space-between"
            expand
          >
            <Text noMargin style={textEllipsisStyle}>
              <Link href={url} onClick={() => Window.openExternalURL(url)}>
                {url.replace('https://', '')}
              </Link>
            </Text>
            <IconButton size="small" onClick={onCopyLinkToClipboard}>
              <Copy fontSize="small" />
            </IconButton>
          </LineStackLayout>
        </Paper>
        {withOpenButton && (
          <RaisedButton
            primary
            id="open-online-export-button"
            label={<Trans>Open</Trans>}
            onClick={onOpen}
          />
        )}
      </LineStackLayout>
      <InfoBar
        message={<Trans>Copied to clipboard!</Trans>}
        visible={showCopiedInfoBar}
        hide={() => setShowCopiedInfoBar(false)}
      />
    </>
  );
};

export default ShareLink;
