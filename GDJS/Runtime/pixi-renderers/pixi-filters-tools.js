// @ts-check
/**
 * Contains tools related to PIXI filters handling.
 */
gdjs.PixiFiltersTools = {};

gdjs.PixiFiltersTools.clampValue = function(value, min, max) { return Math.max(min, Math.min(max, value)); };
gdjs.PixiFiltersTools.clampKernelSize = function(value) { return (([5, 7, 9, 11, 13, 15].indexOf(value) !== -1) ? value : 5); };

/** Object.<string, gdjsPixiFiltersToolsFilterCreator> */
gdjs.PixiFiltersTools._filterCreators = {};

/**
 * Enable an effect.
 * @param {gdjsPixiFiltersToolsFilter} filter The filter to enable or disable
 * @param {boolean} value Set to true to enable, false to disable
 */
gdjs.PixiFiltersTools.enableEffect = function(filter, value) {
    filter.pixiFilter.enabled = value;
}

/**
 * Check if an effect is enabled.
 * @param {gdjsPixiFiltersToolsFilter} filter The filter to be checked
 * @return {boolean} true if the filter is enabled
 */
gdjs.PixiFiltersTools.isEffectEnabled = function(filter) {
    return filter.pixiFilter.enabled;
}

/**
 * Return the creator for the filter with the given name, if any.
 * @param {string} filterName The name of the filter to get
 * @return {?gdjsPixiFiltersToolsFilterCreator} The filter creator, if any (null otherwise).
 */
gdjs.PixiFiltersTools.getFilterCreator = function(filterName) {
    if (gdjs.PixiFiltersTools._filterCreators.hasOwnProperty(filterName))
        return gdjs.PixiFiltersTools._filterCreators[filterName];

    return null;
}

/**
 * Register a new PIXI filter creator, to be used by GDJS.
 * @param {string} filterName The name of the filter to get
 * @param {gdjsPixiFiltersToolsFilterCreator} filterCreator The object used to create the filter.
 */
gdjs.PixiFiltersTools.registerFilterCreator = function(filterName, filterCreator) {
    if (gdjs.PixiFiltersTools._filterCreators.hasOwnProperty(filterName))
        console.warn("Filter \"" + filterName + "\" was already registered in gdjs.PixiFiltersTools. Replacing it with the new one.");

    gdjs.PixiFiltersTools._filterCreators[filterName] = filterCreator;
}

// Type definitions:

/**
 * A wrapper allowing to create a PIXI filter and update it using a common interface
 * @typedef gdjsPixiFiltersToolsFilterCreator
 * @type {object}
 * @property {(layer: gdjs.Layer, effectData: any) => any} makePIXIFilter Function to call to create the filter
 * @property {(filter: any, layer: gdjs.Layer) => any} update The function to be called to update the filter at every frame
 * @property {(filter: any, parameterName: string, value: number) => void} updateDoubleParameter The function to be called to update a parameter (with a number)
 * @property {(filter: any, parameterName: string, value: string) => void} updateStringParameter The function to be called to update a parameter (with a string)
 * @property {(filter: any, parameterName: string, value: boolean) => void} updateBooleanParameter The function to be called to update a parameter (with a boolean)
 */

/**
 * The type of a filter used to manipulate a Pixi filter.
 * @typedef gdjsPixiFiltersToolsFilter
 * @type {object}
 * @property {any} pixiFilter The PIXI filter
 * @property {(filter: any, layer: gdjs.Layer) => any} update The function to be called to update the filter at every frame
 * @property {(filter: any, parameterName: string, value: number) => void} updateDoubleParameter The function to be called to update a parameter (with a number)
 * @property {(filter: any, parameterName: string, value: string) => void} updateStringParameter The function to be called to update a parameter (with a string)
 * @property {(filter: any, parameterName: string, value: boolean) => void} updateBooleanParameter The function to be called to update a parameter (with a boolean)
 */
