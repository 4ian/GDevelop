// @flow

// This file lists all the data fetching happening in the app, and the timeouts
// associated to them. It's useful to understand the order of the data fetching
// when the app is launched.

// Try to keep the list sorted from shortest to longest timeout,
// so we can easily see the order of requests.

// ASSETS_FETCH - No timeout. Loaded everytime the environment staging/live change.
// SUBSCRIPTION_PLANS_AND_PRICING_SYSTEMS_FETCH - No timeout. Loaded on the homepage.

export const ANNOUNCEMENTS_FETCH_TIMEOUT = 1000;
export const IN_APP_TUTORIALS_FETCH_TIMEOUT = 1000;

export const PRIVATE_GAME_TEMPLATES_FETCH_TIMEOUT = 5000; // But called right away because it's used in the homepage.
export const EXAMPLES_FETCH_TIMEOUT = 5000; // But called right away because it's used in the homepage.

// Below are the calls made when the user is authenticated. They are called right away
// BADGE_FETCH
// USAGE_FETCH
// SUBSCRIPTION_FETCH
// LIMITS_FETCH
// PROJECTS_FETCH
// ASSET_PACKS_FETCH
// ASSET_SHORT_HEADERS_FETCH
// RECOMMENDATIONS_FETCH
// GAME_TEMPLATES_FETCH
// PURCHASES_FETCH
// USER_FETCH

export const EXTENSIONS_FETCH_TIMEOUT = 5000;
export const BEHAVIORS_FETCH_TIMEOUT = 5000;

export const PRODUCT_LICENSES_FETCH_TIMEOUT = 8000;
export const CREDITS_PACKAGES_FETCH_TIMEOUT = 8000;
export const MARKETING_PLANS_FETCH_TIMEOUT = 8000;

export const CHECK_APP_UPDATES_TIMEOUT = 10000;
