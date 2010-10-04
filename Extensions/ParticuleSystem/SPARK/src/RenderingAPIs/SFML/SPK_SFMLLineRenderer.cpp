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


#include "RenderingAPIs/SFML/SPK_SFMLLineRenderer.h"
#include "Core/SPK_Particle.h"
#include "Core/SPK_Group.h"
#include "Core/SPK_ArrayBuffer.h"

namespace SPK
{
namespace SFML
{
	const std::string SFMLLineRenderer::GPU_BUFFER_NAME("SPK_SFMLLineRenderer_GPU");

	float* SFMLLineRenderer::gpuBuffer = NULL;
	float* SFMLLineRenderer::gpuIterator = NULL;

	SFMLLineRenderer::SFMLLineRenderer(float length,float width,ResizeMode mode) :
		SFMLRenderer(),
		LineRendererInterface(length,width),
		resizeMode(mode)
	{}

	bool SFMLLineRenderer::checkBuffers(const Group& group)
	{
		FloatBuffer* fBuffer;
		if ((fBuffer = dynamic_cast<FloatBuffer*>(group.getBuffer(GPU_BUFFER_NAME))) == NULL)
			return false;

		gpuIterator = gpuBuffer = fBuffer->getData();
		return true;
	}

	void SFMLLineRenderer::createBuffers(const Group& group)
	{
		FloatBuffer* fBuffer = dynamic_cast<FloatBuffer*>(group.createBuffer(GPU_BUFFER_NAME,FloatBufferCreator(12),0,false));
		gpuIterator = gpuBuffer = fBuffer->getData();
	}

	void SFMLLineRenderer::destroyBuffers(const Group& group)
	{
		group.destroyBuffer(GPU_BUFFER_NAME);
	}

	void SFMLLineRenderer::innerRender(const Group& group)
	{
		glLineWidth(width * getViewZoom(resizeMode));
		glDisable(GL_TEXTURE_2D);
		glShadeModel(GL_FLAT);

		size_t nbToRender = 0;
		for (size_t i = 0; i < group.getNbParticles(); ++i)
		{
			const Particle& particle = group.getParticle(i);

			if ((!hasGroundCulling())||(particle.position().z >= 0.0f)||(particle.position().z + particle.velocity().z * length >= 0.0f))
			{
				float x = particle.position().x;
				float y = particle.position().y;
				float z = particle.position().z;
				float dx = particle.velocity().x;
				float dy = particle.velocity().y;
				float dz = particle.velocity().z;

				*(gpuIterator++) = x;
				*(gpuIterator++) = y - z * getZFactor();

				gpuIterator += 4; // skips the first vertex color data as GL_FLAT was forced

				*(gpuIterator++) = x + dx * length;
				*(gpuIterator++) = y + dy * length - (z + dz * length) * getZFactor();

				*(gpuIterator++) = particle.getR();
				*(gpuIterator++) = particle.getG();
				*(gpuIterator++) = particle.getB();
				*(gpuIterator++) = particle.getParamCurrentValue(PARAM_ALPHA);

				++nbToRender;
			}
		}

		glEnableClientState(GL_VERTEX_ARRAY);
		glEnableClientState(GL_COLOR_ARRAY);

		// interleaves vertex and color data
		glVertexPointer(2,GL_FLOAT,6 * sizeof(float),gpuBuffer);
		glColorPointer(4,GL_FLOAT,6 * sizeof(float),gpuBuffer + 2);

		glDrawArrays(GL_LINES,0,nbToRender << 1);

		glDisableClientState(GL_VERTEX_ARRAY);
		glDisableClientState(GL_COLOR_ARRAY);
	}
}}
