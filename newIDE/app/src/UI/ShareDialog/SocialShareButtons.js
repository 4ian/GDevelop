// @flow

import * as React from 'react';
import {
  EmailShareButton,
  FacebookShareButton,
  RedditShareButton,
  TwitterShareButton,
  WhatsappShareButton,
} from 'react-share';
import { Line } from '../Grid';
import Facebook from '../CustomSvgIcons/Facebook';
import Twitter from '../CustomSvgIcons/Twitter';
import Reddit from '../CustomSvgIcons/Reddit';
import Mail from '../CustomSvgIcons/Mail';
import Whatsapp from '../CustomSvgIcons/Whatsapp';

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
        <Facebook />
      </FacebookShareButton>
      <RedditShareButton
        url={url}
        title={`Try the game I just created with r/gdevelop`}
        style={styles.icon}
      >
        <Reddit />
      </RedditShareButton>
      <TwitterShareButton
        title={`Try the game I just created with GDevelop.io`}
        hashtags={['gdevelop']}
        url={url}
        style={styles.icon}
      >
        <Twitter />
      </TwitterShareButton>
      <WhatsappShareButton
        title={`Try the game I just created with GDevelop.io`}
        url={url}
        style={styles.icon}
      >
        <Whatsapp />
      </WhatsappShareButton>
      <EmailShareButton
        subject="My GDevelop game"
        body="Try the game I just created with GDevelop.io"
        url={url}
        style={styles.icon}
      >
        <Mail />
      </EmailShareButton>
    </Line>
  );
};

export default SocialShareButtons;
