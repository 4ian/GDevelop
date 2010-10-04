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

#ifndef SPK_IRRRENDERER
#define SPK_IRRRENDERER

#include "RenderingAPIs/Irrlicht/SPK_IRR_DEF.h"
#include "RenderingAPIs/Irrlicht/SPK_IRRBuffer.h"
#include "Core/SPK_Renderer.h"
#include "Core/SPK_Group.h"


namespace SPK
{
namespace IRR
{
	/**
	* @brief The base renderer for all Irrlicht renderers
	* 
	* This class presents a convenient interface to set some parameters common to all Irrlicht renderers (blending mode...).<br>
	* <br>
	* Note that rendering hints work with Irrlicht renderers except the SPK::ALPHA_TEST
	* which is always enabled with a threshold of 0. (meaning alpha values of 0 are never rendered).
	*
	* @since 1.04.00
	*/
	class SPK_IRR_PREFIX IRRRenderer : public Renderer
	{
	public :

		/////////////////
		// Constructor //
		/////////////////

		/**
		* @brief Constructor of IRRRenderer
		* @param d : the Irrlicht device
		*/
		IRRRenderer(irr::IrrlichtDevice* d);

		////////////////
		// Destructor //
		////////////////

		/** @brief Destructor of IRRRenderer */
		inline virtual ~IRRRenderer(){};

		/////////////
		// Setters //
		/////////////

		/**
		* @brief Sets the blending mode in a very accurate way
		*
		* This method allows to set any blending mode supported by Irrlicht.<br>
		* Note that a simpler helper method exist to set the most common blending modes :<br>
		* <i>setBlending(BlendingMode)</i>
		*
		* @param srcFunc : the blending source function
		* @param destFunc : the blending destination function
		* @param alphaSrc : the alpha source
		*/
		void setBlending(irr::video::E_BLEND_FACTOR srcFunc,irr::video::E_BLEND_FACTOR destFunc,unsigned int alphaSrc);
		virtual void setBlending(BlendingMode blendMode);

		virtual void enableRenderingHint(RenderingHint renderingHint,bool enable);
		virtual inline void setAlphaTestThreshold(float alphaThreshold);

		/////////////
		// Getters //
		/////////////

		/**
		* @brief Gets the Irrlicht device of this renderer
		* @return the device of this renderer
		*/
        inline irr::IrrlichtDevice* getDevice() const;

		/**
		* @brief Gets the source blending funtion of this renderer
		* @return the source blending funtion of this renderer
		*/
		inline irr::video::E_BLEND_FACTOR getBlendSrcFunc() const;

		/**
		* @brief Gets the destination blending funtion of this renderer
		* @return the destination blending funtion of this renderer
		*/
		inline irr::video::E_BLEND_FACTOR getBlendDestFunc() const;

		/**
		* @brief Gets the alpha source of this renderer
		* @return the alpha source of this renderer
		*/
		inline unsigned int getAlphaSource() const;

		/**
		* @brief Gets the material of this renderer
		*
		* Note that the renderer is constant and therefore cannot be modified directly
		*
		* @return the material of this renderer
		*/
		inline const irr::video::SMaterial& getMaterial() const;

		virtual bool isRenderingHintEnabled(RenderingHint renderingHint) const;

		///////////////
		// Interface //
		///////////////

		virtual inline void destroyBuffers(const Group& group);

	protected :

		irr::IrrlichtDevice* device;	// the device
		irr::video::SMaterial material;	// the material

		mutable IRRBuffer* currentBuffer;

		virtual inline bool checkBuffers(const Group& group);

	private :

		irr::video::E_BLEND_FACTOR blendSrcFunc;
		irr::video::E_BLEND_FACTOR blendDestFunc;
		unsigned int alphaSource;

		/**
		* @brief Gets the name of the IRRBuffer used by the renderer
		*
		* This method must be implemented in all children renderers
		*
		* @return the name of the IRRBuffer
		*/
		virtual const std::string& getBufferName() const = 0;

		inline void updateMaterialBlendingMode();
	};

	
	inline void IRRRenderer::setAlphaTestThreshold(float alphaThreshold)
	{
		Renderer::setAlphaTestThreshold(0.0f); // the alpha threshold of the irrlicht material is always 0
	}
	
	inline irr::IrrlichtDevice* IRRRenderer::getDevice() const
	{
		return device;
	}

	inline irr::video::E_BLEND_FACTOR IRRRenderer::getBlendSrcFunc() const
	{
		return blendSrcFunc;
	}

	inline irr::video::E_BLEND_FACTOR IRRRenderer::getBlendDestFunc() const
	{
		return blendDestFunc;
	}

	inline unsigned int IRRRenderer::getAlphaSource() const
	{
		return alphaSource;
	}

	inline const irr::video::SMaterial& IRRRenderer::getMaterial() const
	{
		return material;
	}

	inline void IRRRenderer::destroyBuffers(const Group& group)
    {
		group.destroyBuffer(getBufferName());
    }

	inline bool IRRRenderer::checkBuffers(const Group& group)
	{
		currentBuffer = dynamic_cast<IRRBuffer*>(group.getBuffer(getBufferName()));
		return currentBuffer != NULL;
	}

	inline void IRRRenderer::updateMaterialBlendingMode()
	{
		material.MaterialTypeParam = irr::video::pack_texureBlendFunc(
			blendSrcFunc,
			blendDestFunc,
			irr::video::EMFN_MODULATE_1X,
			alphaSource);
	}
}}

#endif
