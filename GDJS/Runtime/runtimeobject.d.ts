// Type definitions for runtimeobject.js
// Project: GDJS Platform of GDevelop
// Definitions by: arthuro555 <https://forum.gdevelop-app.com/u/arthuro555>

declare namespace gdjs {
    namespace types{
        namespace GD_Data {
            type ObjectData = {
                name: string
                type: string
                variables: Array<any> //TODO VariableData
                behaviors: Array<any> //TODO BehaviorData
            }
        }
        type AABB = {
            min: Array<number>
            max: Array<number>
        }
    }

    class RuntimeObject {
        public name: string;
        public type: string;
        public x: number;
        public y: number;
        public angle: number;
        public zOrder: number;
        public hidden: boolean;
        public layer: string;
        public livingOnScene: boolean;
        public id: number;
        // Hit boxes:
        public hitBoxes: Array<any>; //TODO <T>:Polygon
        public hitBoxesDirty: boolean;
        public aabb: types.AABB;

        // protected (protection breaks TS but still declared apart)
        public _nameId: number;
        public _runtimeScene: any;
        public _defaultHitBoxes: Array<any>; //TODO <T>:Polygon
        public _variables: any; //TODO VariablesContainer
        public _forces: Array<any>; //TODO <T>:Force
        public _averageForce: any; //TODO Force
        public _behaviors: Array<any>; //TODO RuntimeBehavior
        public _behaviorsTable: Hashtable;
        public _timers: Hashtable;

        public constructor(runtimeScene: any, objectData: types.GD_Data.ObjectData) //TODO RuntimeScene

