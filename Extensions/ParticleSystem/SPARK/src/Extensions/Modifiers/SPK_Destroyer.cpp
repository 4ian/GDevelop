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


#include "Extensions/Modifiers/SPK_Destroyer.h"
#include "Core/SPK_Particle.h"
#include "Core/SPK_Zone.h"


namespace SPK
{
	Destroyer::Destroyer(Zone* zone,ModifierTrigger trigger) :
		Modifier(INSIDE_ZONE | OUTSIDE_ZONE | INTERSECT_ZONE | ENTER_ZONE | EXIT_ZONE,INSIDE_ZONE,true,false,zone)
	{
		setTrigger(trigger);
	}

	void Destroyer::modify(Particle& particle,float deltaTime) const
	{
		particle.kill();
		if ((trigger != INSIDE_ZONE)||(trigger != OUTSIDE_ZONE))
			particle.position() = intersection;
	}

	void Destroyer::modifyWrongSide(Particle& particle,bool inside) const
	{
		if (isFullZone())
		{
			getZone()->moveAtBorder(particle.position(),inside);
			particle.kill();
		}
	}
}
