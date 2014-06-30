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


#ifndef H_SPK_MODIFIER
#define H_SPK_MODIFIER

#include "Core/SPK_DEF.h"
#include "Core/SPK_Vector3D.h"
#include "Core/SPK_Registerable.h"
#include "Core/SPK_BufferHandler.h"
#include "Core/SPK_Zone.h"
#include "Core/SPK_Particle.h"


namespace SPK
{
	class ModifierGroup;

	/**
	* @enum ModifierTrigger
	* @brief Constants defining the triggers for Modifier
	*/
	enum ModifierTrigger
	{
		ALWAYS = 1 << 0,			/**< No trigger, a Particle is always modified */
		INSIDE_ZONE = 1 << 1,		/**< Trigger defining a Particle inside the Zone */
		OUTSIDE_ZONE = 1 << 2,		/**< Trigger defining a Particle outside the Zone */
		INTERSECT_ZONE = 1 << 3,	/**< Trigger defining a Particle intersecting the Zone (in any direction) */
		ENTER_ZONE = 1 << 4,		/**< Trigger defining a Particle entering the Zone */
		EXIT_ZONE = 1 << 5,			/**< Trigger defining a Particle exiting the Zone */
	};

	/**
	* @class Modifier
	* @brief A abstract class that defines a physical object acting on particles
	*
	* A Modifier is first defined by a Zone and a trigger to that Zone.<br>
	* If the Particle triggers the Modifier, the Modifier's action is applied to the Particle.<br>
	* An action can be anything that has effect on the Particle's parameters, position, velocity, life...<br>
	* <br>
	* If no Zone is attached to a Modifier the Zone is considered to be the entire universe.<br>
	* <br>
	* Like an Emitter, a Modifier can either be used automatically within a Group or manually directly by the user.
	*/
	class SPK_PREFIX Modifier : public Registerable,
								public Transformable,
								public BufferHandler
	{
	friend class ModifierGroup;
	friend class Group;
	friend class Particle;

	public :

		/////////////////
		// Constructor //
		/////////////////

		/**
		* @brief Constructor of Modifier
		* @param availableTriggers : the available triggers for this Modifier (OR-ed)
		* @param trigger : the default trigger of the Modifier
		* @param needsIntersection : true if the computation of the intersection is needed, false otherwise
		* @param needsNormal : true if the computation of the normal is needed, false otherwise
		* @param zone : the Zone of the Modifier
		*/
		Modifier(int availableTriggers = ALWAYS,ModifierTrigger trigger = ALWAYS,bool needsIntersection = false,bool needsNormal = false,Zone* zone = NULL);

		////////////////
		// Destructor //
		////////////////

		/** @brief Destructor of Modifier */
		virtual ~Modifier() {}

		/////////////
		// Setters //
		/////////////

		/**
		* @brief Sets this Modifier active or not.
		*
		* An inactive Modifier will not affect its parent Group during update.<br>
		* However it can still be used manually by the user.
		*
		* @param active : true to activate this Modifier, false to deactivate it
		* @since 1.03.00
		*/
		void setActive(bool active);

		/**
		* @brief Sets the Zone of this Modifier
		*
		* If the Zone is NULL, the Zone is considered to be the entire universe.
		*
		* @param zone : the Zone of this Modifier
		* @param full : true to consider the Zone as a full object so that particles are not allowed to be within
		*/
		void setZone(Zone* zone,bool full = false);

		/**
		* @brief Sets the trigger of this Modifier
		*
		* if the trigger is not one of the available triggers (see getAvailableTriggers()) for this Modifier,
		* nothing happens ad false is returned else the trigger is set and true is returned.
		*
		* @param trigger : the trigger of this Modifier
		* @return true if the trigger can be set, false otherwise
		*/
		bool setTrigger(ModifierTrigger trigger);

		/**
		* @brief Sets whether to consider this modifier local to a system or not
		*
		* A local modifier is transformed when its system is transformed, a non local one will not.
		*
		* @param local : true to consider the modifier local, false not to
		* @since 1.03.02
		*/
		void setLocalToSystem(bool local);

		/////////////
		// Getters //
		/////////////

		/**
		* @brief Tells whether this Modifier is active or not
		* @return true if this Modifier is active, false if is is inactive
		* @since 1.03.00
		*/
		bool isActive() const;

		/**
		* @brief Gets the Zone of this Modifier
		* @return the Zone of this Modifier
		*/
		Zone* getZone() const;

		/**
		* @brief Gets the trigger of this Modifier
		* @return the trigger of this Modifier
		*/
		ModifierTrigger getTrigger() const;

		/**
		* @brief Gets a flag containing all the available triggers for this Modifier
		* @return a flag containing all the available triggers for this Modifier
		*/
		int getAvailableTriggers() const;

		/**
		* @brief Tells whether the Zone of this Modifier is considerered to be full or not
		* @return true if the Zone of this Modifier is considerered to be full, false if not
		*/
		bool isFullZone() const;

		/**
		* @brief Tells whether this modifier is considered as being local to a system or not
		*
		* A local modifier is transformed when its system is transformed, a non local one will not.
		*
		* @return true if it is local, false if not
		* @since 1.03.02
		*/
		bool isLocalToSystem() const;

		///////////////
		// Interface //
		///////////////

		virtual Registerable* findByName(const std::string& name);

	protected :

		/** @brief the Vector3D that holds the intersection coordinates */
		static Vector3D intersection;

		/** @brief the Vector3D that holds the intersection coordinates */
		static Vector3D normal;

		/** @brief true if the Modifier needs the intersection computation, false if not */
		bool needsIntersection;

		/** @brief true if the Modifier needs the normal computation, false if not */
		bool needsNormal;

		/** @brief the current trigger of this Modifier */
		ModifierTrigger trigger;

		/** @brief a flag containing all the available triggers */
		const int availableTriggers;

		virtual void registerChildren(bool registerAll);
		virtual void copyChildren(const Registerable& object,bool createBase);
		virtual void destroyChildren(bool keepChildren);

		virtual void propagateUpdateTransform();

	private :

		Zone* zone;
		bool full;

		bool active;
		mutable bool savedActive;

		bool local;

		void beginProcess(Group& group);
		void endProcess(Group& group);
		void process(Particle& particle,float deltaTime) const;

		//////////////////////////
		// Pure virtual methods //
		//////////////////////////

		/**
		* @brief A pure virtual method that modifies the Particle
		*
		* This is a pure virtual method to be implemented by children.<br>
		* The Modifier on this Particle has already been triggered and the Particle must be modified by this method.
		*
		* @param particle : the Particle that has to be modified
		* @param deltaTime : the time step
		*/
		virtual void modify(Particle& particle,float deltaTime) const = 0;

		/**
		* @brief A pure virtual method that handles particles on the wrong side of this Modifier Zone.
		*
		* This is a pure virtual method to be implemented by children.<br>
		* This method can be called internally with all triggers except SPK::TRIGGER_INTERSECTS.<br>
		* <br>
		* The method isFullZone() can be called to vary the behavior whether the Zone is full or not.<br>
		* The boolean inside indicates whether the wrong side is inside (true) or outside (false) the Zone.
		*
		* @param particle : the Particle which is on the wrong side
		* @param inside : true if the wrong side is inside, false if it is oustside
		*/
		virtual void modifyWrongSide(Particle& particle,bool inside) const {}
	};


