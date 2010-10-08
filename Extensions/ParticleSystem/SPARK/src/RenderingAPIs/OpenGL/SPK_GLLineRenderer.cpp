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


#include "RenderingAPIs/OpenGL/SPK_GLLineRenderer.h"
#include "Core/SPK_Particle.h"
#include "Core/SPK_Group.h"
#include "Core/SPK_ArrayBuffer.h"

namespace SPK
{
namespace GL
{
	const std::string GLLineRenderer::GPU_BUFFER_NAME("SPK_GLLineRenderer_GPU");

	float* GLLineRenderer::gpuBuffer = NULL;
	float* GLLineRenderer::gpuIterator = NULL;

	GLLineRenderer::GLLineRenderer(float length,float width) :
		GLRenderer(),
		LineRendererInterface(length,width)
	{}

	bool GLLineRenderer::checkBuffers(const Group& group)
	{
		FloatBuffer* fBuffer;
		if ((fBuffer = dynamic_cast<FloatBuffer*>(group.getBuffer(GPU_BUFFER_NAME))) == NULL)
			return false;

		gpuIterator = gpuBuffer = fBuffer->getData();
		return true;
	}

	void GLLineRenderer::createBuffers(const Group& group)
	{	
		FloatBuffer* fBuffer = dynamic_cast<FloatBuffer*>(group.createBuffer(GPU_BUFFER_NAME,FloatBufferCreator(14),0,false));
		gpuIterator = gpuBuffer = fBuffer->getData();
	}

	void GLLineRenderer::destroyBuffers(const Group& group)
	{
		group.destroyBuffer(GPU_BUFFER_NAME);
	}

	void GLLineRenderer::render(const Group& group)
	{
		if (!prepareBuffers(group))
			return;

		initBlending();
		initRenderingHints();

		glLineWidth(width);
		glDisable(GL_TEXTURE_2D);
		glShadeModel(GL_FLAT);

		for (size_t i = 0; i < group.getNbParticles(); ++i)
		{
			const Particle& particle = group.getParticle(i);

			*(gpuIterator++) = particle.position().x;
			*(gpuIterator++) = particle.position().y;
			*(gpuIterator++) = particle.position().z;

			gpuIterator += 4; // skips the first vertex color data as GL_FLAT was forced

			*(gpuIterator++) = particle.position().x + particle.velocity().x * length;
			*(gpuIterator++) = particle.position().y + particle.velocity().y * length;
			*(gpuIterator++) = particle.position().z + particle.velocity().z * length;

			*(gpuIterator++) = particle.getR();
			*(gpuIterator++) = particle.getG();
			*(gpuIterator++) = particle.getB();
			*(gpuIterator++) = particle.getParamCurrentValue(PARAM_ALPHA);	
		}

		glEnableClientState(GL_VERTEX_ARRAY);
		glEnableClientState(GL_COLOR_ARRAY);

		// interleaves vertex and color data
		glVertexPointer(3,GL_FLOAT,7 * sizeof(float),gpuBuffer);
		glColorPointer(4,GL_FLOAT,7 * sizeof(float),gpuBuffer + 3);
	
		glDrawArrays(GL_LINES,0,group.getNbParticles() << 1);

		glDisableClientState(GL_VERTEX_ARRAY);
		glDisableClientState(GL_COLOR_ARRAY);
	}
}}
