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

#ifndef LINE_JOINT_H
#define LINE_JOINT_H

// A line joint with a limit and friction.
class LineJoint : public Test
{
public:
	LineJoint()
	{
		b2Body* ground = NULL;
		{
			b2PolygonShape shape;
			shape.SetAsEdge(b2Vec2(-40.0f, 0.0f), b2Vec2(40.0f, 0.0f));

			b2BodyDef bd;
			ground = m_world->CreateBody(&bd);
			ground->CreateFixture(&shape, 0.0f);
		}

		{
			b2PolygonShape shape;
			shape.SetAsBox(0.5f, 2.0f);

			b2BodyDef bd;
			bd.type = b2_dynamicBody;
			bd.position.Set(0.0f, 7.0f);
			b2Body* body = m_world->CreateBody(&bd);
			body->CreateFixture(&shape, 1.0f);

			b2LineJointDef jd;
			b2Vec2 axis(2.0f, 1.0f);
			axis.Normalize();
			jd.Initialize(ground, body, b2Vec2(0.0f, 8.5f), axis);
			jd.motorSpeed = 0.0f;
			jd.maxMotorForce = 100.0f;
			jd.enableMotor = true;
			jd.lowerTranslation = -4.0f;
			jd.upperTranslation = 4.0f;
			jd.enableLimit = true;
			m_world->CreateJoint(&jd);
		}
	}

	static Test* Create()
	{
		return new LineJoint;
	}
};

#endif
