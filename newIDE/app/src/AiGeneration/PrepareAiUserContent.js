// @flow
import axios from 'axios';
import { retryIfFailed } from '../Utils/RetryIfFailed';
import {
  createAiUserContentPresignedUrls,
  type AiUserContentPresignedUrlsResult,
} from '../Utils/GDevelopServices/Generation';
import jsSHA from '../Utils/Sha256';

type UploadInfo = {
  uploadedAt: number,
  userRelativeKey: string | null,
};

const makeUploadCache = ({
  minimalContentLength,
}: {|
  minimalContentLength: number | null,
|}) => {
  const uploadCacheByHash: {
    [string]: UploadInfo,
  } = {};

  return {
    getUserRelativeKey: (hash: string | null) => {
      if (!hash) {
        return null;
      }

      return (
        (uploadCacheByHash[hash] && uploadCacheByHash[hash].userRelativeKey) ||
        null
      );
    },
    storeUpload: (hash: string | null, uploadInfo: UploadInfo) => {
      if (!hash) return;
      uploadCacheByHash[hash] = uploadInfo;
    },
    shouldUpload: ({
      hash,
      contentLength,
    }: {|
      hash: string | null,
      contentLength: number,
    |}) => {
      if (!hash) {
        // No hash, so no content to upload.
        return false;
      }

      if (minimalContentLength && contentLength < minimalContentLength) {
        // The content is too small to be uploaded.
        return false;
      }

      if (
        uploadCacheByHash[hash] &&
        uploadCacheByHash[hash].uploadedAt > Date.now() - 1000 * 60 * 30
      ) {
        // The content was already uploaded recently (and recently enough so that it has not expired in such a short time).
        // We don't need to upload it again.
        return false;
      }

      // The content was not uploaded, or not recently: we'll upload it now.
      return true;
    },
  };
};

const projectSpecificExtensionsSummaryUploadCache = makeUploadCache({
  minimalContentLength: null, // Always upload the project specific extensions summary.
});
const gameProjectJsonUploadCache = makeUploadCache({
  minimalContentLength: 10 * 1000, // Roughly 10KB.
});

const computeSha256 = (payload: string): string => {
  const shaObj = new jsSHA('SHA-256', 'TEXT', { encoding: 'UTF8' });
  shaObj.update(payload);
  return shaObj.getHash('HEX');
};

/**
 * Prepare the user content to be used by the AI.
 * It either uploads the content (and avoid uploading it again for a while)
 * so that the request will just refer to the key where it's stored, or
 * return the content so it's sent as part of the request itself (if it's small enough).
 */
