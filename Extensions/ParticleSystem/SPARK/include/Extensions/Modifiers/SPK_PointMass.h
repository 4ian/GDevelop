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


#ifndef H_SPK_POINTMASS
#define H_SPK_POINTMASS

#include "Core/SPK_Modifier.h"

namespace SPK
{
	/**
	* @class PointMass
	* @brief A Modifier defining a point with a mass that attracts or repulses particles
	*
	* A PointMass triggered on a Particle will affect its velocity as followed :<br>
	* <i>dist = pointMassPosition - particlePosition<br>
	* particleVelocity += dist * mass * step / max(minDistance,|dist|)</i>
	*/
	class SPK_PREFIX PointMass : public Modifier
	{
		SPK_IMPLEMENT_REGISTERABLE(PointMass)

	public :

		////////////////
		// Construtor //
		////////////////

		/**
		* @brief Constructor of PointMass
		* @param zone : the Zone of the PointMass
		* @param trigger : the trigger of the PointMass
		* @param mass : the mass of the PointMass
		* @param minDistance : the minimum distance of the PointMass
		*/
		PointMass(Zone* zone = NULL,ModifierTrigger trigger = INSIDE_ZONE,float mass = 1.0f,float minDistance = 0.05f);

		/**
		* @brief Creates and registers a new PointMass
		* @param zone : the Zone of the PointMass
		* @param trigger : the trigger of the PointMass
		* @param mass : the mass of the PointMass
		* @param minDistance : the minimum distance of the PointMass
		* @return A new registered PointMass
		* @since 1.04.00
		*/
		static PointMass* create(Zone* zone = NULL,ModifierTrigger trigger = INSIDE_ZONE,float mass = 1.0f,float minDistance = 0.05f);

		/////////////
		// Setters //
		/////////////

		/**
		* @brief Sets the delta position from the position of the zone (or origin if no zone set)
		* @param pos : the delta position
		* @since 1.03.02
		*/
		void setPosition(const Vector3D& pos);

		/**
		* @brief Sets the mass of this PointMass
		*
		* The mass defines the strenght of the attraction. The more the mass, the stronger the attraction.<br>
		* A position mass will result into an attraction while a negative mass will result into a repulsion.
		* Moreover a mass equal to 0 make the PointMass have no effect.
		*
		* @param mass : the mass of this PointMass
		*/
		void setMass(float mass);

		/**
		* @brief Sets the minimum distance of this PointMass
		*
		* The minimum distance of the PointMass is the minimum distance that can be considered to compute the force implied by the PointMass.
		* If a distance between a Particle and a PointMass is inferior to the minimum distance of the PointMass, the distance is clamped to the minimum distance.<br>
		* This avoids forces that approaching the infinity with Particle getting very close to the PointMass.
		*
		* @param minDistance : the minimum distance of this PointMass
		*/
		void setMinDistance(float minDistance);

		/////////////
		// Getters //
		/////////////

		/**
		* @brief Gets the delta position
		* @return the delta position
		* @since 1.03.02
		*/
		const Vector3D& getPosition() const;

		/**
		* @brief Gets the transformed delta position
		* @return the transformed delta position
		* @since 1.03.02
		*/
		const Vector3D& getTransformedPosition() const;

		/**
		* @brief Gets the mass of this PointMass
		* @return the mass of this PointMass
		*/
		float getMass() const;

		/**
		* @brief Gets the minimum distance of this PointMass
		* @return the minimum distance of this PointMass
		*/
		float getMinDistance() const;

	protected :

		virtual void innerUpdateTransform();

	private :

		Vector3D position;
		Vector3D tPosition;

		float mass;
		float minDistance;
		float sqrMinDistance;

		virtual void modify(Particle& particle,float deltaTime) const;
	};


	inline PointMass* PointMass::create(Zone* zone,ModifierTrigger trigger,float mass,float minDistance)
	{
		PointMass* obj = new PointMass(zone,trigger,mass,minDistance);
		registerObject(obj);
		return obj;
	}
		
	inline void PointMass::setPosition(const Vector3D& pos)
	{
		position = tPosition = pos;
		notifyForUpdate();
	}

	inline void PointMass::setMass(float mass)
	{
		this->mass = mass;
	}

	inline void PointMass::setMinDistance(float minDistance)
	{
		this->minDistance = minDistance;
		sqrMinDistance = minDistance * minDistance;
	}

	inline const Vector3D& PointMass::getPosition() const
	{
		return position;
	}

	inline const Vector3D& PointMass::getTransformedPosition() const
	{
		return tPosition;
	}

	inline float PointMass::getMass() const
	{
		return mass;
	}

	inline float PointMass::getMinDistance() const
	{
		return minDistance;
	}

	inline void PointMass::innerUpdateTransform()
	{
		Modifier::innerUpdateTransform();
		transformDir(tPosition,position); // the delta position is actually a direction not a position
	}
}

#endif
