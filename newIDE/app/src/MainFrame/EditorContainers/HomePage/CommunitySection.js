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
import ErrorBoundary from '../../../UI/ErrorBoundary';
import { AnnouncementsFeed } from '../../../AnnouncementsFeed';
import { AnnouncementsFeedContext } from '../../../AnnouncementsFeed/AnnouncementsFeedContext';
import PromotionsSlideshow from '../../../Promotions/PromotionsSlideshow';
import { UserAndGameLeaderboards } from './CommunitySection/UserAndGameLeaderboards';

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
    icon: <YouTube fontSize="small" htmlColor="#FF0000" />,
    label: <Trans>YouTube</Trans>,
  },
  {
    onClick: () => Window.openExternalURL('https://discord.gg/gdevelop'),
    icon: <Discord fontSize="small" htmlColor="#5865F2" />,
    label: <Trans>Discord</Trans>,
  },
  {
    onClick: () => Window.openExternalURL('https://www.reddit.com/r/gdevelop'),
    icon: <Reddit fontSize="small" htmlColor="#FF5700" />,
    label: <Trans>Reddit</Trans>,
  },
  {
    onClick: () => Window.openExternalURL('https://twitter.com/GDevelopApp'),
    icon: <Twitter fontSize="small" htmlColor="#1DA1F2" />,
    label: <Trans>Twitter</Trans>,
  },
  {
    onClick: () =>
      Window.openExternalURL('https://www.facebook.com/GDevelopApp'),
    icon: <Facebook fontSize="small" htmlColor="#4267B2" />,
    label: <Trans>Facebook</Trans>,
  },
  {
    onClick: () => Window.openExternalURL('https://www.tiktok.com/@gdevelop'),
    icon: <TikTok fontSize="small" color="inherit" />,
    label: <Trans>TikTok</Trans>,
  },
];

const CommunitySection = () => {
  const { announcements } = React.useContext(AnnouncementsFeedContext);

  const shouldDisplayAnnouncementsTitle =
    announcements && announcements.length > 0;

  return (
    <SectionContainer title={<Trans>Community</Trans>} showUrgentAnnouncements>
      <SectionRow>
        <ColumnStackLayout noMargin expand>
          {shouldDisplayAnnouncementsTitle && (
            <Text size="title">
              <Trans>News and announcements</Trans>
            </Text>
          )}
          <PromotionsSlideshow />
          <AnnouncementsFeed canClose={false} level="normal" />
          <Text size="title">
            <Trans>Rankings</Trans>
          </Text>
          <UserAndGameLeaderboards />
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

const CommunitySectionWithErrorBoundary = () => (
  <ErrorBoundary
    componentTitle={<Trans>Community section</Trans>}
    scope="start-page-community"
  >
    <CommunitySection />
  </ErrorBoundary>
);

export default CommunitySectionWithErrorBoundary;
