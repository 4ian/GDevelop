// @flow

import * as React from 'react';
import {
  EmailIcon,
  EmailShareButton,
  FacebookIcon,
  FacebookShareButton,
  RedditIcon,
  RedditShareButton,
  TwitterIcon,
  TwitterShareButton,
  WhatsappIcon,
  WhatsappShareButton,
} from 'react-share';
import { Line } from '../Grid';

type Props = {|
  url: string,
|};

const styles = {
  icon: {
    padding: 5,
  },
};

const SocialShareButtons = ({ url }: Props) => {
  return (
    <Line>
      <FacebookShareButton
        url={url}
        style={styles.icon}
        quote={`Try the game I just created with GDevelop.io`}
        hashtag="#gdevelop"
      >
        <FacebookIcon size={32} round />
      </FacebookShareButton>
      <RedditShareButton
        url={url}
        title={`Try the game I just created with r/gdevelop`}
        style={styles.icon}
      >
        <RedditIcon size={32} round />
      </RedditShareButton>
      <TwitterShareButton
        title={`Try the game I just created with GDevelop.io`}
        hashtags={['gdevelop']}
        url={url}
        style={styles.icon}
      >
        <TwitterIcon size={32} round />
      </TwitterShareButton>
      <WhatsappShareButton
        title={`Try the game I just created with GDevelop.io`}
        url={url}
        style={styles.icon}
      >
        <WhatsappIcon size={32} round />
      </WhatsappShareButton>
      <EmailShareButton
        subject="My GDevelop game"
        body="Try the game I just created with GDevelop.io"
        url={url}
        style={styles.icon}
      >
        <EmailIcon size={32} round />
      </EmailShareButton>
    </Line>
  );
};

export default SocialShareButtons;
