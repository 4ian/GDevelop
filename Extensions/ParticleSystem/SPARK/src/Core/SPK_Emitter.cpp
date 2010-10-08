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


#include "Core/SPK_Emitter.h"
#include "Extensions/Zones/SPK_Point.h"


namespace SPK
{
	Emitter::Emitter() :
		Registerable(),
		Transformable(),
		zone(&defaultZone),
		full(true),
		tank(-1),
		flow(0.0f),
		forceMin(0.0f),
		forceMax(0.0f),
		fraction(random(0.0f,1.0f)),
		active(true)
	{}

	void Emitter::registerChildren(bool registerAll)
	{
		Registerable::registerChildren(registerAll);
		registerChild(zone,registerAll);
	}

	void Emitter::copyChildren(const Emitter& emitter,bool createBase)
	{
		Registerable::copyChildren(emitter,createBase);
		zone = dynamic_cast<Zone*>(copyChild(emitter.zone,createBase));	
	}
	
	void Emitter::destroyChildren(bool keepChildren)
	{
		destroyChild(zone,keepChildren);
		Registerable::destroyChildren(keepChildren);
	}

	Registerable* Emitter::findByName(const std::string& name)
	{
		Registerable* object = Registerable::findByName(name);
		if (object != NULL)
			return object;

		return zone->findByName(name);
	}

	void Emitter::changeTank(int deltaTank)
	{
		if (tank >= 0)
		{
			tank += deltaTank;
			if (tank < 0)
				tank = 0;
		}
	}

	void Emitter::changeFlow(float deltaFlow)
	{
		if (flow >= 0.0f)
		{
			flow += deltaFlow;
			if (flow < 0.0f)
				flow = 0.0f;
		}
	}

	void Emitter::setZone(Zone* zone,bool full)
	{
		decrementChildReference(this->zone);
		incrementChildReference(zone);

		if (zone == NULL)
			zone = &defaultZone;

		this->zone = zone;
		this->full = full;
	}

	unsigned int Emitter::updateNumber(float deltaTime)
	{
		int nbBorn;
		if (flow < 0.0f)
		{
			nbBorn = std::max(0,tank);
			tank = 0;
		}
		else
		{
			fraction += flow * deltaTime;
			nbBorn = static_cast<int>(fraction);
			if (tank >= 0)
			{
				nbBorn = std::min(tank,nbBorn);
				tank -= nbBorn;
			}
			fraction -= nbBorn;
		}
		return static_cast<unsigned int>(nbBorn);
	}
}
