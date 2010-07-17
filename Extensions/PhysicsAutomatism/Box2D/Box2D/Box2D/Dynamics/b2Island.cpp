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

#include <Box2D/Dynamics/b2Island.h>
#include <Box2D/Dynamics/b2Body.h>
#include <Box2D/Dynamics/b2Fixture.h>
#include <Box2D/Dynamics/b2World.h>
#include <Box2D/Dynamics/Contacts/b2Contact.h>
#include <Box2D/Dynamics/Contacts/b2ContactSolver.h>
#include <Box2D/Dynamics/Joints/b2Joint.h>
#include <Box2D/Common/b2StackAllocator.h>

/*
Position Correction Notes
=========================
I tried the several algorithms for position correction of the 2D revolute joint.
I looked at these systems:
- simple pendulum (1m diameter sphere on massless 5m stick) with initial angular velocity of 100 rad/s.
- suspension bridge with 30 1m long planks of length 1m.
- multi-link chain with 30 1m long links.

Here are the algorithms:

Baumgarte - A fraction of the position error is added to the velocity error. There is no
separate position solver.

Pseudo Velocities - After the velocity solver and position integration,
the position error, Jacobian, and effective mass are recomputed. Then
the velocity constraints are solved with pseudo velocities and a fraction
of the position error is added to the pseudo velocity error. The pseudo
velocities are initialized to zero and there is no warm-starting. After
the position solver, the pseudo velocities are added to the positions.
This is also called the First Order World method or the Position LCP method.

Modified Nonlinear Gauss-Seidel (NGS) - Like Pseudo Velocities except the
position error is re-computed for each constraint and the positions are updated
after the constraint is solved. The radius vectors (aka Jacobians) are
re-computed too (otherwise the algorithm has horrible instability). The pseudo
velocity states are not needed because they are effectively zero at the beginning
of each iteration. Since we have the current position error, we allow the
iterations to terminate early if the error becomes smaller than b2_linearSlop.

Full NGS or just NGS - Like Modified NGS except the effective mass are re-computed
each time a constraint is solved.

Here are the results:
Baumgarte - this is the cheapest algorithm but it has some stability problems,
especially with the bridge. The chain links separate easily close to the root
and they jitter as they struggle to pull together. This is one of the most common
methods in the field. The big drawback is that the position correction artificially
affects the momentum, thus leading to instabilities and false bounce. I used a
bias factor of 0.2. A larger bias factor makes the bridge less stable, a smaller
factor makes joints and contacts more spongy.

Pseudo Velocities - the is more stable than the Baumgarte method. The bridge is
stable. However, joints still separate with large angular velocities. Drag the
simple pendulum in a circle quickly and the joint will separate. The chain separates
easily and does not recover. I used a bias factor of 0.2. A larger value lead to
the bridge collapsing when a heavy cube drops on it.

Modified NGS - this algorithm is better in some ways than Baumgarte and Pseudo
Velocities, but in other ways it is worse. The bridge and chain are much more
stable, but the simple pendulum goes unstable at high angular velocities.

Full NGS - stable in all tests. The joints display good stiffness. The bridge
still sags, but this is better than infinite forces.

Recommendations
Pseudo Velocities are not really worthwhile because the bridge and chain cannot
recover from joint separation. In other cases the benefit over Baumgarte is small.

Modified NGS is not a robust method for the revolute joint due to the violent
instability seen in the simple pendulum. Perhaps it is viable with other constraint
types, especially scalar constraints where the effective mass is a scalar.

This leaves Baumgarte and Full NGS. Baumgarte has small, but manageable instabilities
and is very fast. I don't think we can escape Baumgarte, especially in highly
demanding cases where high constraint fidelity is not needed.

Full NGS is robust and easy on the eyes. I recommend this as an option for
higher fidelity simulation and certainly for suspension bridges and long chains.
Full NGS might be a good choice for ragdolls, especially motorized ragdolls where
joint separation can be problematic. The number of NGS iterations can be reduced
for better performance without harming robustness much.

Each joint in a can be handled differently in the position solver. So I recommend
a system where the user can select the algorithm on a per joint basis. I would
probably default to the slower Full NGS and let the user select the faster
Baumgarte method in performance critical scenarios.
*/

