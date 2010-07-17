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

#include <Box2D/Dynamics/Joints/b2MouseJoint.h>
#include <Box2D/Dynamics/b2Body.h>
#include <Box2D/Dynamics/b2TimeStep.h>

// p = attached point, m = mouse point
// C = p - m
// Cdot = v
//      = v + cross(w, r)
// J = [I r_skew]
// Identity used:
// w k % (rx i + ry j) = w * (-ry i + rx j)

b2MouseJoint::b2MouseJoint(const b2MouseJointDef* def)
: b2Joint(def)
{
	b2Assert(def->target.IsValid());
	b2Assert(b2IsValid(def->maxForce) && def->maxForce >= 0.0f);
	b2Assert(b2IsValid(def->frequencyHz) && def->frequencyHz >= 0.0f);
	b2Assert(b2IsValid(def->dampingRatio) && def->dampingRatio >= 0.0f);

	m_target = def->target;
	m_localAnchor = b2MulT(m_bodyB->GetTransform(), m_target);

	m_maxForce = def->maxForce;
	m_impulse.SetZero();

	m_frequencyHz = def->frequencyHz;
	m_dampingRatio = def->dampingRatio;

	m_beta = 0.0f;
	m_gamma = 0.0f;
}

void b2MouseJoint::SetTarget(const b2Vec2& target)
{
	if (m_bodyB->IsAwake() == false)
	{
		m_bodyB->SetAwake(true);
	}
	m_target = target;
}

const b2Vec2& b2MouseJoint::GetTarget() const
{
	return m_target;
}

void b2MouseJoint::SetMaxForce(float32 force)
{
	m_maxForce = force;
}

float32 b2MouseJoint::GetMaxForce() const
{
	return m_maxForce;
}

void b2MouseJoint::SetFrequency(float32 hz)
{
	m_frequencyHz = hz;
}

float32 b2MouseJoint::GetFrequency() const
{
	return m_frequencyHz;
}

void b2MouseJoint::SetDampingRatio(float32 ratio)
{
	m_dampingRatio = ratio;
}

float32 b2MouseJoint::GetDampingRatio() const
{
	return m_dampingRatio;
}

void b2MouseJoint::InitVelocityConstraints(const b2TimeStep& step)
{
	b2Body* b = m_bodyB;

	float32 mass = b->GetMass();

	// Frequency
	float32 omega = 2.0f * b2_pi * m_frequencyHz;

	// Damping coefficient
	float32 d = 2.0f * mass * m_dampingRatio * omega;

	// Spring stiffness
	float32 k = mass * (omega * omega);

	// magic formulas
	// gamma has units of inverse mass.
	// beta has units of inverse time.
	b2Assert(d + step.dt * k > b2_epsilon);
	m_gamma = step.dt * (d + step.dt * k);
	if (m_gamma != 0.0f)
	{
		m_gamma = 1.0f / m_gamma;
	}
	m_beta = step.dt * k * m_gamma;

	// Compute the effective mass matrix.
	b2Vec2 r = b2Mul(b->GetTransform().R, m_localAnchor - b->GetLocalCenter());

	// K    = [(1/m1 + 1/m2) * eye(2) - skew(r1) * invI1 * skew(r1) - skew(r2) * invI2 * skew(r2)]
	//      = [1/m1+1/m2     0    ] + invI1 * [r1.y*r1.y -r1.x*r1.y] + invI2 * [r1.y*r1.y -r1.x*r1.y]
	//        [    0     1/m1+1/m2]           [-r1.x*r1.y r1.x*r1.x]           [-r1.x*r1.y r1.x*r1.x]
	float32 invMass = b->m_invMass;
	float32 invI = b->m_invI;

	b2Mat22 K1;
	K1.col1.x = invMass;	K1.col2.x = 0.0f;
	K1.col1.y = 0.0f;		K1.col2.y = invMass;

	b2Mat22 K2;
	K2.col1.x =  invI * r.y * r.y;	K2.col2.x = -invI * r.x * r.y;
	K2.col1.y = -invI * r.x * r.y;	K2.col2.y =  invI * r.x * r.x;

	b2Mat22 K = K1 + K2;
	K.col1.x += m_gamma;
	K.col2.y += m_gamma;

	m_mass = K.GetInverse();

	m_C = b->m_sweep.c + r - m_target;

	// Cheat with some damping
	b->m_angularVelocity *= 0.98f;

	// Warm starting.
	m_impulse *= step.dtRatio;
	b->m_linearVelocity += invMass * m_impulse;
	b->m_angularVelocity += invI * b2Cross(r, m_impulse);
}

void b2MouseJoint::SolveVelocityConstraints(const b2TimeStep& step)
{
	b2Body* b = m_bodyB;

	b2Vec2 r = b2Mul(b->GetTransform().R, m_localAnchor - b->GetLocalCenter());

	// Cdot = v + cross(w, r)
	b2Vec2 Cdot = b->m_linearVelocity + b2Cross(b->m_angularVelocity, r);
	b2Vec2 impulse = b2Mul(m_mass, -(Cdot + m_beta * m_C + m_gamma * m_impulse));

	b2Vec2 oldImpulse = m_impulse;
	m_impulse += impulse;
	float32 maxImpulse = step.dt * m_maxForce;
	if (m_impulse.LengthSquared() > maxImpulse * maxImpulse)
	{
		m_impulse *= maxImpulse / m_impulse.Length();
	}
	impulse = m_impulse - oldImpulse;

	b->m_linearVelocity += b->m_invMass * impulse;
	b->m_angularVelocity += b->m_invI * b2Cross(r, impulse);
}

b2Vec2 b2MouseJoint::GetAnchorA() const
{
	return m_target;
}

b2Vec2 b2MouseJoint::GetAnchorB() const
{
	return m_bodyB->GetWorldPoint(m_localAnchor);
}

b2Vec2 b2MouseJoint::GetReactionForce(float32 inv_dt) const
{
	return inv_dt * m_impulse;
}

float32 b2MouseJoint::GetReactionTorque(float32 inv_dt) const
{
	return inv_dt * 0.0f;
}
