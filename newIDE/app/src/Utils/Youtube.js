// @flow

export const getYoutubeVideoIdFromUrl = (youtubeUrl: ?string): ?string => {
  if (!youtubeUrl || !youtubeUrl.startsWith('https://youtu.be/')) return null;

  try {
    const url = new URL(youtubeUrl);

    const lastPartOfUrl = url.pathname.split('/').pop();
    if (!lastPartOfUrl || !lastPartOfUrl.length) {
      console.error(`The video URL is badly formatted ${youtubeUrl}`);
      return null;
    }
    return lastPartOfUrl;
  } catch (error) {
    console.error(`Could not parse youtube url ${youtubeUrl}:`, error);
    return null;
  }
};
