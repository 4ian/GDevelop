// @flow
import * as React from 'react';
import { type I18n as I18nType } from '@lingui/core';
import { getUserPublicProfilesByIds } from '../../../../Utils/GDevelopServices/User';
import { type Profile } from '../../../../Utils/GDevelopServices/Authentication';
import { type CloudProjectWithUserAccessInfo } from '../../../../Utils/GDevelopServices/Project';
import { type FileMetadataAndStorageProviderName } from '../../../../ProjectsStorage';
import { marginsSize } from '../../../../UI/Grid';
import { sendGameTemplateInformationOpened } from '../../../../Utils/Analytics/EventSender';
import { getProductPriceOrOwnedLabel } from '../../../../AssetStore/ProductPriceTag';
import { type PrivateGameTemplateListingData } from '../../../../Utils/GDevelopServices/Shop';
import { type ExampleShortHeader } from '../../../../Utils/GDevelopServices/Example';
import { type PrivateGameTemplate } from '../../../../Utils/GDevelopServices/Asset';
import { type CarouselThumbnail } from '../../../../UI/Carousel';
import {
  ExampleTile,
  PrivateGameTemplateTile,
} from '../../../../AssetStore/ShopTiles';

export type LastModifiedInfo = {|
  lastModifiedByUsername: ?string,
  lastModifiedByIconUrl: string,
  lastModifiedAt: number,
  lastKnownVersionId: ?string,
|};

type LastModifiedInfoByProjectId = {|
  [projectId: string]: LastModifiedInfo,
|};

export const getProjectLineHeight = ({ isMobile }: {| isMobile: boolean |}) => {
  const lineHeight = isMobile ? 52 : 36;

  return lineHeight - 2 * marginsSize;
};

export const getLastModifiedInfoByProjectId = async ({
  cloudProjects,
  profile,
}: {|
  cloudProjects: Array<CloudProjectWithUserAccessInfo>,
  profile: Profile,
|}): Promise<LastModifiedInfoByProjectId> => {
  const cloudProjectsLastModifiedBySomeoneElse = cloudProjects.filter(
    cloudProject =>
      !!cloudProject.committedAt &&
      !!cloudProject.lastCommittedBy &&
      cloudProject.lastCommittedBy !== profile.id
  );

  const allOtherContributorIds = new Set(
    cloudProjectsLastModifiedBySomeoneElse
      .map(cloudProject => cloudProject.lastCommittedBy)
      .filter(Boolean)
  );

  if (allOtherContributorIds.size === 0) return {};

  try {
    const userPublicProfileByIds = await getUserPublicProfilesByIds(
      Array.from(allOtherContributorIds)
    );
    const lastModifiedInfoByProjectId: LastModifiedInfoByProjectId = {};
    cloudProjects.forEach(project => {
      if (!project.lastCommittedBy || !project.committedAt) return;
      const contributorPublicProfile =
        userPublicProfileByIds[project.lastCommittedBy];
      if (!contributorPublicProfile) return;
      lastModifiedInfoByProjectId[project.id] = {
        lastModifiedByUsername: contributorPublicProfile.username,
        lastModifiedByIconUrl: contributorPublicProfile.iconUrl,
        lastModifiedAt: Date.parse(project.committedAt),
        lastKnownVersionId: project.currentVersion,
      };
    });

    return lastModifiedInfoByProjectId;
  } catch (error) {
    // We don't block the display of the projects if the public profiles
    // can't be fetched.
    console.error(
      'Error while fetching public profiles of contributors of projects:',
      error
    );
    return {};
  }
};

export const transformCloudProjectsIntoFileMetadataWithStorageProviderName = (
  cloudProjects: Array<CloudProjectWithUserAccessInfo>,
  ownerId?: string
): Array<FileMetadataAndStorageProviderName> => {
  return cloudProjects
    .map(cloudProject => {
      if (cloudProject.deletedAt) return null;
      const file: FileMetadataAndStorageProviderName = {
        storageProviderName: 'Cloud',
        fileMetadata: {
          fileIdentifier: cloudProject.id,
          lastModifiedDate: Date.parse(cloudProject.lastModifiedAt),
          name: cloudProject.name,
          gameId: cloudProject.gameId,
          version: cloudProject.currentVersion,
        },
      };
      if (ownerId) {
        file.fileMetadata.ownerId = ownerId;
      }
      return file;
    })
    .filter(Boolean);
};

