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


#ifndef H_SPK_FACTORY
#define H_SPK_FACTORY

#include "Core/SPK_DEF.h"
#include "Core/SPK_Registerable.h"


/** 
* @def SPK_Copy(ClassName,arg)
* @brief Creates a new registered object from an existing one
*
* This macro is simply a shortcut call to :<br>
* <i>dynamic_cast<SPK::ClassName*>(SPK::SPKFactory::getInstance().create(arg)</i><br>
* with <i>arg</i> being either an SPK_ID or a pointer to an object and ClassName being the class of the object.<br>
* <br>
* If the ID does not exist or the object is not registered, NULL is returned.<br>
* <br>
* Note that a bad_cast exception can be throw as there is a dynamic_cast call.
* 
* @since 1.03.00
*/
#define SPK_Copy(ClassName,arg) \
dynamic_cast<ClassName*>(SPK::SPKFactory::getInstance().copy(arg))

/** 
* @def SPK_Get(ClassName,ID)
* @brief Gets a registered object
*
* This macro is simply a shortcut call to :<br>
* <i>dynamic_cast<ClassName*>(SPK::SPKFactory::getInstance().get(ID)</i><br>
* <br>
* If the ID does not exist, NULL is returned.<br>
* <br>
* Note that a bad_cast exception can be throw as there is a dynamic_cast call.
*
* @since 1.03.00
*/
#define SPK_Get(ClassName,ID) \
dynamic_cast<ClassName*>(SPK::SPKFactory::getInstance().get(ID))

/** 
* @def SPK_Copy(arg)
* @brief Destroys a registered object
* @since 1.03.00
*/
#define SPK_Destroy(arg) \
SPK::SPKFactory::getInstance().destroy(arg)

/** 
* @def SPK_Create(object)
* @brief Creates a registered object
* @since 1.03.00
*/
#define SPK_Create(object) \
SPK::SPKFactory::getInstance().create(object)

namespace SPK
{
	/**
	* @class SPKFactory
	* @brief A singleton class that allows to easily define, create, destroy and organize SPARK objects (Registerable)
	*
	* A Registerable can either be registered or not. A Registerable created with the SPKFactory becomes registered :
	* it is given a unique ID and is stored within a map in the SPKFactory.<br>
	* <br>
	* the SPKFactory allows the correct copy of a Registerable with all its children Registerable. Children registerable are only copied 
	* within the given Registerable if they are not shared (see Registerable) else only the reference to the shared Registerable is copied<br>
	* <br>
	* Moreover, destruction of Registerable and all children is very easy with the factory. Destroying a Registerable will destroy and all its
	* children which are destroyable and only referenced within the Registerable being destroyed.<br>
	* Note that the process is recursive through the tree, so destroyable children of destroyable children will be destroyed as well and so on.<br>
	* <br>
	* 4 main actions are performed by the SPKFactory :
	* <ul>
	* <li>Create a registered Registerable : This is performed with create(const Registerable&). the passed Registerable is used to create a registered Registerable
	* which is an exact copy. Every elements will be copied even the shared ones. The base Registerable can be registered or not.</li>
	* <li>Copy a registered Registerable : This is performed with copy(SPK_ID) or copy(const Registerable*). A registered copy of the registered Registerable is created.
	* The shared children are only referenced while the not shared ones are copied as well. The same happens for children of children and so on.</li>
	* <li>Destroy a registered Registerable : This is performed with destroy(SPK_ID,bool) or destroy(Registerable*,bool). The Registerable and all its destroyable
	* registered children will be destroyed. The tree is parsed to destroy children of children and so on. the boolean tells whether to check the number of
	* references of children or not.</li>
	* <li>Gets a registered Registerable from its ID. This is performed with get(SPK_ID). Every registered Registerable is stored in a map. The user can retrieve
	* the address of the Registerable with its ID (if the ID exists in the map).</li>
	* </ul>
	* Note that macros are implemented to ease the syntax :
	* <ul>
	* <li>SPK_Create(object)</li>
	* <li>SPK_Copy(ClassName,arg)</li>
	* <li>SPK_Get(ClassName,arg)</li>
	* <li>SPK_Destroy(arg)</li>
	* </ul>
	*
	* @since 1.03.00
	*/
	class SPK_PREFIX SPKFactory
	{
	friend class Registerable;

	public :

		/**
		* @brief Returns the unique instance of the SPKFactory
		* @return the unique instance of the SPKFactory
		*/
		static SPKFactory& getInstance();

		static void destroyInstance();

		/**
		* @brief Returns the number of Regiterable objects registered in the SPKFactory
		* @return the number of Regiterable objects registered in the SPKFactoty
		*/
		inline size_t getNbObjects() const;

		/**
		* @brief Creates a registered Registerable from the passed Registerable
		* @param base : The Registerable to create the new registered Registerable from
		* @return the ID of the new registered object
		*/
		SPK_ID create(const Registerable& base);
		
