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


#ifndef H_SPK_GLPOINTRENDERER
#define H_SPK_GLPOINTRENDERER

#include "RenderingAPIs/OpenGL/SPK_GLRenderer.h"
#include "RenderingAPIs/OpenGL/SPK_GLExtHandler.h"
#include "Extensions/Renderers/SPK_PointRendererInterface.h"

namespace SPK
{
namespace GL
{
	/**
	* @class GLPointRenderer
	* @brief A Renderer drawing drawing particles as openGL points
	*
	* OpenGL points can be configured to render them in 3 different ways :
	* <ul>
	* <li>SPK::POINT_SQUARE : standard openGL points</li>
	* <li>SPK::POINT_CIRCLE : antialiased openGL points</li>
	* <li>SPK::POINT_SPRITE : OpenGL point sprites (must be supported by the hardware)</li>
	* </ul>
	* Moreover, points size can either be defined in screen space (in pixels) or in the universe space (must be supported by the hardware).
	* The advantage of the universe space is that points size on the screen will be dependant to their distance to the camera, whereas in screen space
	* all points will have the same size on the screen no matter their distance to the camera.
	* <br>
	* Below are the parameters of Particle that are used in this Renderer (others have no effects) :
	* <ul>
	* <li>SPK::PARAM_RED</li>
	* <li>SPK::PARAM_GREEN</li>
	* <li>SPK::PARAM_BLUE</li>
	* <li>SPK::PARAM_ALPHA (only if blending is enabled)</li>
	* </ul>
	*/
	class SPK_GL_PREFIX GLPointRenderer :	public GLRenderer,
											public PointRendererInterface,
											public GLExtHandler
	{
		
		SPK_IMPLEMENT_REGISTERABLE(GLPointRenderer)

	public :

		//////////////////
		// Constructors //
		//////////////////

		/** 
		* @brief Constructor of GLPointRenderer
		* @param size : the size of the points
		*/
		GLPointRenderer(float size = 1.0f);

		/**
		* @brief Creates and registers a new GLPointRenderer
		* @param size : the size of the points
		* @return A new registered GLPointRenderer
		* @since 1.04.00
		*/
		static GLPointRenderer* create(float size = 1.0f);

		/////////////
		// Setters //
		/////////////

		virtual bool setType(PointType type);

		/**
		* @brief Sets the texture of this GLPointRenderer
		*
		* Note that the texture is only used if point sprites are used (type is set to SPK::POINT_SPRITE)
		*
		* @param textureIndex : the index of the openGL texture of this GLPointRenderer
		*/
		void setTexture(GLuint textureIndex);

		/**
		* @brief Sets the way size of points is computed in this GLPointRenderer
		*
		* if universe size is used (true), the extension is checked.<br>
		* if universe size is not supported by the hardware, false is returned and nothing happens.<br>
		* <br>
		* If world size is enabled, the static method setPixelPetUnit(float,int) must be called to set the conversion between pixels and world units.
		*
		* @param worldSizeEnabled : true to enable universe size, false to use screen size
		* @return true the type of size can be set, false otherwise
		*/
		bool enableWorldSize(bool worldSizeEnabled);

		/////////////
		// Getters //
		/////////////

		/**
		* @brief Gets the texture of this GLPointRenderer
		* @return the texture of this GLPointRenderer
		*/
		GLuint getTexture() const;

		/**
		* @brief Tells whether world size is enabled or not in this GLPointRenderer
		* @return true if world size is enabled, false if not
		*/
		bool isWorldSizeEnabled() const;

		///////////////
		// Interface //
		///////////////

		virtual void render(const Group& group);

	private :

		GLuint textureIndex;
		bool worldSize;
	};


	inline GLPointRenderer* GLPointRenderer::create(float size)
	{
		GLPointRenderer* obj = new GLPointRenderer(size);
		registerObject(obj);
		return obj;
	}
		
	inline void GLPointRenderer::setTexture(GLuint textureIndex)
	{
		this->textureIndex = textureIndex;
	}

	inline GLuint GLPointRenderer::getTexture() const
	{
		return textureIndex;
	}

	inline bool GLPointRenderer::isWorldSizeEnabled() const
	{
		return worldSize;
	}
}}

#endif
