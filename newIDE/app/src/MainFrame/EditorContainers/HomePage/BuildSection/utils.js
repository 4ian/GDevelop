// @flow
import { type I18n as I18nType } from '@lingui/core';
import { getUserPublicProfilesByIds } from '../../../../Utils/GDevelopServices/User';
import { type AuthenticatedUser } from '../../../../Profile/AuthenticatedUserContext';
import { type Profile } from '../../../../Utils/GDevelopServices/Authentication';
import { type CloudProjectWithUserAccessInfo } from '../../../../Utils/GDevelopServices/Project';
import { type FileMetadataAndStorageProviderName } from '../../../../ProjectsStorage';
import { type WidthType } from '../../../../UI/Reponsive/ResponsiveWindowMeasurer';
import { marginsSize } from '../../../../UI/Grid';
import { sendGameTemplateInformationOpened } from '../../../../Utils/Analytics/EventSender';
import { getProductPriceOrOwnedLabel } from '../../../../AssetStore/ProductPriceTag';
import { prepareExampleShortHeaders } from '../../../../AssetStore/ExampleStore';
import { type PrivateGameTemplateListingData } from '../../../../Utils/GDevelopServices/Shop';
import { type ExampleShortHeader } from '../../../../Utils/GDevelopServices/Example';
import { type CarouselThumbnail } from '../../../../UI/Carousel';
import { shuffleArray } from '../../../../Utils/Random';

export type LastModifiedInfo = {|
  lastModifiedByUsername: ?string,
  lastModifiedByIconUrl: string,
  lastModifiedAt: number,
  lastKnownVersionId: ?string,
|};

type LastModifiedInfoByProjectId = {|
  [projectId: string]: LastModifiedInfo,
|};

export const getProjectLineHeight = (width: WidthType) => {
  const lineHeight = width === 'small' ? 52 : 36;

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

export const getExampleAndTemplateItemsForCarousel = ({
  authenticatedUser,
  privateGameTemplateListingDatas,
  exampleShortHeaders,
  onSelectPrivateGameTemplateListingData,
  onSelectExampleShortHeader,
  i18n,
}: {|
  authenticatedUser: AuthenticatedUser,
  privateGameTemplateListingDatas?: ?Array<PrivateGameTemplateListingData>,
  exampleShortHeaders?: ?Array<ExampleShortHeader>,
  onSelectPrivateGameTemplateListingData: (
    privateGameTemplateListingData: PrivateGameTemplateListingData
  ) => void,
  onSelectExampleShortHeader: (exampleShortHeader: ExampleShortHeader) => void,
  i18n: I18nType,
|}): Array<CarouselThumbnail> => {
  const allItems: Array<CarouselThumbnail> = [];
  const privateGameTemplateItems = [
    ...(privateGameTemplateListingDatas
      ? shuffleArray(privateGameTemplateListingDatas).map(
          privateGameTemplateListingData => {
            const isTemplateOwned =
              !!authenticatedUser.receivedGameTemplates &&
              !!authenticatedUser.receivedGameTemplates.find(
                receivedGameTemplate =>
                  receivedGameTemplate.id === privateGameTemplateListingData.id
              );
            return {
              id: privateGameTemplateListingData.id,
              title: privateGameTemplateListingData.name,
              thumbnailUrl: privateGameTemplateListingData.thumbnailUrls[0],
              onClick: () => {
                sendGameTemplateInformationOpened({
                  gameTemplateName: privateGameTemplateListingData.name,
                  gameTemplateId: privateGameTemplateListingData.id,
                  source: 'homepage',
                });
                onSelectPrivateGameTemplateListingData(
                  privateGameTemplateListingData
                );
              },
              overlayText: getProductPriceOrOwnedLabel({
                i18n,
                productListingData: privateGameTemplateListingData,
                owned: isTemplateOwned,
              }),
              overlayTextPosition: 'topLeft',
            };
          }
        )
      : []),
  ];

  const exampleShortHeaderItems = [
    ...(exampleShortHeaders
      ? prepareExampleShortHeaders(exampleShortHeaders)
          .map(example => ({
            id: example.id,
            title: example.name,
            onClick: () => onSelectExampleShortHeader(example),
            thumbnailUrl: example.previewImageUrls[0],
          }))
          .filter(exampleShortHeader => !!exampleShortHeader.thumbnailUrl)
      : []),
  ];

  for (let i = 0; i < exampleShortHeaderItems.length; ++i) {
    allItems.push(exampleShortHeaderItems[i]);
    if (i % 2 === 1 && privateGameTemplateItems.length > 0) {
      const nextPrivateGameTemplateIndex = Math.floor(i / 2);
      if (nextPrivateGameTemplateIndex < privateGameTemplateItems.length)
        allItems.push(privateGameTemplateItems[nextPrivateGameTemplateIndex]);
    }
  }

  const firstItems = allItems.slice(0, 12); // Only show 12 items.

  return firstItems;
};
