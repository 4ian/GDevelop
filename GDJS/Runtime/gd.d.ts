// Type definitions for gd.js
// Project: GDJS Platform of GDevelop
// Definitions by: arthuro555 <https://forum.gdevelop-app.com/u/arthuro555>

declare class Hashtable {
    public items: object;
    public constructor();
    public static newFrom(items:object) : Hashtable;
    public put(key:any, value:any) : void;
    public get(key:any) : any;
    public containsKey(key:any) : boolean;
    public remove(key:any) : void;
    public firstKey() : any;
    public keys(result:Array<any>) : void;
    public values(result:Array<any>) : void;
    public clear() : void;
}

interface Array<T> {
    remove(from: number) : void;
    createFrom(arr: Array<any>) : void;
}

declare namespace gdjs {
    // Register default types or types used in many GDJS files here, else extend this in the file specific definition file.
    namespace types {
        type Point = {
            x: number
            y: number
        }
        // Will change
        type RaycastTestResult = {
            collision: false
            closeX: number
            closeY: number
            closeSqDist: number
            farX: number
            farY: number
            farSqDist: number
        }
    }
    namespace evtTools {}
    let objectsTypes: Hashtable;
    let behaviorsTypes: Hashtable;
    let callbacksRuntimeSceneLoaded:Array<any>;
    let callbacksRuntimeSceneUnloaded:Array<any>;
    let callbacksRuntimeScenePaused:Array<any>;
    let callbacksRuntimeSceneResumed:Array<any>;
    let callbacksObjectDeletedFromScene:Array<any>;

    function rgbToHex(r: number, g: number, b: number) : string;
    function rgbToHexNumber(r: number, g: number, b: number) : number;
    function random(max: number) : number;
    function randomInRange(min:number, max: number) : number;
    function randomFloat(max: number) : number;
    function randomFloatInRange(min:number, max: number) : number;
    function randomWithStep(min:number, max: number, step:number) : number;
    function toRad(angleInDegrees:number) : number;
    function toDegrees(angleInRadians:number) : number;
    function registerObjects() : void;
    function registerBehaviors() : void;
    function getObjectConstructor(name: string) : any;
    function getBehaviorConstructor(name: string) : any;
    function staticArray(owner: any) : Array<any>;
    function staticArray2(owner: any) : Array<any>;
    function staticObject(owner: any) : object;
    function objectsListsToArray(objectsLists: { values: (arg0: any[]) => void; }) : Array<any>;
}