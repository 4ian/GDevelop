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


#ifndef H_SPK_SFMLDRAWABLERENDERER
#define H_SPK_SFMLDRAWABLERENDERER

#include "RenderingAPIs/SFML/SPK_SFMLRenderer.h"

namespace SPK
{
namespace SFML
{
	/**
	* @class SFMLDrawableRenderer
	* @brief A Renderer drawing particles as SFML Drawables for the SFML 2D rendering engine
	*
	* This SFMLRenderer allows to render particles with any of the SFML Drawables available in the library :<ul>
	* <li>sf::Sprite</li>
	* <li>sf::Shape</li>
	* <li>sf::PostFX</li>
	* <li>sf::String</li>
	* <li>SPK::SFML::SFMLSystem</li>
	* <li>Any other SFML Drawable implemented by users or to come in future release</li>
	* </ul>
	* <br>
	* Note that when possible other SFML renderers should be prefered as they are more optimized.<br>
	* For instance, SFMLQuadRenderer should be preferred to SFMLDrawableRenderer with Sprites.<br>
	* <br>
	* The base Drawable should have its center centered on the Drawable (it is the top left corner by default)
	* with a call to sf::Drawable::SetCenter() to have scale, translation and rotation well defined.<br>
	* However the center can be set wherever on the Drawable to get desirable effects.<br>
	* <br>
	* Note that the parameters of the base Drawable are modified during rendering.<br>
	* In that way, the initial position, scale, color, angle and blending mode of the Drawable
	* is not used but overriden by particle parameters.<br>
	* <br>
	* Below are the parameters of Particle that are used in this Renderer (others have no effects) :
	* <ul>
	* <li>SPK::PARAM_SIZE</li>
	* <li>SPK::PARAM_RED</li>
	* <li>SPK::PARAM_GREEN</li>
	* <li>SPK::PARAM_BLUE</li>
	* <li>SPK::PARAM_ALPHA (only if blend mode is not sf::Blend::NONE)</li>
	* <li>SPK::PARAM_ANGLE</li>
	* </ul>
	* @since 1.01.00
	*/
	class SPK_SFML_PREFIX SFMLDrawableRenderer : public SFMLRenderer
	{		
		SPK_IMPLEMENT_REGISTERABLE(SFMLDrawableRenderer)

	public :

		/////////////////
		// Constructor //
		/////////////////

		/**
		* @brief Constructor of SFMLDrawableRenderer
		* @param drawable : the base Drawable of this SFMLDrawableRenderer
		* @param scaleX : the scale in X axis of this SFMLDrawableRenderer
		* @param scaleY : the scale in X axis of this SFMLDrawableRenderer
		*/
		SFMLDrawableRenderer(sf::Drawable* drawable = NULL,float scaleX = 1.0f,float scaleY = 1.0f);

		/**
		* @brief Creates and registers a new SFMLDrawableRenderer
		* @param drawable : the base Drawable of this SFMLDrawableRenderer
		* @param scaleX : the scale in X axis of this SFMLDrawableRenderer
		* @param scaleY : the scale in X axis of this SFMLDrawableRenderer
		* @return A new registered SFMLDrawableRenderer
		* @since 1.04.00
		*/
		static inline SFMLDrawableRenderer* create(sf::Drawable* drawable = NULL,float scaleX = 1.0f,float scaleY = 1.0f);

		/////////////
		// Setters //
		/////////////

		/**
		* @brief Sets the base Drawable of this SFMLDrawableRenderer
		* @param drawable : the base Drawable of this SFMLDrawableRenderer
		*/
		inline void setDrawable(sf::Drawable* drawable);

		/**
		* @brief Sets the scale of this SFMLDrawableRenderer
		* @param scaleX : the scale in X axis of this SFMLDrawableRenderer
		* @param scaleY : the scale in X axis of this SFMLDrawableRenderer
		*/
		inline void setScale(float scaleX,float scaleY);

		/////////////
		// Getters //
		/////////////

		/**
		* @brief Gets the base Drawable of this SFMLDrawableRenderer
		* @return the base Drawable of this SFMLDrawableRenderer or NULL if no Drawable is set
		*/
		inline sf::Drawable* getDrawable() const;

		/**
		* @brief Gets the scale in X axis of this SFMLDrawableRenderer
		* @return the scale in X axis of this SFMLDrawableRenderer
		*/
		inline float getScaleX() const;

		/**
		* @brief Gets the scale in Y axis of this SFMLDrawableRenderer
		* @return the scale in Y axis of this SFMLDrawableRenderer
		*/
		inline float getScaleY() const;

	private :

		static const float RAD2DEG;	// ratio to convert radians to degrees

		sf::Drawable* drawable;
		float scaleX;
		float scaleY;

		void innerRender(const Group& group);
	};


	inline SFMLDrawableRenderer* SFMLDrawableRenderer::create(sf::Drawable* drawable,float scaleX,float scaleY)
	{
		SFMLDrawableRenderer* obj = new SFMLDrawableRenderer(drawable,scaleX,scaleY);
		registerObject(obj);
		return obj;
	}
	
	inline void SFMLDrawableRenderer::setDrawable(sf::Drawable* drawable)
	{
		this->drawable = drawable;
	}

	inline void SFMLDrawableRenderer::setScale(float scaleX,float scaleY)
	{
		this->scaleX = scaleX;
		this->scaleY = scaleY;
	}

	inline sf::Drawable* SFMLDrawableRenderer::getDrawable() const
	{
		return drawable;
	}

	inline float SFMLDrawableRenderer::getScaleX() const
	{
		return scaleX;
	}

	inline float SFMLDrawableRenderer::getScaleY() const
	{
		return scaleY;
	}
}}

#endif
