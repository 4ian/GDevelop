// @flow

/**
 * Cache class to store and manage event sheet widths for different tabs
 * Uses static methods and properties to maintain a single cache instance
 */
export default class EventsSheetWidthCache {
  // Cache for total width of each tab
  static _widthCache: { [string]: number } = {};

  // Default width to use when no cached width is available
  static _defaultWidth: number = 0;

  // Cache for conditions column width of each tab
  static _conditionsWidthCache: { [string]: number } = {};

  // Cache for actions column width of each tab
  static _actionsWidthCache: { [string]: number } = {};

  /**
   * Store the total width for a specific tab
   */
  static setWidth(tabId: string, width: number) {
    this._widthCache[tabId] = width;
  }

  /**
   * Get the total width for a specific tab
   */
  static getWidth(tabId: string): number {
    return this._widthCache[tabId] || this._defaultWidth;
  }

  /**
   * Set the default width to use when no cached width is available
   */
  static setDefaultWidth(width: number) {
    this._defaultWidth = width;
  }

  /**
   * Store the conditions column width for a specific tab
   */
  static setConditionsWidth(tabId: string, width: number) {
    this._conditionsWidthCache[tabId] = width;
  }

  /**
   * Get the conditions column width for a specific tab
   */
  static getConditionsWidth(tabId: string): number {
    return this._conditionsWidthCache[tabId] || 0;
  }

  /**
   * Store the actions column width for a specific tab
   */
  static setActionsWidth(tabId: string, width: number) {
    this._actionsWidthCache[tabId] = width;
  }

  /**
   * Get the actions column width for a specific tab
   */
  static getActionsWidth(tabId: string): number {
    return this._actionsWidthCache[tabId] || 0;
  }

  /**
   * Clear all cached widths for all tabs
   * Used when the cache needs to be completely reset
   */
  static clearCache() {
    this._widthCache = {};
    this._conditionsWidthCache = {};
    this._actionsWidthCache = {};
  }

  /**
   * Clear cached widths for a specific tab
   */
  static clearTabCache(tabId: string) {
    delete this._widthCache[tabId];
    delete this._conditionsWidthCache[tabId];
    delete this._actionsWidthCache[tabId];
  }
}
