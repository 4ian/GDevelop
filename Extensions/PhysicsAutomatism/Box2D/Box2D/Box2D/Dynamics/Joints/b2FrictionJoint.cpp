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

#include <Box2D/Dynamics/Joints/b2FrictionJoint.h>
#include <Box2D/Dynamics/b2Body.h>
#include <Box2D/Dynamics/b2TimeStep.h>

// Point-to-point constraint
// Cdot = v2 - v1
//      = v2 + cross(w2, r2) - v1 - cross(w1, r1)
// J = [-I -r1_skew I r2_skew ]
// Identity used:
// w k % (rx i + ry j) = w * (-ry i + rx j)

// Angle constraint
// Cdot = w2 - w1
// J = [0 0 -1 0 0 1]
// K = invI1 + invI2

void b2FrictionJointDef::Initialize(b2Body* bA, b2Body* bB, const b2Vec2& anchor)
{
	bodyA = bA;
	bodyB = bB;
	localAnchorA = bodyA->GetLocalPoint(anchor);
	localAnchorB = bodyB->GetLocalPoint(anchor);
}

b2FrictionJoint::b2FrictionJoint(const b2FrictionJointDef* def)
: b2Joint(def)
{
	m_localAnchorA = def->localAnchorA;
	m_localAnchorB = def->localAnchorB;

	m_linearImpulse.SetZero();
	m_angularImpulse = 0.0f;

	m_maxForce = def->maxForce;
	m_maxTorque = def->maxTorque;
}

void b2FrictionJoint::InitVelocityConstraints(const b2TimeStep& step)
{
	b2Body* bA = m_bodyA;
	b2Body* bB = m_bodyB;

	// Compute the effective mass matrix.
	b2Vec2 rA = b2Mul(bA->GetTransform().R, m_localAnchorA - bA->GetLocalCenter());
	b2Vec2 rB = b2Mul(bB->GetTransform().R, m_localAnchorB - bB->GetLocalCenter());

	// J = [-I -r1_skew I r2_skew]
	//     [ 0       -1 0       1]
	// r_skew = [-ry; rx]

	// Matlab
	// K = [ mA+r1y^2*iA+mB+r2y^2*iB,  -r1y*iA*r1x-r2y*iB*r2x,          -r1y*iA-r2y*iB]
	//     [  -r1y*iA*r1x-r2y*iB*r2x, mA+r1x^2*iA+mB+r2x^2*iB,           r1x*iA+r2x*iB]
	//     [          -r1y*iA-r2y*iB,           r1x*iA+r2x*iB,                   iA+iB]

	float32 mA = bA->m_invMass, mB = bB->m_invMass;
	float32 iA = bA->m_invI, iB = bB->m_invI;

	b2Mat22 K1;
	K1.col1.x = mA + mB;	K1.col2.x = 0.0f;
	K1.col1.y = 0.0f;		K1.col2.y = mA + mB;

	b2Mat22 K2;
	K2.col1.x =  iA * rA.y * rA.y;	K2.col2.x = -iA * rA.x * rA.y;
	K2.col1.y = -iA * rA.x * rA.y;	K2.col2.y =  iA * rA.x * rA.x;

	b2Mat22 K3;
	K3.col1.x =  iB * rB.y * rB.y;	K3.col2.x = -iB * rB.x * rB.y;
	K3.col1.y = -iB * rB.x * rB.y;	K3.col2.y =  iB * rB.x * rB.x;

	b2Mat22 K = K1 + K2 + K3;
	m_linearMass = K.GetInverse();

	m_angularMass = iA + iB;
	if (m_angularMass > 0.0f)
	{
		m_angularMass = 1.0f / m_angularMass;
	}

	if (step.warmStarting)
	{
		// Scale impulses to support a variable time step.
		m_linearImpulse *= step.dtRatio;
		m_angularImpulse *= step.dtRatio;

		b2Vec2 P(m_linearImpulse.x, m_linearImpulse.y);

		bA->m_linearVelocity -= mA * P;
		bA->m_angularVelocity -= iA * (b2Cross(rA, P) + m_angularImpulse);

		bB->m_linearVelocity += mB * P;
		bB->m_angularVelocity += iB * (b2Cross(rB, P) + m_angularImpulse);
	}
	else
	{
		m_linearImpulse.SetZero();
		m_angularImpulse = 0.0f;
	}
}

