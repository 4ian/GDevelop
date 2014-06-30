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

#ifndef H_SPK_MODIFIERGROUP
#define H_SPK_MODIFIERGROUP

#include "Core/SPK_Modifier.h"
#include "Core/SPK_Particle.h"
#include "Core/SPK_Zone.h"

namespace SPK
{
	/**
	* @class ModifierGroup
	* @brief A Group of Modifiers
	*
	* This modifier can be used in 2 ways :
	* <ul>
	* <li>Partition group : to partition the universe and make a global light test before testing inner modifiers more precisely.</li>
	* <li>Global group : To activate several modifiers with a single trigger.</li>
	* </ul>
	* By default a ModifierGroup is used as a partition group. the user can change it by calling useGlobalGroup(bool,bool) or usePartitionGroup(bool).
	* 
	* @since 1.02.00
	*/
	class SPK_PREFIX ModifierGroup : public Modifier
	{
		SPK_IMPLEMENT_REGISTERABLE(ModifierGroup)

	public :

		/////////////////
		// Constructor //
		/////////////////

		/**
		* @brief Constructor of ModifierGroup
		* @param zone : the Zone of this ModifierGroup
		* @param trigger : the trigger of the ModifierGroup
		*/
		ModifierGroup(Zone* zone = NULL,ModifierTrigger trigger = INSIDE_ZONE);

		/**
		* @brief Creates and registers a new ModifierGroup
		* @param zone : the Zone of this ModifierGroup
		* @param trigger : the trigger of the ModifierGroup
		* @return A new registered ModifierGroup
		* @since 1.04.00
		*/
		static ModifierGroup* create(Zone* zone = NULL,ModifierTrigger trigger = INSIDE_ZONE);

		/////////////
		// Setters //
		/////////////

		/**
		* @brief Uses this ModifierGroup as a global group
		*
		* A global group allows to use only one trigger for many modifiers. It works as follow :<ul>
		* <li>If the trigger of the partition group is activated, then the all children modifiers are activated no matter their Zone.</li>
		* <li>The same happens for the wrong side.</li>
		* </ul>
		* Note that if a child Modifier needs intersection or normal computation (the Modifier Obstacle for instance), the variables have to be set.
		*
		* @param useIntersection : true to enable intersection computation in this ModifierGroup
		* @param useNormal : true to enable normal computation in this ModifierGroup
		*/
		void useGlobalGroup(bool useIntersection = false,bool useNormal = false);

		/**
		* @brief Uses this ModifierGroup as a partition group
		*
		* A partition group allows to partition the space in order to have faster tests. It works as follow :<ul>
		* <li>If the trigger of the partition group is activated, then modifiers within are tested to check if they are triggered.</li>
		* <li>If yes, the Modifier is activated, if no, nothing happens.</li>
		* <li>If handleWrongSize if set, the isWrongSide() method of the partition group calls the isWrongSide() of its children if it has to.</li>
		* </ul>
		*
		* @param handleWrongSide : true to enable intersection computation in this ModifierGroup
		*/
		void usePartitionGroup(bool handleWrongSide = false);

		/////////////
		// Getters //
		/////////////

		/**
		* @brief Gets the number of modifiers in this ModifierGroup
		* @return the number of modifiers in this ModifierGroup
		*/
		size_t getNb() const;

		/**
		* @brief Gets the vector containing all the children modifiers
		* @return the vector containing all the children modifiers
		*/
		const std::vector<Modifier*>& getModifiers() const;

		/**
		* @brief Tells whether this ModifierGroup is a global group
		*
		* For more information about global groups, see useGlobalGroup(bool,bool).
		*
		* @return true if this ModifierGroup is a global group, false if not
		*/
		bool isGlobalGroup() const;

		/**
		* @brief Tells whether this ModifierGroup is a partition group
		*
		* For more information about partition groups, see usePartitionGroup(bool).
		*
		* @return true if this ModifierGroup is a partition group, false if not
		*/
		bool isPartitionGroup() const;

