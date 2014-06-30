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


#ifndef H_SPK_RENDERER
#define H_SPK_RENDERER

#include "Core/SPK_DEF.h"
#include "Core/SPK_Registerable.h"
#include "Core/SPK_BufferHandler.h"


namespace SPK
{
	class Group;
	class Particle;

	/**
	* @enum BlendingMode
	* @brief Constants defining the available blending modes
	* @since 1.04.00
	*/
	enum BlendingMode
	{
		BLENDING_NONE,			/**< No blending is applied. The particles will appeared as opaque */
		BLENDING_ADD,			/**< The additive blending is useful to render particles that supposed to emit light (fire, magic spells...) */
		BLENDING_ALPHA,			/**< The alpha blending is useful to render transparent particles */
	};

	/**
	* @enum RenderingHint
	* @brief Constants defining the available rendering hints
	* @since 1.04.00
	*/
	enum RenderingHint
	{
		ALPHA_TEST = 1 << 0,	/**< The alpha test. Enabling it is useful when rendering fully opaque particles with fully transparent zones (a texture of ball for instance) */
		DEPTH_TEST = 1 << 1,	/**< The depth test. Disabling it is useful when rendering particles with additive blending without having to sort them. Note that disabling the depth test will disable the depth write as well. */
		DEPTH_WRITE = 1 << 2,	/**< The depth write. Disabling it is useful when rendering particles with additive blending without having to sort them. Particles are still culled with the Zbuffer (when behind a wall for instance) */
	};

	/**
	* @class Renderer
	* @brief An abstract class that renders particles
	*
	* A renderer is used to represent particle systems.<br>
	* the representation of a particle system is totally independant to its computation.<br>
	* <br>
	* Some renderers (or renderers modes) may need some buffers be attached to the Group of particles they render.<br>
	* rendering buffers are attached to groups but used by renderers. Their creation can also be given to renderer when needed.<br>
	* By enabling the buffer creation with the static method enableBuffersCreation(bool), the renderer will create the buffers he needs,
	* if not already created in the group, before rendering. If buffer creation is disabled, a group that dont have the correct buffers for the renderer, cannot
	* be renderered, the render method of the renderer will simply exit.<br>
	* <br>
	* Note that buffers are linked to a class of renderer, not to a given renderer object.<br>
	* Moreover buffers have an inner flag that can vary function of the states of the renderer used.
	*/
	class SPK_PREFIX Renderer : public Registerable,
								public BufferHandler
	{
	public :

		/////////////////
		// Constructor //
		/////////////////

		/** @brief Constructor of Renderer */
		Renderer();

		////////////////
		// Destructor //
		////////////////

		/** @brief Destructor of Renderer */
		virtual ~Renderer();

		/////////////
		// Setters //
		/////////////

		/**
		* @brief Sets this Renderer active or not.
		*
		* An inactive Renderer will render its parent Group when a call to Group::render() is made.<br>
		* However it can still be used manually by the user with render(Group&).
		*
		* @param active : true to activate this Renderer, false to deactivate it
		* @since 1.03.00
		*/
		void setActive(bool active);

		/**
		* @brief Sets the blending mode of this renderer
		*
		* This is a generic method that allows to set most common blending modes in a generic way.
		* However renderers can implement method to give more control over the blending mode used.
		*
		* @param blendMode : the blending mode to use
		* @since 1.04.00
		*/
		virtual void setBlending(BlendingMode blendMode) = 0;

		/**
		* @brief Enables or disables a rendering hint
		*
		* Note that as stated, these are only hints that may not be taken into account in all rendering APIs
		*
		* @param renderingHint : the renderingHint to enable or disable
		* @param enable : true to enable it, false to disable it
		* @since 1.04.00
		*/
		virtual void enableRenderingHint(RenderingHint renderingHint,bool enable);

		/**
		* @brief Tells the alpha threshold to use when the ALPHA_TEST is enabled
		* 
		* The operation performs by the alpha test is <i>greater or equal to threshold</i>
		*
		* @param alphaThreshold : the alpha threshold to use for the alpha test
		* @since 1.04.00
		*/
		virtual void setAlphaTestThreshold(float alphaThreshold);

		/////////////
		// Getters //
		/////////////

		/**
		* @brief Tells whether this Renderer is active or not
		* @return true if this Renderer is active, false if is is inactive
		* @since 1.03.00
		*/
		bool isActive() const;

		/**
		* @brief Tells whether a rendering hint is enabled or not
		* @param renderingHint : the rendering hint
		* @since 1.04.00
		*/
		virtual bool isRenderingHintEnabled(RenderingHint renderingHint) const;

		/**
		* @brief Gets the alpha threhold used by the alpha test
		* @return the alpha threhold used by the alpha test
		* @since 1.04.00
		*/
		float getAlphaTestThreshold() const;

		///////////////
		// Interface //
		///////////////

		/**
		* @brief Renders a Group of particles
		* @param group : the Group to render
		*/
		virtual void render(const Group& group) = 0;

	private :

		bool active;

		int renderingHintsMask;
		float alphaThreshold;
	};


	inline void Renderer::setActive(bool active)
	{
		this->active = active;
	}

	inline void Renderer::enableRenderingHint(RenderingHint renderingHint,bool enable)
	{
		if (enable)
			renderingHintsMask |= renderingHint;
		else
			renderingHintsMask &= ~renderingHint;
	}

	inline void Renderer::setAlphaTestThreshold(float alphaThreshold)
	{
		this->alphaThreshold = alphaThreshold;
	}

	inline bool Renderer::isActive() const
	{
		return active;
	}

	inline bool Renderer::isRenderingHintEnabled(RenderingHint renderingHint) const
	{
		return (renderingHintsMask & renderingHint) != 0;
	}

	inline float Renderer::getAlphaTestThreshold() const
	{
		return alphaThreshold;
	}
}

#endif
