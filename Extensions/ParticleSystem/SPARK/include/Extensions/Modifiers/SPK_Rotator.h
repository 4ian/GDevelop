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


#ifndef H_SPK_ROTATOR
#define H_SPK_ROTATOR

#include "Core/SPK_Modifier.h"


namespace SPK
{
	/**
	* @class Rotator
	* @brief A Modifier allowing to rotate particle with their rotation speed
	*
	* Instead of controlling directly the particle angle, this modifier allows to control the particle rotation speed.<br>
	* The rotator derives the particle angle from the particle rotation speed.<br>
	* <br>
	* For this modifier to work, the PARAM_ANGLE must be enabled (and can be random in addition but not mutable or interpolated)
	* and the PARAM_ROTATION_SPEED must be at least enabled in the model of the group of particles that are modified.
	*
	* @since 1.05.00
	*/
	class Rotator : public Modifier
	{
		SPK_IMPLEMENT_REGISTERABLE(Rotator)

	public :

		/////////////////
		// Constructor //
		/////////////////

		/** @brief Constructor of Rotator */
		inline Rotator();

		/**
		* @brief Creates and registers a new Rotator
		* @return A new registered Rotator
		*/
		static inline Rotator* create();

	private :

		virtual inline void modify(Particle& particle,float deltaTime) const;
	};


	inline Rotator::Rotator() : Modifier(ALWAYS | INSIDE_ZONE | OUTSIDE_ZONE) {}

	inline Rotator* Rotator::create()
	{
		Rotator* obj = new Rotator;
		registerObject(obj);
		return obj;
	}

	inline void Rotator::modify(Particle& particle,float deltaTime) const
	{
		float angle = particle.getParamCurrentValue(PARAM_ANGLE) + deltaTime * particle.getParamCurrentValue(PARAM_ROTATION_SPEED);
		particle.setParamCurrentValue(PARAM_ANGLE,angle);
	}
}

#endif
