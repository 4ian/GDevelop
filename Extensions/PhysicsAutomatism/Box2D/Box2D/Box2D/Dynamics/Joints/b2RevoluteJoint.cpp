/*
* Copyright (c) 2006-2007 Erin Catto http://www.gphysics.com
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

#include <Box2D/Dynamics/Joints/b2RevoluteJoint.h>
#include <Box2D/Dynamics/b2Body.h>
#include <Box2D/Dynamics/b2TimeStep.h>

// Point-to-point constraint
// C = p2 - p1
// Cdot = v2 - v1
//      = v2 + cross(w2, r2) - v1 - cross(w1, r1)
// J = [-I -r1_skew I r2_skew ]
// Identity used:
// w k % (rx i + ry j) = w * (-ry i + rx j)

// Motor constraint
// Cdot = w2 - w1
// J = [0 0 -1 0 0 1]
// K = invI1 + invI2

void b2RevoluteJointDef::Initialize(b2Body* b1, b2Body* b2, const b2Vec2& anchor)
{
	bodyA = b1;
	bodyB = b2;
	localAnchorA = bodyA->GetLocalPoint(anchor);
	localAnchorB = bodyB->GetLocalPoint(anchor);
	referenceAngle = bodyB->GetAngle() - bodyA->GetAngle();
}

b2RevoluteJoint::b2RevoluteJoint(const b2RevoluteJointDef* def)
: b2Joint(def)
{
	m_localAnchor1 = def->localAnchorA;
	m_localAnchor2 = def->localAnchorB;
	m_referenceAngle = def->referenceAngle;

	m_impulse.SetZero();
	m_motorImpulse = 0.0f;

	m_lowerAngle = def->lowerAngle;
	m_upperAngle = def->upperAngle;
	m_maxMotorTorque = def->maxMotorTorque;
	m_motorSpeed = def->motorSpeed;
	m_enableLimit = def->enableLimit;
	m_enableMotor = def->enableMotor;
	m_limitState = e_inactiveLimit;
}

void b2RevoluteJoint::InitVelocityConstraints(const b2TimeStep& step)
{
	b2Body* b1 = m_bodyA;
	b2Body* b2 = m_bodyB;

	if (m_enableMotor || m_enableLimit)
	{
		// You cannot create a rotation limit between bodies that
		// both have fixed rotation.
		b2Assert(b1->m_invI > 0.0f || b2->m_invI > 0.0f);
	}

	// Compute the effective mass matrix.
	b2Vec2 r1 = b2Mul(b1->GetTransform().R, m_localAnchor1 - b1->GetLocalCenter());
	b2Vec2 r2 = b2Mul(b2->GetTransform().R, m_localAnchor2 - b2->GetLocalCenter());

	// J = [-I -r1_skew I r2_skew]
	//     [ 0       -1 0       1]
	// r_skew = [-ry; rx]

	// Matlab
	// K = [ m1+r1y^2*i1+m2+r2y^2*i2,  -r1y*i1*r1x-r2y*i2*r2x,          -r1y*i1-r2y*i2]
	//     [  -r1y*i1*r1x-r2y*i2*r2x, m1+r1x^2*i1+m2+r2x^2*i2,           r1x*i1+r2x*i2]
	//     [          -r1y*i1-r2y*i2,           r1x*i1+r2x*i2,                   i1+i2]

	float32 m1 = b1->m_invMass, m2 = b2->m_invMass;
	float32 i1 = b1->m_invI, i2 = b2->m_invI;

	m_mass.col1.x = m1 + m2 + r1.y * r1.y * i1 + r2.y * r2.y * i2;
	m_mass.col2.x = -r1.y * r1.x * i1 - r2.y * r2.x * i2;
	m_mass.col3.x = -r1.y * i1 - r2.y * i2;
	m_mass.col1.y = m_mass.col2.x;
	m_mass.col2.y = m1 + m2 + r1.x * r1.x * i1 + r2.x * r2.x * i2;
	m_mass.col3.y = r1.x * i1 + r2.x * i2;
	m_mass.col1.z = m_mass.col3.x;
	m_mass.col2.z = m_mass.col3.y;
	m_mass.col3.z = i1 + i2;

	m_motorMass = i1 + i2;
	if (m_motorMass > 0.0f)
	{
		m_motorMass = 1.0f / m_motorMass;
	}

	if (m_enableMotor == false)
	{
		m_motorImpulse = 0.0f;
	}

	if (m_enableLimit)
	{
		float32 jointAngle = b2->m_sweep.a - b1->m_sweep.a - m_referenceAngle;
		if (b2Abs(m_upperAngle - m_lowerAngle) < 2.0f * b2_angularSlop)
		{
			m_limitState = e_equalLimits;
		}
		else if (jointAngle <= m_lowerAngle)
		{
			if (m_limitState != e_atLowerLimit)
			{
				m_impulse.z = 0.0f;
			}
			m_limitState = e_atLowerLimit;
		}
		else if (jointAngle >= m_upperAngle)
		{
			if (m_limitState != e_atUpperLimit)
			{
				m_impulse.z = 0.0f;
			}
			m_limitState = e_atUpperLimit;
		}
		else
		{
			m_limitState = e_inactiveLimit;
			m_impulse.z = 0.0f;
		}
	}
	else
	{
		m_limitState = e_inactiveLimit;
	}

	if (step.warmStarting)
	{
		// Scale impulses to support a variable time step.
		m_impulse *= step.dtRatio;
		m_motorImpulse *= step.dtRatio;

		b2Vec2 P(m_impulse.x, m_impulse.y);

		b1->m_linearVelocity -= m1 * P;
		b1->m_angularVelocity -= i1 * (b2Cross(r1, P) + m_motorImpulse + m_impulse.z);

		b2->m_linearVelocity += m2 * P;
		b2->m_angularVelocity += i2 * (b2Cross(r2, P) + m_motorImpulse + m_impulse.z);
	}
	else
	{
		m_impulse.SetZero();
		m_motorImpulse = 0.0f;
	}
}

void b2RevoluteJoint::SolveVelocityConstraints(const b2TimeStep& step)
{
	b2Body* b1 = m_bodyA;
	b2Body* b2 = m_bodyB;

	b2Vec2 v1 = b1->m_linearVelocity;
	float32 w1 = b1->m_angularVelocity;
	b2Vec2 v2 = b2->m_linearVelocity;
	float32 w2 = b2->m_angularVelocity;

	float32 m1 = b1->m_invMass, m2 = b2->m_invMass;
	float32 i1 = b1->m_invI, i2 = b2->m_invI;

	// Solve motor constraint.
	if (m_enableMotor && m_limitState != e_equalLimits)
	{
		float32 Cdot = w2 - w1 - m_motorSpeed;
		float32 impulse = m_motorMass * (-Cdot);
		float32 oldImpulse = m_motorImpulse;
		float32 maxImpulse = step.dt * m_maxMotorTorque;
		m_motorImpulse = b2Clamp(m_motorImpulse + impulse, -maxImpulse, maxImpulse);
		impulse = m_motorImpulse - oldImpulse;

		w1 -= i1 * impulse;
		w2 += i2 * impulse;
	}

	// Solve limit constraint.
	if (m_enableLimit && m_limitState != e_inactiveLimit)
	{
		b2Vec2 r1 = b2Mul(b1->GetTransform().R, m_localAnchor1 - b1->GetLocalCenter());
		b2Vec2 r2 = b2Mul(b2->GetTransform().R, m_localAnchor2 - b2->GetLocalCenter());

		// Solve point-to-point constraint
		b2Vec2 Cdot1 = v2 + b2Cross(w2, r2) - v1 - b2Cross(w1, r1);
		float32 Cdot2 = w2 - w1;
		b2Vec3 Cdot(Cdot1.x, Cdot1.y, Cdot2);

		b2Vec3 impulse = m_mass.Solve33(-Cdot);

		if (m_limitState == e_equalLimits)
		{
			m_impulse += impulse;
		}
		else if (m_limitState == e_atLowerLimit)
		{
			float32 newImpulse = m_impulse.z + impulse.z;
			if (newImpulse < 0.0f)
			{
				b2Vec2 reduced = m_mass.Solve22(-Cdot1);
				impulse.x = reduced.x;
				impulse.y = reduced.y;
				impulse.z = -m_impulse.z;
				m_impulse.x += reduced.x;
				m_impulse.y += reduced.y;
				m_impulse.z = 0.0f;
			}
		}
		else if (m_limitState == e_atUpperLimit)
		{
			float32 newImpulse = m_impulse.z + impulse.z;
			if (newImpulse > 0.0f)
			{
				b2Vec2 reduced = m_mass.Solve22(-Cdot1);
				impulse.x = reduced.x;
				impulse.y = reduced.y;
				impulse.z = -m_impulse.z;
				m_impulse.x += reduced.x;
				m_impulse.y += reduced.y;
				m_impulse.z = 0.0f;
			}
		}

		b2Vec2 P(impulse.x, impulse.y);

		v1 -= m1 * P;
		w1 -= i1 * (b2Cross(r1, P) + impulse.z);

		v2 += m2 * P;
		w2 += i2 * (b2Cross(r2, P) + impulse.z);
	}
	else
	{
		b2Vec2 r1 = b2Mul(b1->GetTransform().R, m_localAnchor1 - b1->GetLocalCenter());
		b2Vec2 r2 = b2Mul(b2->GetTransform().R, m_localAnchor2 - b2->GetLocalCenter());

		// Solve point-to-point constraint
		b2Vec2 Cdot = v2 + b2Cross(w2, r2) - v1 - b2Cross(w1, r1);
		b2Vec2 impulse = m_mass.Solve22(-Cdot);

		m_impulse.x += impulse.x;
		m_impulse.y += impulse.y;

		v1 -= m1 * impulse;
		w1 -= i1 * b2Cross(r1, impulse);

		v2 += m2 * impulse;
		w2 += i2 * b2Cross(r2, impulse);
	}

	b1->m_linearVelocity = v1;
	b1->m_angularVelocity = w1;
	b2->m_linearVelocity = v2;
	b2->m_angularVelocity = w2;
}

bool b2RevoluteJoint::SolvePositionConstraints(float32 baumgarte)
{
	// TODO_ERIN block solve with limit.

	B2_NOT_USED(baumgarte);

	b2Body* b1 = m_bodyA;
	b2Body* b2 = m_bodyB;

	float32 angularError = 0.0f;
	float32 positionError = 0.0f;

	// Solve angular limit constraint.
	if (m_enableLimit && m_limitState != e_inactiveLimit)
	{
		float32 angle = b2->m_sweep.a - b1->m_sweep.a - m_referenceAngle;
		float32 limitImpulse = 0.0f;

		if (m_limitState == e_equalLimits)
		{
			// Prevent large angular corrections
			float32 C = b2Clamp(angle - m_lowerAngle, -b2_maxAngularCorrection, b2_maxAngularCorrection);
			limitImpulse = -m_motorMass * C;
			angularError = b2Abs(C);
		}
		else if (m_limitState == e_atLowerLimit)
		{
			float32 C = angle - m_lowerAngle;
			angularError = -C;

			// Prevent large angular corrections and allow some slop.
			C = b2Clamp(C + b2_angularSlop, -b2_maxAngularCorrection, 0.0f);
			limitImpulse = -m_motorMass * C;
		}
		else if (m_limitState == e_atUpperLimit)
		{
			float32 C = angle - m_upperAngle;
			angularError = C;

			// Prevent large angular corrections and allow some slop.
			C = b2Clamp(C - b2_angularSlop, 0.0f, b2_maxAngularCorrection);
			limitImpulse = -m_motorMass * C;
		}

		b1->m_sweep.a -= b1->m_invI * limitImpulse;
		b2->m_sweep.a += b2->m_invI * limitImpulse;

		b1->SynchronizeTransform();
		b2->SynchronizeTransform();
	}

	// Solve point-to-point constraint.
	{
		b2Vec2 r1 = b2Mul(b1->GetTransform().R, m_localAnchor1 - b1->GetLocalCenter());
		b2Vec2 r2 = b2Mul(b2->GetTransform().R, m_localAnchor2 - b2->GetLocalCenter());

		b2Vec2 C = b2->m_sweep.c + r2 - b1->m_sweep.c - r1;
		positionError = C.Length();

		float32 invMass1 = b1->m_invMass, invMass2 = b2->m_invMass;
		float32 invI1 = b1->m_invI, invI2 = b2->m_invI;

		// Handle large detachment.
		const float32 k_allowedStretch = 10.0f * b2_linearSlop;
		if (C.LengthSquared() > k_allowedStretch * k_allowedStretch)
		{
			// Use a particle solution (no rotation).
			b2Vec2 u = C; u.Normalize();
			float32 m = invMass1 + invMass2;
			if (m > 0.0f)
			{
				m = 1.0f / m;
			}
			b2Vec2 impulse = m * (-C);
			const float32 k_beta = 0.5f;
			b1->m_sweep.c -= k_beta * invMass1 * impulse;
			b2->m_sweep.c += k_beta * invMass2 * impulse;

			C = b2->m_sweep.c + r2 - b1->m_sweep.c - r1;
		}

		b2Mat22 K1;
		K1.col1.x = invMass1 + invMass2;	K1.col2.x = 0.0f;
		K1.col1.y = 0.0f;					K1.col2.y = invMass1 + invMass2;

		b2Mat22 K2;
		K2.col1.x =  invI1 * r1.y * r1.y;	K2.col2.x = -invI1 * r1.x * r1.y;
		K2.col1.y = -invI1 * r1.x * r1.y;	K2.col2.y =  invI1 * r1.x * r1.x;

		b2Mat22 K3;
		K3.col1.x =  invI2 * r2.y * r2.y;	K3.col2.x = -invI2 * r2.x * r2.y;
		K3.col1.y = -invI2 * r2.x * r2.y;	K3.col2.y =  invI2 * r2.x * r2.x;

		b2Mat22 K = K1 + K2 + K3;
		b2Vec2 impulse = K.Solve(-C);

		b1->m_sweep.c -= b1->m_invMass * impulse;
		b1->m_sweep.a -= b1->m_invI * b2Cross(r1, impulse);

		b2->m_sweep.c += b2->m_invMass * impulse;
		b2->m_sweep.a += b2->m_invI * b2Cross(r2, impulse);

		b1->SynchronizeTransform();
		b2->SynchronizeTransform();
	}
	
	return positionError <= b2_linearSlop && angularError <= b2_angularSlop;
}

b2Vec2 b2RevoluteJoint::GetAnchorA() const
{
	return m_bodyA->GetWorldPoint(m_localAnchor1);
}

b2Vec2 b2RevoluteJoint::GetAnchorB() const
{
	return m_bodyB->GetWorldPoint(m_localAnchor2);
}

b2Vec2 b2RevoluteJoint::GetReactionForce(float32 inv_dt) const
{
	b2Vec2 P(m_impulse.x, m_impulse.y);
	return inv_dt * P;
}

float32 b2RevoluteJoint::GetReactionTorque(float32 inv_dt) const
{
	return inv_dt * m_impulse.z;
}

float32 b2RevoluteJoint::GetJointAngle() const
{
	b2Body* b1 = m_bodyA;
	b2Body* b2 = m_bodyB;
	return b2->m_sweep.a - b1->m_sweep.a - m_referenceAngle;
}

float32 b2RevoluteJoint::GetJointSpeed() const
{
	b2Body* b1 = m_bodyA;
	b2Body* b2 = m_bodyB;
	return b2->m_angularVelocity - b1->m_angularVelocity;
}

bool b2RevoluteJoint::IsMotorEnabled() const
{
	return m_enableMotor;
}

void b2RevoluteJoint::EnableMotor(bool flag)
{
	m_bodyA->SetAwake(true);
	m_bodyB->SetAwake(true);
	m_enableMotor = flag;
}

float32 b2RevoluteJoint::GetMotorTorque() const
{
	return m_motorImpulse;
}

void b2RevoluteJoint::SetMotorSpeed(float32 speed)
{
	m_bodyA->SetAwake(true);
	m_bodyB->SetAwake(true);
	m_motorSpeed = speed;
}

void b2RevoluteJoint::SetMaxMotorTorque(float32 torque)
{
	m_bodyA->SetAwake(true);
	m_bodyB->SetAwake(true);
	m_maxMotorTorque = torque;
}

bool b2RevoluteJoint::IsLimitEnabled() const
{
	return m_enableLimit;
}

void b2RevoluteJoint::EnableLimit(bool flag)
{
	m_bodyA->SetAwake(true);
	m_bodyB->SetAwake(true);
	m_enableLimit = flag;
}

float32 b2RevoluteJoint::GetLowerLimit() const
{
	return m_lowerAngle;
}

float32 b2RevoluteJoint::GetUpperLimit() const
{
	return m_upperAngle;
}

void b2RevoluteJoint::SetLimits(float32 lower, float32 upper)
{
	b2Assert(lower <= upper);
	m_bodyA->SetAwake(true);
	m_bodyB->SetAwake(true);
	m_lowerAngle = lower;
	m_upperAngle = upper;
}
