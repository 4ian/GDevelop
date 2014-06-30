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


#ifndef H_SPK_COLLISION
#define H_SPK_COLLISION

#include "Core/SPK_Modifier.h"
#include "Core/SPK_Particle.h"

namespace SPK
{
	/**
	* @class Collision
	* @brief A Modifier that perfoms particle against particle collisions in the Group
	*
	* The collision between particles uses the size of the particle to determine its radius.<br>
	* The radius of a particle is computed as follows :
	* <i>radius = size * scale * 0.5f</i><br>
	* <br>
	* Moreover the mass ratio of two particles colliding is used to get realistic collision.<br>
	* <br>
	* The collision can be set as being elastic or inelastic. This is determined thanks to the elasticity of this modifier :
	* <ul>
	* <li>An elasticity of 1.0f means the collision is fully elastic</li>
	* <li>An elasticity of 0.0f means the collision is fully inelastic</li>
	* <li>An elasticity superior to 1.0f means the collision creates energy. It is physically not possible but can however be set</li>
	* <li>An elasticity inferior to 0.0f has no sens and cannot be set</li>
	* <li>To simulate collisions the elasticity will generally be set between ]0.0f,1.0f[ depending on the material of the particle</li>
	* </ul>
	* Note that collision particle vs particles requires intensive processing.
	* Moreover the algorithm has a complexity that badly scales which means processing times increase fastly as particles count increase.<br>
	* Tries to limitate the number of particles to perform collision on. More than 1000 particles can require a lot of processing time even of recent hardware.<br>
	* <br>
	* The accuracy of the collisions is better with small update steps.
	* Therefore try to keep the update time small by for instance multiplying the number of updates per frame.
	*
	* @since 1.04.00
	*/
	class SPK_PREFIX Collision : public Modifier
	{
		SPK_IMPLEMENT_REGISTERABLE(Collision)

	public :

		/////////////////
		// Constructor //
		/////////////////

		/**
		* @brief Constructor of the Collision modifier
		* @param scale : the scale of the particles
		* @param elasticity : the elasticity of the collisions
		*/
		Collision(float scale = 1.0f,float elasticity = 1.0f);

		/**
		* @brief Creates and registers a new Collision
		* @param scale : the scale of the particles
		* @param elasticity : the elasticity of the collisions
		* @since 1.04.00
		*/
		static Collision* create(float scale = 1.0f,float elasticity = 1.0f);

		/////////////
		// Setters //
		/////////////

		/**
		* @brief Sets the scale of particles to compute their radius
		*
		* The radius of a particle is computed as follows :<br>
		* <i>radius = size * scale * 0.5f</i><br>
		*
		* @param scale : the scale of the particles
		*/
		void setScale(float scale);

		/**
		* @brief Sets the elasticity of the collisions
		*
		* The elasticity of the collisions refers to the coefficient of restitution (also called bounciness).<br>
		* See the class description for more information.
		*
		* @param elasticity : the elasticity of the collisions
		*/
		void setElasticity(float elasticity);

		/////////////
		// Getters //
		/////////////

		/**
		* @brief Gets the elasticity of the collisions
		* @return the elasticity of the collisions
		*/
		float getElasticity() const;

		/**
		* @brief Gets the scale applied on particle radius
		* @return the scale
		*/
		float getScale() const;

	private :

		float elasticity;
		float scale;

		virtual void modify(Particle& particle,float deltaTime) const;

		static void getMinMax(const Vector3D& v0,const Vector3D& v1,Vector3D& min,Vector3D& max);
		static bool checkBoundingRect(const Vector3D& min1,const Vector3D& max1,const Vector3D& min2,const Vector3D& max2);
	};


	inline Collision* Collision::create(float scale,float elasticity)
	{
		Collision* obj = new Collision(scale,elasticity);
		registerObject(obj);
		return obj;
	}

	inline void Collision::setElasticity(float elasticity)
	{
		if (elasticity >= 0.0f)
			this->elasticity = elasticity;
	}

	inline void Collision::setScale(float scale)
	{
		this->scale = scale;
	}

	inline float Collision::getElasticity() const
	{
		return elasticity;
	}

	inline float Collision::getScale() const
	{
		return scale;
	}
}

#endif

