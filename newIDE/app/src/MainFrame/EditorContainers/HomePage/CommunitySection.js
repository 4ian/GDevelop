// @flow
import * as React from 'react';
import Text from '../../../UI/Text';
import { Trans } from '@lingui/macro';
import TextButton from '../../../UI/TextButton';
import Window from '../../../Utils/Window';
import Discord from '../../../UI/CustomSvgIcons/Discord';
import { ColumnStackLayout } from '../../../UI/Layout';
import YouTube from '../../../UI/CustomSvgIcons/YouTube';
import Messages from '../../../UI/CustomSvgIcons/Messages';
import Reddit from '../../../UI/CustomSvgIcons/Reddit';
import Twitter from '../../../UI/CustomSvgIcons/Twitter';
import Facebook from '../../../UI/CustomSvgIcons/Facebook';
import TikTok from '../../../UI/CustomSvgIcons/TikTok';
import { SectionContainer } from './SectionContainer';

export const CommunitySection = () => {
  return (
    <SectionContainer title={<Trans>Community</Trans>}>
      <ColumnStackLayout alignItems="start" noMargin>
        <Text size="title">
          <Trans>Join the conversation</Trans>
        </Text>
        <TextButton
          onClick={() => Window.openExternalURL('https://forum.gdevelop.io')}
          icon={<Messages fontSize="small" />}
          label={
            <Text noMargin size="body">
              <Trans>GDevelop Forums</Trans>
            </Text>
          }
        />
        <TextButton
          onClick={() =>
            Window.openExternalURL('https://www.youtube.com/c/GDevelopApp')
          }
          icon={<YouTube fontSize="small" />}
          label={
            <Text noMargin size="body">
              <Trans>YouTube</Trans>
            </Text>
          }
        />
        <TextButton
          onClick={() => Window.openExternalURL('https://discord.gg/gdevelop')}
          icon={<Discord fontSize="small" />}
          label={
            <Text noMargin size="body">
              <Trans>Discord</Trans>
            </Text>
          }
        />
        <TextButton
          onClick={() =>
            Window.openExternalURL('https://www.reddit.com/r/gdevelop')
          }
          icon={<Reddit fontSize="small" />}
          label={
            <Text noMargin size="body">
              <Trans>Reddit</Trans>
            </Text>
          }
        />
        <TextButton
          onClick={() =>
            Window.openExternalURL('https://twitter.com/GDevelopApp')
          }
          icon={<Twitter fontSize="small" />}
          label={
            <Text noMargin size="body">
              <Trans>Twitter</Trans>
            </Text>
          }
        />
        <TextButton
          onClick={() =>
            Window.openExternalURL('https://www.facebook.com/GDevelopApp')
          }
          icon={<Facebook fontSize="small" />}
          label={
            <Text noMargin size="body">
              <Trans>Facebook</Trans>
            </Text>
          }
        />
        <TextButton
          onClick={() =>
            Window.openExternalURL('https://www.tiktok.com/@gdevelop')
          }
          icon={<TikTok fontSize="small" color="inherit" />}
          label={
            <Text noMargin size="body">
              <Trans>TikTok</Trans>
            </Text>
          }
        />
      </ColumnStackLayout>
    </SectionContainer>
  );
};