const formatGameTemplateListingDataForCarousel = ({
  gameTemplateListingData,
  onSelectGameTemplate,
  i18n,
  receivedGameTemplates,
}: {|
  gameTemplateListingData: PrivateGameTemplateListingData,
  onSelectGameTemplate: PrivateGameTemplateListingData => void,
  i18n: I18nType,
  receivedGameTemplates: ?Array<PrivateGameTemplate>,
|}): CarouselThumbnail => {
  const isTemplateOwned =
    !!receivedGameTemplates &&
    !!receivedGameTemplates.find(
      receivedGameTemplate =>
        receivedGameTemplate.id === gameTemplateListingData.id
    );
  return {
    id: gameTemplateListingData.id,
    title: gameTemplateListingData.name,
    thumbnailUrl: gameTemplateListingData.thumbnailUrls[0],
    onClick: () => {
      sendGameTemplateInformationOpened({
        gameTemplateName: gameTemplateListingData.name,
        gameTemplateId: gameTemplateListingData.id,
        source: 'homepage',
      });
      onSelectGameTemplate(gameTemplateListingData);
    },
    overlayText: getProductPriceOrOwnedLabel({
      i18n,
      productListingData: gameTemplateListingData,
      owned: isTemplateOwned,
    }),
    overlayTextPosition: 'topLeft',
  };
};

const formatExampleShortHeaderForCarousel = ({
  exampleShortHeader,
  onSelectExample,
}: {|
  exampleShortHeader: ExampleShortHeader,
  onSelectExample: ExampleShortHeader => void,
|}) => {
  return {
    id: exampleShortHeader.id,
    title: exampleShortHeader.name,
    onClick: () => onSelectExample(exampleShortHeader),
    thumbnailUrl: exampleShortHeader.previewImageUrls[0],
  };
};

/**
 * This method allocates examples and private game templates between the
 * build section carousel and grid.
 * `numberOfItemsExclusivelyInCarousel` controls the number of items that
 * should appear in the carousel only. The rest appears in both the carousel
 * and the grid.
 */
