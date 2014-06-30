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


#include "Core/SPK_Factory.h"


namespace SPK
{
	SPKFactory* SPKFactory::instance = NULL;
	SPK_ID SPKFactory::currentID = NO_ID;

	SPKFactory& SPKFactory::getInstance()
	{
		if (instance == NULL)
			instance = new SPKFactory;
		return *instance;
	}

	void SPKFactory::destroyInstance()
	{
		if (instance != NULL)
		{
			delete instance;
			instance = NULL;
		}
	}

	SPK_ID SPKFactory::create(const Registerable& base)
	{
		// Clears the adresses set
		SPKAdresses.clear();

		// clones the reference
		Registerable* innerBase = base.clone(true);

		// registers the base
		registerObject(innerBase);

		return innerBase->ID;
	}

	Registerable* SPKFactory::get(SPK_ID ID)
	{
		std::map<SPK_ID,Registerable*>::iterator it = SPKRegister.find(ID);
		if (it != SPKRegister.end())	// the ID was found
			return it->second;
		return NULL;					// the ID is not registered
	}

	Registerable* SPKFactory::copy(SPK_ID ID)
	{
		// Clears the adresses set
		SPKAdresses.clear();

		std::map<SPK_ID,Registerable*>::iterator it = SPKRegister.find(ID);
		if (it != SPKRegister.end())		// the ID was found
			return registerObject(it->second->clone(false));	// registers a copy
		return NULL;						// the ID is not registered
	}

	Registerable* SPKFactory::copy(const Registerable* registerable)
	{
		// Clears the adresses set
		SPKAdresses.clear();

		if (registerable->isRegistered())
			return registerObject(registerable->clone(false));	// registers a copy
		return NULL;
	}

	bool SPKFactory::destroy(SPK_ID ID,bool checkNbReferences)
	{
		std::map<SPK_ID,Registerable*>::iterator it = SPKRegister.find(ID);
		
		if ((it != SPKRegister.end())&&					// the ID was found
			((!checkNbReferences)||
			(it->second->getNbReferences() == 0)))
		{
			unregisterObject(it,false);
			return true;
		}

		return false;					// the ID is not registered
	}

	bool SPKFactory::destroy(Registerable* object,bool checkNbReferences)
	{
		if (object == NULL)
			return false;

		return destroy(object->getSPKID(),checkNbReferences);
	}

	void SPKFactory::destroyAll()
	{
		std::map<SPK_ID,Registerable*>::iterator it;
		while((it = SPKRegister.begin()) != SPKRegister.end())
			unregisterObject(it,true);
	}

	Registerable* SPKFactory::findByName(const std::string& name)
	{
		for (std::map<SPK_ID,Registerable*>::const_iterator it = SPKRegister.begin(); it != SPKRegister.end(); ++it)
			if (it->second->getName().compare(name) == 0)
				return it->second;

		return NULL;
	}

	void SPKFactory::trace(SPK_ID ID)
	{
		std::map<SPK_ID,Registerable*>::iterator it = SPKRegister.find(ID);
		if (it != SPKRegister.end())	// the ID was found
			traceObject(it,true);
		else							// the ID is not registered
			std::cout << "No object registered in the SPKFactory with this ID";
	}

	void SPKFactory::trace(const Registerable* registerable)
	{
		trace(registerable->getSPKID());
	}

	void SPKFactory::traceAll()
	{	
		std::cout << "Nb of objects in the SPKFactory : " << getNbObjects() << std::endl;
		for (std::map<SPK_ID,Registerable*>::iterator it = SPKRegister.begin(); it != SPKRegister.end(); ++it)
			traceObject(it,true);
	}

	void SPKFactory::traceObject(const std::map<SPK_ID,Registerable*>::iterator& it,bool nextLine)
	{
		SPK_ID ID = it->first;
		Registerable* object = it->second;
		std::cout << object 
			<< " ID:" << ID
			<< " type:" << object->getClassName().c_str()
			<< " nbRef:" << object->getNbReferences()
			<< " flag:";
		if (object->isShared()) std::cout << "S";
		if (object->isDestroyable()) std::cout << "D";
		if (object->getName().length() > 0) std::cout << " \"" << object->getName() << "\"";
		if (nextLine) std::cout << std::endl;
	}

	Registerable* SPKFactory::registerObject(Registerable* object)
	{
		object->onRegister();
		object->ID = ++currentID;
		
		// optimisation at the insertion to get an amortized constant complexity instead of a logarithmic complexity
		SPKRegister.insert(SPKRegister.size() != 0 ? --SPKRegister.end() : SPKRegister.begin(),
			std::pair<SPK_ID,Registerable*>(object->ID,object));

		// Traces allocations
#ifdef SPK_DEBUG
		++nbAlloc;
		std::cout << "REGISTER ";
		traceObject(SPKRegister.find(object->ID),false);
		std::cout << " nbAlloc:" << nbAlloc << " nbObj:" << getNbObjects() << std::endl;
#endif

		return object;
	}

	void SPKFactory::unregisterObject(std::map<SPK_ID,Registerable*>::iterator& it,bool keepChildren)
	{
		Registerable* object = it->second;
		object->onUnregister();

		// traces desallocations
#ifdef SPK_DEBUG
		++nbDesalloc;
		std::cout << "UNREGISTER ";
		traceObject(it,false);
		std::cout << " nbDesalloc:" << nbDesalloc << " nbObj:" << getNbObjects() - 1 << std::endl;
#endif

		SPKRegister.erase(it);					// unregister object
		object->ID = NO_ID;
		object->destroyChildren(keepChildren);	// unregister and destroy registered children	
		delete object;							// destroy object
	}

	bool SPKFactory::unregisterObject(SPK_ID ID,bool keepChildren)
	{
		std::map<SPK_ID,Registerable*>::iterator it = SPKRegister.find(ID);
		if (it != SPKRegister.end())		// the ID was found
		{
			unregisterObject(it,keepChildren);
			return true;
		}
		return false;
	}
}
