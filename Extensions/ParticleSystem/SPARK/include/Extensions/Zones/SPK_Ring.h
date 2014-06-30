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

#ifndef H_SPK_RING
#define H_SPK_RING

#include "Core/SPK_Zone.h"

namespace SPK
{
	/**
	* @brief A ZOne defining a flat ring in the universe
	*
	* A ring is defined by :
	* <ul>
	* <li>The position of its center</li>
	* <li>The normal of the plane on which it lies</li>
	* <li>A minimum and maximum radius</li>
	* </ul>
	* Note that by having the minimum radius equal to 0, the ring becomes a disk in the universe.<br>
	* Note that the normal does not have to be normalized as it is normalized internally when set.
	*
	* @since 1.05.00
	*/
	class SPK_PREFIX Ring : public Zone
	{
		SPK_IMPLEMENT_REGISTERABLE(Ring)

	public :

		//////////////////
		// Constructors //
		//////////////////

		/**
		* @brief Constructor of ring
		* @param position : the position of the ring
		* @param normal : the normal of the plane on which lies the ring
		* @param minRadius : the minimum radius of the ring
		* @param maxRadius : the maximum radius of the ring
		*/
		Ring(const Vector3D& position = Vector3D(0.0f,0.0f,0.0f),const Vector3D& normal = Vector3D(0.0f,1.0f,0.0f),float minRadius = 0.0f,float maxRadius = 1.0f);

		/**
		* @brief Creates and registers a new Ring
		* @param position : the position of the ring
		* @param normal : the normal of the plane on which lies the ring
		* @param minRadius : the minimum radius of the ring
		* @param maxRadius : the maximum radius of the ring
		* @return a new registered ring
		*/
		static Ring* create(const Vector3D& position = Vector3D(0.0f,0.0f,0.0f),const Vector3D& normal = Vector3D(0.0f,1.0f,0.0f),float minRadius = 0.0f,float maxRadius = 1.0f);

		/////////////
		// Setters //
		/////////////

		/**
		* @brief Sets the normal of the plane on which lies this ring
		*
		* Note that the normal is normalized internally
		*
		* @param normal : the normal of the plane on which lies the ring
		*/
		void setNormal(const Vector3D& normal);

		/**
		* @brief Sets the min and max radius of this ring
		* 
		* A radius cannot be negative.<br>
		* Note that negative radius are inverted internally
		*
		* @param minRadius : the minimum radius of this ring
		* @param maxRadius : the maximum radius of this ring
		*/
		void setRadius(float minRadius,float maxRadius);

		/////////////
		// Getters //
		/////////////

		/**
		* @brief Gets the normal of this ring
		* @return the normal of this ring
		*/
		const Vector3D& getNormal() const;

		/**
		* @brief Gets the transformed normal of this ring
		* @return the transformed normal of this ring
		*/
		const Vector3D& getTransformedNormal() const;

		/**
		* @brief Gets the minimum radius of this ring
		* @return the minimum radius of this ring
		*/
		float getMinRadius() const;

		/**
		* @brief Gets the maximum radius of this ring
		* @return the maximum radius of this ring
		*/
		float getMaxRadius() const;

		///////////////
		// Interface //
		///////////////

		virtual void generatePosition(Particle& particle,bool full) const;
		virtual bool contains(const Vector3D& v) const;
		virtual bool intersects(const Vector3D& v0,const Vector3D& v1,Vector3D* intersection,Vector3D* normal) const;
		virtual void moveAtBorder(Vector3D& v,bool inside) const;
		virtual Vector3D computeNormal(const Vector3D& point) const;

	protected :

		virtual void innerUpdateTransform();

	private :

		Vector3D normal;
		Vector3D tNormal;

		float minRadius;
		float maxRadius;

		// Square of the radius (for optimization purpose)
		float sqrMinRadius;
		float sqrMaxRadius;
	};

	
	inline Ring* Ring::create(const Vector3D& position,const Vector3D& normal,float minRadius,float maxRadius)
	{
		Ring* obj = new Ring(position,normal,minRadius,maxRadius);
		registerObject(obj);
		return obj;
	}
		
	inline void Ring::setNormal(const Vector3D& normal)
	{
		this->normal = normal;
		this->normal.normalize();
		tNormal = this->normal;
		notifyForUpdate();
	}

	inline const Vector3D& Ring::getNormal() const
	{
		return normal;
	}

	inline const Vector3D& Ring::getTransformedNormal() const
	{
		return tNormal;
	}

	inline float Ring::getMinRadius() const
	{
		return minRadius;
	}

	inline float Ring::getMaxRadius() const
	{
		return maxRadius;
	}

	inline bool Ring::contains(const Vector3D& v) const
	{
		return false;
	}

	inline Vector3D Ring::computeNormal(const Vector3D& point) const
	{
		return tNormal;
	}
}

#endif
