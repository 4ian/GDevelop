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


#ifndef H_SPK_DESTROYER
#define H_SPK_DESTROYER

#include "Core/SPK_Modifier.h"


namespace SPK
{
	/**
	* @class Destroyer
	* @brief A Modifier that destroy particles
	*/
	class SPK_PREFIX Destroyer : public Modifier
	{
		SPK_IMPLEMENT_REGISTERABLE(Destroyer)

	public :

		/////////////////
		// Constructor //
		/////////////////

		/**
		* @brief Constructor of Destroyer
		* @param zone : the Zone of the Destroyer
		* @param trigger : the trigger of the Destroyer
		*/
		Destroyer(Zone* zone = NULL,ModifierTrigger trigger = INSIDE_ZONE);

		/**
		* @brief Creates and registers a new Destroyer
		* @param zone : the Zone of the Destroyer
		* @param trigger : the trigger of the Destroyer
		* @return A new registered Destroyer
		* @since 1.04.00
		*/
		static Destroyer* create(Zone* zone = NULL,ModifierTrigger trigger = INSIDE_ZONE);

	private :

		virtual void modify(Particle& particle,float deltaTime) const;
		virtual void modifyWrongSide(Particle& particle,bool inside) const;
	};


	inline Destroyer* Destroyer::create(Zone* zone,ModifierTrigger trigger)
	{
		Destroyer* obj = new Destroyer(zone,trigger);
		registerObject(obj);
		return obj;
	}
}

#endif
