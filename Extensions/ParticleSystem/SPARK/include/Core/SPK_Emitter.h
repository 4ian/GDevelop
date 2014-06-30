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


#ifndef H_SPK_EMITTER
#define H_SPK_EMITTER

#include "Core/SPK_DEF.h"
#include "Core/SPK_Registerable.h"
#include "Core/SPK_Transformable.h"
#include "Core/SPK_Zone.h"
#include "Core/SPK_Particle.h"


namespace SPK
{
	class Group;
	class Particle;


	/**
	* @class Emitter
	* @brief An abstract class that defines an emitter of particles
	*
	*
	* An Emitter is an object that will launch particles by giving them a velocity and a position.<br>
	* the position is derived from the Zone of the Emitter.<br>
	* the velocity is derived from the Emitter itself.<br>
	* <br>
	* An Emitter has a flow and a tank of particles.
	* The flow defines the rate at which particles are launched and the tank defines the total number of Particles the Emitter can launched.<br>
	* Note that the flow and the tank of an Emitter are only used when the Emitter emits automatically from a Group
	* but the user can also emit manually outside a Group.
	*/
	class SPK_PREFIX Emitter : public Registerable, public Transformable
	{
	friend class Group;

	public :

		/////////////////
		// Constructor //
		/////////////////

		/** @brief Constructor of Emitter */
		Emitter();

		////////////////
		// Destructor //
		////////////////

		/** @brief Destructor of Emitter */
		virtual ~Emitter() {}

		/////////////
		// Setters //
		/////////////

		/**
		* @brief Sets this Emitter active or not.
		*
		* An inactive Emitter will not emit in its parent Group during update.<br>
		* However it can still be used manually by the user.
		*
		* @param active : true to activate this Emitter, false to deactivate it
		* @since 1.05.00
		*/
		void setActive(bool active);

		/**
		* @brief Sets the number of particles in this Emitter's tank
		*
		* Each time the Emitter is updated, the number of particles emitted is deduced from the Emitter tank.
		* When the tank reaches 0, the Emitter will not emit any longer until it is refilled.<br>
		* <br>
		* A number of -1 (or any negative number) means the Emitter has an infinite tank which will never be empty.
		*
		* @param tank : the number of particles in this Emitters's tank
		*/
		void setTank(int tank);

		/**
		* @brief Changes the number of particles in this Emitters's tank
		*
		* The new number of particles in the tank is equal to : <i>number of particles in the tank + n</i>.<br>
		* This method has no effect for Emitters with infinite tank (a negative number of particles) and an Emitter cannot become infinite with this method (the new number is clamped to 0).
		*
		* @param deltaTank : the number to add to the current tank
		*/
		void changeTank(int deltaTank);

		/**
		* @brief Sets the flow of this Emitter
		*
		* The flow is in the unit : nb of particle per step.
		* A flow of -1 (or any negative number) indicates an infinite flow which means all particles in the Emitters(s tank are generated instantly.<br>
		* Note that if both the flow and the tank are infinite, nothing will happen.
		*
		* @param flow : the flow of this Emitter
		*/
		void setFlow(float flow);

		/**
		* @brief Changes the flow of particles of this Emitter
		*
		* The new flow is equal to : <i>flow of the Emitter + deltaFlow</i>.<br>
		* This method has no effect for Emitters with infinite flow (a negative flow of particles) and an Emitter's flow cannot become infinite with this method (the new flow is clamped to 0).
		*
		* @param deltaFlow : the number to add to the current flow
		*/
		void changeFlow(float deltaFlow);

		/**
		* @brief Sets the force of this Emitter
		*
		* The force of the Emitter vary for each launch of a Particle between a minimum and a maximum.
		* To have a fixed force for the Emitter, just have <i>min = max</i>.<br>
		* <br>
		* the speed at which a Particle will be launched is equal to : <i>force / weight of the Particle</i>.
		*
		* @param min : the minimum force of the Emitter
		* @param max : the maximum force of the Emitter
		*/
		void setForce(float min,float max);

		/**
		* @brief Sets the Zone of this Emitter
		*
		* If the Zone is NULL, the default Zone will be used (A Point centered at the origin)
		*
		* @param zone : the Zone of this Emitter
		* @param full : true to generate particles in the whole Zone, false to generate particles only at the Zone borders.
		*/
		void setZone(Zone* zone,bool full = true);

		/////////////
		// Getters //
		/////////////

		/**
		* @brief Tells whether this Emitter is active or not
		* @return true if this Emitter is active, false if is is inactive
		* @since 1.05.00
		*/
		bool isActive() const;

