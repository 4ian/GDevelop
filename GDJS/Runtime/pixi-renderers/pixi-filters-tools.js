// @ts-check
/**
 * Contains tools related to PIXI filters handling.
 */
gdjs.PixiFiltersTools = {};

gdjs.PixiFiltersTools.clampValue = function (value, min, max) {
  return Math.max(min, Math.min(max, value));
};
gdjs.PixiFiltersTools.clampKernelSize = function (value, min, max) {
  var len = Math.round((max - min) / 2 + 1);
  var arr = new Array(len);
  for (var i = 0; i < len; i++) {
    arr[i] = min + 2 * i;
  }
  return arr.indexOf(value) !== -1 ? value : min;
};

/** Object.<string, gdjsPixiFiltersToolsFilterCreator> */
gdjs.PixiFiltersTools._filterCreators = {};

/**
 * Enable an effect.
 * @param {gdjsPixiFiltersToolsFilter} filter The filter to enable or disable
 * @param {boolean} value Set to true to enable, false to disable
 */
gdjs.PixiFiltersTools.enableEffect = function (filter, value) {
  filter.pixiFilter.enabled = value;
};

/**
 * Check if an effect is enabled.
 * @param {gdjsPixiFiltersToolsFilter} filter The filter to be checked
 * @return {boolean} true if the filter is enabled
 */
gdjs.PixiFiltersTools.isEffectEnabled = function (filter) {
  return filter.pixiFilter.enabled;
};

/**
 * Return the creator for the filter with the given name, if any.
 * @param {string} filterName The name of the filter to get
 * @return {?gdjsPixiFiltersToolsFilterCreator} The filter creator, if any (null otherwise).
 */
gdjs.PixiFiltersTools.getFilterCreator = function (filterName) {
  if (gdjs.PixiFiltersTools._filterCreators.hasOwnProperty(filterName))
    return gdjs.PixiFiltersTools._filterCreators[filterName];

  return null;
};

/**
 * Register a new PIXI filter creator, to be used by GDJS.
 * @param {string} filterName The name of the filter to get
 * @param {gdjsPixiFiltersToolsFilterCreator} filterCreator The object used to create the filter.
 */
gdjs.PixiFiltersTools.registerFilterCreator = function (
  filterName,
  filterCreator
) {
  if (gdjs.PixiFiltersTools._filterCreators.hasOwnProperty(filterName))
    console.warn(
      'Filter "' +
        filterName +
        '" was already registered in gdjs.PixiFiltersTools. Replacing it with the new one.'
    );

  gdjs.PixiFiltersTools._filterCreators[filterName] = filterCreator;
};

/**
 * Convert a string RGB color ("rrr;ggg;bbb") or a hex string (#rrggbb) to a hex number.
 * @param {string} value The color as a RGB string or hex string
 * @returns {number}
 */
gdjs.PixiFiltersTools.rgbOrHexToHexNumber = function (value) {
  var splitValue = value.split(';');
  if (splitValue.length === 3) {
    return gdjs.rgbToHexNumber(
      parseInt(splitValue[0], 0),
      parseInt(splitValue[1], 0),
      parseInt(splitValue[2], 0)
    );
  }

  return parseInt(value.replace('#', '0x'), 16);
};

// Type definitions:

/**
 * Function to call to create the PIXI filter used at runtime
 * @callback gdjsPixiFiltersToolsFilterCreatorMakePIXIFilter
 * @param {gdjs.Layer} layer
 * @param {Object} effectData
 * @returns {Object}
 */

/**
 * The function to be called to update the filter at every frame
 * @callback gdjsPixiFiltersToolsUpdate
 * @param {Object} filter
 * @param {gdjs.Layer} layer
 * @returns {Object}
 */

/**
 * The function to be called to update a parameter (with a number)
 * @callback gdjsPixiFiltersToolsUpdateDoubleParameter
 * @param {Object} filter
 * @param {string} parameterName
 * @param {number} value
 * @returns {void}
 */

/**
 * The function to be called to update a parameter (with a string)
 * @callback gdjsPixiFiltersToolsUpdateStringParameter
 * @param {Object} filter
 * @param {string} parameterName
 * @param {string} value
 * @returns {void}
 */

/**
 * The function to be called to update a parameter (with a boolean)
 * @callback gdjsPixiFiltersToolsUpdateBooleanParameter
 * @param {Object} filter
 * @param {string} parameterName
 * @param {boolean} value
 * @returns {void}
 */

/**
 * A wrapper allowing to create a PIXI filter and update it using a common interface
 * @typedef gdjsPixiFiltersToolsFilterCreator
 * @type {Object}
 * @property {gdjsPixiFiltersToolsFilterCreatorMakePIXIFilter} makePIXIFilter Function to call to create the filter
 * @property {gdjsPixiFiltersToolsUpdate} update The function to be called to update the filter at every frame
 * @property {gdjsPixiFiltersToolsUpdateDoubleParameter} updateDoubleParameter The function to be called to update a parameter (with a number)
 * @property {gdjsPixiFiltersToolsUpdateStringParameter} updateStringParameter The function to be called to update a parameter (with a string)
 * @property {gdjsPixiFiltersToolsUpdateBooleanParameter} updateBooleanParameter The function to be called to update a parameter (with a boolean)
 */

/**
 * The type of a filter used to manipulate a Pixi filter.
 * @typedef gdjsPixiFiltersToolsFilter
 * @type {Object}
 * @property {any} pixiFilter The PIXI filter
 * @property {gdjsPixiFiltersToolsUpdate} update The function to be called to update the filter at every frame
 * @property {gdjsPixiFiltersToolsUpdateDoubleParameter} updateDoubleParameter The function to be called to update a parameter (with a number)
 * @property {gdjsPixiFiltersToolsUpdateStringParameter} updateStringParameter The function to be called to update a parameter (with a string)
 * @property {gdjsPixiFiltersToolsUpdateBooleanParameter} updateBooleanParameter The function to be called to update a parameter (with a boolean)
 */
