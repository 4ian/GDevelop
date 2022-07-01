// @flow
import * as React from 'react';
import { Line } from '../../../UI/Grid';
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
    <SectionContainer>
      <Line>
        <Text size="main-title">
          <Trans>Community</Trans>
        </Text>
      </Line>
      <ColumnStackLayout alignItems="start" noMargin>
        <Text size="title">
          <Trans>Join the conversation</Trans>
        </Text>
        <TextButton
          onClick={() => Window.openExternalURL('https://forum.gdevelop.io')}
          icon={<Messages />}
          label={<Trans>GDevelop Forums</Trans>}
        />
        <TextButton
          onClick={() =>
            Window.openExternalURL('https://www.youtube.com/c/GDevelopApp')
          }
          icon={<YouTube />}
          label={<Trans>YouTube</Trans>}
        />
        <TextButton
          onClick={() => Window.openExternalURL('https://discord.gg/gdevelop')}
          icon={<Discord />}
          label={<Trans>Discord</Trans>}
        />
        <TextButton
          onClick={() =>
            Window.openExternalURL('https://www.reddit.com/r/gdevelop')
          }
          icon={<Reddit />}
          label={<Trans>Reddit</Trans>}
        />
        <TextButton
          onClick={() =>
            Window.openExternalURL('https://twitter.com/GDevelopApp')
          }
          icon={<Twitter />}
          label={<Trans>Twitter</Trans>}
        />
        <TextButton
          onClick={() =>
            Window.openExternalURL('https://www.facebook.com/GDevelopApp')
          }
          icon={<Facebook />}
          label={<Trans>Facebook</Trans>}
        />
        <TextButton
          onClick={() =>
            Window.openExternalURL('https://www.tiktok.com/@gdevelop')
          }
          icon={<TikTok />}
          label={<Trans>TikTok</Trans>}
        />
      </ColumnStackLayout>
    </SectionContainer>
  );
};
