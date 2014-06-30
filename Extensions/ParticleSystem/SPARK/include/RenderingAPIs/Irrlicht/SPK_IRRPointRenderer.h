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

#ifndef SPK_IRRPOINTRENDERER
#define SPK_IRRPOINTRENDERER

#include "RenderingAPIs/Irrlicht/SPK_IRRRenderer.h"
#include "Extensions/Renderers/SPK_PointRendererInterface.h"

namespace SPK
{
namespace IRR
{
	/**
	* @class IRRPointRenderer
	* @brief A Renderer drawing particles as points with Irrlicht
	*
	* Rendering can be done in 2 ways :
	* <ul>
	* <li>SPK::POINT_SQUARE : standard points</li>
	* <li>SPK::POINT_SPRITE : point sprites (must be supported by the hardware)</li>
	* </ul>
	* Note that SPK::POINT_CIRCLE cannot be set with this renderer.<br>
	* <br>
	* Regarding the size of the rendered point, they are dependant of the Irrlicht settings.<br>
	* Basically size of the points is neither in pixels nor in the universe unit.<br>
	* Moreover, points are scaling with the distance but are rapidly clamped.<br>
	* So Irrlicht does not handle point size very well at the moment, maybe it will do better in the future.<br>
	* In that case, this renderer will become very useful.
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
	class SPK_IRR_PREFIX IRRPointRenderer : public IRRRenderer,public PointRendererInterface
	{
		SPK_IMPLEMENT_REGISTERABLE(IRRPointRenderer)

	public :

		/////////////////
		// Constructor //
		/////////////////

		/**
		* @brief Constructor of IRRPointRenderer
		* @param d : the Irrlicht device
		* @param size : the size of the points
		*/
		IRRPointRenderer(irr::IrrlichtDevice* d,float size = 1.0f);

		/**
		* @brief Creates and registers a new IRRPointRenderer
		* @param d : the Irrlicht device
		* @param size : the size of the points
		* @return A new registered IRRPointRenderer
		*/
		static IRRPointRenderer* create(irr::IrrlichtDevice* d,float size = 1.0f);

		/////////////
		// Setters //
		/////////////

		/**
		* @brief Sets the texture to map on particles
		* 
		* Note that this only works with points being rendered as SPK::POINT_SPRITE
		*
		* @param texture : the texture to set
		*/
		void setTexture(irr::video::ITexture* texture);

		// Reimplemented from PointRendererInterface
		virtual bool setType(PointType type);
		virtual void setSize(float size);

		/////////////
		// Getters //
		/////////////

		/**
		* @brief Gets the texture of this renderer
		* @return the texture of this renderer
		*/
		irr::video::ITexture* getTexture() const;

		/**
		* @brief Gets the material texture layer
		* @return the material texture layer
		*/
		irr::video::SMaterialLayer& getMaterialLayer();

		/**
		* @brief Gets the material texture layer in a constant way
		* @return the material texture layer
		*/
		const irr::video::SMaterialLayer& getMaterialLayer() const;

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

		virtual const std::string& getBufferName() const;
		virtual int getBufferPurpose() const;
	};


	inline IRRPointRenderer* IRRPointRenderer::create(irr::IrrlichtDevice* d,float size)
	{
		IRRPointRenderer* obj = new IRRPointRenderer(d,size);
		registerObject(obj);
		return obj;
	}
	
	inline void IRRPointRenderer::setTexture(irr::video::ITexture* texture)
	{
		material.TextureLayer[0].Texture = texture;
	}

	inline void IRRPointRenderer::setSize(float size)
	{
		material.Thickness = this->size = size;
	}

	inline irr::video::ITexture* IRRPointRenderer::getTexture() const
	{
		return material.TextureLayer[0].Texture;
	}

	inline irr::video::SMaterialLayer& IRRPointRenderer::getMaterialLayer()
	{
		return material.TextureLayer[0];
	}
		
	inline const irr::video::SMaterialLayer& IRRPointRenderer::getMaterialLayer() const
	{
		return material.TextureLayer[0];
	}

	inline const std::string& IRRPointRenderer::getBufferName() const
	{
		return IRR_BUFFER_NAME;
	}

	inline int IRRPointRenderer::getBufferPurpose() const
	{
		return 0;
	}
}}

#endif
