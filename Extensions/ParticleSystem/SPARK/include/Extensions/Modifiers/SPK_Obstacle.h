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


#ifndef H_SPK_OBSTACLE
#define H_SPK_OBSTACLE

#include "Core/SPK_Modifier.h"
#include "Core/SPK_Particle.h"
#include "Core/SPK_Zone.h"

namespace SPK
{
	/**
	* @class Obstacle
	* @brief A Modifier that acts as an obstacle on particles
	*/
	class SPK_PREFIX Obstacle : public Modifier
	{
		SPK_IMPLEMENT_REGISTERABLE(Obstacle)

	public :

		/////////////////
		// Constructor //
		/////////////////

		/**
		* @brief Constructor of Obstacle
		* @param zone : the Zone of the Obstacle
		* @param trigger : the trigger of the Destructor
		* @param bouncingRatio : the bouncingRatio of the Obstacle
		* @param friction : the friction of the Obstacle
		*/
		Obstacle(Zone* zone = NULL,ModifierTrigger trigger = INTERSECT_ZONE,float bouncingRatio = 1.0f,float friction = 1.0f);

		/**
		* @brief Creates and registers a new Obstacle
		* @param zone : the Zone of the Obstacle
		* @param trigger : the trigger of the Destructor
		* @param bouncingRatio : the bouncingRatio of the Obstacle
		* @param friction : the friction of the Obstacle
		* @return A new registered Obstacle
		* @since 1.04.00
		*/
		static Obstacle* create(Zone* zone = NULL,ModifierTrigger trigger = INTERSECT_ZONE,float bouncingRatio = 1.0f,float friction = 1.0f);

		/////////////
		// Setters //
		/////////////

		/**
		* @brief Sets the bouncing ratio of this Obstacle
		*
		* The bouncing ratio is the multiplier applied to the normal component of the rebound.
		*
		* @param bouncingRatio : the bouncing ratio of this Obstacle
		*/
		void setBouncingRatio(float bouncingRatio);

		/**
		* @brief Sets the friction of this Obstacle
		*
		* The bouncing ratio is the multiplier applied to the tangent component of the rebound.
		*
		* @param friction : the friction of this Obstacle
		*/
		void setFriction(float friction);

		/////////////
		// Getters //
		/////////////

		/**
		* @brief Gets the bouncing ratio of this Obstacle
		* @return the bouncing ratio of this Obstacle
		*/
		float getBouncingRatio() const;

		/**
		* @brief Gets the friction of this Obstacle
		* @return the friction of this Obstacle
		*/
		float getFriction() const;

	private :

		float bouncingRatio;
		float friction;

		virtual void modify(Particle& particle,float deltaTime) const;
		virtual void modifyWrongSide(Particle& particle,bool inside) const;
	};


	inline Obstacle* Obstacle::create(Zone* zone,ModifierTrigger trigger,float bouncingRatio,float friction)
	{
		Obstacle* obj = new Obstacle(zone,trigger,bouncingRatio,friction);
		registerObject(obj);
		return obj;
	}
		
	inline void Obstacle::setBouncingRatio(float bouncingRatio)
	{
		this->bouncingRatio = bouncingRatio < 0.0f ? 0.0f : bouncingRatio;
	}

	inline void Obstacle::setFriction(float friction)
	{
		this->friction = friction;
	}

	inline float Obstacle::getBouncingRatio() const
	{
		return bouncingRatio;
	}

	inline float Obstacle::getFriction() const
	{
		return friction;
	}

	inline void Obstacle::modifyWrongSide(Particle& particle,bool inside) const
	{
		if (isFullZone())
			getZone()->moveAtBorder(particle.position(),inside);
	}
}

#endif
