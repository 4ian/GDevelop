// flow-typed signature: 2b849e9475cf6c205eb91bef1cf09580
// flow-typed version: 0850d53e97/algoliasearch_v3.x.x/flow_>=v0.56.x

// @flow

type JSONObject = mixed;
type HTTPClient = any;
type Callback<Response> = (error: ?Error, response: Response) => void;

declare type $algolia$SearchIndexResponse = {|
  hits: Array<any>,
  page: number,
  nbHits: number,
  nbPages: number,
  hitsPerPage: number,
  processingTimeMS: number,
  query: string,
  parsed_query: string,
  params: string,
|};

declare type $algolia$SearchIndexMultiResponse = {|
  results: Array<$algolia$SearchIndexResponse>,
|};

declare type $algoliasearch$Settings = {|
  // https://www.algolia.com/doc/rest-api/search/#ranking
  // Attributes
  searchableAttributes?: Array<string>,
  attributesForFaceting?: Array<string>,
  unretrievableAttributes?: Array<string>,
  attributesToRetrieve?: Array<string> | '*',

  // Ranking
  ranking?: Array<string>,
  customRanking?: Array<string>,
  replicas?: Array<string>,

  // Faceting
  maxValuesPerFacet?: number,

  // Hightlighting & Snippeting
  attributesToHighlight?: Array<string>,
  attributesToSnippet?: Array<string>,
  hightlightPreTag?: string,
  hightlightPostTag?: string,
  snippetEllipsisText?: string,
  restrictHighlightAndSnippetArrays?: boolean,

  // Pagination
  hitsPerPage?: number,
  paginationLimitedTo?: number,

  // Typo
  minWordSizefor1Typo?: number,
  minWordSizefor2Typo?: number,
  typoTolerance?: string | boolean,
  allowTyposOnNumericTokens?: boolean,
  ignorePlurals?: boolean,
  disableTypoToleranceOnAttributes?: boolean,
  disableTypoToleranceOnWords?: boolean,
  separatorsToIndex?: string,
|};

declare type $algoliasearch$ClientOptions = {|
  timeout?: number,
  protocol?: 'http:' | 'https:',
  httpClient?: HTTPClient,
  hosts?: {|
    read?: string,
    write?: string,
  |},
|};

declare type $algoliasearch$QueryParameters =
  | string
  | {
      advancedSyntax?: boolean,
      allowTyposOnNumericTokens?: boolean,
      alternativesAsExact?: any,
      analytics?: boolean,
      analyticsTags?: Array<string>,
      aroundLatLng?: string,
      aroundLatLngViaIP?: string,
      aroundPrecision?: number,
      aroundRadius?: number | 'all',
      attributesToHighlight?: Array<string>,
      attributesToRetrieve?: Array<string>,
      attributesToSnippet?: Array<string>,
      disableExactOnAttributes?: Array<string>,
      disableTypoToleranceOnAttributes?: string,
      distinct?: any,
      exactOnSingleWordQuery?: string,
      facetFilters?: string,
      facets?: string,
      filters?: string,
      getRankingInfo?: boolean,
      highlightPostTag?: string,
      highlightPreTag?: string,
      hitsPerPage?: number,
      ignorePlurals?: boolean,
      insideBoundingBox?: number[][],
      insidePolygon?: number[][],
      length?: number,
      maxValuesPerFacet?: string,
      minimumAroundRadius?: number,
      minProximity?: number,
      minWordSizefor1Typo?: number,
      minWordSizefor2Typos?: number,
      numericAttributesToIndex?: Array<string>,
      numericFilters?: Array<string>,
      offset?: number,
      optionalWords?: Array<string>,
      page?: number,
      query?: string,
      queryType?: any,
      removeStopWords?: Array<string>,
      removeWordsIfNoResults?: string,
      replaceSynonymsInHighlight?: boolean,
      restrictHighlightAndSnippetArrays?: boolean,
      restrictSearchableAttributes?: Array<string>,
      snippetEllipsisText?: string,
      synonyms?: boolean,
      tagFilters?: string,
      typoTolerance?: boolean,
    };

declare type $algoliasearch$QueryMultiParameters = Array<{|
  indexName: string,
  params: $algoliasearch$QueryParameters,
|}>;

declare interface $algoliasearch$Client {
  clearCache(): void,
  initIndex(s: string): $algoliasearch$Index,
};

declare interface $algoliasearch$IndexLite {
  clearCache(): void,
  // Single
  search(
    s: $algoliasearch$QueryParameters,
    callback: Callback<$algolia$SearchIndexResponse>
  ): void,
  search(
    s: $algoliasearch$QueryParameters
  ): Promise<$algolia$SearchIndexResponse>,
  // Multi
  search(
    queries: Array<$algoliasearch$QueryMultiParameters>,
    callback: Callback<$algolia$SearchIndexMultiResponse>
  ): void,
  search(
    queries: Array<$algoliasearch$QueryMultiParameters>
  ): Promise<$algolia$SearchIndexMultiResponse>,
  setSettings(settings: $algoliasearch$Settings, callback: Callback<any>): void,
  setSettings(settings: $algoliasearch$Settings): Promise<any>,
};

declare interface $algoliasearch$Index extends $algoliasearch$IndexLite {
  addObjects(o: JSONObject, callback: Callback<any>): void,
  addObjects(o: JSONObject): Promise<any>,
};

declare interface $algoliasearch$ClientLite {
  clearCache(): void,
  initIndex(s: string): $algoliasearch$IndexLite,
};

declare module 'algoliasearch' {
  declare type Client = $algoliasearch$Client;
  declare type ClientOptions = $algoliasearch$ClientOptions;
  declare type Index = $algoliasearch$Index;
  declare type Settings = $algoliasearch$Settings;
  declare module.exports: {
    (
      applicationID: string,
      apiKey: string,
      options?: ClientOptions
    ): Client;
  }
}

declare module 'algoliasearch/reactnative' {
  declare type Client = $algoliasearch$Client;
  declare type ClientOptions = $algoliasearch$ClientOptions;
  declare type Index = $algoliasearch$Index;
  declare type Settings = $algoliasearch$Settings;
  declare module.exports: {
    (
      applicationID: string,
      apiKey: string,
      options?: ClientOptions
    ): Client;
  }
}

declare module 'algoliasearch/lite' {
  declare type Client = $algoliasearch$ClientLite;
  declare type ClientOptions = $algoliasearch$ClientOptions;
  declare type Index = $algoliasearch$IndexLite;
  declare type Settings = $algoliasearch$Settings;
  declare module.exports: {
    (
      applicationID: string,
      apiKey: string,
      options?: ClientOptions
    ): Client;
  }
}
