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


#ifndef H_SPK_PARTICLE
#define H_SPK_PARTICLE

#include "Core/SPK_DEF.h"
#include "Core/SPK_Vector3D.h"
#include "Core/SPK_Pool.h"
#include "Core/SPK_Model.h"


namespace SPK
{
	class Group;

	/**
	* @class Particle
	* @brief A single particle (a point in space with a velocity and different parameters)
	*
	* A Particle is the primitive on which all the SPARK engine relies.<br>
	* Particles are designed to be handled in large amounts (called Group).
	* This is why the user cannot update or render directly a single Particle.<br>
	* <br>
	* Note that the Particle class is only a class that presents an interface to the user (since 1.02.00), particles data are stored in the groups.
	* This is why copying a Particle will not copy its data.<br>
	*/
	class SPK_PREFIX Particle
	{
	friend bool isFurtherToCamera(const Particle&,const Particle&);
	friend void swapParticles(Particle& a,Particle& b);
	friend class Group;
	friend class Pool<Particle>;


	public :

		/**
		* @brief Sets the current value for the given parameter
		*
		* Note that the method will have no effect if the parameter is not enabled in the Particle's Model.
		* In this case, the method returns false.
		*
		* @param type : the parameter to set
		* @param value : the value of the parameter
		* @return true if the parameter can be set, false otherwise (if the parameter is not enabled)
		*/
		bool setParamCurrentValue(ModelParam type,float value);

		/**
		* @brief Sets the final value for the given parameter
		*
		* The final value is the value the parameter will have at the end of the Particle's life.<br>
		* Note that the method will have no effect if the parameter is not mutable in the Particle's Model.
		* In this case, the method returns false and setParamCurrentValue(ModelParam,float) should be used.
		*
		* @param type : the parameter to set
		* @param value : the value of the parameter
		* @return true if the parameter can be set, false otherwise (if the parameter is not mutable)
		*/
		bool setParamFinalValue(ModelParam type,float value);

		/**
		* @brief Changes the current value for the given parameter
		*
		* The delta is added to the current value of the parameter.<br>
		* For more information see setParamCurrentValue(ModelParam,float).
		*
		* @param type : the parameter to set
		* @param delta : the delta
		* @return true if the parameter can be changed, false otherwise (if the parameter is not enabled)
		* @since 1.02.00
		*/
		bool changeParamCurrentValue(ModelParam type,float delta);

		/**
		* @brief Changes the final value for the given parameter
		*
		* The delta is added to the final value of the parameter.<br>
		* For more information see setParamFinalValue(ModelParam,float).
		*
		* @param type : the parameter to set
		* @param delta : the delta
		* @return true if the parameter can be changed, false otherwise (if the parameter is not mutable)
		* @since 1.02.00
		*/
		bool changeParamFinalValue(ModelParam type,float delta);

		/**
		* @brief Sets the life left of the Particle.
		*
		* When the Particle's life reaches 0, the Particle is inactivated.
		*
		* @param life : the amount of life left of the Particle
		*/
		void setLifeLeft(float life);


		/////////////
		// Getters //
		/////////////

		/**
		* @brief Gets the position of the Particle
		* @return the position of this Particle
		* @since 1.02.00
		*/
		Vector3D& position();

		/**
		* @brief Gets the velocity of the Particle
		* @return the velocity of this Particle
		* @since 1.02.00
		*/
		Vector3D& velocity();

		/**
		* @brief Gets the old position of the Particle
		* @return the old position of this Particle
		* @since 1.02.00
		*/
		Vector3D& oldPosition();

		/**
		* @brief Gets the position of the Particle
		*
		* This is the constant version of position()
		*
		* @return the position of this Particle
		* @since 1.02.00
		*/
		const Vector3D& position() const;

		/**
		* @brief Gets the velocity of the Particle
		*
		* This is the constant version of velocity()
		*
		* @return the velocity of this Particle
		* @since 1.02.00
		*/
		const Vector3D& velocity() const;

		/**
		* @brief Gets the old position of the Particle
		*
		* This is the constant version of oldPosition()
		*
		* @return the old position of this Particle
		* @since 1.02.00
		*/
		const Vector3D& oldPosition() const;

		/**
		* @brief Gets the current value for the given parameter
		*
		* Note that if the the parameter is not enabled in the Particle's Model, the default value for the parameter is returned.
		*
		* @param type : the parameter to get the value
		* @return the current value of the parameter
		*/
		float getParamCurrentValue(ModelParam type) const;

		/**
		* @brief Gets the final value for the given parameter
		*
		* Note that if the the parameter is not enabled in the Particle's Model, the default value for the parameter is returned.<br>
		* If the parameter is enabled but not mutable, the current value is returned.
		*
		* @param type : the parameter to get the value
		* @return the current value of the parameter
		*/
		float getParamFinalValue(ModelParam type) const;

		/**
		* @brief Gets the Model of this Particle
		* @return A pointer on the Model of this Particle
		*/
		Model* getModel() const;

