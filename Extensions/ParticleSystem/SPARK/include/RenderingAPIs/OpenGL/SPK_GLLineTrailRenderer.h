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


#ifndef H_SPK_GLLINETRAILRENDERER
#define H_SPK_GLLINETRAILRENDERER

#include "RenderingAPIs/OpenGL/SPK_GLRenderer.h"
#include "Core/SPK_Particle.h"
#include "Core/SPK_Model.h"


namespace SPK
{
namespace GL
{
	/**
	* @class GLLineTrailRenderer
	* @brief A Renderer drawing particles as line trails defined by the positions of particles over time
	*
	* The trail coordinates are computed in a procedural manner over time.<br>
	* A trail i defined by a duration. The faster the particle, the longer the trail. It is defined by a numbers of samples.<br>
	* The sampling frequency of the trail is therefore computed by nbSamples / duration and defines its resolution.<br>
	* The higher the sampling frequency, the smoother the trail but the bigger the compution time and the memory consumption.<br>
	* <br>
	* All the particles of a Group are renderered in a single batch of GL_LINE_STRIP,
	* which means every trails belong to the same object to reduce overhead on GPU side.<br>
	* To allow that, invisible lines link trails together. They are defined as degenerated lines.<br>
	* This imposes the alpha value is taken into account and the blending is therefore forced with GLLineTrailRenderer.<br>
	* The user has the possibility to set the RGBA values of degenerated lines to keep them invisible function of the blending mode and environment.<br>
	* By default it is set to (0.0f,0.0f,0.0f,0.0f).
	* <br>
	* Below are the parameters of Particle that are used in this Renderer (others have no effects) :
	* <ul>
	* <li>SPK::PARAM_RED</li>
	* <li>SPK::PARAM_GREEN</li>
	* <li>SPK::PARAM_BLUE</li>
	* <li>SPK::PARAM_ALPHA</li>
	* </ul>
	* @since 1.03.00
	*/
	class SPK_GL_PREFIX GLLineTrailRenderer : public GLRenderer
	{
		SPK_IMPLEMENT_REGISTERABLE(GLLineTrailRenderer)

	public :

		//////////////////
		// Constructors //
		//////////////////

		/** @brief Default constructor of GLLineTrailRenderer */
		GLLineTrailRenderer();

		/**
		* @brief Creates and registers a new GLLineTrailRenderer
		* @return A new registered GLLineTrailRenderer
		* @since 1.04.00
		*/
		static GLLineTrailRenderer* create();

		/////////////
		// Setters //
		/////////////

		/**
		* @brief Sets the number of samples in a trail
		*
		* The number of samples defines the number of points used to construct the trail.<br>
		* The bigger the number of samples, the smoother the trail but the bigger the compution time and the memory consumption.
		*
		* @param nbSamples : the number of samples to construct the trails
		*/
		void setNbSamples(size_t nbSamples);

		/**
		* @brief Sets the width of a trail
		*
		* Like for GLLineRenderer, the width is defined in pixels and is not dependant of the distance of the trail from the camera
		*
		* @param width : the width of trails in pixels
		*/
		void setWidth(float width);

		/**
		* @brief Sets the duration of a sample
		*
		* The duration of a sample is defined by its life time from its creation to its destruction.<br>
		* Note that the alpha of a sample will decrease linearly from its initial alpha to 0.
		*
		* @param duration : the duration of a sample
		*/
		void setDuration(float duration);

		/**
		* @brief Sets the color components of degenerated lines
		* @param r : the red component
		* @param g : the green component
		* @param b : the blue component
		* @param a : the alpha component
		*/
		void setDegeneratedLines(float r,float g,float b,float a);

		virtual void enableBlending(bool blendingEnabled);

		/////////////
		// Getters //
		/////////////

		/**
		* @brief Gets the number of samples per trail
		* @return the number of samples per trail
		*/
		size_t getNbSamples() const;

		/**
		* @brief Gets the width of a trail
		* @return the width of a trail (in pixels)
		*/
		float getWidth() const;

		/**
		* @brief Gets the duration of a sample
		* @return the duration of a sample
		*/
		float getDuration() const;

		///////////////
		// Interface //
		///////////////

		virtual void createBuffers(const Group& group);
		virtual void destroyBuffers(const Group& group);

		/**
		* @brief Inits all the trails of the particle of the group
		*
		* All the samples are set to the current position of the particle.<br>
		* The trail of each particle has therefore a length of 0 and is ready for update.<br>
		* This function allows to clear the buffers for GLLineTrailRenderer of the given group.
		*
		* @param group : the Group whose buffers need to be initialized
		*/
		void init(const Group& group);
		virtual void render(const Group& group);

	protected :

		virtual bool checkBuffers(const Group& group);

	private :

		size_t nbSamples;

		float width;
		float duration;

		float degeneratedR;
		float degeneratedG;
		float degeneratedB;
		float degeneratedA;

		// vertex buffers and iterators
		static float* vertexBuffer;
		static float* vertexIterator;
		static float* colorBuffer;
		static float* colorIterator;
		static float* valueBuffer;
		static float* valueIterator;

		// buffers names
		static const std::string VERTEX_BUFFER_NAME;
		static const std::string COLOR_BUFFER_NAME;
		static const std::string VALUE_BUFFER_NAME;

		void init(const Particle& particle,float age) const;
	};


	inline GLLineTrailRenderer* GLLineTrailRenderer::create()
	{
		GLLineTrailRenderer* obj = new GLLineTrailRenderer;
		registerObject(obj);
		return obj;
	}
	
	inline void GLLineTrailRenderer::enableBlending(bool blendingEnabled)
	{
		GLRenderer::enableBlending(true);
	}

	inline void GLLineTrailRenderer::setNbSamples(size_t nbSamples)
	{
		this->nbSamples = nbSamples;
	}

	inline void GLLineTrailRenderer::setWidth(float width)
	{
		this->width = width;
	}

	inline void GLLineTrailRenderer::setDuration(float duration)
	{
		this->duration = duration;
	}

	inline size_t GLLineTrailRenderer::getNbSamples() const
	{
		return nbSamples;
	}

	inline float GLLineTrailRenderer::getWidth() const
	{
		return width;
	}

	inline float GLLineTrailRenderer::getDuration() const
	{
		return duration;
	}

	inline void GLLineTrailRenderer::init(const Particle& particle,float age) const
	{
		// Gets the particle's values
		const Vector3D& pos = particle.position();
		float r = particle.getR();
		float g = particle.getG();
		float b = particle.getB();
		float a = particle.getParamCurrentValue(PARAM_ALPHA);

		// Inits position
		for (size_t i = 0; i < nbSamples + 2; ++i)
		{
			*(vertexIterator++) = pos.x;
			*(vertexIterator++) = pos.y;
			*(vertexIterator++) = pos.z;
		}

		// Inits color
		// degenerate pre vertex
		*(colorIterator++) = degeneratedR;
		*(colorIterator++) = degeneratedG;
		*(colorIterator++) = degeneratedB;
		*(colorIterator++) = degeneratedA;

		for (size_t i = 0; i < nbSamples; ++i)
		{
			*(colorIterator++) = r;
			*(colorIterator++) = g;
			*(colorIterator++) = b;
			*(colorIterator++) = a;
		}

		// degenerate post vertex
		*(colorIterator++) = degeneratedR;
		*(colorIterator++) = degeneratedG;
		*(colorIterator++) = degeneratedB;
		*(colorIterator++) = degeneratedA;

		// Inits age
		for (size_t i = 0; i < nbSamples; ++i)
			*(valueIterator++) = age;
	}
}}

#endif
