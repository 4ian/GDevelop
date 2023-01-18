// @flow
import * as React from 'react';
import Text from '../../../UI/Text';
import { Trans } from '@lingui/macro';
import Window from '../../../Utils/Window';
import Discord from '../../../UI/CustomSvgIcons/Discord';
import { ColumnStackLayout } from '../../../UI/Layout';
import YouTube from '../../../UI/CustomSvgIcons/YouTube';
import Messages from '../../../UI/CustomSvgIcons/Messages';
import Reddit from '../../../UI/CustomSvgIcons/Reddit';
import Twitter from '../../../UI/CustomSvgIcons/Twitter';
import Facebook from '../../../UI/CustomSvgIcons/Facebook';
import TikTok from '../../../UI/CustomSvgIcons/TikTok';
import SectionContainer, { SectionRow } from './SectionContainer';
import { ListItem } from '../../../UI/List';
import List from '@material-ui/core/List';
import { AnnouncementsFeed } from '../../../AnnouncementsFeed';

const styles = {
  list: {
    width: '100%',
  },
};

const communityItems = [
  {
    onClick: () => Window.openExternalURL('https://forum.gdevelop.io'),
    icon: <Messages fontSize="small" />,
    label: <Trans>GDevelop Forums</Trans>,
  },
  {
    onClick: () =>
      Window.openExternalURL('https://www.youtube.com/c/GDevelopApp'),
    icon: <YouTube fontSize="small" />,
    label: <Trans>YouTube</Trans>,
  },
  {
    onClick: () => Window.openExternalURL('https://discord.gg/gdevelop'),
    icon: <Discord fontSize="small" />,
    label: <Trans>Discord</Trans>,
  },
  {
    onClick: () => Window.openExternalURL('https://www.reddit.com/r/gdevelop'),
    icon: <Reddit fontSize="small" />,
    label: <Trans>Reddit</Trans>,
  },
  {
    onClick: () => Window.openExternalURL('https://twitter.com/GDevelopApp'),
    icon: <Twitter fontSize="small" />,
    label: <Trans>Twitter</Trans>,
  },
  {
    onClick: () =>
      Window.openExternalURL('https://www.facebook.com/GDevelopApp'),
    icon: <Facebook fontSize="small" />,
    label: <Trans>Facebook</Trans>,
  },
  {
    onClick: () => Window.openExternalURL('https://www.tiktok.com/@gdevelop'),
    icon: <TikTok fontSize="small" color="inherit" />,
    label: <Trans>TikTok</Trans>,
  },
];

const CommunitySection = () => {
  return (
    <SectionContainer title={<Trans>Community</Trans>}>
      <SectionRow>
        <ColumnStackLayout noMargin expand>
          <Text size="title">
            <Trans>News and announcements</Trans>
          </Text>
          <AnnouncementsFeed canClose={false} />
          <Text size="title">
            <Trans>Join the conversation</Trans>
          </Text>
          <List style={styles.list}>
            {communityItems.map((item, index) => (
              <ListItem
                leftIcon={item.icon}
                key={index}
                primaryText={
                  <Text noMargin size="body">
                    {item.label}
                  </Text>
                }
                onClick={item.onClick}
              />
            ))}
          </List>
        </ColumnStackLayout>
      </SectionRow>
    </SectionContainer>
  );
};

export default CommunitySection;
