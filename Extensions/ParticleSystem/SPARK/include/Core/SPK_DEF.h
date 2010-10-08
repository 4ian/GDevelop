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


#ifndef H_SPK_DEF
#define H_SPK_DEF


#include <cstdlib>
#include <cmath>
#include <algorithm>
#include <deque>
#include <list>
#include <iostream>
#include <vector>
#include <limits>
#include <map>
#include <set>
#include <string>
#include <cstring>

// 1.02.02 Compatibility with older versions
#ifdef SPK_DLL
#define SPK_CORE_IMPORT
#endif

#ifdef SPK_CORE_EXPORT
#define SPK_PREFIX __declspec(dllexport)
#elif defined(SPK_IMPORT) || defined(SPK_CORE_IMPORT)
#define SPK_PREFIX __declspec(dllimport)
#else
#define SPK_PREFIX
#endif

#ifdef _MSC_VER
#pragma warning(disable : 4251) // disables the warning about exporting STL classes in DLLs
#endif

// Trace for debugging
//#define SPK_DEBUG

#ifdef SPK_DEBUG
#define SPK_TRACE(text) std::cout << text << std::endl;
#define _CRTDBG_MAP_ALLOC
#include <crtdbg.h>
#define new new(_CLIENT_BLOCK,__FILE__,__LINE__)
#else
#define SPK_TRACE(text)
#endif

/**
* @mainpage SPARK Particle Engine
*
* SPARK is an open source library allowing to easily implement full particle systems in C++ applications.<br>
* <br>
* SPARK has been designed to be :
* <ul>
* <li>user friendly and easy to implement</li>
* <li>very configurable and as complete as possible</li>
* <li>evolving and upgradable by users</li>
* <li>portable and library free (it only uses the standard library)</li>
* </ul>
* <br>
* @section intro_sec Global Description
* in SPARK, a SPK::System is a collection of Groups of Particles.
* A SPK::Group contains a SPK::Pool of Particles and defines an complete universe for Particle evolution.
* This universe holds 3 types of physical objects :
* <ul>
* <li>the Emitters : an SPK::Emitter is an object that generates Particles</li>
* <li>the Modifiers : a SPK::Modifier is an object that will modify Particles behavior</li>
* <li>the Particles themselves : a SPK::Particle is a point that will follow physical laws and will be given some parameters that will evolve from their birth to their death.</li>
* </ul>
* Those parameters are defined by a SPK::Model of Particles.<br>
* The Emitters and Modifiers are physical entities whose body is represented by a SPK::Zone.<br>
* A SPK::Vector3D is the primitive object used in SPARK to represents triplets of coordinates in a universe 3D.<br>
* <br>
* Finally a system/groups can be renderered using a SPK::Renderer.
*/

/**
* @namespace SPK
* @brief the namespace for the whole SPARK library
*/
namespace SPK
{
	/** @brief the random seed for the pseudo random numbers generation */
	extern SPK_PREFIX unsigned int randomSeed;

	/**
	* @brief Returns a random number in the range [min,max[
	*
	* Note that the sequence of pseudo random number generated depends on the initial seed which can be set by setting randomSeed.<br>
	*
	* @param min : the minimum value
	* @param max : the maximum value
	*
	* @return a random number within [min,max[
	*/
	template<typename T>
	T random(T min,T max)
    {
		// optimized standard minimal
		long tmp0 = 16807L * (randomSeed & 0xFFFFL);
        long tmp1 = 16807L * (randomSeed >> 16);
        long tmp2 = (tmp0 >> 16) + tmp1;
        tmp0 = ((tmp0 & 0xFFFF)|((tmp2 & 0x7FFF) << 16)) + (tmp2 >> 15);

		// correction of the error
        if ((tmp0 & 0x80000000L) != 0)
			tmp0 = (tmp0 + 1) & 0x7FFFFFFFL;

		randomSeed = tmp0;

		// find a random number in the interval
        return static_cast<T>(min + ((randomSeed - 1) / 2147483646.0) * (max - min));
    }

	/////////////////////////
	// global enumerations //
	/////////////////////////

	/**
	* @enum ModelParam
	* @brief Constants for the Model parameters
	*/
	enum ModelParam
	{
		PARAM_RED = 0,				/**< The red component of the Particle */
		PARAM_GREEN = 1,			/**< The green component of the Particle */
		PARAM_BLUE = 2,				/**< The blue component of the Particle */
		PARAM_ALPHA = 3,			/**< The alpha component of the Particle */
		PARAM_SIZE = 4,				/**< The size of the Particle */
		PARAM_MASS = 5,				/**< The mass of the Particle */
		PARAM_ANGLE = 6,			/**< The angle of the texture of the Particle */
		PARAM_TEXTURE_INDEX = 7,	/**< the index of texture of the Particle */
		PARAM_ROTATION_SPEED = 8,	/**< the rotation speed of the particle (must be used with a rotator modifier) */
		PARAM_CUSTOM_0 = 9,			/**< Reserved for a user custom parameter. This is not used by SPARK */
		PARAM_CUSTOM_1 = 10,		/**< Reserved for a user custom parameter. This is not used by SPARK */
		PARAM_CUSTOM_2 = 11,		/**< Reserved for a user custom parameter. This is not used by SPARK */
	};
}

#endif
