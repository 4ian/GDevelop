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

#ifndef DISTANCE_TEST_H
#define DISTANCE_TEST_H

class DistanceTest : public Test
{
public:
	DistanceTest()
	{
		{
			m_transformA.SetIdentity();
			m_transformA.position.Set(0.0f, -0.2f);
			m_polygonA.SetAsBox(10.0f, 0.2f);
		}

		{
			m_positionB.Set(12.017401f, 0.13678508f);
			m_angleB = -0.0109265f;
			m_transformB.Set(m_positionB, m_angleB);

			m_polygonB.SetAsBox(2.0f, 0.1f);
		}
	}

	static Test* Create()
	{
		return new DistanceTest;
	}

	void Step(Settings* settings)
	{
		Test::Step(settings);

		b2DistanceInput input;
		input.proxyA.Set(&m_polygonA);
		input.proxyB.Set(&m_polygonB);
		input.transformA = m_transformA;
		input.transformB = m_transformB;
		input.useRadii = true;
		b2SimplexCache cache;
		cache.count = 0;
		b2DistanceOutput output;
		b2Distance(&output, &cache, &input);

		m_debugDraw.DrawString(5, m_textLine, "distance = %g", output.distance);
		m_textLine += 15;

		m_debugDraw.DrawString(5, m_textLine, "iterations = %d", output.iterations);
		m_textLine += 15;

		{
			b2Color color(0.9f, 0.9f, 0.9f);
			b2Vec2 v[b2_maxPolygonVertices];
			for (int32 i = 0; i < m_polygonA.m_vertexCount; ++i)
			{
				v[i] = b2Mul(m_transformA, m_polygonA.m_vertices[i]);
			}
			m_debugDraw.DrawPolygon(v, m_polygonA.m_vertexCount, color);

			for (int32 i = 0; i < m_polygonB.m_vertexCount; ++i)
			{
				v[i] = b2Mul(m_transformB, m_polygonB.m_vertices[i]);
			}
			m_debugDraw.DrawPolygon(v, m_polygonB.m_vertexCount, color);
		}

		b2Vec2 x1 = output.pointA;
		b2Vec2 x2 = output.pointB;

		b2Color c1(1.0f, 0.0f, 0.0f);
		m_debugDraw.DrawPoint(x1, 4.0f, c1);

		b2Color c2(1.0f, 1.0f, 0.0f);
		m_debugDraw.DrawPoint(x2, 4.0f, c2);
	}

	void Keyboard(unsigned char key)
	{
		switch (key)
		{
		case 'a':
			m_positionB.x -= 0.1f;
			break;

		case 'd':
			m_positionB.x += 0.1f;
			break;

		case 's':
			m_positionB.y -= 0.1f;
			break;

		case 'w':
			m_positionB.y += 0.1f;
			break;

		case 'q':
			m_angleB += 0.1f * b2_pi;
			break;

		case 'e':
			m_angleB -= 0.1f * b2_pi;
			break;
		}

		m_transformB.Set(m_positionB, m_angleB);
	}

	b2Vec2 m_positionB;
	float32 m_angleB;

	b2Transform m_transformA;
	b2Transform m_transformB;
	b2PolygonShape m_polygonA;
	b2PolygonShape m_polygonB;
};

#endif
