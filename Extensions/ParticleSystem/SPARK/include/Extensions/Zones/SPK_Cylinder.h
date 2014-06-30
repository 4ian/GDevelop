//////////////////////////////////////////////////////////////////////////////////
// SPARK particle engine														//
// Copyright (C) 2008-2010                                                      //
//  - Julien Fryer - julienfryer@gmail.com				                        //
//  - Thibault Lescoat -  info-tibo <at> orange <dot> fr						//
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

#ifndef H_SPK_CYLINDER
#define H_SPK_CYLINDER

#include "Core/SPK_Zone.h"

namespace SPK
{
	/**
	* @brief A Zone defining a cylinder in the universe
	*
	* A cylinder is defined by :
	* <ul>
	* <li>The position of its center</li>
	* <li>A direction</li>
	* <li>The radius of the cylinder</li>
	* <li>A dimension (length) along the direction</li>
	* </ul>
	* Note that the direction does not have to be normalized as it is normalized internally when set.
	*
	* @since 1.05.03
	*/
	class SPK_PREFIX Cylinder : public Zone
	{
		SPK_IMPLEMENT_REGISTERABLE(Cylinder)

	public :

		//////////////////
		// Constructors //
		//////////////////

		/**
		* @brief Constructor of cylinder
		* @param position : the position of the cylinder
		* @param direction : the direction of the cylinder
		* @param radius : the  radius of the cylinder
		*/
		Cylinder(const Vector3D& position = Vector3D(0.0f,0.0f,0.0f),const Vector3D& direction = Vector3D(0.0f,1.0f,0.0f),float radius = 1.0f,float length = 1.0f);

		/**
		* @brief Creates and registers a new cylinder
		* @param position : the position of the cylinder
		* @param direction : the direction of the cylinder
		* @param radius : the  radius of the cylinder
		* @return a new registered cylinder
		*/
		static Cylinder* create(const Vector3D& position = Vector3D(0.0f,0.0f,0.0f),const Vector3D& direction = Vector3D(0.0f,1.0f,0.0f),float radius = 1.0f,float length = 1.0f);

		/////////////
		// Setters //
		/////////////

		/**
		* @brief Sets the direction of the cylinder
		*
		* Note that the direction is normalized internally
		*
		* @param direction : the direction of the cylinder
		*/
		void setDirection(const Vector3D& direction);

		/**
		* @brief Sets the radius of this cylinder
		*
		* A radius cannot be negative.<br>
		* Note that negative radius are inverted internally
		*
		* @param radius : the radius of this cylinder
		*/
		void setRadius(float radius);

		/**
		* @brief Sets the length of this cylinder
		*
		* A length cannot be negative.<br>
		* Note that negative length are inverted internally
		*
		* @param length : the length of this cylinder
		*/
		void setLength(float length);

		/////////////
		// Getters //
		/////////////

		/**
		* @brief Gets the direction of this cylinder
		* @return the direction of this cylinder
		*/
		const Vector3D& getDirection() const;

		/**
		* @brief Gets the transformed direction of this cylinder
		* @return the transformed direction of this cylinder
		*/
		const Vector3D& getTransformedDirection() const;

		/**
		* @brief Gets the radius of this cylinder
		* @return the radius of this cylinder
		*/
		float getRadius() const;

		/**
		* @brief Gets the length of this cylinder
		* @return the length of this cylinder
		*/
		float getLength() const;

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

		Vector3D direction;
		Vector3D tDirection;

		float radius,length;
	};


	inline Cylinder* Cylinder::create(const Vector3D& position,const Vector3D& direction,float radius,float length)
	{
		Cylinder* obj = new Cylinder(position,direction,radius,length);
		registerObject(obj);
		return obj;
	}

	inline void Cylinder::setDirection(const Vector3D& direction)
	{
		this->direction = direction;
		this->direction.normalize();
		tDirection = this->direction;
		notifyForUpdate();
	}

	inline void Cylinder::setRadius(float radius)
	{
	    this->radius = (radius < 0 ? -radius : radius);
	}

	inline void Cylinder::setLength(float length)
	{
	    this->length = (length < 0 ? -length : length);
	}

	inline const Vector3D& Cylinder::getDirection() const
	{
		return direction;
	}

	inline const Vector3D& Cylinder::getTransformedDirection() const
	{
		return tDirection;
	}

	inline float Cylinder::getRadius() const
	{
		return radius;
	}

	inline float Cylinder::getLength() const
	{
	    return length;
	}
}

#endif
