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


#ifndef H_SPK_GLQUADRENDERER
#define H_SPK_GLQUADRENDERER

#include "RenderingAPIs/OpenGL/SPK_GLRenderer.h"
#include "RenderingAPIs/OpenGL/SPK_GLExtHandler.h"
#include "Extensions/Renderers/SPK_QuadRendererInterface.h"
#include "Extensions/Renderers/SPK_Oriented3DRendererInterface.h"
#include "Core/SPK_Vector3D.h"
#include "Core/SPK_Particle.h"
#include "Core/SPK_Model.h"

namespace SPK
{
namespace GL
{
	/**
	* @class GLQuadRenderer
	* @brief A Renderer drawing particles as OpenGL quads
	*
	* the orientation of the quads depends on the orientation parameters set.
	* This orientation is computed during rendering by the CPU (further improvement of SPARK will allow to make the computation on GPU side).<br>
	* <br>
	* Below are the parameters of Particle that are used in this Renderer (others have no effects) :
	* <ul>
	* <li>SPK::PARAM_SIZE</li>
	* <li>SPK::PARAM_RED</li>
	* <li>SPK::PARAM_GREEN</li>
	* <li>SPK::PARAM_BLUE</li>
	* <li>SPK::PARAM_ALPHA (only if blending is enabled)</li>
	* <li>SPK::PARAM_ANGLE</li>
	* <li>SPK::PARAM_TEXTURE_INDEX (only if not in TEXTURE_NONE mode)</li>
	* </ul>
	*/
	class SPK_GL_PREFIX GLQuadRenderer :	public GLRenderer,
											public QuadRendererInterface,
											public Oriented3DRendererInterface,
											public GLExtHandler
	{
		SPK_IMPLEMENT_REGISTERABLE(GLQuadRenderer)

	public :

		//////////////////
		// Constructors //
		//////////////////

		/**
		* @brief Constructor of GLQuadRenderer
		* @param scaleX the scale of the width of the quad
		* @param scaleY the scale of the height of the quad
		*/
		GLQuadRenderer(float scaleX = 1.0f,float scaleY = 1.0f);

		/**
		* @brief Creates and registers a new GLQuadRenderer
		* @param scaleX the scale of the width of the quad
		* @param scaleY the scale of the height of the quad
		* @return A new registered GLQuadRenderer
		* @since 1.04.00
		*/
		static inline GLQuadRenderer* create(float scaleX = 1.0f,float scaleY = 1.0f);

		/////////////
		// Setters //
		/////////////

		virtual bool setTexturingMode(TexturingMode mode);

		inline void setTexture(GLuint textureIndex);

		/////////////
		// Getters //
		/////////////

		/**
		* @brief Gets the texture of this GLQuadRenderer
		* @return the texture of this GLQuadRenderer
		*/
		inline GLuint getTexture() const;

		///////////////
		// Interface //
		///////////////

		virtual void createBuffers(const Group& group);
		virtual void destroyBuffers(const Group& group);

		virtual void render(const Group& group);

	protected :

		virtual bool checkBuffers(const Group& group);

	private :

		mutable float modelView[16];
		mutable float invModelView[16];

		GLuint textureIndex;

		// vertex buffers and iterators
		static float* gpuBuffer;
		static float* gpuIterator;
		static float* textureBuffer;
		static float* textureIterator;

		// buffers names
		static const std::string GPU_BUFFER_NAME;
		static const std::string TEXTURE_BUFFER_NAME;

		float* createTextureBuffer(const Group& group) const;

		inline void invertModelView() const;

		inline void GLCallColorAndVertex(const Particle& particle) const;	// OpenGL calls for color and position
		inline void GLCallTexture2DAtlas(const Particle& particle) const;	// OpenGL calls for 2D atlastexturing 
		inline void GLCallTexture3D(const Particle& particle) const;		// OpenGL calls for 3D texturing

		static void (GLQuadRenderer::*renderParticle)(const Particle&)  const;	// pointer to the right render method

		void render2D(const Particle& particle) const;			// Rendering for particles with texture 2D or no texture
		void render2DRot(const Particle& particle) const;		// Rendering for particles with texture 2D or no texture and rotation
		void render3D(const Particle& particle) const;			// Rendering for particles with texture 3D
		void render3DRot(const Particle& particle) const;		// Rendering for particles with texture 3D and rotation
		void render2DAtlas(const Particle& particle) const;		// Rendering for particles with texture 2D atlas
		void render2DAtlasRot(const Particle& particle) const;	// Rendering for particles with texture 2D atlas and rotation
	};


