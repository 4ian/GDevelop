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


#ifndef H_SPK_SFMLQUADRENDERER
#define H_SPK_SFMLQUADRENDERER

#include "RenderingAPIs/SFML/SPK_SFMLRenderer.h"
#include "Extensions/Renderers/SPK_QuadRendererInterface.h"
#include "Extensions/Renderers/SPK_Oriented2DRendererInterface.h"

namespace SPK
{
namespace SFML
{
	/**
	* @class SFMLQuadRenderer
	* @brief A Renderer drawing particles as Quads for the SFML 2D rendering engine
	* 
	* A Quad can either be rendererd with a sf::Image or not.<br>
	* If an Image is set, note that its size has no influence on the rendering (unlike sf::Sprite) :<ul>
	* <li>the width of the quad is defined by <i>scaleX * particle size</i></li>
	* <li>the height of the quad is defined by <i>scaleY * particle size</i></li>
	* </ul>
	* Note that to gain performance it is better to use SFMLPointRenderer with GL::POINT_SPRITE as point type
	* if possible (meaning the extension exists on the hardware, size of particles is identical and no rotation occurs).<br>
	* <br>
	* Below are the parameters of Particle that are used in this Renderer (others have no effects) :
	* <ul>
	* <li>SPK::PARAM_SIZE</li>
	* <li>SPK::PARAM_RED</li>
	* <li>SPK::PARAM_GREEN</li>
	* <li>SPK::PARAM_BLUE</li>
	* <li>SPK::PARAM_ALPHA (only if blend mode is not sf::Blend::NONE)</li>
	* <li>SPK::PARAM_ANGLE</li> 
	* <li>SPK::PARAM_TEXTURE_INDEX</li>
	* </ul>
	*
	* @since 1.01.00
	*/
	class SPK_SFML_PREFIX SFMLQuadRenderer :	public SFMLRenderer,
												public QuadRendererInterface,
												public Oriented2DRendererInterface
	{	
		SPK_IMPLEMENT_REGISTERABLE(SFMLQuadRenderer)

	public :

		/////////////////
		// Constructor //
		/////////////////

		/**
		* @brief Constructor of SFMLQuadRenderer
		* @param image : the Image of this SFMLQuadRenderer
		* @param scaleX : the scale on X axis of this SFMLQuadRenderer
		* @param scaleY : the scale on Y axis of this SFMLQuadRenderer
		*/
		SFMLQuadRenderer(sf::Image* image = NULL,float scaleX = 1.0f,float scaleY = 1.0f);

		/**
		* @brief Creates and registers a new SFMLQuadRenderer
		* @param image : the Image of this SFMLQuadRenderer
		* @param scaleX : the scale on X axis of this SFMLQuadRenderer
		* @param scaleY : the scale on Y axis of this SFMLQuadRenderer
		* @return A new registered SFMLQuadRenderer
		* @since 1.04.00
		*/
		static inline SFMLQuadRenderer* create(sf::Image* image = NULL,float scaleX = 1.0f,float scaleY = 1.0f);

		/////////////
		// Setters //
		/////////////

		/**
		* @brief Sets the image of this SFMLQuadRenderer
		* @param image : the image of this SFMLQuadRenderer or NULL not to set an image
		*/
		inline void setImage(sf::Image* image);

		virtual inline bool setTexturingMode(TexturingMode mode);

		/////////////
		// Getters //
		/////////////

		/**
		* @brief Gets the image of this SFMLQuadRenderer
		* @return the image of this SFMLQuadRenderer or NULL if no image is set
		*/
		inline sf::Image* getImage() const;

		///////////////
		// Interface //
		///////////////

		virtual void createBuffers(const Group& group);
		virtual void destroyBuffers(const Group& group);

	protected :

		virtual bool checkBuffers(const Group& group);

	private :

		sf::Image* image;

		// vertex buffers and iterators
		static float* gpuBuffer;
		static float* gpuIterator;
		static float* textureBuffer;
		static float* textureIterator;

		// buffers names
		static const std::string GPU_BUFFER_NAME;
		static const std::string TEXTURE_BUFFER_NAME;

		float* createTextureBuffer(const Group& group) const;

		void innerRender(const Group& group);

		inline void GLCallColorAndVertex(const Particle& particle) const;	// OpenGL calls for color and position
		inline void GLCallTexture2DAtlas(const Particle& particle) const;	// OpenGL calls for 2D atlastexturing 

		static void (SFMLQuadRenderer::*renderParticle)(const Particle&)  const;	// pointer to the right render method
		
		void renderVA(const Particle& particle) const;			// Rendering for particles in vertex array mode
		void renderRotVA(const Particle& particle) const;		// Rendering for particles with rotation in vertex array mode
		void renderAtlasVA(const Particle& particle) const;		// Rendering for particles with atlas texture in vertex array mode
		void renderAtlasRotVA(const Particle& particle) const;	// Rendering for particles with atlas texture and rotation in vertex array mode
	};


	inline SFMLQuadRenderer* SFMLQuadRenderer::create(sf::Image* image,float scaleX,float scaleY)
	{
		SFMLQuadRenderer* obj = new SFMLQuadRenderer(image,scaleX,scaleY);
		registerObject(obj);
		return obj;
	}
	
	inline void SFMLQuadRenderer::setImage(sf::Image* image)
	{
		this->image = image;
		texturingMode = (image == NULL ? TEXTURE_NONE : TEXTURE_2D);
	}

	inline bool SFMLQuadRenderer::setTexturingMode(TexturingMode mode)
	{
		if (mode == TEXTURE_3D)
			return false;

		texturingMode = mode;
		return true;
	}

	inline sf::Image* SFMLQuadRenderer::getImage() const
	{
		return image;
	}

	inline void SFMLQuadRenderer::GLCallColorAndVertex(const Particle& particle) const
	{
		float x = particle.position().x;
		float y = particle.position().y;
		float deltaY = -particle.position().z * getZFactor();

		*(gpuIterator++) = x + quadSide().x + quadUp().x;
		*(gpuIterator++) = y + quadSide().y + quadUp().y + deltaY;
		
		gpuIterator += 4;

		*(gpuIterator++) = x - quadSide().x + quadUp().x;
		*(gpuIterator++) = y - quadSide().y + quadUp().y + deltaY;
		
		gpuIterator += 4;

		*(gpuIterator++) = x - quadSide().x - quadUp().x;
		*(gpuIterator++) = y - quadSide().y - quadUp().y + deltaY;
	
		gpuIterator += 4;

		*(gpuIterator++) = x + quadSide().x - quadUp().x;
		*(gpuIterator++) = y + quadSide().y - quadUp().y + deltaY;

		*(gpuIterator++) = particle.getR();
		*(gpuIterator++) = particle.getG();
		*(gpuIterator++) = particle.getB();
		*(gpuIterator++) = particle.getParamCurrentValue(PARAM_ALPHA);
	}

	inline void SFMLQuadRenderer::GLCallTexture2DAtlas(const Particle& particle) const
	{
		computeAtlasCoordinates(particle);

		*(textureIterator++) = textureAtlasU1();
		*(textureIterator++) = textureAtlasV0();

		*(textureIterator++) = textureAtlasU0();
		*(textureIterator++) = textureAtlasV0();

		*(textureIterator++) = textureAtlasU0();
		*(textureIterator++) = textureAtlasV1();

		*(textureIterator++) = textureAtlasU1();
		*(textureIterator++) = textureAtlasV1();	
	}
}}

#endif
