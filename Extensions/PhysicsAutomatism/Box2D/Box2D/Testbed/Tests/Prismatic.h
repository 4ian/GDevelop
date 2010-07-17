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

#ifndef PRISMATIC_H
#define PRISMATIC_H

class Prismatic : public Test
{
public:
	Prismatic()
	{
		b2Body* ground = NULL;
		{
			b2BodyDef bd;
			ground = m_world->CreateBody(&bd);

			b2PolygonShape shape;
			shape.SetAsEdge(b2Vec2(-40.0f, 0.0f), b2Vec2(40.0f, 0.0f));
			ground->CreateFixture(&shape, 0.0f);
		}

		{
			b2PolygonShape shape;
			shape.SetAsBox(2.0f, 0.5f);

			b2BodyDef bd;
			bd.type = b2_dynamicBody;
			bd.position.Set(-10.0f, 10.0f);
			bd.angle = 0.5f * b2_pi;
			bd.allowSleep = false;
			b2Body* body = m_world->CreateBody(&bd);
			body->CreateFixture(&shape, 5.0f);

			b2PrismaticJointDef pjd;

			// Bouncy limit
			b2Vec2 axis(2.0f, 1.0f);
			axis.Normalize();
			pjd.Initialize(ground, body, b2Vec2(0.0f, 0.0f), axis);

			// Non-bouncy limit
			//pjd.Initialize(ground, body, b2Vec2(-10.0f, 10.0f), b2Vec2(1.0f, 0.0f));

			pjd.motorSpeed = 10.0f;
			pjd.maxMotorForce = 10000.0f;
			pjd.enableMotor = true;
			pjd.lowerTranslation = 0.0f;
			pjd.upperTranslation = 20.0f;
			pjd.enableLimit = true;

			m_joint = (b2PrismaticJoint*)m_world->CreateJoint(&pjd);
		}
	}

	void Keyboard(unsigned char key)
	{
		switch (key)
		{
		case 'l':
			m_joint->EnableLimit(!m_joint->IsLimitEnabled());
			break;

		case 'm':
			m_joint->EnableMotor(!m_joint->IsMotorEnabled());
			break;

		case 's':
			m_joint->SetMotorSpeed(-m_joint->GetMotorSpeed());
			break;
		}
	}

	void Step(Settings* settings)
	{
		Test::Step(settings);
		m_debugDraw.DrawString(5, m_textLine, "Keys: (l) limits, (m) motors, (s) speed");
		m_textLine += 15;
		float32 force = m_joint->GetMotorForce();
		m_debugDraw.DrawString(5, m_textLine, "Motor Force = %4.0f", (float) force);
		m_textLine += 15;
	}

	static Test* Create()
	{
		return new Prismatic;
	}

	b2PrismaticJoint* m_joint;
};

#endif