		/**
		* @brief Gets the number of particles in this Emitter's tank
		* @return the number of particles in this Emitters's tanl
		*/
		int getTank() const;

		/**
		* @brief Gets the flow of this Emitter
		* @return the flow of this Emitter
		*/
		float getFlow() const;

		/**
		* @brief Gets the minimum force of this Emitter
		* @return the minimum force of this Emitter
		*/
		float getForceMin() const;

		/**
		* @brief Gets the maximum force of this Emitter
		* @return the maximum force of this Emitter
		*/
		float getForceMax() const;

		/**
		* @brief Gets the Zone of this Emitter
		* @return the Zone of this Emitter
		*/
		Zone* getZone() const;

		/**
		* @brief Tells whether this Emitter emits in the whole Zone or only at its borders
		* @return true if this EMitter emits in the whole Zone, false if it is only at its borders
		*/
		bool isFullZone() const;

		/**
		* @brief Tells whether this Emitter is sleeping or not
		*
		* An Emitter is considered as sleeping if his flow or his tank is equal to 0.
		*
		* @return true if this Emitter is sleeping, false if it is active
		* @since 1.03.00
		*/
		bool isSleeping() const;

		///////////////
		// Interface //
		///////////////

		/**
		* @brief Emits a Particle from this Emitter
		*
		* The Particle's velocity is updated with a call to generateVelocity(Particle&).<br>
		* The Particle's position is updated with a call to Zone::generatePosition(Particle&) of the Emitter's Zone.<br>
		*
		* Note that this will not decrease the number of particles in the Emitter's tank.
		* To do it, the user has to manually make a call to changeNumber(-1) after this call.
		*
		* @param particle : the Particle to emit from this Emitter
		*/
		void emit(Particle& particle) const;

		/**
		* @brief Generates the velocity of the Particle
		*
		* The velocity of the Particle is updated in function of the Emitter's nature and parameters.<br>
		* Unlike emit() the position of the Particle remains unchanged.
		*
		* @param particle : the Particle whose velocity has to be updated
		*/
		void generateVelocity(Particle& particle) const;

		virtual Registerable* findByName(const std::string& name);

	protected :

		virtual void registerChildren(bool registerAll);
		virtual void copyChildren(const Registerable& object,bool createBase);
		virtual void destroyChildren(bool keepChildren);

		virtual void propagateUpdateTransform();

	private :

		Zone* zone;
		bool full;

		bool active;

		int tank;
		float flow;

		float forceMin;
		float forceMax;

		mutable float fraction;

		static Zone& getDefaultZone();

		unsigned int updateNumber(float deltaTime);

		/////////////////////////
		// pure virtual method //
		/////////////////////////

		/**
		* @brief A pure virtual method that generates the velocity of the Particle in function of a speed
		*
		* This is a pure virtual method to be implemented by children.<br>
		* <br>
		* the Particle velocity has to be set by this method.<br>
		* the generated velocity of the Particle must have a norm equal to speed.
		*
		* @param particle : the Particle whose velocity has to be generated
		* @param speed : the speed that the velocity must have
		*/
		virtual void generateVelocity(Particle& particle,float speed) const = 0;
	};


	inline void Emitter::setActive(bool active)
	{
		this->active = active;
	}
	
	inline void Emitter::setTank(int tank)
	{
		this->tank = tank;
	}

	inline void Emitter::setFlow(float flow)
	{
		this->flow = flow;
	}

	inline void Emitter::setForce(float min,float max)
	{
		forceMin = min;
		forceMax = max;
	}

	inline bool Emitter::isActive() const
	{
		return active;
	}

	inline int Emitter::getTank() const
	{
		return tank;
	}

	inline float Emitter::getFlow() const
	{
		return flow;
	}

	inline float Emitter::getForceMin() const
	{
		return forceMin;
	}

	inline float Emitter::getForceMax() const
	{
		return forceMax;
	}

	inline Zone* Emitter::getZone() const
	{
		return zone;
	}

	inline bool Emitter::isFullZone() const
	{
		return full;
	}

	inline bool Emitter::isSleeping() const
	{
		return ((tank == 0)||(flow == 0.0f));
	}

	inline void Emitter::emit(Particle& particle) const
	{
		zone->generatePosition(particle,full);
		generateVelocity(particle);
	}

	inline void Emitter::generateVelocity(Particle& particle) const
	{
		generateVelocity(particle,random(forceMin,forceMax) / particle.getParamCurrentValue(PARAM_MASS));
	}

	inline void Emitter::propagateUpdateTransform()
	{
		zone->updateTransform(this);
	}
}

#endif
