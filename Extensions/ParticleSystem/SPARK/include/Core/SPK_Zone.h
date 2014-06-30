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


#ifndef H_SPK_ZONE
#define H_SPK_ZONE

#include "Core/SPK_DEF.h"
#include "Core/SPK_Registerable.h"
#include "Core/SPK_Transformable.h"
#include "Core/SPK_Vector3D.h"


namespace SPK
{
    class Particle;

	/**
	* @class Zone
	* @brief An abstract class that defines a zone in space
	*
	* A Zone is used in SPARK to :
	* <ul>
	* <li>define the area of an Emitter</li>
	* <li>define the area of a Modifier</li>
	* </ul>
	*/
	class SPK_PREFIX Zone : public Registerable, public Transformable
	{
	public :

		/////////////////
		// Constructor //
		/////////////////

		/**
		* @brief Default constructor for Zone
		* @param position : the position of the Zone
		*/
		Zone(const Vector3D& position = Vector3D());

		////////////////
		// Destructor //
		////////////////

		/** @brief Destructor of Zone */
		virtual ~Zone() {}

		////////////
		// Setter //
		////////////

		/**
		* @brief Sets the position of this Zone
		* @param v : the position of this Zone
		*/
		virtual void setPosition(const Vector3D& v);

		/////////////
		// Getters //
		/////////////

		/**
		* @brief Gets the position of this Zone
		* @return the position of this Zone
		*/
		const Vector3D& getPosition() const;

		/**
		* @brief Gets the transformed position of this Zone
		* @return the transformed position of this Zone
		* @since 1.03.00
		*/
		const Vector3D& getTransformedPosition() const;

		///////////////
		// Interface //
		///////////////

		/**
		* @brief Randomly generates a position inside this Zone for a given Particle
		* @param particle : the Particle whose position will be generated
		* @param full : true to generate a position in the whole volume of this Zone, false to generate a position only at borders
		*/
		virtual void generatePosition(Particle& particle,bool full) const = 0;

		/**
		* @brief Checks whether a point is within the Zone
		* @param point : the point to check
		* @return true if the point is within the Zone, false otherwise
		*/
		virtual bool contains(const Vector3D& point) const = 0;

		/**
		* @brief Checks whether a line intersects the Zone
		*
		* The intersection is computed only if the Vector3D* intersection is not NULL.<br>
		* The normal is computed if the Vector3D* normal AND intersection are not NULL.
		*
		* @param v0 : start of the line
		* @param v1 : end of the line
		* @param intersection : the Vector3D where the intersection will be stored, NULL not to compute the intersection
		* @param normal : the Vector3D where the normal will be stored, NULL not to compute the normal
		* @return true if the line intersects with the Zone, false otherwise
		*/
		virtual bool intersects(const Vector3D& v0,const Vector3D& v1,Vector3D* intersection,Vector3D* normal) const = 0;

		/**
		* @brief Moves a point at the border of the Zone
		* @param point : the point that will be moved to the border of the Zone
		* @param inside : true to move the point inside the Zone of APPROXIMATION_VALUE, false to move it outside of APPROXIMATION_VALUE
		*/
		virtual void moveAtBorder(Vector3D& point,bool inside) const = 0;

		/**
		* @brief Computes the normal for the point
		* @param point : the point from where the normal is computed
		* @return the normal vector
		* @since 1.02.00
		*/
		virtual Vector3D computeNormal(const Vector3D& point) const = 0;

	protected :

		/** @brief Value used for approximation */
		static const float APPROXIMATION_VALUE;

		/**
		* @brief A helper static method to normalize a Vector3D
		*
		* If the Vector3D is NULL, a random normal Vector3D is set.<br>
		* The randomness is guaranteed to be uniformely distributed.
		*
		* @param v : the Vector3D to normalize or randomize if not normalizable
		* @since 1.03.00
		*/
		static void normalizeOrRandomize(Vector3D& v);

		virtual void innerUpdateTransform();

	private :

		Vector3D position;
		Vector3D tPosition; // transformed position
	};


	inline void Zone::setPosition(const Vector3D& v)
	{
		position = tPosition = v;
		notifyForUpdate();
	}

	inline const Vector3D& Zone::getPosition() const
	{
		return position;
	}

	inline const Vector3D& Zone::getTransformedPosition() const
	{
		return tPosition;
	}

	inline void Zone::normalizeOrRandomize(Vector3D& v)
	{
		while(!v.normalize())
		{
			do v = Vector3D(random(-1.0f,1.0f),random(-1.0f,1.0f),random(-1.0f,1.0f));
			while (v.getSqrNorm() > 1.0f);
		}
	}

	inline void Zone::innerUpdateTransform()
	{
		transformPos(tPosition,position);
	}
}

#endif
