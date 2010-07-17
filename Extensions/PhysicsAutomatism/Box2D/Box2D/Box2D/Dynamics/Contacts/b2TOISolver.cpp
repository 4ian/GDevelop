/*
* Copyright (c) 2006-2010 Erin Catto http://www.gphysics.com
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

#include <Box2D/Dynamics/Contacts/b2TOISolver.h>
#include <Box2D/Dynamics/Contacts/b2Contact.h>
#include <Box2D/Dynamics/b2Body.h>
#include <Box2D/Dynamics/b2Fixture.h>
#include <Box2D/Common/b2StackAllocator.h>

struct b2TOIConstraint
{
	b2Vec2 localPoints[b2_maxManifoldPoints];
	b2Vec2 localNormal;
	b2Vec2 localPoint;
	b2Manifold::Type type;
	float32 radius;
	int32 pointCount;
	b2Body* bodyA;
	b2Body* bodyB;
};

b2TOISolver::b2TOISolver(b2StackAllocator* allocator)
{
	m_allocator = allocator;
	m_constraints = NULL;
	m_count = NULL;
	m_toiBody = NULL;
}

b2TOISolver::~b2TOISolver()
{
	Clear();
}

void b2TOISolver::Clear()
{
	if (m_allocator && m_constraints)
	{
		m_allocator->Free(m_constraints);
		m_constraints = NULL;
	}
}

void b2TOISolver::Initialize(b2Contact** contacts, int32 count, b2Body* toiBody)
{
	Clear();

	m_count = count;
	m_toiBody = toiBody;

	m_constraints = (b2TOIConstraint*) m_allocator->Allocate(m_count * sizeof(b2TOIConstraint));

	for (int32 i = 0; i < m_count; ++i)
	{
		b2Contact* contact = contacts[i];

		b2Fixture* fixtureA = contact->GetFixtureA();
		b2Fixture* fixtureB = contact->GetFixtureB();
		b2Shape* shapeA = fixtureA->GetShape();
		b2Shape* shapeB = fixtureB->GetShape();
		float32 radiusA = shapeA->m_radius;
		float32 radiusB = shapeB->m_radius;
		b2Body* bodyA = fixtureA->GetBody();
		b2Body* bodyB = fixtureB->GetBody();
		b2Manifold* manifold = contact->GetManifold();

		b2Assert(manifold->pointCount > 0);

		b2TOIConstraint* constraint = m_constraints + i;
		constraint->bodyA = bodyA;
		constraint->bodyB = bodyB;
		constraint->localNormal = manifold->localNormal;
		constraint->localPoint = manifold->localPoint;
		constraint->type = manifold->type;
		constraint->pointCount = manifold->pointCount;
		constraint->radius = radiusA + radiusB;

		for (int32 j = 0; j < constraint->pointCount; ++j)
		{
			b2ManifoldPoint* cp = manifold->points + j;
			constraint->localPoints[j] = cp->localPoint;
		}
	}
}

struct b2TOISolverManifold
{
	void Initialize(b2TOIConstraint* cc, int32 index)
	{
		b2Assert(cc->pointCount > 0);

		switch (cc->type)
		{
		case b2Manifold::e_circles:
			{
				b2Vec2 pointA = cc->bodyA->GetWorldPoint(cc->localPoint);
				b2Vec2 pointB = cc->bodyB->GetWorldPoint(cc->localPoints[0]);
				if (b2DistanceSquared(pointA, pointB) > b2_epsilon * b2_epsilon)
				{
					normal = pointB - pointA;
					normal.Normalize();
				}
				else
				{
					normal.Set(1.0f, 0.0f);
				}

				point = 0.5f * (pointA + pointB);
				separation = b2Dot(pointB - pointA, normal) - cc->radius;
			}
			break;

		case b2Manifold::e_faceA:
			{
				normal = cc->bodyA->GetWorldVector(cc->localNormal);
				b2Vec2 planePoint = cc->bodyA->GetWorldPoint(cc->localPoint);

				b2Vec2 clipPoint = cc->bodyB->GetWorldPoint(cc->localPoints[index]);
				separation = b2Dot(clipPoint - planePoint, normal) - cc->radius;
				point = clipPoint;
			}
			break;

		case b2Manifold::e_faceB:
			{
				normal = cc->bodyB->GetWorldVector(cc->localNormal);
				b2Vec2 planePoint = cc->bodyB->GetWorldPoint(cc->localPoint);

				b2Vec2 clipPoint = cc->bodyA->GetWorldPoint(cc->localPoints[index]);
				separation = b2Dot(clipPoint - planePoint, normal) - cc->radius;
				point = clipPoint;

				// Ensure normal points from A to B
				normal = -normal;
			}
			break;
		}
	}

	b2Vec2 normal;
	b2Vec2 point;
	float32 separation;
};

// Push out the toi body to provide clearance for further simulation.
bool b2TOISolver::Solve(float32 baumgarte)
{
	float32 minSeparation = 0.0f;

	for (int32 i = 0; i < m_count; ++i)
	{
		b2TOIConstraint* c = m_constraints + i;
		b2Body* bodyA = c->bodyA;
		b2Body* bodyB = c->bodyB;

		float32 massA = bodyA->m_mass;
		float32 massB = bodyB->m_mass;

		// Only the TOI body should move.
		if (bodyA == m_toiBody)
		{
			massB = 0.0f;
		}
		else
		{
			massA = 0.0f;
		}

		float32 invMassA = massA * bodyA->m_invMass;
		float32 invIA = massA * bodyA->m_invI;
		float32 invMassB = massB * bodyB->m_invMass;
		float32 invIB = massB * bodyB->m_invI;

		// Solve normal constraints
		for (int32 j = 0; j < c->pointCount; ++j)
		{
			b2TOISolverManifold psm;
			psm.Initialize(c, j);
			b2Vec2 normal = psm.normal;

			b2Vec2 point = psm.point;
			float32 separation = psm.separation;

			b2Vec2 rA = point - bodyA->m_sweep.c;
			b2Vec2 rB = point - bodyB->m_sweep.c;

			// Track max constraint error.
			minSeparation = b2Min(minSeparation, separation);

			// Prevent large corrections and allow slop.
			float32 C = b2Clamp(baumgarte * (separation + b2_linearSlop), -b2_maxLinearCorrection, 0.0f);

			// Compute the effective mass.
			float32 rnA = b2Cross(rA, normal);
			float32 rnB = b2Cross(rB, normal);
			float32 K = invMassA + invMassB + invIA * rnA * rnA + invIB * rnB * rnB;

			// Compute normal impulse
			float32 impulse = K > 0.0f ? - C / K : 0.0f;

			b2Vec2 P = impulse * normal;

			bodyA->m_sweep.c -= invMassA * P;
			bodyA->m_sweep.a -= invIA * b2Cross(rA, P);
			bodyA->SynchronizeTransform();

			bodyB->m_sweep.c += invMassB * P;
			bodyB->m_sweep.a += invIB * b2Cross(rB, P);
			bodyB->SynchronizeTransform();
		}
	}

	// We can't expect minSpeparation >= -b2_linearSlop because we don't
	// push the separation above -b2_linearSlop.
	return minSeparation >= -1.5f * b2_linearSlop;
}
