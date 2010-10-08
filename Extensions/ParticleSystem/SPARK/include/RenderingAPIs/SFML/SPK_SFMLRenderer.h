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


#ifndef H_SPK_SFMLRENDERER
#define H_SPK_SFMLRENDERER

#include "RenderingAPIs/SFML/SPK_SFML_DEF.h"
#include "Core/SPK_Renderer.h"
#include "RenderingAPIs/SFML/SPK_SFMLSystem.h"

namespace SPK
{
namespace SFML
{
	/**
	* @enum ResizeMode
	* @brief Constants defining the way primitives must be resized when zooming
	* @since 1.01.00
	*/
	enum ResizeMode
	{
		RESIZE_NONE,	/**< Constant defining no resize */
		RESIZE_ZOOM_X,	/**< Constant defining a resize function of the X axis */
		RESIZE_ZOOM_Y,	/**< Constant defining a resize function of the Y axis */
	};

	/**
	* @class SFMLRenderer
	* @brief An abstract Renderer for the SFML renderers
	*
	* All children of this renderer are meant to be used with the 2D engine of the SFML library.<br>
	* <br>
	* As the rendering occurs in 2D the X and Y axis are the screen axis and the Z coordinate is subtracted to the
	* Y coordinate to have classical 2D height effect.<br>
	* The factor of Z to subtract to the Y can be adjusted with a call to the static method setZFactor(float).
	* If the factor is 0, the Z coordinate is ignored.
	* <br>
	* Moreover, particles with a negative Z are not rendered as they are considered to be under the other 2D elements.
	* <br>
	* In the SFML library, a RenderTarget must be used for rendering. This RenderTarget can be set with a call to 
	* bindRenderTarget(const sf::RenderTarget&) and released with a call to releaseRenderTarget().<br>
	* A call to render(const Group&) of a SFMLRenderer will not render anything if a RenderTarget is not set.<br>
	* However using SFMLSystem to render particles with SFML will bind the target internally, freeing the user from
	* setting it manually.
	*
	* @since 1.01.00
	*/
	class SPK_SFML_PREFIX SFMLRenderer : public Renderer
	{	
	public :

		/////////////////
		// Constructor //
		/////////////////

		/** @brief Default constructor of SFMLRenderer */
		SFMLRenderer();

		////////////////
		// Destructor //
		////////////////

		/** @brief Destructor of SFMLRenderer */
		virtual ~SFMLRenderer();

		/////////////
		// Setters //
		/////////////

		/**
		* @brief Sets the blend mode of this SFMLRenderer
		* @param mode : the blend mode of this SFMLRenderer in SFML style
		*/
		inline void setBlendMode(sf::Blend::Mode mode);
		virtual void setBlending(BlendingMode blendMode);

		/**
		* @brief Sets whether the ground culling is enabled or not
		*
		* If it is enabled, all particles with and altitude (z coordinate) lower than zero will not be rendered.<br>
		* This allows to simulate the activation of the zbuffer with the ground.
		*
		* @param cull : true to enable the ground culling, false to disable it
		* @since 1.03.00
		*/
		inline void setGroundCulling(bool cull);

		/////////////
		// Getters //
		/////////////

		/**
		* @brief Gets the blend mode of this SFMLRenderer
		* @return the blend mode of this SFMLRenderer in SFML style
		*/
		inline sf::Blend::Mode getBlendMode() const;

		/**
		* @brief Tells whether the ground culling is enabled or not
		*
		* For more information about ground culling see setGroundCulling(bool).
		*
		* @return true if the ground culling is enabled, false if it is disabled
		* @since 1.03.00
		*/
		inline bool hasGroundCulling() const;

		///////////////
		// Interface //
		///////////////

		void render(const Group& group);

		////////////////////
		// static methods //
		////////////////////

