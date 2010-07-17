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

#include <Box2D/Collision/Shapes/b2PolygonShape.h>
#include <new>

b2Shape* b2PolygonShape::Clone(b2BlockAllocator* allocator) const
{
	void* mem = allocator->Allocate(sizeof(b2PolygonShape));
	b2PolygonShape* clone = new (mem) b2PolygonShape;
	*clone = *this;
	return clone;
}

void b2PolygonShape::SetAsBox(float32 hx, float32 hy)
{
	m_vertexCount = 4;
	m_vertices[0].Set(-hx, -hy);
	m_vertices[1].Set( hx, -hy);
	m_vertices[2].Set( hx,  hy);
	m_vertices[3].Set(-hx,  hy);
	m_normals[0].Set(0.0f, -1.0f);
	m_normals[1].Set(1.0f, 0.0f);
	m_normals[2].Set(0.0f, 1.0f);
	m_normals[3].Set(-1.0f, 0.0f);
	m_centroid.SetZero();
}

void b2PolygonShape::SetAsBox(float32 hx, float32 hy, const b2Vec2& center, float32 angle)
{
	m_vertexCount = 4;
	m_vertices[0].Set(-hx, -hy);
	m_vertices[1].Set( hx, -hy);
	m_vertices[2].Set( hx,  hy);
	m_vertices[3].Set(-hx,  hy);
	m_normals[0].Set(0.0f, -1.0f);
	m_normals[1].Set(1.0f, 0.0f);
	m_normals[2].Set(0.0f, 1.0f);
	m_normals[3].Set(-1.0f, 0.0f);
	m_centroid = center;

	b2Transform xf;
	xf.position = center;
	xf.R.Set(angle);

	// Transform vertices and normals.
	for (int32 i = 0; i < m_vertexCount; ++i)
	{
		m_vertices[i] = b2Mul(xf, m_vertices[i]);
		m_normals[i] = b2Mul(xf.R, m_normals[i]);
	}
}

void b2PolygonShape::SetAsEdge(const b2Vec2& v1, const b2Vec2& v2)
{
	m_vertexCount = 2;
	m_vertices[0] = v1;
	m_vertices[1] = v2;
	m_centroid = 0.5f * (v1 + v2);
	m_normals[0] = b2Cross(v2 - v1, 1.0f);
	m_normals[0].Normalize();
	m_normals[1] = -m_normals[0];
}

static b2Vec2 ComputeCentroid(const b2Vec2* vs, int32 count)
{
	b2Assert(count >= 2);

	b2Vec2 c; c.Set(0.0f, 0.0f);
	float32 area = 0.0f;

	if (count == 2)
	{
		c = 0.5f * (vs[0] + vs[1]);
		return c;
	}

	// pRef is the reference point for forming triangles.
	// It's location doesn't change the result (except for rounding error).
	b2Vec2 pRef(0.0f, 0.0f);
#if 0
	// This code would put the reference point inside the polygon.
	for (int32 i = 0; i < count; ++i)
	{
		pRef += vs[i];
	}
	pRef *= 1.0f / count;
#endif

	const float32 inv3 = 1.0f / 3.0f;

	for (int32 i = 0; i < count; ++i)
	{
		// Triangle vertices.
		b2Vec2 p1 = pRef;
		b2Vec2 p2 = vs[i];
		b2Vec2 p3 = i + 1 < count ? vs[i+1] : vs[0];

		b2Vec2 e1 = p2 - p1;
		b2Vec2 e2 = p3 - p1;

		float32 D = b2Cross(e1, e2);

		float32 triangleArea = 0.5f * D;
		area += triangleArea;

		// Area weighted centroid
		c += triangleArea * inv3 * (p1 + p2 + p3);
	}

	// Centroid
	b2Assert(area > b2_epsilon);
	c *= 1.0f / area;
	return c;
}

