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


#ifndef H_SPK_SPHERICEMITTER
#define H_SPK_SPHERICEMITTER

#include "Core/SPK_Emitter.h"


namespace SPK
{
	/**
	* @class SphericEmitter
	* @brief An Emitter that emits particles in a portion of sphere
	*
	* This Emitter can emit particles in a spheric way.
	* To do that 2 angles and a direction Vector3D can be parametered :
	* <ul>
	* <li>The direction Vector3D defines the direction of the emitter.</li>
	* <li>The angles defines the area in between which wil be emitted the particles velocities.</li>
	* </ul>
	* Here are a few examples :
	* <ul>
	* <li><i>0 and 2 * PI</i> will define a complete sphere ie equivalent to a RandomEmitter</li>
	* <li><i>0 and 0</i> will define a Emitter equivalent to a StraightEmitter</li>
	* <li><i>PI and PI</i> will define a disk</li>
	* <li><i>PI / 2 and PI / 2</i> will define a Cone of angle PI / 2</li>
	* <li>...</li>
	* </ul>
	*/
	class SPK_PREFIX SphericEmitter : public Emitter
	{
		SPK_IMPLEMENT_REGISTERABLE(SphericEmitter)

	public :

		/////////////////
		// Constructor //
		/////////////////

		/**
		* @brief Constructor of SphericEmitter
		* @param direction : the direction of the SphericEmitter
		* @param angleA : the first angle in radians of the SphericEmitter
		* @param angleB : the second angle in radians of the SphericEmitter
		*/
		SphericEmitter(const Vector3D& direction = Vector3D(0.0f,0.0f,-1.0f),float angleA = 0.0f,float angleB = 0.0f);

		/**
		* @brief Creates and registers a new SphericEmitter
		* @param direction : the direction of the SphericEmitter
		* @param angleA : the first angle in radians of the SphericEmitter
		* @param angleB : the second angle in radians of the SphericEmitter
		* @since 1.04.00
		*/
		static SphericEmitter* create(const Vector3D& direction = Vector3D(0.0f,0.0f,-1.0f),float angleA = 0.0f,float angleB = 0.0f);

		/////////////
		// Setters //
		/////////////

		/**
		* @brief Sets the direction of this SphericEmitter
		*
		* Note that it is not necessary to provide a normalized Vector3D.
		* This Vector3D only indicates a direction, its norm does not matter.
		*
		* @param direction : the direction of this SphericEmitter
		*/
		void setDirection(const Vector3D& direction);

		/**
		* @brief Sets the angles of this SphericEmitter
		*
		* Note that angles are clamped between 0 and 2 * PI
		* AngleA does not have to be inferior to angleB, it has no importance as angles are sorted within the method.
		*
		* @param angleA : the first angle in radians of this SphericEmitter
		* @param angleB : the second angle in radians of this SphericEmitter
		*/
		void setAngles(float angleA,float angleB);

		/////////////
		// Getters //
		/////////////

		/**
		* @brief Gets the direction of this SphericEmitter
		* @return the direction of this SphericEmitter
		*/
		const Vector3D& getDirection() const;

		/**
		* @brief Gets the direction of this SphericEmitter
		* @return the direction of this SphericEmitter
		*/
		const Vector3D& getTransformedDirection() const;

		/**
		* @brief Gets the minimum angle of this SphericEmitter
		* @return the minimum angle of this SphericEmitter
		*/
		float getAngleMin() const;

		/**
		* @brief Gets the maximum angle of this SphericEmitter
		* @return the maximum angle of this SphericEmitter
		*/
		float getAngleMax() const;

	protected :

		virtual void innerUpdateTransform();

	private :

		static const float PI;

		Vector3D direction;
		Vector3D tDirection; // transformed direction

		float angleMin;
		float angleMax;

		float cosAngleMin;
		float cosAngleMax;

		float matrix[9];

		void computeMatrix();

		virtual void generateVelocity(Particle& particle,float speed) const;
	};


	inline SphericEmitter* SphericEmitter::create(const Vector3D& direction,float angleA,float angleB)
	{
		SphericEmitter* obj = new SphericEmitter(direction,angleA,angleB);
		registerObject(obj);
		return obj;
	}

	inline const Vector3D& SphericEmitter::getDirection() const
	{
		return direction;
	}

	inline const Vector3D& SphericEmitter::getTransformedDirection() const
	{
		return tDirection;
	}

	inline float SphericEmitter::getAngleMin() const
	{
		return angleMin;
	}

	inline float SphericEmitter::getAngleMax() const
	{
		return angleMax;
	}
}

#endif