	inline GLQuadRenderer* GLQuadRenderer::create(float scaleX,float scaleY)
	{
		GLQuadRenderer* obj = new GLQuadRenderer(scaleX,scaleY);
		registerObject(obj);
		return obj;
	}
		
	inline void GLQuadRenderer::setTexture(GLuint textureIndex)
	{
		this->textureIndex = textureIndex;
	}

	inline GLuint GLQuadRenderer::getTexture() const
	{
		return textureIndex;
	}

	inline void GLQuadRenderer::GLCallColorAndVertex(const Particle& particle) const
	{
		float x = particle.position().x;
		float y = particle.position().y;
		float z = particle.position().z;

		// quads are drawn in a counter clockwise order :
		// top right vertex
		*(gpuIterator++) = x + quadSide().x + quadUp().x;
		*(gpuIterator++) = y + quadSide().y + quadUp().y;
		*(gpuIterator++) = z + quadSide().z + quadUp().z;
		gpuIterator += 4;

		// top left vertex
		*(gpuIterator++) = x - quadSide().x + quadUp().x;
		*(gpuIterator++) = y - quadSide().y + quadUp().y;
		*(gpuIterator++) = z - quadSide().z + quadUp().z;
		gpuIterator += 4;

		// bottom left
		*(gpuIterator++) = x - quadSide().x - quadUp().x;
		*(gpuIterator++) = y - quadSide().y - quadUp().y;
		*(gpuIterator++) = z - quadSide().z - quadUp().z;
		gpuIterator += 4;

		// bottom right
		*(gpuIterator++) = x + quadSide().x - quadUp().x;
		*(gpuIterator++) = y + quadSide().y - quadUp().y;
		*(gpuIterator++) = z + quadSide().z - quadUp().z;

		*(gpuIterator++) = particle.getR();
		*(gpuIterator++) = particle.getG();
		*(gpuIterator++) = particle.getB();
		*(gpuIterator++) = particle.getParamCurrentValue(PARAM_ALPHA);
	}

	inline void GLQuadRenderer::GLCallTexture2DAtlas(const Particle& particle) const
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

	inline void GLQuadRenderer::GLCallTexture3D(const Particle& particle) const
	{
		float textureIndex = particle.getParamCurrentValue(PARAM_TEXTURE_INDEX);

		*(textureIterator + 2) = textureIndex;
		*(textureIterator + 5) = textureIndex;
		*(textureIterator + 8) = textureIndex;
		*(textureIterator + 11) = textureIndex;
		textureIterator += 12;
	}

