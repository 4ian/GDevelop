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


#ifndef H_SPK_REGWRAPPER
#define H_SPK_REGWRAPPER

#include "Core/SPK_DEF.h"
#include "Core/SPK_Registerable.h"


namespace SPK
{
	/**
	* @class RegWrapper
	* @brief A Wrapper class that allows to use any type of object as a Registerable
	*
	* It simply encapsulates an object of type defined at compilation time.<br>
	* It allows to define the behavior of these Group attributes when a copy of the Group occurs.<br>
	* <br>
	* The user can use it to define an attribute of a custom Registerable child class that needs to act as a Registerable.<br>
	* <br>
	* WARNING : T must obviously not be itself a Registerable.
	*
	* @since 1.03.00
	*/
	template<class T> 
	class RegWrapper : public Registerable
	{
		SPK_IMPLEMENT_REGISTERABLE(RegWrapper<T>)

	public :

		//////////////////
		// Constructors //
		//////////////////

		/** 
		* @brief Default constructor of RegWrapper 
		* @param object : the inner object
		*/
		RegWrapper<T>(const T& object = T());

		/**
		* @brief Creates and registers a new RegWrapper
		* @param object : the inner object
		* @return A new registered RegWrapper
		* @since 1.04.00
		*/
		static RegWrapper<T>* create(const T& object = T());
		
		/////////////
		// Getters //
		/////////////

		/**
		* @brief Gets a reference on the inner object
		* @return a reference on the inner object
		*/
		T& get();

		/**
		* @brief Gets a constant reference on the inner object
		* @return a constant reference on the inner object
		*/
		const T& get() const;
		
	private :

		T object;
	};

	
	template<class T>
	inline RegWrapper<T>* RegWrapper<T>::create(const T& object)
	{
		RegWrapper<T>* obj = new RegWrapper<T>(object);
		registerObject(obj);
		return obj;
	
	}

	template<class T>
	inline T& RegWrapper<T>::get()
	{
		return object;
	}

	template<class T>
	inline const T& RegWrapper<T>::get() const
	{
		return object;
	}
}

#endif
