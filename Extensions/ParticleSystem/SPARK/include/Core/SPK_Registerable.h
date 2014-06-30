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


#ifndef H_SPK_REGISTERABLE
#define H_SPK_REGISTERABLE

#include "Core/SPK_DEF.h"
#include "Core/SPK_Vector3D.h"


// A macro implementing the clone method for Registerable children
// Note that copyChildren and destroyChildren have to be implemented manually if needed
#define SPK_IMPLEMENT_REGISTERABLE(ClassName) \
\
virtual ClassName* clone(bool createBase) const \
{ \
	ClassName* cloneObject = new ClassName(*this); \
	cloneObject->copyChildren(*this,createBase); \
	return cloneObject; \
} \
\
public : \
virtual std::string getClassName() const {return #ClassName;}


namespace SPK
{
	/** @brief the ID type of a Registerable */
	typedef unsigned long SPK_ID;
	
	/** @brief the ID constant value for unregistered Registerable */
	extern SPK_PREFIX const SPK_ID NO_ID;

	/** @brief an empty string defining the name of an object with no name */
	extern SPK_PREFIX const std::string NO_NAME;

	/**
	* @class Registerable
	* @brief the abstract base class for SPARK objects
	*
	* A Registerable defines a SPARK object that can be managed by the SPKFactory.<br>
	* <br>
	* In SPARK, a particle System is defined as a tree of objects. For instance, a System
	* will contain some Renderer, Emitter and Modifier. Every Emitter and Modifier will
	* contain a Zone...<br>
	* All those Registerable are linked by association. A Registerable can be shared to several
	* Registerable or belong to a single Registerable and die with it (composition).<br>
	* <br>
	* The SPKFactory offers a flexible system to define, create and destroy complex association
	* of Registerable.<br>
	* <br>
	* Basically a Registerable has 3 parameters that will define its behavior :
	* <ul>
	* <li><b>Registered</b> : a registered Registerable is managed by the SPKFactory to deal with copy and destruction.</li>
	* <li><b>Shared</b> : a shared Registerable will not be copied when copying its parent. Only its reference will. This allows
	* for instance to change a parameter for many system with only a call. Note that this is valid only for registered
	* Registerable copied with the SPKFactory.</li>
	* <li><b>Destroyable</b> : a destroyable Registerable is a Registerable that is allowed to be destroyed by the SPKFactory when destroying
	* its parent (if it has no more references on it see below). If not destroyable, the destruction of the Registerable is the user's responsability.
	* Note that a non destroyable Registerable can still be destroyed by the SPKFactory by a direct call.</li>
	* </ul>
	* Moreover, every registered Registerable holds a counter of references that indicates how many registered Registerable hold a reference to it.
	* A registered Registerable will only be destroyed by the SPKFactory if its number of references is 0 (except for a direct call to its destruction).
	*
	* @since 1.03.00
	*/
	class SPK_PREFIX Registerable
	{
	friend class SPKFactory;

	public :

		//////////////////
		// Constructors //
		//////////////////

		/** @brief Default constructor of Registerable */
		Registerable();

		/**
		* @brief Copy constructor of Registerable
		* @param registerable : the Registerable to construct the new Registerable from
		*/
		Registerable(const Registerable& registerable);

		////////////////
		// Destructor //
		////////////////

		/** @brief Destructor of Registerable */
		virtual ~Registerable();

		/////////////
		// Setters //
		/////////////

		/**
		* @brief Makes this Registerable shared or not
		*
		* By default, a Registerable is not shared
		*
		* @param shared : true to make this Registerable shared, false to make it unshared
		*/
		void setShared(bool shared);

		/**
		* @brief Makes this Registerable destroyable or not
		* 
		* A non destroyable Registerable cannot be destroyed internally.
		*
		* @param destroyable : true to make this Registerable destroyable, false to make it undestroyable
		*/
		void setDestroyable(bool destroyable);

		/**
		* @brief Sets the name of this Registerable
		*
		* The name is an easy to find registerable in a tree.<br>
		* See getName() and findByName(const std::string&)
		*
		* A constant NO_NAME exists to give no name to the registerable (an empty string)
		*
		* @param name : the name of this registerable
		* @since 1.05.00
		*/
		void setName(const std::string& name);

		/////////////
		// Getters //
		/////////////

		/**
		* @brief Gets the ID of this Registerable
		*
		* If this Registerable is unregistered, NO_ID is returned.<br>
		* Else an SPK_ID is returned. This ID uniquely identifies the Registerable.
		*
		* @return the ID of this Registerable or NO_ID if it is not registered
		* @since 1.05.04
		*/
		SPK_ID getSPKID() const;

		/**
		* @brief Gets the ID of this Registerable
		* @return the ID of this Registerable or NO_ID if it is not registered
		* @deprecated 1.05.04 Use getSPKID instead
		*/
		SPK_ID getID() const;

		/**
		* @brief Gets the number of references of this Registerable
		*
		* The number of references defines the number of times a registered Registerable
		* is references within all the registered Registerable.<br>
		* <br>
		* 0 is always returned for an unregistered Registerable.
		*
		* @return the number of references of this Registerable
		*/
		unsigned int getNbReferences() const;
		
		/**
		* @brief Tells whether this Registerable is registered or not
		* @return true if this Registerable is registered, false if not
		*/
		bool isRegistered() const;

		/**
		* @brief Tells whether this Registerable is shared or not
		* @return true if this Registerable is shared, false if not
		*/
		bool isShared() const;

		/**
		* @brief Tells whether this Registerable is destroyable or not
		* @return true if this Registerable is destroyable, false if not
		*/
		bool isDestroyable() const;

		/**
		* @brief Gets the name of this registerable
		* 
		* The name is an easy to find registerable in a tree.<br>
		* See setName(const std::string&) and findByName(const std::string&)
		*
		* @return the name of this registerable
		* @since 1.05.00
		*/
		const std::string& getName() const;

		/**
		* @brief Gets the name of the class of the object
		*
		* This method is implemented in non abstract derived class of Registerable with the macro SPK_IMPLEMENT_REGISTERABLE(ClassName).
		*
		* @return the name of the class of the object as a std::string
		*/
		virtual std::string getClassName() const = 0;

		///////////////
		// Interface //
		///////////////

		/**
		* @brief Finds a registerable with its name recursively from this registerable
		*
		* If the name is not found, NULL is returned.<br>
		* If the several objects with the same name exists, only the first one is returned.<br>
		* <br>
		* Note that the name of the registerable itself is already tested.
		*
		* @param name : the name of the registerable to find
		* @return : the first registerable with that name within this registerable or NULL if none is found
		* @since 1.05.00
		*/
		virtual Registerable* findByName(const std::string& name);

	protected :

		/**
		* @brief Registers a child of this Registerable
		*
		* This method has to be called in the registerChildren(bool) implementation of a derived class of Registerable.<br>
		* It is called to allow correct registering and correct reference counting of the children Registerable when registering the Registerable.
		*
		* @param child : the child of this Registerable to register
		* @param registerAll : true to register an unregistered child, false to only increment ref counts of an already registered child
		* @since 1.04.00
		*/
		void registerChild(Registerable* child,bool registerAll);

		/**
		* @brief Copies a child of this Registerable
		*
		* This method has to be called in the copyChildren(const Registerable&,bool) implementation of a derived class of Registerable.<br>
		* It is called to allow correct copy (of the object or of the reference only) of the children Registerable when copying the Registerable.
		*
		* @param child : the child of this Registerable to copy
		* @param createBase : true if a base is created, false otherwise
		* @return the children of the copy of this Registerable
		*/
		Registerable* copyChild(Registerable* child,bool createBase);

		/**
		* @brief Destroys a child of this Registerable
		*
		* This method has to be called in the destroyChildren(bool) implementation of a derived class of Registerable.<br> 
		* It is called to allows the correct destruction (if not destroyable or references exist) of the children Registerable when destroying the Registerable.
		*
		* @param child : the child of this Registerable to destroy
		* @param keepChildren : true to keep the children (used when destroying all registered Registerable)
		* @return true if the child was destroyed, false if not
		*/
		bool destroyChild(Registerable* child,bool keepChildren);

		/**
		* @brief Increments the number of references of the child by one
		*
		* This method has to be called when adding a child in the implementation of a derived class of Registerable.<br>
		* It allows to keep the number of references of the child correct.
		*
		* @param child : the child of this Registerable to increment references of
		*/
		void incrementChildReference(Registerable* child);

		/**
		* @brief Decrements the number of references of the child by one
		*
		* This method has to be called when removing a child in the implementation of a derived class of Registerable.<br>
		* It allows to keep the number of references of the child correct.
		*
		* @param child : the child of this Registerable to decrement references of
		*/
		void decrementChildReference(Registerable* child);

		/**
		* @brief Registers a Registerable in the factory
		*
		* This method allows to register an unregistered given object.<br>
		* If the registerable is already registered nothing happen.<br>
		* <br>
		* If registerAll is set to true, all the unregistered children of this Registerable will be registered as well.<br>
		* Apart from that, all registered children see their reference count increments by one, no matter the value of registerAll.<br>
		* <br>
		* Use this method with care as it is very important to never register a object that is allocated on the stack, as the factory
		* may delete its registered object with a call to delete.
		*
		* @param obj : the registerable object to register
		* @param registerAll : true to register all its unregistered children and chidren of children and so on, false not to
		* @since 1.04.00	
		*/
		static void registerObject(Registerable* obj,bool registerAll = false);

		/////////////////////
		// Virtual methods //
		/////////////////////

		/**
		* @brief Registers the children of this Registerable
		*
		* This method has to be implemented in derived classes of Registerable which hold pointers or references of Registerable children.<br>
		* The registerChild(Registerable*,bool) has to be called within it for each child to copy from object.<br>
		* The registerAll parameter of registerChild is simply the registerAll parameter of registerChildren.
		*
		* @param registerAll : true to register unregistered children, false to only increment ref counts of already registered children
		* @since 1.04.00
		*/
		virtual void registerChildren(bool registerAll){};

		/**
		* @brief Copies the children of object in this Registerable
		*
		* This method has to be implemented in derived classes of Registerable which hold pointers or references of Registerable children.<br>
		* The copyChild(Registerable*,bool) has to be called within it for each child to copy from object.<br>
		* The createBase parameter of copyChild is simply the createBase parameter of copyChildren.
		*
		* @param object : the object to copy the children from
		* @param createBase : true if a base is created, false otherwise
		*/
		virtual void copyChildren(const Registerable& object,bool createBase){};

		/**
		* @brief Destroys the children of this Registerable
		*
		* This method has to be implemented in derived classes of Registerable which hold pointers or references of Registerable children.<br>
		* The destroyChild(Registerable*,bool) has to be called within it for each child to destroy.<br>
		* The keepChildren parameter of destroyChild is simply the keepChildren parameter of destroyChildren.
		*
		* @param keepChildren : true to keep the children (used when destroying all registered Registerable)
		*/
		virtual void destroyChildren(bool keepChildren){};

	private :

		SPK_ID ID;
		unsigned int nbReferences;

		std::string name;

		bool shared;
		bool destroyable;

		// Those methods allow specific behavior when registering and unregistering in the SPKFactory
		virtual void onRegister() {}		// Called when a registerable is registered in the SPKFactory
		virtual void onUnregister() {}	// Called when a registerable is unregistered from the SPKFactory

		void incrementReference();
		void decrementReference();

		// the assignment operator is private
		Registerable& operator=(const Registerable& registerable);

		/////////////////////////
		// Pure virtual method //
		/////////////////////////

		/**
		* @brief Clones this Registerable
		*
		* This method is implemented in non abstract derived class of Registerable with the macro SPK_IMPLEMENT_REGISTERABLE(ClassName).
		*
		* @param createBase : true if a base is created, false otherwise
		* @return the clone of this Registerable
		*/
		virtual Registerable* clone(bool createBase) const = 0;
	};


	inline void Registerable::setShared(bool shared)
	{
		this->shared = shared;
	}
	
	inline void Registerable::setDestroyable(bool destroyable)
	{
		this->destroyable = destroyable;
	}

	inline void Registerable::setName(const std::string& name)
	{
		this->name = name;
	}

	inline SPK_ID Registerable::getSPKID() const
	{
		return ID;
	}

	inline SPK_ID Registerable::getID() const
	{
		return getSPKID();
	}

	inline unsigned int Registerable::getNbReferences() const
	{
		return nbReferences;
	}

	inline bool Registerable::isRegistered() const
	{
		return ID != NO_ID;
	}

	inline bool Registerable::isShared() const
	{
		return shared;
	}

	inline bool Registerable::isDestroyable() const
	{
		return destroyable;
	}

	inline const std::string& Registerable::getName() const
	{
		return name;
	}

	inline Registerable* Registerable::findByName(const std::string& name)
	{
		return getName().compare(name) == 0 ? this : NULL;
	}

	inline void Registerable::incrementReference()
	{
		if (isRegistered())
			++nbReferences;
	}

	inline void Registerable::decrementReference()
	{
		if ((isRegistered())&&(nbReferences > 0))
			--nbReferences;
	}

	inline void Registerable::incrementChildReference(Registerable* child)
	{
		if ((isRegistered())&&(child != NULL))
			child->incrementReference();
	}

	inline void Registerable::decrementChildReference(Registerable* child)
	{
		if ((isRegistered())&&(child != NULL))
			child->decrementReference();
	}
}

#endif
