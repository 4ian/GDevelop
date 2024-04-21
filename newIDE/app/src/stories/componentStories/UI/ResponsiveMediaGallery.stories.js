// @flow
import * as React from 'react';

import ResponsiveMediaGallery from '../../../UI/ResponsiveMediaGallery';
import Text from '../../../UI/Text';
import { Column } from '../../../UI/Grid';
import { ResponsiveLineStackLayout } from '../../../UI/Layout';
import Paper from '../../../UI/Paper';

export default {
  title: 'UI Building Blocks/ResponsiveMediaGallery',
  component: ResponsiveMediaGallery,
};

export const Default = () => (
  <Paper background="dark">
    <Column>
      <ResponsiveLineStackLayout noColumnMargin>
        <Column expand noOverflowParent noMargin>
          <Text>Default</Text>
        </Column>
        <Column expand noOverflowParent noMargin>
          <ResponsiveMediaGallery
            mediaItems={[
              {
                kind: 'image',
                url:
                  'https://resources.gdevelop-app.com/assets/Packs/gdevelop platformer.png',
              },
              {
                kind: 'image',
                url:
                  'https://resources.gdevelop-app.com/assets/Packs/space shooter.png',
              },
              {
                kind: 'image',
                url:
                  'https://resources.gdevelop-app.com/assets/Packs/particles emitter.png',
              },
              {
                kind: 'image',
                url:
                  'https://resources.gdevelop-app.com/assets/Packs/lucid icons pack.png',
              },
              {
                kind: 'image',
                url:
                  'https://resources.gdevelop-app.com/assets/Packs/wesxdz skullcup.png',
              },
              {
                kind: 'image',
                url:
                  'https://resources.gdevelop-app.com/assets/Packs/casual buttons pack.png',
              },
            ]}
            altTextTemplate={'Image {imageIndex}'}
          />
        </Column>
      </ResponsiveLineStackLayout>
      <ResponsiveLineStackLayout noColumnMargin>
        <Column expand noOverflowParent noMargin>
          <Text>Eating outer margins on the side on small devices</Text>
        </Column>
        <Column expand noOverflowParent noMargin>
          <ResponsiveMediaGallery
            mediaItems={[
              {
                kind: 'image',
                url:
                  'https://resources.gdevelop-app.com/assets/Packs/gdevelop platformer.png',
              },
              {
                kind: 'image',
                url:
                  'https://resources.gdevelop-app.com/assets/Packs/space shooter.png',
              },
              {
                kind: 'image',
                url:
                  'https://resources.gdevelop-app.com/assets/Packs/particles emitter.png',
              },
              {
                kind: 'image',
                url:
                  'https://resources.gdevelop-app.com/assets/Packs/lucid icons pack.png',
              },
              {
                kind: 'image',
                url:
                  'https://resources.gdevelop-app.com/assets/Packs/wesxdz skullcup.png',
              },
              {
                kind: 'image',
                url:
                  'https://resources.gdevelop-app.com/assets/Packs/casual buttons pack.png',
              },
            ]}
            altTextTemplate={'Image {imageIndex}'}
            horizontalOuterMarginToEatOnMobile={8}
          />
        </Column>
      </ResponsiveLineStackLayout>
    </Column>
  </Paper>
);
