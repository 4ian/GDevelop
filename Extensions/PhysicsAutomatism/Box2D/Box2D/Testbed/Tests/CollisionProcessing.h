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

#ifndef COLLISION_PROCESSING_H
#define COLLISION_PROCESSING_H

#include <algorithm>

// This test shows collision processing and tests
// deferred body destruction.
class CollisionProcessing : public Test
{
public:
	CollisionProcessing()
	{
		// Ground body
		{
			b2PolygonShape shape;
			shape.SetAsEdge(b2Vec2(-50.0f, 0.0f), b2Vec2(50.0f, 0.0f));

			b2FixtureDef sd;
			sd.shape = &shape;;

			b2BodyDef bd;
			b2Body* ground = m_world->CreateBody(&bd);
			ground->CreateFixture(&sd);
		}

		float32 xLo = -5.0f, xHi = 5.0f;
		float32 yLo = 2.0f, yHi = 35.0f;

		// Small triangle
		b2Vec2 vertices[3];
		vertices[0].Set(-1.0f, 0.0f);
		vertices[1].Set(1.0f, 0.0f);
		vertices[2].Set(0.0f, 2.0f);

		b2PolygonShape polygon;
		polygon.Set(vertices, 3);

		b2FixtureDef triangleShapeDef;
		triangleShapeDef.shape = &polygon;
		triangleShapeDef.density = 1.0f;

		b2BodyDef triangleBodyDef;
		triangleBodyDef.type = b2_dynamicBody;
		triangleBodyDef.position.Set(RandomFloat(xLo, xHi), RandomFloat(yLo, yHi));

		b2Body* body1 = m_world->CreateBody(&triangleBodyDef);
		body1->CreateFixture(&triangleShapeDef);

		// Large triangle (recycle definitions)
		vertices[0] *= 2.0f;
		vertices[1] *= 2.0f;
		vertices[2] *= 2.0f;
		polygon.Set(vertices, 3);

		triangleBodyDef.position.Set(RandomFloat(xLo, xHi), RandomFloat(yLo, yHi));

		b2Body* body2 = m_world->CreateBody(&triangleBodyDef);
		body2->CreateFixture(&triangleShapeDef);
		
		// Small box
		polygon.SetAsBox(1.0f, 0.5f);

		b2FixtureDef boxShapeDef;
		boxShapeDef.shape = &polygon;
		boxShapeDef.density = 1.0f;

		b2BodyDef boxBodyDef;
		boxBodyDef.type = b2_dynamicBody;
		boxBodyDef.position.Set(RandomFloat(xLo, xHi), RandomFloat(yLo, yHi));

		b2Body* body3 = m_world->CreateBody(&boxBodyDef);
		body3->CreateFixture(&boxShapeDef);

		// Large box (recycle definitions)
		polygon.SetAsBox(2.0f, 1.0f);
		boxBodyDef.position.Set(RandomFloat(xLo, xHi), RandomFloat(yLo, yHi));
		
		b2Body* body4 = m_world->CreateBody(&boxBodyDef);
		body4->CreateFixture(&boxShapeDef);

		// Small circle
		b2CircleShape circle;
		circle.m_radius = 1.0f;

		b2FixtureDef circleShapeDef;
		circleShapeDef.shape = &circle;
		circleShapeDef.density = 1.0f;

		b2BodyDef circleBodyDef;
		circleBodyDef.type = b2_dynamicBody;
		circleBodyDef.position.Set(RandomFloat(xLo, xHi), RandomFloat(yLo, yHi));

		b2Body* body5 = m_world->CreateBody(&circleBodyDef);
		body5->CreateFixture(&circleShapeDef);

		// Large circle
		circle.m_radius *= 2.0f;
		circleBodyDef.position.Set(RandomFloat(xLo, xHi), RandomFloat(yLo, yHi));

		b2Body* body6 = m_world->CreateBody(&circleBodyDef);
		body6->CreateFixture(&circleShapeDef);
	}

	void Step(Settings* settings)
	{
		Test::Step(settings);

		// We are going to destroy some bodies according to contact
		// points. We must buffer the bodies that should be destroyed
		// because they may belong to multiple contact points.
		const int32 k_maxNuke = 6;
		b2Body* nuke[k_maxNuke];
		int32 nukeCount = 0;

		// Traverse the contact results. Destroy bodies that
		// are touching heavier bodies.
		for (int32 i = 0; i < m_pointCount; ++i)
		{
			ContactPoint* point = m_points + i;

			b2Body* body1 = point->fixtureA->GetBody();
			b2Body* body2 = point->fixtureB->GetBody();
			float32 mass1 = body1->GetMass();
			float32 mass2 = body2->GetMass();

			if (mass1 > 0.0f && mass2 > 0.0f)
			{
				if (mass2 > mass1)
				{
					nuke[nukeCount++] = body1;
				}
				else
				{
					nuke[nukeCount++] = body2;
				}

				if (nukeCount == k_maxNuke)
				{
					break;
				}
			}
		}

		// Sort the nuke array to group duplicates.
		std::sort(nuke, nuke + nukeCount);

		// Destroy the bodies, skipping duplicates.
		int32 i = 0;
		while (i < nukeCount)
		{
			b2Body* b = nuke[i++];
			while (i < nukeCount && nuke[i] == b)
			{
				++i;
			}

			if (b != m_bomb)
			{
				m_world->DestroyBody(b);
			}
		}
	}

	static Test* Create()
	{
		return new CollisionProcessing;
	}
};

#endif
