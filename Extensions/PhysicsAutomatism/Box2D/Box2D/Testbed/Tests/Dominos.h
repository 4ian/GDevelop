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

#ifndef DOMINOS_H
#define DOMINOS_H

class Dominos : public Test
{
public:

	Dominos()
	{
		b2Body* b1;
		{
			b2PolygonShape shape;
			shape.SetAsEdge(b2Vec2(-40.0f, 0.0f), b2Vec2(40.0f, 0.0f));

			b2BodyDef bd;
			b1 = m_world->CreateBody(&bd);
			b1->CreateFixture(&shape, 0.0f);
		}

		{
			b2PolygonShape shape;
			shape.SetAsBox(6.0f, 0.25f);

			b2BodyDef bd;
			bd.position.Set(-1.5f, 10.0f);
			b2Body* ground = m_world->CreateBody(&bd);
			ground->CreateFixture(&shape, 0.0f);
		}

		{
			b2PolygonShape shape;
			shape.SetAsBox(0.1f, 1.0f);

			b2FixtureDef fd;
			fd.shape = &shape;
			fd.density = 20.0f;
			fd.friction = 0.1f;

			for (int i = 0; i < 10; ++i)
			{
				b2BodyDef bd;
				bd.type = b2_dynamicBody;
				bd.position.Set(-6.0f + 1.0f * i, 11.25f);
				b2Body* body = m_world->CreateBody(&bd);
				body->CreateFixture(&fd);
			}
		}

		{
			b2PolygonShape shape;
			shape.SetAsBox(7.0f, 0.25f, b2Vec2_zero, 0.3f);

			b2BodyDef bd;
			bd.position.Set(1.0f, 6.0f);
			b2Body* ground = m_world->CreateBody(&bd);
			ground->CreateFixture(&shape, 0.0f);
		}

		b2Body* b2;
		{
			b2PolygonShape shape;
			shape.SetAsBox(0.25f, 1.5f);

			b2BodyDef bd;
			bd.position.Set(-7.0f, 4.0f);
			b2 = m_world->CreateBody(&bd);
			b2->CreateFixture(&shape, 0.0f);
		}

		b2Body* b3;
		{
			b2PolygonShape shape;
			shape.SetAsBox(6.0f, 0.125f);

			b2BodyDef bd;
			bd.type = b2_dynamicBody;
			bd.position.Set(-0.9f, 1.0f);
			bd.angle = -0.15f;

			b3 = m_world->CreateBody(&bd);
			b3->CreateFixture(&shape, 10.0f);
		}

		b2RevoluteJointDef jd;
		b2Vec2 anchor;

		anchor.Set(-2.0f, 1.0f);
		jd.Initialize(b1, b3, anchor);
		jd.collideConnected = true;
		m_world->CreateJoint(&jd);

		b2Body* b4;
		{
			b2PolygonShape shape;
			shape.SetAsBox(0.25f, 0.25f);

			b2BodyDef bd;
			bd.type = b2_dynamicBody;
			bd.position.Set(-10.0f, 15.0f);
			b4 = m_world->CreateBody(&bd);
			b4->CreateFixture(&shape, 10.0f);
		}

		anchor.Set(-7.0f, 15.0f);
		jd.Initialize(b2, b4, anchor);
		m_world->CreateJoint(&jd);

		b2Body* b5;
		{
			b2BodyDef bd;
			bd.type = b2_dynamicBody;
			bd.position.Set(6.5f, 3.0f);
			b5 = m_world->CreateBody(&bd);

			b2PolygonShape shape;
			b2FixtureDef fd;

			fd.shape = &shape;
			fd.density = 10.0f;
			fd.friction = 0.1f;

			shape.SetAsBox(1.0f, 0.1f, b2Vec2(0.0f, -0.9f), 0.0f);
			b5->CreateFixture(&fd);

			shape.SetAsBox(0.1f, 1.0f, b2Vec2(-0.9f, 0.0f), 0.0f);
			b5->CreateFixture(&fd);

			shape.SetAsBox(0.1f, 1.0f, b2Vec2(0.9f, 0.0f), 0.0f);
			b5->CreateFixture(&fd);
		}

		anchor.Set(6.0f, 2.0f);
		jd.Initialize(b1, b5, anchor);
		m_world->CreateJoint(&jd);

		b2Body* b6;
		{
			b2PolygonShape shape;
			shape.SetAsBox(1.0f, 0.1f);

			b2BodyDef bd;
			bd.type = b2_dynamicBody;
			bd.position.Set(6.5f, 4.1f);
			b6 = m_world->CreateBody(&bd);
			b6->CreateFixture(&shape, 30.0f);
		}

		anchor.Set(7.5f, 4.0f);
		jd.Initialize(b5, b6, anchor);
		m_world->CreateJoint(&jd);

		b2Body* b7;
		{
			b2PolygonShape shape;
			shape.SetAsBox(0.1f, 1.0f);

			b2BodyDef bd;
			bd.type = b2_dynamicBody;
			bd.position.Set(7.4f, 1.0f);

			b7 = m_world->CreateBody(&bd);
			b7->CreateFixture(&shape, 10.0f);
		}

		b2DistanceJointDef djd;
		djd.bodyA = b3;
		djd.bodyB = b7;
		djd.localAnchorA.Set(6.0f, 0.0f);
		djd.localAnchorB.Set(0.0f, -1.0f);
		b2Vec2 d = djd.bodyB->GetWorldPoint(djd.localAnchorB) - djd.bodyA->GetWorldPoint(djd.localAnchorA);
		djd.length = d.Length();
		m_world->CreateJoint(&djd);

		{
			float32 radius = 0.2f;

			b2CircleShape shape;
			shape.m_radius = radius;

			for (int32 i = 0; i < 4; ++i)
			{
				b2BodyDef bd;
				bd.type = b2_dynamicBody;
				bd.position.Set(5.9f + 2.0f * radius * i, 2.4f);
				b2Body* body = m_world->CreateBody(&bd);
				body->CreateFixture(&shape, 10.0f);
			}
		}
	}

	static Test* Create()
	{
		return new Dominos;
	}
};

#endif