	inline void Modifier::setActive(bool active)
	{
		this->active = active;
	}

	inline void Modifier::setLocalToSystem(bool local)
	{
		this->local = local;
	}

	inline bool Modifier::isActive() const
	{
		return active;
	}

	inline Zone* Modifier::getZone() const
	{
		return zone;
	}

	inline ModifierTrigger Modifier::getTrigger() const
	{
		return trigger;
	}

	inline int Modifier::getAvailableTriggers() const
	{
		return availableTriggers;
	}

	inline bool Modifier::isFullZone() const
	{
		return full;
	}

	inline bool Modifier::isLocalToSystem() const
	{
		return local;
	}

	inline void Modifier::propagateUpdateTransform()
	{
		if (zone != NULL)
			zone->updateTransform(this);
	}

	inline void Modifier::endProcess(Group& group)
	{
		active = savedActive; // Restores the active state of the modifier
	}

	inline void Modifier::process(Particle& particle,float deltaTime) const
	{
		switch(trigger)
		{
		case ALWAYS :
			modify(particle,deltaTime);
			break;

		case INSIDE_ZONE :
			if ((zone == NULL)||(zone->contains(particle.position())))
				modify(particle,deltaTime);
			else
				modifyWrongSide(particle,true);
			break;

		case OUTSIDE_ZONE :
			if (zone == NULL)
				return;
			if (!zone->contains(particle.position()))
				modify(particle,deltaTime);
			else
				modifyWrongSide(particle,false);
			break;

		case INTERSECT_ZONE :
			if (zone == NULL)
				return;
			if (zone->intersects(particle.oldPosition(),
				particle.position(),
				needsIntersection ? &intersection : NULL,
				needsNormal ? &normal : NULL))
				modify(particle,deltaTime);
			break;

		case ENTER_ZONE :
			if (zone == NULL)
				return;
			if (zone->contains(particle.oldPosition()))
				modifyWrongSide(particle,true);
			else if (zone->intersects(particle.oldPosition(),
				particle.position(),
				needsIntersection ? &intersection : NULL,
				needsNormal ? &normal : NULL))
				modify(particle,deltaTime);
			break;

		case EXIT_ZONE :
			if (zone == NULL)
				return;
			if (!zone->contains(particle.oldPosition()))
				modifyWrongSide(particle,false);
			else if (zone->intersects(particle.oldPosition(),
				particle.position(),
				needsIntersection ? &intersection : NULL,
				needsNormal ? &normal : NULL))
				modify(particle,deltaTime);
			break;
		}
	}
}

#endif
