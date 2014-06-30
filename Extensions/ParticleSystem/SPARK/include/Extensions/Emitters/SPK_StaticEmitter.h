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


#ifndef H_SPK_STATICEMITTER
#define H_SPK_STATICEMITTER

#include "Core/SPK_Emitter.h"


namespace SPK
{
	/**
	* @class StaticEmitter
	* @brief An Emitter that emits particles with no initial velocity
	* @since 1.05.00
	*/
	class StaticEmitter : public Emitter
	{
		SPK_IMPLEMENT_REGISTERABLE(StaticEmitter)

	public :

		/**
		* @brief Creates and registers a new StaticEmitter
		* @return A new registered StaticEmitter
		*/
		static StaticEmitter* create();

	private :

		virtual void generateVelocity(Particle& particle,float speed) const;
	};


	inline StaticEmitter* StaticEmitter::create()
	{
		StaticEmitter* obj = new StaticEmitter;
		registerObject(obj);
		return obj;
	}

	inline void StaticEmitter::generateVelocity(Particle& particle,float speed) const
	{
		particle.velocity().set(0.0f,0.0f,0.0f); // no initial velocity
	}
}

#endif