void b2PolygonShape::Set(const b2Vec2* vertices, int32 count)
{
	b2Assert(2 <= count && count <= b2_maxPolygonVertices);
	m_vertexCount = count;

	// Copy vertices.
	for (int32 i = 0; i < m_vertexCount; ++i)
	{
		m_vertices[i] = vertices[i];
	}

	// Compute normals. Ensure the edges have non-zero length.
	for (int32 i = 0; i < m_vertexCount; ++i)
	{
		int32 i1 = i;
		int32 i2 = i + 1 < m_vertexCount ? i + 1 : 0;
		b2Vec2 edge = m_vertices[i2] - m_vertices[i1];
		b2Assert(edge.LengthSquared() > b2_epsilon * b2_epsilon);
		m_normals[i] = b2Cross(edge, 1.0f);
		m_normals[i].Normalize();
	}

#ifdef _DEBUG
	// Ensure the polygon is convex and the interior
	// is to the left of each edge.
	for (int32 i = 0; i < m_vertexCount; ++i)
	{
		int32 i1 = i;
		int32 i2 = i + 1 < m_vertexCount ? i + 1 : 0;
		b2Vec2 edge = m_vertices[i2] - m_vertices[i1];

		for (int32 j = 0; j < m_vertexCount; ++j)
		{
			// Don't check vertices on the current edge.
			if (j == i1 || j == i2)
			{
				continue;
			}
			
			b2Vec2 r = m_vertices[j] - m_vertices[i1];

			// Your polygon is non-convex (it has an indentation) or
			// has colinear edges.
			float32 s = b2Cross(edge, r);
			b2Assert(s > 0.0f);
		}
	}
#endif

	// Compute the polygon centroid.
	m_centroid = ComputeCentroid(m_vertices, m_vertexCount);
}

bool b2PolygonShape::TestPoint(const b2Transform& xf, const b2Vec2& p) const
{
	b2Vec2 pLocal = b2MulT(xf.R, p - xf.position);

	for (int32 i = 0; i < m_vertexCount; ++i)
	{
		float32 dot = b2Dot(m_normals[i], pLocal - m_vertices[i]);
		if (dot > 0.0f)
		{
			return false;
		}
	}

	return true;
}

bool b2PolygonShape::RayCast(b2RayCastOutput* output, const b2RayCastInput& input, const b2Transform& xf) const
{
	// Put the ray into the polygon's frame of reference.
	b2Vec2 p1 = b2MulT(xf.R, input.p1 - xf.position);
	b2Vec2 p2 = b2MulT(xf.R, input.p2 - xf.position);
	b2Vec2 d = p2 - p1;

	if (m_vertexCount == 2)
	{
		b2Vec2 v1 = m_vertices[0];
		b2Vec2 v2 = m_vertices[1];
		b2Vec2 normal = m_normals[0];

		// q = p1 + t * d
		// dot(normal, q - v1) = 0
		// dot(normal, p1 - v1) + t * dot(normal, d) = 0
		float32 numerator = b2Dot(normal, v1 - p1);
		float32 denominator = b2Dot(normal, d);

		if (denominator == 0.0f)
		{
			return false;
		}
	
		float32 t = numerator / denominator;
		if (t < 0.0f || 1.0f < t)
		{
			return false;
		}

		b2Vec2 q = p1 + t * d;

		// q = v1 + s * r
		// s = dot(q - v1, r) / dot(r, r)
		b2Vec2 r = v2 - v1;
		float32 rr = b2Dot(r, r);
		if (rr == 0.0f)
		{
			return false;
		}

		float32 s = b2Dot(q - v1, r) / rr;
		if (s < 0.0f || 1.0f < s)
		{
			return false;
		}

		output->fraction = t;
		if (numerator > 0.0f)
		{
			output->normal = -normal;
		}
		else
		{
			output->normal = normal;
		}
		return true;
	}
	else
	{
		float32 lower = 0.0f, upper = input.maxFraction;

		int32 index = -1;

		for (int32 i = 0; i < m_vertexCount; ++i)
		{
			// p = p1 + a * d
			// dot(normal, p - v) = 0
			// dot(normal, p1 - v) + a * dot(normal, d) = 0
			float32 numerator = b2Dot(m_normals[i], m_vertices[i] - p1);
			float32 denominator = b2Dot(m_normals[i], d);

			if (denominator == 0.0f)
			{	
				if (numerator < 0.0f)
				{
					return false;
				}
			}
			else
			{
				// Note: we want this predicate without division:
				// lower < numerator / denominator, where denominator < 0
				// Since denominator < 0, we have to flip the inequality:
				// lower < numerator / denominator <==> denominator * lower > numerator.
				if (denominator < 0.0f && numerator < lower * denominator)
				{
					// Increase lower.
					// The segment enters this half-space.
					lower = numerator / denominator;
					index = i;
				}
				else if (denominator > 0.0f && numerator < upper * denominator)
				{
					// Decrease upper.
					// The segment exits this half-space.
					upper = numerator / denominator;
				}
			}

			// The use of epsilon here causes the assert on lower to trip
			// in some cases. Apparently the use of epsilon was to make edge
			// shapes work, but now those are handled separately.
			//if (upper < lower - b2_epsilon)
			if (upper < lower)
			{
				return false;
			}
		}

		b2Assert(0.0f <= lower && lower <= input.maxFraction);

		if (index >= 0)
		{
			output->fraction = lower;
			output->normal = b2Mul(xf.R, m_normals[index]);
			return true;
		}
	}

	return false;
}