/*
Cache Performance

The Box2D solvers are dominated by cache misses. Data structures are designed
to increase the number of cache hits. Much of misses are due to random access
to body data. The constraint structures are iterated over linearly, which leads
to few cache misses.

The bodies are not accessed during iteration. Instead read only data, such as
the mass values are stored with the constraints. The mutable data are the constraint
impulses and the bodies velocities/positions. The impulses are held inside the
constraint structures. The body velocities/positions are held in compact, temporary
arrays to increase the number of cache hits. Linear and angular velocity are
stored in a single array since multiple arrays lead to multiple misses.
*/

/*
2D Rotation

R = [cos(theta) -sin(theta)]
    [sin(theta) cos(theta) ]

thetaDot = omega

Let q1 = cos(theta), q2 = sin(theta).
R = [q1 -q2]
    [q2  q1]

q1Dot = -thetaDot * q2
q2Dot = thetaDot * q1

q1_new = q1_old - dt * w * q2
q2_new = q2_old + dt * w * q1
then normalize.

This might be faster than computing sin+cos.
However, we can compute sin+cos of the same angle fast.
*/

b2Island::b2Island(
	int32 bodyCapacity,
	int32 contactCapacity,
	int32 jointCapacity,
	b2StackAllocator* allocator,
	b2ContactListener* listener)
{
	m_bodyCapacity = bodyCapacity;
	m_contactCapacity = contactCapacity;
	m_jointCapacity	 = jointCapacity;
	m_bodyCount = 0;
	m_contactCount = 0;
	m_jointCount = 0;

	m_allocator = allocator;
	m_listener = listener;

	m_bodies = (b2Body**)m_allocator->Allocate(bodyCapacity * sizeof(b2Body*));
	m_contacts = (b2Contact**)m_allocator->Allocate(contactCapacity	 * sizeof(b2Contact*));
	m_joints = (b2Joint**)m_allocator->Allocate(jointCapacity * sizeof(b2Joint*));

	m_velocities = (b2Velocity*)m_allocator->Allocate(m_bodyCapacity * sizeof(b2Velocity));
	m_positions = (b2Position*)m_allocator->Allocate(m_bodyCapacity * sizeof(b2Position));
}

b2Island::~b2Island()
{
	// Warning: the order should reverse the constructor order.
	m_allocator->Free(m_positions);
	m_allocator->Free(m_velocities);
	m_allocator->Free(m_joints);
	m_allocator->Free(m_contacts);
	m_allocator->Free(m_bodies);
}

