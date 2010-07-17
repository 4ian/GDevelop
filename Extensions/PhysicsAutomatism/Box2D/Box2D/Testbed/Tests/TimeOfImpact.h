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

#ifndef TIME_OF_IMPACT_H
#define TIME_OF_IMPACT_H

class TimeOfImpact : public Test
{
public:
	TimeOfImpact()
	{
		m_shapeA.SetAsBox(25.0f, 5.0f);
		m_shapeB.SetAsBox(2.5f, 2.5f);
	}

	static Test* Create()
	{
		return new TimeOfImpact;
	}

	void Step(Settings* settings)
	{
		Test::Step(settings);

		b2Sweep sweepA;
		sweepA.c0.Set(24.0f, -60.0f);
		sweepA.a0 = 2.95f;
		sweepA.c = sweepA.c0;
		sweepA.a = sweepA.a0;
		sweepA.localCenter.SetZero();

		b2Sweep sweepB;
		sweepB.c0.Set(53.474274f, -50.252514f);
		sweepB.a0 = 513.36676f; // - 162.0f * b2_pi;
		sweepB.c.Set(54.595478f, -51.083473f);
		sweepB.a = 513.62781f; //  - 162.0f * b2_pi;
		sweepB.localCenter.SetZero();

		//sweepB.a0 -= 300.0f * b2_pi;
		//sweepB.a -= 300.0f * b2_pi;

		b2TOIInput input;
		input.proxyA.Set(&m_shapeA);
		input.proxyB.Set(&m_shapeB);
		input.sweepA = sweepA;
		input.sweepB = sweepB;
		input.tMax = 1.0f;

		b2TOIOutput output;

		b2TimeOfImpact(&output, &input);

		m_debugDraw.DrawString(5, m_textLine, "toi = %g", output.t);
		m_textLine += 15;

		extern int32 b2_toiMaxIters, b2_toiMaxRootIters;
		m_debugDraw.DrawString(5, m_textLine, "max toi iters = %d, max root iters = %d", b2_toiMaxIters, b2_toiMaxRootIters);
		m_textLine += 15;

		b2Vec2 vertices[b2_maxPolygonVertices];

		b2Transform transformA;
		sweepA.GetTransform(&transformA, 0.0f);
		for (int32 i = 0; i < m_shapeA.m_vertexCount; ++i)
		{
			vertices[i] = b2Mul(transformA, m_shapeA.m_vertices[i]);
		}
		m_debugDraw.DrawPolygon(vertices, m_shapeA.m_vertexCount, b2Color(0.9f, 0.9f, 0.9f));

		b2Transform transformB;
		sweepB.GetTransform(&transformB, 0.0f);
		
		b2Vec2 localPoint(2.0f, -0.1f);
		b2Vec2 rB = b2Mul(transformB, localPoint) - sweepB.c0;
		float32 wB = sweepB.a - sweepB.a0;
		b2Vec2 vB = sweepB.c - sweepB.c0;
		b2Vec2 v = vB + b2Cross(wB, rB);

		for (int32 i = 0; i < m_shapeB.m_vertexCount; ++i)
		{
			vertices[i] = b2Mul(transformB, m_shapeB.m_vertices[i]);
		}
		m_debugDraw.DrawPolygon(vertices, m_shapeB.m_vertexCount, b2Color(0.5f, 0.9f, 0.5f));

		sweepB.GetTransform(&transformB, output.t);
		for (int32 i = 0; i < m_shapeB.m_vertexCount; ++i)
		{
			vertices[i] = b2Mul(transformB, m_shapeB.m_vertices[i]);
		}
		m_debugDraw.DrawPolygon(vertices, m_shapeB.m_vertexCount, b2Color(0.5f, 0.7f, 0.9f));

		sweepB.GetTransform(&transformB, 1.0f);
		for (int32 i = 0; i < m_shapeB.m_vertexCount; ++i)
		{
			vertices[i] = b2Mul(transformB, m_shapeB.m_vertices[i]);
		}
		m_debugDraw.DrawPolygon(vertices, m_shapeB.m_vertexCount, b2Color(0.9f, 0.5f, 0.5f));

#if 0
		for (float32 t = 0.0f; t < 1.0f; t += 0.1f)
		{
			sweepB.GetTransform(&transformB, t);
			for (int32 i = 0; i < m_shapeB.m_vertexCount; ++i)
			{
				vertices[i] = b2Mul(transformB, m_shapeB.m_vertices[i]);
			}
			m_debugDraw.DrawPolygon(vertices, m_shapeB.m_vertexCount, b2Color(0.9f, 0.5f, 0.5f));
		}
#endif
	}

	b2PolygonShape m_shapeA;
	b2PolygonShape m_shapeB;
};

#endif
