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

#ifndef CONTINUOUS_TEST_H
#define CONTINUOUS_TEST_H

class ContinuousTest : public Test
{
public:

	ContinuousTest()
	{
		{
			b2BodyDef bd;
			bd.position.Set(0.0f, 0.0f);
			b2Body* body = m_world->CreateBody(&bd);

			b2PolygonShape shape;

			shape.SetAsEdge(b2Vec2(-10.0f, 0.0f), b2Vec2(10.0f, 0.0f));
			body->CreateFixture(&shape, 0.0f);

			shape.SetAsBox(0.2f, 1.0f, b2Vec2(0.5f, 1.0f), 0.0f);
			body->CreateFixture(&shape, 0.0f);
		}

#if 1
		{
			b2BodyDef bd;
			bd.type = b2_dynamicBody;
			bd.position.Set(0.0f, 20.0f);
			//bd.angle = 0.1f;

			b2PolygonShape shape;
			shape.SetAsBox(2.0f, 0.1f);

			m_body = m_world->CreateBody(&bd);
			m_body->CreateFixture(&shape, 1.0f);

			m_angularVelocity = RandomFloat(-50.0f, 50.0f);
			m_angularVelocity = 33.468121f;
			m_body->SetLinearVelocity(b2Vec2(0.0f, -100.0f));
			m_body->SetAngularVelocity(m_angularVelocity);
		}
#else
		{
			b2BodyDef bd;
			bd.type = b2_dynamicBody;
			bd.position.Set(0.0f, 0.5f);
			b2Body* body = m_world->CreateBody(&bd);

			b2CircleShape shape;
			shape.m_p.SetZero();
			shape.m_radius = 0.5f;
			body->CreateFixture(&shape, 1.0f);

			//bd.bullet = true;
			bd.position.Set(0.0f, 10.0f);
			body = m_world->CreateBody(&bd);
			body->CreateFixture(&shape, 1.0f);
			body->SetLinearVelocity(b2Vec2(0.0f, -100.0f));
		}
#endif
	}

	void Launch()
	{
		m_body->SetTransform(b2Vec2(0.0f, 20.0f), 0.0f);
		m_angularVelocity = RandomFloat(-50.0f, 50.0f);
		m_body->SetLinearVelocity(b2Vec2(0.0f, -100.0f));
		m_body->SetAngularVelocity(m_angularVelocity);
	}

	void Step(Settings* settings)
	{
		if (m_stepCount	== 12)
		{
			m_stepCount += 0;
		}

		Test::Step(settings);

		extern int32 b2_gjkCalls, b2_gjkIters, b2_gjkMaxIters;

		if (b2_gjkCalls > 0)
		{
			m_debugDraw.DrawString(5, m_textLine, "gjk calls = %d, ave gjk iters = %3.1f, max gjk iters = %d",
				b2_gjkCalls, b2_gjkIters / float32(b2_gjkCalls), b2_gjkMaxIters);
			m_textLine += 15;
		}

		extern int32 b2_toiCalls, b2_toiIters, b2_toiMaxIters;
		extern int32 b2_toiRootIters, b2_toiMaxRootIters;
		extern int32 b2_toiMaxOptIters;

		if (b2_toiCalls > 0)
		{
			m_debugDraw.DrawString(5, m_textLine, "toi calls = %d, ave toi iters = %3.1f, max toi iters = %d",
								b2_toiCalls, b2_toiIters / float32(b2_toiCalls), b2_toiMaxRootIters);
			m_textLine += 15;
			
			m_debugDraw.DrawString(5, m_textLine, "ave toi root iters = %3.1f, max toi root iters = %d",
				b2_toiRootIters / float32(b2_toiCalls), b2_toiMaxRootIters);
			m_textLine += 15;

			m_debugDraw.DrawString(5, m_textLine, "max toi opt iters = %d", b2_toiMaxOptIters);
			m_textLine += 15;
		}

		if (m_stepCount % 60 == 0)
		{
			Launch();
		}
	}

	static Test* Create()
	{
		return new ContinuousTest;
	}

	b2Body* m_body;
	float32 m_angularVelocity;
};

#endif
