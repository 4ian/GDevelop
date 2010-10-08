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


#ifndef H_SPK_SFMLLINERENDERER
#define H_SPK_SFMLLINERENDERER

#include "RenderingAPIs/SFML/SPK_SFMLRenderer.h"
#include "Extensions/Renderers/SPK_LineRendererInterface.h"

namespace SPK
{
namespace SFML
{
	/**
	* @class SFMLLineRenderer
	* @brief A Renderer drawing particles as lines for the SFML 2D rendering engine
	*
	* the length of the lines is function of the Particle velocity and is defined in the universe space
	* while the width is fixed and defines in the screen space (in pixels).<br>
	* The width can be zoomed with the View using resizeMode (either SPK_SFML::RESIZE_ZOOM_X or SPK_SFML::RESIZE_ZOOM_Y).
	* However the maximum width for a line is constraints by the hardware.
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
	class SPK_SFML_PREFIX SFMLLineRenderer : public SFMLRenderer,public LineRendererInterface
	{
		SPK_IMPLEMENT_REGISTERABLE(SFMLLineRenderer)

	public :

		//////////////////
		// Constructors //
		//////////////////

		/**
		* @brief Constructor of SFMLLineRenderer
		* @param length : the length multiplier of this SFMLLineRenderer
		* @param width : the width of this SFMLLineRenderer in pixels
		* @param mode : the resize mode of this SFMLLineRenderer
		*/
		SFMLLineRenderer(float length = 1.0f,float width = 1.0f,ResizeMode mode = RESIZE_NONE);

		/**
		* @brief Creates and registers a new SFMLLineRenderer
		* @param length : the length multiplier of this SFMLLineRenderer
		* @param width : the width of this SFMLLineRenderer in pixels
		* @param mode : the resize mode of this SFMLLineRenderer
		* @return A new registered SFMLLineRenderer
		* @since 1.04.00
		*/
		static inline SFMLLineRenderer* create(float length = 1.0f,float width = 1.0f,ResizeMode mode = RESIZE_NONE);

		/////////////
		// Setters //
		/////////////

		/**
		* @brief Sets the resize mode of this SFMLLineRenderer
		* @param mode : the resize mode of this SFMLLineRenderer
		*/
		inline void setResizeMode(ResizeMode mode);

		/////////////
		// Getters //
		/////////////

		/**
		* @brief Gets the resize mode of this SFMLLineRenderer
		* @return the resize mode of this SFMLLineRenderer
		*/
		inline ResizeMode getResizeMode() const;

		///////////////
		// Interface //
		///////////////

		virtual void createBuffers(const Group& group);
		virtual void destroyBuffers(const Group& group);

	protected : 

		virtual bool checkBuffers(const Group& group);

	private :

		ResizeMode resizeMode;

		// vertex buffers and iterators
		static float* gpuBuffer;
		static float* gpuIterator;

		// buffers names
		static const std::string GPU_BUFFER_NAME;

		virtual void innerRender(const Group& group);
	};


	inline SFMLLineRenderer* SFMLLineRenderer::create(float length,float width,ResizeMode mode)
	{
		SFMLLineRenderer* obj = new SFMLLineRenderer(length,width,mode = RESIZE_NONE);
		registerObject(obj);
		return obj;
	}
	
	inline void SFMLLineRenderer::setResizeMode(ResizeMode mode)
	{
		resizeMode = mode;
	}

	inline ResizeMode SFMLLineRenderer::getResizeMode() const
	{
		return resizeMode;
	}
}}

#endif
