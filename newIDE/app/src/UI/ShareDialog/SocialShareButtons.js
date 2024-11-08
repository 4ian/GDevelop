// @flow

import * as React from 'react';
import {
  EmailShareButton,
  FacebookShareButton,
  RedditShareButton,
  TwitterShareButton,
  WhatsappShareButton,
} from 'react-share';
import Facebook from '../CustomSvgIcons/Facebook';
import Twitter from '../CustomSvgIcons/Twitter';
import Reddit from '../CustomSvgIcons/Reddit';
import Mail from '../CustomSvgIcons/Mail';
import Whatsapp from '../CustomSvgIcons/Whatsapp';
import { createStyles, makeStyles } from '@material-ui/core';

const useStyles = () =>
  makeStyles(theme =>
    createStyles({
      root: {
        padding: 5,
        cursor: 'pointer',
        '& svg': {
          transition: 'color 0.1s',
          cursor: 'pointer',
        },
        '& path': {
          cursor: 'unset',
        },
        '&:hover svg': {
          color: theme.palette.secondary.dark,
        },
        '&:focus svg': {
          color: theme.palette.secondary.dark,
        },
      },
    })
  )();

type Props = {|
  url: string,
|};

const styles = {
  icon: {
    // Needed to override style set by react-share directly on the button element.
    padding: 5,
  },
  container: {
    display: 'flex',
    flexWrap: 'wrap',
  },
};

const SocialShareButtons = ({ url }: Props) => {
  const classNames = useStyles();
  return (
    <div style={styles.container}>
      <FacebookShareButton
        url={url}
        className={classNames.root}
        style={styles.icon}
        quote={`Try the game I just created with GDevelop.io`}
        hashtag="#gdevelop"
      >
        <Facebook />
      </FacebookShareButton>
      <RedditShareButton
        url={url}
        className={classNames.root}
        title={`Try the game I just created with r/gdevelop`}
        style={styles.icon}
      >
        <Reddit />
      </RedditShareButton>
      <TwitterShareButton
        title={`Try the game I just created with GDevelop.io`}
        hashtags={['gdevelop']}
        url={url}
        className={classNames.root}
        style={styles.icon}
      >
        <Twitter />
      </TwitterShareButton>
      <WhatsappShareButton
        title={`Try the game I just created with GDevelop.io`}
        url={url}
        className={classNames.root}
        style={styles.icon}
      >
        <Whatsapp />
      </WhatsappShareButton>
      <EmailShareButton
        subject="My GDevelop game"
        body="Try the game I just created with GDevelop.io"
        url={url}
        className={classNames.root}
        style={styles.icon}
      >
        <Mail />
      </EmailShareButton>
    </div>
  );
};

export default SocialShareButtons;
