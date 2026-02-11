// @flow

import * as React from 'react';
import { Trans } from '@lingui/macro';
import FlatButton from '../FlatButton';
import Share from '../CustomSvgIcons/Share';

type Props = {|
  url: string,
|};

const ShareButton = ({ url }: Props) => {
  const onShare = async () => {
    if (!url || !navigator.share) return;

    // We are on mobile (or on browsers supporting sharing using the system dialog).
    const shareData = {
      title: 'My GDevelop game',
      text: 'Try the game I just created with #gdevelop',
      url: url,
    };

    try {
      await navigator.share(shareData);
    } catch (err) {
      console.error("Couldn't share the game", err);
    }
  };

  if (!navigator.share) return null;
  return (
    <FlatButton
      label={<Trans>Share</Trans>}
      onClick={onShare}
      leftIcon={<Share />}
    />
  );
};

export default ShareButton;
