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


#ifndef H_SPK_POINT
#define H_SPK_POINT

#include "Core/SPK_Zone.h"
#include "Core/SPK_Particle.h"


namespace SPK
{
	/**
	* @class Point
	* @brief A Zone defining a point in the universe
	*/
	class SPK_PREFIX Point : public Zone
	{
		SPK_IMPLEMENT_REGISTERABLE(Point)

	public :

		/////////////////
		// Constructor //
		/////////////////

		/**
		* @brief Constructor of Point
		* @param position : the position of the Point
		*/
		Point(const Vector3D& position = Vector3D(0.0f,0.0f,0.0f));

		/**
		* @brief Creates and registers a new Point
		* @param position : the position of the Point
		* @return A new registered Point
		* @since 1.04.00
		*/
		static inline Point* create(const Vector3D& position = Vector3D(0.0f,0.0f,0.0f));

		// Interface
		virtual inline void generatePosition(Particle& particle,bool full) const;
		virtual inline bool contains(const Vector3D& v) const;
		virtual inline bool intersects(const Vector3D& v0,const Vector3D& v1,Vector3D* intersection,Vector3D* normal) const;
		virtual inline void moveAtBorder(Vector3D& v,bool inside) const;
		virtual Vector3D computeNormal(const Vector3D& point) const;
	};


	/**
	* @brief The default Zone
	*
	* This Zone is used when a Zone is needed for initialization.<br>
	* It is a Point of coordinates (0.0f,0.0f,0.0f).
	*
	* @since 1.01.00
	*/
	extern SPK_PREFIX Point defaultZone;


	inline Point* Point::create(const Vector3D& position)
	{
		Point* obj = new Point(position);
		registerObject(obj);
		return obj;
	}
	
	inline void Point::generatePosition(Particle& particle,bool full) const
	{
		particle.position() = getTransformedPosition();
	}

	inline bool Point::contains(const Vector3D& v) const
	{
		return false;
	}

	inline bool Point::intersects(const Vector3D& v0,const Vector3D& v1,Vector3D* intersection,Vector3D* normal) const
	{
		return false;
	}

	inline void Point::moveAtBorder(Vector3D& v,bool inside) const {}
}

#endif
