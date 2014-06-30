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


#ifndef H_SPK_SPHERE
#define H_SPK_SPHERE

#include "Core/SPK_Zone.h"

namespace SPK
{
	/**
	* @class Sphere
	* @brief A Zone defining a sphere in the universe
	*/
	class SPK_PREFIX Sphere : public Zone
	{
		SPK_IMPLEMENT_REGISTERABLE(Sphere)

	public :

		/////////////////
		// Constructor //
		/////////////////

		/**
		* @brief Constructor of Sphere
		* @param position : position of the center of the Sphere
		* @param radius : radius of the Sphere
		*/
		Sphere(const Vector3D& position = Vector3D(0.0f,0.0f,0.0f),float radius = 0.0f);

		/**
		* @brief Creates and registers a new Sphere
		* @param position : position of the center of the Sphere
		* @param radius : radius of the Sphere
		* @return A new registered Sphere
		* @since 1.04.00
		*/
		static Sphere* create(const Vector3D& position = Vector3D(0.0f,0.0f,0.0f),float radius = 0.0f);

		////////////
		// Setter //
		////////////

		/**
		* @brief Sets the radius of this Sphere
		*
		* A negative radius will be clamped to 0.0f and the Sphere will therefore acts as a Point.
		*
		* @param radius : the radius of this Sphere
		*/
		void setRadius(float radius);

		////////////
		// Getter //
		////////////

		/**
		* @brief Gets the radius of this Sphere
		* @return the radius of this Sphere
		*/
		float getRadius() const;

		///////////////
		// Interface //
		///////////////

		virtual void generatePosition(Particle& particle,bool full) const;
		virtual bool contains(const Vector3D& v) const;
		virtual bool intersects(const Vector3D& v0,const Vector3D& v1,Vector3D* intersection,Vector3D* normal) const;
		virtual void moveAtBorder(Vector3D& v,bool inside) const;
		virtual Vector3D computeNormal(const Vector3D& point) const;

	private :

		float radius;
	};


	inline Sphere* Sphere::create(const Vector3D& position,float radius)
	{
		Sphere* obj = new Sphere(position,radius);
		registerObject(obj);
		return obj;
	}
		
	inline void Sphere::setRadius(float radius)
	{
		this->radius = radius >= 0.0f ? radius : 0.0f;
	}

	inline float Sphere::getRadius() const
	{
		return radius;
	}
}

#endif
