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


#include "Extensions/Emitters/SPK_NormalEmitter.h"
#include "Core/SPK_Particle.h"

namespace SPK
{
	NormalEmitter::NormalEmitter(Zone* normalZone,bool inverted) :
		Emitter(),
		normalZone(normalZone),
		inverted(inverted)
	{}

	void NormalEmitter::registerChildren(bool registerAll)
	{
		Emitter::registerChildren(registerAll);
		registerChild(normalZone,registerAll);
	}

	void NormalEmitter::copyChildren(const Registerable& object,bool createBase)
	{
		const NormalEmitter& emitter = dynamic_cast<const NormalEmitter&>(object);
		Emitter::copyChildren(emitter,createBase);
		normalZone = dynamic_cast<Zone*>(copyChild(emitter.normalZone,createBase));	
	}
	
	void NormalEmitter::destroyChildren(bool keepChildren)
	{
		destroyChild(normalZone,keepChildren);
		Emitter::destroyChildren(keepChildren);
	}

	Registerable* NormalEmitter::findByName(const std::string& name)
	{
		Registerable* object = Emitter::findByName(name);
		if ((object != NULL)||(normalZone == NULL))
			return object;

		return normalZone->findByName(name);
	}

	void NormalEmitter::setNormalZone(Zone* zone)
	{
		decrementChildReference(normalZone);
		incrementChildReference(zone);

		normalZone = zone;
	}

	void NormalEmitter::generateVelocity(Particle& particle,float speed) const
	{
		if (inverted) speed = -speed;
		const Zone* zone = (normalZone == NULL ? getZone() : normalZone);
		particle.velocity() = zone->computeNormal(particle.position()) * speed;
	}
}
