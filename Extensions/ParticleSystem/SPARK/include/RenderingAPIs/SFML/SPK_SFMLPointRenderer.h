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


#ifndef H_SPK_SFMLPOINTRENDERER
#define H_SPK_SFMLPOINTRENDERER

#include "RenderingAPIs/SFML/SPK_SFMLRenderer.h"
#include "RenderingAPIs/OpenGL/SPK_GLExtHandler.h"
#include "Extensions/Renderers/SPK_PointRendererInterface.h"

namespace SPK
{
namespace SFML
{
	/**
	* @class SFMLPointRenderer
	* @brief A Renderer drawing particles as points for the SFML 2D rendering engine
	*
	* points can be configured to render them in 3 different ways :
	* <ul>
	* <li>SPK::POINT_SQUARE : colored square</li>
	* <li>SPK::POINT_CIRCLE : colored circle</li>
	* <li>SPK::POINT_SPRITE : image attached at the point position</li>
	* </ul>
	* Points size can be updated in function of the zoom of the SFML view using ResizeMode
	* (either SPK_SFML::RESIZE_ZOOM_X or SPK_SFML::RESIZE_ZOOM_Y)<br>
	* The zoom is constraints by the minimum and maximum dimensions of the point size (being generally 1.0f and 64.0f).<br>
	* However on hardware that supports the openGL extension point parameter counteracts these limitations. The extension is
	* automatically loaded if possible.<br>
	* User can check whether the extension is available by calling SPK::GL::GLExtHandler::loadGLExtPointParameter()
	*
	* <br>
	* Below are the parameters of Particle that are used in this Renderer (others have no effects) :
	* <ul>
	* <li>SPK::PARAM_RED</li>
	* <li>SPK::PARAM_GREEN</li>
	* <li>SPK::PARAM_BLUE</li>
	* <li>SPK::PARAM_ALPHA (only if blending is enabled)</li>
	* </ul>
	*
	* @since 1.01.00
	*/
	class SPK_SFML_PREFIX SFMLPointRenderer :	public SFMLRenderer,
												public PointRendererInterface,
												public GL::GLExtHandler
	{
		SPK_IMPLEMENT_REGISTERABLE(SFMLPointRenderer)

	public :

		//////////////////
		// Constructors //
		//////////////////

		/**
		* @brief Constructor of SFMLPointRenderer
		* @param size : the size of this SFMLPointRenderer
		* @param mode : the resize mode of this SFMLPointRenderer
		*/
		SFMLPointRenderer(float size = 1.0f,ResizeMode mode = RESIZE_NONE);

		/**
		* @brief Creates and registers a new SFMLPointRenderer
		* @param size : the size of this SFMLPointRenderer
		* @param mode : the resize mode of this SFMLPointRenderer
		* @return A new registered SFMLPointRenderer
		* @since 1.04.00
		*/
		static SFMLPointRenderer* create(float size = 1.0f,ResizeMode mode = RESIZE_NONE);

		/////////////
		// Setters //
		/////////////

		bool setType(PointType type);

		/**
		* @brief Sets the image of this SFMLPointRenderer
		*
		* Note that the image is only used if point sprites are used (type is set to SPK::POINT_SPRITE)
		*
		* @param image : the index of the SFML Image of this SFMLPointRenderer
		*/
		void setImage(sf::Image* image);

		/**
		* @brief Sets the resize mode of this SFMLPointRenderer
		* @param mode : the resize mode of this SFMLPointRenderer
		*/
		void setResizeMode(ResizeMode mode);

		/////////////
		// Getters //
		/////////////

		/**
		* @brief Gets the texture of this SFMLPointRenderer
		* @return the texture of this SFMLPointRenderer
		*/
		sf::Image* getImage() const;

		/**
		* @brief Gets the resize mode of this SFMLPointRenderer
		* @return the resize mode of this SFMLPointRenderer
		*/
		ResizeMode getResizeMode() const;

		///////////////
		// Interface //
		///////////////

		virtual void createBuffers(const Group& group);
		virtual void destroyBuffers(const Group& group);

	protected :

		virtual bool checkBuffers(const Group& group);

	private :

		sf::Image* image;
		ResizeMode resizeMode;

		// vertex buffers and iterators
		static float* gpuBuffer;
		static float* gpuIterator;

		// buffers names
		static const std::string GPU_BUFFER_NAME;

		void innerRender(const Group& group);
	};


	inline SFMLPointRenderer* SFMLPointRenderer::create(float size,ResizeMode mode)
	{
		SFMLPointRenderer* obj = new SFMLPointRenderer(size,mode);
		registerObject(obj);
		return obj;
	}
	
	inline void SFMLPointRenderer::setImage(sf::Image* image)
	{
		this->image = image;
	}

	inline void SFMLPointRenderer::setResizeMode(ResizeMode mode)
	{
		resizeMode = mode;
	}

	inline sf::Image* SFMLPointRenderer::getImage() const
	{
		return image;
	}

	inline ResizeMode SFMLPointRenderer::getResizeMode() const
	{
		return resizeMode;
	}
}}

#endif
