// @flow
import axios from 'axios';
import { GDevelopExampleCdn } from './ApiConfigs';
import { retryIfFailed } from '../RetryIfFailed';
import { type Environment } from './Asset';

/**
 * The themes a starter can be created with. For each theme, the examples
 * repository publishes a copy of every starter it covers, re-skinned with the
 * theme's assets, next to the starter itself.
 */
export type ThemedStarters = {|
  version: number,
  themes: Array<{|
    id: string,
    name: string,
    description: string,
    // Starter slug -> URL of its copy re-skinned with the theme.
    starters: { [starterSlug: string]: string },
  |}>,
|};

// Only changes when a starter or a theme is published: kept for the session,
// per environment so that switching to the staging assets reads them anew.
const themedStartersPromises: {
  [environment: string]: Promise<ThemedStarters>,
} = {};

export const getThemedStarters = (
  environment: Environment
): Promise<ThemedStarters> => {
  if (!themedStartersPromises[environment]) {
    themedStartersPromises[environment] = retryIfFailed(
      { times: 2 },
      async () => {
        // $FlowFixMe[underconstrained-implicit-instantiation]
        const response = await axios.get(
          `${GDevelopExampleCdn.baseUrl[environment]}/themedStarters.json`
        );
        return response.data;
      }
    ).catch(error => {
      delete themedStartersPromises[environment];
      throw error;
    });
  }
  return themedStartersPromises[environment];
};

/**
 * The project file of a starter re-skinned with a theme, or null if there is
 * none (the starter is then created with its original assets). With the
 * staging environment, a theme can be tried before it is published.
 */
export const getThemedStarterProjectFileUrl = async ({
  starterSlug,
  themeId,
  environment,
}: {|
  starterSlug: string,
  themeId: string,
  environment: Environment,
|}): Promise<?string> => {
  try {
    const themedStarters = await getThemedStarters(environment);
    const theme = themedStarters.themes.find(theme => theme.id === themeId);
    if (!theme) return null;
    return theme.starters[starterSlug] || null;
  } catch (error) {
    console.error(
      `Unable to find the "${themeId}" themed starters. The project will be created with its original assets.`,
      error
    );
    return null;
  }
};
