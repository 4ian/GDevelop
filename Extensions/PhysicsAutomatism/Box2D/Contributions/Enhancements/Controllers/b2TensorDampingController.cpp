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

#include "b2TensorDampingController.h"

b2TensorDampingController::b2TensorDampingController(const b2TensorDampingControllerDef* def) : b2Controller(def)
{
	T = def->T;
	maxTimestep = def->maxTimestep;
}

void b2TensorDampingController::Step(const b2TimeStep& step)
{
	float32 timestep = step.dt;
	if(timestep<=B2_FLT_EPSILON)
		return;
	if(timestep>maxTimestep && maxTimestep>0)
		timestep = maxTimestep;
	for(b2ControllerEdge *i=m_bodyList;i;i=i->nextBody){
		b2Body* body = i->body;
		if(body->IsSleeping())
			continue;
		b2Vec2 damping = body->GetWorldVector(
							b2Mul(T,
								body->GetLocalVector(
									body->GetLinearVelocity()
								)
							)
						);
		body->SetLinearVelocity(body->GetLinearVelocity() + timestep * damping);
	}
}

void b2TensorDampingControllerDef::SetAxisAligned(float32 xDamping, float32 yDamping)
{
	T.col1.x = -xDamping;
	T.col1.y = 0;
	T.col2.x = 0;
	T.col2.y = -yDamping;
	if(xDamping>0 || yDamping>0){
		maxTimestep = 1/b2Max(xDamping,yDamping);
	}else{
		maxTimestep = 0;
	}
}

void b2TensorDampingController::Destroy(b2BlockAllocator* allocator)
{
	allocator->Free(this, sizeof(b2TensorDampingController));
}


b2TensorDampingController* b2TensorDampingControllerDef::Create(b2BlockAllocator* allocator) const
{
	void* mem = allocator->Allocate(sizeof(b2TensorDampingController));
	return new (mem) b2TensorDampingController(this);
}
