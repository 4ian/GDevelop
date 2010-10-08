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


#include "RenderingAPIs/OpenGL/SPK_GLLineTrailRenderer.h"
#include "Core/SPK_Particle.h"
#include "Core/SPK_Group.h"
#include "Core/SPK_ArrayBuffer.h"

namespace SPK
{
namespace GL
{
	const std::string GLLineTrailRenderer::VERTEX_BUFFER_NAME("SPK_GLLineTrailRenderer_Vertex");
	const std::string GLLineTrailRenderer::COLOR_BUFFER_NAME("SPK_GLLineTrailRenderer_Color");
	const std::string GLLineTrailRenderer::VALUE_BUFFER_NAME("SPK_GLLineTrailRenderer_Value");

	float* GLLineTrailRenderer::vertexBuffer = NULL;
	float* GLLineTrailRenderer::vertexIterator = NULL;
	float* GLLineTrailRenderer::colorBuffer = NULL;
	float* GLLineTrailRenderer::colorIterator = NULL;
	float* GLLineTrailRenderer::valueBuffer = NULL;
	float* GLLineTrailRenderer::valueIterator = NULL;

	GLLineTrailRenderer::GLLineTrailRenderer() :
		GLRenderer(),
		nbSamples(8),
		width(1.0f),
		duration(1.0f),
		degeneratedR(0.0f),
		degeneratedG(0.0f),
		degeneratedB(0.0f),
		degeneratedA(0.0f)
	{
		enableBlending(true);	
	}

	void GLLineTrailRenderer::setDegeneratedLines(float r,float g,float b,float a)
	{
		degeneratedR = r;
		degeneratedG = g;
		degeneratedB = b;
		degeneratedA = a;
	}

	bool GLLineTrailRenderer::checkBuffers(const Group& group)
	{
		FloatBuffer* fVertexBuffer;
		FloatBuffer* fColorBuffer;
		FloatBuffer* fValueBuffer;

		if ((fVertexBuffer = dynamic_cast<FloatBuffer*>(group.getBuffer(VERTEX_BUFFER_NAME,nbSamples))) == NULL)
			return false;

		if ((fColorBuffer = dynamic_cast<FloatBuffer*>(group.getBuffer(COLOR_BUFFER_NAME,nbSamples))) == NULL)
			return false;

		if ((fValueBuffer = dynamic_cast<FloatBuffer*>(group.getBuffer(VALUE_BUFFER_NAME,nbSamples))) == NULL)
			return false;

		vertexIterator = vertexBuffer = fVertexBuffer->getData();
		colorIterator = colorBuffer = fColorBuffer->getData();
		valueIterator = valueBuffer = fValueBuffer->getData();

		return true;
	}

	void GLLineTrailRenderer::createBuffers(const Group& group)
	{	
		FloatBuffer* fVertexBuffer = dynamic_cast<FloatBuffer*>(group.createBuffer(VERTEX_BUFFER_NAME,FloatBufferCreator((nbSamples + 2) * 3),nbSamples,true));
		FloatBuffer* fColorBuffer = dynamic_cast<FloatBuffer*>(group.createBuffer(COLOR_BUFFER_NAME,FloatBufferCreator((nbSamples + 2) << 2),nbSamples,true));
		FloatBuffer* fValueBuffer = dynamic_cast<FloatBuffer*>(group.createBuffer(VALUE_BUFFER_NAME,FloatBufferCreator(nbSamples),nbSamples,true));

		vertexIterator = vertexBuffer = fVertexBuffer->getData();
		colorIterator = colorBuffer = fColorBuffer->getData();
		valueIterator = valueBuffer = fValueBuffer->getData();

		// Fills the buffers with correct values
		for (size_t i = 0; i < group.getNbParticles(); ++i)
		{
			const Particle& particle = group.getParticle(i);
			init(particle,particle.getAge());
		}

		// Resets the iterators at the beginning after the init
		vertexIterator = vertexBuffer;
		colorIterator = colorBuffer;
		valueIterator = valueBuffer;
	}

	void GLLineTrailRenderer::destroyBuffers(const Group& group)
	{
		group.destroyBuffer(VERTEX_BUFFER_NAME);
		group.destroyBuffer(COLOR_BUFFER_NAME);
		group.destroyBuffer(VALUE_BUFFER_NAME);
	}

	void GLLineTrailRenderer::init(const Group& group)
	{
		if (!prepareBuffers(group))
			return;

		for (size_t i = 0; i < group.getNbParticles(); ++i)
		{
			const Particle& particle = group.getParticle(i);
			init(particle,particle.getAge());
		}
	}

	void GLLineTrailRenderer::render(const Group& group)
	{	
		if (!prepareBuffers(group))
			return;

		initBlending();
		initRenderingHints();

		// Inits lines' parameters
		glLineWidth(width);
		glDisable(GL_TEXTURE_2D);
		glShadeModel(GL_SMOOTH);

		for (size_t i = 0; i < group.getNbParticles(); ++i)
		{
			const Particle& particle = group.getParticle(i);
			float age = particle.getAge();
			float oldAge = *valueIterator;

			if ((age == 0.0f)||(age < *valueIterator)) // If the particle is new, buffers for it are reinitialized
				init(particle,0.0f);
			else
			{
				if (age - *(valueIterator + 1) >= duration / (nbSamples - 1)) // shifts the data by one
				{
					memmove(vertexIterator + 6,vertexIterator + 3,(nbSamples - 1) * 3 * sizeof(float));
					memmove(colorIterator + 8,colorIterator + 4,((nbSamples - 1) << 2) * sizeof(float));
					memmove(valueIterator + 1,valueIterator,(nbSamples - 1) * sizeof(float));

					// post degenerated vertex copy
					memcpy(vertexIterator + (nbSamples + 1) * 3,vertexIterator + nbSamples * 3,3 * sizeof(float));
				}

				// Updates the current sample
				const Vector3D& pos = particle.position();
				*(vertexIterator++) = pos.x;
				*(vertexIterator++) = pos.y;
				*(vertexIterator++) = pos.z;

				memcpy(vertexIterator,vertexIterator - 3,3 * sizeof(float));
				vertexIterator += (nbSamples + 1) * 3;

				colorIterator += 4; // skips post degenerated vertex color
				*(colorIterator++) = particle.getR();
				*(colorIterator++) = particle.getG();
				*(colorIterator++) = particle.getB();
				*(colorIterator++) = particle.getParamCurrentValue(PARAM_ALPHA);
				colorIterator += 3;

				*(valueIterator++) = age;
				//valueIterator += nbSamples;

				// Updates alpha
				for (size_t i = 0; i < nbSamples - 1; ++i)
				{
					float ratio = (age - oldAge) / (duration - age + *valueIterator);
					if (ratio > 0.0f)
						*colorIterator *= ratio < 1.0f ? 1.0f - ratio : 0.0f;
					colorIterator += 4;
					++valueIterator;
				}
				++colorIterator;
			}
		}

		glEnableClientState(GL_VERTEX_ARRAY);
		glEnableClientState(GL_COLOR_ARRAY);

		glColorPointer(4,GL_FLOAT,0,colorBuffer);
		glVertexPointer(3,GL_FLOAT,0,vertexBuffer);

		glDrawArrays(GL_LINE_STRIP,0,group.getNbParticles() * (nbSamples + 2));

		glDisableClientState(GL_VERTEX_ARRAY);
		glDisableClientState(GL_COLOR_ARRAY);
	}
}}
