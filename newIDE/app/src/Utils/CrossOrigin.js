// @flow
export const checkIfIsGDevelopCloudBucketUrl = (url: string): boolean => {
  return (
    url.startsWith('https://project-resources.gdevelop.io/') ||
    url.startsWith('https://project-resources-dev.gdevelop.io/')
  );
};

export const checkIfCredentialsRequired = (url: string): boolean => {
  // Any resource stored on the GDevelop Cloud buckets needs the "credentials" of the user,
  // i.e: its gdevelop.io cookie, to be passed.
  if (checkIfIsGDevelopCloudBucketUrl(url)) return true;

  // For other resources, use the default way of loading resources ("anonymous" or "same-site").
  return false;
};