        public onCreated() : void;
        public getElapsedTime(runtimeScene: any) : number; //TODO RuntimeScene
        public update(runtimeScene: any) : void; //TODO RuntimeScene
        public extraInitializationFromInitialInstance(initialInstanceData: object) : void;
        public deleteFromScene(runtimeScene: any) : void; //TODO RuntimeScene
        public onDestroyFromScene(runtimeScene: any) : void; //TODO RuntimeScene
        public getRendererObject() : any;
        public getName() : string;
        public getNameId() : number;
        public getUniqueId() : number;
        public setPosition(x: number, y: number) : void;
        public setX(x: number) : void;
        public getX() : number;
        public setY(y: number) : void;
        public getY() : number;
        public getDrawableX() : number;
        public getDrawableY() : number;
        public rotateTowardPosition(x: number, y: number, speed: number, runtimeScene: any) : void; //TODO RuntimeScene
        public rotateTowardAngle(angle: number, speed: number, runtimeScene: any) : void; //TODO RuntimeScene
        public rotate(speed: number, runtimeScene: any) : void; //TODO RuntimeScene
        public setAngle(angle: number) : void;
        public getAngle() : number;
        public setLayer(layer: string) : void;
        public getLayer() : void;
        public isOnLayer(layer: string) : boolean;
        public setZOrder(z: number) : void;
        public getZOrder() : number;
        public getVariables() : any; //TODO VariablesContainer
        public getVariableNumber(variable: any) : number; //TODO Variable
        public returnVariable(variable: any) : any; //TODO Variable
        public getVariableString(variable: any) : string; //TODO Variable
        public setVariableNumber(variable: any, newValue: number) : void; //TODO Variable
        public setVariableString(variable: any, newValue: string) : void; //TODO Variable
        public variableChildExists(variable: any, childName: string) : boolean; //TODO Variable
        public variableRemoveChild(variable: any, childName: string) : void; //TODO Variable
        public variableClearChildren(variable: any) : void; //TODO Variable
        public hasVariable(name: string) : boolean;
        public hide(enable: boolean) : void;
        public isVisible() : boolean;
        public isHidden() : boolean;
        public getWidth() : number;
        public getHeight() : number;
        public getCenterX() : number;
        public getCenterY() : number;
        public addForce(x: number, y: number, multiplier: number) : void;
        public addPolarForce(angle: number, len: number, multiplier: number) : void;
        public addForceTowardPosition(x: number, y: number, len: number, multiplier: number) : void;
        public addForceTowardObject(object: RuntimeObject, len: number, multiplier: number) : void;
        public clearForces() : void;
        public hasNoForces() : boolean;
        public updateForces(elapsedTime: number) : void;
        public getAverageForce() : any; //TODO Force
        public averageForceAngleIs(angle: number, toleranceInDegrees: number) : boolean;
        public getHitBoxes() : any; //TODO Polygon
        public updateHitBoxes() : void;
        public getAABB() : types.AABB;
        public getVisibilityAABB() : types.AABB;
        public updateAABB() : void;
        public stepBehaviorsPreEvents() : void;
        public stepBehaviorsPostEvents() : void;
        public getBehavior(name: string) : any; //TODO RuntimeBehavior
        public hasBehavior(name: string) : boolean;
        public activateBehavior(name: string, status: boolean) : void;
        public behaviorActivated(name: string) : boolean;
        public updateTimers(elapsedTime: number) : void;
        public timerElapsedTime(timerName: string, elapsedTime: number) : boolean;
        public timerPaused(timerName: string) : boolean;
        public resetTimer(timerName: string) : void;
        public pauseTimer(timerName: string) : void;
        public unpauseTimer(timerName : string) : void;
        public removeTimer(timerName: string) : void
        public getTimerElapsedTimeInSeconds(timerName: string) : number;
        public separateFromObjects(objects: Array<RuntimeObject>, ignoreTouchingEdges: boolean) : boolean;
        public separateFromObjectsList(objectList: Hashtable, ignoreTouchingEdges: boolean) : boolean;
        public getDistanceToObject(otherObject: RuntimeObject) : number;
        public getSqDistanceToObject(otherObject: RuntimeObject) : number;
        public getSqDistanceTo(pointX: number, pointY: number) : number;
        public putAround(x: number, y: number, distance: number, angleInDegrees: number) : void;
        public putAroundObject(object: RuntimeObject, distance: number, angleInDegrees: number) : void;
        public separateObjectsWithoutForces(objectList: Array<RuntimeObject>) : void;
        public separateObjectsWithForces(objectsLists: Array<RuntimeObject>) : void;
        public raycastTest(x: number, y: number, endX: number, endY: number, closest: boolean) : types.RaycastTestResult //Will change
        public insideObject(x: number, y: number) : boolean;
        public cursorOnObject(runtimeScene: any) : boolean; //TODO RuntimeScene
        public isCollidingWithPoint(pointX: number, pointY: number) : boolean;

        // protected
        public _getRecycledForce(x: number, y: number, multiplier: number) : any; //TODO Force

        // Static

        public static _identifiers: Hashtable;
        public static _newId: number;
        public static forcesGarbage: Array<any>; //TODO Forces?
        public static thisIsARuntimeObjectConstructor: string;

        public static getVariableNumber(variable: any) : number; //TODO Variable
        public static returnVariable(variable: any) : any; //TODO Variable
        public static getVariableString(variable: any) : string; //TODO Variable
        public static getVariableChildCount(variable: any) : number; //TODO Variable
        public static setVariableNumber(variable: any, newValue: number) : void; //TODO Variable
        public static setVariableString(variable: any, newValue: string) : void; //TODO Variable
        public static variableChildExists(variable: any, childName: string) : boolean; //TODO Variable
        public static variableRemoveChild(variable: any, childName: string) : void; //TODO Variable
        public static variableClearChildren(variable: any) : void; //TODO Variable
        public static collisionTest(object1: RuntimeObject, object2: RuntimeObject, ignoreTouchingEdges: boolean) : boolean;
        public static distanceTest(object1: RuntimeObject, object2: RuntimeObject, distance: number) : boolean;
        public static getNameIdentifier(name:string) : number;
    }
}