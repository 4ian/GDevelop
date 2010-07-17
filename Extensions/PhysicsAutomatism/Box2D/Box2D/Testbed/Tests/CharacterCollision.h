/*
* Copyright (c) 2006-2010 Erin Catto http://www.gphysics.com
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

#ifndef CHARACTER_COLLISION_H
#define CHARACTER_COLLISION_H

/// This is a test of typical character collision scenarios. This does not
/// show how you should implement a character in your application.

class CharacterCollision : public Test
{
public:
	CharacterCollision()
	{
		// Ground body
		{
			b2BodyDef bd;
			b2Body* ground = m_world->CreateBody(&bd);

			b2PolygonShape shape;
			shape.SetAsEdge(b2Vec2(-20.0f, 0.0f), b2Vec2(20.0f, 0.0f));
			ground->CreateFixture(&shape, 0.0f);
		}

		// Collinear edges
		{
			b2BodyDef bd;
			b2Body* ground = m_world->CreateBody(&bd);

			b2PolygonShape shape;
			shape.m_radius = 0.0f;
			shape.SetAsEdge(b2Vec2(-8.0f, 1.0f), b2Vec2(-6.0f, 1.0f));
			ground->CreateFixture(&shape, 0.0f);
			shape.SetAsEdge(b2Vec2(-6.0f, 1.0f), b2Vec2(-4.0f, 1.0f));
			ground->CreateFixture(&shape, 0.0f);
			shape.SetAsEdge(b2Vec2(-4.0f, 1.0f), b2Vec2(-2.0f, 1.0f));
			ground->CreateFixture(&shape, 0.0f);
		}

		// Square tiles
		{
			b2BodyDef bd;
			b2Body* ground = m_world->CreateBody(&bd);

			b2PolygonShape shape;
			shape.SetAsBox(1.0f, 1.0f, b2Vec2(4.0f, 3.0f), 0.0f);
			ground->CreateFixture(&shape, 0.0f);
			shape.SetAsBox(1.0f, 1.0f, b2Vec2(6.0f, 3.0f), 0.0f);
			ground->CreateFixture(&shape, 0.0f);
			shape.SetAsBox(1.0f, 1.0f, b2Vec2(8.0f, 3.0f), 0.0f);
			ground->CreateFixture(&shape, 0.0f);
		}

		// Square made from edges notice how the edges are shrunk to account
		// for the polygon radius. This makes it so the square character does
		// not get snagged. However, ray casts can now go through the cracks.
		{
			b2BodyDef bd;
			b2Body* ground = m_world->CreateBody(&bd);

			b2PolygonShape shape;
			float32 d = 2.0f * b2_polygonRadius;
			shape.SetAsEdge(b2Vec2(-1.0f + d, 3.0f), b2Vec2(1.0f - d, 3.0f));
			ground->CreateFixture(&shape, 0.0f);
			shape.SetAsEdge(b2Vec2(1.0f, 3.0f + d), b2Vec2(1.0f, 5.0f - d));
			ground->CreateFixture(&shape, 0.0f);
			shape.SetAsEdge(b2Vec2(1.0f - d, 5.0f), b2Vec2(-1.0f + d, 5.0f));
			ground->CreateFixture(&shape, 0.0f);
			shape.SetAsEdge(b2Vec2(-1.0f, 5.0f - d), b2Vec2(-1.0f, 3.0f + d));
			ground->CreateFixture(&shape, 0.0f);
		}

		// Square character
		{
			b2BodyDef bd;
			bd.position.Set(-3.0f, 5.0f);
			bd.type = b2_dynamicBody;
			bd.fixedRotation = true;
			bd.allowSleep = false;

			b2Body* body = m_world->CreateBody(&bd);

			b2PolygonShape shape;
			shape.SetAsBox(0.5f, 0.5f);

			b2FixtureDef fd;
			fd.shape = &shape;
			fd.density = 20.0f;
			body->CreateFixture(&fd);
		}

		// Hexagon character
		{
			b2BodyDef bd;
			bd.position.Set(-5.0f, 5.0f);
			bd.type = b2_dynamicBody;
			bd.fixedRotation = true;
			bd.allowSleep = false;

			b2Body* body = m_world->CreateBody(&bd);

			float32 angle = 0.0f;
			float32 delta = b2_pi / 3.0f;
			b2Vec2 vertices[6];
			for (int32 i = 0; i < 6; ++i)
			{
				vertices[i].Set(0.5f * cosf(angle), 0.5f * sinf(angle));
				angle += delta;
			}

			b2PolygonShape shape;
			shape.Set(vertices, 6);

			b2FixtureDef fd;
			fd.shape = &shape;
			fd.density = 20.0f;
			body->CreateFixture(&fd);
		}

		// Circle character
		{
			b2BodyDef bd;
			bd.position.Set(3.0f, 5.0f);
			bd.type = b2_dynamicBody;
			bd.fixedRotation = true;
			bd.allowSleep = false;

			b2Body* body = m_world->CreateBody(&bd);

			b2CircleShape shape;
			shape.m_radius = 0.5f;

			b2FixtureDef fd;
			fd.shape = &shape;
			fd.density = 20.0f;
			body->CreateFixture(&fd);
		}
	}

	void Step(Settings* settings)
	{
		Test::Step(settings);
		m_debugDraw.DrawString(5, m_textLine, "This tests various character collision shapes");
		m_textLine += 15;
	}

	static Test* Create()
	{
		return new CharacterCollision;
	}
};

#endif
