/*
 * GDevelop JS Platform
 * Copyright 2013-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

/**
 * Polygon represents a polygon which can be used to create collisions masks for RuntimeObject.
 *
 * @memberof gdjs
 * @class Polygon
 */
gdjs.Polygon = function()
{
    /**
     * The vertices of the polygon
     * @member {Array}
     */
    this.vertices = [];

    /**
     * The edges of the polygon. This property is only valid after calling
     * computeEdges, and remains valid until vertices are modified.
     * @member {Array}
     */
    this.edges = [];

    /**
     * The center of the polygon. This property is only valid after calling
     * computeCenter, and remains valid until vertices are modified.
     * @member {Array}
     */
    this.center = [0,0];
};

gdjs.Polygon.prototype.move = function(x,y) {
	for(var i = 0, len = this.vertices.length;i<len;++i) {

		this.vertices[i][0] += x;
		this.vertices[i][1] += y;
	}
};

gdjs.Polygon.prototype.rotate = function(angle) {
	var t, cosa = Math.cos(-angle),
		sina = Math.sin(-angle); //We want a clockwise rotation

	for (var i = 0, len = this.vertices.length;i<len;++i) {
		t = this.vertices[i][0];
		this.vertices[i][0] = t*cosa + this.vertices[i][1]*sina;
		this.vertices[i][1] = -t*sina + this.vertices[i][1]*cosa;
	}
};

gdjs.Polygon.prototype.computeEdges = function() {
	var v1, v2;
	//Ensure edge array has the right size. ( And avoid recreating an edge array ).
	while ( this.edges.length < this.vertices.length ) {
		this.edges.push([0,0]);
	}
	if ( this.edges.length != this.vertices.length )
		this.edges.length = this.vertices.length;

	for (var i = 0, len = this.vertices.length;i<len;++i) {
		v1 = this.vertices[i];
		if ((i + 1) >= len) v2 = this.vertices[0];
		else v2 = this.vertices[i + 1];

		this.edges[i][0] = v2[0] - v1[0];
		this.edges[i][1] = v2[1] - v1[1];
	}
};

gdjs.Polygon.prototype.isConvex = function() {
	this.computeEdges();
	var edgesLen = this.edges.length;

	if ( edgesLen < 3 ) {
		return false;
	}

	var zProductIsPositive = (this.edges[0][0]*this.edges[0+1][1] - this.edges[0][1]*this.edges[0+1][0]) > 0;

	for (var i = 1;i<edgesLen-1;++i) {
		var zCrossProduct = this.edges[i][0]*this.edges[i+1][1] - this.edges[i][1]*this.edges[i+1][0];
		if ( (zCrossProduct > 0) !== zProductIsPositive ) return false;
	}

	var lastZCrossProduct = this.edges[edgesLen-1][0]*this.edges[0][1] - this.edges[edgesLen-1][1]*this.edges[0][0];
	if ( (lastZCrossProduct > 0) !== zProductIsPositive ) return false;

	return true;
};

gdjs.Polygon.prototype.computeCenter = function() {
	this.center[0] = 0;
	this.center[1] = 0;
	var len = this.vertices.length;

	for (var i = 0;i<len;++i) {
		this.center[0] += this.vertices[i][0];
		this.center[1] += this.vertices[i][1];
	}
	this.center[0] /= len;
	this.center[1] /= len;

	return this.center;
};

gdjs.Polygon.createRectangle = function(width, height) {
    var rect = new gdjs.Polygon();
    rect.vertices.push([-width/2.0, -height/2.0]);
    rect.vertices.push([+width/2.0, -height/2.0]);
    rect.vertices.push([+width/2.0, +height/2.0]);
    rect.vertices.push([-width/2.0, +height/2.0]);

    return rect;
};

/**
 * Do a collision test between two polygons.
 * Please note that polygons must *convexes*!
 *
 * Uses <a href="http://en.wikipedia.org/wiki/Hyperplane_separation_theorem">Separating Axis Theorem </a>.<br>
 * Based on <a href="http://www.codeproject.com/Articles/15573/2D-Polygon-Collision-Detection">this</a>
 * and <a href="http://stackoverflow.com/questions/5742329/problem-with-collision-response-sat">this</a> article.
 *
 * @return {{collision: boolean, move_axis: Array<number>}} returnValue.collision is equal to true if polygons are overlapping
 * @param {gdjs.Polygon} p1 The first polygon
 * @param {gdjs.Polygon} p2 The second polygon
 * @param {boolean | undefined} ignoreTouchingEdges If true, then edges that are touching each other, without the polygons actually overlapping, won't be considered in collision.
 */
