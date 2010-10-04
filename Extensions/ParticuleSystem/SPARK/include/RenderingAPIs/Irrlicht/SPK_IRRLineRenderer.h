//////////////////////////////////////////////////////////////////////////////////
// SPARK Irrlicht Rendering library												//
// Copyright (C) 2009															//
// Thibault Lescoat -  info-tibo <at> orange <dot> fr							//
// Julien Fryer - julienfryer@gmail.com											//
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

#ifndef SPK_IRRLINERENDERER
#define SPK_IRRLINERENDERER

#include "RenderingAPIs/Irrlicht/SPK_IRRRenderer.h"
#include "Extensions/Renderers/SPK_LineRendererInterface.h"

namespace SPK
{
namespace IRR
{
	/**
	* @class IRRLineRenderer
	* @brief A Renderer drawing particles as lines with Irrlicht
	*
	* The length of the lines is function of the Particle velocity and is defined in the universe space
	* while the width is fixed and defines in the screen space (in pixels).<br>
	* Note that the width only works when using Irrlicht with OpenGL. With Direct3D, the parameter is ignored and 1 is used instead.
	* <br>
	* Below are the parameters of Particle that are used in this Renderer (others have no effects) :
	* <ul>
	* <li>SPK::PARAM_RED</li>
	* <li>SPK::PARAM_GREEN</li>
	* <li>SPK::PARAM_BLUE</li>
	* <li>SPK::PARAM_ALPHA (only if blending is enabled)</li>
	* </ul>
	* @since 1.04.00
	*/
	class SPK_IRR_PREFIX IRRLineRenderer : public IRRRenderer,public LineRendererInterface
	{
		SPK_IMPLEMENT_REGISTERABLE(IRRLineRenderer)

	public :

		/////////////////
		// Constructor //
		/////////////////

		/**
		* @brief Constructor of IRRLineRenderer
		* @param d : the Irrlicht device
		* @param length : the length multiplier of this IRRLineRenderer
		* @param width : the width of this IRRLineRenderer in pixels
		*/
		IRRLineRenderer(irr::IrrlichtDevice* d,float length = 1.0f,float width = 1.0f);

		/**
		* @brief Creates and registers a new IRRLineRenderer
		* @param d : the Irrlicht device
		* @param length : the length multiplier of this IRRLineRenderer
		* @param width : the width of this IRRLineRenderer in pixels
		* @return A new registered IRRLineRenderer
		*/
		static inline IRRLineRenderer* create(irr::IrrlichtDevice* d,float length = 1.0f,float width = 1.0f);

		/////////////
		// Setters //
		/////////////

		virtual inline void setWidth(float width);

		///////////////
		// Interface //
		///////////////

		virtual void render(const Group& group);

		void createBuffers(const Group& group);

	private :

		static const size_t NB_INDICES_PER_QUAD = 2;
		static const size_t NB_VERTICES_PER_QUAD = 2;

		// buffer name
		static const std::string IRR_BUFFER_NAME;

		inline virtual const std::string& getBufferName() const;
	};


	inline IRRLineRenderer* IRRLineRenderer::create(irr::IrrlichtDevice* d,float length,float width)
	{
		IRRLineRenderer* obj = new IRRLineRenderer(d,length,width);
		registerObject(obj);
		return obj;
	}

	inline void IRRLineRenderer::setWidth(float width)
	{
		material.Thickness = this->width = width;
	}

	inline const std::string& IRRLineRenderer::getBufferName() const
	{
		return IRR_BUFFER_NAME;
	}
}}

#endif