void b2Island::Solve(const b2TimeStep& step, const b2Vec2& gravity, bool allowSleep)
{
	// Integrate velocities and apply damping.
	for (int32 i = 0; i < m_bodyCount; ++i)
	{
		b2Body* b = m_bodies[i];

		if (b->GetType() != b2_dynamicBody)
		{
			continue;
		}

		// Integrate velocities.
		b->m_linearVelocity += step.dt * (gravity + b->m_invMass * b->m_force);
		b->m_angularVelocity += step.dt * b->m_invI * b->m_torque;

		// Apply damping.
		// ODE: dv/dt + c * v = 0
		// Solution: v(t) = v0 * exp(-c * t)
		// Time step: v(t + dt) = v0 * exp(-c * (t + dt)) = v0 * exp(-c * t) * exp(-c * dt) = v * exp(-c * dt)
		// v2 = exp(-c * dt) * v1
		// Taylor expansion:
		// v2 = (1.0f - c * dt) * v1
		b->m_linearVelocity *= b2Clamp(1.0f - step.dt * b->m_linearDamping, 0.0f, 1.0f);
		b->m_angularVelocity *= b2Clamp(1.0f - step.dt * b->m_angularDamping, 0.0f, 1.0f);
	}

	// Partition contacts so that contacts with static bodies are solved last.
	int32 i1 = -1;
	for (int32 i2 = 0; i2 < m_contactCount; ++i2)
	{
		b2Fixture* fixtureA = m_contacts[i2]->GetFixtureA();
		b2Fixture* fixtureB = m_contacts[i2]->GetFixtureB();
		b2Body* bodyA = fixtureA->GetBody();
		b2Body* bodyB = fixtureB->GetBody();
		bool nonStatic = bodyA->GetType() != b2_staticBody && bodyB->GetType() != b2_staticBody;
		if (nonStatic)
		{
			++i1;
			b2Swap(m_contacts[i1], m_contacts[i2]);
		}
	}

	// Initialize velocity constraints.
	b2ContactSolver contactSolver(m_contacts, m_contactCount, m_allocator, step.dtRatio);
	contactSolver.WarmStart();
	for (int32 i = 0; i < m_jointCount; ++i)
	{
		m_joints[i]->InitVelocityConstraints(step);
	}

	// Solve velocity constraints.
	for (int32 i = 0; i < step.velocityIterations; ++i)
	{
		for (int32 j = 0; j < m_jointCount; ++j)
		{
			m_joints[j]->SolveVelocityConstraints(step);
		}

		contactSolver.SolveVelocityConstraints();
	}

	// Post-solve (store impulses for warm starting).
	contactSolver.StoreImpulses();

	// Integrate positions.
	for (int32 i = 0; i < m_bodyCount; ++i)
	{
		b2Body* b = m_bodies[i];

		if (b->GetType() == b2_staticBody)
		{
			continue;
		}

		// Check for large velocities.
		b2Vec2 translation = step.dt * b->m_linearVelocity;
		if (b2Dot(translation, translation) > b2_maxTranslationSquared)
		{
			float32 ratio = b2_maxTranslation / translation.Length();
			b->m_linearVelocity *= ratio;
		}

		float32 rotation = step.dt * b->m_angularVelocity;
		if (rotation * rotation > b2_maxRotationSquared)
		{
			float32 ratio = b2_maxRotation / b2Abs(rotation);
			b->m_angularVelocity *= ratio;
		}

		// Store positions for continuous collision.
		b->m_sweep.c0 = b->m_sweep.c;
		b->m_sweep.a0 = b->m_sweep.a;

		// Integrate
		b->m_sweep.c += step.dt * b->m_linearVelocity;
		b->m_sweep.a += step.dt * b->m_angularVelocity;

		// Compute new transform
		b->SynchronizeTransform();

		// Note: shapes are synchronized later.
	}

	// Iterate over constraints.
	for (int32 i = 0; i < step.positionIterations; ++i)
	{
		bool contactsOkay = contactSolver.SolvePositionConstraints(b2_contactBaumgarte);

		bool jointsOkay = true;
		for (int32 i = 0; i < m_jointCount; ++i)
		{
			bool jointOkay = m_joints[i]->SolvePositionConstraints(b2_contactBaumgarte);
			jointsOkay = jointsOkay && jointOkay;
		}

		if (contactsOkay && jointsOkay)
		{
			// Exit early if the position errors are small.
			break;
		}
	}

	Report(contactSolver.m_constraints);

	if (allowSleep)
	{
		float32 minSleepTime = b2_maxFloat;

		const float32 linTolSqr = b2_linearSleepTolerance * b2_linearSleepTolerance;
		const float32 angTolSqr = b2_angularSleepTolerance * b2_angularSleepTolerance;

		for (int32 i = 0; i < m_bodyCount; ++i)
		{
			b2Body* b = m_bodies[i];
			if (b->GetType() == b2_staticBody)
			{
				continue;
			}

			if ((b->m_flags & b2Body::e_autoSleepFlag) == 0)
			{
				b->m_sleepTime = 0.0f;
				minSleepTime = 0.0f;
			}

			if ((b->m_flags & b2Body::e_autoSleepFlag) == 0 ||
				b->m_angularVelocity * b->m_angularVelocity > angTolSqr ||
				b2Dot(b->m_linearVelocity, b->m_linearVelocity) > linTolSqr)
			{
				b->m_sleepTime = 0.0f;
				minSleepTime = 0.0f;
			}
			else
			{
				b->m_sleepTime += step.dt;
				minSleepTime = b2Min(minSleepTime, b->m_sleepTime);
			}
		}

		if (minSleepTime >= b2_timeToSleep)
		{
			for (int32 i = 0; i < m_bodyCount; ++i)
			{
				b2Body* b = m_bodies[i];
				b->SetAwake(false);
			}
		}
	}
}

void b2Island::Report(const b2ContactConstraint* constraints)
{
	if (m_listener == NULL)
	{
		return;
	}

	for (int32 i = 0; i < m_contactCount; ++i)
	{
		b2Contact* c = m_contacts[i];

		const b2ContactConstraint* cc = constraints + i;
		
		b2ContactImpulse impulse;
		for (int32 j = 0; j < cc->pointCount; ++j)
		{
			impulse.normalImpulses[j] = cc->points[j].normalImpulse;
			impulse.tangentImpulses[j] = cc->points[j].tangentImpulse;
		}

		m_listener->PostSolve(c, &impulse);
	}
}
