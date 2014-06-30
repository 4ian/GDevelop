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


#ifndef H_SPK_BUFFERHANDLER
#define H_SPK_BUFFERHANDLER

#include "Core/SPK_DEF.h"


namespace SPK
{
	class Group;

	/**
	* @class BufferHandler
	* @brief A base interface that allows manipulation on Buffer
	* @since 1.04.00
	*/
	class SPK_PREFIX BufferHandler
	{
	public :

		////////////////
		// Destructor //
		////////////////

		/** @brief Destructor of BufferHandler */
		virtual ~BufferHandler() {}

		/////////////
		// Setters //
		/////////////

		/**
		* @brief Enables or disables the automatic buffers creation in a static way
		*
		* By default, the buffers creation is enabled.
		*
		* @param creation : true to enable the buffers creation, false to disable it
		*/
		static void enableBuffersCreation(bool creation);

		/////////////
		// Getters //
		/////////////

		/**
		* @brief Tells whether the automatic buffers creation is enabled or not
		* @return true if the buffers creation is enabled, false if it is disabled
		*/
		static bool isBuffersCreationEnabled();

		///////////////
		// Interface //
		///////////////
		
		/**
		* @brief Creates the buffers for this buffer handler in the given group
		*
		* If the buffers for this type of buffer handler already exists within the Group, they are priorly destroyed.<br>
		* The type of buffers created depends on the state of the buffer handler at the time this method is called.<br>
		* <br>
		* This method has to be overridden in derived classes that use buffers
		*
		* @param group : the Group in which to create the buffers for this buffer handler
		*/
		virtual void createBuffers(const Group& group) {};

		/**
		* @brief Destroys the buffers for this buffer handler in the given group
		*
		* if the buffers dont exist, nothing happens.<br>
		* <br>
		* This method has to be overridden in derived classes that use buffers
		*
		* @param group : the Group in which to destroy the buffers for this buffer handler
		*/
		virtual void destroyBuffers(const Group& group) {};


	protected :

		// The constructor is private so that the class is not instanciable
		BufferHandler() {}

		/**
		* @brief prepares the buffers of the given Group for processing
		*
		* Internally, this methods perfoms the following operations :<pre><i>
		* if check buffers is false
		*	if buffers creation is enabled
		*		destroy buffers
		*		create buffers
		*		return true
		*	else return false
		* else return true
		* </i></pre>
		*
		* @param group : the group whose buffers must be prepared
		* @return true if the buffers are ready, false if not
		*/
		bool prepareBuffers(const Group& group);

		/**
		* @brief checks the buffers and prepare them
		*
		* This method has to be implemented in derived class that uses buffers.<br>
		* true must be returned if the buffers are found and initialized, false otherwise.
		*
		* @param group : the group in which to check the buffers
		* @return true if buffers are ready, false otherwise
		*/
		virtual bool checkBuffers(const Group& group);

	private :

		static bool bufferCreation;
	};


	inline bool BufferHandler::checkBuffers(const Group& group)
	{
		return true;
	}
}

#endif
