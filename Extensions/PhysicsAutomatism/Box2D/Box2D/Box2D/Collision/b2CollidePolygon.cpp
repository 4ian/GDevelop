/*
* Copyright (c) 2006-2009 Erin Catto http://www.gphysics.com
*
* This software is provided 'as-is', without any express or implied
* warranty.  In no event will the authors be held liable for any damages
* arising from the use of this software.
* Permission is granted to anyone to use this software for any purpose,
* including commercial applications, and to alter it and redistribute it
* freely, subject to the following restrictions:
* 1. The origin of this software must not be misrepresented; you must not
* claim that you wrote the original software. If you use this software
* in a product, an acknowledgment in the product documentation would be
* appreciated but is not required.
* 2. Altered source versions must be plainly marked as such, and must not be
* misrepresented as being the original software.
* 3. This notice may not be removed or altered from any source distribution.
*/

#include <Box2D/Collision/b2Collision.h>
#include <Box2D/Collision/Shapes/b2PolygonShape.h>

// Find the separation between poly1 and poly2 for a give edge normal on poly1.
static float32 b2EdgeSeparation(const b2PolygonShape* poly1, const b2Transform& xf1, int32 edge1,
							  const b2PolygonShape* poly2, const b2Transform& xf2)
{
	int32 count1 = poly1->m_vertexCount;
	const b2Vec2* vertices1 = poly1->m_vertices;
	const b2Vec2* normals1 = poly1->m_normals;

	int32 count2 = poly2->m_vertexCount;
	const b2Vec2* vertices2 = poly2->m_vertices;

	b2Assert(0 <= edge1 && edge1 < count1);

	// Convert normal from poly1's frame into poly2's frame.
	b2Vec2 normal1World = b2Mul(xf1.R, normals1[edge1]);
	b2Vec2 normal1 = b2MulT(xf2.R, normal1World);

	// Find support vertex on poly2 for -normal.
	int32 index = 0;
	float32 minDot = b2_maxFloat;

	for (int32 i = 0; i < count2; ++i)
	{
		float32 dot = b2Dot(vertices2[i], normal1);
		if (dot < minDot)
		{
			minDot = dot;
			index = i;
		}
	}

	b2Vec2 v1 = b2Mul(xf1, vertices1[edge1]);
	b2Vec2 v2 = b2Mul(xf2, vertices2[index]);
	float32 separation = b2Dot(v2 - v1, normal1World);
	return separation;
}

// Find the max separation between poly1 and poly2 using edge normals from poly1.
static float32 b2FindMaxSeparation(int32* edgeIndex,
								 const b2PolygonShape* poly1, const b2Transform& xf1,
								 const b2PolygonShape* poly2, const b2Transform& xf2)
{
	int32 count1 = poly1->m_vertexCount;
	const b2Vec2* normals1 = poly1->m_normals;

	// Vector pointing from the centroid of poly1 to the centroid of poly2.
	b2Vec2 d = b2Mul(xf2, poly2->m_centroid) - b2Mul(xf1, poly1->m_centroid);
	b2Vec2 dLocal1 = b2MulT(xf1.R, d);

	// Find edge normal on poly1 that has the largest projection onto d.
	int32 edge = 0;
	float32 maxDot = -b2_maxFloat;
	for (int32 i = 0; i < count1; ++i)
	{
		float32 dot = b2Dot(normals1[i], dLocal1);
		if (dot > maxDot)
		{
			maxDot = dot;
			edge = i;
		}
	}

	// Get the separation for the edge normal.
	float32 s = b2EdgeSeparation(poly1, xf1, edge, poly2, xf2);

	// Check the separation for the previous edge normal.
	int32 prevEdge = edge - 1 >= 0 ? edge - 1 : count1 - 1;
	float32 sPrev = b2EdgeSeparation(poly1, xf1, prevEdge, poly2, xf2);

	// Check the separation for the next edge normal.
	int32 nextEdge = edge + 1 < count1 ? edge + 1 : 0;
	float32 sNext = b2EdgeSeparation(poly1, xf1, nextEdge, poly2, xf2);

	// Find the best edge and the search direction.
	int32 bestEdge;
	float32 bestSeparation;
	int32 increment;
	if (sPrev > s && sPrev > sNext)
	{
		increment = -1;
		bestEdge = prevEdge;
		bestSeparation = sPrev;
	}
	else if (sNext > s)
	{
		increment = 1;
		bestEdge = nextEdge;
		bestSeparation = sNext;
	}
	else
	{
		*edgeIndex = edge;
		return s;
	}

	// Perform a local search for the best edge normal.
	for ( ; ; )
	{
		if (increment == -1)
			edge = bestEdge - 1 >= 0 ? bestEdge - 1 : count1 - 1;
		else
			edge = bestEdge + 1 < count1 ? bestEdge + 1 : 0;

		s = b2EdgeSeparation(poly1, xf1, edge, poly2, xf2);

		if (s > bestSeparation)
		{
			bestEdge = edge;
			bestSeparation = s;
		}
		else
		{
			break;
		}
	}

	*edgeIndex = bestEdge;
	return bestSeparation;
}

