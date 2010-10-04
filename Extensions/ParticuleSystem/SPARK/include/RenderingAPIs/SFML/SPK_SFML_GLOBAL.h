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


#ifndef H_SPK_SFML_GLOBAL
#define H_SPK_SFML_GLOBAL

#include "RenderingAPIs/SFML/SPK_SFML_DEF.h"
#include "Core/SPK_Vector3D.h"
#include "Core/SPK_System.h"
#include "Core/SPK_Transformable.h"
#include "RenderingAPIs/SFML/SPK_SFMLRenderer.h"

namespace SPK
{
namespace SFML
{
	/**
	* @enum CameraAnchor
	* @brief Constatns to position the camera in SFML 2D engine
	* @since 1.01.01
	*/
	enum CameraAnchor
	{
		CAMERA_CENTER = 0,	/**< Constant defining the center */
		CAMERA_LEFT = -1,	/**< Constant defining the left */
		CAMERA_RIGHT = 1,	/**< Constant defining the right */
		CAMERA_TOP = -1,	/**< Constant defining the top */
		CAMERA_BOTTOM = 1,	/**< Constant defining the bottom */
	};

	/**
	* @brief Converts an SFML Vector2 into a SPARK Vector3D
	*
	* It performs this convertion :<br>
	* <i>Vector3D(v.x,v.y,0.0f)</i>
	*
	* @param v : the SFML Vector2 to convert
	* @return the converted Vector3D
	* @since 1.01.01
	*/
	inline Vector3D vectorSPK(sf::Vector2f& v)
	{
		return Vector3D(v.x,v.y);
	}

	/**
	* @brief Converts an SFML Vector3 into a SPARK Vector3D
	*
	* It performs this convertion :<br>
	* <i>Vector3D(v.x,v.y,v.z)</i>
	*
	* @param v : the SFML Vector3 to convert
	* @return the converted Vector3D
	* @since 1.01.01
	*/
	inline Vector3D vectorSPK(sf::Vector3f& v)
	{
		return Vector3D(v.x,v.y,v.z);
	}

	/**
	* @brief Converts an SPARK Vector3D into a SFML Vector2
	*
	* It performs this convertion :<ul>
	* <li>If addZ is false :<br>
	* <i>sf::Vector2f(v.x,v.y)</i></li>
	* <li>If addZ is true :<br>
	* <i>sf::Vector2f(v.x,v.y - zFactor * v.z)</i></li>
	* </ul>
	*
	* @param v : the SPARK Vector3D to convert
	* @param addZ : if true the z coodinate of the SPARK Vector is added th its y coordinate for the convertion
	* @return the converted sf::Vector2f
	* @since 1.01.01
	*/
	inline sf::Vector2f vector2SFML(Vector3D& v,bool addZ = false)
	{
		return sf::Vector2f(v.x,v.y - (addZ ? SFMLRenderer::getZFactor() * v.z : 0.0f));
	}

	/**
	* @brief Converts an SPARK Vector3D into a SFML Vector3
	*
	* It performs this convertion :<br>
	* <i>sf::Vector3f(v.x,v.y,v.z)</i>
	*
	* @param v : the SPARK Vector3D to convert
	* @return the converted sf::Vector3f
	* @since 1.01.01
	*/
	inline sf::Vector3f vector3SFML(Vector3D& v)
	{
		return sf::Vector3f(v.x,v.y,v.z);
	}

	/**
	* @brief Sets the camera position for a use in the SFML 2D engine
	*
	* This is an helper function to set up the camera position 
	* for either particle sorting or particle distance computation.<br>
	* <br>
	* The user has to define where to place the camera with the anchor.
	* This will influence the way particle are sorted.
	* By default the anchor are CAMERA_RIGHT and CAMERA_BOTTOM <hich correspond to a classical way to sort objects in 2D.<br>
	* <br>
	* The altitude and offset parameters can be used by default.
	* However the user has the possibility to manually set them.<br>
	* Basically any sorted System must be contained in the cube defined by <i>(2 * offset,2 * offset,altitude)</i><br>
	* <br>
	* System::setCameraPosition(const Vector3D&) can be used for more control.<br>
	* This function basically calls <i>System::setCameraPosition(Vector3D(anchorX * offset,anchorY * offset,altitude)).</i>
	*
	* @param anchorX : the anchor on the X axis
	* @param anchorY : the anchot on the Y axis
	* @param altitude : the altitude of the camera
	* @param offset : the offset the camera is positioned if not centered
	* @since 1.01.01
	*/
	inline void setCameraPosition(CameraAnchor anchorX = CAMERA_RIGHT,
		CameraAnchor anchorY = CAMERA_BOTTOM,
		float altitude = 10000.0f,
		float offset = 1000.0f)
	{
		System::setCameraPosition(Vector3D(anchorX * offset,anchorY * offset,altitude));
	}

	/**
	* @brief A helper function to set a SFML matrix to a transformable
	* @param transformable : the transformable which transform should be set
	* @param matrix : the SFML matrix to set to the transformable
	/ @since 1.03.01
	*/
	inline void setMatrix(Transformable& transformable,const sf::Matrix3& matrix)
	{
		transformable.setTransform(matrix.Get4x4Elements());
	}
}}

#endif
