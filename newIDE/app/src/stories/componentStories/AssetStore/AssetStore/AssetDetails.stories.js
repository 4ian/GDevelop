// @flow
import * as React from 'react';
import MockAdapter from 'axios-mock-adapter';

import paperDecorator from '../../../PaperDecorator';
import { AssetDetails } from '../../../../AssetStore/AssetDetails';
import {
  fakeAssetShortHeader1,
  fakeAssetWithCustomObject,
} from '../../../../fixtures/GDevelopServicesTestData';
import { AssetStoreStateProvider } from '../../../../AssetStore/AssetStoreContext';
import { PublicProfileProvider } from '../../../../Profile/PublicProfileContext';
import { AssetStoreNavigatorStateProvider } from '../../../../AssetStore/AssetStoreNavigator';
import { client as userApiClient } from '../../../../Utils/GDevelopServices/User';
import { cdnClient as assetCdnClient } from '../../../../Utils/GDevelopServices/Asset';

export default {
  title: 'AssetStore/AssetStore/AssetDetails',
  component: AssetDetails,
  decorators: [paperDecorator],
};

const Wrapper = ({ children }: {| children: React.Node |}) => {
  return (
    <PublicProfileProvider>
      <AssetStoreNavigatorStateProvider>
        <AssetStoreStateProvider>{children}</AssetStoreStateProvider>
      </AssetStoreNavigatorStateProvider>
    </PublicProfileProvider>
  );
};

export const PublicAsset = () => {
  const assetCdnMock = new MockAdapter(assetCdnClient);
  assetCdnMock
    .onGet(
      `https://resources.gdevelop-app.com/assets-database/assets/${
        fakeAssetShortHeader1.id
      }.json`
    )
    .reply(200, fakeAssetWithCustomObject);

  return (
    <Wrapper>
      <AssetDetails
        onTagSelection={() => {}}
        assetShortHeader={fakeAssetShortHeader1}
        onOpenDetails={assetShortHeader => {}}
        onPrivateAssetPackSelection={() => {}}
        onPrivateGameTemplateSelection={() => {}}
      />
    </Wrapper>
  );
};

export const PrivateAsset = () => {
  const userServiceMock = new MockAdapter(userApiClient);
  userServiceMock
    .onGet('/user-public-profile', {
      params: { id: 'ZJxWdIDmJzUA5iAWryEItxINA7n1' },
    })
    .reply(200, {
      ZJxWdIDmJzUA5iAWryEItxINA7n1: {
        id: 'ZJxWdIDmJzUA5iAWryEItxINA7n1',
        username: 'Clem',
        description: "I'm Clement\n\ntada",
        donateLink: 'https://ko-fi/clem',
        discordUsername: 'indie-user#1234',
        personalWebsiteLink: 'https://indie-user.com',
        personalWebsite2Link: 'https://indie-user2.com',
        twitterUsername: 'indie-user',
        facebookUsername: 'indie-user',
        youtubeUsername: 'indie-user',
        tiktokUsername: 'indie-user',
        instagramUsername: 'indie-user',
        redditUsername: 'indie-user',
        snapchatUsername: 'indie-user',
        discordServerLink: 'https://discord.gg/indie-user',
      },
    });

  const assetCdnMock = new MockAdapter(assetCdnClient);
  assetCdnMock
    .onGet(
      `https://resources.gdevelop-app.com/assets-database/assets/${
        fakeAssetShortHeader1.id
      }.json`
    )
    .reply(200, {
      ...fakeAssetWithCustomObject,
      id: fakeAssetShortHeader1.id,
      authorIds: ['ZJxWdIDmJzUA5iAWryEItxINA7n1'],
      authors: [],
    });

  return (
    <Wrapper>
      <AssetDetails
        onTagSelection={() => {}}
        assetShortHeader={fakeAssetShortHeader1}
        onOpenDetails={assetShortHeader => {}}
        onPrivateAssetPackSelection={() => {}}
        onPrivateGameTemplateSelection={() => {}}
      />
    </Wrapper>
  );
};

export const AssetWithMultipleAuthors = () => {
  const userServiceMock = new MockAdapter(userApiClient);
  userServiceMock
    .onGet('/user-public-profile', {
      params: {
        id: 'ZJxWdIDmJzUA5iAWryEItxINA7n1,ABCWdIDmJzUA5iAWryEItxINA7n1',
      },
    })
    .reply(200, {
      ZJxWdIDmJzUA5iAWryEItxINA7n1: {
        id: 'ZJxWdIDmJzUA5iAWryEItxINA7n1',
        username: 'Clem',
        description: "I'm Clement\n\ntada",
        donateLink: 'https://ko-fi/clem',
        discordUsername: 'indie-user#1234',
        personalWebsiteLink: 'https://indie-user.com',
        personalWebsite2Link: 'https://indie-user2.com',
        twitterUsername: 'indie-user',
        facebookUsername: 'indie-user',
        youtubeUsername: 'indie-user',
        tiktokUsername: 'indie-user',
        instagramUsername: 'indie-user',
        redditUsername: 'indie-user',
        snapchatUsername: 'indie-user',
        discordServerLink: 'https://discord.gg/indie-user',
      },
      ABCWdIDmJzUA5iAWryEItxINA7n1: {
        id: 'ABCWdIDmJzUA5iAWryEItxINA7n1',
        username: 'Clem2',
        description: "I'm Clement 2\n\ntada",
        donateLink: 'https://ko-fi/clem2',
        discordUsername: 'indie-user#12345',
        personalWebsiteLink: 'https://indie-user.com',
        personalWebsite2Link: 'https://indie-user2.com',
        twitterUsername: 'indie-user',
        facebookUsername: 'indie-user',
        youtubeUsername: 'indie-user',
        tiktokUsername: 'indie-user',
        instagramUsername: 'indie-user',
        redditUsername: 'indie-user',
        snapchatUsername: 'indie-user',
        discordServerLink: 'https://discord.gg/indie-user',
      },
    });

  const assetCdnMock = new MockAdapter(assetCdnClient);
  assetCdnMock
    .onGet(
      `https://resources.gdevelop-app.com/assets-database/assets/${
        fakeAssetShortHeader1.id
      }.json`
    )
    .reply(200, {
      ...fakeAssetWithCustomObject,
      id: fakeAssetShortHeader1.id,
      authorIds: [
        'ZJxWdIDmJzUA5iAWryEItxINA7n1',
        'ABCWdIDmJzUA5iAWryEItxINA7n1',
      ],
    });

  return (
    <Wrapper>
      <AssetDetails
        onTagSelection={() => {}}
        assetShortHeader={fakeAssetShortHeader1}
        onOpenDetails={assetShortHeader => {}}
        onPrivateAssetPackSelection={() => {}}
        onPrivateGameTemplateSelection={() => {}}
      />
    </Wrapper>
  );
};
