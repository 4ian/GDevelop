/*
 * GDevelop JS Platform
 * Copyright 2013-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

/**
 * Polygon represents a polygon which can be used to create collisions masks for RuntimeObject.
 *
 * @constructor
 * @namespace gdjs
 * @class Polygon
 */
gdjs.Polygon = function()
{
    /**
     * The vertices of the polygon
     * @property vertices
     */
    this.vertices = [];

    /**
     * The edges of the polygon. This property is only valid after calling
     * computeEdges, and remains valid until vertices are modified.
     * @property edges
     */
    this.edges = [];

    /**
     * The center of the polygon. This property is only valid after calling
     * computeCenter, and remains valid until vertices are modified.
     * @property center
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
	edgesLen = this.edges.length;

	if ( edgesLen < 3 ) {
		return false;
	}

	var zProductIsPositive = (this.edges[0][0]*this.edges[0+1][1] - this.edges[0][1]*this.edges[0+1][0]) > 0;

	for (var i = 1;i<edgesLen-1;++i) {
		var zCrossProduct = this.edges[i][0]*this.edges[i+1][1] - this.edges[i][1]*this.edges[i+1][0];
		if ( (zCrossProduct > 0) !== zProductIsPositive ) return false;
	}

	var lastZCrossProduct = this.edges[edgesLen-1][0]*this.edges[0][1] - this.edges[edgesLen][1]*this.edges[0][0];
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
 * Do a collision test between two polygons.<br>
 * Please note that polygons must <b>convexes</b>!
 *
 * Uses <a href="http://en.wikipedia.org/wiki/Hyperplane_separation_theorem">Separating Axis Theorem </a>.<br>
 * Based on <a href="http://www.codeproject.com/Articles/15573/2D-Polygon-Collision-Detection">this</a>
 * and <a href="http://stackoverflow.com/questions/5742329/problem-with-collision-response-sat">this</a> article.
 *
 * @method collisionTest
 * @static
 * @return {Boolean} true if polygons are overlapping
 * @param p1 {polygon} The first polygon
 * @param p2 {polygon} The second polygon
 */
gdjs.Polygon.collisionTest = function(p1,p2) {

    //Tools functions :

    var normalise = function(v)
    {
        var len = Math.sqrt(v[0]*v[0] + v[1]*v[1]);

        if (len != 0) {
            v[0] /= len;
            v[1] /= len;
        }
    }

    var dotProduct = function(a, b)
    {
        var dp = a[0]*b[0] + a[1]*b[1];

        return dp;
    }

    var project = function(axis, p)
    {
        var dp = dotProduct(axis, p.vertices[0]);
        var minMax = [dp, dp];

        for (var i = 1, len = p.vertices.length; i < len; ++i) {
            dp = dotProduct(axis, p.vertices[i]);

            if (dp < minMax[0])
                minMax[0] = dp;
            else if (dp > minMax[1])
                minMax[1] = dp;
        }

        return minMax;
    }

    var distance = function(minA, maxA, minB, maxB)
    {
        if (minA < minB) return minB - maxA;
        else return minA - maxB;
    }

    //Algorithm core :

    p1.computeEdges();
    p2.computeEdges();

    var edge = [0, 0];
    var move_axis = [0, 0];
    var mtd = [0, 0];

    var min_dist = Number.MAX_VALUE;

    var result = {collision:false, move_axis:[0,0] };

    //Iterate over all the edges composing the polygons
    for (var i = 0, len1 = p1.vertices.length, len2 = p2.vertices.length; i < len1+len2; i++) {
        if (i < len1) { // or <=
            edge = p1.edges[i];
        }
        else {
            edge = p2.edges[i - len1];
        }

        var axis = [-edge[1], edge[0]]; //Get the axis to which polygons will be projected
        normalise(axis);

        var minMaxA = project(axis, p1); //Do projecton on the axis.
        var minMaxB = project(axis, p2);

        //If the projections on the axis do not overlap, then their is no collision
        if (distance(minMaxA[0], minMaxA[1], minMaxB[0], minMaxB[1]) > 0) {
            result.collision = false;
            result.move_axis[0] = 0;
            result.move_axis[1] = 0;
            return result;
        }

        var dist = Math.abs(distance(minMaxA[0], minMaxA[1], minMaxB[0], minMaxB[1]));

        if (dist < min_dist) {
            min_dist = dist;
            move_axis[0] = axis[0];
            move_axis[1] = axis[1];
        }
    }

    result.collision = true;

    //Ensure move axis is correctly oriented.
    var p1Center = p1.computeCenter();
    var p2Center = p2.computeCenter();
    var d = [p1Center[0]-p2Center[0], p1Center[1]-p2Center[1]];
    if (dotProduct(d, move_axis) < 0) {
        move_axis[0] = -move_axis[0];
        move_axis[1] = -move_axis[1];
    }

    //Add the magnitude to the move axis.
    result.move_axis[0] = move_axis[0] * min_dist;
    result.move_axis[1] = move_axis[1] * min_dist;

    return result;
};