		/**
		* @brief Tells whether this partition group handles wrong side
		*
		* If this ModifierGroup is a global group, the return value is not used.<br>
		* For more information about partition groups, see usePartitionGroup(bool).<br>
		* <br>
		* Note that the wrong side can only be used with the following triggers :<ul>
		* <li>ModifierTrigger::INSIDE_ZONE</li>
		* <li>ModifierTrigger::OUTSIDE_ZONE</li>
		* <li>ModifierTrigger::ENTER_ZONE</li>
		* <li>ModifierTrigger::EXIT_ZONE</li>
		* </ul>
		*
		* @return true if this ModifierGroup handles wrong size, false if not
		*/
		bool handlesWrongSide() const;

		/**
		* @brief Tells whether this global group computes the intersection
		*
		* If this ModifierGroup is a partition group, the return value is not used.<br>
		* For more information about global groups, see useGlobalGroup(bool,bool).<br>
		* <br>
		* Note that the intersection can only be used with the following triggers :<ul>
		* <li>ModifierTrigger::INTERSECT_ZONE</li>
		* <li>ModifierTrigger::ENTER_ZONE</li>
		* <li>ModifierTrigger::EXIT_ZONE</li>
		* </ul>
		*
		* @return true if this ModifierGroup computes the intersection, false if not
		*/
		bool usesIntersection() const;

		/**
		* @brief Tells whether this global group computes the normal
		*
		* If this ModifierGroup is a partition group, the return value is not used.<br>
		* For more information about global groups, see useGlobalGroup(bool,bool).<br>
		* <br>
		* Note that the normal can only be used with the following triggers :<ul>
		* <li>ModifierTrigger::INTERSECT_ZONE</li>
		* <li>ModifierTrigger::ENTER_ZONE</li>
		* <li>ModifierTrigger::EXIT_ZONE</li>
		* </ul>
		*
		* @return true if this ModifierGroup computes the normal, false if not
		*/
		bool usesNormal() const;

		///////////////
		// Interface //
		///////////////

		/**
		* @brief Adds a Modifier to this ModifierGroup
		* @param modifier : the Modifier to add to this ModifierGroup
		*/
		void addModifier(Modifier* modifier);

		/**
		* @brief Removes a Modifier from this ModifierGroup
		* @param modifier : the Modifier to remove from this ModifierGroup
		* @return true if the Modifier has been found and removed, false if not
		*/
		bool removeModifier(const Modifier* modifier);

		/**
		* @brief Removes all Modifier children from this ModifierGroup
		*/
		void clear();

		virtual void createBuffers(const Group& group);
		virtual void destroyBuffers(const Group& group);

		virtual Registerable* findByName(const std::string& name);

	protected :

		virtual void registerChildren(bool registerAll);
		virtual void copyChildren(const Registerable& object,bool createBase);
		virtual void destroyChildren(bool keepChildren);

		virtual bool checkBuffers(const Group& group);

	private :

		std::vector<Modifier*> modifiers;

		bool globalZone;
		bool handleWrongSide;

		virtual void modify(Particle& particle,float deltaTime) const;
		virtual void modifyWrongSide(Particle& particle,bool inside) const;
	};


	inline ModifierGroup* ModifierGroup::create(Zone* zone,ModifierTrigger trigger)
	{
		ModifierGroup* obj = new ModifierGroup(zone,trigger);
		registerObject(obj);
		return obj;
	}
		
	inline void ModifierGroup::useGlobalGroup(bool useIntersection,bool useNormal)
	{
		globalZone = true;
		needsIntersection = useIntersection;
		needsNormal = useNormal;
	}

	inline void ModifierGroup::usePartitionGroup(bool handleWrongSide)
	{
		globalZone = false;
		this->handleWrongSide = handleWrongSide;
	}

	inline size_t ModifierGroup::getNb() const
	{
		return modifiers.size();
	}

	inline const std::vector<Modifier*>& ModifierGroup::getModifiers() const
	{
		return modifiers;
	}

	inline bool ModifierGroup::isGlobalGroup() const
	{
		return globalZone;
	}

	inline bool ModifierGroup::isPartitionGroup() const
	{
		return !globalZone;
	}

	inline bool ModifierGroup::handlesWrongSide() const
	{
		return handleWrongSide;
	}

	inline bool ModifierGroup::usesIntersection() const
	{
		return needsIntersection;
	}

	inline bool ModifierGroup::usesNormal() const
	{
		return needsNormal;
	}
}

#endif
