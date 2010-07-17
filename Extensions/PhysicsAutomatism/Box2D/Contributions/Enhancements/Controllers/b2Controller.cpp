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

#include "b2Controller.h"
#include "../../Common/b2BlockAllocator.h"


b2Controller::~b2Controller()
{
	//Remove attached bodies
	Clear();
}

void b2Controller::AddBody(b2Body* body)
{
	void* mem = m_world->m_blockAllocator.Allocate(sizeof(b2ControllerEdge));
	b2ControllerEdge* edge = new (mem) b2ControllerEdge;
	
	edge->body = body;
	edge->controller = this;
	
	//Add edge to controller list
	edge->nextBody = m_bodyList;
	edge->prevBody = NULL;
	if(m_bodyList)
		m_bodyList->prevBody = edge;
	m_bodyList = edge;
	++m_bodyCount;

	//Add edge to body list
	edge->nextController = body->m_controllerList;
	edge->prevController = NULL;
	if(body->m_controllerList)
		body->m_controllerList->prevController = edge;
	body->m_controllerList = edge;
}

void b2Controller::RemoveBody(b2Body* body)
{
	//Assert that the controller is not empty
	b2Assert(m_bodyCount>0);

	//Find the corresponding edge
	b2ControllerEdge* edge = m_bodyList;
	while(edge && edge->body!=body)
		edge = edge->nextBody;

	//Assert that we are removing a body that is currently attached to the controller
	b2Assert(edge!=NULL);

	//Remove edge from controller list
	if(edge->prevBody)
		edge->prevBody->nextBody = edge->nextBody;
	if(edge->nextBody)
		edge->nextBody->prevBody = edge->prevBody;
	if(edge == m_bodyList)
		m_bodyList = edge->nextBody;
	--m_bodyCount;

	//Remove edge from body list
	if(edge->prevController)
		edge->prevController->nextController = edge->nextController;
	if(edge->nextController)
		edge->nextController->prevController = edge->prevController;
	if(edge == body->m_controllerList)
		body->m_controllerList = edge->nextController;

	//Free the edge
	m_world->m_blockAllocator.Free(edge, sizeof(b2ControllerEdge));
}

void b2Controller::Clear(){

	while(m_bodyList)
	{
		b2ControllerEdge* edge = m_bodyList;

		//Remove edge from controller list
		m_bodyList = edge->nextBody;

		//Remove edge from body list
		if(edge->prevController)
			edge->prevController->nextController = edge->nextController;
		if(edge->nextController)
			edge->nextController->prevController = edge->prevController;
		if(edge == edge->body->m_controllerList)
			edge->body->m_controllerList = edge->nextController;

		//Free the edge
		m_world->m_blockAllocator.Free(edge, sizeof(b2ControllerEdge));
	}

	m_bodyCount = 0;
}

