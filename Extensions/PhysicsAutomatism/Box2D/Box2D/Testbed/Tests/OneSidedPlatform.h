/*
* Copyright (c) 2008-2009 Erin Catto http://www.gphysics.com
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

#ifndef ONE_SIDED_PLATFORM_H
#define ONE_SIDED_PLATFORM_H

class OneSidedPlatform : public Test
{
public:

	enum State
	{
		e_unknown,
		e_above,
		e_below,
	};

	OneSidedPlatform()
	{
		// Ground
		{
			b2BodyDef bd;
			b2Body* ground = m_world->CreateBody(&bd);

			b2PolygonShape shape;
			shape.SetAsEdge(b2Vec2(-20.0f, 0.0f), b2Vec2(20.0f, 0.0f));
			ground->CreateFixture(&shape, 0.0f);
		}

		// Platform
		{
			b2BodyDef bd;
			bd.position.Set(0.0f, 10.0f);
			b2Body* body = m_world->CreateBody(&bd);

			b2PolygonShape shape;
			shape.SetAsBox(3.0f, 0.5f);
			m_platform = body->CreateFixture(&shape, 0.0f);

			m_bottom = 10.0f - 0.5f;
			m_top = 10.0f + 0.5f;
		}

		// Actor
		{
			b2BodyDef bd;
			bd.type = b2_dynamicBody;
			bd.position.Set(0.0f, 12.0f);
			b2Body* body = m_world->CreateBody(&bd);

			m_radius = 0.5f;
			b2CircleShape shape;
			shape.m_radius = m_radius;
			m_character = body->CreateFixture(&shape, 20.0f);

			body->SetLinearVelocity(b2Vec2(0.0f, -50.0f));

			m_state = e_unknown;
		}
	}

	void PreSolve(b2Contact* contact, const b2Manifold* oldManifold)
	{
		Test::PreSolve(contact, oldManifold);

		b2Fixture* fixtureA = contact->GetFixtureA();
		b2Fixture* fixtureB = contact->GetFixtureB();

		if (fixtureA != m_platform && fixtureA != m_character)
		{
			return;
		}

		if (fixtureB != m_character && fixtureB != m_character)
		{
			return;
		}

		b2Vec2 position = m_character->GetBody()->GetPosition();

		if (position.y < m_top + m_radius - 3.0f * b2_linearSlop)
		{
			contact->SetEnabled(false);
		}
	}

	void Step(Settings* settings)
	{
		Test::Step(settings);
		m_debugDraw.DrawString(5, m_textLine, "Press: (c) create a shape, (d) destroy a shape.");
		m_textLine += 15;
	}

	static Test* Create()
	{
		return new OneSidedPlatform;
	}

	float32 m_radius, m_top, m_bottom;
	State m_state;
	b2Fixture* m_platform;
	b2Fixture* m_character;
};

#endif
