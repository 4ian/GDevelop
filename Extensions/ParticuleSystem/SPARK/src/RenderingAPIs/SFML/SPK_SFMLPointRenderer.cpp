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


#include "RenderingAPIs/SFML/SPK_SFMLPointRenderer.h"
#include "Core/SPK_Particle.h"
#include "Core/SPK_Group.h"
#include "Core/SPK_ArrayBuffer.h"

namespace SPK
{
namespace SFML
{
	const std::string SFMLPointRenderer::GPU_BUFFER_NAME("SPK_SFMLPointRenderer_GPU");

	float* SFMLPointRenderer::gpuBuffer = NULL;
	float* SFMLPointRenderer::gpuIterator = NULL;

	SFMLPointRenderer::SFMLPointRenderer(float size,ResizeMode mode) :
		SFMLRenderer(),
		PointRendererInterface(POINT_SQUARE,size),
		GL::GLExtHandler(),
		resizeMode(mode),
		image(NULL)
	{}

	bool SFMLPointRenderer::setType(PointType type)
	{
		if ((type == POINT_SPRITE)&&(!loadGLExtPointSprite()))
			return false;

		this->type = type;
		return true;
	}

	bool SFMLPointRenderer::checkBuffers(const Group& group)
	{
		FloatBuffer* fBuffer;
		if ((fBuffer = dynamic_cast<FloatBuffer*>(group.getBuffer(GPU_BUFFER_NAME))) == NULL)
			return false;

		gpuIterator = gpuBuffer = fBuffer->getData();
		return true;
	}

	void SFMLPointRenderer::createBuffers(const Group& group)
	{	
		FloatBuffer* fBuffer = dynamic_cast<FloatBuffer*>(group.createBuffer(GPU_BUFFER_NAME,FloatBufferCreator(6),0,false));
		gpuIterator = gpuBuffer = fBuffer->getData();
	}

	void SFMLPointRenderer::destroyBuffers(const Group& group)
	{
		group.destroyBuffer(GPU_BUFFER_NAME);
	}

	void SFMLPointRenderer::innerRender(const Group& group)
	{
		if (loadGLExtPointParameter())
			enablePointParameterGLExt(size * getViewZoom(resizeMode),false);
		else
			glPointSize(size * getViewZoom(resizeMode));

		switch(type)
		{
		case POINT_SQUARE :
			glDisable(GL_TEXTURE_2D);
			glDisable(GL_POINT_SMOOTH);
			if (getPointSpriteGLExt() == SUPPORTED)
				disablePointSpriteGLExt();
			break;

		case POINT_SPRITE :
			if (image != NULL)
				image->Bind();
			glTexEnvf(GL_POINT_SPRITE,GL_COORD_REPLACE,GL_TRUE);
			enablePointSpriteGLExt();
			break;

		case POINT_CIRCLE :
			glDisable(GL_TEXTURE_2D);
			glEnable(GL_POINT_SMOOTH);
			if (getPointSpriteGLExt() == SUPPORTED)
				disablePointSpriteGLExt();
			break;
		}

		size_t nbToRender = 0;
		for (size_t i = 0; i < group.getNbParticles(); ++i)
		{
			const Particle& particle = group.getParticle(i);

			if ((!hasGroundCulling())||(particle.position().z >= 0.0f))
			{
				*(gpuIterator++) = particle.position().x;
				*(gpuIterator++) = particle.position().y - particle.position().z * getZFactor();

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

		glDrawArrays(GL_POINTS,0,nbToRender);

		glDisableClientState(GL_VERTEX_ARRAY);
		glDisableClientState(GL_COLOR_ARRAY);
	}
}}
