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


#ifndef H_SPK_STRAIGHEMITTER
#define H_SPK_STRAIGHEMITTER

#include "Core/SPK_Emitter.h"
#include "Core/SPK_Particle.h"


namespace SPK
{
	/**
	* @class StraightEmitter
	* @brief An Emitter that emits in a given direction
	*/
	class SPK_PREFIX StraightEmitter : public Emitter
	{
		SPK_IMPLEMENT_REGISTERABLE(StraightEmitter)

	public :

		/////////////////
		// Constructor //
		/////////////////

		/**
		* @brief The constructor of StraightEmitter
		* @param direction : the direction of the StraighEmitter
		*/
		StraightEmitter(const Vector3D& direction = Vector3D(0.0f,0.0f,-1.0f));

		/**
		* @brief Creates and registers a new StraightEmitter
		* @param direction : the direction of the StraighEmitter
		* @since 1.04.00
		*/
		static StraightEmitter* create(const Vector3D& direction = Vector3D(0.0f,0.0f,-1.0f));

		/////////////
		// Setters //
		/////////////

		/**
		* @brief Sets the direction of this StraightEmitter
		*
		* Note that it is not necessary to provide a normalized Vector3D.
		* This Vector3D only indicates a direction, its norm does not matter.
		*
		* @param direction : the direction of this StraightEmitter
		*/
		void setDirection(const Vector3D& direction);

		/////////////
		// Getters //
		/////////////

		/**
		* @brief Gets the direction of this StraightEmitter
		* @return the direction of this StraightEmitter
		*/
		const Vector3D& getDirection() const;

		/**
		* @brief Gets the transformed direction of this StraightEmitter
		* @return the transformed direction of this StraightEmitter
		*/
		const Vector3D& getTransformedDirection() const;

	protected :

		virtual void innerUpdateTransform();

	private :

		Vector3D direction;
		Vector3D tDirection;

		virtual void generateVelocity(Particle& particle,float speed) const;
	};


	inline StraightEmitter* StraightEmitter::create(const Vector3D& direction)
	{
		StraightEmitter* obj = new StraightEmitter(direction);
		registerObject(obj);
		return obj;
	}

	inline const Vector3D& StraightEmitter::getDirection() const
	{
		return direction;
	}

	inline const Vector3D& StraightEmitter::getTransformedDirection() const
	{
		return tDirection;
	}

	inline void StraightEmitter::generateVelocity(Particle& particle,float speed) const
	{
		particle.velocity() = tDirection;
		particle.velocity() *= speed;
	}
}

#endif