gdjs.Polygon.collisionTest = function(p1, p2, ignoreTouchingEdges) {
    //Algorithm core :

    p1.computeEdges();
    p2.computeEdges();

    var edge = gdjs.Polygon.collisionTest._statics.edge;
    var move_axis = gdjs.Polygon.collisionTest._statics.move_axis;

    var result = gdjs.Polygon.collisionTest._statics.result;
    var minDist = Number.MAX_VALUE;

    edge[0] = 0;
    edge[1] = 0;
    edge[0] = 0;
    edge[1] = 0;

    result.collision = false;
    result.move_axis[0] = 0;
    result.move_axis[1] = 0;

    //Iterate over all the edges composing the polygons
    for (var i = 0, len1 = p1.vertices.length, len2 = p2.vertices.length; i < len1+len2; i++) {
        if (i < len1) { // or <=
            edge = p1.edges[i];
        } else {
            edge = p2.edges[i - len1];
        }

        var axis = gdjs.Polygon.collisionTest._statics.axis; //Get the axis to which polygons will be projected
				axis[0] = -edge[1];
				axis[1] = edge[0];
        gdjs.Polygon.normalise(axis);

				var minMaxA = gdjs.Polygon.collisionTest._statics.minMaxA;
				var minMaxB = gdjs.Polygon.collisionTest._statics.minMaxB;
        gdjs.Polygon.project(axis, p1, minMaxA); //Do projection on the axis.
        gdjs.Polygon.project(axis, p2, minMaxB);

        //If the projections on the axis do not overlap, then their is no collision
        var dist = gdjs.Polygon.distance(minMaxA[0], minMaxA[1], minMaxB[0], minMaxB[1]);
        if (dist > 0 || (dist === 0 && ignoreTouchingEdges)) {
            result.collision = false;
            result.move_axis[0] = 0;
            result.move_axis[1] = 0;
            return result;
        }

        var absDist = Math.abs(dist);

        if (absDist < minDist) {
            minDist = absDist;
            move_axis[0] = axis[0];
            move_axis[1] = axis[1];
        }
    }

    result.collision = true;

    //Ensure move axis is correctly oriented.
    var p1Center = p1.computeCenter();
    var p2Center = p2.computeCenter();
    var d = [p1Center[0]-p2Center[0], p1Center[1]-p2Center[1]];
    if (gdjs.Polygon.dotProduct(d, move_axis) < 0) {
        move_axis[0] = -move_axis[0];
        move_axis[1] = -move_axis[1];
    }

    //Add the magnitude to the move axis.
    result.move_axis[0] = move_axis[0] * minDist;
    result.move_axis[1] = move_axis[1] * minDist;

    return result;
};

//Arrays and data structure that are (re)used by gdjs.Polygon.collisionTest to
//avoid any allocation.
gdjs.Polygon.collisionTest._statics = {
	minMaxA: [0,0],
	minMaxB: [0,0],
	edge: [0,0],
	axis: [0,0],
	move_axis: [0,0],
	result: {
		collision:false,
		move_axis:[0,0]
	}
};

/**
 * Do a raycast test.<br>
 * Please note that the polygon must be <b>convex</b>!
 * 
 * For some theory, check <a href="https://www.codeproject.com/Tips/862988/Find-the-Intersection-Point-of-Two-Line-Segments">Find the Intersection Point of Two Line Segments</a>.
 *
 * @param {gdjs.Polygon} poly The polygon to test
 * @param {number} startX The raycast start point X
 * @param {number} startY The raycast start point Y
 * @param {number} endX The raycast end point X
 * @param {number} endY The raycast end point Y
 * @return A raycast result with the contact points and distances
 */
