/*
 * GDevelop JS Platform
 * Copyright 2013-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

 /**
 * @namespace gdjs
 */
var gdjs = gdjs || {
    objectsTypes:new Hashtable(),
    automatismsTypes:new Hashtable(),
    evtTools:{},
    callbacksRuntimeSceneLoaded: [],
    callbacksRuntimeSceneUnloaded: [],
    callbacksObjectDeletedFromScene: []
};

/**
 * Convert a rgb color value to a hex value.
 * @note No "#" or "0x" are added.
 * @static
 */
gdjs.rgbToHex = function(r, g, b) {
    return "" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};

/**
 * Get a random integer between 0 and max.
 * @method random
 * @static
 */
gdjs.random = function(max) {
    if ( max <= 0 ) return 0;
    return Math.floor((Math.random()*(max+1)));
};

/**
 * Convert an angle in degrees to radians.
 * @method toRad
 * @static
 */
gdjs.toRad = function(angleInDegrees) {
    return angleInDegrees/180*3.14159;
};

/**
 * Convert an angle in radians to degrees.
 * @method toDegrees
 * @static
 */
gdjs.toDegrees = function(angleInRadians) {
    return angleInRadians*180/3.14159;
};

/**
 * Get the height of the document ( or of the viewport ) displayed in browser
 * @method getDocHeight
 * @static
 */
gdjs.getDocHeight = function() {
    //Nice snippet from http://james.padolsey.com/javascript/get-document-height-cross-browser/
    var D = document;
    return Math.max(
        D.body.scrollHeight, D.documentElement.scrollHeight,
        D.body.offsetHeight, D.documentElement.offsetHeight,
        D.body.clientHeight, D.documentElement.clientHeight
    );
};

/**
 * Get the width of the document ( or of the viewport ) displayed in browser
 * @method getDocWidth
 * @static
 */
gdjs.getDocWidth = function() {
    var D = document;
    return Math.max(
        D.body.scrollWidth, D.documentElement.scrollWidth,
        D.body.offsetWidth, D.documentElement.offsetWidth,
        D.body.clientWidth, D.documentElement.clientWidth
    );
};

/**
 * Iterate over an array: func is called on each member of the array.<br>
 * <br>
 * Note that func must not remove elements from the array. If func
 * return false, the iteration will stop.
 * @method iterateOverArray
 * @static
 */
gdjs.iterateOverArray = function(array, func) {
    if ( array === undefined || array.length === undefined || array.length === null ) {
        console.error("gdjs.iterateOverArray called with something which is not an array.");
        return;
    }

    for(var i = 0, len = array.length;i<len;++i) {
        if (func(array[i]) === false) return;
    }
};

/**
 * Register the runtime objects that can be used in runtimeScene.<br>
 * Objects must be part of gdjs and have their property "thisIsARuntimeObjectConstructor"
 * defined and set to the name of the type of the object so as to be recognized.
 * The name of the type of the object must be complete, with the namespace if any. For
 * example, if you are providing a Text object in the TextObject extension, the full name
 * of the type of the object is "TextObject::Text".
 *
 * @method registerObjects
 * @static
 */
gdjs.registerObjects = function() {
    gdjs.objectsTypes.clear();

    for (var p in this) {
        if (this.hasOwnProperty(p)) {
            if ( gdjs[p].thisIsARuntimeObjectConstructor != undefined) {
                gdjs.objectsTypes.put(gdjs[p].thisIsARuntimeObjectConstructor, gdjs[p]);
            }
        }
    }
};

/**
 * Register the runtime automatisms that can be used bt runtimeObject.<br>
 * Automatisms must be part of gdjs and have their property "thisIsARuntimeAutomatismConstructor"
 * defined and set to the name of the type of the automatism so as to be recognized.
 * The name of the type of the automatism must be complete, with the namespace if any. For
 * example, if you are providing a Draggable automatism in the DraggableAutomatism extension,
 * the full name of the type of the automatism is "DraggableAutomatism::Draggable".
 *
 * @method registerAutomatisms
 * @static
 */