export const prepareAiUserContent = async ({
  getAuthorizationHeader,
  userId,
  simplifiedProjectJson,
  projectSpecificExtensionsSummaryJson,
}: {|
  getAuthorizationHeader: () => Promise<string>,
  userId: string,
  simplifiedProjectJson: string | null,
  projectSpecificExtensionsSummaryJson: string | null,
|}) => {
  // Hash the contents, if provided, to then upload it only once (as long as the hash stays
  // the same, no need to re-upload it for a while).
  // If the content is not provided, no hash is computed because there is no content to upload.
  const startTime = Date.now();
  const gameProjectJsonHash = simplifiedProjectJson
    ? computeSha256(simplifiedProjectJson)
    : null;
  const projectSpecificExtensionsSummaryJsonHash = projectSpecificExtensionsSummaryJson
    ? computeSha256(projectSpecificExtensionsSummaryJson)
    : null;
  const endTime = Date.now();
  console.info(
    `Hash of simplified project json and project specific extensions summary json took ${(
      endTime - startTime
    ).toFixed(2)}ms`
  );

  const shouldUploadProjectSpecificExtensionsSummary = projectSpecificExtensionsSummaryUploadCache.shouldUpload(
    {
      hash: projectSpecificExtensionsSummaryJsonHash,
      contentLength: projectSpecificExtensionsSummaryJson
        ? projectSpecificExtensionsSummaryJson.length
        : 0,
    }
  );

  const shouldUploadGameProjectJson = gameProjectJsonUploadCache.shouldUpload({
    hash: gameProjectJsonHash,
    contentLength: simplifiedProjectJson ? simplifiedProjectJson.length : 0,
  });

  if (
    shouldUploadGameProjectJson ||
    shouldUploadProjectSpecificExtensionsSummary
  ) {
    const startTime = Date.now();
    const {
      gameProjectJsonSignedUrl,
      gameProjectJsonUserRelativeKey,
      projectSpecificExtensionsSummaryJsonSignedUrl,
      projectSpecificExtensionsSummaryJsonUserRelativeKey,
    }: AiUserContentPresignedUrlsResult = await retryIfFailed(
      { times: 3 },
      () =>
        createAiUserContentPresignedUrls(getAuthorizationHeader, {
          userId,
          gameProjectJsonHash: shouldUploadGameProjectJson
            ? gameProjectJsonHash
            : null,
          projectSpecificExtensionsSummaryJsonHash: shouldUploadProjectSpecificExtensionsSummary
            ? projectSpecificExtensionsSummaryJsonHash
            : null,
        })
    );

    const uploadedAt = Date.now();

    await Promise.all([
      gameProjectJsonSignedUrl
        ? retryIfFailed({ times: 3 }, () =>
            axios.put(gameProjectJsonSignedUrl, simplifiedProjectJson, {
              headers: {
                'Content-Type': 'application/json',
              },
              // Allow any arbitrary large file to be sent
              maxContentLength: Infinity,
            })
          ).then(() => {
            gameProjectJsonUploadCache.storeUpload(gameProjectJsonHash, {
              uploadedAt,
              userRelativeKey: gameProjectJsonUserRelativeKey || null,
            });
          })
        : null,
      projectSpecificExtensionsSummaryJsonSignedUrl
        ? retryIfFailed({ times: 3 }, () =>
            axios.put(
              projectSpecificExtensionsSummaryJsonSignedUrl,
              projectSpecificExtensionsSummaryJson,
              {
                headers: {
                  'Content-Type': 'application/json',
                },
                // Allow any arbitrary large file to be sent
                maxContentLength: Infinity,
              }
            )
          ).then(() => {
            projectSpecificExtensionsSummaryUploadCache.storeUpload(
              projectSpecificExtensionsSummaryJsonHash,
              {
                uploadedAt,
                userRelativeKey:
                  projectSpecificExtensionsSummaryJsonUserRelativeKey || null,
              }
            );
          })
        : null,
    ]);

    const endTime = Date.now();
    console.info(
      `Upload of ${[
        shouldUploadGameProjectJson ? 'simplified project' : null,
        shouldUploadProjectSpecificExtensionsSummary
          ? 'project specific extensions summary'
          : null,
      ]
        .filter(Boolean)
        .join(' and ')} took ${(endTime - startTime).toFixed(2)}ms`
    );
  }

  // Get the key at which the content was uploaded, if it was uploaded.
  // If not, the content will be sent as part of the request instead of the upload key.
  const gameProjectJsonUserRelativeKey = gameProjectJsonUploadCache.getUserRelativeKey(
    gameProjectJsonHash
  );
  const projectSpecificExtensionsSummaryJsonUserRelativeKey = projectSpecificExtensionsSummaryUploadCache.getUserRelativeKey(
    projectSpecificExtensionsSummaryJsonHash
  );

  return {
    gameProjectJsonUserRelativeKey,
    gameProjectJson: gameProjectJsonUserRelativeKey
      ? null
      : simplifiedProjectJson,
    projectSpecificExtensionsSummaryJsonUserRelativeKey,
    projectSpecificExtensionsSummaryJson: projectSpecificExtensionsSummaryJsonUserRelativeKey
      ? null
      : projectSpecificExtensionsSummaryJson,
  };
};