	inline void GLQuadRenderer::invertModelView() const
	{
		float tmp[12];
		float src[16];

		/* transpose matrix */
		for (int i = 0; i < 4; ++i)
		{
			src[i] = modelView[i << 2];
			src[i + 4] = modelView[(i << 2) + 1];
			src[i + 8] = modelView[(i << 2) + 2];
			src[i + 12] = modelView[(i << 2) + 3];
		}

		/* calculate pairs for first 8 elements (cofactors) */
		tmp[0] = src[10] * src[15];
		tmp[1] = src[11] * src[14];
		tmp[2] = src[9] * src[15];
		tmp[3] = src[11] * src[13];
		tmp[4] = src[9] * src[14];
		tmp[5] = src[10] * src[13];
		tmp[6] = src[8] * src[15];
		tmp[7] = src[11] * src[12];
		tmp[8] = src[8] * src[14];
		tmp[9] = src[10] * src[12];
		tmp[10] = src[8] * src[13];
		tmp[11] = src[9] * src[12];

		/* calculate first 8 elements (cofactors) */
		invModelView[0] = tmp[0] * src[5] + tmp[3] * src[6] + tmp[4] * src[7] - tmp[1] * src[5] - tmp[2] * src[6] - tmp[5] * src[7];
		invModelView[1] = tmp[1] * src[4] + tmp[6] * src[6] + tmp[9] * src[7] - tmp[0] * src[4] - tmp[7] * src[6] - tmp[8] * src[7];
		invModelView[2] = tmp[2] * src[4] + tmp[7] * src[5] + tmp[10] * src[7] - tmp[3] * src[4] - tmp[6] * src[5] - tmp[11] * src[7];
		invModelView[3] = tmp[5] * src[4] + tmp[8] * src[5] + tmp[11] * src[6] - tmp[4] * src[4] - tmp[9] * src[5] - tmp[10] * src[6];
		invModelView[4] = tmp[1] * src[1] + tmp[2] * src[2] + tmp[5] * src[3] - tmp[0] * src[1] - tmp[3] * src[2] - tmp[4] * src[3];
		invModelView[5] = tmp[0] * src[0] + tmp[7] * src[2] + tmp[8] * src[3] - tmp[1] * src[0]- tmp[6] * src[2] - tmp[9] * src[3];
		invModelView[6] = tmp[3] * src[0] + tmp[6] * src[1] + tmp[11] * src[3] - tmp[2] * src[0] - tmp[7] * src[1] - tmp[10] * src[3];
		invModelView[7] = tmp[4] * src[0] + tmp[9] * src[1] + tmp[10] * src[2] - tmp[5]*src[0] - tmp[8]*src[1] - tmp[11]*src[2];

		/* calculate pairs for second 8 elements (cofactors) */
		tmp[0] = src[2] * src[7];
		tmp[1] = src[3] * src[6];
		tmp[2] = src[1] * src[7];
		tmp[3] = src[3] * src[5];
		tmp[4] = src[1] * src[6];
		tmp[5] = src[2] * src[5];
		tmp[6] = src[0] * src[7];
		tmp[7] = src[3] * src[4];
		tmp[8] = src[0] * src[6];
		tmp[9] = src[2] * src[4];
		tmp[10] = src[0] * src[5];
		tmp[11] = src[1] * src[4];

		/* calculate second 8 elements (cofactors) */
		invModelView[8] = tmp[0] * src[13] + tmp[3] * src[14] + tmp[4] * src[15] - tmp[1] * src[13] - tmp[2] * src[14] - tmp[5] * src[15];
		invModelView[9] = tmp[1] * src[12] + tmp[6] * src[14] + tmp[9] * src[15] - tmp[0] * src[12] - tmp[7] * src[14] - tmp[8] * src[15];
		invModelView[10] = tmp[2] * src[12] + tmp[7] * src[13] + tmp[10] * src[15] - tmp[3] * src[12] - tmp[6] * src[13] - tmp[11] * src[15];
		invModelView[11] = tmp[5] * src[12] + tmp[8] * src[13] + tmp[11] * src[14] - tmp[4] * src[12] - tmp[9] * src[13] - tmp[10] * src[14];
		invModelView[12] = tmp[2] * src[10] + tmp[5] * src[11] + tmp[1] * src[9] - tmp[4] * src[11] - tmp[0] * src[9] - tmp[3] * src[10];
		invModelView[13] = tmp[8] * src[11] + tmp[0] * src[8] + tmp[7] * src[10] - tmp[6] * src[10] - tmp[9] * src[11] - tmp[1] * src[8];
		invModelView[14] = tmp[6] * src[9] + tmp[11] * src[11] + tmp[3] * src[8] - tmp[10] * src[11] - tmp[2] * src[8] - tmp[7] * src[9];
		invModelView[15] = tmp[10] * src[10] + tmp[4] * src[8] + tmp[9] * src[9] - tmp[8] * src[9] - tmp[11] * src[10] - tmp[5] * src[8];

		/* calculate determinant */
		float det = src[0] * invModelView[0] + src[1] * invModelView[1] + src[2] * invModelView[2] + src[3] * invModelView[3];

		/* calculate matrix inverse */
		det = 1 / det;
		for (int i = 0; i < 16; ++i)
			invModelView[i] *= det;
	}
}}

#endif
