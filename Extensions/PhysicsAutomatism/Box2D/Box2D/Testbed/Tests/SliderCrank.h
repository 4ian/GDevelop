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

#ifndef SLIDER_CRANK_H
#define SLIDER_CRANK_H

// A motor driven slider crank with joint friction.

class SliderCrank : public Test
{
public:
	SliderCrank()
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
			b2Body* prevBody = ground;

			// Define crank.
			{
				b2PolygonShape shape;
				shape.SetAsBox(0.5f, 2.0f);

				b2BodyDef bd;
				bd.type = b2_dynamicBody;
				bd.position.Set(0.0f, 7.0f);
				b2Body* body = m_world->CreateBody(&bd);
				body->CreateFixture(&shape, 2.0f);

				b2RevoluteJointDef rjd;
				rjd.Initialize(prevBody, body, b2Vec2(0.0f, 5.0f));
				rjd.motorSpeed = 1.0f * b2_pi;
				rjd.maxMotorTorque = 10000.0f;
				rjd.enableMotor = true;
				m_joint1 = (b2RevoluteJoint*)m_world->CreateJoint(&rjd);

				prevBody = body;
			}

			// Define follower.
			{
				b2PolygonShape shape;
				shape.SetAsBox(0.5f, 4.0f);

				b2BodyDef bd;
				bd.type = b2_dynamicBody;
				bd.position.Set(0.0f, 13.0f);
				b2Body* body = m_world->CreateBody(&bd);
				body->CreateFixture(&shape, 2.0f);

				b2RevoluteJointDef rjd;
				rjd.Initialize(prevBody, body, b2Vec2(0.0f, 9.0f));
				rjd.enableMotor = false;
				m_world->CreateJoint(&rjd);

				prevBody = body;
			}

			// Define piston
			{
				b2PolygonShape shape;
				shape.SetAsBox(1.5f, 1.5f);

				b2BodyDef bd;
				bd.type = b2_dynamicBody;
				bd.position.Set(0.0f, 17.0f);
				b2Body* body = m_world->CreateBody(&bd);
				body->CreateFixture(&shape, 2.0f);

				b2RevoluteJointDef rjd;
				rjd.Initialize(prevBody, body, b2Vec2(0.0f, 17.0f));
				m_world->CreateJoint(&rjd);

				b2PrismaticJointDef pjd;
				pjd.Initialize(ground, body, b2Vec2(0.0f, 17.0f), b2Vec2(0.0f, 1.0f));

				pjd.maxMotorForce = 1000.0f;
				pjd.enableMotor = true;

				m_joint2 = (b2PrismaticJoint*)m_world->CreateJoint(&pjd);
			}

			// Create a payload
			{
				b2PolygonShape shape;
				shape.SetAsBox(1.5f, 1.5f);

				b2BodyDef bd;
				bd.type = b2_dynamicBody;
				bd.position.Set(0.0f, 23.0f);
				b2Body* body = m_world->CreateBody(&bd);
				body->CreateFixture(&shape, 2.0f);
			}
		}
	}

	void Keyboard(unsigned char key)
	{
		switch (key)
		{
		case 'f':
			m_joint2->EnableMotor(!m_joint2->IsMotorEnabled());
			m_joint2->GetBodyB()->SetAwake(true);
			break;

		case 'm':
			m_joint1->EnableMotor(!m_joint1->IsMotorEnabled());
			m_joint1->GetBodyB()->SetAwake(true);
			break;
		}
	}

	void Step(Settings* settings)
	{
		Test::Step(settings);
		m_debugDraw.DrawString(5, m_textLine, "Keys: (f) toggle friction, (m) toggle motor");
		m_textLine += 15;
		float32 torque = m_joint1->GetMotorTorque();
		m_debugDraw.DrawString(5, m_textLine, "Motor Torque = %5.0f", (float) torque);
		m_textLine += 15;
	}

	static Test* Create()
	{
		return new SliderCrank;
	}

	b2RevoluteJoint* m_joint1;
	b2PrismaticJoint* m_joint2;
};

#endif
