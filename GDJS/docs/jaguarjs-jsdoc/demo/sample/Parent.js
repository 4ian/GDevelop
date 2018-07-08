/**
 * Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod
tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam
 * @class
 */
var Parent = function () {
};

Parent.prototype = /** @lends Parent.prototype */{
    /**
     * cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidata
     * @property {String}
     */
    testProperty: '',

    /**
     * Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod
     * @param {String|String[]} [paramA=Default Value] tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam
     * @param {namespace.Car} [paramB] quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
     * @param {Function} [paramCallback]
     * @param {String} paramCallback.firstParam
     * @param {String} paramCallback.secondParam
     * @return {Array|Object} Return value as non-object type. (or an object without properties)
     */
    testMethod: function (paramA, paramB, paramCallback) {
        return {};
    },

    /**
     * This method will return object value.
     * @return {Object} test returns object.
     * @return {Boolean} test.foo property description
     * @return {Number} test.bar optional property
     */
    testReturnValue: function () {
    },

    /**
     * @return Plain Text without type definition
     */
    testReturnPlainText: function () {
    },

    /**
     * @example
     * <caption>JSDoc3 Captions</caption>
     * var a = 0;
     * 
     * for (var i = 0; i < 10; i++) {
     *     a++;
     * }
     * 
     * @example
     * jaguarjs-doc uses markdown style.
     * 
     * ```
     * var a = 0;
     * 
     * for (var i = 0; i < 10; i++) {
     *     a++;
     * }
     * ```
     */
    testExample: function () {
    }
};