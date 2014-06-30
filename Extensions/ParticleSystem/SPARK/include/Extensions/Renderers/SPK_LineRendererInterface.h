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


#ifndef H_SPK_LINERENDERERINTERFACE
#define H_SPK_LINERENDERERINTERFACE

#include "Core/SPK_DEF.h"

namespace SPK
{
	/**
	* @brief Base Interface for rendering particles with lines
	* @since 1.04.00
	*/
	class LineRendererInterface
	{
	public :

		/////////////////
		// Constructor //
		/////////////////

		/**
		* @brief Constructor of LineRendererInterface
		* @param length : the length multiplier of this LineRendererInterface
		* @param width : the width of this GLLineRenderer
		*/
		LineRendererInterface(float length = 1.0f,float width = 1.0f);

		////////////////
		// Destructor //
		////////////////

		/** @brief Destructor of LineRendererInterface */
		virtual ~LineRendererInterface() {}

		/////////////
		// Setters //
		/////////////

		/**
		* @brief Sets the length multiplier of this LineRendererInterface
		*
		* The length multiplier is the value which will be multiplied by the Particle velocity to get the line length in the universe.<br>
		* A positive length means the line will be drawn in advance to the Particle, as opposed to a negative length.
		*
		* @param length : the length multiplier of this GLLineRenderer
		*/
		void setLength(float length);

		/**
		* @brief Sets the width of this LineRendererInterface
		* @param width : the width of this LineRendererInterface
		*/
		virtual void setWidth(float width);

		/////////////
		// Getters //
		/////////////

		/**
		* @brief Gets the length multiplier of this LineRendererInterface
		* @return the length multiplier of this LineRendererInterface
		*/
		float getLength() const;

		/**
		* @brief Gets the width of this LineRendererInterface
		* @return the width of this LineRendererInterface
		*/
		float getWidth() const;

	protected :

		float length;
		float width;
	};


	inline LineRendererInterface::LineRendererInterface(float length,float width) :
		length(length),
		width(width)
	{}

	inline void LineRendererInterface::setLength(float length)
	{
		this->length = length;
	}

	inline void LineRendererInterface::setWidth(float width)
	{
		this->width = width;
	}

	inline float LineRendererInterface::getLength() const
	{
		return length;
	}

	inline float LineRendererInterface::getWidth() const
	{
		return width;
	}
}

#endif
