/*
* Copyright (c) 2009 Erin Catto http://www.gphysics.com
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

#ifndef CONFINED_H
#define CONFINED_H

class Confined : public Test
{
public:

	enum
	{
		e_columnCount = 0,
		e_rowCount = 0
	};

	Confined()
	{
		{
			b2BodyDef bd;
			b2Body* ground = m_world->CreateBody(&bd);

			b2PolygonShape shape;

			// Floor
			shape.SetAsEdge(b2Vec2(-10.0f, 0.0f), b2Vec2(10.0f, 0.0f));
			ground->CreateFixture(&shape, 0.0f);

			// Left wall
			shape.SetAsEdge(b2Vec2(-10.0f, 0.0f), b2Vec2(-10.0f, 20.0f));
			ground->CreateFixture(&shape, 0.0f);

			// Right wall
			shape.SetAsEdge(b2Vec2(10.0f, 0.0f), b2Vec2(10.0f, 20.0f));
			ground->CreateFixture(&shape, 0.0f);

			// Roof
			shape.SetAsEdge(b2Vec2(-10.0f, 20.0f), b2Vec2(10.0f, 20.0f));
			ground->CreateFixture(&shape, 0.0f);
		}

		float32 radius = 0.5f;
		b2CircleShape shape;
		shape.m_p.SetZero();
		shape.m_radius = radius;

		b2FixtureDef fd;
		fd.shape = &shape;
		fd.density = 1.0f;
		fd.friction = 0.1f;

		for (int32 j = 0; j < e_columnCount; ++j)
		{
			for (int i = 0; i < e_rowCount; ++i)
			{
				b2BodyDef bd;
				bd.type = b2_dynamicBody;
				bd.position.Set(-10.0f + (2.1f * j + 1.0f + 0.01f * i) * radius, (2.0f * i + 1.0f) * radius);
				b2Body* body = m_world->CreateBody(&bd);

				body->CreateFixture(&fd);
			}
		}

		m_world->SetGravity(b2Vec2(0.0f, 0.0f));
	}

	void CreateCircle()
	{
		float32 radius = 2.0f;
		b2CircleShape shape;
		shape.m_p.SetZero();
		shape.m_radius = radius;

		b2FixtureDef fd;
		fd.shape = &shape;
		fd.density = 1.0f;
		fd.friction = 0.0f;

		b2Vec2 p(RandomFloat(), 3.0f + RandomFloat());
		b2BodyDef bd;
		bd.type = b2_dynamicBody;
		bd.position = p;
		//bd.allowSleep = false;
		b2Body* body = m_world->CreateBody(&bd);

		body->CreateFixture(&fd);
	}

	void Keyboard(unsigned char key)
	{
		switch (key)
		{
		case 'c':
			CreateCircle();
			break;
		}
	}

	void Step(Settings* settings)
	{
		bool sleeping = true;
		for (b2Body* b = m_world->GetBodyList(); b; b = b->GetNext())
		{
			if (b->GetType() != b2_dynamicBody)
			{
				continue;
			}

			if (b->IsAwake())
			{
				sleeping = false;
			}
		}

		if (m_stepCount == 180)
		{
			m_stepCount += 0;
		}

		//if (sleeping)
		//{
		//	CreateCircle();
		//}

		Test::Step(settings);

		for (b2Body* b = m_world->GetBodyList(); b; b = b->GetNext())
		{
			if (b->GetType() != b2_dynamicBody)
			{
				continue;
			}

			b2Vec2 p = b->GetPosition();
			if (p.x <= -10.0f || 10.0f <= p.x || p.y <= 0.0f || 20.0f <= p.y)
			{
				p.x += 0.0;
			}
		}

		m_debugDraw.DrawString(5, m_textLine, "Press 'c' to create a circle.");
		m_textLine += 15;
	}

	static Test* Create()
	{
		return new Confined;
	}
};

#endif
