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

#include "b2BuoyancyController.h"
#include "../b2Fixture.h"

b2BuoyancyController::b2BuoyancyController(const b2BuoyancyControllerDef* def) : b2Controller(def)
{
	normal = def->normal;
	offset = def->offset;
	density = def->density;
	velocity = def->velocity;
	linearDrag = def->linearDrag;
	angularDrag = def->angularDrag;
	useDensity = def->useDensity;
	useWorldGravity = def->useWorldGravity;
	gravity = def->gravity;
}

void b2BuoyancyController::Step(const b2TimeStep& step)
{
	B2_NOT_USED(step);
	if(!m_bodyList)
		return;
	if(useWorldGravity)
	{
		gravity = m_world->GetGravity();
	}
	for(b2ControllerEdge *i=m_bodyList;i;i=i->nextBody)
	{
		b2Body* body = i->body;
		if(body->IsSleeping())
		{
			//Buoyancy force is just a function of position,
			//so unlike most forces, it is safe to ignore sleeping bodes
			continue;
		}
		b2Vec2 areac(0,0);
		b2Vec2 massc(0,0);
		float32 area = 0;
		float32 mass = 0;
		for(b2Fixture* shape=body->GetFixtureList();shape;shape=shape->GetNext())
		{
			b2Vec2 sc(0,0);
			float32 sarea = shape->ComputeSubmergedArea(normal, offset, &sc);
			area += sarea;
			areac.x += sarea * sc.x;
			areac.y += sarea * sc.y;
			float shapeDensity = 0;
			if(useDensity)
			{
				//TODO: Expose density publicly
				shapeDensity=shape->GetDensity();
			}
			else
			{
				shapeDensity = 1;
			}
			mass += sarea*shapeDensity;
			massc.x += sarea * sc.x * shapeDensity;
			massc.y += sarea * sc.y * shapeDensity;
		}
		areac.x/=area;
		areac.y/=area;
		b2Vec2 localCentroid = b2MulT(body->GetXForm(),areac);
		massc.x/=mass;
		massc.y/=mass;
		if(area<B2_FLT_EPSILON)
			continue;
		//Buoyancy
		b2Vec2 buoyancyForce = -density*area*gravity;
		body->ApplyForce(buoyancyForce,massc);
		//Linear drag
		b2Vec2 dragForce = body->GetLinearVelocityFromWorldPoint(areac) - velocity;
		dragForce *= -linearDrag*area;
		body->ApplyForce(dragForce,areac);
		//Angular drag
		//TODO: Something that makes more physical sense?
		body->ApplyTorque(-body->GetInertia()/body->GetMass()*area*body->GetAngularVelocity()*angularDrag);
		
	}
}

void b2BuoyancyController::Draw(b2DebugDraw *debugDraw)
{
	float32 r = 1000;
	b2Vec2 p1 = offset * normal + b2Cross(normal, r);
	b2Vec2 p2 = offset * normal - b2Cross(normal, r);

	b2Color color(0,0,0.8f);

	debugDraw->DrawSegment(p1, p2, color);
}

void b2BuoyancyController::Destroy(b2BlockAllocator* allocator)
{
	allocator->Free(this, sizeof(b2BuoyancyController));
}

b2BuoyancyController* b2BuoyancyControllerDef::Create(b2BlockAllocator* allocator) const
{
	void* mem = allocator->Allocate(sizeof(b2BuoyancyController));
	return new (mem) b2BuoyancyController(this);
}
