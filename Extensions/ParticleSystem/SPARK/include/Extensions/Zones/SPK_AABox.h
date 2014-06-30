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


#ifndef H_SPK_AABOX
#define H_SPK_AABOX

#include "Core/SPK_Zone.h"

namespace SPK
{
	/**
	* @class AABox
	* @brief A Zone defining an axis-aligned Box
	*
	* An AABox is defined by its center and a dimension in each axis.
	*/
	class SPK_PREFIX AABox : public Zone
	{
		SPK_IMPLEMENT_REGISTERABLE(AABox)

	public :

		/////////////////
		// Constructor //
		/////////////////

		/**
		* @brief Constructor of AABox
		* @param position : the position of the AABox
		* @param dimension : the dimension of the AABox
		*/
		AABox(const Vector3D& position = Vector3D(0.0f,0.0f,0.0f),const Vector3D& dimension = Vector3D(0.0f,0.0f,0.0f));

		/**
		* @brief Creates and registers a new AABox
		* @param position : the position of the AABox
		* @param dimension : the dimension of the AABox
		* @since 1.04.00
		*/
		static AABox* create(const Vector3D& position = Vector3D(0.0f,0.0f,0.0f),const Vector3D& dimension = Vector3D(0.0f,0.0f,0.0f));

		////////////
		// Setter //
		////////////

		/**
		* @brief Sets the dimensions of this AABox
		*
		* The negative dimensions are clamped to 0.<br>
		* An AABox with 0 as its 3 dimensions is equivalent to a Point
		*
		* @param dimension : the dimensions of this AABox
		*/
		void setDimension(const Vector3D& dimension);

		////////////
		// Getter //
		////////////

		/**
		* @brief Gets the dimensions of this AABox
		* @return the dimensions of this AABox
		*/
		const Vector3D& getDimension() const;

		///////////////
		// Interface //
		///////////////

		virtual void generatePosition(Particle& particle,bool full) const;
		virtual bool contains(const Vector3D& v) const;
		virtual bool intersects(const Vector3D& v0,const Vector3D& v1,Vector3D* intersection,Vector3D* normal) const;
		virtual void moveAtBorder(Vector3D& v,bool inside) const;
		virtual Vector3D computeNormal(const Vector3D& point) const;

	private :

		Vector3D dimension;

		bool slabIntersects(float p0,float p1,float bMin,float bMax,float& tEnter,float& tExit,int& firstAxis,int axis) const;
	};


	inline AABox* AABox::create(const Vector3D& position,const Vector3D& dimension)
	{
		AABox* obj = new AABox(position,dimension);
		registerObject(obj);
		return obj;
	}

	inline const Vector3D& AABox::getDimension() const
	{
		return dimension;
	}

	inline bool AABox::slabIntersects(float p0,float p1,float bMin,float bMax,float& tEnter,float& tExit,int& firstAxis,int axis) const
	{
		float dir = p1 - p0;

		if (dir == 0.0f)
		{
			if ((p0 < bMin)||(p0 > bMax))
				return false;
			return true;
		}

		float t0 = (bMin - p0) / dir;
		float t1 = (bMax - p0) / dir;

		if (t0 > t1)
		{
			std::swap(t0,t1);
			axis += 3;
		}

		if ((t1 < tEnter)||(t0 > tExit))
			return false;

		if (t0 > tEnter)
		{
			tEnter = t0;
			firstAxis = (firstAxis & 0xF0) | (axis & 0x0F);
		}

		if (t1 < tExit)
		{
			tExit = t1;
			firstAxis = (firstAxis & 0x0F) | ((axis << 4) & 0xF0);
		}

		return true;
	}
}

#endif
