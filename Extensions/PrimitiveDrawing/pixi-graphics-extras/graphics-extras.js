/*!
 * @pixi/graphics-extras - v6.0.0
 * Compiled Tue, 02 Mar 2021 21:45:03 UTC
 *
 * @pixi/graphics-extras is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 */
this.PIXI = this.PIXI || {};
(function (graphics, math) {
    'use strict';

    /**
     * Draw a torus shape, like a donut. Can be used for something like a circle loader.
     *
     * _Note: Only available with **@pixi/graphics-extras**._
     *
     * @instance
     * @memberof PIXI.Graphics
     * @method drawTorus
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} innerRadius - Inner circle radius
     * @param {number} outerRadius - Outer circle radius
     * @param {number} [startArc=0] - Where to begin sweep, in radians, 0.0 = to the right
     * @param {number} [endArc=Math.PI*2] - Where to end sweep, in radians
     * @return {PIXI.Graphics}
     */
    function drawTorus(x, y, innerRadius, outerRadius, startArc, endArc) {
        if (startArc === void 0) { startArc = 0; }
        if (endArc === void 0) { endArc = Math.PI * 2; }
        if (Math.abs(endArc - startArc) >= Math.PI * 2) {
            return this
                .drawCircle(x, y, outerRadius)
                .beginHole()
                .drawCircle(x, y, innerRadius)
                .endHole();
        }
        this.finishPoly();
        this
            .arc(x, y, innerRadius, endArc, startArc, true)
            .arc(x, y, outerRadius, startArc, endArc, false)
            .finishPoly();
        return this;
    }

    /**
     * Draw Rectangle with chamfer corners.
     *
     * _Note: Only available with **@pixi/graphics-extras**._
     *
     * @instance
     * @memberof PIXI.Graphics
     * @method drawChamferRect
     * @param {number} x - Upper left corner of rect
     * @param {number} y - Upper right corner of rect
     * @param {number} width - Width of rect
     * @param {number} height - Height of rect
     * @param {number} chamfer - accept negative or positive values
     * @return {PIXI.Graphics} Returns self.
     */
    function drawChamferRect(x, y, width, height, chamfer) {
        if (chamfer === 0) {
            return this.drawRect(x, y, width, height);
        }
        var maxChamfer = Math.min(width, height) / 2;
        var inset = Math.min(maxChamfer, Math.max(-maxChamfer, chamfer));
        var right = x + width;
        var bottom = y + height;
        var dir = inset < 0 ? -inset : 0;
        var size = Math.abs(inset);
        return this
            .moveTo(x, y + size)
            .arcTo(x + dir, y + dir, x + size, y, size)
            .lineTo(right - size, y)
            .arcTo(right - dir, y + dir, right, y + size, size)
            .lineTo(right, bottom - size)
            .arcTo(right - dir, bottom - dir, x + width - size, bottom, size)
            .lineTo(x + size, bottom)
            .arcTo(x + dir, bottom - dir, x, bottom - size, size)
            .closePath();
    }

    /**
     * Draw Rectangle with fillet corners.
     *
     * _Note: Only available with **@pixi/graphics-extras**._
     *
     * @instance
     * @memberof PIXI.Graphics
     * @method drawFilletRect
     * @param {number} x - Upper left corner of rect
     * @param {number} y - Upper right corner of rect
     * @param {number} width - Width of rect
     * @param {number} height - Height of rect
     * @param {number} fillet - non-zero real number, size of corner cutout
     * @return {PIXI.Graphics} Returns self.
     */
    function drawFilletRect(x, y, width, height, fillet) {
        if (fillet <= 0) {
            return this.drawRect(x, y, width, height);
        }
        var inset = Math.min(fillet, Math.min(width, height) / 2);
        var right = x + width;
        var bottom = y + height;
        var points = [
            x + inset, y,
            right - inset, y,
            right, y + inset,
            right, bottom - inset,
            right - inset, bottom,
            x + inset, bottom,
            x, bottom - inset,
            x, y + inset ];
        // Remove overlapping points
        for (var i = points.length - 1; i >= 2; i -= 2) {
            if (points[i] === points[i - 2] && points[i - 1] === points[i - 3]) {
                points.splice(i - 1, 2);
            }
        }
        return this.drawPolygon(points);
    }

    /**
     * Draw a regular polygon where all sides are the same length.
     *
     * _Note: Only available with **@pixi/graphics-extras**._
     *
     * @instance
     * @memberof PIXI.Graphics
     * @method drawRegularPolygon
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} radius - Polygon radius
     * @param {number} sides - Minimum value is 3
     * @param {number} rotation - Starting rotation values in radians..
     * @return {PIXI.Graphics}
     */
    function drawRegularPolygon(x, y, radius, sides, rotation) {
        if (rotation === void 0) { rotation = 0; }
        sides = Math.max(sides | 0, 3);
        var startAngle = (-1 * Math.PI / 2) + rotation;
        var delta = (Math.PI * 2) / sides;
        var polygon = [];
        for (var i = 0; i < sides; i++) {
            var angle = (i * delta) + startAngle;
            polygon.push(x + (radius * Math.cos(angle)), y + (radius * Math.sin(angle)));
        }
        return this.drawPolygon(polygon);
    }

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation. All rights reserved.
    Licensed under the Apache License, Version 2.0 (the "License"); you may not use
    this file except in compliance with the License. You may obtain a copy of the
    License at http://www.apache.org/licenses/LICENSE-2.0

    THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
    WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
    MERCHANTABLITY OR NON-INFRINGEMENT.

    See the Apache Version 2.0 License for specific language governing permissions
    and limitations under the License.
    ***************************************************************************** */
    /* global Reflect, Promise */

    var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) { if (b.hasOwnProperty(p)) { d[p] = b[p]; } } };
        return extendStatics(d, b);
    };

    function __extends(d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }

    var __assign = function() {
        __assign = Object.assign || function __assign(t) {
            var arguments$1 = arguments;

            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments$1[i];
                for (var p in s) { if (Object.prototype.hasOwnProperty.call(s, p)) { t[p] = s[p]; } }
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };

    function __rest(s, e) {
        var t = {};
        for (var p in s) { if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
            { t[p] = s[p]; } }
        if (s != null && typeof Object.getOwnPropertySymbols === "function")
            { for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) { if (e.indexOf(p[i]) < 0)
                { t[p[i]] = s[p[i]]; } } }
        return t;
    }

    function __decorate(decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") { r = Reflect.decorate(decorators, target, key, desc); }
        else { for (var i = decorators.length - 1; i >= 0; i--) { if (d = decorators[i]) { r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r; } } }
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    }

    function __param(paramIndex, decorator) {
        return function (target, key) { decorator(target, key, paramIndex); }
    }

    function __metadata(metadataKey, metadataValue) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") { return Reflect.metadata(metadataKey, metadataValue); }
    }

    function __awaiter(thisArg, _arguments, P, generator) {
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }

    function __generator(thisArg, body) {
        var _ = { label: 0, sent: function() { if (t[0] & 1) { throw t[1]; } return t[1]; }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f) { throw new TypeError("Generator is already executing."); }
            while (_) { try {
                if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) { return t; }
                if (y = 0, t) { op = [op[0] & 2, t.value]; }
                switch (op[0]) {
                    case 0: case 1: t = op; break;
                    case 4: _.label++; return { value: op[1], done: false };
                    case 5: _.label++; y = op[1]; op = [0]; continue;
                    case 7: op = _.ops.pop(); _.trys.pop(); continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                        if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                        if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                        if (t[2]) { _.ops.pop(); }
                        _.trys.pop(); continue;
                }
                op = body.call(thisArg, _);
            } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; } }
            if (op[0] & 5) { throw op[1]; } return { value: op[0] ? op[1] : void 0, done: true };
        }
    }

    function __exportStar(m, exports) {
        for (var p in m) { if (!exports.hasOwnProperty(p)) { exports[p] = m[p]; } }
    }

    function __values(o) {
        var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
        if (m) { return m.call(o); }
        return {
            next: function () {
                if (o && i >= o.length) { o = void 0; }
                return { value: o && o[i++], done: !o };
            }
        };
    }

    function __read(o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m) { return o; }
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done) { ar.push(r.value); }
        }
        catch (error) { e = { error: error }; }
        finally {
            try {
                if (r && !r.done && (m = i["return"])) { m.call(i); }
            }
            finally { if (e) { throw e.error; } }
        }
        return ar;
    }

    function __spread() {
        var arguments$1 = arguments;

        for (var ar = [], i = 0; i < arguments.length; i++)
            { ar = ar.concat(__read(arguments$1[i])); }
        return ar;
    }

    function __await(v) {
        return this instanceof __await ? (this.v = v, this) : new __await(v);
    }

    function __asyncGenerator(thisArg, _arguments, generator) {
        if (!Symbol.asyncIterator) { throw new TypeError("Symbol.asyncIterator is not defined."); }
        var g = generator.apply(thisArg, _arguments || []), i, q = [];
        return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
        function verb(n) { if (g[n]) { i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; } }
        function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
        function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
        function fulfill(value) { resume("next", value); }
        function reject(value) { resume("throw", value); }
        function settle(f, v) { if (f(v), q.shift(), q.length) { resume(q[0][0], q[0][1]); } }
    }

    function __asyncDelegator(o) {
        var i, p;
        return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
        function verb(n, f) { i[n] = o[n] ? function (v) { return (p = !p) ? { value: __await(o[n](v)), done: n === "return" } : f ? f(v) : v; } : f; }
    }

    function __asyncValues(o) {
        if (!Symbol.asyncIterator) { throw new TypeError("Symbol.asyncIterator is not defined."); }
        var m = o[Symbol.asyncIterator], i;
        return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
        function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
        function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
    }

    function __makeTemplateObject(cooked, raw) {
        if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
        return cooked;
    };

    function __importStar(mod) {
        if (mod && mod.__esModule) { return mod; }
        var result = {};
        if (mod != null) { for (var k in mod) { if (Object.hasOwnProperty.call(mod, k)) { result[k] = mod[k]; } } }
        result.default = mod;
        return result;
    }

    function __importDefault(mod) {
        return (mod && mod.__esModule) ? mod : { default: mod };
    }

    /**
     * Draw a star shape with an arbitrary number of points.
     *
     * @ignore
     */
    var Star = /** @class */ (function (_super) {
        __extends(Star, _super);
        /**
         * @param {number} x - Center X position of the star
         * @param {number} y - Center Y position of the star
         * @param {number} points - The number of points of the star, must be > 1
         * @param {number} radius - The outer radius of the star
         * @param {number} [innerRadius] - The inner radius between points, default half `radius`
         * @param {number} [rotation=0] - The rotation of the star in radians, where 0 is vertical
         */
        function Star(x, y, points, radius, innerRadius, rotation) {
            if (rotation === void 0) { rotation = 0; }
            var _this = this;
            innerRadius = innerRadius || radius / 2;
            var startAngle = (-1 * Math.PI / 2) + rotation;
            var len = points * 2;
            var delta = math.PI_2 / len;
            var polygon = [];
            for (var i = 0; i < len; i++) {
                var r = i % 2 ? innerRadius : radius;
                var angle = (i * delta) + startAngle;
                polygon.push(x + (r * Math.cos(angle)), y + (r * Math.sin(angle)));
            }
            _this = _super.call(this, polygon) || this;
            return _this;
        }
        return Star;
    }(math.Polygon));
    /**
     * Draw a star shape with an arbitrary number of points.
     *
     * _Note: Only available with **@pixi/graphics-extras**._
     *
     * @instance
     * @memberof PIXI.Graphics
     * @method drawStar
     * @param {number} x - Center X position of the star
     * @param {number} y - Center Y position of the star
     * @param {number} points - The number of points of the star, must be > 1
     * @param {number} radius - The outer radius of the star
     * @param {number} [innerRadius] - The inner radius between points, default half `radius`
     * @param {number} [rotation=0] - The rotation of the star in radians, where 0 is vertical
     * @return {PIXI.Graphics} This Graphics object. Good for chaining method calls
     */
    function drawStar(x, y, points, radius, innerRadius, rotation) {
        if (rotation === void 0) { rotation = 0; }
        return this.drawPolygon(new Star(x, y, points, radius, innerRadius, rotation));
    }

    // Assign extras to Graphics
    Object.defineProperties(graphics.Graphics.prototype, {
        drawTorus: { value: drawTorus },
        drawChamferRect: { value: drawChamferRect },
        drawFilletRect: { value: drawFilletRect },
        drawRegularPolygon: { value: drawRegularPolygon },
        drawStar: { value: drawStar },
    });

}(PIXI, PIXI));
//# sourceMappingURL=graphics-extras.js.map