		/**
		* @brief Gets the group of this Particle
		* @return A pointer on the Group of this Particle
		* @since 1.02.00
		*/
		Group* getGroup() const;

		/**
		* @brief Gets the index of this Particle in its Group
		* @return the index of thi Particle in its Group
		* @since 1.03.00
		*/
		size_t getIndex() const;

		/**
		* @brief Gets the amount of life left of the Particle
		*
		* The life left of the Particle is the time left before the Particle dies.<br>
		* Note that in case of immortal particles, this value does not evolve.
		*
		* @return the amount of life left
		*/
		float getLifeLeft() const;

		/**
		* @brief Gets the age of the Particle
		*
		* The age of a Particle starts at zero when it is initialized and evolve at each update.<br>
		* Note that even immortal particles gets older.
		*
		* @return the age of the particle
		* @since 1.03.00
		*/
		float getAge() const;

		/**
		* @brief Gets the distance of this Particle from the camera.
		*
		* Note that the correct distance is only returned if the Group of this Particles has its distance computation enabled.
		*
		* @return the distance of this Particle from the camera
		* @since 1.01.00
		*/
		float getDistanceFromCamera() const;

		/**
		* @brief Gets the square distance of this Particle from the camera.
		*
		* Note that the correct distance is only returned if the Group of this Particles has its distance computation enabled.<br>
		* This method is faster than getDistanceFromCamera() and should be used instead when possible.
		*
		* @return the square distance of this Particle from the camera
		* @since 1.01.00
		*/
		float getSqrDistanceFromCamera() const;

		/**
		* @brief Tells whether this Particle was initialized at its latest update or not
		*
		* A call to this method is equivalent to <i>getAge() == 0.0f</i>
		*
		* @return true if this Particle was initialized at its latest update, false if not
		* @since 1.03.00
		*/
		bool isNewBorn() const;

		/**
		* @brief Tells whether this Particle is alive or not
		*
		* A call to this method is equivalent to <i>getLifeLeft > 0.0f</i>
		*
		* @return true if this Particle is alive, false if it is dead
		* @since 1.04.00
		*/
		bool isAlive() const;

		///////////////
		// Interface //
		///////////////

		/**
		* @brief Initializes the Particle
		*
		* When a Particle is initialized, all its parameters are reinitialized as well as its life.
		*/
		void init();

		/**
		* @brief Kills this Particle
		*
		* This method is equivalent to a call to setLifeLeft(float) with life being 0.<br>
		*
		* @since 1.01.00
		*/
		void kill();

		// As we know the color component are always enabled, we optimizes it a bit for access
		float getR() const { return currentParams[PARAM_RED]; }
		float getG() const { return currentParams[PARAM_GREEN]; }
		float getB() const { return currentParams[PARAM_BLUE]; }

	private :

		struct ParticleData
		{
			Vector3D oldPosition;
			Vector3D position;
			Vector3D velocity;
			float age;
			float life;
			float sqrDist;
		};

		Group* group;
		size_t index;

		ParticleData* data;
		float* currentParams;
		float* extendedParams;

		Particle(Group* group,size_t index);

		bool update(float timeDelta);
		void computeSqrDist();

		void interpolateParameters();
	};


	inline Group* Particle::getGroup() const
	{
		return group;
	}

	inline size_t Particle::getIndex() const
	{
		return index;
	}

	inline void Particle::setLifeLeft(float life)
	{
		data->life = life;
	}

	inline Vector3D& Particle::position()
	{
		return data->position;
	}

	inline Vector3D& Particle::velocity()
	{
		return data->velocity;
	}

	inline Vector3D& Particle::oldPosition()
	{
		return data->oldPosition;
	}

	inline const Vector3D& Particle::position() const
	{
		return data->position;
	}

	inline const Vector3D& Particle::velocity() const
	{
		return data->velocity;
	}

	inline const Vector3D& Particle::oldPosition() const
	{
		return data->oldPosition;
	}

	inline float Particle::getLifeLeft() const
	{
		return data->life;
	}

	inline float Particle::getAge() const
	{
		return data->age;
	}

	inline float Particle::getDistanceFromCamera() const
	{
		return std::sqrt(data->sqrDist);
	}

	inline float Particle::getSqrDistanceFromCamera() const
	{
		return data->sqrDist;
	}

	inline bool Particle::isNewBorn() const
	{
		return data->age == 0.0f;
	}

	inline bool Particle::isAlive() const
	{
		return data->life > 0.0f;
	}

	inline void Particle::kill()
	{
		data->life = 0.0f;
	}

	// specialization of the swap for particle
	template<>
	inline void Pool<Particle>::swapElements(Particle& a,Particle& b)
	{
		swapParticles(a,b);
	}


	//////////////////////////////////
	// Global functions definitions //
	//////////////////////////////////

	inline bool isFurtherToCamera(const Particle& a, const Particle& b)
	{
		return a.getSqrDistanceFromCamera() > b.getSqrDistanceFromCamera();
	}

	// Swaps particle data. Used internally. Do not use with particles that are not from the same group !
	extern void swapParticles(Particle& a,Particle& b);
}

#endif