void b2PolygonShape::ComputeAABB(b2AABB* aabb, const b2Transform& xf) const
{
	b2Vec2 lower = b2Mul(xf, m_vertices[0]);
	b2Vec2 upper = lower;

	for (int32 i = 1; i < m_vertexCount; ++i)
	{
		b2Vec2 v = b2Mul(xf, m_vertices[i]);
		lower = b2Min(lower, v);
		upper = b2Max(upper, v);
	}

	b2Vec2 r(m_radius, m_radius);
	aabb->lowerBound = lower - r;
	aabb->upperBound = upper + r;
}

void b2PolygonShape::ComputeMass(b2MassData* massData, float32 density) const
{
	// Polygon mass, centroid, and inertia.
	// Let rho be the polygon density in mass per unit area.
	// Then:
	// mass = rho * int(dA)
	// centroid.x = (1/mass) * rho * int(x * dA)
	// centroid.y = (1/mass) * rho * int(y * dA)
	// I = rho * int((x*x + y*y) * dA)
	//
	// We can compute these integrals by summing all the integrals
	// for each triangle of the polygon. To evaluate the integral
	// for a single triangle, we make a change of variables to
	// the (u,v) coordinates of the triangle:
	// x = x0 + e1x * u + e2x * v
	// y = y0 + e1y * u + e2y * v
	// where 0 <= u && 0 <= v && u + v <= 1.
	//
	// We integrate u from [0,1-v] and then v from [0,1].
	// We also need to use the Jacobian of the transformation:
	// D = cross(e1, e2)
	//
	// Simplification: triangle centroid = (1/3) * (p1 + p2 + p3)
	//
	// The rest of the derivation is handled by computer algebra.

	b2Assert(m_vertexCount >= 2);

	// A line segment has zero mass.
	if (m_vertexCount == 2)
	{
		massData->center = 0.5f * (m_vertices[0] + m_vertices[1]);
		massData->mass = 0.0f;
		massData->I = 0.0f;
		return;
	}

	b2Vec2 center; center.Set(0.0f, 0.0f);
	float32 area = 0.0f;
	float32 I = 0.0f;

	// pRef is the reference point for forming triangles.
	// It's location doesn't change the result (except for rounding error).
	b2Vec2 pRef(0.0f, 0.0f);
#if 0
	// This code would put the reference point inside the polygon.
	for (int32 i = 0; i < m_vertexCount; ++i)
	{
		pRef += m_vertices[i];
	}
	pRef *= 1.0f / count;
#endif

	const float32 k_inv3 = 1.0f / 3.0f;

	for (int32 i = 0; i < m_vertexCount; ++i)
	{
		// Triangle vertices.
		b2Vec2 p1 = pRef;
		b2Vec2 p2 = m_vertices[i];
		b2Vec2 p3 = i + 1 < m_vertexCount ? m_vertices[i+1] : m_vertices[0];

		b2Vec2 e1 = p2 - p1;
		b2Vec2 e2 = p3 - p1;

		float32 D = b2Cross(e1, e2);

		float32 triangleArea = 0.5f * D;
		area += triangleArea;

		// Area weighted centroid
		center += triangleArea * k_inv3 * (p1 + p2 + p3);

		float32 px = p1.x, py = p1.y;
		float32 ex1 = e1.x, ey1 = e1.y;
		float32 ex2 = e2.x, ey2 = e2.y;

		float32 intx2 = k_inv3 * (0.25f * (ex1*ex1 + ex2*ex1 + ex2*ex2) + (px*ex1 + px*ex2)) + 0.5f*px*px;
		float32 inty2 = k_inv3 * (0.25f * (ey1*ey1 + ey2*ey1 + ey2*ey2) + (py*ey1 + py*ey2)) + 0.5f*py*py;

		I += D * (intx2 + inty2);
	}

	// Total mass
	massData->mass = density * area;

	// Center of mass
	b2Assert(area > b2_epsilon);
	center *= 1.0f / area;
	massData->center = center;

	// Inertia tensor relative to the local origin.
	massData->I = density * I;
}
