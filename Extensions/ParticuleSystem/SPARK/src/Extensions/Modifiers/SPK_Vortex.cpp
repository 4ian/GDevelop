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

#include "Extensions/Modifiers/SPK_Vortex.h"
#include "Core/SPK_Particle.h"

namespace SPK
{
	Vortex::Vortex(const Vector3D& position,const Vector3D& direction,float rotationSpeed,float attractionSpeed) :
		Modifier(ALWAYS | INSIDE_ZONE |OUTSIDE_ZONE,ALWAYS,false,false,NULL),
		rotationSpeed(rotationSpeed),
		attractionSpeed(attractionSpeed),
		angularSpeedEnabled(false),
		linearSpeedEnabled(false),
		killingParticleEnabled(false),
		eyeRadius(0.0f)
	{
		setPosition(position);
		setDirection(direction);
	}

	void Vortex::modify(Particle& particle,float deltaTime) const
	{
		// Distance of the projection point from the position of the vortex
		float dist = dotProduct(tDirection,particle.position() - tPosition);
		
		// Position of the rotation center (orthogonal projection of the particle)
		Vector3D rotationCenter = tDirection;
		rotationCenter *= dist;
		rotationCenter += tPosition;

		// Distance of the particle from the eye of the vortex
		dist = getDist(rotationCenter,particle.position());

		if (dist <= eyeRadius)
		{
			if (killingParticleEnabled)
				particle.kill();
			return;
		}
	
		// The following is not mathematically correct when the speed is not angular and there's a attraction but is ok anyway
		float angle = angularSpeedEnabled ? rotationSpeed * deltaTime : rotationSpeed * deltaTime / dist;
		float s = std::sin(angle);
		float c = std::cos(angle);
		float t = 1 - c;

		// Rotates the particle
		Vector3D tmp = particle.position() - rotationCenter;
		particle.position().x = tmp.x * (t * tDirection.x * tDirection.x + c)
			+ tmp.y * (t * tDirection.x * tDirection.y + s * tDirection.z)
			+ tmp.z * (t * tDirection.x * tDirection.z - s * tDirection.y); 
		particle.position().y = tmp.x * (t * tDirection.x * tDirection.y - s * tDirection.z)
			+ tmp.y * (t * tDirection.y * tDirection.y + c)
			+ tmp.z * (t * tDirection.y * tDirection.z + s * tDirection.x);
		particle.position().z = tmp.x * (t * tDirection.x * tDirection.z + s * tDirection.y)
			+ tmp.y * (t * tDirection.y * tDirection.z - s * tDirection.x)
			+ tmp.z * (t * tDirection.z * tDirection.z + c);

		// Attracts the particle towards the vortex (or repels it)
		if (attractionSpeed != 0.0f)
		{
			float move = linearSpeedEnabled ? attractionSpeed * deltaTime * dist : attractionSpeed * deltaTime;
			if (move >= dist - eyeRadius)
			{
				move = dist - eyeRadius;
				if (killingParticleEnabled)
					particle.kill();
			}
			particle.position() *= 1.0f - move / dist;
		}

		particle.position() += rotationCenter;
	}

	void Vortex::innerUpdateTransform()
	{
		Modifier::innerUpdateTransform();
		transformPos(tPosition,position);
		transformDir(tDirection,direction);
		tDirection.normalize();
	}
}