export const getExampleAndTemplateItemsForBuildSection = ({
  receivedGameTemplates,
  privateGameTemplateListingDatas,
  exampleShortHeaders,
  onSelectPrivateGameTemplateListingData,
  onSelectExampleShortHeader,
  i18n,
  numberOfItemsExclusivelyInCarousel,
  numberOfItemsInCarousel,
  numberOfItemsInGrid,
  privateGameTemplatesPeriodicity,
}: {|
  receivedGameTemplates: ?Array<PrivateGameTemplate>,
  privateGameTemplateListingDatas?: ?Array<PrivateGameTemplateListingData>,
  exampleShortHeaders?: ?Array<ExampleShortHeader>,
  onSelectPrivateGameTemplateListingData: (
    privateGameTemplateListingData: PrivateGameTemplateListingData
  ) => void,
  onSelectExampleShortHeader: (exampleShortHeader: ExampleShortHeader) => void,
  i18n: I18nType,
  numberOfItemsExclusivelyInCarousel: number,
  numberOfItemsInCarousel: number,
  numberOfItemsInGrid: number,
  privateGameTemplatesPeriodicity: number,
|}): {|
  carouselItems: Array<CarouselThumbnail>,
  gridItems: Array<React.Node>,
|} => {
  if (!exampleShortHeaders || !privateGameTemplateListingDatas) {
    return { carouselItems: [], gridItems: [] };
  }
  const exampleShortHeadersWithThumbnails = exampleShortHeaders.filter(
    exampleShortHeader =>
      !!exampleShortHeader.previewImageUrls &&
      !!exampleShortHeader.previewImageUrls[0]
  );

  const carouselItems: Array<CarouselThumbnail> = [];
  const gridItems = [];
  let exampleIndex = 0;
  let privateGameTemplateIndex = 0;
  for (
    let i = 0;
    i < numberOfItemsInGrid + numberOfItemsExclusivelyInCarousel;
    ++i
  ) {
    const shouldAddPrivateGameTemplate =
      i % privateGameTemplatesPeriodicity ===
      privateGameTemplatesPeriodicity - 1;

    // At one point, we might run out of private game templates to display while
    // it is assumed that we have enough examples to display. This boolean is used
    // to know if we actually could add a private game template. This way, indices
    // can be increased accordingly.
    let privateGameTemplateActuallyAdded = false;
    if (i < numberOfItemsInCarousel) {
      // There should always be enough private game templates to sparsely fill the carousel.
      privateGameTemplateActuallyAdded = shouldAddPrivateGameTemplate;
      carouselItems.push(
        shouldAddPrivateGameTemplate
          ? formatGameTemplateListingDataForCarousel({
              i18n,
              onSelectGameTemplate: onSelectPrivateGameTemplateListingData,
              gameTemplateListingData:
                privateGameTemplateListingDatas[privateGameTemplateIndex],
              receivedGameTemplates: receivedGameTemplates,
            })
          : formatExampleShortHeaderForCarousel({
              exampleShortHeader:
                exampleShortHeadersWithThumbnails[exampleIndex],
              onSelectExample: onSelectExampleShortHeader,
            })
      );
    }
    if (i >= numberOfItemsExclusivelyInCarousel) {
      if (shouldAddPrivateGameTemplate) {
        const privateGameTemplateListingData =
          privateGameTemplateListingDatas[privateGameTemplateIndex];
        if (privateGameTemplateListingData) {
          const isTemplateOwned =
            !!receivedGameTemplates &&
            !!receivedGameTemplates.find(
              receivedGameTemplate =>
                receivedGameTemplate.id === privateGameTemplateListingData.id
            );
          gridItems.push(
            <PrivateGameTemplateTile
              privateGameTemplateListingData={privateGameTemplateListingData}
              onSelect={() => {
                onSelectPrivateGameTemplateListingData(
                  privateGameTemplateListingData
                );
              }}
              owned={isTemplateOwned}
              key={privateGameTemplateListingData.id}
            />
          );
          privateGameTemplateActuallyAdded = true;
        }
      }
      if (!privateGameTemplateActuallyAdded) {
        const exampleShortHeader =
          exampleShortHeadersWithThumbnails[exampleIndex];
        gridItems.push(
          <ExampleTile
            exampleShortHeader={exampleShortHeader}
            onSelect={() => onSelectExampleShortHeader(exampleShortHeader)}
            key={exampleShortHeader.name}
          />
        );
      }
    }
    if (privateGameTemplateActuallyAdded) privateGameTemplateIndex++;
    else exampleIndex++;
    if (
      exampleIndex >= exampleShortHeadersWithThumbnails.length &&
      privateGameTemplateIndex >= privateGameTemplateListingDatas.length
    ) {
      break;
    }
  }

  return { carouselItems, gridItems };
};

export const getAllGameTemplatesAndExamplesFlaggedAsGameCount = ({
  privateGameTemplateListingDatas,
  exampleShortHeaders,
  columnsCount,
}: {
  privateGameTemplateListingDatas: ?(PrivateGameTemplateListingData[]),
  exampleShortHeaders: ?(ExampleShortHeader[]),
  columnsCount: number,
}) => {
  return (
    Math.floor(
      ((privateGameTemplateListingDatas
        ? privateGameTemplateListingDatas.length
        : 0) +
        (exampleShortHeaders
          ? exampleShortHeaders.filter(
              exampleShortHeader =>
                exampleShortHeader.tags.includes('game') ||
                exampleShortHeader.tags.includes('Starter')
            ).length
          : 0)) /
        columnsCount
    ) * columnsCount
  );
};