		/**
		* @brief Creates a new Registerable object which is a copy of the object at the given ID
		*
		* If no Registerable with this ID is registered, NULL is returned.
		*
		* @param ID : the ID of the Registerable to copy
		* @return a registered copy of the Registerable or NULL if the passed ID is not registered
		*/
		Registerable* copy(SPK_ID ID);

		/**
		* @brief Creates a new Registerable object which is a copy of the object
		*
		* If the passed Registerable is NULL or not registered, NULL is returned.<br>
		* Note that this function call internally <i>copy(registerable->getID())</i>.
		*
		* @param registerable : the registered Registerable to copy
		* @return a registered copy of the Registerable or NULL if the passed object is not registered
		*/
		Registerable* copy(const Registerable* registerable);

		/**
		* @brief Gets the Registerable of the given ID
		*
		* If the ID is not registered, NULL is returned
		*
		* @param ID : the ID of the Registerable to get
		* @return the Registerable with the passed ID or NULL if the ID is not registered
		*/
		Registerable* get(SPK_ID ID);
		
		/**
		* @brief Destroys the Registerable with the given ID and all its destroyable children
		*
		* If the ID is not registered, nothing is destroyed and false is returned.<br>
		* <br>
		* The checkNbReferences boolean tells the factory if the number of references of the Registerable to be destroyed
		* has to be checked.<br>
		* If set to true, the Registerable will be destroyed only if the number or references within the SPKFactory 
		* (ie in all registered object in the SPKFactory) is 0.<br>
		* If set to false, the Registerable will be destroyed in any case. Meaning that any reference within the SPKFactory
		* becomes invalid.
		*
		* @param ID : the ID of the Registerable to destroy
		* @param checkNbReferences : true to destroy only a Registerable with no references in the SPKFactory (safer), false not to perform the check
		* @return true if the Registerable has been deleted, false if not
		*/
		bool destroy(SPK_ID ID,bool checkNbReferences = true);

		/**
		* @brief Destroys the Registerable and all its destroyable children
		* 
		* If the Registerable is NULL or is not registered, nothing is destroyed and false is returned.<br>
		* Note that this function call internally <i>destroy(registerable->getID())</i>.<br>
		* <br>
		* see destroy(SPK_ID,bool) for more information.
		*
		* @param registerable the Registerable to destroy
		* @param checkNbReferences : true to destroy only a Registerable with no references in the SPKFactory (safer), false not to perform the check
		* @return true if the Registerable has been deleted, false if not
		*/
		bool destroy(Registerable* registerable,bool checkNbReferences = true);

		/** @brief Destroys all the registered Registerable in the SPKFactory */
		void destroyAll();

		/**
		* @brief Trace information on the Registerable with the given ID 
		* @param ID : the ID of the Registerable to trace
		*/
		void trace(SPK_ID ID);

		/**
		* @brief Trace information on the Registerable 
		*
		* Note that this function call internally <i>trace(registerable->getID())</i>.
		*
		* @param registerable : the Registerable to trace
		*/
		void trace(const Registerable* registerable);

		/** @brief Trace information on all the registered Registerable within the SPKFactory */
		void traceAll();

		/**
		* @brief Finds a registerable by name in the factory
		*
		* Note that this method only checks registerables in the SPKFactory.<br>
		* This method does not call the Registerable::findByName(const string&) of the registerables to check recursively.
		*
		* @param name : the name of the registerable to find in the factory
		* @return the first registerable with that name or NULL of none is found
		* @since 1.05.00
		*/
		Registerable* findByName(const std::string& name);

	private : 

		static SPKFactory* instance;
		static SPK_ID currentID;

		std::map<SPK_ID,Registerable*> SPKRegister;
		std::map<const Registerable*,Registerable*> SPKAdresses;

		void traceObject(const std::map<SPK_ID,Registerable*>::iterator& it,bool nextLine);

		inline bool isAlreadyProcessed(const Registerable* source);
		inline Registerable* getProcessedObject(const Registerable* source);
		inline void markAsProcessed(const Registerable* source,Registerable* object);
		
		Registerable* registerObject(Registerable* object);
		void unregisterObject(std::map<SPK_ID,Registerable*>::iterator& it,bool keepChildren = false);
		bool unregisterObject(SPK_ID ID,bool keepChildren = false);	

		// private constructors
		SPKFactory(){};
		SPKFactory(const SPKFactory&){};
		~SPKFactory(){this->destroyAll();}

#ifdef SPK_DEBUG
		size_t nbAlloc;
		size_t nbDesalloc;
#endif
	};


	inline size_t SPKFactory::getNbObjects() const
	{
		return SPKRegister.size();
	}

	inline bool SPKFactory::isAlreadyProcessed(const Registerable* source)
	{
		return SPKAdresses.find(source) != SPKAdresses.end();
	}

	inline Registerable* SPKFactory::getProcessedObject(const Registerable* source)
	{
		return SPKAdresses.find(source)->second;
	}

	inline void SPKFactory::markAsProcessed(const Registerable* source,Registerable* object)
	{
		SPKAdresses.insert(std::pair<const Registerable*,Registerable*>(source,object));
	}
}

#endif