void b2FrictionJoint::SolveVelocityConstraints(const b2TimeStep& step)
{
	B2_NOT_USED(step);

	b2Body* bA = m_bodyA;
	b2Body* bB = m_bodyB;

	b2Vec2 vA = bA->m_linearVelocity;
	float32 wA = bA->m_angularVelocity;
	b2Vec2 vB = bB->m_linearVelocity;
	float32 wB = bB->m_angularVelocity;

	float32 mA = bA->m_invMass, mB = bB->m_invMass;
	float32 iA = bA->m_invI, iB = bB->m_invI;

	b2Vec2 rA = b2Mul(bA->GetTransform().R, m_localAnchorA - bA->GetLocalCenter());
	b2Vec2 rB = b2Mul(bB->GetTransform().R, m_localAnchorB - bB->GetLocalCenter());

	// Solve angular friction
	{
		float32 Cdot = wB - wA;
		float32 impulse = -m_angularMass * Cdot;

		float32 oldImpulse = m_angularImpulse;
		float32 maxImpulse = step.dt * m_maxTorque;
		m_angularImpulse = b2Clamp(m_angularImpulse + impulse, -maxImpulse, maxImpulse);
		impulse = m_angularImpulse - oldImpulse;

		wA -= iA * impulse;
		wB += iB * impulse;
	}

	// Solve linear friction
	{
		b2Vec2 Cdot = vB + b2Cross(wB, rB) - vA - b2Cross(wA, rA);

		b2Vec2 impulse = -b2Mul(m_linearMass, Cdot);
		b2Vec2 oldImpulse = m_linearImpulse;
		m_linearImpulse += impulse;

		float32 maxImpulse = step.dt * m_maxForce;

		if (m_linearImpulse.LengthSquared() > maxImpulse * maxImpulse)
		{
			m_linearImpulse.Normalize();
			m_linearImpulse *= maxImpulse;
		}

		impulse = m_linearImpulse - oldImpulse;

		vA -= mA * impulse;
		wA -= iA * b2Cross(rA, impulse);

		vB += mB * impulse;
		wB += iB * b2Cross(rB, impulse);
	}

	bA->m_linearVelocity = vA;
	bA->m_angularVelocity = wA;
	bB->m_linearVelocity = vB;
	bB->m_angularVelocity = wB;
}

bool b2FrictionJoint::SolvePositionConstraints(float32 baumgarte)
{
	B2_NOT_USED(baumgarte);

	return true;
}

b2Vec2 b2FrictionJoint::GetAnchorA() const
{
	return m_bodyA->GetWorldPoint(m_localAnchorA);
}

b2Vec2 b2FrictionJoint::GetAnchorB() const
{
	return m_bodyB->GetWorldPoint(m_localAnchorB);
}

b2Vec2 b2FrictionJoint::GetReactionForce(float32 inv_dt) const
{
	return inv_dt * m_linearImpulse;
}

float32 b2FrictionJoint::GetReactionTorque(float32 inv_dt) const
{
	return inv_dt * m_angularImpulse;
}

void b2FrictionJoint::SetMaxForce(float32 force)
{
	b2Assert(b2IsValid(force) && force >= 0.0f);
	m_maxForce = force;
}

float32 b2FrictionJoint::GetMaxForce() const
{
	return m_maxForce;
}

void b2FrictionJoint::SetMaxTorque(float32 torque)
{
	b2Assert(b2IsValid(torque) && torque >= 0.0f);
	m_maxTorque = torque;
}

float32 b2FrictionJoint::GetMaxTorque() const
{
	return m_maxTorque;
}
