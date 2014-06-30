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


#ifndef H_SPK_POINTRENDERERINTERFACE
#define H_SPK_POINTRENDERERINTERFACE

#include "Core/SPK_DEF.h"

namespace SPK
{
	/**
	* @enum PointType
	* @brief Constants defining the type of points to render
	*/
	enum PointType
	{
		POINT_SQUARE,	/**< Points are renderered as squares */
		POINT_CIRCLE,	/**< Points are renderered as circles */
		POINT_SPRITE,	/**< Points are renderered as point sprites (textured points) */
	};

	/**
	* @brief Base Interface for rendering particles with points
	* @since 1.04.00
	*/
	class PointRendererInterface
	{
	public :

		/////////////////
		// Constructor //
		/////////////////

		/**
		* @brief Constructor of PointRendererInterface
		* @param type : the initial type of this PointRendererInterface (must be supported by default by the platform)
		* @param size : the width of this PointRendererInterface
		*/
		PointRendererInterface(PointType type = POINT_SQUARE,float size = 1.0f);

		////////////////
		// Destructor //
		////////////////

		/** @brief Destructor of PointRendererInterface */
		virtual ~PointRendererInterface() {}

		/////////////
		// Setters //
		/////////////

		/**
		* @brief Sets the type of points to use in this PointRendererInterface
		*
		* If the type is not supported by the platform, false is returned and the type per default is set.
		*
		* @param type : the type of points to use in this PointRendererInterface
		* @return true if the type can be set, false otherwise
		*/
		virtual bool setType(PointType type);

		/**
		* @brief Sets the size of the points in this PointRendererInterface
		* @param size : the size of the points in this PointRendererInterface
		*/
		virtual void setSize(float size);

		/////////////
		// Getters //
		/////////////

		/**
		* @brief Gets the type of points in this PointRendererInterface
		* @return the type of points in this PointRendererInterface
		*/
		PointType getType() const;

		/**
		* @brief Gets the size of points in this PointRendererInterface
		* @return the size of points in this PointRendererInterface
		*/
		float getSize() const;

	protected :

		PointType type;
		float size;
	};


	inline PointRendererInterface::PointRendererInterface(PointType type,float size) :
		type(type),
		size(size)
	{}

	inline bool PointRendererInterface::setType(PointType type)
	{
		this->type = type;
		return true;
	}

	inline void PointRendererInterface::setSize(float size)
	{
		this->size = size;
	}

	inline PointType PointRendererInterface::getType() const
	{
		return type;
	}

	inline float PointRendererInterface::getSize() const
	{
		return size;
	}
}

#endif
