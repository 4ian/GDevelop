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


#ifndef H_SPK_NORMALEMITTER
#define H_SPK_NORMALEMITTER

#include "Core/SPK_Emitter.h"


namespace SPK
{
	/**
	* @class NormalEmitter
	* @brief An Emitter that emits particles following a Zone normals
	*
	* The Zone used to derive the direction of emission can either be the Emitter Zone
	* or another Zone that can be set with setNormalZone(Zone*).<br>
	* If the normal zone is NULL the emitter Zone is used.
	*
	* @since 1.02.00
	*/
	class SPK_PREFIX NormalEmitter : public Emitter
	{
		SPK_IMPLEMENT_REGISTERABLE(NormalEmitter)

	public :

		//////////////////
		// Constructors //
		//////////////////

		/**
		* @brief Constructor of NormalEmitter
		* @param normalZone : the Zone used to compute normals (NULL to used the Emitter Zone)
		* @param inverted : true to invert the normals, false otherwise
		*/
		NormalEmitter(Zone* normalZone = NULL,bool inverted = false);

		/**
		* @brief Creates and registers a new NormalEmitter
		* @param normalZone : the Zone used to compute normals (NULL to used the Emitter Zone)
		* @param inverted : true to invert the normals, false otherwise
		* @return A new registered NormalEmitter
		* @since 1.04.00
		*/
		static NormalEmitter* create(Zone* normalZone = NULL,bool inverted = false);
		
		/////////////
		// Setters //
		/////////////

		/**
		* @brief Sets whether normals are inverted or not
		* @param inverted true to use inverted normals, false not to
		*/
		void setInverted(bool inverted);

		/**
		* @brief the Zone used to compute normals
		*
		* Note that if the normal zone is NULL, the Emitter Zone is used.
		*
		* @param zone : the Zone used to compute normals (NULL to used the Emitter Zone)
		*/
		void setNormalZone(Zone* zone);

		/////////////
		// Getters //
		/////////////

		/**
		* @brief Tells whether normals are inverted for this NormalEmitter
		* @return true if normals are inverted, false if not
		*/
		bool isInverted() const;
		
		/**
		* @brief Gets the normal Zone of this NormalEmitter
		* @return the normal Zone of this NormalEmitter
		*/
		Zone* getNormalZone() const;

		///////////////
		// Interface //
		///////////////

		virtual Registerable* findByName(const std::string& name);

	protected :

		virtual void registerChildren(bool registerAll);
		virtual void copyChildren(const Registerable& object,bool createBase);
		virtual void destroyChildren(bool keepChildren);

	private :

		bool inverted;
		Zone* normalZone;

		virtual void generateVelocity(Particle& particle,float speed) const;
	};


	inline NormalEmitter* NormalEmitter::create(Zone* normalZone,bool inverted)
	{
		NormalEmitter* obj = new NormalEmitter(normalZone,inverted);
		registerObject(obj);
		return obj;
	}

	inline void NormalEmitter::setInverted(bool inverted)
	{
		this->inverted = inverted;
	}

	inline bool NormalEmitter::isInverted() const
	{
		return inverted;
	}

	inline Zone* NormalEmitter::getNormalZone() const
	{
		return normalZone;
	}	
}

#endif
