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


#include "Extensions/Modifiers/SPK_LinearForce.h"
#include "Core/SPK_Particle.h"

namespace SPK
{
	LinearForce::LinearForce(Zone* zone,ModifierTrigger trigger,const Vector3D& force,ForceFactor type,ModelParam param) :
		Modifier(ALWAYS | INSIDE_ZONE | OUTSIDE_ZONE,ALWAYS,false,false,zone),
		force(force),
		tForce(force),
		factorType(type),
		factorParam(param)
	{}

	void LinearForce::modify(Particle& particle,float deltaTime) const
	{
		float factor = deltaTime / particle.getParamCurrentValue(PARAM_MASS);
		
		if (factorType != FACTOR_NONE)
		{
			float param = particle.getParamCurrentValue(factorParam);
			factor *= param; // linearity function of the parameter
			if (factorType == FACTOR_SQUARE)
				factor *= param; // linearity function of the square of the parameter
		}

		particle.velocity() += tForce * factor;
	}
}
