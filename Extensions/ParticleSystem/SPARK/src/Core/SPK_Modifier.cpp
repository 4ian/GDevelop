//////////////////////////////////////////////////////////////////////////////////
// SPARK particle engine														//
// Copyright (C) 2008-2009 - Julien Fryer - julienfryer@gmail.com				//
//																				//
// This software is provided 'as-is', without any express or implied			//
// warranty.  In no event will the authors be held liable for any damages		//
// arising from the use of this software.										//
//																				//
// Permission is granted to anyone to use this software for any purpose,		//
// including commercial applications, and to alter it and redistribute it		//
// freely, subject to the following restrictions:								//
//																				//
// 1. The origin of this software must not be misrepresented; you must not		//
//    claim that you wrote the original software. If you use this software		//
//    in a product, an acknowledgment in the product documentation would be		//
//    appreciated but is not required.											//
// 2. Altered source versions must be plainly marked as such, and must not be	//
//    misrepresented as being the original software.							//
// 3. This notice may not be removed or altered from any source distribution.	//
//////////////////////////////////////////////////////////////////////////////////

#include "Core/SPK_Modifier.h"

namespace SPK
{
	Vector3D Modifier::intersection;
	Vector3D Modifier::normal;

	Modifier::Modifier(int availableTriggers,ModifierTrigger trigger,bool needsIntersection,bool needsNormal,Zone* zone) :
		Registerable(),
		Transformable(),
		BufferHandler(),
		availableTriggers(availableTriggers),
		trigger(trigger),
		zone(zone),
		needsIntersection(needsIntersection),
		needsNormal(needsNormal),
		full(false),
		active(true),
		local(false)
	{}

	void Modifier::registerChildren(bool registerAll)
	{
		Registerable::registerChildren(registerAll);
		registerChild(zone,registerAll);
	}

	void Modifier::copyChildren(const Registerable& object,bool createBase)
	{
		const Modifier& modifier = dynamic_cast<const Modifier&>(object);
		Registerable::copyChildren(modifier,createBase);
		zone = dynamic_cast<Zone*>(copyChild(modifier.zone,createBase));
	}

	void Modifier::destroyChildren(bool keepChildren)
	{
		destroyChild(zone,keepChildren);
		Registerable::destroyChildren(keepChildren);
	}

	Registerable* Modifier::findByName(const std::string& name)
	{
		Registerable* object = Registerable::findByName(name);
		if ((object != NULL)||(zone == NULL))
			return object;

		return zone->findByName(name);
	}

	void Modifier::setZone(Zone* zone,bool full)
	{
		decrementChildReference(this->zone);
		incrementChildReference(zone);

		this->zone = zone;
		this->full = full;
	}

	bool Modifier::setTrigger(ModifierTrigger trigger)
	{
		if ((trigger & availableTriggers) != 0)
		{
			this->trigger = trigger;
			return true;
		}

		return false;
	}

	void Modifier::beginProcess(Group& group)
	{
		savedActive = active;
		
		if (!active)
			return;
		
		if (!prepareBuffers(group))
			active = false; // if buffers of the modifier in the group are not ready, the modifier is made incative for the frame
	}
}
