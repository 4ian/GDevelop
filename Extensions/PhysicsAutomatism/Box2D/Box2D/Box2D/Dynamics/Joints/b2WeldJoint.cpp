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

#include <Box2D/Dynamics/Joints/b2WeldJoint.h>
#include <Box2D/Dynamics/b2Body.h>
#include <Box2D/Dynamics/b2TimeStep.h>

// Point-to-point constraint
// C = p2 - p1
// Cdot = v2 - v1
//      = v2 + cross(w2, r2) - v1 - cross(w1, r1)
// J = [-I -r1_skew I r2_skew ]
// Identity used:
// w k % (rx i + ry j) = w * (-ry i + rx j)

// Angle constraint
// C = angle2 - angle1 - referenceAngle
// Cdot = w2 - w1
// J = [0 0 -1 0 0 1]
// K = invI1 + invI2

void b2WeldJointDef::Initialize(b2Body* bA, b2Body* bB, const b2Vec2& anchor)
{
	bodyA = bA;
	bodyB = bB;
	localAnchorA = bodyA->GetLocalPoint(anchor);
	localAnchorB = bodyB->GetLocalPoint(anchor);
	referenceAngle = bodyB->GetAngle() - bodyA->GetAngle();
}

b2WeldJoint::b2WeldJoint(const b2WeldJointDef* def)
: b2Joint(def)
{
	m_localAnchorA = def->localAnchorA;
	m_localAnchorB = def->localAnchorB;
	m_referenceAngle = def->referenceAngle;

	m_impulse.SetZero();
}

void b2WeldJoint::InitVelocityConstraints(const b2TimeStep& step)
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

	m_mass.col1.x = mA + mB + rA.y * rA.y * iA + rB.y * rB.y * iB;
	m_mass.col2.x = -rA.y * rA.x * iA - rB.y * rB.x * iB;
	m_mass.col3.x = -rA.y * iA - rB.y * iB;
	m_mass.col1.y = m_mass.col2.x;
	m_mass.col2.y = mA + mB + rA.x * rA.x * iA + rB.x * rB.x * iB;
	m_mass.col3.y = rA.x * iA + rB.x * iB;
	m_mass.col1.z = m_mass.col3.x;
	m_mass.col2.z = m_mass.col3.y;
	m_mass.col3.z = iA + iB;

	if (step.warmStarting)
	{
		// Scale impulses to support a variable time step.
		m_impulse *= step.dtRatio;

		b2Vec2 P(m_impulse.x, m_impulse.y);

		bA->m_linearVelocity -= mA * P;
		bA->m_angularVelocity -= iA * (b2Cross(rA, P) + m_impulse.z);

		bB->m_linearVelocity += mB * P;
		bB->m_angularVelocity += iB * (b2Cross(rB, P) + m_impulse.z);
	}
	else
	{
		m_impulse.SetZero();
	}
}

void b2WeldJoint::SolveVelocityConstraints(const b2TimeStep& step)
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

	// Solve point-to-point constraint
	b2Vec2 Cdot1 = vB + b2Cross(wB, rB) - vA - b2Cross(wA, rA);
	float32 Cdot2 = wB - wA;
	b2Vec3 Cdot(Cdot1.x, Cdot1.y, Cdot2);

	b2Vec3 impulse = m_mass.Solve33(-Cdot);
	m_impulse += impulse;

	b2Vec2 P(impulse.x, impulse.y);

	vA -= mA * P;
	wA -= iA * (b2Cross(rA, P) + impulse.z);

	vB += mB * P;
	wB += iB * (b2Cross(rB, P) + impulse.z);

	bA->m_linearVelocity = vA;
	bA->m_angularVelocity = wA;
	bB->m_linearVelocity = vB;
	bB->m_angularVelocity = wB;
}

bool b2WeldJoint::SolvePositionConstraints(float32 baumgarte)
{
	B2_NOT_USED(baumgarte);

	b2Body* bA = m_bodyA;
	b2Body* bB = m_bodyB;

	float32 mA = bA->m_invMass, mB = bB->m_invMass;
	float32 iA = bA->m_invI, iB = bB->m_invI;

	b2Vec2 rA = b2Mul(bA->GetTransform().R, m_localAnchorA - bA->GetLocalCenter());
	b2Vec2 rB = b2Mul(bB->GetTransform().R, m_localAnchorB - bB->GetLocalCenter());

	b2Vec2 C1 =  bB->m_sweep.c + rB - bA->m_sweep.c - rA;
	float32 C2 = bB->m_sweep.a - bA->m_sweep.a - m_referenceAngle;

	// Handle large detachment.
	const float32 k_allowedStretch = 10.0f * b2_linearSlop;
	float32 positionError = C1.Length();
	float32 angularError = b2Abs(C2);
	if (positionError > k_allowedStretch)
	{
		iA *= 1.0f;
		iB *= 1.0f;
	}

	m_mass.col1.x = mA + mB + rA.y * rA.y * iA + rB.y * rB.y * iB;
	m_mass.col2.x = -rA.y * rA.x * iA - rB.y * rB.x * iB;
	m_mass.col3.x = -rA.y * iA - rB.y * iB;
	m_mass.col1.y = m_mass.col2.x;
	m_mass.col2.y = mA + mB + rA.x * rA.x * iA + rB.x * rB.x * iB;
	m_mass.col3.y = rA.x * iA + rB.x * iB;
	m_mass.col1.z = m_mass.col3.x;
	m_mass.col2.z = m_mass.col3.y;
	m_mass.col3.z = iA + iB;

	b2Vec3 C(C1.x, C1.y, C2);

	b2Vec3 impulse = m_mass.Solve33(-C);

	b2Vec2 P(impulse.x, impulse.y);

	bA->m_sweep.c -= mA * P;
	bA->m_sweep.a -= iA * (b2Cross(rA, P) + impulse.z);

	bB->m_sweep.c += mB * P;
	bB->m_sweep.a += iB * (b2Cross(rB, P) + impulse.z);

	bA->SynchronizeTransform();
	bB->SynchronizeTransform();

	return positionError <= b2_linearSlop && angularError <= b2_angularSlop;
}

b2Vec2 b2WeldJoint::GetAnchorA() const
{
	return m_bodyA->GetWorldPoint(m_localAnchorA);
}

b2Vec2 b2WeldJoint::GetAnchorB() const
{
	return m_bodyB->GetWorldPoint(m_localAnchorB);
}

b2Vec2 b2WeldJoint::GetReactionForce(float32 inv_dt) const
{
	b2Vec2 P(m_impulse.x, m_impulse.y);
	return inv_dt * P;
}

float32 b2WeldJoint::GetReactionTorque(float32 inv_dt) const
{
	return inv_dt * m_impulse.z;
}
