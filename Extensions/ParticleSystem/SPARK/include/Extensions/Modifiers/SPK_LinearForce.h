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


#ifndef H_SPK_LINEARFORCE
#define H_SPK_LINEARFORCE

#include "Core/SPK_Modifier.h"
#include "Core/SPK_Model.h"


namespace SPK
{
	/**
	* @enum ForceFactor
	* @brief An enum defining the way a factor is applied to a force
	* @since 1.03.00
	*/
	enum ForceFactor
	{
		FACTOR_NONE,	/**< No factor is applied */
		FACTOR_LINEAR,	/**< A linear factor is applied */
		FACTOR_SQUARE,	/**< A square factor is applied */
	};

	/**
	* @class LinearForce
	* @brief A Modifier applying a linear force on particles
	*
	* The force is identical from any points of the universe (only if the modifier is triggered).<br>
	* In that way, particles under the influence of a LinearForce can theorically reach an infinite speed if not
	* under the influence of a friction.<br>
	* <br>
	* The force can be multiplied or not by a particle parameter either linearly or squared.
	* <br>
	* Note that this Modifier can be used to set a global gravity that can be updated for all groups at a time.<br>
	* To do so, the LinearForce has to be used with the param : <i>PARAM_MASS</i> and the FactorType <i>FACTOR_LINEAR</i>.
	*
	* @since 1.03.00
	*/
	class SPK_PREFIX LinearForce : public Modifier
	{
		SPK_IMPLEMENT_REGISTERABLE(LinearForce)

	public :

		/////////////////
		// Constructor //
		/////////////////

		/** 
		* @brief Default constructor for LinearForce
		* @param zone : the Zone of the LinearForce or NULL if no Zone
		* @param trigger : the trigger of the LinearForce
		* @param force : the force of the LinearForce
		* @param type : the type of multiplier for the factor
		* @param param : the parameter used as the factor (if type != FACTOR_NONE) 
		*/
		LinearForce(Zone* zone = NULL,
			ModifierTrigger trigger = INSIDE_ZONE,
			const Vector3D& force = Vector3D(),
			ForceFactor type = FACTOR_NONE,
			ModelParam param = PARAM_SIZE);

		/**
		* @brief Creates and registers a new LinearForce
		* @param zone : the Zone of the LinearForce or NULL if no Zone
		* @param trigger : the trigger of the LinearForce
		* @param force : the force of the LinearForce
		* @param type : the type of multiplier for the factor
		* @param param : the parameter used as the factor (if type != FACTOR_NONE)
		* @return A new registered LinearForce
		* @since 1.04.00
		*/
		static LinearForce* create(Zone* zone = NULL,
			ModifierTrigger trigger = INSIDE_ZONE,
			const Vector3D& force = Vector3D(),
			ForceFactor type = FACTOR_NONE,
			ModelParam param = PARAM_SIZE);

		/////////////
		// Setters //
		/////////////

		/**
		* @brief Sets the force vector
		* @param force : the force vector
		* @since 1.03.02
		*/
		void setForce(const Vector3D& force);

		/**
		* @brief Sets the factor type to apply to the force
		* @param type : the type of multiplier for the factor
		* @param param : the parameter of the Particle to use as the factor
		*/
		void setFactor(ForceFactor type,ModelParam param = PARAM_SIZE);

		/////////////
		// Getters //
		/////////////

		/**
		* @brief Gets the force vector
		* @return the force vector
		* @since 1.03.02
		*/
		const Vector3D& getForce() const;

		/**
		* @brief Gets the transformed force vector
		* @return the transformed force vector
		* @since 1.03.02
		*/
		const Vector3D& getTransformedForce() const;

		/**
		* @brief Gets the factor multiplier of this LinearForce
		* @return the factor multiplier of this LinearForce
		*/
		ForceFactor getFactorType() const;

		/**
		* @brief Gets the factor parameter of this LinearForce
		* @return the factor parameter of this LinearForce
		*/
		ModelParam getFactorParam() const;

	protected :

		virtual void innerUpdateTransform();

	private :

		Vector3D force;
		Vector3D tForce;

		ForceFactor factorType;
		ModelParam factorParam;

		virtual void modify(Particle& particle,float deltaTime) const;
	};


	inline LinearForce* LinearForce::create(Zone* zone,ModifierTrigger trigger,const Vector3D& force,ForceFactor type,ModelParam param)
	{
		LinearForce* obj = new LinearForce(zone,trigger,force,type,param);
		registerObject(obj);
		return obj;
	}
	
	inline void LinearForce::setForce(const Vector3D& force)
	{
		this->force = tForce = force;
		notifyForUpdate();
	}

	inline void LinearForce::setFactor(ForceFactor type,ModelParam param)
	{
		factorType = type;
		factorParam = param;
	}

	inline const Vector3D& LinearForce::getForce() const
	{
		return force;
	}

	inline const Vector3D& LinearForce::getTransformedForce() const
	{
		return tForce;
	}

	inline ForceFactor LinearForce::getFactorType() const
	{
		return factorType;
	}

	inline ModelParam LinearForce::getFactorParam() const
	{
		return factorParam;
	}

	inline void LinearForce::innerUpdateTransform()
	{
		Modifier::innerUpdateTransform();
		transformDir(tForce,force);
	}
}

#endif
