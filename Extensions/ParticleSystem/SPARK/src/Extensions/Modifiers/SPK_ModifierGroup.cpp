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


#include "Extensions/Modifiers/SPK_ModifierGroup.h"

namespace SPK
{
	ModifierGroup::ModifierGroup(Zone* zone,ModifierTrigger trigger) :
		Modifier(INSIDE_ZONE | OUTSIDE_ZONE | INTERSECT_ZONE | ENTER_ZONE | EXIT_ZONE,trigger,false,false,zone),
		modifiers(),
		globalZone(false),
		handleWrongSide(false)
	{}

	void ModifierGroup::registerChildren(bool registerAll)
	{
		Modifier::registerChildren(registerAll);

		for (std::vector<Modifier*>::const_iterator it = modifiers.begin(); it != modifiers.end(); ++it)
			registerChild(*it,registerAll);	
	}

	void ModifierGroup::copyChildren(const Registerable& object,bool createBase)
	{
		const ModifierGroup& modifier = dynamic_cast<const ModifierGroup&>(object);
		Modifier::copyChildren(modifier,createBase);

		// we clear the copies of pointers pushed in the vectors by the copy constructor
		modifiers.clear();

		for (std::vector<Modifier*>::const_iterator it = modifier.modifiers.begin(); it != modifier.modifiers.end(); ++it)
			modifiers.push_back(dynamic_cast<Modifier*>(copyChild(*it,createBase)));	
	}
	
	void ModifierGroup::destroyChildren(bool keepChildren)
	{
		for (std::vector<Modifier*>::const_iterator it = modifiers.begin(); it != modifiers.end(); ++it)
			destroyChild(*it,keepChildren);

		Modifier::destroyChildren(keepChildren);
	}

	Registerable* ModifierGroup::findByName(const std::string& name)
	{
		Registerable* object = Modifier::findByName(name);
		if (object != NULL)
			return object;

		for (std::vector<Modifier*>::const_iterator it = modifiers.begin(); it != modifiers.end(); ++it)
		{
			object = (*it)->findByName(name);
			if (object != NULL)
				return object;
		}

		return NULL;
	}

	void ModifierGroup::addModifier(Modifier* modifier)
	{
		if (modifier == NULL)
			return;

		incrementChildReference(modifier);
		modifiers.push_back(modifier);
	}

	bool ModifierGroup::removeModifier(const Modifier* modifier)
	{
		std::vector<Modifier*>::iterator it = std::find<std::vector<Modifier*>::iterator,const Modifier*>(modifiers.begin(),modifiers.end(),modifier);
		if (it != modifiers.end())
		{
			decrementChildReference(*it);
			modifiers.erase(it);
			return true;
		}

		return false;
	}

	void ModifierGroup::clear()
	{
		for (std::vector<Modifier*>::iterator it = modifiers.begin(); it != modifiers.end(); ++it)
			decrementChildReference(*it);

		modifiers.clear();
	}

	void ModifierGroup::modify(Particle& particle,float deltaTime) const
	{
		std::vector<Modifier*>::const_iterator end = modifiers.end();

		if (globalZone)
			for (std::vector<Modifier*>::const_iterator it = modifiers.begin(); it != end; ++it)
			{
				Zone* oldZone = (*it)->getZone();
				(*it)->setZone(getZone());
				(*it)->modify(particle,deltaTime);
				(*it)->setZone(oldZone);
			}
		else
			for (std::vector<Modifier*>::const_iterator it = modifiers.begin(); it != end; ++it)
				(*it)->process(particle,deltaTime);
	}

	void ModifierGroup::modifyWrongSide(Particle& particle,bool inside) const
	{
		if (globalZone)
		{
			std::vector<Modifier*>::const_iterator end = modifiers.end();
			for (std::vector<Modifier*>::const_iterator it = modifiers.begin(); it != end; ++it)
			{
				Zone* oldZone = (*it)->getZone();
				(*it)->setZone(getZone());
				(*it)->modifyWrongSide(particle,inside);
				(*it)->setZone(oldZone);
			}
		}
		else if (handleWrongSide)
		{
			std::vector<Modifier*>::const_iterator end = modifiers.end();
			for (std::vector<Modifier*>::const_iterator it = modifiers.begin(); it != end; ++it)
				if (((*it)->getZone() != NULL)&&((*it)->getTrigger() != INTERSECT_ZONE))
					modifyWrongSide(particle,true);
		}
	}

	void ModifierGroup::createBuffers(const Group& group)
	{
		std::vector<Modifier*>::iterator end = modifiers.end();
		for (std::vector<Modifier*>::iterator it = modifiers.begin(); it != end; ++it)
			(*it)->createBuffers(group);
	}

	void ModifierGroup::destroyBuffers(const Group& group)
	{
		std::vector<Modifier*>::iterator end = modifiers.end();
		for (std::vector<Modifier*>::iterator it = modifiers.begin(); it != end; ++it)
			(*it)->destroyBuffers(group);
	}

	bool ModifierGroup::checkBuffers(const Group& group)
	{
		std::vector<Modifier*>::iterator end = modifiers.end();
		for (std::vector<Modifier*>::iterator it = modifiers.begin(); it != end; ++it)
			if (!(*it)->checkBuffers(group))
				return false;

		return true;
	}
}
