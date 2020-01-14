// Type definitions for objecttools.js
// Project: GDJS Platform of GDevelop
// Definitions by: arthuro555 <https://forum.gdevelop-app.com/u/arthuro555>

declare namespace gdjs {
    namespace evtTools {
        namespace object {
            function pickOnly(objectList: Hashtable, runtimeObject: RuntimeObject) : void;
            function twoListsTest(predicate: (objectLists1: RuntimeObject, objectLists2: RuntimeObject, extraArg: any) => boolean, objectsLists1: Hashtable, objectsLists2: Hashtable, inverted: boolean, extraArg: any) : boolean;
            function pickObjectsIf(predicate: (object: RuntimeObject, extraArg: any) => boolean, objectsLists: Hashtable, negatePredicate: boolean, extraArg: any) : boolean;
            function hitBoxesCollisionTest(objectsLists1: Hashtable, objectsLists2: Hashtable, inverted: boolean, runtimeScene: any, ignoreTouchingEdges: boolean) : boolean;
            function _distanceBetweenObjects(object1: RuntimeObject, object2: RuntimeObject, distance: number) : boolean;
            function distanceTest(objectsLists1: Hashtable, objectsLists2: Hashtable, distance: number, inverted: boolean) : boolean;
            function _movesToward(object1: RuntimeObject, object2: RuntimeObject, tolerance: number) : boolean;
            function movesTowardTest(object1: RuntimeObject, object2: RuntimeObject, tolerance: number, inverted: boolean) : boolean;
            function _turnedToward(object1: RuntimeObject, object2: RuntimeObject, tolerance: number) : boolean;
            function turnedTowardTest(object1: RuntimeObject, object2: RuntimeObject, tolerance: number, inverted: boolean) : boolean;
            function pickAllObjects(objectsContext: any, objectsLists: Hashtable) : void; // objectsContext = (RuntimeScene | type eventFunctionContext)
            function pickRandomObject(runtimeScene: any, objectsLists: Hashtable) : boolean; //TODO RuntimeScene
            function pickNearestObject(objectsLists: Hashtable, x: number, y: number, inverted: boolean) : boolean;
            function raycastObject(objectsLists: Hashtable, x: number, y: number, angle: number, dist: number, varX: number, varY: number, inverted: boolean) : boolean;
            function doCreateObjectOnScene(objectsContext: any, objectName: string, objectsLists: Hashtable, x: number, y: number, layer: string) : void; // objectsContext = (RuntimeScene | type eventFunctionContext)
            function createObjectOnScene(objectsContext: any, objectsLists: Hashtable, x: number, y: number, layer: string) : void;
            function createObjectFromGroupOnScene(objectsContext: any, objectsLists: Hashtable, x: number, y: number, layer: string) : void;
            function pickedObjectsCount(objectsLists: Hashtable) : number;
        }
    }
}