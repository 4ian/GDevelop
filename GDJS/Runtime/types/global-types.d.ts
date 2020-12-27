/*
 * GDevelop JS Platform
 * Copyright 2013-present Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

/** An integer. Use this instead of `number` to ease future optimizations. */
declare type integer = number;

/** A floating point number. Use this instead of `number` to ease future optimizations. */
declare type float = number;

/** The global cc object from Cocos2D-Js. */
declare var cc: any;
// TODO: Convert global-types.js to this definition file, then remove the old file.
