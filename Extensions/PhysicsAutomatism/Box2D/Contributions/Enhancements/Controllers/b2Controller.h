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

#ifndef B2_CONTROLLER_H
#define B2_CONTROLLER_H

#include "../../Dynamics/b2World.h"
#include "../../Dynamics/b2Body.h"

class b2Body;
class b2World;

class b2Controller;

/// A controller edge is used to connect bodies and controllers together
/// in a bipartite graph.
struct b2ControllerEdge
{
	b2Controller* controller;		///< provides quick access to other end of this edge.
	b2Body* body;					///< the body
	b2ControllerEdge* prevBody;		///< the previous controller edge in the controllers's joint list
	b2ControllerEdge* nextBody;		///< the next controller edge in the controllers's joint list
	b2ControllerEdge* prevController;		///< the previous controller edge in the body's joint list
	b2ControllerEdge* nextController;		///< the next controller edge in the body's joint list
};

class b2ControllerDef;

/// Base class for controllers. Controllers are a convience for encapsulating common
/// per-step functionality.
class b2Controller
{
public:
	virtual ~b2Controller();

	/// Controllers override this to implement per-step functionality.
	virtual void Step(const b2TimeStep& step) = 0;

	/// Controllers override this to provide debug drawing.
	virtual void Draw(b2DebugDraw *debugDraw) {B2_NOT_USED(debugDraw);};

	/// Adds a body to the controller list.
	void AddBody(b2Body* body);

	/// Removes a body from the controller list.
	void RemoveBody(b2Body* body);

	/// Removes all bodies from the controller list.
	void Clear();

	/// Get the next controller in the world's body list.
	b2Controller* GetNext();
	const b2Controller* GetNext() const;

	/// Get the parent world of this body.
	b2World* GetWorld();
	const b2World* GetWorld() const;

	/// Get the attached body list
	b2ControllerEdge* GetBodyList();
	const b2ControllerEdge* GetBodyList() const;


protected:
	friend class b2World;

	b2World* m_world;

	b2ControllerEdge* m_bodyList;
	int32 m_bodyCount;

	b2Controller(const b2ControllerDef* def):
		m_world(NULL),
		m_bodyList(NULL),
		m_bodyCount(0),
		m_prev(NULL),
		m_next(NULL)
		
		{
			B2_NOT_USED(def);
		}
	virtual void Destroy(b2BlockAllocator* allocator) = 0;

private:
	b2Controller* m_prev;
	b2Controller* m_next;

	static void Destroy(b2Controller* controller, b2BlockAllocator* allocator);
};

class b2ControllerDef
{
public:
	virtual ~b2ControllerDef() {};
	
private:
	friend class b2World;
	virtual b2Controller* Create(b2BlockAllocator* allocator) const = 0;
};

inline b2Controller* b2Controller::GetNext()
{
	return m_next;
}

inline const b2Controller* b2Controller::GetNext() const
{
	return m_next;
}

inline b2World* b2Controller::GetWorld()
{
	return m_world;
}

inline const b2World* b2Controller::GetWorld() const
{
	return m_world;
}

inline b2ControllerEdge* b2Controller::GetBodyList()
{
	return m_bodyList;
}

inline const b2ControllerEdge* b2Controller::GetBodyList() const
{
	return m_bodyList;
}

inline void b2Controller::Destroy(b2Controller* controller, b2BlockAllocator* allocator)
{
	controller->Destroy(allocator);
}

#endif
