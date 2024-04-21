// @flow
import * as React from 'react';

import paperDecorator from '../../../PaperDecorator';
import { AssetDetails } from '../../../../AssetStore/AssetDetails';
import {
  fakeAssetShortHeader1,
  fakeAssetWithCustomObject,
} from '../../../../fixtures/GDevelopServicesTestData';
import { AssetStoreStateProvider } from '../../../../AssetStore/AssetStoreContext';
import { GDevelopUserApi } from '../../../../Utils/GDevelopServices/ApiConfigs';
import PublicProfileProvider from '../../../../Profile/PublicProfileProvider';
import { useShopNavigation } from '../../../../AssetStore/AssetStoreNavigator';

export default {
  title: 'AssetStore/AssetStore/AssetDetails',
  component: AssetDetails,
  decorators: [paperDecorator],
};

const Wrapper = ({ children }: { children: React.Node }) => {
  const navigationState = useShopNavigation();
  return (
    <PublicProfileProvider>
      <AssetStoreStateProvider shopNavigationState={navigationState}>
        {children}
      </AssetStoreStateProvider>
    </PublicProfileProvider>
  );
};

export const PublicAsset = () => {
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
PublicAsset.parameters = {
  mockData: [
    {
      url: `https://resources.gdevelop-app.com/assets-database/assets/${
        fakeAssetShortHeader1.id
      }.json`,
      method: 'GET',
      status: 200,
      response: fakeAssetWithCustomObject,
    },
  ],
};

export const PrivateAsset = () => (
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
PrivateAsset.parameters = {
  mockData: [
    {
      url: `${
        GDevelopUserApi.baseUrl
      }/user-public-profile?id=ZJxWdIDmJzUA5iAWryEItxINA7n1`,
      method: 'GET',
      status: 200,
      response: {
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
      },
    },
    {
      url: `https://resources.gdevelop-app.com/assets-database/assets/${
        fakeAssetShortHeader1.id
      }.json`,
      method: 'GET',
      status: 200,
      response: {
        ...fakeAssetWithCustomObject,
        authorIds: ['ZJxWdIDmJzUA5iAWryEItxINA7n1'],
        authors: [],
      },
    },
  ],
};

export const AssetWithMultipleAuthors = () => (
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
PrivateAsset.parameters = {
  mockData: [
    {
      url: `${
        GDevelopUserApi.baseUrl
      }/user-public-profile?id=ZJxWdIDmJzUA5iAWryEItxINA7n1,ABCWdIDmJzUA5iAWryEItxINA7n1`,
      method: 'GET',
      status: 200,
      response: {
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
      },
    },
    {
      url: `https://resources.gdevelop-app.com/assets-database/assets/${
        fakeAssetShortHeader1.id
      }.json`,
      method: 'GET',
      status: 200,
      response: {
        ...fakeAssetWithCustomObject,
        authorIds: [
          'ZJxWdIDmJzUA5iAWryEItxINA7n1',
          'ABCWdIDmJzUA5iAWryEItxINA7n1',
        ],
      },
    },
  ],
};