static void b2FindIncidentEdge(b2ClipVertex c[2],
							 const b2PolygonShape* poly1, const b2Transform& xf1, int32 edge1,
							 const b2PolygonShape* poly2, const b2Transform& xf2)
{
	int32 count1 = poly1->m_vertexCount;
	const b2Vec2* normals1 = poly1->m_normals;

	int32 count2 = poly2->m_vertexCount;
	const b2Vec2* vertices2 = poly2->m_vertices;
	const b2Vec2* normals2 = poly2->m_normals;

	b2Assert(0 <= edge1 && edge1 < count1);

	// Get the normal of the reference edge in poly2's frame.
	b2Vec2 normal1 = b2MulT(xf2.R, b2Mul(xf1.R, normals1[edge1]));

	// Find the incident edge on poly2.
	int32 index = 0;
	float32 minDot = b2_maxFloat;
	for (int32 i = 0; i < count2; ++i)
	{
		float32 dot = b2Dot(normal1, normals2[i]);
		if (dot < minDot)
		{
			minDot = dot;
			index = i;
		}
	}

	// Build the clip vertices for the incident edge.
	int32 i1 = index;
	int32 i2 = i1 + 1 < count2 ? i1 + 1 : 0;

	c[0].v = b2Mul(xf2, vertices2[i1]);
	c[0].id.features.referenceEdge = (uint8)edge1;
	c[0].id.features.incidentEdge = (uint8)i1;
	c[0].id.features.incidentVertex = 0;

	c[1].v = b2Mul(xf2, vertices2[i2]);
	c[1].id.features.referenceEdge = (uint8)edge1;
	c[1].id.features.incidentEdge = (uint8)i2;
	c[1].id.features.incidentVertex = 1;
}

// Find edge normal of max separation on A - return if separating axis is found
// Find edge normal of max separation on B - return if separation axis is found
// Choose reference edge as min(minA, minB)
// Find incident edge
// Clip

// The normal points from 1 to 2
void b2CollidePolygons(b2Manifold* manifold,
					  const b2PolygonShape* polyA, const b2Transform& xfA,
					  const b2PolygonShape* polyB, const b2Transform& xfB)
{
	manifold->pointCount = 0;
	float32 totalRadius = polyA->m_radius + polyB->m_radius;

	int32 edgeA = 0;
	float32 separationA = b2FindMaxSeparation(&edgeA, polyA, xfA, polyB, xfB);
	if (separationA > totalRadius)
		return;

	int32 edgeB = 0;
	float32 separationB = b2FindMaxSeparation(&edgeB, polyB, xfB, polyA, xfA);
	if (separationB > totalRadius)
		return;

	const b2PolygonShape* poly1;	// reference polygon
	const b2PolygonShape* poly2;	// incident polygon
	b2Transform xf1, xf2;
	int32 edge1;		// reference edge
	uint8 flip;
	const float32 k_relativeTol = 0.98f;
	const float32 k_absoluteTol = 0.001f;

	if (separationB > k_relativeTol * separationA + k_absoluteTol)
	{
		poly1 = polyB;
		poly2 = polyA;
		xf1 = xfB;
		xf2 = xfA;
		edge1 = edgeB;
		manifold->type = b2Manifold::e_faceB;
		flip = 1;
	}
	else
	{
		poly1 = polyA;
		poly2 = polyB;
		xf1 = xfA;
		xf2 = xfB;
		edge1 = edgeA;
		manifold->type = b2Manifold::e_faceA;
		flip = 0;
	}

	b2ClipVertex incidentEdge[2];
	b2FindIncidentEdge(incidentEdge, poly1, xf1, edge1, poly2, xf2);

	int32 count1 = poly1->m_vertexCount;
	const b2Vec2* vertices1 = poly1->m_vertices;

	b2Vec2 v11 = vertices1[edge1];
	b2Vec2 v12 = edge1 + 1 < count1 ? vertices1[edge1+1] : vertices1[0];

	b2Vec2 localTangent = v12 - v11;
	localTangent.Normalize();
	
	b2Vec2 localNormal = b2Cross(localTangent, 1.0f);
	b2Vec2 planePoint = 0.5f * (v11 + v12);

	b2Vec2 tangent = b2Mul(xf1.R, localTangent);
	b2Vec2 normal = b2Cross(tangent, 1.0f);
	
	v11 = b2Mul(xf1, v11);
	v12 = b2Mul(xf1, v12);

	// Face offset.
	float32 frontOffset = b2Dot(normal, v11);

	// Side offsets, extended by polytope skin thickness.
	float32 sideOffset1 = -b2Dot(tangent, v11) + totalRadius;
	float32 sideOffset2 = b2Dot(tangent, v12) + totalRadius;

	// Clip incident edge against extruded edge1 side edges.
	b2ClipVertex clipPoints1[2];
	b2ClipVertex clipPoints2[2];
	int np;

	// Clip to box side 1
	np = b2ClipSegmentToLine(clipPoints1, incidentEdge, -tangent, sideOffset1);

	if (np < 2)
		return;

	// Clip to negative box side 1
	np = b2ClipSegmentToLine(clipPoints2, clipPoints1,  tangent, sideOffset2);

	if (np < 2)
	{
		return;
	}

	// Now clipPoints2 contains the clipped points.
	manifold->localNormal = localNormal;
	manifold->localPoint = planePoint;

	int32 pointCount = 0;
	for (int32 i = 0; i < b2_maxManifoldPoints; ++i)
	{
		float32 separation = b2Dot(normal, clipPoints2[i].v) - frontOffset;

		if (separation <= totalRadius)
		{
			b2ManifoldPoint* cp = manifold->points + pointCount;
			cp->localPoint = b2MulT(xf2, clipPoints2[i].v);
			cp->id = clipPoints2[i].id;
			cp->id.features.flip = flip;
			++pointCount;
		}
	}

	manifold->pointCount = pointCount;
}
