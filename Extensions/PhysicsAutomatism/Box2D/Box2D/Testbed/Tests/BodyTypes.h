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

#ifndef BODY_TYPES_H
#define BODY_TYPES_H

class BodyTypes : public Test
{
public:
	BodyTypes()
	{
		b2Body* ground = NULL;
		{
			b2BodyDef bd;
			ground = m_world->CreateBody(&bd);

			b2PolygonShape shape;
			shape.SetAsEdge(b2Vec2(-20.0f, 0.0f), b2Vec2(20.0f, 0.0f));

			b2FixtureDef fd;
			fd.shape = &shape;

			ground->CreateFixture(&fd);
		}

		// Define attachment
		{
			b2BodyDef bd;
			bd.type = b2_dynamicBody;
			bd.position.Set(0.0f, 3.0f);
			m_attachment = m_world->CreateBody(&bd);

			b2PolygonShape shape;
			shape.SetAsBox(0.5f, 2.0f);
			m_attachment->CreateFixture(&shape, 2.0f);
		}

		// Define platform
		{
			b2BodyDef bd;
			bd.type = b2_dynamicBody;
			bd.position.Set(-4.0f, 5.0f);
			m_platform = m_world->CreateBody(&bd);

			b2PolygonShape shape;
			shape.SetAsBox(0.5f, 4.0f, b2Vec2(4.0f, 0.0f), 0.5f * b2_pi);

			b2FixtureDef fd;
			fd.shape = &shape;
			fd.friction = 0.6f;
			fd.density = 2.0f;
			m_platform->CreateFixture(&fd);

			b2RevoluteJointDef rjd;
			rjd.Initialize(m_attachment, m_platform, b2Vec2(0.0f, 5.0f));
			rjd.maxMotorTorque = 50.0f;
			rjd.enableMotor = true;
			m_world->CreateJoint(&rjd);

			b2PrismaticJointDef pjd;
			pjd.Initialize(ground, m_platform, b2Vec2(0.0f, 5.0f), b2Vec2(1.0f, 0.0f));

			pjd.maxMotorForce = 1000.0f;
			pjd.enableMotor = true;
			pjd.lowerTranslation = -10.0f;
			pjd.upperTranslation = 10.0f;
			pjd.enableLimit = true;

			(b2PrismaticJoint*)m_world->CreateJoint(&pjd);

			m_speed = 3.0f;
		}

		// Create a payload
		{
			b2BodyDef bd;
			bd.type = b2_dynamicBody;
			bd.position.Set(0.0f, 8.0f);
			b2Body* body = m_world->CreateBody(&bd);

			b2PolygonShape shape;
			shape.SetAsBox(0.75f, 0.75f);

			b2FixtureDef fd;
			fd.shape = &shape;
			fd.friction = 0.6f;
			fd.density = 2.0f;

			body->CreateFixture(&fd);
		}
	}

	void Keyboard(unsigned char key)
	{
		switch (key)
		{
		case 'd':
			m_platform->SetType(b2_dynamicBody);
			break;

		case 's':
			m_platform->SetType(b2_staticBody);
			break;

		case 'k':
			m_platform->SetType(b2_kinematicBody);
			m_platform->SetLinearVelocity(b2Vec2(-m_speed, 0.0f));
			m_platform->SetAngularVelocity(0.0f);
			break;
		}
	}

	void Step(Settings* settings)
	{
		// Drive the kinematic body.
		if (m_platform->GetType() == b2_kinematicBody)
		{
			b2Vec2 p = m_platform->GetTransform().position;
			b2Vec2 v = m_platform->GetLinearVelocity();

			if ((p.x < -10.0f && v.x < 0.0f) ||
				(p.x > 10.0f && v.x > 0.0f))
			{
				v.x = -v.x;
				m_platform->SetLinearVelocity(v);
			}
		}

		Test::Step(settings);
		m_debugDraw.DrawString(5, m_textLine, "Keys: (d) dynamic, (s) static, (k) kinematic");
		m_textLine += 15;
	}

	static Test* Create()
	{
		return new BodyTypes;
	}

	b2Body* m_attachment;
	b2Body* m_platform;
	float32 m_speed;
};

#endif
