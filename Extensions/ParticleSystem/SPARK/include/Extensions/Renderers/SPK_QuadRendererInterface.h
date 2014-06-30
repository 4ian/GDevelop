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


#ifndef H_SPK_QUADRENDERERINTERFACE
#define H_SPK_QUADRENDERERINTERFACE

#include "Core/SPK_DEF.h"
#include "Core/SPK_Particle.h"

namespace SPK
{
	/**
	* @enum TexturingMode
	* @brief Constants defining the way to apply texture over the particles
	* @since 1.02.00
	*/
	enum TexturingMode
	{
		TEXTURE_NONE,		/**< Constant telling no texturing is used */
		TEXTURE_2D,			/**< Constant telling a 2D texture is used */
		TEXTURE_3D,			/**< Constant telling a 3D texture is used */
	};


	/**
	* @brief Base Interface for rendering particles with quads
	* @since 1.04.00
	*/
	class SPK_PREFIX QuadRendererInterface
	{
	public :

		//////////////////
		// Constructors //
		//////////////////

		/**
		* @brief Constructor of QuadRendererInterface
		* @param scaleX the scale of the width of the quad
		* @param scaleY the scale of the height of the quad
		*/
		QuadRendererInterface(float scaleX = 1.0f,float scaleY = 1.0f);

		////////////////
		// Destructor //
		////////////////

		/** @brief Destructor of QuadRendererInterface */
		virtual ~QuadRendererInterface() {}

		/////////////
		// Setters //
		/////////////

		/**
		* @brief Sets the texturing mode for this GLQuadRenderer
		*
		* The texturing mode defines whether or not to apply a texture
		* and if so which type of texture to apply (2D,3D or atlas).<br>
		* <br>
		* Note that the validity of the texturing mode depends on the rendering API below.<br>
		* The method returns true if the rendering mode can be set, false if it cannot
		*
		* @param mode : the texturing mode of this GLQuadRenderer
		* @return true if the rendering mode can be set, false if it cannot
		*/
		virtual bool setTexturingMode(TexturingMode mode);

		/**
		* @brief Sets the cut of the texture
		*
		* This is available only if SPK::PARAM_TEXTURE_INDEX is enabled and texturing mode is TEXTURE_2D.<br>
		* <br>
		* Particles can be rendered only with a part of the texture depending on their texture index value.<br>
		* The cut can only be constant.<br>
		* The user defines in how many parts the texture must be divided in X and Y.<br>
		* The first index is located at the top left cut, the it goes from left to right and from top to bottom.<br>
		* <br>
		* For instance a cut with nbX = 3 and nbY = 2 will be as followed :
		* <br><i>
		* -------------<br>
		* | 0 | 1 | 2 |<br>
		* -------------<br>
		* | 3 | 4 | 5 |<br>
		* -------------</i><br>
		* <br>
		* By default nbX and nbY are equal to 1.<br>
		*
		* @param nbX : the number of cuts in the X axis
		* @param nbY : the number of cuts in the Y axis
		*/
		void setAtlasDimensions(size_t nbX,size_t nbY);

		/**
		* @brief Sets the size ratio of this GLQuadRenderer
		*
		* These values defines how quads are scaled.
		* The height and width of a quad in the universe is defined as followed :
		* <ul>
		* <li><i>width = size * ratioX</i>
		* <li><i>height = size * ratioY</i>
		* </ul>
		*
		* @param scaleX : the scale of the width of the quad
		* @param scaleY : the scale of the height of the quad
		*/
		void setScale(float scaleX,float scaleY);

		/////////////
		// Getters //
		/////////////

		/**
		* @brief Gets the texturing mode of this GLQuadRenderer
		* @return the texturing mode of this GLQuadRenderer
		*/
		TexturingMode getTexturingMode() const;

		/**
		* @brief Gets the atlas dimension on the X axis
		*
		* See setAtlasDimensions(size_t,size_t) for more information
		*
		* @return the atlas dimension on the X axis
		*/
		size_t getAtlasDimensionX() const;

		/**
		* @brief Gets the atlas dimension on the Y axis
		*
		* See setAtlasDimensions(size_t,size_t) for more information
		*
		* @return the atlas dimension on the Y axis
		*/
		size_t getAtlasDimensionY() const;

		/**
		* @brief Gets the scale of the width of this GLQuadRenderer
		* @return the scale of the width of this GLQuadRenderer
		*/
		float getScaleX() const;

		/**
		* @brief Gets the scale of the height of this GLQuadRenderer
		* @return the scale of the height of this GLQuadRenderer
		*/
		float getScaleY() const;

	protected :

		TexturingMode texturingMode;

		float scaleX;
		float scaleY;

		// texture atlas info
		size_t textureAtlasNbX;
		size_t textureAtlasNbY;
		float textureAtlasW;
		float textureAtlasH;

		void computeAtlasCoordinates(const Particle& particle) const;

		float textureAtlasU0() const;
		float textureAtlasU1() const;
		float textureAtlasV0() const;
		float textureAtlasV1() const;

	private :

		// this is where textureAtlas are stored after computation
		mutable float atlasU0;
		mutable float atlasU1;
		mutable float atlasV0;
		mutable float atlasV1;
	};


	inline bool QuadRendererInterface::setTexturingMode(TexturingMode mode)
	{
		texturingMode = mode;
		return true;
	}

	inline void QuadRendererInterface::setScale(float scaleX,float scaleY)
	{
		this->scaleX = scaleX;
		this->scaleY = scaleY;
	}

	inline TexturingMode QuadRendererInterface::getTexturingMode() const
	{
		return texturingMode;
	}

	inline size_t QuadRendererInterface::getAtlasDimensionX() const
	{
		return textureAtlasNbX;
	}

	inline size_t QuadRendererInterface::getAtlasDimensionY() const
	{
		return textureAtlasNbY;
	}

	inline float QuadRendererInterface::getScaleX() const
	{
		return scaleX;
	}

	inline float QuadRendererInterface::getScaleY() const
	{
		return scaleY;
	}

	inline float QuadRendererInterface::textureAtlasU0() const
	{
		return atlasU0;
	}

	inline float QuadRendererInterface::textureAtlasU1() const
	{
		return atlasU1;
	}

	inline float QuadRendererInterface::textureAtlasV0() const
	{
		return atlasV0;
	}

	inline float QuadRendererInterface::textureAtlasV1() const
	{
		return atlasV1;
	}

	inline void QuadRendererInterface::computeAtlasCoordinates(const Particle& particle) const
	{
		int textureIndex = static_cast<int>(particle.getParamCurrentValue(PARAM_TEXTURE_INDEX));
		atlasU0 = atlasU1 = static_cast<float>(textureIndex % textureAtlasNbX) / textureAtlasNbX;
		atlasV0 = atlasV1 = static_cast<float>(textureIndex / textureAtlasNbX) / textureAtlasNbY;
		atlasU1 += textureAtlasW;
		atlasV1 += textureAtlasH;
	}
}

#endif
