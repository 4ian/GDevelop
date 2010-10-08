//////////////////////////////////////////////////////////////////////////////////
// SPARK Irrlicht Rendering library												//
// Copyright (C) 2009															//
// Thibault Lescoat -  info-tibo <at> orange <dot> fr							//
// Julien Fryer - julienfryer@gmail.com											//
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

#ifndef H_SPK_IRR_DEF
#define H_SPK_IRR_DEF

#include <irrlicht.h>
#include "Core/SPK_Vector3D.h"

#ifdef _MSC_VER
#pragma warning(disable : 4275) // disables the warning about exporting DLL classes children of non DLL classes
#endif

#ifdef SPK_IRR_EXPORT
#define SPK_IRR_PREFIX __declspec(dllexport)
#elif defined(SPK_IMPORT) || defined(SPK_IRR_IMPORT)
#define SPK_IRR_PREFIX __declspec(dllimport) 
#else
#define SPK_IRR_PREFIX
#endif

namespace SPK
{
/**
* @namespace SPK::IRR
* @brief the namespace for Irrlicht dependent SPARK code
* @since 1.04.00
*/
namespace IRR
{
	//////////////////////////
    // Conversion functions //
	//////////////////////////

    /**
	* @brief Converts a SPARK Vector3D to an Irrlicht vector3df
	* @param v : the Vector3D to convert
	* @return the Irrlicht vector3df
	*/
    inline irr::core::vector3df spk2irr(const Vector3D& v)
    {
        return irr::core::vector3df(v.x,v.y,v.z);
    }

	/**
	* @brief Converts an Irrlicht vector3df to a SPARK Vector3D 
	* @param v : the vector3df to convert
	* @return the SPARK Vector3D
	*/
    inline Vector3D irr2spk(const irr::core::vector3df& v)
    {
        return Vector3D(v.X,v.Y,v.Z);
    }

    /**
	* @brief Gets an Irrlicht SColor from rgba values
	* @param a : the alpha value
	* @param r : the red value
	* @param g : the green value
	* @param b : the blue value
	* @return the Irrlicht SColor
	*/
    inline irr::video::SColor spk2irr(float a, float r, float g, float b)
    {
        return irr::video::SColorf(r,g,b,a).toSColor();
    }
}}

#endif
