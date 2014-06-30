/**
Game Develop - LinkedObjects Extension
Copyright (c) 2013-2014 Florian Rival (Florian.Rival@gmail.com)
 */

/**
 * Manages the links between objects.
 *
 * @namespace gdjs
 * @class LinksManager
 * @constructor
 */
gdjs.LinksManager = function()
{
	this.links = {};
};

gdjs.LinksManager.prototype.getObjectsLinkedWith = function(objA) {
	if ( !this.links.hasOwnProperty(objA.id) )
		this.links[objA.id] = [];

	return this.links[objA.id];
};

gdjs.LinksManager.prototype.linkObjects = function(objA, objB) {
	var objALinkedObjects = this.getObjectsLinkedWith(objA);
	if ( objALinkedObjects.indexOf(objB) === -1 )
		objALinkedObjects.push(objB);

	var objBLinkedObjects = this.getObjectsLinkedWith(objB);
	if ( objBLinkedObjects.indexOf(objA) === -1 )
		objBLinkedObjects.push(objA);
};

gdjs.LinksManager.prototype.removeAllLinksOf = function(obj) {
	var objLinkedObjects = this.getObjectsLinkedWith(obj);
	for (var i = 0; i < objLinkedObjects.length; i++) {
		if ( this.links.hasOwnProperty(objLinkedObjects[i].id) ) {
			var otherObjList = this.links[objLinkedObjects[i].id];
			var index = otherObjList.indexOf(obj);
			if ( index !== -1) otherObjList.remove(index);
		}
	}

	if ( this.links.hasOwnProperty(obj.id) )
		delete this.links[obj.id];
};

gdjs.LinksManager.prototype.removeLinkBetween = function(objA, objB) {
	var list, index;

	if ( this.links.hasOwnProperty(objA.id) ) {
		list = this.links[objA.id];
		index = list.indexOf(objB);
		if ( index !== -1) list.remove(index);
	}

	if ( this.links.hasOwnProperty(objB.id) ) {
		list = this.links[objB.id];
		index = list.indexOf(objA);
		if ( index !== -1) list.remove(index);
	}
};

/**
 * @namespace gdjs.evtTools
 * @class linkedObjects
 * @static
 * @private
 */
gdjs.evtTools.linkedObjects = gdjs.evtTools.linkedObjects || {managers: new Hashtable()};

gdjs.evtTools.linkedObjects.gdjsCallbackRuntimeSceneLoaded = function(runtimeScene) {
	gdjs.evtTools.linkedObjects.managers.put(runtimeScene.getName(), new gdjs.LinksManager());
};

gdjs.evtTools.linkedObjects.gdjsCallbackObjectDeletedFromScene = function(runtimeScene, obj) {
	gdjs.evtTools.linkedObjects.managers.get(runtimeScene.getName()).removeAllLinksOf(obj);
};

gdjs.evtTools.linkedObjects.linkObjects = function(runtimeScene, objA, objB) {
	if (objA === null || objB === null) return;

	gdjs.evtTools.linkedObjects.managers.get(runtimeScene.getName()).linkObjects(objA, objB);
};

gdjs.evtTools.linkedObjects.removeLinkBetween = function(runtimeScene, objA, objB) {
	if (objA === null || objB === null) return;

	gdjs.evtTools.linkedObjects.managers.get(runtimeScene.getName()).removeLinkBetween(objA, objB);
};

gdjs.evtTools.linkedObjects.removeAllLinksOf = function(runtimeScene, objA) {
	if (objA === null) return;

	gdjs.evtTools.linkedObjects.managers.get(runtimeScene.getName()).removeAllLinksOf(objA);
};

gdjs.evtTools.linkedObjects.pickObjectsLinkedTo = function(runtimeScene, objectsLists, obj) {

	if (obj === null) return false;
    var isTrue = false;
    var objectsValues = objectsLists.values();

    for(var i = 0, leni = objectsValues.length;i<leni;++i) {
        var arr = objectsValues[i];
        for(var k = 0, lenk = arr.length;k<lenk;++k) {
            arr[k].pick = false;
        }
    }

    //Pick only linked objects
    var linkedObjects =
		gdjs.evtTools.linkedObjects.managers.get(runtimeScene.getName()).getObjectsLinkedWith(obj);
    for(var i = 0, leni = objectsValues.length;i<leni;++i) {
        var arr = objectsValues[i];

        for(var k = 0, lenk = arr.length;k<lenk;++k) {
            if ( linkedObjects.indexOf(arr[k]) !== -1 ) { //The current object is linked to obj.
				isTrue = true;
                arr[k].pick = true; //Pick the objects
            }
        }
    }

    //Trim not picked objects from arrays.
    for(var i = 0, leni = objectsValues.length;i<leni;++i) {
        var arr = objectsValues[i];
        var finalSize = 0;

        for(var k = 0, lenk = arr.length;k<lenk;++k) {
            var obj = arr[k];
            if ( arr[k].pick ) {
                arr[finalSize] = obj;
                finalSize++;
            }
        }
        arr.length = finalSize;
    }

    return isTrue;
};