gdjs.Polygon.raycastTest = function(poly, startX, startY, endX, endY)
{
    var result = gdjs.Polygon.raycastTest._statics.result;
    result.collision = false;

    if ( poly.vertices.length < 2 )
    {
        return result;
    }

    poly.computeEdges();
    var p = gdjs.Polygon.raycastTest._statics.p;
    var q = gdjs.Polygon.raycastTest._statics.q;
    var r = gdjs.Polygon.raycastTest._statics.r;
    var s = gdjs.Polygon.raycastTest._statics.s;
    var minSqDist = Number.MAX_VALUE;

    // Ray segment: p + t*r, with p = start and r = end - start
    p[0] = startX;
    p[1] = startY;
    r[0] = endX - startX;
    r[1] = endY - startY;

    for(var i=0; i<poly.edges.length; i++)
    {
        // Edge segment: q + u*s
        q[0] = poly.vertices[i][0];
        q[1] = poly.vertices[i][1];
        s[0] = poly.edges[i][0];
        s[1] = poly.edges[i][1];
        var deltaQP = gdjs.Polygon.raycastTest._statics.deltaQP;
        deltaQP[0] = q[0] - p[0];
        deltaQP[1] = q[1] - p[1];
        var crossRS = gdjs.Polygon.crossProduct(r, s);
        var t = gdjs.Polygon.crossProduct(deltaQP, s) / crossRS;
        var u = gdjs.Polygon.crossProduct(deltaQP, r) / crossRS;

        // Collinear
        if ( Math.abs(crossRS) <= 0.0001 && Math.abs(gdjs.Polygon.crossProduct(deltaQP, r)) <= 0.0001 )
        {
            // Project the ray and the edge to work on floats, keeping linearity through t
            var axis = gdjs.Polygon.raycastTest._statics.axis;
            axis[0] = r[0];
            axis[1] = r[1];
            gdjs.Polygon.normalise(axis);
            var rayA = 0;
            var rayB = gdjs.Polygon.dotProduct(axis, r);
            var edgeA = gdjs.Polygon.dotProduct(axis, deltaQP);
            var edgeB = gdjs.Polygon.dotProduct(axis, [deltaQP[0] + s[0], deltaQP[1] + s[1]]);
            // Get overlapping range
            var minOverlap = Math.max(Math.min(rayA, rayB), Math.min(edgeA, edgeB));
            var maxOverlap = Math.min(Math.max(rayA, rayB), Math.max(edgeA, edgeB));
            if( minOverlap > maxOverlap ){
                return result;
            }
            result.collision = true;
            // Zero distance ray
            if( rayB === 0 ){
                result.closeX = startX;
                result.closeY = startY;
                result.closeSqDist = 0;
                result.farX = startX;
                result.farY = startY;
                result.farSqDist = 0;
            }
            var t1 = minOverlap / Math.abs(rayB);
            var t2 = maxOverlap / Math.abs(rayB);
            result.closeX = startX + t1*r[0];
            result.closeY = startY + t1*r[1];
            result.closeSqDist = t1*t1*(r[0]*r[0] + r[1]*r[1]);
            result.farX = startX + t2*r[0];
            result.farY = startY + t2*r[1];
            result.farSqDist = t2*t2*(r[0]*r[0] + r[1]*r[1]);

            return result;
        }
        // One point intersection
        else if ( crossRS !== 0 && 0<=t && t<=1 && 0<=u && u<=1 )
        {
            var x = p[0] + t*r[0];
            var y = p[1] + t*r[1];
            
            var sqDist = (x-startX)*(x-startX) + (y-startY)*(y-startY);
            if ( sqDist < minSqDist )
            {
                if ( !result.collision ){
                    result.farX = x;
                    result.farY = y;
                    result.farSqDist = sqDist;
                }
                minSqDist = sqDist;
                result.closeX = x;
                result.closeY = y;
                result.closeSqDist = sqDist;
                result.collision = true;
            }
            else
            {
                result.farX = x;
                result.farY = y;
                result.farSqDist = sqDist;
            }
        }
    }

    return result;
};

gdjs.Polygon.raycastTest._statics = {
    p: [0,0],
    q: [0,0],
    r: [0,0],
    s: [0,0],
    deltaQP: [0,0],
    axis: [0,0],
    result: {
        collision: false,
        closeX: 0,
        closeY: 0,
        closeSqDist: 0,
        farX: 0,
        farY: 0,
        farSqDist: 0
    }
}

//Tools functions :
gdjs.Polygon.normalise = function(v)
{
    var len = Math.sqrt(v[0]*v[0] + v[1]*v[1]);

    if (len != 0) {
        v[0] /= len;
        v[1] /= len;
    }
}

gdjs.Polygon.dotProduct = function(a, b)
{
    var dp = a[0]*b[0] + a[1]*b[1];

    return dp;
}

gdjs.Polygon.crossProduct = function(a, b)
{
    var cp = a[0]*b[1] - a[1]*b[0];

    return cp;
}

gdjs.Polygon.project = function(axis, p, result)
{
    var dp = gdjs.Polygon.dotProduct(axis, p.vertices[0]);
		result[0] = dp;
		result[1] = dp;

    for (var i = 1, len = p.vertices.length; i < len; ++i) {
        dp = gdjs.Polygon.dotProduct(axis, p.vertices[i]);

        if (dp < result[0])
            result[0] = dp;
        else if (dp > result[1])
            result[1] = dp;
    }
}

gdjs.Polygon.distance = function(minA, maxA, minB, maxB)
{
    if (minA < minB) return minB - maxA;
    else return minA - maxB;
}

/**
 * Check if a point is inside a polygon.
 *
 * Uses <a href="https://wrf.ecse.rpi.edu//Research/Short_Notes/pnpoly.html">PNPOLY</a> by W. Randolph Franklin.
 *
 * @param {gdjs.Polygon} poly The polygon to test
 * @param {number} x The point x coordinate
 * @param {number} y The point y coordinate
 * @return {boolean} true if the point is inside the polygon
 */
gdjs.Polygon.isPointInside = function(poly, x, y)
{
    var inside = false;
    var vi, vj;
    for (var i = 0, j = poly.vertices.length-1; i < poly.vertices.length; j = i++) {
        vi = poly.vertices[i];
        vj = poly.vertices[j];
        if ( ((vi[1]>y) != (vj[1]>y)) && (x < (vj[0]-vi[0]) * (y-vi[1]) / (vj[1]-vi[1]) + vi[0]) )
            inside = !inside;
    }

    return inside;
};
