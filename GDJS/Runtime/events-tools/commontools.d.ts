// Type definitions for commontools.js
// Project: GDJS Platform of GDevelop
// Definitions by: arthuro555 <https://forum.gdevelop-app.com/u/arthuro555>

declare namespace gdjs {
    namespace evtTools {
        namespace common {
            function getVariableNumber(variable: any) : number; //TODO Variable
            function getVariableString(variable: any) : string; //TODO Variable
            function sceneVariableExists(runtimeScene: any, variableName: string) : boolean; //TODO RuntimeScene
            function globalVariableExists(runtimeScene: any, variableName: string) : boolean; //TODO RuntimeScene
            function variableChildExists(variable: any, childName: string) : boolean; //TODO Variable
            function variableRemoveChild(variable: any, childName: string) : void; //TODO Variable
            function variableClearChildren(variable: any) : void; //TODO Variable
            function getVariableChildCount(variable: any) : number; //TODO Variable
            function toNumber(str: string) : number;
            function toString(num: number) : string;
            function logicalNegation(bool: boolean) : boolean;
            function clamp(x: number, min: number, max: number) : number;
            function acosh(num: number) : number;
            function asinh(num: number) : number;
            function atanh(num: number) : number;
            function cosh(num: number) : number;
            function sinh(num: number) : number;
            function tanh(num: number) : number;
            function cot(num: number) : number;
            function csc(num: number) : number;
            function sec(num: number) : number;
            function log10(num: number) : number;
            function log2(num: number) : number;
            function sign(num: number) : number;
            function cbrt(num: number) : number;
            function nthroot(num: number) : number;
            function mod(x: number, y: number) : number;
            function angleDifference(num: number) : number;
            function lerp(num: number) : number;
            function trunc(angle1: number, angle2: number) : number;
        }
    }
}