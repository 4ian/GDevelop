// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import FlatButton from '../../UI/FlatButton';
import RaisedButton from '../../UI/RaisedButton';
import Copy from '../../UI/CustomSvgIcons/Copy';
import InfoBar from '../../UI/Messages/InfoBar';
import { copyTextToClipboard } from '../../Utils/Clipboard';

type Props = {|
  giftClaimUrl: string,
  primary?: boolean,
|};

// The link is only copied, never opened: opening it would claim the gift for the buyer.
const CopyGiftLinkButton = ({ giftClaimUrl, primary }: Props): React.Node => {
  const [showCopiedInfoBar, setShowCopiedInfoBar] = React.useState(false);
  const onCopy = async () => {
    await copyTextToClipboard(giftClaimUrl);
    setShowCopiedInfoBar(true);
  };

  return (
    <>
      {primary ? (
        <RaisedButton
          primary
          icon={<Copy fontSize="small" />}
          label={<Trans>Copy gift link</Trans>}
          onClick={onCopy}
        />
      ) : (
        <FlatButton
          leftIcon={<Copy fontSize="small" />}
          label={<Trans>Copy gift link</Trans>}
          onClick={onCopy}
        />
      )}
      <InfoBar
        message={<Trans>Copied to clipboard!</Trans>}
        visible={showCopiedInfoBar}
        hide={() => setShowCopiedInfoBar(false)}
      />
    </>
  );
};

export default CopyGiftLinkButton;
