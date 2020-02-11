/**
GDevelop - LinkedObjects Extension
Copyright (c) 2013-2016 Florian Rival (Florian.Rival@gmail.com)
 */

/**
 * Manages the links between objects.
 *
 * @memberof gdjs
 * @class LinksManager
 * @constructor
 */
gdjs.LinksManager = function()
{
	this.links = {};
};

/**
 * Get the links manager of a scene.
 */
gdjs.LinksManager.getManager = function(runtimeScene) {
    if (!runtimeScene.linkedObjectsManager) { //Create the shared manager if necessary.
        runtimeScene.linkedObjectsManager = new gdjs.LinksManager();
    }

    return runtimeScene.linkedObjectsManager;
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
 * @memberof gdjs.evtTools
 * @class linkedObjects
 * @static
 * @private
 */
gdjs.evtTools.linkedObjects = {};

gdjs.registerObjectDeletedFromSceneCallback(function(runtimeScene, obj) {
	gdjs.LinksManager.getManager(runtimeScene).removeAllLinksOf(obj);
});

gdjs.evtTools.linkedObjects.linkObjects = function(runtimeScene, objA, objB) {
	if (objA === null || objB === null) return;

	gdjs.LinksManager.getManager(runtimeScene).linkObjects(objA, objB);
};

gdjs.evtTools.linkedObjects.removeLinkBetween = function(runtimeScene, objA, objB) {
	if (objA === null || objB === null) return;

	gdjs.LinksManager.getManager(runtimeScene).removeLinkBetween(objA, objB);
};

gdjs.evtTools.linkedObjects.removeAllLinksOf = function(runtimeScene, objA) {
	if (objA === null) return;

	gdjs.LinksManager.getManager(runtimeScene).removeAllLinksOf(objA);
};

gdjs.evtTools.linkedObjects._objectIsInList = function(obj, linkedObjects) {
	return linkedObjects.indexOf(obj) !== -1;
}

gdjs.evtTools.linkedObjects.pickObjectsLinkedTo = function(runtimeScene, objectsLists, obj) {
	if (obj === null) return false;
    var linkedObjects =
		gdjs.LinksManager.getManager(runtimeScene).getObjectsLinkedWith(obj);

	return gdjs.evtTools.object.pickObjectsIf(gdjs.evtTools.linkedObjects._objectIsInList,
		objectsLists, false, linkedObjects);
};