		/**
		* @brief Sets the Z factor
		* 
		* The Z factor is the constant that will multiply the Z coordinate of a Particle position
		* before being subtracted to the Y coordinate.
		* <br>
		* Note that the Z factor is static and in that way identical for all SFMLRenderers.
		*
		* @param zFactor : the Z factor
		*/
		static void setZFactor(float zFactor);

		/**
		* @brief Gets the Z factor
		*
		* see setZFactor(float) for more details about Z factor
		*
		* @return the Z factor
		*/
		static float getZFactor();

		/**
		* @brief Binds a RenderTarget for rendering
		*
		* A RenderTarget is compulsory to render with SFML.<br>
		* Rendering with SFMLSystem calls this method internally.
		*
		* @param target : the SFML RenderTarget to bind
		*/
		static void bindCurrentTarget(sf::RenderTarget& target);

		/**
		* @brief Releases the current RenderTarget
		*
		* This method only sets the inner pointer to NULL.
		*/
		static void releaseCurrentTarget();

		/**
		* @brief Binds an SFMLSystem for rendering
		*
		* This method is used internally to tell the engine which SFMLSystem is currently being rendered.<br>
		*
		* @param system : The SFMLSystem that is currently being rendered
		* @since 1.03.01
		*/
		static void bindCurrentSystem(const SFMLSystem& system);

		/**
		* @brief Releases the current SFMLSystem
		*
		* This method sets internally the SFMLSystem being rendered to NULL
		*
		* @since 1.03.01
		*/
		static void releaseCurrentSystem();

	protected :

		/**
		* @brief Gets the current RenderTarget
		* @return the current RenderTarget or NULL if no RenderTarget is attached.
		*/
		static sf::RenderTarget* getCurrentTarget();

		/**
		* @brief Gets the scale factor function of the current zoom and resize mode
		* @param mode : the resize mode used to compute the factor
		*/
		static float getViewZoom(ResizeMode mode);

	
	private :

		static float zFactor;

		static sf::RenderTarget* currentTarget;
		static const SFMLSystem* currentSystem;
		
		sf::Blend::Mode blendMode;

		bool groundCulling;

		inline void initBlending() const;
		inline void initTransformation() const;
		inline void finishTransformation() const;

		/**
		* @brief Calls the rendering of a child of SFMLRenderer
		*
		* This method has to be implemented in derived class of SFMLRenderer instead of render(Group&)
		*
		* @param group : the group to render
		* @since 1.03.01
		*/
		virtual void innerRender(const Group& group) = 0;
	};


	inline void SFMLRenderer::setBlendMode(sf::Blend::Mode mode)
	{
		blendMode = mode;
	}

	inline void SFMLRenderer::setGroundCulling(bool cull)
	{
		groundCulling = cull;
	}

	inline sf::Blend::Mode SFMLRenderer::getBlendMode() const
	{
		return blendMode;
	}

	inline bool SFMLRenderer::hasGroundCulling() const
	{
		return groundCulling;
	}

	inline void SFMLRenderer::initBlending() const
	{
		if (blendMode == sf::Blend::None)
			glDisable(GL_BLEND);
		else
		{
			glEnable(GL_BLEND);

			switch (blendMode)
			{
			case sf::Blend::Alpha :
				glBlendFunc(GL_SRC_ALPHA,GL_ONE_MINUS_SRC_ALPHA);
				break;

			case sf::Blend::Add :      
				glBlendFunc(GL_SRC_ALPHA,GL_ONE);                 
				break;
           
			case sf::Blend::Multiply : 
				glBlendFunc(GL_DST_COLOR,GL_ZERO);                
				break;
			}
		}
	}

	inline void SFMLRenderer::initTransformation() const
	{
		if ((currentSystem != NULL)&&(currentSystem->isWorldTransformed()))
			glPopMatrix();
	}

	inline void SFMLRenderer::finishTransformation() const
	{
		if ((currentSystem != NULL)&&(currentSystem->isWorldTransformed()))
			glPushMatrix();
	}
}}

#endif