gdjs.registerAutomatisms = function() {
    gdjs.automatismsTypes.clear();

    for (var p in this) {
        if (this.hasOwnProperty(p)) {
            if ( gdjs[p].thisIsARuntimeAutomatismConstructor != undefined) {
                gdjs.automatismsTypes.put(gdjs[p].thisIsARuntimeAutomatismConstructor, gdjs[p]);
            }
        }
    }
};

/**
 * Register the callbacks that will be called when a runtimeScene is loaded/unloaded or
 * when an object is deleted from a scene.<br>
 * Callbacks must be called respectively gdjsCallbackRuntimeSceneLoaded, gdjsCallbackRuntimeSceneUnloaded
 * or gdjsCallbackObjectDeletedFromScene and be part of a (nested) child object of gdjs.<br>
 * Arguments passed to the function are the runtimeScene and the object if applicable.
 *
 * @method registerGlobalCallbacks
 * @static
 */
gdjs.registerGlobalCallbacks = function() {
    gdjs.callbacksRuntimeSceneLoaded = [];
    gdjs.callbacksRuntimeSceneUnloaded = [];
    gdjs.callbacksObjectDeletedFromScene = [];

    var totalprop = 0;

    innerRegisterGlobalCallbacks = function (obj, nestLevel) {

        for (var p in obj) {
            if (obj.hasOwnProperty(p) && obj[p] !== null &&
                Object.prototype.toString.call( obj[p] ) !== '[object Array]' && typeof obj === "object") {
                totalprop++;
                if ( obj[p].gdjsCallbackRuntimeSceneLoaded !== undefined) {
                    gdjs.callbacksRuntimeSceneLoaded.push(obj[p].gdjsCallbackRuntimeSceneLoaded);
                }
                if ( obj[p].gdjsCallbackRuntimeSceneUnloaded !== undefined) {
                    gdjs.callbacksRuntimeSceneUnloaded.push(obj[p].gdjsCallbackRuntimeSceneUnloaded);
                }
                if ( obj[p].gdjsCallbackObjectDeletedFromScene !== undefined) {
                    gdjs.callbacksObjectDeletedFromScene.push(obj[p].gdjsCallbackObjectDeletedFromScene);
                }

                if ( nestLevel <= 1 )
                    innerRegisterGlobalCallbacks(obj[p], nestLevel+1);
            }
        }
    };

    innerRegisterGlobalCallbacks(this, 0);
};

/**
 * Get the constructor of an object.
 *
 * @method getObjectConstructor
 * @static
 * @param name {String} The name of the type of the object.
 */
gdjs.getObjectConstructor = function(name) {
    if ( name !== undefined && gdjs.objectsTypes.containsKey(name) )
        return gdjs.objectsTypes.get(name);

    console.warn("Object type \""+name+"\" was not found.");
    return gdjs.objectsTypes.get(""); //Create a base empty runtime object.
};

/**
 * Get the constructor of an automatism.
 *
 * @method getAutomatismConstructor
 * @static
 * @param name {String} The name of the type of the automatism.
 */
gdjs.getAutomatismConstructor = function(name) {
    if ( name !== undefined && gdjs.automatismsTypes.containsKey(name) )
        return gdjs.automatismsTypes.get(name);

    console.warn("Automatism type \""+name+"\" was not found.");
    return gdjs.automatismsTypes.get(""); //Create a base empty runtime automatism.
};

Array.prototype.remove = function(from) {
    //Adapted from the nice article available at
    //https://www.scirra.com/blog/76/how-to-write-low-garbage-real-time-javascript
    for (var i = from, len = this.length - 1; i < len; i++)
        this[i] = this[i + 1];

    this.length = len;
};

Array.prototype.createFrom = function(arr) {
    var len = arr.length;
    if ( len !== undefined ) {
        this.length = len;
        for (var i = 0; i < len;++i) {
            this[i] = arr[i];
        }
    }
};
