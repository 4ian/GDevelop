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

#include "b2ConstantForceController.h"

b2ConstantForceController::b2ConstantForceController(const b2ConstantForceControllerDef* def) : b2Controller(def)
{
	F = def->F;
}

void b2ConstantForceController::Step(const b2TimeStep& step)
{
	B2_NOT_USED(step);
	for(b2ControllerEdge *i=m_bodyList;i;i=i->nextBody){
		b2Body* body = i->body;
		if(body->IsSleeping())
			continue;
		body->ApplyForce(F,body->GetWorldCenter());
	}
}

void b2ConstantForceController::Destroy(b2BlockAllocator* allocator)
{
	allocator->Free(this, sizeof(b2ConstantForceController));
}


b2ConstantForceController* b2ConstantForceControllerDef::Create(b2BlockAllocator* allocator) const
{
	void* mem = allocator->Allocate(sizeof(b2ConstantForceController));
	return new (mem) b2ConstantForceController(this);
}
