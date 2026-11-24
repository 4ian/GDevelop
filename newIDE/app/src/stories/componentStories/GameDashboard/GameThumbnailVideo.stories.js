// @flow

import * as React from 'react';
import { action } from '@storybook/addon-actions';

import paperDecorator from '../../PaperDecorator';
import { GameThumbnailVideo } from '../../../GameDashboard/GameThumbnailVideo';
import { GameThumbnail } from '../../../GameDashboard/GameThumbnail';
import { PublicGameProperties } from '../../../GameDashboard/PublicGameProperties';
import {
  fakeSilverAuthenticatedUser,
  game1,
  getPublicGameFromGame,
} from '../../../fixtures/GDevelopServicesTestData';
import AuthenticatedUserContext from '../../../Profile/AuthenticatedUserContext';
import PreviewVideoRecordingContext from '../../../MainFrame/PreviewVideoRecordingContext';

export default {
  title: 'GameDashboard/GameThumbnailVideo',
  component: GameThumbnailVideo,
  decorators: [paperDecorator],
};

const sampleVideoUrl =
  'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';

const Wrapper = ({
  isProjectOpened,
  children,
}: {|
  isProjectOpened: boolean,
  children: React.Node,
|}) => (
  <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
    <PreviewVideoRecordingContext.Provider
      value={{
        currentProjectGameId: isProjectOpened ? game1.id : null,
        onRecordPreviewVideo: async () => action('onRecordPreviewVideo')(),
      }}
    >
      {children}
    </PreviewVideoRecordingContext.Provider>
  </AuthenticatedUserContext.Provider>
);

export const NoVideo = (): React.Node => (
  <Wrapper isProjectOpened>
    <GameThumbnailVideo publicGame={getPublicGameFromGame(game1)} />
  </Wrapper>
);

export const RecordedAutomatically = (): React.Node => (
  <Wrapper isProjectOpened>
    <GameThumbnailVideo
      publicGame={{
        ...getPublicGameFromGame(game1),
        previewVideoUrls: [sampleVideoUrl],
      }}
    />
  </Wrapper>
);

export const RecordedByTheCreator = (): React.Node => (
  <Wrapper isProjectOpened>
    <GameThumbnailVideo
      publicGame={{
        ...getPublicGameFromGame(game1),
        thumbnailVideoUrl: sampleVideoUrl,
      }}
    />
  </Wrapper>
);

export const ProjectNotOpened = (): React.Node => (
  <Wrapper isProjectOpened={false}>
    <GameThumbnailVideo
      publicGame={{
        ...getPublicGameFromGame(game1),
        thumbnailVideoUrl: sampleVideoUrl,
      }}
    />
  </Wrapper>
);

const sampleThumbnailUrl =
  'https://resources.gdevelop-app.com/examples/platformer/thumbnail.png';

/** The video next to the thumbnail, in the "Edit details" dialog of the dashboard. */
export const InGameProperties = (): React.Node => (
  <Wrapper isProjectOpened>
    <PublicGameProperties
      gameId={game1.id}
      name={game1.gameName}
      setName={action('setName')}
      description={game1.description}
      setDescription={action('setDescription')}
      authorIds={[]}
      setAuthorIds={action('setAuthorIds')}
      setAuthorUsernames={action('setAuthorUsernames')}
      orientation="landscape"
      setOrientation={action('setOrientation')}
      displayThumbnail
      thumbnailUrl={sampleThumbnailUrl}
      publicGame={{
        ...getPublicGameFromGame(game1),
        previewVideoUrls: [sampleVideoUrl],
      }}
      onGameUpdated={action('onGameUpdated')}
    />
  </Wrapper>
);

/** In the header of the dashboard: the video plays while the thumbnail is hovered. */
export const ThumbnailWithVideoOnHover = (): React.Node => (
  <GameThumbnail
    gameName={game1.gameName}
    thumbnailUrl={sampleThumbnailUrl}
    videoUrl={sampleVideoUrl}
  />
);
