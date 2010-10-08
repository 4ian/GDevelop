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


#include "Extensions/Modifiers/SPK_Obstacle.h"


namespace SPK
{
	Obstacle::Obstacle(Zone* zone,ModifierTrigger trigger,float bouncingRatio,float friction) :
		Modifier(INTERSECT_ZONE | ENTER_ZONE | EXIT_ZONE,INTERSECT_ZONE,true,true,zone),
		bouncingRatio(bouncingRatio),
		friction(friction)
	{
		setTrigger(trigger);
	}

	void Obstacle::modify(Particle& particle,float deltaTime) const
	{
		Vector3D& velocity = particle.velocity();
		velocity = particle.position();
		velocity -= particle.oldPosition();

		if (deltaTime != 0.0f)
			velocity *= 1.0f / deltaTime;
		else 
			velocity.set(0.0f,0.0f,0.0f);

		float dist = dotProduct(velocity,normal);

		normal *= dist;
		velocity -= normal;			// tangent component
		velocity *= friction;
		normal *= bouncingRatio;	// normal component
		velocity -= normal;

		particle.position() = intersection;
	}
}
