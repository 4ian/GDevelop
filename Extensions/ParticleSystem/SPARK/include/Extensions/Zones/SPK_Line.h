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


#ifndef H_SPK_LINE
#define H_SPK_LINE

#include "Core/SPK_Zone.h"

namespace SPK
{
	/**
	* @class Line
	* @brief A Zone defining a line in the universe
	*
	* As any Zone, a Line is defined by a position. The Line in itself is defined by two bounds.<br>
	* Moving the position results in moving the 2 bounds in the universe by the same vector.<br>
	* <br>
	* To conform with the Zone class (the position is defined as the center of the Zone), the position is always set to
	* be the center of the line. Therefore, if a bound is modified, the position will be modified as well.
	*
	* @since 1.01.00
	*/
	class SPK_PREFIX Line : public Zone
	{
		SPK_IMPLEMENT_REGISTERABLE(Line)

	public :

		/////////////////
		// Constructor //
		/////////////////

		/**
		* @brief Constructor of Line
		* @param p0 : the first bound of this Line
		* @param p1 : the second bound of this Line
		*/
		Line(const Vector3D& p0 = Vector3D(0.0f,0.0f,0.0f),const Vector3D& p1 = Vector3D(0.0f,0.0f,0.0f));

		/**
		* @brief Creates and registers a new Line
		* @param p0 : the first bound of this Line
		* @param p1 : the second bound of this Line
		* @since 1.04.00
		*/
		static Line* create(const Vector3D& p0 = Vector3D(0.0f,0.0f,0.0f),const Vector3D& p1 = Vector3D(0.0f,0.0f,0.0f));

		/////////////
		// Setters //
		/////////////

		void setPosition(const Vector3D& v);

		/**
		* @brief Sets the bounds of this Line
		* @param p0 : the first bound of this Line
		* @param p1 : the second bound of this Line
		*/
		void setBounds(const Vector3D& p0,const Vector3D& p1);

		/////////////
		// Getters //
		/////////////

		/**
		* @brief Gets the bound of index of this Line
		* @param index : the index of the bound (0 or 1)
		* @return the first bound of index of this Line
		* @since 1.03.00
		*/
		const Vector3D& getBound(size_t index) const;

		/**
		* @brief Gets the transformed bound of index of this Line
		* @param index : the index of the bound (0 or 1)
		* @return the transformed bound of index of this Line
		* @since 1.03.00
		*/
		const Vector3D& getTransformedBound(size_t index) const;

		///////////////
		// Interface //
		///////////////

		/**
		* @brief Pushes a new bound to this Line
		*
		* This method replaces the first bound by the second bound and the second bound by the new bound.<br>
		* It allows to follow the trajectory of a moving object over time with a single Line.
		*
		* @param bound : the new bound of this Line
		*/
		void pushBound(const Vector3D& bound);

		virtual void generatePosition(Particle& particle,bool full) const;
		virtual bool contains(const Vector3D& v) const;
		virtual bool intersects(const Vector3D& v0,const Vector3D& v1,Vector3D* intersection,Vector3D* normal) const;
		virtual void moveAtBorder(Vector3D& v,bool inside) const;
		virtual Vector3D computeNormal(const Vector3D& point) const;

	protected :

		virtual void innerUpdateTransform();

	private :

		Vector3D bounds[2];
		Vector3D tBounds[2];

		Vector3D tDist;

		void computeDist();
		void computePosition();
	};


	inline Line* Line::create(const Vector3D& p0,const Vector3D& p1)
	{
		Line* obj = new Line(p0,p1);
		registerObject(obj);
		return obj;
	}
		
	inline const Vector3D& Line::getBound(size_t index) const
	{
		return bounds[index];
	}

	inline const Vector3D& Line::getTransformedBound(size_t index) const
	{
		return tBounds[index];
	}

	inline bool Line::contains(const Vector3D& v) const
	{
		return false;
	}

	inline bool Line::intersects(const Vector3D& v0,const Vector3D& v1,Vector3D* intersection,Vector3D* normal) const
	{
		return false;
	}

	inline void Line::moveAtBorder(Vector3D& v,bool inside) const {}

	inline void Line::computeDist()
	{
		tDist = tBounds[1] - tBounds[0];		
	}

	inline void Line::computePosition()
	{
		Zone::setPosition((bounds[0] + bounds[1]) * 0.5f);
	}
}

#endif
