/*
* Copyright (c) 2007 Erin Catto http://www.gphysics.com
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

#include <Box2D/Dynamics/Joints/b2PulleyJoint.h>
#include <Box2D/Dynamics/b2Body.h>
#include <Box2D/Dynamics/b2TimeStep.h>

// Pulley:
// length1 = norm(p1 - s1)
// length2 = norm(p2 - s2)
// C0 = (length1 + ratio * length2)_initial
// C = C0 - (length1 + ratio * length2) >= 0
// u1 = (p1 - s1) / norm(p1 - s1)
// u2 = (p2 - s2) / norm(p2 - s2)
// Cdot = -dot(u1, v1 + cross(w1, r1)) - ratio * dot(u2, v2 + cross(w2, r2))
// J = -[u1 cross(r1, u1) ratio * u2  ratio * cross(r2, u2)]
// K = J * invM * JT
//   = invMass1 + invI1 * cross(r1, u1)^2 + ratio^2 * (invMass2 + invI2 * cross(r2, u2)^2)
//
// Limit:
// C = maxLength - length
// u = (p - s) / norm(p - s)
// Cdot = -dot(u, v + cross(w, r))
// K = invMass + invI * cross(r, u)^2
// 0 <= impulse

void b2PulleyJointDef::Initialize(b2Body* b1, b2Body* b2,
				const b2Vec2& ga1, const b2Vec2& ga2,
				const b2Vec2& anchor1, const b2Vec2& anchor2,
				float32 r)
{
	bodyA = b1;
	bodyB = b2;
	groundAnchorA = ga1;
	groundAnchorB = ga2;
	localAnchorA = bodyA->GetLocalPoint(anchor1);
	localAnchorB = bodyB->GetLocalPoint(anchor2);
	b2Vec2 d1 = anchor1 - ga1;
	lengthA = d1.Length();
	b2Vec2 d2 = anchor2 - ga2;
	lengthB = d2.Length();
	ratio = r;
	b2Assert(ratio > b2_epsilon);
	float32 C = lengthA + ratio * lengthB;
	maxLengthA = C - ratio * b2_minPulleyLength;
	maxLengthB = (C - b2_minPulleyLength) / ratio;
}

b2PulleyJoint::b2PulleyJoint(const b2PulleyJointDef* def)
: b2Joint(def)
{
	m_groundAnchor1 = def->groundAnchorA;
	m_groundAnchor2 = def->groundAnchorB;
	m_localAnchor1 = def->localAnchorA;
	m_localAnchor2 = def->localAnchorB;

	b2Assert(def->ratio != 0.0f);
	m_ratio = def->ratio;

	m_constant = def->lengthA + m_ratio * def->lengthB;

	m_maxLength1 = b2Min(def->maxLengthA, m_constant - m_ratio * b2_minPulleyLength);
	m_maxLength2 = b2Min(def->maxLengthB, (m_constant - b2_minPulleyLength) / m_ratio);

	m_impulse = 0.0f;
	m_limitImpulse1 = 0.0f;
	m_limitImpulse2 = 0.0f;
}

void b2PulleyJoint::InitVelocityConstraints(const b2TimeStep& step)
{
	b2Body* b1 = m_bodyA;
	b2Body* b2 = m_bodyB;

	b2Vec2 r1 = b2Mul(b1->GetTransform().R, m_localAnchor1 - b1->GetLocalCenter());
	b2Vec2 r2 = b2Mul(b2->GetTransform().R, m_localAnchor2 - b2->GetLocalCenter());

	b2Vec2 p1 = b1->m_sweep.c + r1;
	b2Vec2 p2 = b2->m_sweep.c + r2;

	b2Vec2 s1 = m_groundAnchor1;
	b2Vec2 s2 = m_groundAnchor2;

	// Get the pulley axes.
	m_u1 = p1 - s1;
	m_u2 = p2 - s2;

	float32 length1 = m_u1.Length();
	float32 length2 = m_u2.Length();

	if (length1 > b2_linearSlop)
	{
		m_u1 *= 1.0f / length1;
	}
	else
	{
		m_u1.SetZero();
	}

	if (length2 > b2_linearSlop)
	{
		m_u2 *= 1.0f / length2;
	}
	else
	{
		m_u2.SetZero();
	}

	float32 C = m_constant - length1 - m_ratio * length2;
	if (C > 0.0f)
	{
		m_state = e_inactiveLimit;
		m_impulse = 0.0f;
	}
	else
	{
		m_state = e_atUpperLimit;
	}

	if (length1 < m_maxLength1)
	{
		m_limitState1 = e_inactiveLimit;
		m_limitImpulse1 = 0.0f;
	}
	else
	{
		m_limitState1 = e_atUpperLimit;
	}

	if (length2 < m_maxLength2)
	{
		m_limitState2 = e_inactiveLimit;
		m_limitImpulse2 = 0.0f;
	}
	else
	{
		m_limitState2 = e_atUpperLimit;
	}

	// Compute effective mass.
	float32 cr1u1 = b2Cross(r1, m_u1);
	float32 cr2u2 = b2Cross(r2, m_u2);

	m_limitMass1 = b1->m_invMass + b1->m_invI * cr1u1 * cr1u1;
	m_limitMass2 = b2->m_invMass + b2->m_invI * cr2u2 * cr2u2;
	m_pulleyMass = m_limitMass1 + m_ratio * m_ratio * m_limitMass2;
	b2Assert(m_limitMass1 > b2_epsilon);
	b2Assert(m_limitMass2 > b2_epsilon);
	b2Assert(m_pulleyMass > b2_epsilon);
	m_limitMass1 = 1.0f / m_limitMass1;
	m_limitMass2 = 1.0f / m_limitMass2;
	m_pulleyMass = 1.0f / m_pulleyMass;

	if (step.warmStarting)
	{
		// Scale impulses to support variable time steps.
		m_impulse *= step.dtRatio;
		m_limitImpulse1 *= step.dtRatio;
		m_limitImpulse2 *= step.dtRatio;

		// Warm starting.
		b2Vec2 P1 = -(m_impulse + m_limitImpulse1) * m_u1;
		b2Vec2 P2 = (-m_ratio * m_impulse - m_limitImpulse2) * m_u2;
		b1->m_linearVelocity += b1->m_invMass * P1;
		b1->m_angularVelocity += b1->m_invI * b2Cross(r1, P1);
		b2->m_linearVelocity += b2->m_invMass * P2;
		b2->m_angularVelocity += b2->m_invI * b2Cross(r2, P2);
	}
	else
	{
		m_impulse = 0.0f;
		m_limitImpulse1 = 0.0f;
		m_limitImpulse2 = 0.0f;
	}
}

void b2PulleyJoint::SolveVelocityConstraints(const b2TimeStep& step)
{
	B2_NOT_USED(step);

	b2Body* b1 = m_bodyA;
	b2Body* b2 = m_bodyB;

	b2Vec2 r1 = b2Mul(b1->GetTransform().R, m_localAnchor1 - b1->GetLocalCenter());
	b2Vec2 r2 = b2Mul(b2->GetTransform().R, m_localAnchor2 - b2->GetLocalCenter());

	if (m_state == e_atUpperLimit)
	{
		b2Vec2 v1 = b1->m_linearVelocity + b2Cross(b1->m_angularVelocity, r1);
		b2Vec2 v2 = b2->m_linearVelocity + b2Cross(b2->m_angularVelocity, r2);

		float32 Cdot = -b2Dot(m_u1, v1) - m_ratio * b2Dot(m_u2, v2);
		float32 impulse = m_pulleyMass * (-Cdot);
		float32 oldImpulse = m_impulse;
		m_impulse = b2Max(0.0f, m_impulse + impulse);
		impulse = m_impulse - oldImpulse;

		b2Vec2 P1 = -impulse * m_u1;
		b2Vec2 P2 = -m_ratio * impulse * m_u2;
		b1->m_linearVelocity += b1->m_invMass * P1;
		b1->m_angularVelocity += b1->m_invI * b2Cross(r1, P1);
		b2->m_linearVelocity += b2->m_invMass * P2;
		b2->m_angularVelocity += b2->m_invI * b2Cross(r2, P2);
	}

	if (m_limitState1 == e_atUpperLimit)
	{
		b2Vec2 v1 = b1->m_linearVelocity + b2Cross(b1->m_angularVelocity, r1);

		float32 Cdot = -b2Dot(m_u1, v1);
		float32 impulse = -m_limitMass1 * Cdot;
		float32 oldImpulse = m_limitImpulse1;
		m_limitImpulse1 = b2Max(0.0f, m_limitImpulse1 + impulse);
		impulse = m_limitImpulse1 - oldImpulse;

		b2Vec2 P1 = -impulse * m_u1;
		b1->m_linearVelocity += b1->m_invMass * P1;
		b1->m_angularVelocity += b1->m_invI * b2Cross(r1, P1);
	}

	if (m_limitState2 == e_atUpperLimit)
	{
		b2Vec2 v2 = b2->m_linearVelocity + b2Cross(b2->m_angularVelocity, r2);

		float32 Cdot = -b2Dot(m_u2, v2);
		float32 impulse = -m_limitMass2 * Cdot;
		float32 oldImpulse = m_limitImpulse2;
		m_limitImpulse2 = b2Max(0.0f, m_limitImpulse2 + impulse);
		impulse = m_limitImpulse2 - oldImpulse;

		b2Vec2 P2 = -impulse * m_u2;
		b2->m_linearVelocity += b2->m_invMass * P2;
		b2->m_angularVelocity += b2->m_invI * b2Cross(r2, P2);
	}
}

bool b2PulleyJoint::SolvePositionConstraints(float32 baumgarte)
{
	B2_NOT_USED(baumgarte);

	b2Body* b1 = m_bodyA;
	b2Body* b2 = m_bodyB;

	b2Vec2 s1 = m_groundAnchor1;
	b2Vec2 s2 = m_groundAnchor2;

	float32 linearError = 0.0f;

	if (m_state == e_atUpperLimit)
	{
		b2Vec2 r1 = b2Mul(b1->GetTransform().R, m_localAnchor1 - b1->GetLocalCenter());
		b2Vec2 r2 = b2Mul(b2->GetTransform().R, m_localAnchor2 - b2->GetLocalCenter());

		b2Vec2 p1 = b1->m_sweep.c + r1;
		b2Vec2 p2 = b2->m_sweep.c + r2;

		// Get the pulley axes.
		m_u1 = p1 - s1;
		m_u2 = p2 - s2;

		float32 length1 = m_u1.Length();
		float32 length2 = m_u2.Length();

		if (length1 > b2_linearSlop)
		{
			m_u1 *= 1.0f / length1;
		}
		else
		{
			m_u1.SetZero();
		}

		if (length2 > b2_linearSlop)
		{
			m_u2 *= 1.0f / length2;
		}
		else
		{
			m_u2.SetZero();
		}

		float32 C = m_constant - length1 - m_ratio * length2;
		linearError = b2Max(linearError, -C);

		C = b2Clamp(C + b2_linearSlop, -b2_maxLinearCorrection, 0.0f);
		float32 impulse = -m_pulleyMass * C;

		b2Vec2 P1 = -impulse * m_u1;
		b2Vec2 P2 = -m_ratio * impulse * m_u2;

		b1->m_sweep.c += b1->m_invMass * P1;
		b1->m_sweep.a += b1->m_invI * b2Cross(r1, P1);
		b2->m_sweep.c += b2->m_invMass * P2;
		b2->m_sweep.a += b2->m_invI * b2Cross(r2, P2);

		b1->SynchronizeTransform();
		b2->SynchronizeTransform();
	}

	if (m_limitState1 == e_atUpperLimit)
	{
		b2Vec2 r1 = b2Mul(b1->GetTransform().R, m_localAnchor1 - b1->GetLocalCenter());
		b2Vec2 p1 = b1->m_sweep.c + r1;

		m_u1 = p1 - s1;
		float32 length1 = m_u1.Length();

		if (length1 > b2_linearSlop)
		{
			m_u1 *= 1.0f / length1;
		}
		else
		{
			m_u1.SetZero();
		}

		float32 C = m_maxLength1 - length1;
		linearError = b2Max(linearError, -C);
		C = b2Clamp(C + b2_linearSlop, -b2_maxLinearCorrection, 0.0f);
		float32 impulse = -m_limitMass1 * C;

		b2Vec2 P1 = -impulse * m_u1;
		b1->m_sweep.c += b1->m_invMass * P1;
		b1->m_sweep.a += b1->m_invI * b2Cross(r1, P1);

		b1->SynchronizeTransform();
	}

	if (m_limitState2 == e_atUpperLimit)
	{
		b2Vec2 r2 = b2Mul(b2->GetTransform().R, m_localAnchor2 - b2->GetLocalCenter());
		b2Vec2 p2 = b2->m_sweep.c + r2;

		m_u2 = p2 - s2;
		float32 length2 = m_u2.Length();

		if (length2 > b2_linearSlop)
		{
			m_u2 *= 1.0f / length2;
		}
		else
		{
			m_u2.SetZero();
		}

		float32 C = m_maxLength2 - length2;
		linearError = b2Max(linearError, -C);
		C = b2Clamp(C + b2_linearSlop, -b2_maxLinearCorrection, 0.0f);
		float32 impulse = -m_limitMass2 * C;

		b2Vec2 P2 = -impulse * m_u2;
		b2->m_sweep.c += b2->m_invMass * P2;
		b2->m_sweep.a += b2->m_invI * b2Cross(r2, P2);

		b2->SynchronizeTransform();
	}

	return linearError < b2_linearSlop;
}

b2Vec2 b2PulleyJoint::GetAnchorA() const
{
	return m_bodyA->GetWorldPoint(m_localAnchor1);
}

b2Vec2 b2PulleyJoint::GetAnchorB() const
{
	return m_bodyB->GetWorldPoint(m_localAnchor2);
}

b2Vec2 b2PulleyJoint::GetReactionForce(float32 inv_dt) const
{
	b2Vec2 P = m_impulse * m_u2;
	return inv_dt * P;
}

float32 b2PulleyJoint::GetReactionTorque(float32 inv_dt) const
{
	B2_NOT_USED(inv_dt);
	return 0.0f;
}

b2Vec2 b2PulleyJoint::GetGroundAnchorA() const
{
	return m_groundAnchor1;
}

b2Vec2 b2PulleyJoint::GetGroundAnchorB() const
{
	return m_groundAnchor2;
}

float32 b2PulleyJoint::GetLength1() const
{
	b2Vec2 p = m_bodyA->GetWorldPoint(m_localAnchor1);
	b2Vec2 s = m_groundAnchor1;
	b2Vec2 d = p - s;
	return d.Length();
}

float32 b2PulleyJoint::GetLength2() const
{
	b2Vec2 p = m_bodyB->GetWorldPoint(m_localAnchor2);
	b2Vec2 s = m_groundAnchor2;
	b2Vec2 d = p - s;
	return d.Length();
}

float32 b2PulleyJoint::GetRatio() const
{
	return m_ratio;
}
