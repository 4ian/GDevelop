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


#include "Core/SPK_Registerable.h"
#include "Core/SPK_Factory.h"

namespace SPK
{
	const SPK_ID NO_ID(0);
	const std::string NO_NAME; 

	Registerable::Registerable() :
		ID(NO_ID),
		nbReferences(0),
		shared(false),
		destroyable(true),
		name(NO_NAME)
	{}

	Registerable::Registerable(const Registerable& registerable) :
		ID(NO_ID),
		nbReferences(0),
		shared(registerable.shared),
		destroyable(registerable.destroyable),
		name(registerable.name)
	{}

	Registerable::~Registerable(){}

	Registerable* Registerable::copyChild(Registerable* child,bool createBase)
	{
		if (child == NULL)
			return NULL;

		if (((child->isRegistered())&&(!child->isShared()))||(createBase))
		{
			if (SPKFactory::getInstance().isAlreadyProcessed(child))
			{
				Registerable* processedClone = SPKFactory::getInstance().getProcessedObject(child);
				processedClone->incrementReference();
				return processedClone;
			}

			Registerable* cloneChild = child->clone(createBase);
			SPKFactory::getInstance().registerObject(cloneChild);
			cloneChild->incrementReference();
			SPKFactory::getInstance().markAsProcessed(child,cloneChild);
			return cloneChild;
		}

		child->incrementReference();
		return child;
	}

	bool Registerable::destroyChild(Registerable* child,bool keepChildren)
	{
		if ((child == NULL)||(keepChildren))
			return false;

		child->decrementReference();

		if ((child->isRegistered())&&
			(child->isDestroyable())&&
			(child->getNbReferences() == 0))
		{
			SPKFactory::getInstance().unregisterObject(child->getSPKID());
			return true;
		}

		return false;
	}

	void Registerable::registerChild(Registerable* child,bool registerAll)
	{
		if (child == NULL)
			return;

		if (child->isRegistered())
		{
			child->incrementReference();
			child->registerChildren(registerAll);
		}
		else if (registerAll)
		{
			SPKFactory::getInstance().registerObject(child);
			child->incrementReference();
			child->registerChildren(registerAll);
		}
	}

	void Registerable::registerObject(Registerable* obj,bool registerAll)
	{
		if ((obj != NULL)&&(!obj->isRegistered()))
		{
			SPKFactory::getInstance().registerObject(obj);
			obj->registerChildren(registerAll);
		}
	}
}
